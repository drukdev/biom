import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PersonDTO } from 'src/comparisionService/dto/person';
import { lastValueFrom } from 'rxjs';
import { CommonConstants } from './constants';

@Injectable()
export default class NATSClientService {
    constructor(@Inject(CommonConstants.NATS_CLIENT) private readonly natsClient: ClientProxy) {}
}