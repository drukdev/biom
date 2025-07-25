export enum CommonConstants {
  NATS_CLIENT = 'NATS_CLIENT',
  // Error and Success Responses from POST and GET calls
  RESP_ERR_HTTP_INVALID_HEADER_VALUE = 'ERR_HTTP_INVALID_HEADER_VALUE',
  RESP_ERR_401 = 401,
  RESP_ERR_NOT_FOUND = 404,
  RESP_BAD_REQUEST = 400,
  RESP_ERR_UNPROCESSABLE_ENTITY = 422,
  RESP_ERR_500 = 500,
  UNAUTH_MSG = 'UNAUTHORISED ACCESS',
  DATA_ALREADY_PRESENT = 'RECORD ALREADY EXIST',
  RESP_CONFLICT = 409,
  RESP_FAILURE_NOT_MATCHED = 'Data does not match',
  SERVER_ERROR = 'Error from biometric comparision',
  BAD_REQUEST = 'Bad Request',
  UPDATE_METADATA_ERROR = 'Error in update person metadata',

  // SUCCESS MESSAGE
  RESP_SUCCESS_200 = 200,
  RESP_SUCCESS_201 = 201,
  RESP_SUCCESS_204 = 204,
  RESP_SUCCESS_MSG = 'success',

  millisecondToSecond = 1000,
  minusTokenExpiryTimeInSeconds = 300,
  NDI_ACCESS_TOKEN_KEY = 'NDI_ACCESS_TOKEN_KEY',
  HEADER_TYPE = 'application/x-www-form-urlencoded',
  DCRC_ACCESS_TOKEN_KEY = 'DCRC_ACCESS_TOKEN_KEY',
}

export enum HeaderConstants {
  HEADER_TYPE = 'application/x-www-form-urlencoded'
}

export enum ServiceConstants {
  NATS_ENDPOINT = 'biometricService',
  BM_VALIDATE_USER = 'validateUser',
  GET_BREADCRUMB = 'GET-BREADCRUMB',
  BM_UPDATE_PERSON_METADATA= 'updatePersonMetadata',
  BM_FETCH_DEVICE_ID= 'fetchDeviceId'
}

export enum NATSReconnects {
  maxReconnectAttempts = (10 * 60) / 5, // 110 minutes with a reconnection attempt every 5 seconds
  reconnectTimeWait = 5000 // 5 second delay between reconnection attempts
}

export enum AWS_S3_DIRECTORY {
  Image = 'image',
  Citizenship = 'citizenship',
  WorkPermit = 'work-permit',
  Passport = 'passport'
}

export enum AWS_S3_ERROR {
  NO_SUCH_KEY = 'NoSuchKey'
}

export const allowedHTTPMethods = ['GET', 'POST'];
