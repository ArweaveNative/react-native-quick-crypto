"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsePrivateKeyEncoding = parsePrivateKeyEncoding;
exports.parsePublicKeyEncoding = parsePublicKeyEncoding;
exports.preparePrivateKey = preparePrivateKey;
exports.preparePublicOrPrivateKey = preparePublicOrPrivateKey;

var _Utils = require("./Utils");

// On node this value is defined on the native side, for now I'm just creating it here in JS
// TODO(osp) move this into native side to make sure they always match
var KFormatType;

(function (KFormatType) {
  KFormatType[KFormatType["kKeyFormatDER"] = 0] = "kKeyFormatDER";
  KFormatType[KFormatType["kKeyFormatPEM"] = 1] = "kKeyFormatPEM";
  KFormatType[KFormatType["kKeyFormatJWK"] = 2] = "kKeyFormatJWK";
})(KFormatType || (KFormatType = {}));

var KeyInputContext;

(function (KeyInputContext) {
  KeyInputContext[KeyInputContext["kConsumePublic"] = 0] = "kConsumePublic";
  KeyInputContext[KeyInputContext["kConsumePrivate"] = 1] = "kConsumePrivate";
  KeyInputContext[KeyInputContext["kCreatePublic"] = 2] = "kCreatePublic";
  KeyInputContext[KeyInputContext["kCreatePrivate"] = 3] = "kCreatePrivate";
})(KeyInputContext || (KeyInputContext = {}));

var KeyEncoding;

(function (KeyEncoding) {
  KeyEncoding[KeyEncoding["kKeyEncodingPKCS1"] = 0] = "kKeyEncodingPKCS1";
  KeyEncoding[KeyEncoding["kKeyEncodingPKCS8"] = 1] = "kKeyEncodingPKCS8";
  KeyEncoding[KeyEncoding["kKeyEncodingSPKI"] = 2] = "kKeyEncodingSPKI";
  KeyEncoding[KeyEncoding["kKeyEncodingSEC1"] = 3] = "kKeyEncodingSEC1";
})(KeyEncoding || (KeyEncoding = {}));

const encodingNames = {
  [KeyEncoding.kKeyEncodingPKCS1]: 'pkcs1',
  [KeyEncoding.kKeyEncodingPKCS8]: 'pkcs8',
  [KeyEncoding.kKeyEncodingSPKI]: 'spki',
  [KeyEncoding.kKeyEncodingSEC1]: 'sec1'
};

function option(name, objName) {
  return objName === undefined ? `options.${name}` : `options.${objName}.${name}`;
}

function parseKeyFormat(formatStr, defaultFormat, optionName) {
  if (formatStr === undefined && defaultFormat !== undefined) return defaultFormat;else if (formatStr === 'pem') return KFormatType.kKeyFormatPEM;else if (formatStr === 'der') return KFormatType.kKeyFormatDER;else if (formatStr === 'jwk') return KFormatType.kKeyFormatJWK;
  throw new Error(`Invalid key format str: ${optionName}`); // throw new ERR_INVALID_ARG_VALUE(optionName, formatStr);
}

function parseKeyType(typeStr, required, keyType, isPublic, optionName) {
  if (typeStr === undefined && !required) {
    return undefined;
  } else if (typeStr === 'pkcs1') {
    if (keyType !== undefined && keyType !== 'rsa') {
      throw new Error(`Crypto incompatible key options: ${typeStr} can only be used for RSA keys`);
    }

    return KeyEncoding.kKeyEncodingPKCS1;
  } else if (typeStr === 'spki' && isPublic !== false) {
    return KeyEncoding.kKeyEncodingSPKI;
  } else if (typeStr === 'pkcs8' && isPublic !== true) {
    return KeyEncoding.kKeyEncodingPKCS8;
  } else if (typeStr === 'sec1' && isPublic !== true) {
    if (keyType !== undefined && keyType !== 'ec') {
      throw new Error(`Incompatible key options ${typeStr} can only be used for EC keys`);
    }

    return KeyEncoding.kKeyEncodingSEC1;
  }

  throw new Error(`Invalid option ${optionName} - ${typeStr}`);
}

function parseKeyFormatAndType(enc, keyType, isPublic, objName) {
  const {
    format: formatStr,
    type: typeStr
  } = enc;
  const isInput = keyType === undefined;
  const format = parseKeyFormat(formatStr, isInput ? KFormatType.kKeyFormatPEM : undefined, option('format', objName));
  const isRequired = (!isInput || format === KFormatType.kKeyFormatDER) && format !== KFormatType.kKeyFormatJWK;
  const type = parseKeyType(typeStr, isRequired, keyType, isPublic, option('type', objName));
  return {
    format,
    type
  };
}

function parseKeyEncoding(enc, keyType, isPublic, objName) {
  // validateObject(enc, 'options');
  const isInput = keyType === undefined;
  const {
    format,
    type
  } = parseKeyFormatAndType(enc, keyType, isPublic, objName);
  let cipher, passphrase, encoding;

  if (isPublic !== true) {
    ({
      cipher,
      passphrase,
      encoding
    } = enc);

    if (!isInput) {
      if (cipher != null) {
        if (typeof cipher !== 'string') throw new Error(`Invalid argument ${option('cipher', objName)}: ${cipher}`);

        if (format === KFormatType.kKeyFormatDER && (type === KeyEncoding.kKeyEncodingPKCS1 || type === KeyEncoding.kKeyEncodingSEC1)) {
          throw new Error(`Incompatible key options ${encodingNames[type]} does not support encryption`);
        }
      } else if (passphrase !== undefined) {
        throw new Error(`invalid argument ${option('cipher', objName)}: ${cipher}`);
      }
    }

    if (isInput && passphrase !== undefined && !(0, _Utils.isStringOrBuffer)(passphrase) || !isInput && cipher != null && !(0, _Utils.isStringOrBuffer)(passphrase)) {
      throw new Error(`Invalid argument value ${option('passphrase', objName)}: ${passphrase}`);
    }
  }

  if (passphrase !== undefined) passphrase = (0, _Utils.binaryLikeToArrayBuffer)(passphrase, encoding);
  return {
    format,
    type,
    cipher,
    passphrase
  };
}

function prepareAsymmetricKey(key, ctx) {
  // TODO(osp) check, KeyObject some node object
  // if (isKeyObject(key)) {
  //   // Best case: A key object, as simple as that.
  //   return { data: getKeyObjectHandle(key, ctx) };
  // } else
  // if (isCryptoKey(key)) {
  //   return { data: getKeyObjectHandle(key[kKeyObject], ctx) };
  // } else
  if ((0, _Utils.isStringOrBuffer)(key)) {
    // Expect PEM by default, mostly for backward compatibility.
    return {
      format: KFormatType.kKeyFormatPEM,
      data: (0, _Utils.binaryLikeToArrayBuffer)(key)
    };
  } else if (typeof key === 'object') {
    const {
      key: data,
      encoding // format

    } = key; // // The 'key' property can be a KeyObject as well to allow specifying
    // // additional options such as padding along with the key.
    // if (isKeyObject(data)) return { data: getKeyObjectHandle(data, ctx) };
    // else if (isCryptoKey(data))
    //   return { data: getKeyObjectHandle(data[kKeyObject], ctx) };
    // else if (isJwk(data) && format === 'jwk')
    //   return { data: getKeyObjectHandleFromJwk(data, ctx), format: 'jwk' };
    // Either PEM or DER using PKCS#1 or SPKI.

    if (!(0, _Utils.isStringOrBuffer)(data)) {
      throw new Error('prepareAsymmetricKey: key is not a string or ArrayBuffer');
    }

    const isPublic = ctx === KeyInputContext.kConsumePrivate || ctx === KeyInputContext.kCreatePrivate ? false : undefined;
    return {
      data: (0, _Utils.binaryLikeToArrayBuffer)(data, encoding),
      ...parseKeyEncoding(key, undefined, isPublic)
    };
  }

  throw new Error('[prepareAsymetricKey] Invalid argument key: ${key}');
} // TODO(osp) any here is a node KeyObject


function preparePrivateKey(key) {
  return prepareAsymmetricKey(key, KeyInputContext.kConsumePrivate);
} // TODO(osp) any here is a node KeyObject


function preparePublicOrPrivateKey(key) {
  return prepareAsymmetricKey(key, KeyInputContext.kConsumePublic);
} // Parses the public key encoding based on an object. keyType must be undefined
// when this is used to parse an input encoding and must be a valid key type if
// used to parse an output encoding.


function parsePublicKeyEncoding(enc, keyType, objName) {
  return parseKeyEncoding(enc, keyType, keyType ? true : undefined, objName);
} // Parses the private key encoding based on an object. keyType must be undefined
// when this is used to parse an input encoding and must be a valid key type if
// used to parse an output encoding.


function parsePrivateKeyEncoding(enc, keyType, objName) {
  return parseKeyEncoding(enc, keyType, false, objName);
}
//# sourceMappingURL=keys.js.map