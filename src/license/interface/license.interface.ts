export interface LicenseLimit {
  orgdid: string;
  usage: number;
  balance: number;
  threshold: number;
  reset_datetime: Date;
  orgadmin: string;
  lastupdated: Date;
}

export interface LicenseLog {
  id: number;
  orgdid: string;
  liveliness_count: number;
  match_count: number;
  search_count: number;
  transaction_datetime: Date;
  counted: boolean;
  lastupdated: Date;
}
