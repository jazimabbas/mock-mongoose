const mongoose = require('mongoose');
const mockProxy = require('../mock-proxy');

module.exports = async function (cb) {
  const {
    op,
    model: { modelName },
    _mongooseOptions = {},
  } = this;
  const Model = mongoose.model(modelName);

  let mock = mockProxy.__mocks[modelName] && mockProxy.__mocks[modelName][op];

  let err = null;

  if (mock instanceof Error) {
    err = mock;
  }

  if (typeof mock === 'function') {
    mock = await mock(this);
  }

  if (!mock && op === 'save') {
    mock = this;
  }

  if (!mock && op === '$save') {
    mock = this;
  }

  if (
    mock &&
    !(mock instanceof Model) &&
    ![
      'remove',
      'deleteOne',
      'deleteMany',
      'update',
      'updateOne',
      'updateMany',
      'count',
      'countDocuments',
      'estimatedDocumentCount',
      'distinct',
    ].includes(op)
  ) {
    mock = Array.isArray(mock)
      ? mock.map((item) => new Model(item))
      : new Model(mock);

    if (op === 'insertMany') {
      if (!Array.isArray(mock)) mock = [mock];

      for (const doc of mock) {
        const e = doc.validateSync();
        if (e) throw e;
      }
    }

    if (_mongooseOptions.lean || _mongooseOptions.rawResult) {
      mock = Array.isArray(mock)
        ? mock.map((item) => item.toObject())
        : mock.toObject();
    }
  }

  if (cb) {
    return cb(err, mock);
  }

  if (err) {
    throw err;
  }

  return mock;
};
