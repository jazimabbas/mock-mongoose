const mongoose = require('mongoose');
const sinon = require('sinon');

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

const mockedReturn = async function (cb) {
  const {
    op,
    model: { modelName },
    _mongooseOptions = {},
  } = this;
  const Model = mongoose.model(modelName);

  let mock =
    mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName][op];

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

sinon.stub(mongoose.Query.prototype, 'exec').callsFake(function (cb) {
  return mockedReturn.call(this, cb);
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
    mockingoose.__mocks[modelName] && mockingoose.__mocks[modelName].aggregate;

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
    return mockedReturn.call(this, cb);
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

          const ret = mockedReturn.call(this, cb);

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

// extend a plain function, we will override it with the Proxy later
const proxyTarget = Object.assign(() => void 0, {
  __mocks: {},
  resetAll() {
    this.__mocks = {};
  },
  toJSON() {
    return this.__mocks;
  },
});

const getMockController = (prop) => {
  return {
    toReturn(o, op = 'find') {
      proxyTarget.__mocks.hasOwnProperty(prop)
        ? (proxyTarget.__mocks[prop][op] = o)
        : (proxyTarget.__mocks[prop] = { [op]: o });

      return this;
    },

    reset(op) {
      if (op) {
        delete proxyTarget.__mocks[prop][op];
      } else {
        delete proxyTarget.__mocks[prop];
      }

      return this;
    },

    toJSON() {
      return proxyTarget.__mocks[prop] || {};
    },
  };
};

const proxyTraps = {
  get(target, prop) {
    if (target.hasOwnProperty(prop)) {
      return Reflect.get(target, prop);
    }

    return getMockController(prop);
  },
  apply: (target, thisArg, [prop]) => mockModel(prop),
};

const mockingoose = new Proxy(proxyTarget, proxyTraps);

/**
 * Returns a helper with which you can set up mocks for a particular Model
 */
const mockModel = (model) => {
  const modelName = typeof model === 'function' ? model.modelName : model;
  if (typeof modelName === 'string') {
    return getMockController(modelName);
  } else {
    throw new Error('model must be a string or mongoose.Model');
  }
};

module.exports = mockingoose;
