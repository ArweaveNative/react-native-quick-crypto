/// <reference types="node" />
import { Encoding, BinaryLike } from './Utils';
import Stream from 'stream-browserify';
import { Buffer } from '@craftzdog/react-native-buffer';
export declare function createHmac(algorithm: string, key: BinaryLike, options?: Stream.TransformOptions): Hmac;
declare class Hmac extends Stream.Transform {
    private internalHmac;
    private isFinalized;
    constructor(algorithm: string, key: BinaryLike, _options?: Stream.TransformOptions);
    /**
     * Updates the `Hmac` content with the given `data`, the encoding of which
     * is given in `inputEncoding`.
     * If `encoding` is not provided, and the `data` is a string, an
     * encoding of `'utf8'` is enforced. If `data` is a `Buffer`, `TypedArray`, or`DataView`, then `inputEncoding` is ignored.
     *
     * This can be called many times with new data as it is streamed.
     * @since v0.1.94
     * @param inputEncoding The `encoding` of the `data` string.
     */
    update(data: string | BinaryLike, inputEncoding?: Encoding): Hmac;
    _transform(chunk: string | BinaryLike, encoding: Encoding, callback: () => void): void;
    _flush(callback: () => void): void;
    /**
     * Calculates the HMAC digest of all of the data passed using `hmac.update()`.
     * If `encoding` is
     * provided a string is returned; otherwise a `Buffer` is returned;
     *
     * The `Hmac` object can not be used again after `hmac.digest()` has been
     * called. Multiple calls to `hmac.digest()` will result in an error being thrown.
     * @since v0.1.94
     * @param encoding The `encoding` of the return value.
     */
    digest(): Buffer;
    digest(encoding: 'buffer'): Buffer;
    digest(encoding: Encoding): string;
}
export {};
