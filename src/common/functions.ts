import { Authenticator, nkeyAuthenticator } from 'nats';
import { NATSReconnects } from './constants';

export const pagination = (
  pageSize: number,
  page: number
): {
  skip?: number;
  take?: number;
} => {
  const query: {
    skip?: number;
    take?: number;
  } = {};
  if (pageSize && (page || 0 === page)) {
    query.skip = page * pageSize;
    query.take = pageSize;
  } else {
    query.skip = 0;
    query.take = 1000;
  }
  return query;
};

export const isNum = (val: string): boolean => /\d/.test(val);

export const isJson = (str): boolean => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
};

export const getNatsOptions = (): {
  servers: string[];
  authenticator: Authenticator;
  maxReconnectAttempts: NATSReconnects;
  reconnectTimeWait: NATSReconnects;
} => ({
    servers: `${process.env.NATS_URL}`.split(','),
    authenticator: nkeyAuthenticator(new TextEncoder().encode(process.env.NKEY_SEED)),
    maxReconnectAttempts: NATSReconnects.maxReconnectAttempts,
    reconnectTimeWait: NATSReconnects.reconnectTimeWait
  });
