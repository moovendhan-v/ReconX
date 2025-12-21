export declare class SignupInput {
    email: string;
    password: string;
    name?: string;
}
export declare class LoginInput {
    email: string;
    password: string;
}
export declare class UserOutput {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
}
export declare class AuthResponse {
    token: string;
    user: UserOutput;
}
