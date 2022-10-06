import { NativeQuickCrypto } from './NativeQuickCrypto/NativeQuickCrypto';
import { Buffer } from '@craftzdog/react-native-buffer';
import { binaryLikeToArrayBuffer } from './Utils';
const WRONG_PASS = 'Password must be a string, a Buffer, a typed array or a DataView';
const WRON_SALT = `Salt must be a string, a Buffer, a typed array or a DataView`;

function sanitizeInput(input, errorMsg) {
  try {
    return binaryLikeToArrayBuffer(input);
  } catch (e) {
    throw errorMsg;
  }
}

const nativePbkdf2 = NativeQuickCrypto.pbkdf2;
export function pbkdf2(password, salt, iterations, keylen, arg0, arg1) {
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
    callback(null, Buffer.from(res));
  }, e => {
    callback(e);
  });
}
export function pbkdf2Sync(password, salt, iterations, keylen, digest) {
  const sanitizedPassword = sanitizeInput(password, WRONG_PASS);
  const sanitizedSalt = sanitizeInput(salt, WRON_SALT);
  const algo = digest ? digest : 'sha1';
  let result = nativePbkdf2.pbkdf2Sync(sanitizedPassword, sanitizedSalt, iterations, keylen, algo);
  return Buffer.from(result);
}
//# sourceMappingURL=pbkdf2.js.map