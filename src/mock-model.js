const mockState = require('./mock-state');

export default function mockModel() {
  const modelName = typeof model === 'function' ? model.modelName : model;

  return {
    toReturn(mockValue, operation = 'find') {
      mockState.setMock(modelName, mockValue, operation);
      return this;
    },
    reset(operation) {
      mockState.reset(modelName, operation);
      return this;
    },
    toJSON(operation) {
      return mockState.getMock(modelName, operation);
    },
  };
}
