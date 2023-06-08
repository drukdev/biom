/* eslint-disable camelcase */
export class AuthTokenRequest {
  client_id: string;
  client_secret: string;
  audience?: string;
  grant_type?: string = 'client_credentials';
  scope?: string;
}
