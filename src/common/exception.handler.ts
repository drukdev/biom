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
import { PrismaClient } from '@prisma/client';
const { PrismaClientKnownRequestError, PrismaClientValidationError } = PrismaClient;
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
      case PrismaClientKnownRequestError:
        switch (exception.code) {
          case 'P2002': // Unique constraint failed on the {constraint}
          case 'P2000': // The provided value for the column is too long for the column's type. Column: {column_name}
          case 'P2001': // The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist
          case 'P2005': // The value {field_value} stored in the database for the field {field_name} is invalid for the field's type
          case 'P2006': // The provided value {field_value} for {model_name} field {field_name} is not valid
          case 'P2010': // Raw query failed. Code: {code}. Message: {message}
          case 'P2011': // Null constraint violation on the {constraint}
          case 'P2017': // The records for relation {relation_name} between the {parent_name} and {child_name} models are not connected.
          case 'P2021': // The table {table} does not exist in the current database.
          case 'P2022': // The column {column} does not exist in the current database.
            httpStatus = HttpStatus.BAD_REQUEST;
            message = exception?.response?.message || exception?.message;
            break;
          case 'P2018': // The required connected records were not found. {details}
          case 'P2025': // An operation failed because it depends on one or more records that were required but not found. {cause}
          case 'P2015': // A related record could not be found. {details}
            httpStatus = HttpStatus.NOT_FOUND;
            message = exception?.message;
            break;
          default:
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception?.response?.message || exception?.message || 'Internal server error';
        }
        break;
      case PrismaClientValidationError:
        httpStatus = HttpStatus.BAD_REQUEST;
        message = exception?.message || exception?.response?.message;
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
    Logger.error('Exception Filter :', message, (exception as any).stack, `${request.method} ${request.url}`);

    const responseBody: ResponseType = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message
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
