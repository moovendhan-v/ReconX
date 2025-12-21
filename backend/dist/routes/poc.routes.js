"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("multer");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const client_1 = require("../redis/client");
const axios_1 = require("axios");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        await promises_1.default.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.py', '.sh', '.rb', '.js', '.go'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only script files allowed.'));
        }
    }
});
router.get('/', async (req, res) => {
    try {
        const cveId = req.query.cveId;
        let pocs;
        if (cveId) {
            pocs = await db_1.db.query.pocs.findMany({
                where: (0, drizzle_orm_1.eq)(db_1.schema.pocs.cveId, cveId),
                with: {
                    cve: true,
                },
            });
        }
        else {
            pocs = await db_1.db.query.pocs.findMany({
                with: {
                    cve: true,
                },
            });
        }
        res.json(pocs);
    }
    catch (error) {
        console.error('Error fetching POCs:', error);
        res.status(500).json({ error: 'Failed to fetch POCs' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const poc = await db_1.db.query.pocs.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.pocs.id, id),
            with: {
                cve: true,
                executionLogs: {
                    limit: 10,
                    orderBy: (logs, { desc }) => [desc(logs.executedAt)],
                },
            },
        });
        if (!poc) {
            return res.status(404).json({ error: 'POC not found' });
        }
        try {
            const scriptContent = await promises_1.default.readFile(poc.scriptPath, 'utf-8');
            res.json({ ...poc, scriptContent });
        }
        catch (err) {
            res.json({ ...poc, scriptContent: null });
        }
    }
    catch (error) {
        console.error('Error fetching POC:', error);
        res.status(500).json({ error: 'Failed to fetch POC' });
    }
});
router.post('/', upload.single('script'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No script file uploaded' });
        }
        const { cveId, name, description, language, usageExamples, author } = req.body;
        const newPoc = await db_1.db.insert(db_1.schema.pocs).values({
            cveId,
            name,
            description,
            language,
            scriptPath: req.file.path,
            usageExamples,
            author,
        }).returning();
        res.status(201).json(newPoc[0]);
    }
    catch (error) {
        console.error('Error creating POC:', error);
        res.status(500).json({ error: 'Failed to create POC' });
    }
});
router.post('/:id/execute', async (req, res) => {
    try {
        const { id } = req.params;
        const { targetUrl, command, additionalParams } = req.body;
        const poc = await db_1.db.query.pocs.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.pocs.id, id),
        });
        if (!poc) {
            return res.status(404).json({ error: 'POC not found' });
        }
        const jobData = {
            pocId: id,
            scriptPath: poc.scriptPath,
            language: poc.language,
            targetUrl,
            command,
            additionalParams,
        };
        await client_1.redis.pushToQueue('poc:execution', JSON.stringify(jobData));
        const pythonCoreUrl = process.env.PYTHON_CORE_URL || 'http://localhost:8000';
        try {
            const executionResult = await axios_1.default.post(`${pythonCoreUrl}/execute`, {
                scriptPath: poc.scriptPath,
                targetUrl,
                command,
                additionalParams,
            }, { timeout: 30000 });
            const log = await db_1.db.insert(db_1.schema.executionLogs).values({
                pocId: id,
                targetUrl,
                command,
                output: executionResult.data.output,
                status: executionResult.data.success ? 'SUCCESS' : 'FAILED',
            }).returning();
            res.json({
                message: 'POC executed successfully',
                result: executionResult.data,
                log: log[0],
            });
        }
        catch (execError) {
            await db_1.db.insert(db_1.schema.executionLogs).values({
                pocId: id,
                targetUrl,
                command,
                output: execError.message,
                status: 'FAILED',
            });
            throw execError;
        }
    }
    catch (error) {
        console.error('Error executing POC:', error);
        res.status(500).json({
            error: 'Failed to execute POC',
            details: error.message
        });
    }
});
router.get('/:id/logs', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const logs = await db_1.db.query.executionLogs.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.schema.executionLogs.pocId, id),
            limit,
            orderBy: (logs, { desc }) => [desc(logs.executedAt)],
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const poc = await db_1.db.query.pocs.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.pocs.id, id),
        });
        if (!poc) {
            return res.status(404).json({ error: 'POC not found' });
        }
        try {
            await promises_1.default.unlink(poc.scriptPath);
        }
        catch (err) {
            console.error('Error deleting file:', err);
        }
        await db_1.db.delete(db_1.schema.pocs).where((0, drizzle_orm_1.eq)(db_1.schema.pocs.id, id));
        res.json({ message: 'POC deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting POC:', error);
        res.status(500).json({ error: 'Failed to delete POC' });
    }
});
exports.default = router;
//# sourceMappingURL=poc.routes.js.map