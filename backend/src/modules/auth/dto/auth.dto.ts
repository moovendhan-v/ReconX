import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class SignupInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    @MinLength(8)
    password: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    name?: string;
}

@InputType()
export class LoginInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    password: string;
}

@ObjectType()
export class UserOutput {
    @Field()
    id: string;

    @Field()
    email: string;

    @Field({ nullable: true })
    name?: string;

    @Field()
    createdAt: Date;
}

@ObjectType()
export class AuthResponse {
    @Field()
    token: string;

    @Field(() => UserOutput)
    user: UserOutput;
}
