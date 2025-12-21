import { CustomScalar } from '@nestjs/graphql';
import { ValueNode } from 'graphql';
export declare class DateTimeScalar implements CustomScalar<string, Date> {
    description: string;
    parseValue(value: unknown): Date;
    serialize(value: unknown): string;
    parseLiteral(ast: ValueNode): Date;
}
