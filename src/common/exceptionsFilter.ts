/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export default class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '';
    switch (exception.constructor) {
      case HttpException:
        httpStatus = (exception as HttpException).getStatus();
        message = exception?.message || 'Internal server error';
        break;
      default:
        httpStatus = exception.response?.status || exception.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        message =
          exception.response?.data?.message ||
          exception.response?.message ||
          exception?.message ||
          'Internal server error';
    }

    Logger.error('Exception Filter :', message, (exception as any).stack, `${request.method} ${request.url}`);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
