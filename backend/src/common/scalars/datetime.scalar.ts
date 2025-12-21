import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
    description = 'Date custom scalar type';

    parseValue(value: unknown): Date {
        if (typeof value === 'string' || typeof value === 'number') {
            return new Date(value); // value from the client
        }
        throw new Error('Invalid date value');
    }

    serialize(value: unknown): string {
        if (value instanceof Date) {
            return value.toISOString(); // value sent to the client
        }
        if (typeof value === 'string') {
            return new Date(value).toISOString();
        }
        throw new Error('Invalid date value for serialization');
    }

    parseLiteral(ast: ValueNode): Date {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        throw new Error('Invalid date literal');
    }
}
