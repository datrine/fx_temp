import { UserAccount } from "src/entities/user_account.entity";

export type JWTPayload={
    id:number;
    email:string
}

export type SiginInUserResult={
    access_token:string
}&Omit<UserAccount,"password_hash">

export type UserRegisteredEventPayloadType={
    id:number;
    email:string
}