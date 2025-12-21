import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Project {
    @Field()
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;

    @Field()
    status: string;

    @Field(() => GraphQLJSON, { nullable: true })
    metadata?: any;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@InputType()
export class CreateProjectInput {
    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    metadata?: any;
}

@InputType()
export class UpdateProjectInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    status?: string;

    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    metadata?: any;
}

@InputType()
export class ProjectFiltersInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    status?: string;

    @Field(() => Int, { nullable: true, defaultValue: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    offset?: number;
}

@ObjectType()
export class ProjectListResponse {
    @Field(() => [Project])
    projects: Project[];

    @Field(() => Int)
    total: number;
}
