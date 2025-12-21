import { Injectable, BadRequestException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { PocService } from './poc.service';
import { executionLogs } from '../../db/schema';
import { ExecutePOCInput, ExecuteResponse, ExecutionStatus } from './dto/poc.dto';

const execAsync = promisify(exec);

@Injectable()
export class ExecutionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pocService: PocService,
  ) { }

  async executePOC(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse> {
    const db = this.databaseService.getDb();

    // Verify POC exists and get script path
    const poc = await this.pocService.findOne(pocId);
    const scriptPath = poc.scriptPath;

    // Build the full command: python3 <script_path> -t <target_url> -c "<command>"
    const fullCommand = `python3 ${scriptPath} -t ${input.targetUrl} -c "${input.command}"`;

    // Create initial execution log
    const [executionLog] = await db
      .insert(executionLogs)
      .values({
        pocId,
        targetUrl: input.targetUrl,
        command: fullCommand,
        status: ExecutionStatus.RUNNING,
      })
      .returning();

    try {
      console.log(`[POC Execution] Script: ${scriptPath}`);
      console.log(`[POC Execution] Command: ${fullCommand}`);

      // Execute with timeout (30 seconds)
      const { stdout, stderr } = await execAsync(fullCommand, {
        timeout: 30000,
        cwd: process.cwd(),
        env: {
          ...process.env,
          TARGET_URL: input.targetUrl,
          POC_ID: pocId,
        },
      });

      const output = stdout || stderr || 'No output';
      const success = !stderr || stderr.trim() === '';

      // Update execution log with results
      await db
        .update(executionLogs)
        .set({
          output,
          status: success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
        })
        .where(eq(executionLogs.id, executionLog.id));

      return {
        message: success ? 'POC executed successfully' : 'POC execution completed with errors',
        result: {
          success,
          output,
          error: stderr || undefined,
          executedScriptPath: scriptPath,
        },
        log: {
          id: executionLog.id,
          pocId,
          targetUrl: input.targetUrl,
          command: fullCommand,
          output,
          status: success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
          executedAt: executionLog.executedAt,
        },
      };
    } catch (error) {
      const errorMessage = error.message || 'Unknown execution error';
      const isTimeout = error.signal === 'SIGTERM' || errorMessage.includes('timeout');
      const status = isTimeout ? ExecutionStatus.TIMEOUT : ExecutionStatus.FAILED;

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