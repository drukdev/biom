import { ClsStore } from 'nestjs-cls';
import { NDILogger } from './logger.service';

export interface LoggerClsStore extends ClsStore {
  ndiLogger: NDILogger;
}
