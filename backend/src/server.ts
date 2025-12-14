import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { redis } from './redis/client';
import cveRoutes from './routes/cve.routes';
import pocRoutes from './routes/poc.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Bug Hunting API is running' });
});

// Routes
app.use('/api/cves', cveRoutes);
app.use('/api/pocs', pocRoutes);

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await redis.connect();
    console.log('✓ Redis connected');

    app.listen(port, () => {
      console.log(`\n🚀 Bug Hunting API Server running on port ${port}`);
      console.log(`📍 Health check: http://localhost:${port}/health`);
      console.log(`📍 API base URL: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await redis.disconnect();
  process.exit(0);
});

startServer();
