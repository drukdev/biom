export interface RegulaPersonDetails {
    pDetails: PDetails;
}

export interface PDetails {
    pDetail: PDetail[];
}

export interface PDetail {
    personid: string;
    meta:     string;
}
