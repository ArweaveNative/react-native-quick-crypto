"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCipher = createCipher;
exports.createCipheriv = createCipheriv;
exports.createDecipher = createDecipher;
exports.createDecipheriv = createDecipheriv;
exports.generateKeyPair = generateKeyPair;
exports.generateKeyPairSync = generateKeyPairSync;
exports.publicEncrypt = exports.publicDecrypt = exports.privateDecrypt = void 0;

var _NativeQuickCrypto = require("./NativeQuickCrypto/NativeQuickCrypto");

var _streamBrowserify = _interopRequireDefault(require("stream-browserify"));

var _Utils = require("./Utils");

var _Cipher = require("./NativeQuickCrypto/Cipher");

var _string_decoder = require("string_decoder");

var _reactNativeBuffer = require("@craftzdog/react-native-buffer");

var _safeBuffer = require("safe-buffer");

var _constants = require("./constants");

var _keys = require("./keys");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// make sure that nextTick is there
global.process.nextTick = setImmediate;
const createInternalCipher = _NativeQuickCrypto.NativeQuickCrypto.createCipher;
const createInternalDecipher = _NativeQuickCrypto.NativeQuickCrypto.createDecipher;
const _publicEncrypt = _NativeQuickCrypto.NativeQuickCrypto.publicEncrypt;
const _publicDecrypt = _NativeQuickCrypto.NativeQuickCrypto.publicDecrypt;
const _privateDecrypt = _NativeQuickCrypto.NativeQuickCrypto.privateDecrypt;

function getUIntOption(options, key) {
  let value;

  if (options && (value = options[key]) != null) {
    // >>> Turns any type into a positive integer (also sets the sign bit to 0)
    // eslint-disable-next-line no-bitwise
    if (value >>> 0 !== value) throw new Error(`options.${key}: ${value}`);
    return value;
  }

  return -1;
}

function normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;

  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';

      case 'latin1':
      case 'binary':
        return 'latin1';

      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;

      default:
        if (retried) return; // undefined

        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
}

function validateEncoding(data, encoding) {
  const normalizedEncoding = normalizeEncoding(encoding);
  const length = data.length;

  if (normalizedEncoding === 'hex' && length % 2 !== 0) {
    throw new Error(`Encoding ${encoding} not valid for data length ${length}`);
  }
}

function getDecoder(decoder, encoding) {
  return decoder !== null && decoder !== void 0 ? decoder : new _string_decoder.StringDecoder(encoding);
}

class CipherCommon extends _streamBrowserify.default.Transform {
  constructor(cipherType, cipherKey, isCipher) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    let iv = arguments.length > 4 ? arguments[4] : undefined;
    super(options);

    _defineProperty(this, "internal", void 0);

    _defineProperty(this, "decoder", void 0);

    const cipherKeyBuffer = (0, _Utils.binaryLikeToArrayBuffer)(cipherKey); // TODO(osp) This might not be smart, check again after release

    const authTagLength = getUIntOption(options, 'authTagLength');
    const args = {
      cipher_type: cipherType,
      cipher_key: cipherKeyBuffer,
      iv,
      ...options,
      auth_tag_len: authTagLength
    };
    this.internal = isCipher ? createInternalCipher(args) : createInternalDecipher(args);
  }

  update(data, inputEncoding, outputEncoding) {
    var _inputEncoding, _outputEncoding;

    const defaultEncoding = (0, _Utils.getDefaultEncoding)();
    inputEncoding = (_inputEncoding = inputEncoding) !== null && _inputEncoding !== void 0 ? _inputEncoding : defaultEncoding;
    outputEncoding = (_outputEncoding = outputEncoding) !== null && _outputEncoding !== void 0 ? _outputEncoding : defaultEncoding;

    if (typeof data === 'string') {
      validateEncoding(data, inputEncoding);
    } else if (!ArrayBuffer.isView(data)) {
      throw new Error('Invalid data argument');
    }

    if (typeof data === 'string') {
      // On node this is handled on the native side
      // on our case we need to correctly send the arraybuffer to the jsi side
      inputEncoding = inputEncoding === 'buffer' ? 'utf8' : inputEncoding;
      data = (0, _Utils.binaryLikeToArrayBuffer)(data, inputEncoding);
    } else {
      data = (0, _Utils.binaryLikeToArrayBuffer)(data, inputEncoding);
    }

    const ret = this.internal.update(data);

    if (outputEncoding && outputEncoding !== 'buffer') {
      this.decoder = getDecoder(this.decoder, outputEncoding);
      return this.decoder.write(_safeBuffer.Buffer.from(ret));
    }

    return ret;
  }

  final(outputEncoding) {
    const ret = this.internal.final();

    if (outputEncoding && outputEncoding !== 'buffer') {
      this.decoder = getDecoder(this.decoder, outputEncoding);
      return this.decoder.end(_safeBuffer.Buffer.from(ret));
    }

    return ret;
  }

  _transform(chunk, encoding, callback) {
    this.push(this.update(chunk, encoding));
    callback();
  }

  _flush(callback) {
    this.push(this.final());
    callback();
  }

  setAutoPadding(autoPadding) {
    this.internal.setAutoPadding(!!autoPadding);
    return this;
  }

  setAAD(buffer, options) {
    this.internal.setAAD({
      data: buffer.buffer,
      plaintextLength: options === null || options === void 0 ? void 0 : options.plaintextLength
    });
    return this;
  } // protected getAuthTag(): Buffer {
  //   return Buffer.from(this.internal.getAuthTag());
  // }


  setAuthTag(tag) {
    this.internal.setAuthTag(tag.buffer);
    return this;
  }

}

class Cipher extends CipherCommon {
  constructor(cipherType, cipherKey) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let iv = arguments.length > 3 ? arguments[3] : undefined;

    if (iv != null) {
      iv = (0, _Utils.binaryLikeToArrayBuffer)(iv);
    }

    super(cipherType, cipherKey, true, options, iv);
  }

}

class Decipher extends CipherCommon {
  constructor(cipherType, cipherKey) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let iv = arguments.length > 3 ? arguments[3] : undefined;

    if (iv != null) {
      iv = (0, _Utils.binaryLikeToArrayBuffer)(iv);
    }

    super(cipherType, cipherKey, false, options, iv);
  }

} // TODO(osp) This definitions cause typescript errors when using the API
// export function createDecipher(
//   algorithm: CipherCCMTypes,
//   password: BinaryLike,
//   options: CipherCCMOptions
// ): Decipher;
// export function createDecipher(
//   algorithm: CipherGCMTypes,
//   password: BinaryLike,
//   options?: CipherGCMOptions
// ): Decipher;


function createDecipher(algorithm, password, options) {
  return new Decipher(algorithm, password, options);
} // TODO(osp) This definitions cause typescript errors when using the API
// export function createDecipheriv(
//   algorithm: CipherCCMTypes,
//   key: BinaryLike,
//   iv: BinaryLike,
//   options: CipherCCMOptions
// ): Decipher;
// export function createDecipheriv(
//   algorithm: CipherOCBTypes,
//   key: BinaryLike,
//   iv: BinaryLike,
//   options: CipherOCBOptions
// ): DecipherOCB;
// export function createDecipheriv(
//   algorithm: CipherGCMTypes,
//   key: BinaryLike,
//   iv: BinaryLike,
//   options?: CipherGCMOptions
// ): Decipher;


function createDecipheriv(algorithm, key, iv, options) {
  return new Decipher(algorithm, key, options, iv);
} // TODO(osp) This definitions cause typescript errors when using the API
// commenting them out for now
// export function createCipher(
//   algorithm: CipherCCMTypes,
//   password: BinaryLike,
//   options: CipherCCMOptions
// ): Cipher;
// export function createCipher(
//   algorithm: CipherGCMTypes,
//   password: BinaryLike,
//   options?: CipherGCMOptions
// ): Cipher;


function createCipher(algorithm, password, options) {
  return new Cipher(algorithm, password, options);
} // TODO(osp) on all the createCipheriv methods, node seems to use a "KeyObject" is seems to be a thread safe
// object that creates keys and what not. Not sure if we should support it.
// Fow now I replaced all of them to BinaryLike
// export function createCipheriv(
//   algorithm: CipherCCMTypes,
//   key: BinaryLike,
//   iv: BinaryLike,
//   options: CipherCCMOptions
// ): Cipher;
// export function createCipheriv(
//   algorithm: CipherOCBTypes,
//   key: BinaryLike,
//   iv: BinaryLike,
//   options: CipherOCBOptions
// ): CipherOCB;
// export function createCipheriv(
//   algorithm: CipherGCMTypes,
//   key: BinaryLike,
//   iv: BinaryLike,
//   options?: CipherGCMOptions
// ): Cipher;


function createCipheriv(algorithm, key, iv, options) {
  return new Cipher(algorithm, key, options, iv);
} // RSA Functions
// Follows closely the model implemented in node
// TODO(osp) types...


function rsaFunctionFor(method, defaultPadding, keyType) {
  return (options, buffer) => {
    const {
      format,
      type,
      data,
      passphrase
    } = keyType === 'private' ? (0, _keys.preparePrivateKey)(options) : (0, _keys.preparePublicOrPrivateKey)(options);
    const padding = options.padding || defaultPadding;
    const {
      oaepHash,
      encoding
    } = options;
    let {
      oaepLabel
    } = options;
    if (oaepHash !== undefined) (0, _Utils.validateString)(oaepHash, 'key.oaepHash');
    if (oaepLabel !== undefined) oaepLabel = (0, _Utils.binaryLikeToArrayBuffer)(oaepLabel, encoding);
    buffer = (0, _Utils.binaryLikeToArrayBuffer)(buffer, encoding);
    const rawRes = method(data, format, type, passphrase, buffer, padding, oaepHash, oaepLabel);
    return _reactNativeBuffer.Buffer.from(rawRes);
  };
}

const publicEncrypt = rsaFunctionFor(_publicEncrypt, _constants.constants.RSA_PKCS1_OAEP_PADDING, 'public');
exports.publicEncrypt = publicEncrypt;
const publicDecrypt = rsaFunctionFor(_publicDecrypt, _constants.constants.RSA_PKCS1_PADDING, 'public'); // const privateEncrypt = rsaFunctionFor(_privateEncrypt, constants.RSA_PKCS1_PADDING,
//   'private');

exports.publicDecrypt = publicDecrypt;
const privateDecrypt = rsaFunctionFor(_privateDecrypt, _constants.constants.RSA_PKCS1_OAEP_PADDING, 'private'); //                                   _       _  __          _____      _
//                                  | |     | |/ /         |  __ \    (_)
//    __ _  ___ _ __   ___ _ __ __ _| |_ ___| ' / ___ _   _| |__) |_ _ _ _ __
//   / _` |/ _ \ '_ \ / _ \ '__/ _` | __/ _ \  < / _ \ | | |  ___/ _` | | '__|
//  | (_| |  __/ | | |  __/ | | (_| | ||  __/ . \  __/ |_| | |  | (_| | | |
//   \__, |\___|_| |_|\___|_|  \__,_|\__\___|_|\_\___|\__, |_|   \__,_|_|_|
//    __/ |                                            __/ |
//   |___/                                            |___/

exports.privateDecrypt = privateDecrypt;

function parseKeyEncoding(keyType) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Utils.kEmptyObject;
  const {
    publicKeyEncoding,
    privateKeyEncoding
  } = options;
  let publicFormat, publicType;

  if (publicKeyEncoding == null) {
    publicFormat = publicType = undefined;
  } else if (typeof publicKeyEncoding === 'object') {
    ({
      format: publicFormat,
      type: publicType
    } = (0, _keys.parsePublicKeyEncoding)(publicKeyEncoding, keyType, 'publicKeyEncoding'));
  } else {
    throw new Error('Invalid argument options.publicKeyEncoding', publicKeyEncoding);
  }

  let privateFormat, privateType, cipher, passphrase;

  if (privateKeyEncoding == null) {
    privateFormat = privateType = undefined;
  } else if (typeof privateKeyEncoding === 'object') {
    ({
      format: privateFormat,
      type: privateType,
      cipher,
      passphrase
    } = (0, _keys.parsePrivateKeyEncoding)(privateKeyEncoding, keyType, 'privateKeyEncoding'));
  } else {
    throw new Error('Invalid argument options.privateKeyEncoding', publicKeyEncoding);
  }

  return [publicFormat, publicType, privateFormat, privateType, cipher, passphrase];
}

function internalGenerateKeyPair(isAsync, type, options, callback) {
  // On node a very complex "job" chain is created, we are going for a far simpler approach and calling
  // an internal function that basically executes the same byte shuffling on the native side
  const encoding = parseKeyEncoding(type, options); // if (options !== undefined)
  //   validateObject(options, 'options');

  switch (type) {
    case 'rsa-pss':
    case 'rsa':
      {
        (0, _Utils.validateObject)(options, 'options');
        const {
          modulusLength
        } = options;
        (0, _Utils.validateUint32)(modulusLength, 'options.modulusLength');
        let {
          publicExponent
        } = options;

        if (publicExponent == null) {
          publicExponent = 0x10001;
        } else {
          (0, _Utils.validateUint32)(publicExponent, 'options.publicExponent');
        }

        if (type === 'rsa') {
          if (isAsync) {
            _NativeQuickCrypto.NativeQuickCrypto.generateKeyPair(_Cipher.RSAKeyVariant.kKeyVariantRSA_SSA_PKCS1_v1_5, modulusLength, publicExponent, ...encoding).then(_ref => {
              let [err, publicKey, privateKey] = _ref;

              if (typeof publicKey === 'object') {
                publicKey = _reactNativeBuffer.Buffer.from(publicKey);
              }

              if (typeof privateKey === 'object') {
                privateKey = _reactNativeBuffer.Buffer.from(privateKey);
              }

              callback === null || callback === void 0 ? void 0 : callback(err, publicKey, privateKey);
            }).catch(err => {
              callback === null || callback === void 0 ? void 0 : callback(err, undefined, undefined);
            });

            return;
          } else {
            let [err, publicKey, privateKey] = _NativeQuickCrypto.NativeQuickCrypto.generateKeyPairSync(_Cipher.RSAKeyVariant.kKeyVariantRSA_SSA_PKCS1_v1_5, modulusLength, publicExponent, ...encoding);

            if (typeof publicKey === 'object') {
              publicKey = _reactNativeBuffer.Buffer.from(publicKey);
            }

            if (typeof privateKey === 'object') {
              privateKey = _reactNativeBuffer.Buffer.from(privateKey);
            }

            return [err, publicKey, privateKey];
          }
        }

        const {
          hash,
          mgf1Hash,
          hashAlgorithm,
          mgf1HashAlgorithm,
          saltLength
        } = options; // // We don't have a process object on RN
        // // const pendingDeprecation = getOptionValue('--pending-deprecation');

        if (saltLength !== undefined) (0, _Utils.validateInt32)(saltLength, 'options.saltLength', 0);
        if (hashAlgorithm !== undefined) (0, _Utils.validateString)(hashAlgorithm, 'options.hashAlgorithm');
        if (mgf1HashAlgorithm !== undefined) (0, _Utils.validateString)(mgf1HashAlgorithm, 'options.mgf1HashAlgorithm');

        if (hash !== undefined) {
          // pendingDeprecation && process.emitWarning(
          //   '"options.hash" is deprecated, ' +
          //   'use "options.hashAlgorithm" instead.',
          //   'DeprecationWarning',
          //   'DEP0154');
          (0, _Utils.validateString)(hash, 'options.hash');

          if (hashAlgorithm && hash !== hashAlgorithm) {
            throw new Error(`Invalid Argument options.hash ${hash}`);
          }
        }

        if (mgf1Hash !== undefined) {
          // pendingDeprecation && process.emitWarning(
          //   '"options.mgf1Hash" is deprecated, ' +
          //   'use "options.mgf1HashAlgorithm" instead.',
          //   'DeprecationWarning',
          //   'DEP0154');
          (0, _Utils.validateString)(mgf1Hash, 'options.mgf1Hash');

          if (mgf1HashAlgorithm && mgf1Hash !== mgf1HashAlgorithm) {
            throw new Error(`Invalid Argument options.mgf1Hash ${mgf1Hash}`);
          }
        }

        return _NativeQuickCrypto.NativeQuickCrypto.generateKeyPairSync(_Cipher.RSAKeyVariant.kKeyVariantRSA_PSS, modulusLength, publicExponent, hashAlgorithm || hash, mgf1HashAlgorithm || mgf1Hash, saltLength, ...encoding);
      }
    // case 'dsa': {
    //   validateObject(options, 'options');
    //   const { modulusLength } = options!;
    //   validateUint32(modulusLength, 'options.modulusLength');
    //   let { divisorLength } = options!;
    //   if (divisorLength == null) {
    //     divisorLength = -1;
    //   } else validateInt32(divisorLength, 'options.divisorLength', 0);
    //   // return new DsaKeyPairGenJob(
    //   //   mode,
    //   //   modulusLength,
    //   //   divisorLength,
    //   //   ...encoding);
    // }
    // case 'ec': {
    //   validateObject(options, 'options');
    //   const { namedCurve } = options!;
    //   validateString(namedCurve, 'options.namedCurve');
    //   let { paramEncoding } = options!;
    //   if (paramEncoding == null || paramEncoding === 'named')
    //     paramEncoding = OPENSSL_EC_NAMED_CURVE;
    //   else if (paramEncoding === 'explicit')
    //     paramEncoding = OPENSSL_EC_EXPLICIT_CURVE;
    //   else
    //   throw new Error(`Invalid Argument options.paramEncoding ${paramEncoding}`);
    //     // throw new ERR_INVALID_ARG_VALUE('options.paramEncoding', paramEncoding);
    //   // return new EcKeyPairGenJob(mode, namedCurve, paramEncoding, ...encoding);
    // }
    // case 'ed25519':
    // case 'ed448':
    // case 'x25519':
    // case 'x448': {
    //   let id;
    //   switch (type) {
    //     case 'ed25519':
    //       id = EVP_PKEY_ED25519;
    //       break;
    //     case 'ed448':
    //       id = EVP_PKEY_ED448;
    //       break;
    //     case 'x25519':
    //       id = EVP_PKEY_X25519;
    //       break;
    //     case 'x448':
    //       id = EVP_PKEY_X448;
    //       break;
    //   }
    //   return new NidKeyPairGenJob(mode, id, ...encoding);
    // }
    // case 'dh': {
    //   validateObject(options, 'options');
    //   const { group, primeLength, prime, generator } = options;
    //   if (group != null) {
    //     if (prime != null)
    //       throw new ERR_INCOMPATIBLE_OPTION_PAIR('group', 'prime');
    //     if (primeLength != null)
    //       throw new ERR_INCOMPATIBLE_OPTION_PAIR('group', 'primeLength');
    //     if (generator != null)
    //       throw new ERR_INCOMPATIBLE_OPTION_PAIR('group', 'generator');
    //     validateString(group, 'options.group');
    //     return new DhKeyPairGenJob(mode, group, ...encoding);
    //   }
    //   if (prime != null) {
    //     if (primeLength != null)
    //       throw new ERR_INCOMPATIBLE_OPTION_PAIR('prime', 'primeLength');
    //     validateBuffer(prime, 'options.prime');
    //   } else if (primeLength != null) {
    //     validateInt32(primeLength, 'options.primeLength', 0);
    //   } else {
    //     throw new ERR_MISSING_OPTION(
    //       'At least one of the group, prime, or primeLength options'
    //     );
    //   }
    //   if (generator != null) {
    //     validateInt32(generator, 'options.generator', 0);
    //   }
    //   return new DhKeyPairGenJob(
    //     mode,
    //     prime != null ? prime : primeLength,
    //     generator == null ? 2 : generator,
    //     ...encoding
    //   );
    // }

    default: // Fall through

  }

  throw new Error(`Invalid Argument options: ${type} scheme not supported. Currently not all encryption methods are supported in quick-crypto!`);
} // TODO(osp) put correct types (e.g. type -> 'rsa', etc..)


function generateKeyPair(type, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  (0, _Utils.validateFunction)(callback);
  internalGenerateKeyPair(true, type, options, callback);
}

function generateKeyPairSync(type, options) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, publicKey, privateKey] = internalGenerateKeyPair(false, type, options, undefined);
  return {
    publicKey,
    privateKey
  };
}
//# sourceMappingURL=Cipher.js.map