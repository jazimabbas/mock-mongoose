const handleMock = require('./handle-mock');

module.exports = function (_arr, options, cb) {
  const op = 'insertMany';
  const { modelName } = this;

  if (typeof options === 'function') {
    cb = options;
    options = null;
  } else {
    this._mongooseOptions = options;
  }

  Object.assign(this, { op, model: { modelName } });
  return handleMock.call(this, cb);
};
