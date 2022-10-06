"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactNativeBuffer = require("@craftzdog/react-native-buffer");

var _QuickCrypto = require("./QuickCrypto");

var _cryptoBrowserify = _interopRequireDefault(require("crypto-browserify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @ts-expect-error Buffer does not match exact same type definition.
global.Buffer = _reactNativeBuffer.Buffer;
const crypto = { ..._cryptoBrowserify.default,
  ..._QuickCrypto.QuickCrypto
}; // for randombytes https://github.com/crypto-browserify/randombytes/blob/master/browser.js#L16
// @ts-expect-error QuickCrypto is missing `subtle` and `randomUUID`

global.crypto = crypto;
module.exports = crypto;
var _default = crypto;
exports.default = _default;
//# sourceMappingURL=index.js.map