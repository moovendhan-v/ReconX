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
const util_1 = require("util");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../database/database.service");
const poc_service_1 = require("./poc.service");
const schema_1 = require("../../db/schema");
const poc_dto_1 = require("./dto/poc.dto");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ExecutionService = class ExecutionService {
    constructor(databaseService, pocService) {
        this.databaseService = databaseService;
        this.pocService = pocService;
    }
    async executePOC(pocId, input) {
        const db = this.databaseService.getDb();
        const poc = await this.pocService.findOne(pocId);
        const scriptPath = poc.scriptPath;
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
            console.log(`[POC Execution] Script: ${scriptPath}`);
            console.log(`[POC Execution] Command: ${fullCommand}`);
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
            await db
                .update(schema_1.executionLogs)
                .set({
                output,
                status: success ? poc_dto_1.ExecutionStatus.SUCCESS : poc_dto_1.ExecutionStatus.FAILED,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.executionLogs.id, executionLog.id));
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
                    status: success ? poc_dto_1.ExecutionStatus.SUCCESS : poc_dto_1.ExecutionStatus.FAILED,
                    executedAt: executionLog.executedAt,
                },
            };
        }
        catch (error) {
            const errorMessage = error.message || 'Unknown execution error';
            const isTimeout = error.signal === 'SIGTERM' || errorMessage.includes('timeout');
            const status = isTimeout ? poc_dto_1.ExecutionStatus.TIMEOUT : poc_dto_1.ExecutionStatus.FAILED;
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
        poc_service_1.PocService])
], ExecutionService);
//# sourceMappingURL=execution.service.js.map