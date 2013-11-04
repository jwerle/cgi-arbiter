
const HANDSHAKE = 'HANDSHAKE\n';

/**
 * Module dependencies
 */

var amp = require('amp')
  , Message = require('amp-message')
  , through = require('through')
  , Readable = require('stream').Readable
  , Writable = require('stream').Writable


/**
 * Defines the cgi-arbiter protocol
 *
 * @api public
 */

module.exports = Protocol;
function Protocol (source, options) {
  if (!(this instanceof Protocol)) {
    return new Protocol(source, options);
  }

  var self = this;
  options = options || {};
  Readable.call(this);
  Writable.call(this);

  this.version = options.version || 0x1;
  this._source = source;
  this._inHeader = false;
  this._inBody = false;
  this._buffer = [];

  source.on('connect', function () {
    self.write(HANDSHAKE);
  });

  source.on('data', function (chunk) {
    self._buffer.push(chunk);
    self.emit('data', chunk);
  })

  source.on('readable', function () {
    self.emit('readable');
  });

  source.on('end', function () {
    self.emit('end');
  });
}

// inherit from `Readable`
Protocol.prototype.__proto__ = Readable.prototype;

// implements `_read'
Protocol.prototype._read = function (size) {
  return this._buffer.shift() || null;
};

// implements `_write`
Protocol.prototype.write = function (chunk) {
  var buf = this.encode(chunk);
  this._source.write(buf);
};

// implements `end`
Protocol.prototype.end = function (chunk) {
  this._source.end(this.encode(chunk));
};


/**
 * Encodes a message
 *   ver | length | data
 *
 * @api public
 */

Protocol.prototype.encode = function (chunk) {
  if (false == Buffer.isBuffer(chunk)) {
    chunk = Buffer(chunk);
  }

  return amp.encode([chunk]);
};

/**
 * Decodes a message
 *
 * @api public
 */

Protocol.prototype.decode = function (buf) {
  return amp.decode(buf);
};
/**
 * Initiates a exchange prototype
 *
 * @api public
 */

Protocol.prototype.exchange = function () {

};
/**
 * Creates a thunk for a socket
 * connection callback
 *
 * @api public
 */

module.exports.create = create;
function create (fn) {
  return function (sock) {
    var stream = Protocol(sock);
    fn(stream);
  }
}

/**
 * Creates a through stream
 *
 * @api public
 */

module.exports.local = local;
function local () {
  var stream = through();
  return stream;
}
