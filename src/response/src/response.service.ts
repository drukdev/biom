import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService
{
    statusCode: number;
    message: string;
    data?:any;
    error?: any;

    public response (message: string, statusCode?: number, data?: any, error?: any): ResponseService
    {
        const response: ResponseService = new ResponseService();
        response.message = message;
        response.data = data;
        response.statusCode = statusCode || 500;
        response.error = error;
        return response;
    }
}
