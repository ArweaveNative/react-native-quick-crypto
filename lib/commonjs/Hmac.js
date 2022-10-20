"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHmac = createHmac;

var _NativeQuickCrypto = require("./NativeQuickCrypto/NativeQuickCrypto");

var _Utils = require("./Utils");

var _streamBrowserify = _interopRequireDefault(require("stream-browserify"));

var _reactNativeBuffer = require("@craftzdog/react-native-buffer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const createInternalHmac = _NativeQuickCrypto.NativeQuickCrypto.createHmac;

function createHmac(algorithm, key, options) {
  return new Hmac(algorithm, key, options);
}

class Hmac extends _streamBrowserify.default.Transform {
  constructor(algorithm, key, _options) {
    super();

    _defineProperty(this, "internalHmac", void 0);

    _defineProperty(this, "isFinalized", false);

    let keyAsString = (0, _Utils.binaryLikeToArrayBuffer)(key);

    if (keyAsString === undefined) {
      throw 'Wrong key type';
    }

    this.internalHmac = createInternalHmac(algorithm, keyAsString);
  }
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


  update(data, inputEncoding) {
    if (data instanceof ArrayBuffer) {
      this.internalHmac.update(data);
      return this;
    }

    if (typeof data === 'string') {
      const buffer = _reactNativeBuffer.Buffer.from(data, inputEncoding);

      this.internalHmac.update((0, _Utils.toArrayBuffer)(buffer));
      return this;
    }

    this.internalHmac.update((0, _Utils.binaryLikeToArrayBuffer)(data));
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
   * Calculates the HMAC digest of all of the data passed using `hmac.update()`.
   * If `encoding` is
   * provided a string is returned; otherwise a `Buffer` is returned;
   *
   * The `Hmac` object can not be used again after `hmac.digest()` has been
   * called. Multiple calls to `hmac.digest()` will result in an error being thrown.
   * @since v0.1.94
   * @param encoding The `encoding` of the return value.
   */


  digest(encoding) {
    const result = this.isFinalized ? new ArrayBuffer(0) : this.internalHmac.digest();
    this.isFinalized = true;

    if (encoding && encoding !== 'buffer') {
      return _reactNativeBuffer.Buffer.from(result).toString(encoding);
    }

    return _reactNativeBuffer.Buffer.from(result);
  }

}
//# sourceMappingURL=Hmac.js.map