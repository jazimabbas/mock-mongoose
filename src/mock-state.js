let mocks = {};

module.exports = {
  /**
   * Set Model in the mocks
   */
  setMock(modelName, mockValue, operation = 'find') {
    if (!mocks[modelName]) mocks[modelName] = {};

    mocks[modelName][operation] = mockValue;
  },

  /**
   * - Get the mock from either Model or Model's operation
   * - e.g. Model.find
   */
  getMock(modelName, operation) {
    _throwErrorIfModelNotExists(modelName);

    if (operation) return mocks[modelName][operation];
    return mocks[modelName];
  },

  /**
   * Reset mock can be entire Model or Model's operation
   */
  reset(modelName, operation) {
    _throwErrorIfModelNotExists(modelName);

    if (operation) delete mocks[modelName][operation];
    else delete mocks[modelName];
  },

  /**
   * Reset all the mocks
   */
  resetAll() {
    mocks = {};
  },
};

// ********** HELPERS **********
function _throwErrorIfModelNotExists(modelName) {
  if (!mocks[modelName]) throw new Error(`${modelName} Model is not found`);
}
