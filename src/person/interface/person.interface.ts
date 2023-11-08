import { IdTypes } from '../../common/IdTypes';

export interface BiometricReq {
  idNumber: string;
  idType: IdTypes;
  image: string;
}
