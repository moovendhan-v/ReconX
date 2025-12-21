import { type User } from '../../db/schema';
import { DatabaseService } from '../database/database.service';
export declare class UsersService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(email: string, password: string, name?: string): Promise<User>;
}
