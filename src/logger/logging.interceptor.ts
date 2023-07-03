import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerClsStore } from './logger.store';
import { NDILogger } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    // inject the AsyncLocalStorage in the module constructor,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private configService: ConfigService
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const store = {
      ndiLogger: new NDILogger(this.configService.get('SERVICE_NAME') || '')
    };
    const rpcContect = context.switchToRpc().getContext();
    const headers = rpcContect.getHeaders();
    store.ndiLogger.setContext(JSON.parse(rpcContect.args[0]).endpoint);
    store.ndiLogger.setCorrelationId(headers._description);

    store.ndiLogger.log('In Interceptor configuration');
    this.als.enterWith(store);
    //const now = Date.now();
    return next.handle().pipe(
      catchError((err) => {
        store.ndiLogger.error(err);
        return throwError(() => err);
      })
    );
  }
}
