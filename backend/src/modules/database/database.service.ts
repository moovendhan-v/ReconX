import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../db/schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: postgres.Sql;
  public db: ReturnType<typeof drizzle>;

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bughunting';
    
    this.client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    this.db = drizzle(this.client, { schema });
    
    console.log('✓ Database connected');
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