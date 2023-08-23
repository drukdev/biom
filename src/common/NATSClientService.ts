import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CommonConstants } from './constants';

@Injectable()
export default class NATSClientService {
  constructor(@Inject(CommonConstants.NATS_CLIENT) private readonly natsClient: ClientProxy) {}
}
