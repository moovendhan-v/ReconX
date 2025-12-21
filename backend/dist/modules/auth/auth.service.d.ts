import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { AuthResponse } from './dto/auth.dto';
import type { User } from '../../db/schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(email: string, password: string): Promise<AuthResponse>;
    signup(email: string, password: string, name?: string): Promise<AuthResponse>;
    private generateToken;
}
