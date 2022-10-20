"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pbkdf2 = pbkdf2;
exports.pbkdf2Sync = pbkdf2Sync;

var _NativeQuickCrypto = require("./NativeQuickCrypto/NativeQuickCrypto");

var _reactNativeBuffer = require("@craftzdog/react-native-buffer");

var _Utils = require("./Utils");

const WRONG_PASS = 'Password must be a string, a Buffer, a typed array or a DataView';
const WRON_SALT = `Salt must be a string, a Buffer, a typed array or a DataView`;

function sanitizeInput(input, errorMsg) {
  try {
    return (0, _Utils.binaryLikeToArrayBuffer)(input);
  } catch (e) {
    throw errorMsg;
  }
}

const nativePbkdf2 = _NativeQuickCrypto.NativeQuickCrypto.pbkdf2;

function pbkdf2(password, salt, iterations, keylen, arg0, arg1) {
  let digest = 'sha1';
  let callback;

  if (typeof arg0 === 'string') {
    digest = arg0;

    if (typeof arg1 === 'function') {
      callback = arg1;
    }
  } else {
    if (typeof arg0 === 'function') {
      callback = arg0;
    }
  }

  if (callback === undefined) {
    throw new Error('No callback provided to pbkdf2');
  }

  const sanitizedPassword = sanitizeInput(password, WRONG_PASS);
  const sanitizedSalt = sanitizeInput(salt, WRON_SALT);
  nativePbkdf2.pbkdf2(sanitizedPassword, sanitizedSalt, iterations, keylen, digest).then(res => {
    callback(null, _reactNativeBuffer.Buffer.from(res));
  }, e => {
    callback(e);
  });
}

function pbkdf2Sync(password, salt, iterations, keylen, digest) {
  const sanitizedPassword = sanitizeInput(password, WRONG_PASS);
  const sanitizedSalt = sanitizeInput(salt, WRON_SALT);
  const algo = digest ? digest : 'sha1';
  let result = nativePbkdf2.pbkdf2Sync(sanitizedPassword, sanitizedSalt, iterations, keylen, algo);
  return _reactNativeBuffer.Buffer.from(result);
}
//# sourceMappingURL=pbkdf2.js.map