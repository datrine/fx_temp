import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ResponseBodyDTO{
    @ApiProperty({description:"status code of response"})
    statusCode:number;
    @ApiPropertyOptional({description:"message of response"})
    message?:string
}