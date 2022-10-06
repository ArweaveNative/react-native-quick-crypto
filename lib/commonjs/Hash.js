"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHash = createHash;

require("react-native");

var _NativeQuickCrypto = require("./NativeQuickCrypto/NativeQuickCrypto");

var _Utils = require("./Utils");

var _streamBrowserify = _interopRequireDefault(require("stream-browserify"));

var _reactNativeBuffer = require("@craftzdog/react-native-buffer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

global.process.nextTick = setImmediate;
const createInternalHash = _NativeQuickCrypto.NativeQuickCrypto.createHash;

function createHash(algorithm, options) {
  return new Hash(algorithm, options);
}

class Hash extends _streamBrowserify.default.Transform {
  constructor(arg, options) {
    super(options !== null && options !== void 0 ? options : undefined);

    _defineProperty(this, "internalHash", void 0);

    if (arg instanceof Hash) {
      this.internalHash = arg.internalHash.copy(options === null || options === void 0 ? void 0 : options.outputLength);
    } else {
      this.internalHash = createInternalHash(arg, options === null || options === void 0 ? void 0 : options.outputLength);
    }
  }

  copy(options) {
    const copy = new Hash(this, options);
    return copy;
  }
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


  update(data, inputEncoding) {
    if (data instanceof ArrayBuffer) {
      this.internalHash.update(data);
      return this;
    }

    const buffer = _reactNativeBuffer.Buffer.from(data, inputEncoding);

    this.internalHash.update((0, _Utils.toArrayBuffer)(buffer));
    return this;
  }

  _transform(chunk, encoding, callback) {
    this.update(chunk, encoding);
    callback();
  }

  _flush(callback) {
    this.push(this.digest());
    callback();
  }
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


  digest(encoding) {
    const result = this.internalHash.digest();

    if (encoding && encoding !== 'buffer') {
      return _reactNativeBuffer.Buffer.from(result).toString(encoding);
    }

    return _reactNativeBuffer.Buffer.from(result);
  }

}
//# sourceMappingURL=Hash.js.map