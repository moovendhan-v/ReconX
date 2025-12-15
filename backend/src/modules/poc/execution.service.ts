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
  ) {}

  async executePOC(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse> {
    const db = this.databaseService.getDb();

    // Verify POC exists
    const poc = await this.pocService.findOne(pocId);

    // Create initial execution log
    const [executionLog] = await db
      .insert(executionLogs)
      .values({
        pocId,
        targetUrl: input.targetUrl,
        command: input.command,
        status: ExecutionStatus.RUNNING,
      })
      .returning();

    try {
      // Validate and sanitize command
      const sanitizedCommand = this.sanitizeCommand(input.command, input.targetUrl);
      
      // Execute with timeout (30 seconds)
      const { stdout, stderr } = await execAsync(sanitizedCommand, {
        timeout: 30000,
        cwd: process.cwd(),
        env: {
          ...process.env,
          TARGET_URL: input.targetUrl,
          POC_ID: pocId,
        },
      });

      const output = stdout || stderr || 'No output';
      const success = !stderr;

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
        },
        log: {
          id: executionLog.id,
          pocId,
          targetUrl: input.targetUrl,
          command: input.command,
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
        },
        log: {
          id: executionLog.id,
          pocId,
          targetUrl: input.targetUrl,
          command: input.command,
          output: errorMessage,
          status,
          executedAt: executionLog.executedAt,
        },
      };
    }
  }

  private sanitizeCommand(command: string, targetUrl: string): string {
    // Basic command sanitization
    // Remove dangerous characters and commands
    const dangerousPatterns = [
      /rm\s+-rf/gi,
      /sudo/gi,
      /su\s+/gi,
      /passwd/gi,
      /shutdown/gi,
      /reboot/gi,
      /halt/gi,
      /init\s+0/gi,
      /init\s+6/gi,
      />/gi, // Redirect output
      /</gi, // Redirect input
      /\|/gi, // Pipe
      /;/gi, // Command separator
      /&&/gi, // AND operator
      /\|\|/gi, // OR operator
      /`/gi, // Command substitution
      /\$\(/gi, // Command substitution
    ];

    let sanitized = command;

    // Check for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        throw new BadRequestException(`Command contains dangerous pattern: ${pattern.source}`);
      }
    }

    // Replace placeholder with actual target URL
    sanitized = sanitized.replace(/\$TARGET_URL/g, targetUrl);
    sanitized = sanitized.replace(/\{TARGET_URL\}/g, targetUrl);

    // Ensure command starts with allowed executables
    const allowedExecutables = ['python', 'python3', 'node', 'bash', 'sh', 'curl', 'wget'];
    const firstWord = sanitized.trim().split(' ')[0];
    
    if (!allowedExecutables.includes(firstWord)) {
      throw new BadRequestException(`Executable '${firstWord}' is not allowed`);
    }

    return sanitized;
  }
}