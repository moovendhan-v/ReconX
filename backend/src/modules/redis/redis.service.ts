import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.client.on('error', (err) => {
        console.warn('Redis Client Error:', err.message);
      });

      this.client.on('connect', () => {
        console.log('✓ Redis connected');
      });

      await this.client.connect();
    } catch (error) {
      console.warn('⚠ Redis is not available. Running without Redis caching.');
      console.warn('  To enable Redis, start a Redis server on localhost:6379');
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      console.log('✓ Redis disconnected');
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) return;
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    return (await this.client.exists(key)) === 1;
  }
}