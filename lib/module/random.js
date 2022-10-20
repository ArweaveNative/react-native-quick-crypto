import { NativeQuickCrypto } from './NativeQuickCrypto/NativeQuickCrypto';
import { Buffer } from '@craftzdog/react-native-buffer';
const random = NativeQuickCrypto.random;
export function randomFill(buffer) {
  var _ref, _ref2;

  if (typeof (_ref = (arguments.length <= 1 ? 0 : arguments.length - 1) - 1 + 1, _ref < 1 || arguments.length <= _ref ? undefined : arguments[_ref]) !== 'function') {
    throw new Error('No callback provided to randomDill');
  }

  const callback = (_ref2 = (arguments.length <= 1 ? 0 : arguments.length - 1) - 1 + 1, _ref2 < 1 || arguments.length <= _ref2 ? undefined : arguments[_ref2]);
  let offset = 0;
  let size = buffer.byteLength;

  if (typeof (arguments.length <= 3 ? undefined : arguments[3]) === 'function') {
    offset = arguments.length <= 1 ? undefined : arguments[1];
    size = arguments.length <= 2 ? undefined : arguments[2];
  }

  if (typeof (arguments.length <= 2 ? undefined : arguments[2]) === 'function') {
    offset = arguments.length <= 1 ? undefined : arguments[1];
  }

  random.randomFill(Buffer.isBuffer(buffer) ? buffer.buffer : buffer, offset, size).then(() => {
    callback(null, buffer);
  }, e => {
    callback(e);
  });
}
export function randomFillSync(buffer) {
  let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  let size = arguments.length > 2 ? arguments[2] : undefined;
  random.randomFillSync(buffer.buffer ? buffer.buffer : buffer, offset, size !== null && size !== void 0 ? size : buffer.byteLength);
  return buffer;
}
export function randomBytes(size, callback) {
  const buf = new Buffer(size);

  if (callback === undefined) {
    randomFillSync(buf.buffer, 0, size);
    return buf;
  }

  randomFill(buf.buffer, 0, size, error => {
    if (error) {
      callback(error);
    }

    callback(null, buf);
  });
}
export const rng = randomBytes;
export const pseudoRandomBytes = randomBytes;
export const prng = randomBytes;
// The rest of the file is taken from https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js
// Largest integer we can read from a buffer.
// e.g.: Buffer.from("ff".repeat(6), "hex").readUIntBE(0, 6);
const RAND_MAX = 0xffffffffffff; // Cache random data to use in randomInt. The cache size must be evenly
// divisible by 6 because each attempt to obtain a random int uses 6 bytes.

const randomCache = new Buffer(6 * 1024);
let randomCacheOffset = randomCache.length;
let asyncCacheFillInProgress = false;
const asyncCachePendingTasks = []; // Generates an integer in [min, max) range where min is inclusive and max is
// exclusive.

export function randomInt(arg1, arg2, callback) {
  // Detect optional min syntax
  // randomInt(max)
  // randomInt(max, callback)
  let max;
  let min;
  const minNotSpecified = typeof arg2 === 'undefined' || typeof arg2 === 'function';

  if (minNotSpecified) {
    callback = arg2;
    max = arg1;
    min = 0;
  } else {
    min = arg1;
    max = arg2;
  }

  const isSync = typeof callback === 'undefined';

  if (!Number.isSafeInteger(min)) {
    // todo throw new ERR_INVALID_ARG_TYPE('min', 'a safe integer', min);
    throw 'ERR_INVALID_ARG_TYPE';
  }

  if (!Number.isSafeInteger(max)) {
    // todo throw new ERR_INVALID_ARG_TYPE('max', 'a safe integer', max);
    throw 'ERR_INVALID_ARG_TYPE';
  }

  if (max <= min) {
    /* todo throw new ERR_OUT_OF_RANGE(
      'max',
      `greater than the value of "min" (${min})`,
      max
    );*/
    throw 'ERR_OUT_OF_RANGE';
  } // First we generate a random int between [0..range)


  const range = max - min;

  if (!(range <= RAND_MAX)) {
    /* todo throw new ERR_OUT_OF_RANGE(
      `max${minNotSpecified ? '' : ' - min'}`,
      `<= ${RAND_MAX}`,
      range
    );*/
    throw 'ERR_OUT_OF_RANGE';
  } // For (x % range) to produce an unbiased value greater than or equal to 0 and
  // less than range, x must be drawn randomly from the set of integers greater
  // than or equal to 0 and less than randLimit.


  const randLimit = RAND_MAX - RAND_MAX % range; // If we don't have a callback, or if there is still data in the cache, we can
  // do this synchronously, which is super fast.

  while (isSync || randomCacheOffset < randomCache.length) {
    if (randomCacheOffset === randomCache.length) {
      // This might block the thread for a bit, but we are in sync mode.
      randomFillSync(randomCache);
      randomCacheOffset = 0;
    }

    const x = randomCache.readUIntBE(randomCacheOffset, 6);
    randomCacheOffset += 6;

    if (x < randLimit) {
      const n = x % range + min;
      if (isSync) return n;
      process.nextTick(callback, undefined, n);
      return;
    }
  } // At this point, we are in async mode with no data in the cache. We cannot
  // simply refill the cache, because another async call to randomInt might
  // already be doing that. Instead, queue this call for when the cache has
  // been refilled.


  if (callback !== undefined) {
    // it is (typescript doesn't know it)
    asyncCachePendingTasks.push({
      min,
      max,
      callback
    });
    asyncRefillRandomIntCache();
  }
}

function asyncRefillRandomIntCache() {
  if (asyncCacheFillInProgress) return;
  asyncCacheFillInProgress = true;
  randomFill(randomCache, err => {
    asyncCacheFillInProgress = false;
    const tasks = asyncCachePendingTasks;
    const errorReceiver = err && tasks.shift();
    if (!err) randomCacheOffset = 0; // Restart all pending tasks. If an error occurred, we only notify a single
    // callback (errorReceiver) about it. This way, every async call to
    // randomInt has a chance of being successful, and it avoids complex
    // exception handling here.

    tasks.splice(0).forEach(task => {
      randomInt(task.min, task.max, task.callback);
    }); // This is the only call that might throw, and is therefore done at the end.

    if (errorReceiver) errorReceiver.callback(err, 0);
  });
} // Really just the Web Crypto API alternative
// to require('crypto').randomFillSync() with an
// additional limitation that the input buffer is
// not allowed to exceed 65536 bytes, and can only
// be an integer-type TypedArray.


export function getRandomValues(data) {
  if (data.byteLength > 65536) {
    throw new Error('The requested length exceeds 65,536 bytes');
  }

  randomFillSync(data, 0);
  return data;
}
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
} // Based on https://github.com/uuidjs/uuid/blob/main/src/v4.js


export function randomUUID() {
  const size = 16;
  const buffer = new Buffer(size);
  randomFillSync(buffer, 0, size); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  buffer[6] = buffer[6] & 0x0f | 0x40;
  buffer[8] = buffer[8] & 0x3f | 0x80;
  return (byteToHex[buffer[0]] + byteToHex[buffer[1]] + byteToHex[buffer[2]] + byteToHex[buffer[3]] + '-' + byteToHex[buffer[4]] + byteToHex[buffer[5]] + '-' + byteToHex[buffer[6]] + byteToHex[buffer[7]] + '-' + byteToHex[buffer[8]] + byteToHex[buffer[9]] + '-' + byteToHex[buffer[10]] + byteToHex[buffer[11]] + byteToHex[buffer[12]] + byteToHex[buffer[13]] + byteToHex[buffer[14]] + byteToHex[buffer[15]]).toLowerCase();
}
//# sourceMappingURL=random.js.map