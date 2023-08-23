/* eslint-disable prettier/prettier */
import { Logger} from 'winston';

// import winston = require('winston');
import { LoggerService } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import winstonLogger from '../../lib/winstone.instance';
import { AsyncLocalStorage } from 'async_hooks';
import { LoggerClsStore } from './logger.store';

export class NDILogger implements LoggerService {
  logger: Logger;
  private  correlationId:string;
  private context:string;
  constructor(private serviceName:string) {
    this.logger = winstonLogger;
    this.setCorrelationId();
  }
  /**
   * Write a 'log' level log.
   */
  // @UseInterceptors(LoggerInterceptor)
  log(message: string):LoggerService {
    return this.logger.info(`[${this.correlationId}], [${this.context}] [${this.serviceName}] ${message}`);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: string):LoggerService {
    return this.logger.error(`[${this.correlationId}], [${this.context}] [${this.serviceName}] ${message}`);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: string):LoggerService {
    return this.logger.warn(`[${this.correlationId}], [${this.context}] [${this.serviceName}] ${message}`);
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: string):LoggerService {
   return this.logger.debug(`[${this.correlationId}], [${this.context}] [${this.serviceName}] ${message}`);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: string):LoggerService {
    return this.logger.verbose(`[${this.correlationId}], [${this.context}] [${this.serviceName}] ${message}`);
  }

  setCorrelationId(correlationId?:string):void {
    if (correlationId) {
      this.correlationId = correlationId;
      return;  
    }
    this.correlationId = uuid();
  }

  getCorrelationId():string {
    return this.correlationId;
  }

  setContext(context:string): NDILogger {
    this.context = context;
    return this;
  }

  getLoggerInstance(als: AsyncLocalStorage<LoggerClsStore>): NDILogger {
    const ndiLogger = als.getStore()?.ndiLogger;
    return ndiLogger ? ndiLogger : this;

  }

  setServiceName(name: string): void {
    this.serviceName = name;
  }
}
