import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService
{

    message: string;
    data: any;
    success: boolean;
    code: number;

    public response (message: string, success: boolean, data?: any, code?: number): ResponseService
    {
        const response: ResponseService = new ResponseService();
        response.message = message;
        response.data = data;
        response.success = success;
        response.code = code || 500;
        return response;
    }
}
