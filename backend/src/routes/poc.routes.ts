import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { redis } from '../redis/client';
import axios from 'axios';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.py', '.sh', '.rb', '.js', '.go'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only script files allowed.'));
    }
  }
});

// Get all POCs or POCs for specific CVE
router.get('/', async (req: Request, res: Response) => {
  try {
    const cveId = req.query.cveId as string;

    let pocs;
    if (cveId) {
      pocs = await db.query.pocs.findMany({
        where: eq(schema.pocs.cveId, cveId),
        with: {
          cve: true,
        },
      });
    } else {
      pocs = await db.query.pocs.findMany({
        with: {
          cve: true,
        },
      });
    }

    res.json(pocs);
  } catch (error) {
    console.error('Error fetching POCs:', error);
    res.status(500).json({ error: 'Failed to fetch POCs' });
  }
});

// Get single POC by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const poc = await db.query.pocs.findFirst({
      where: eq(schema.pocs.id, id),
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

    // Get script content
    try {
      const scriptContent = await fs.readFile(poc.scriptPath, 'utf-8');
      res.json({ ...poc, scriptContent });
    } catch (err) {
      res.json({ ...poc, scriptContent: null });
    }
  } catch (error) {
    console.error('Error fetching POC:', error);
    res.status(500).json({ error: 'Failed to fetch POC' });
  }
});

// Upload new POC
router.post('/', upload.single('script'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No script file uploaded' });
    }

    const { cveId, name, description, language, usageExamples, author } = req.body;

    const newPoc = await db.insert(schema.pocs).values({
      cveId,
      name,
      description,
      language,
      scriptPath: req.file.path,
      usageExamples,
      author,
    }).returning();

    res.status(201).json(newPoc[0]);
  } catch (error) {
    console.error('Error creating POC:', error);
    res.status(500).json({ error: 'Failed to create POC' });
  }
});

// Execute POC
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetUrl, command, additionalParams } = req.body;

    const poc = await db.query.pocs.findFirst({
      where: eq(schema.pocs.id, id),
    });

    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }

    // Queue execution job
    const jobData = {
      pocId: id,
      scriptPath: poc.scriptPath,
      language: poc.language,
      targetUrl,
      command,
      additionalParams,
    };

    await redis.pushToQueue('poc:execution', JSON.stringify(jobData));

    // Call Python core to execute
    const pythonCoreUrl = process.env.PYTHON_CORE_URL || 'http://localhost:8000';
    
    try {
      const executionResult = await axios.post(`${pythonCoreUrl}/execute`, {
        scriptPath: poc.scriptPath,
        targetUrl,
        command,
        additionalParams,
      }, { timeout: 30000 });

      // Log execution
      const log = await db.insert(schema.executionLogs).values({
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
    } catch (execError: any) {
      // Log failed execution
      await db.insert(schema.executionLogs).values({
        pocId: id,
        targetUrl,
        command,
        output: execError.message,
        status: 'FAILED',
      });

      throw execError;
    }
  } catch (error: any) {
    console.error('Error executing POC:', error);
    res.status(500).json({ 
      error: 'Failed to execute POC',
      details: error.message 
    });
  }
});

// Get execution logs for a POC
router.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await db.query.executionLogs.findMany({
      where: eq(schema.executionLogs.pocId, id),
      limit,
      orderBy: (logs, { desc }) => [desc(logs.executedAt)],
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Delete POC
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const poc = await db.query.pocs.findFirst({
      where: eq(schema.pocs.id, id),
    });

    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }

    // Delete file
    try {
      await fs.unlink(poc.scriptPath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    // Delete from database
    await db.delete(schema.pocs).where(eq(schema.pocs.id, id));

    res.json({ message: 'POC deleted successfully' });
  } catch (error) {
    console.error('Error deleting POC:', error);
    res.status(500).json({ error: 'Failed to delete POC' });
  }
});

export default router;
