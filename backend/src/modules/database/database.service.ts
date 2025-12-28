import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres = require('postgres');
import * as schema from '../../db/schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: postgres.Sql;
  public db: ReturnType<typeof drizzle>;

  constructor() {
    // Initialize database connection synchronously so it's available when getDb() is called
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bughunting';

    this.client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    this.db = drizzle(this.client, { schema });
  }

  async onModuleInit() {
    // Verify connection
    try {
      await this.client`SELECT 1`;
      console.log('✓ Database connected');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.end();
      console.log('✓ Database disconnected');
    }
  }

  getDb() {
    return this.db;
  }
}