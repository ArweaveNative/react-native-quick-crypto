/// <reference types="node" />
/// <reference types="node" />
import Stream from 'stream-browserify';
import { BinaryLike, CipherEncoding, Encoding } from './Utils';
import { Buffer } from '@craftzdog/react-native-buffer';
declare class CipherCommon extends Stream.Transform {
    private internal;
    private decoder;
    constructor(cipherType: string, cipherKey: BinaryLike, isCipher: boolean, options?: Record<string, any>, iv?: BinaryLike | null);
    update(data: BinaryLike, inputEncoding?: CipherEncoding, outputEncoding?: CipherEncoding): ArrayBuffer | string;
    final(): ArrayBuffer;
    final(outputEncoding: BufferEncoding | 'buffer'): string;
    _transform(chunk: BinaryLike, encoding: Encoding, callback: () => void): void;
    _flush(callback: () => void): void;
    setAutoPadding(autoPadding?: boolean): this;
    setAAD(buffer: Buffer, options?: {
        plaintextLength: number;
    }): this;
    setAuthTag(tag: Buffer): this;
}
declare class Cipher extends CipherCommon {
    constructor(cipherType: string, cipherKey: BinaryLike, options?: Record<string, any>, iv?: BinaryLike | null);
}
declare class Decipher extends CipherCommon {
    constructor(cipherType: string, cipherKey: BinaryLike, options?: Record<string, any>, iv?: BinaryLike | null);
}
export declare function createDecipher(algorithm: string, password: BinaryLike, options?: Stream.TransformOptions): Decipher;
export declare function createDecipheriv(algorithm: string, key: BinaryLike, iv: BinaryLike | null, options?: Stream.TransformOptions): Decipher;
export declare function createCipher(algorithm: string, password: BinaryLike, options?: Stream.TransformOptions): Cipher;
export declare function createCipheriv(algorithm: string, key: BinaryLike, iv: BinaryLike | null, options?: Stream.TransformOptions): Cipher;
export declare const publicEncrypt: (options: {
    key: any;
    encoding?: string;
    format?: any;
    padding?: any;
    oaepHash?: any;
    oaepLabel?: any;
    passphrase?: string;
}, buffer: BinaryLike) => Buffer;
export declare const publicDecrypt: (options: {
    key: any;
    encoding?: string;
    format?: any;
    padding?: any;
    oaepHash?: any;
    oaepLabel?: any;
    passphrase?: string;
}, buffer: BinaryLike) => Buffer;
export declare const privateDecrypt: (options: {
    key: any;
    encoding?: string;
    format?: any;
    padding?: any;
    oaepHash?: any;
    oaepLabel?: any;
    passphrase?: string;
}, buffer: BinaryLike) => Buffer;
declare type GenerateKeyPairOptions = {
    modulusLength: number;
    publicExponent?: number;
    hashAlgorithm?: string;
    mgf1HashAlgorithm?: string;
    saltLength?: number;
    divisorLength?: number;
    namedCurve?: string;
    prime?: Buffer;
    primeLength?: number;
    generator?: number;
    groupName?: string;
    publicKeyEncoding?: any;
    privateKeyEncoding?: any;
    paramEncoding?: string;
    hash?: any;
    mgf1Hash?: any;
};
declare type GenerateKeyPairCallback = (error: unknown | null, publicKey?: Buffer, privateKey?: Buffer) => void;
export declare function generateKeyPair(type: string, callback: GenerateKeyPairCallback): void;
export declare function generateKeyPair(type: string, options: GenerateKeyPairOptions, callback: GenerateKeyPairCallback): void;
export declare function generateKeyPairSync(type: string): {
    publicKey: any;
    privateKey: any;
};
export declare function generateKeyPairSync(type: string, options: GenerateKeyPairOptions): {
    publicKey: any;
    privateKey: any;
};
export {};
