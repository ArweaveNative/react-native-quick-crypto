import { Buffer } from '@craftzdog/react-native-buffer';
import { BinaryLike } from './Utils';
declare type Password = BinaryLike;
declare type Salt = BinaryLike;
declare type Pbkdf2Callback = (err: Error | null, derivedKey?: Buffer) => void;
export declare function pbkdf2(password: Password, salt: Salt, iterations: number, keylen: number, digest: string, callback: Pbkdf2Callback): void;
export declare function pbkdf2(password: Password, salt: Salt, iterations: number, keylen: number, callback: Pbkdf2Callback): void;
export declare function pbkdf2Sync(password: Password, salt: Salt, iterations: number, keylen: number, digest?: string): Buffer;
export {};
