const mockProxy = require('../mock-proxy');

module.exports = async function (cb) {
  const {
    _model: { modelName },
  } = this;

  let mock =
    mockProxy.__mocks[modelName] && mockProxy.__mocks[modelName].aggregate;

  let err = null;

  if (mock instanceof Error) {
    err = mock;
  }

  if (typeof mock === 'function') {
    mock = await mock(this);
  }

  if (cb) {
    return cb(err, mock);
  }

  if (err) {
    throw err;
  }

  return mock;
};
