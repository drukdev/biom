import { IdTypes } from 'src/common/IdTypes';

export interface BiometricReq {
  idNumber: string;
  idType: IdTypes;
  image?: string;
}
