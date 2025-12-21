"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../database/database.service");
const poc_service_1 = require("./poc.service");
const schema_1 = require("../../db/schema");
const poc_dto_1 = require("./dto/poc.dto");
const execution_logs_gateway_1 = require("./execution-logs.gateway");
const uuid_1 = require("uuid");
let ExecutionService = class ExecutionService {
    constructor(databaseService, pocService, executionLogsGateway) {
        this.databaseService = databaseService;
        this.pocService = pocService;
        this.executionLogsGateway = executionLogsGateway;
    }
    stripAnsiCodes(text) {
        return text.replace(/\x1b\[[0-9;]*m/g, '');
    }
    async executePOC(pocId, input) {
        const db = this.databaseService.getDb();
        const poc = await this.pocService.findOne(pocId);
        console.log("poc::", poc);
        let scriptPath = poc.scriptPath;
        console.log("Resolved script path:", scriptPath);
        const executionId = (0, uuid_1.v4)();
        const fullCommand = `python3 ${scriptPath} -t ${input.targetUrl} -c "${input.command}"`;
        const [executionLog] = await db
            .insert(schema_1.executionLogs)
            .values({
            pocId,
            targetUrl: input.targetUrl,
            command: fullCommand,
            status: poc_dto_1.ExecutionStatus.RUNNING,
        })
            .returning();
        try {
            console.log(`[POC Execution] Execution ID: ${executionId}`);
            console.log(`[POC Execution] Script: ${scriptPath}`);
            console.log(`[POC Execution] Command: ${fullCommand}`);
            const pythonProcess = (0, child_process_1.spawn)('python3', [
                scriptPath,
                '-t', input.targetUrl,
                '-c', input.command
            ], {
                cwd: process.cwd(),
                env: process.env,
            });
            let stdout = '';
            let stderr = '';
            pythonProcess.stdout.on('data', (data) => {
                const output = this.stripAnsiCodes(data.toString());
                stdout += output;
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
            pythonProcess.stderr.on('data', (data) => {
                const output = this.stripAnsiCodes(data.toString());
                stderr += output;
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
            const exitCode = await new Promise((resolve, reject) => {
                pythonProcess.on('close', (code) => {
                    resolve(code || 0);
                });
                pythonProcess.on('error', (error) => {
                    reject(error);
                });
                setTimeout(() => {
                    pythonProcess.kill();
                    reject(new Error('Execution timeout'));
                }, 30000);
            });
            const success = exitCode === 0 && !stderr;
            this.executionLogsGateway.server.emit('execution-log', {
                executionId,
                type: 'COMPLETE',
                message: `Execution finished with code ${exitCode}`,
                timestamp: Date.now(),
            });
            await db
                .update(schema_1.executionLogs)
                .set({
                output: stdout || stderr || 'No output',
                status: success ? poc_dto_1.ExecutionStatus.SUCCESS : poc_dto_1.ExecutionStatus.FAILED,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.executionLogs.id, executionLog.id));
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
                    status: success ? poc_dto_1.ExecutionStatus.SUCCESS : poc_dto_1.ExecutionStatus.FAILED,
                    executedAt: executionLog.executedAt,
                },
            };
        }
        catch (error) {
            const errorMessage = error.message || 'Unknown execution error';
            const isTimeout = errorMessage.includes('timeout');
            const status = isTimeout ? poc_dto_1.ExecutionStatus.TIMEOUT : poc_dto_1.ExecutionStatus.FAILED;
            console.error(`[POC Execution] Error: ${errorMessage}`);
            this.executionLogsGateway.server.emit('execution-log', {
                executionId,
                type: 'ERROR',
                message: errorMessage,
                timestamp: Date.now(),
            });
            await db
                .update(schema_1.executionLogs)
                .set({
                output: errorMessage,
                status,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.executionLogs.id, executionLog.id));
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
};
exports.ExecutionService = ExecutionService;
exports.ExecutionService = ExecutionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        poc_service_1.PocService,
        execution_logs_gateway_1.ExecutionLogsGateway])
], ExecutionService);
//# sourceMappingURL=execution.service.js.map