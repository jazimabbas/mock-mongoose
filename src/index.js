const sinon = require('sinon');
const mongoose = require('mongoose');

const mockProxy = require('./mock-proxy');
const mockOrFailOp = require('./mocks/orFail-op');
const mockExecQuery = require('./mocks/query-exec');
const mockInsertManyOp = require('./mocks/insertMany-op');
const mockExecAggregate = require('./mocks/aggregate-exec');
const mockModelInstances = require('./mocks/model-instances');

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

sinon.stub(mongoose.Query.prototype, 'exec').callsFake(mockExecQuery);

sinon.stub(mongoose.Query.prototype, 'orFail').callsFake(mockOrFailOp);

sinon.stub(mongoose.Aggregate.prototype, 'exec').callsFake(mockExecAggregate);

sinon.stub(mongoose.Model, 'insertMany').callsFake(mockInsertManyOp);

const instances = ['save', '$save', 'updateOne', 'deleteOne'];

instances.forEach((methodName) => {
  sinon
    .stub(mongoose.Model.prototype, methodName)
    .callsFake(mockModelInstances(methodName));
});

module.exports = mockProxy;
