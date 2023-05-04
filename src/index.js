const mongoose = require('mongoose');
const sinon = require('sinon');
const mockProxy = require('./mock-proxy');
const handleMock = require('./handle-mock');

if (!/^5/.test(mongoose.version)) {
  mongoose.Promise = Promise;
}

sinon.stub(mongoose, 'connect').resolves();

sinon.stub(mongoose, 'createConnection').returns({
  catch() {
    /* no op */
  },
  model: mongoose.model.bind(mongoose),
  on: sinon.stub(),
  once: sinon.stub(),
  then(resolve) {
    return Promise.resolve(resolve(this));
  },
});

sinon.stub(mongoose.Query.prototype, 'exec').callsFake(function (cb) {
  return handleMock.call(this, cb);
});

sinon.stub(mongoose.Query.prototype, 'orFail').callsFake(function (err) {
  return this.then((doc) => {
    const hasAnyDocs = doc && Array.isArray(doc) && doc.length > 0;

    if (!doc || !hasAnyDocs) {
      if (!err) throw new Error();

      const isErrorFn = typeof err === 'function';
      throw isErrorFn ? err() : new Error(err);
    }

    return this;
  }).catch((err) => {
    throw err;
  });
});

sinon.stub(mongoose.Aggregate.prototype, 'exec').callsFake(async function (cb) {
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
});

sinon
  .stub(mongoose.Model, 'insertMany')
  .callsFake(function (_arr, options, cb) {
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
  });

const instance = ['save', '$save', 'updateOne', 'deleteOne'];

instance.forEach((methodName) => {
  sinon
    .stub(mongoose.Model.prototype, methodName)
    .callsFake(function (options, cb) {
      const op = methodName;
      const { modelName } = this.constructor;

      if (typeof options === 'function') {
        cb = options;
      }

      Object.assign(this, { op, model: { modelName } });

      const hooks = this.constructor.hooks;

      return new Promise((resolve, reject) => {
        hooks.execPre(op, this, [cb], (err) => {
          if (err) {
            reject(err);
            return;
          }

          const ret = handleMock.call(this, cb);

          if (cb) {
            hooks.execPost(op, this, [ret], (err2) => {
              if (err2) {
                reject(err2);
                return;
              }

              resolve(ret);
            });
          } else {
            ret
              .then((ret2) => {
                hooks.execPost(op, this, [ret2], (err3) => {
                  if (err3) {
                    reject(err3);
                    return;
                  }

                  resolve(ret2);
                });
              })
              .catch(reject);
          }
        });
      });
    });
});

module.exports = mockProxy;
