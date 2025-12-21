import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { users, type NewUser, type User } from '../../db/schema';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) { }

    async findByEmail(email: string): Promise<User | null> {
        const db = this.databaseService.getDb();
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result[0] || null;
    }

    async findById(id: string): Promise<User | null> {
        const db = this.databaseService.getDb();
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return result[0] || null;
    }

    async create(email: string, password: string, name?: string): Promise<User> {
        const db = this.databaseService.getDb();
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser: NewUser = {
            email,
            passwordHash,
            name,
        };

        const result = await db.insert(users).values(newUser).returning();

        return result[0];
    }
}
