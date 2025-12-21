import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { AuthResponse } from './dto/auth.dto';
import type { User } from '../../db/schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || undefined,
                createdAt: user.createdAt,
            },
        };
    }

    async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Create new user
        const user = await this.usersService.create(email, password, name);

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || undefined,
                createdAt: user.createdAt,
            },
        };
    }

    private generateToken(user: User): string {
        const payload = { sub: user.id, email: user.email };
        return this.jwtService.sign(payload);
    }
}
