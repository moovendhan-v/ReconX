import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [AuthService, UsersService, AuthResolver, JwtStrategy],
    exports: [AuthService, UsersService],
})
export class AuthModule { }
