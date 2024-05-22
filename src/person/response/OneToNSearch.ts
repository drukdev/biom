export interface OneToNSearch {
    code:     number;
    persons:  Person[];
    metadata: OneToNSearchResponseMetadata;
}

export interface OneToNSearchResponseMetadata {
    serverTime: Date;
    ctx:        Ctx;
}

export interface Ctx {
    userIp: string;
}

export interface Person {
    createdAt: Date;
    detection: Detection;
    id:        string;
    images:    Image[];
    metadata:  PersonMetadata;
    name:      string;
    updatedAt: Date;
}

export interface Detection {
    code:          number;
    crop:          null;
    detectorType:  number;
    hash:          null;
    idx:           number;
    image:         null;
    landmarks:     number[][];
    landmarksType: number;
    msg:           string;
    roi:           number[];
    versionSDK:    string;
}

export interface Image {
    createdAt:  Date;
    distance:   number;
    id:         string;
    metadata:   ImageMetadata;
    path:       string;
    similarity: number;
    updatedAt:  Date;
    url:        string;
}

export interface ImageMetadata {
    hash:          string;
    landmarks:     number[][];
    landmarksType: number;
    roi:           number[];
}

export interface PersonMetadata {
    IDS:        string[];
    breadcrumb: string;
    deviceId:   string;
}
