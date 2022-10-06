"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuickCrypto = void 0;

var pbkdf2 = _interopRequireWildcard(require("./pbkdf2"));

var random = _interopRequireWildcard(require("./random"));

var _Cipher = require("./Cipher");

var _sig = require("./sig");

var _Hmac = require("./Hmac");

var _Hash = require("./Hash");

var _constants = require("./constants");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const QuickCrypto = {
  createHmac: _Hmac.createHmac,
  Hmac: _Hmac.createHmac,
  Hash: _Hash.createHash,
  createHash: _Hash.createHash,
  createCipher: _Cipher.createCipher,
  createCipheriv: _Cipher.createCipheriv,
  createDecipher: _Cipher.createDecipher,
  createDecipheriv: _Cipher.createDecipheriv,
  publicEncrypt: _Cipher.publicEncrypt,
  publicDecrypt: _Cipher.publicDecrypt,
  privateDecrypt: _Cipher.privateDecrypt,
  generateKeyPair: _Cipher.generateKeyPair,
  generateKeyPairSync: _Cipher.generateKeyPairSync,
  createSign: _sig.createSign,
  createVerify: _sig.createVerify,
  constants: _constants.constants,
  ...pbkdf2,
  ...random
};
exports.QuickCrypto = QuickCrypto;
//# sourceMappingURL=QuickCrypto.js.map