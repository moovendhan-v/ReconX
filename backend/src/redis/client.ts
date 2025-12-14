import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('✓ Redis connected successfully');
      this.isConnected = true;
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  // Cache helpers
  public async set(key: string, value: string, expiryInSeconds?: number): Promise<void> {
    if (expiryInSeconds) {
      await this.client.setEx(key, expiryInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  // Queue helpers
  public async pushToQueue(queue: string, data: string): Promise<void> {
    await this.client.rPush(queue, data);
  }

  public async popFromQueue(queue: string): Promise<string | null> {
    return await this.client.lPop(queue);
  }
}

export const redis = RedisClient.getInstance();
