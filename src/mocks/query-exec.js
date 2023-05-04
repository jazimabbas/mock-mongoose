const handleMock = require('./handle-mock');

module.exports = function (cb) {
  return handleMock.call(this, cb);
};
