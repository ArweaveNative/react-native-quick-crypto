function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { NativeQuickCrypto } from './NativeQuickCrypto/NativeQuickCrypto';
import Stream from 'stream-browserify'; // TODO(osp) same as publicCipher on node this are defined on C++ and exposed to node
// Do the same here

var DSASigEnc;

(function (DSASigEnc) {
  DSASigEnc[DSASigEnc["kSigEncDER"] = 0] = "kSigEncDER";
  DSASigEnc[DSASigEnc["kSigEncP1363"] = 1] = "kSigEncP1363";
})(DSASigEnc || (DSASigEnc = {}));

import { binaryLikeToArrayBuffer, getDefaultEncoding } from './Utils';
import { preparePrivateKey, preparePublicOrPrivateKey } from './keys';
const createInternalSign = NativeQuickCrypto.createSign;
const createInternalVerify = NativeQuickCrypto.createVerify;

function getPadding(options) {
  return getIntOption('padding', options);
}

function getSaltLength(options) {
  return getIntOption('saltLength', options);
}

function getDSASignatureEncoding(options) {
  if (typeof options === 'object') {
    const {
      dsaEncoding = 'der'
    } = options;
    if (dsaEncoding === 'der') return DSASigEnc.kSigEncDER;else if (dsaEncoding === 'ieee-p1363') return DSASigEnc.kSigEncP1363;
    throw new Error(`options.dsaEncoding: ${dsaEncoding} not a valid encoding`);
  }

  return DSASigEnc.kSigEncDER;
}

function getIntOption(name, options) {
  const value = options[name];

  if (value !== undefined) {
    if (value === value >> 0) {
      return value;
    }

    throw new Error(`options.${name}: ${value} not a valid int value`);
  }

  return undefined;
}

class Verify extends Stream.Writable {
  constructor(algorithm, options) {
    super(options);

    _defineProperty(this, "internal", void 0);

    this.internal = createInternalVerify();
    this.internal.init(algorithm);
  }

  _write(chunk, encoding, callback) {
    this.update(chunk, encoding);
    callback();
  }

  update(data, encoding) {
    var _encoding;

    encoding = (_encoding = encoding) !== null && _encoding !== void 0 ? _encoding : getDefaultEncoding();
    data = binaryLikeToArrayBuffer(data, encoding);
    this.internal.update(data);
    return this;
  }

  verify(options, signature) {
    if (!options) {
      throw new Error('Crypto sign key required');
    }

    const {
      data,
      format,
      type,
      passphrase
    } = preparePublicOrPrivateKey(options);
    const rsaPadding = getPadding(options);
    const pssSaltLength = getSaltLength(options); // Options specific to (EC)DSA

    const dsaSigEnc = getDSASignatureEncoding(options);
    const ret = this.internal.verify(data, format, type, passphrase, binaryLikeToArrayBuffer(signature), rsaPadding, pssSaltLength, dsaSigEnc);
    return ret;
  }

}

class Sign extends Stream.Writable {
  constructor(algorithm, options) {
    super(options);

    _defineProperty(this, "internal", void 0);

    this.internal = createInternalSign();
    this.internal.init(algorithm);
  }

  _write(chunk, encoding, callback) {
    this.update(chunk, encoding);
    callback();
  }

  update(data, encoding) {
    var _encoding2;

    encoding = (_encoding2 = encoding) !== null && _encoding2 !== void 0 ? _encoding2 : getDefaultEncoding();
    data = binaryLikeToArrayBuffer(data, encoding);
    this.internal.update(data);
    return this;
  }

  sign(options, encoding) {
    if (!options) {
      throw new Error('Crypto sign key required');
    }

    const {
      data,
      format,
      type,
      passphrase
    } = preparePrivateKey(options);
    const rsaPadding = getPadding(options);
    const pssSaltLength = getSaltLength(options); // Options specific to (EC)DSA

    const dsaSigEnc = getDSASignatureEncoding(options);
    const ret = this.internal.sign(data, format, type, passphrase, rsaPadding, pssSaltLength, dsaSigEnc);
    encoding = encoding || getDefaultEncoding();

    if (encoding && encoding !== 'buffer') {
      return Buffer.from(ret).toString(encoding);
    }

    return Buffer.from(ret);
  }

}

export function createSign(algorithm, options) {
  return new Sign(algorithm, options);
}
export function createVerify(algorithm, options) {
  return new Verify(algorithm, options);
}
//# sourceMappingURL=sig.js.map