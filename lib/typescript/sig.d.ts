/// <reference types="node" />
/// <reference types="node" />
import Stream from 'stream-browserify';
import { BinaryLike } from './Utils';
declare class Verify extends Stream.Writable {
    private internal;
    constructor(algorithm: string, options: Stream.WritableOptions);
    _write(chunk: BinaryLike, encoding: string, callback: () => void): void;
    update(data: BinaryLike, encoding?: string): this;
    verify(options: {
        key: string | Buffer;
        format?: string;
        type?: string;
        passphrase?: string;
        padding?: number;
        saltLength?: number;
    }, signature: BinaryLike): boolean;
}
declare class Sign extends Stream.Writable {
    private internal;
    constructor(algorithm: string, options: Stream.WritableOptions);
    _write(chunk: BinaryLike, encoding: string, callback: () => void): void;
    update(data: BinaryLike, encoding?: string): this;
    sign(options: {
        key: string | Buffer;
        format?: string;
        type?: string;
        passphrase?: string;
        padding?: number;
        saltLength?: number;
    }, encoding?: string): string | Buffer;
}
export declare function createSign(algorithm: string, options?: any): Sign;
export declare function createVerify(algorithm: string, options?: any): Verify;
export {};
