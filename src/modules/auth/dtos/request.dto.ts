import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"

export class RegisterRequestBodyDTO{
    @ApiProperty({description:"email of new user"})
    @IsEmail()
    email:string

    
    @ApiProperty({description:"password of new user"})
    @IsStrongPassword()
    password:string
}


export class VerifyEmailRequestBodyDTO{
    @ApiProperty({description:"email"})
    @IsEmail()
    email:string

    
    @ApiProperty({description:"token from email"})
    @IsNotEmpty()
    token:string
}