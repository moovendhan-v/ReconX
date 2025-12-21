import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class ActivityLog {
    @Field()
    id: string;

    @Field()
    action: string;

    @Field()
    entity: string;

    @Field({ nullable: true })
    entityId?: string;

    @Field(() => GraphQLJSON, { nullable: true })
    details?: any;

    @Field({ nullable: true })
    performedBy?: string;

    @Field()
    createdAt: Date;
}

@InputType()
export class CreateActivityLogInput {
    @Field()
    @IsString()
    action: string;

    @Field()
    @IsString()
    entity: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    entityId?: string;

    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    details?: any;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    performedBy?: string;
}

@InputType()
export class ActivityFiltersInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    entity?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    action?: string;

    @Field(() => Int, { nullable: true, defaultValue: 50 })
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
export class ActivityListResponse {
    @Field(() => [ActivityLog])
    activities: ActivityLog[];

    @Field(() => Int)
    total: number;
}
