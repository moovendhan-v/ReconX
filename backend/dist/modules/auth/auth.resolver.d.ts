import { AuthService } from './auth.service';
import { SignupInput, LoginInput, AuthResponse, UserOutput } from './dto/auth.dto';
import type { User } from '../../db/schema';
export declare class AuthResolver {
    private authService;
    constructor(authService: AuthService);
    signup(input: SignupInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    me(user: User): Promise<UserOutput>;
}
