import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  RpcExceptionFilter
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { ResponseType } from './response.interface';
import { RpcException } from '@nestjs/microservices';

@Catch()
export default class ExceptionHandler implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = exception.status; //HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '';
    switch (exception.constructor) {
      case HttpException:
        httpStatus = (exception as HttpException).getStatus();
        message = exception?.response?.message || exception?.message || 'Internal server error';
        break;
      case RpcException:
        httpStatus = exception?.code || exception?.error?.code || HttpStatus.BAD_REQUEST;
        message = exception?.message;
        break;
      default:
        httpStatus =
          exception.response?.status ||
          exception.response?.statusCode ||
          exception.code ||
          HttpStatus.INTERNAL_SERVER_ERROR;
        message =
          exception.response?.data?.message ||
          exception.response?.message ||
          exception?.message ||
          'Internal server error';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.error(`Exception Filter : ${message} ${(exception as any).stack} ${request.method} ${request.url}`);

    httpStatus = Object.values(HttpStatus).includes(httpStatus) ? httpStatus : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody : ResponseType = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message,
      error: exception
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

@Catch(RpcException)
export class CustomExceptionFilter implements RpcExceptionFilter<RpcException> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    //throw new RpcException({message:exception.getError(),code:HttpStatus.BAD_REQUEST});
    return throwError(() => new RpcException({ message: exception.getError(), code: HttpStatus.BAD_REQUEST }));
  }
}
