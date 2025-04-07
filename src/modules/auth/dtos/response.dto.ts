import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ResponseBodyDTO } from "../../../utils/classes";
import { UserRole } from "../../../entities/user_account.entity";

export class UserDTO {
    @ApiProperty({ description: "account id of new user" })
    id: number

    @ApiProperty({ description: "email of new user" })
    email: string
   
    @ApiPropertyOptional({ description: "first name of new user" })
    first_name?: string
    
    @ApiPropertyOptional({ description: "last name of new user" })
    last_name?: string

   
    @ApiProperty({ description: "whether email is verified of not" })
    is_email_verified: boolean

    @ApiPropertyOptional({enum:UserRole, description: "role of new user" })
    role?: UserRole
}

export class SignedInUserDTO extends UserDTO{
    access_token:string
}


export class RegisterCreatedResponseBodyDTO extends ResponseBodyDTO {
    data: UserDTO
}


export class VerifyEmailOKResponseBodyDTO extends ResponseBodyDTO {
    data: UserDTO
}


export class SigninOkResponseBodyDTO extends ResponseBodyDTO {
    data: SignedInUserDTO
}
