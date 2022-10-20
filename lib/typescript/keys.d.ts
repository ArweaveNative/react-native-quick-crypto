import { BinaryLike } from './Utils';
declare enum KFormatType {
    kKeyFormatDER = 0,
    kKeyFormatPEM = 1,
    kKeyFormatJWK = 2
}
declare enum KeyEncoding {
    kKeyEncodingPKCS1 = 0,
    kKeyEncodingPKCS8 = 1,
    kKeyEncodingSPKI = 2,
    kKeyEncodingSEC1 = 3
}
export declare function preparePrivateKey(key: BinaryLike | {
    key: any;
    encoding?: string;
    format?: any;
    padding?: number;
    passphrase?: string;
}): {
    format: KFormatType;
    data: ArrayBuffer;
    type?: any;
    passphrase?: any;
};
export declare function preparePublicOrPrivateKey(key: BinaryLike | {
    key: any;
    encoding?: string;
    format?: any;
    padding?: number;
}): {
    format: KFormatType;
    data: ArrayBuffer;
    type?: any;
    passphrase?: any;
};
export declare function parsePublicKeyEncoding(enc: {
    key: any;
    encoding?: string;
    format?: string;
    cipher?: string;
    passphrase?: string;
}, keyType: string | undefined, objName?: string): {
    format: KFormatType;
    type: KeyEncoding | undefined;
    cipher: string | undefined;
    passphrase: ArrayBuffer | undefined;
};
export declare function parsePrivateKeyEncoding(enc: {
    key: any;
    encoding?: string;
    format?: string;
    cipher?: string;
    passphrase?: string;
}, keyType: string | undefined, objName?: string): {
    format: KFormatType;
    type: KeyEncoding | undefined;
    cipher: string | undefined;
    passphrase: ArrayBuffer | undefined;
};
export {};
