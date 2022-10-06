import type { CreateHmacMethod } from './hmac';
import type { CreateHashMethod } from './hash';
import type { Pbkdf2Object } from './pbkdf2';
import type { RandomObject } from './random';
import type { CreateCipherMethod, CreateDecipherMethod, PublicEncryptMethod, PrivateDecryptMethod, GenerateKeyPairMethod, GenerateKeyPairSyncMethod } from './Cipher';
import type { CreateSignMethod, CreateVerifyMethod } from './sig';
interface NativeQuickCryptoSpec {
    createHmac: CreateHmacMethod;
    pbkdf2: Pbkdf2Object;
    random: RandomObject;
    createHash: CreateHashMethod;
    createCipher: CreateCipherMethod;
    createDecipher: CreateDecipherMethod;
    publicEncrypt: PublicEncryptMethod;
    publicDecrypt: PublicEncryptMethod;
    privateDecrypt: PrivateDecryptMethod;
    generateKeyPair: GenerateKeyPairMethod;
    generateKeyPairSync: GenerateKeyPairSyncMethod;
    createSign: CreateSignMethod;
    createVerify: CreateVerifyMethod;
}
declare global {
    function nativeCallSyncHook(): unknown;
    var __QuickCryptoProxy: object | undefined;
}
export declare const NativeQuickCrypto: NativeQuickCryptoSpec;
export {};
