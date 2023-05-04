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
  apply: (_target, _thisArg, [prop]) => mockModel(prop),
};

const mockify = new Proxy(proxyTarget, proxyTraps);

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

module.exports = mockify;
