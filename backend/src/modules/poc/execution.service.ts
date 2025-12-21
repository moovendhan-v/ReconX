import { Injectable, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { PocService } from './poc.service';
import { executionLogs } from '../../db/schema';
import { ExecutePOCInput, ExecuteResponse, ExecutionStatus } from './dto/poc.dto';
import { ExecutionLogsGateway } from './execution-logs.gateway';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExecutionService {
  private readonly pythonCoreUrl: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pocService: PocService,
    private readonly executionLogsGateway: ExecutionLogsGateway,
  ) {
    this.pythonCoreUrl = process.env.PYTHON_CORE_URL || 'http://python-core:8000';
  }

  async executePOC(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse> {
    const db = this.databaseService.getDb();

    // Verify POC exists and get script path
    const poc = await this.pocService.findOne(pocId);
    const scriptPath = poc.scriptPath;

    // Generate unique execution ID
    const executionId = uuidv4();

    // Full command for display purposes
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
      console.log(`[POC Execution] Execution ID: ${executionId}`);
      console.log(`[POC Execution] Script: ${scriptPath}`);
      console.log(`[POC Execution] Calling python-core: ${this.pythonCoreUrl}/execute`);

      // Call python-core API
      const response = await axios.post(
        `${this.pythonCoreUrl}/execute`,
        {
          scriptPath,
          targetUrl: input.targetUrl,
          command: input.command,
          executionId,
        },
        {
          timeout: 35000, // 35 seconds
        }
      );

      const result = response.data;
      const success = result.success && (!result.error || result.error.trim() === '');

      // Update execution log with results
      await db
        .update(executionLogs)
        .set({
          output: result.output || '',
          status: success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
        })
        .where(eq(executionLogs.id, executionLog.id));

      return {
        message: success ? 'POC executed successfully' : 'POC execution completed with errors',
        result: {
          success,
          output: result.output || '',
          error: result.error || undefined,
          executedScriptPath: scriptPath,
        },
        log: {
          id: executionLog.id,
          pocId,
          targetUrl: input.targetUrl,
          command: fullCommand,
          output: result.output || '',
          status: success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
          executedAt: executionLog.executedAt,
        },
      };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown execution error';
      const isTimeout = error.code === 'ECONNABORTED' || errorMessage.includes('timeout');
      const status = isTimeout ? ExecutionStatus.TIMEOUT : ExecutionStatus.FAILED;

      console.error(`[POC Execution] Error: ${errorMessage}`);

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