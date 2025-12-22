import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { PocService } from './poc.service';
import { executionLogs } from '../../db/schema';
import { ExecutePOCInput, ExecuteResponse, ExecutionStatus } from './dto/poc.dto';
import { ExecutionLogsGateway } from './execution-logs.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExecutionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pocService: PocService,
    private readonly executionLogsGateway: ExecutionLogsGateway,
  ) { }

  // Strip ANSI color codes from terminal output
  private stripAnsiCodes(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  async executePOC(pocId: string, input: ExecutePOCInput, userId: string): Promise<ExecuteResponse> {
    const db = this.databaseService.getDb();

    // Verify POC exists, user owns it, and get script path
    const poc = await this.pocService.findOne(pocId, userId);
    console.log("poc::", poc);

    // Script path from DB can be:
    // 1. Absolute: /app/python-core/exploits/...
    // 2. Relative to python-core: python-core/exploits/...
    // 3. Old format: /app/exploits/...
    let scriptPath = poc.scriptPath;

    console.log("Resolved script path:", scriptPath);

    // Generate unique execution ID
    const executionId = uuidv4();

    // Full command for display purposes
    const fullCommand = `python3 ${scriptPath} -t ${input.targetUrl} -c "${input.command}"`;

    // Create initial execution log
    const [executionLog] = await db
      .insert(executionLogs)
      .values({
        pocId,
        userId, // Add userId for user isolation
        targetUrl: input.targetUrl,
        command: fullCommand,
        status: ExecutionStatus.RUNNING,
      })
      .returning();

    try {
      console.log(`[POC Execution] Execution ID: ${executionId}`);
      console.log(`[POC Execution] Script: ${scriptPath}`);
      console.log(`[POC Execution] Command: ${fullCommand}`);

      // Execute Python script directly
      const pythonProcess = spawn('python3', [
        scriptPath,
        '-t', input.targetUrl,
        '-c', input.command
      ], {
        cwd: process.cwd(),
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      // Handle stdout - stream to WebSocket
      pythonProcess.stdout.on('data', (data) => {
        const output = this.stripAnsiCodes(data.toString());
        stdout += output;

        // Stream to WebSocket clients
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          this.executionLogsGateway.server.emit('execution-log', {
            executionId,
            type: 'STDOUT',
            message: line,
            timestamp: Date.now(),
          });
        });
      });

      // Handle stderr
      pythonProcess.stderr.on('data', (data) => {
        const output = this.stripAnsiCodes(data.toString());
        stderr += output;

        // Stream to WebSocket clients
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          this.executionLogsGateway.server.emit('execution-log', {
            executionId,
            type: 'STDERR',
            message: line,
            timestamp: Date.now(),
          });
        });
      });

      // Wait for process to complete
      const exitCode = await new Promise<number>((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          resolve(code || 0);
        });

        pythonProcess.on('error', (error) => {
          reject(error);
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          pythonProcess.kill();
          reject(new Error('Execution timeout'));
        }, 30000);
      });

      const success = exitCode === 0 && !stderr;

      // Send completion event
      this.executionLogsGateway.server.emit('execution-log', {
        executionId,
        type: 'COMPLETE',
        message: `Execution finished with code ${exitCode}`,
        timestamp: Date.now(),
      });

      // Update execution log with results
      await db
        .update(executionLogs)
        .set({
          output: stdout || stderr || 'No output',
          status: success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
        })
        .where(eq(executionLogs.id, executionLog.id));

      return {
        message: success ? 'POC executed successfully' : 'POC execution completed with errors',
        result: {
          success,
          output: stdout || '',
          error: stderr || undefined,
          executedScriptPath: scriptPath,
        },
        log: {
          id: executionLog.id,
          pocId,
          targetUrl: input.targetUrl,
          command: fullCommand,
          output: stdout || stderr || 'No output',
          status: success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
          executedAt: executionLog.executedAt,
        },
      };
    } catch (error) {
      const errorMessage = error.message || 'Unknown execution error';
      const isTimeout = errorMessage.includes('timeout');
      const status = isTimeout ? ExecutionStatus.TIMEOUT : ExecutionStatus.FAILED;

      console.error(`[POC Execution] Error: ${errorMessage}`);

      // Send error event
      this.executionLogsGateway.server.emit('execution-log', {
        executionId,
        type: 'ERROR',
        message: errorMessage,
        timestamp: Date.now(),
      });

      // Update execution log with error
      await db
        .update(executionLogs)
        .set({
          output: errorMessage,
          status,
        })
        .where(eq(executionLogs.id, executionLog.id));

      return {
        message: 'POC execution failed',
        result: {
          success: false,
          output: '',
          error: errorMessage,
          executedScriptPath: scriptPath,
        },
        log: {
          id: executionLog.id,
          pocId,
          targetUrl: input.targetUrl,
          command: fullCommand,
          output: errorMessage,
          status,
          executedAt: executionLog.executedAt,
        },
      };
    }
  }
}