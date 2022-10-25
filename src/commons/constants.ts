export enum CommonConstants {
  NATS_CLIENT = 'NATS_CLIENT',
  // Error and Success Responses from POST and GET calls
  RESP_ERR_HTTP_INVALID_HEADER_VALUE = 'ERR_HTTP_INVALID_HEADER_VALUE',
  RESP_ERR_401 = 401,     // equivalent to 401 (error) returned from HTTP call
  RESP_ERR_NOT_FOUND = 404, //equivalent to 404 (error) returned from HTTP call
  RESP_BAD_REQUEST = 400, //equivalent to 404 (error) returned from HTTP call
  RESP_ERR_UNPROCESSABLE_ENTITY = 422, // unprocessable entity
  RESP_ERR_500 = 500,
  UNAUTH_MSG = 'UNAUTHORISED ACCESS',
  DATA_ALREADY_PRESENT = 'RECORD ALREADY EXIST',
  RESP_CONFLICT = 409,
  RESP_FAILURE_NOT_MATCHED = 'Data does not match',
  SERVER_ERROR = 'Data does not match',

  // SUCCESS MESSAGE
  RESP_SUCCESS_200 = 200, // equivalent to 200 (success) returned from HTTP call
  RESP_SUCCESS_201 = 201, // equivalent to 201 (updated) returned from HTTP call
  RESP_SUCCESS_204 = 204, // equivalent to 204 (updated) returned from HTTP call
  RESP_SUCCESS_MSG = 'success'
  
}
