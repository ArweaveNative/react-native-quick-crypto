import type { BinaryLike } from 'src/Utils';
import type { Buffer } from '@craftzdog/react-native-buffer';
export declare enum RSAKeyVariant {
    kKeyVariantRSA_SSA_PKCS1_v1_5 = 0,
    kKeyVariantRSA_PSS = 1,
    kKeyVariantRSA_OAEP = 2
}
export declare type InternalCipher = {
    update: (data: BinaryLike | ArrayBufferView) => ArrayBuffer;
    final: () => ArrayBuffer;
    copy: () => void;
    setAAD: (args: {
        data: BinaryLike;
        plaintextLength?: number;
    }) => InternalCipher;
    setAutoPadding: (autoPad: boolean) => boolean;
    setAuthTag: (tag: ArrayBuffer) => boolean;
};
export declare type CreateCipherMethod = (params: {
    cipher_type: string;
    cipher_key: ArrayBuffer;
    auth_tag_len: number;
}) => InternalCipher;
export declare type CreateDecipherMethod = (params: {
    cipher_type: string;
    cipher_key: ArrayBuffer;
    auth_tag_len: number;
}) => InternalCipher;
export declare type PublicEncryptMethod = (data: ArrayBuffer, format: number, type: any, passphrase: any, buffer: ArrayBuffer, padding: number, oaepHash: any, oaepLabel: any) => Buffer;
export declare type PrivateDecryptMethod = (data: ArrayBuffer, format: number, type: any, passphrase: any, buffer: ArrayBuffer, padding: number, oaepHash: any, oaepLabel: any) => Buffer;
export declare type GenerateKeyPairMethod = (keyVariant: RSAKeyVariant, modulusLength: number, publicExponent: number, ...rest: any[]) => Promise<[error: unknown, publicBuffer: any, privateBuffer: any]>;
export declare type GenerateKeyPairSyncMethod = (keyVariant: RSAKeyVariant, modulusLength: number, publicExponent: number, ...rest: any[]) => [error: unknown, publicBuffer: any, privateBuffer: any];
