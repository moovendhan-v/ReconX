import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bughunting';

// Create postgres client
const client = postgres(connectionString, { max: 10 });

// Create drizzle instance
export const db = drizzle(client, { schema });

export { schema };
