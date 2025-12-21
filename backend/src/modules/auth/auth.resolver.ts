import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupInput, LoginInput, AuthResponse, UserOutput } from './dto/auth.dto';
import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { User } from '../../db/schema';

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => AuthResponse)
    async signup(@Args('input') input: SignupInput): Promise<AuthResponse> {
        return this.authService.signup(input.email, input.password, input.name);
    }

    @Mutation(() => AuthResponse)
    async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
        return this.authService.login(input.email, input.password);
    }

    @Query(() => UserOutput)
    @UseGuards(GqlAuthGuard)
    async me(@CurrentUser() user: User): Promise<UserOutput> {
        return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            createdAt: user.createdAt,
        };
    }
}
