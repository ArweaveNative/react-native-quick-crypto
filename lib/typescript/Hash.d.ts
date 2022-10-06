/// <reference types="node" />
import 'react-native';
import { Encoding } from './Utils';
import Stream from 'stream-browserify';
import { Buffer } from '@craftzdog/react-native-buffer';
interface HashOptionsBase extends Stream.TransformOptions {
    outputLength?: number | undefined;
}
declare type HashOptions = null | undefined | HashOptionsBase;
declare type BinaryLike = ArrayBuffer;
export declare function createHash(algorithm: string, options?: HashOptions): Hash;
declare class Hash extends Stream.Transform {
    private internalHash;
    constructor(other: Hash, options?: HashOptions);
    constructor(algorithm: string, options?: HashOptions);
    copy(options?: HashOptionsBase): Hash;
    /**
     * Updates the hash content with the given `data`, the encoding of which
     * is given in `inputEncoding`.
     * If `encoding` is not provided, and the `data` is a string, an
     * encoding of `'utf8'` is enforced. If `data` is a `Buffer`, `TypedArray`, or`DataView`, then `inputEncoding` is ignored.
     *
     * This can be called many times with new data as it is streamed.
     * @since v0.1.92
     * @param inputEncoding The `encoding` of the `data` string.
     */
    update(data: string | BinaryLike, inputEncoding?: Encoding): Hash;
    _transform(chunk: string | BinaryLike, encoding: Encoding, callback: () => void): void;
    _flush(callback: () => void): void;
    /**
     * Calculates the digest of all of the data passed to be hashed (using the `hash.update()` method).
     * If `encoding` is provided a string will be returned; otherwise
     * a `Buffer` is returned.
     *
     * The `Hash` object can not be used again after `hash.digest()` method has been
     * called. Multiple calls will cause an error to be thrown.
     * @since v0.1.92
     * @param encoding The `encoding` of the return value.
     */
    digest(): Buffer;
    digest(encoding: 'buffer'): Buffer;
    digest(encoding: Encoding): string;
}
export {};
