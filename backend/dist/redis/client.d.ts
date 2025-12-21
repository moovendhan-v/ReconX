import { RedisClientType } from 'redis';
declare class RedisClient {
    private static instance;
    private client;
    private isConnected;
    private constructor();
    static getInstance(): RedisClient;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): RedisClientType;
    set(key: string, value: string, expiryInSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    pushToQueue(queue: string, data: string): Promise<void>;
    popFromQueue(queue: string): Promise<string | null>;
}
export declare const redis: RedisClient;
export {};
