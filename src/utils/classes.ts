import { HttpStatus } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ResponseBodyDTO{
    @ApiProperty({description:"status code of response",default:HttpStatus.OK})
    statusCode:number;
    @ApiPropertyOptional({description:"message of response"})
    message?:string
}