const mongoose = require('mongoose');
const mockify = require('../src');
const User = require('./User');

jest.setTimeout(500);

describe('mock-mongoose', () => {
  beforeEach(() => {
    mockify.resetAll();
    jest.clearAllMocks();
  });

  describe('explicit tests', () => {
    it('should validate', async () => {
      const user = new User({
        email: 'user@email.com',
        name: 'user',
      });

      await user.validate();
      expect(user.toObject()).toHaveProperty('created');
      expect(user.toObject()).toHaveProperty('_id');
    });

    it('should lean', async () => {
      mockify(User).toReturn([{ name: '2' }]);

      const result = await User.find().lean();
      expect(result[0]).toMatchObject({ name: '2' });
    });

    it('should find', async () => {
      mockify(User).toReturn([{ name: '2' }]);

      const result = await User.find().where('name').in([1]);
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('_id');
      expect(result[0].toObject()).toHaveProperty('created');
      expect(result[0].toObject()).toMatchObject({ name: '2' });
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should work with function that is not an instance of a function', async () => {
      const returnMock = jest.fn().mockReturnValue({ name: '2' });
      mockify(User).toReturn(returnMock, 'findOne');

      const result = await User.findOne();
      expect(result.toObject()).toHaveProperty('_id');
      expect(result.toObject()).toHaveProperty('created');
      expect(result.toObject()).toMatchObject({ name: '2' });
      expect(result).toBeInstanceOf(User);
    });

    it('should work with mockify(User)', async () => {
      const returnMock = jest.fn().mockReturnValue({ name: '2' });
      mockify(User).toReturn(returnMock, 'findOne');

      const result = await User.findOne();
      expect(result.toObject()).toHaveProperty('_id');
      expect(result.toObject()).toHaveProperty('created');
      expect(result.toObject()).toMatchObject({ name: '2' });
      expect(result).toBeInstanceOf(User);
    });

    it('should find with mockify(model) with string', async () => {
      mockify(User.modelName).toReturn([{ name: '2' }]);

      const result = await User.find().where('name').in([1]);
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('_id');
      expect(result[0].toObject()).toHaveProperty('created');
      expect(result[0].toObject()).toMatchObject({ name: '2' });
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should find with function', async () => {
      mockify(User).toReturn((query) => {
        expect(query.getFilter()).toMatchObject({ name: { $in: [1] } });
        return [{ name: '2' }];
      });

      const result = await User.find({ name: 'a' }).where('name').in([1]);
      expect(result).toHaveLength(1);
      expect(result[0].toObject()).toHaveProperty('_id');
      expect(result[0].toObject()).toHaveProperty('created');
      expect(result[0].toObject()).toMatchObject({ name: '2' });
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should not find', async () => {
      mockify(User).toReturn([]);

      const result = await User.find();
      expect(result).toHaveLength(0);
    });

    it('should not findOne', async () => {
      mockify(User).toReturn(null, 'findOne');

      const result = await User.findOne();
      expect(result).toBeFalsy();
    });

    it('should findById', async () => {
      const docObj = { name: 'name' };
      mockify(User).toReturn(docObj, 'findOne');

      const doc = await User.findById(1);
      expect(doc.toObject()).toMatchObject(docObj);
    });

    it('should findById with function', async () => {
      const docObj = { name: 'name' };

      mockify(User).toReturn((query) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return docObj;
      }, 'findOne');

      const doc = await User.findById(1);
      expect(doc.toObject()).toMatchObject(docObj);
    });

    it('should count', async () => {
      const count = 2;
      mockify(User).toReturn(count, 'count');

      const result = await User.count({});
      expect(result).toBe(count);
    });

    it('should count with function', async () => {
      const count = 2;
      mockify(User).toReturn((query) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return count;
      }, 'count');

      const result = await User.count({});
      expect(result).toBe(count);
    });

    it('should countDocuments', async () => {
      const count = 2;
      mockify(User).toReturn(count, 'countDocuments');

      const result = await User.countDocuments();
      expect(result).toBe(count);
    });

    it('should countDocuments with function', async () => {
      const count = 2;
      mockify(User).toReturn((query) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return count;
      }, 'countDocuments');

      const result = await User.countDocuments();
      expect(result).toBe(count);
    });

    it('should estimatedDocumentCount', async () => {
      const count = 2;
      mockify(User).toReturn(count, 'estimatedDocumentCount');

      const result = await User.estimatedDocumentCount();
      expect(result).toBe(count);
    });

    it('should estimatedDocumentCount with function', async () => {
      const count = 2;
      mockify(User).toReturn((query) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return count;
      }, 'estimatedDocumentCount');

      const result = await User.estimatedDocumentCount();
      expect(result).toBe(count);
    });

    it('should count exec and cb', (done) => {
      const count = 2;
      mockify(User).toReturn(count, 'count');

      User.count({}).exec((err, result) => {
        expect(result).toBe(count);
        done();
      });
    });

    it('should countDocuments exec and cb', (done) => {
      const count = 2;
      mockify(User).toReturn(count, 'countDocuments');

      User.countDocuments().exec((err, result) => {
        expect(result).toBe(count);
        done();
      });
    });

    it('should estimatedDocumentCount exec and cb', (done) => {
      const count = 2;
      mockify(User).toReturn(count, 'estimatedDocumentCount');

      User.estimatedDocumentCount().exec((err, result) => {
        expect(result).toBe(count);
        done();
      });
    });

    it('should distinct with simple array', (done) => {
      const distinct = ['a', 'b'];
      mockify(User).toReturn(distinct, 'distinct');

      User.distinct('name').exec((err, result) => {
        expect(result).toBe(distinct);
        done();
      });
    });

    it('should update with exec and callback', (done) => {
      mockify(User).toReturn({ ok: 1, nModified: 1, n: 1 }, 'updateMany');

      User.updateMany({ email: 'name@mail.com' }, {})
        .where('name', 'name')
        .exec((err, result) => {
          expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
          done();
        });
    });

    it('should update with exec and callback with function', (done) => {
      mockify(User).toReturn((query) => {
        expect(query).toBeInstanceOf(mongoose.Query);
        return { ok: 1, nModified: 1, n: 1 };
      }, 'updateMany');

      User.updateMany({ email: 'name@mail.com' }, {})
        .where('name', 'name')
        .exec((err, result) => {
          expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
          done();
        });
    });

    // DEPRICATED
    it.skip('should update with callback', (done) => {
      mockify(User).toReturn({ ok: 1, nModified: 1, n: 1 }, 'updateOne');

      User.updateOne(
        { name: 'name' },
        { email: 'name@mail.com' },
        {},
        (err, result) => {
          expect(result).toEqual({ ok: 1, nModified: 1, n: 1 });
          done();
        }
      );
    });

    // DEPRICATED
    it.skip('should aggregate with callback', (done) => {
      mockify(User).toReturn(
        [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }],
        'aggregate'
      );

      User.aggregate(
        [
          {
            $group: {
              _id: {
                accountId: '$accountId',
              },
            },
          },
        ],
        (err, result) => {
          expect(result).toEqual([
            { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
          ]);
          done();
        }
      );
    });

    // DEPRICATED
    it.skip('should aggregate with callback using function', (done) => {
      mockify(User).toReturn((agg) => {
        expect(agg).toBeInstanceOf(mongoose.Aggregate);
        return [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }];
      }, 'aggregate');

      User.aggregate(
        [
          {
            $group: {
              _id: {
                accountId: '$accountId',
              },
            },
          },
        ],
        (err, result) => {
          expect(result).toEqual([
            { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
          ]);
          done();
        }
      );
    });

    it('should aggregate with exec and callback', (done) => {
      mockify(User).toReturn(
        [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }],
        'aggregate'
      );

      User.aggregate([
        {
          $group: {
            _id: {
              accountId: '$accountId',
            },
          },
        },
      ]).exec((err, result) => {
        expect(result).toEqual([
          { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
        ]);
        done();
      });
    });

    it('should aggregate with promise', async () => {
      mockify(User).toReturn(
        [{ _id: { accountId: '5aef17c3d7c488f401c101bd' } }],
        'aggregate'
      );

      const result = await User.aggregate([
        {
          $group: {
            _id: {
              accountId: '$accountId',
            },
          },
        },
      ]);
      expect(result).toEqual([
        { _id: { accountId: '5aef17c3d7c488f401c101bd' } },
      ]);
    });

    it.skip('should create returns mock', async () => {
      mockify(User).toReturn({ _id: '507f191e810c19729de860ea' }, 'save');

      const result = await User.create({ email: 'name@mail.com' });
      expect(JSON.parse(JSON.stringify(result))).toMatchObject({
        _id: '507f191e810c19729de860ea',
      });
    });

    it('should create returns mongoose document', async () => {
      const result = await User.create({
        email: 'name@mail.com',
        name: 'name',
      });
      expect(result.toObject()).toMatchObject({
        email: 'name@mail.com',
        name: 'name',
      });
    });

    it.skip('should return error', async () => {
      const error = new Error('My Error');
      mockify(User).toReturn(error, 'save');
      await expect(
        User.create({ name: 'name', email: 'name@mail.com' })
      ).rejects.toEqual(error);
    });

    // DEPRICATED
    it.skip('should find with callback', (done) => {
      const docObj = [{ name: 'name' }];
      mockify(User).toReturn(docObj);

      User.find({ _id: 1 }, (err, doc) => {
        expect(err).toBeNull();
        expect(doc[0].toObject()).toMatchObject(docObj[0]);
        done();
      });
    });

    it('should reset a single mock', async () => {
      mockify(User).toReturn({ name: 'name' });
      mockify(User).reset();

      const doc = await User.find();
      expect(doc).toBeFalsy();
    });

    it('should reset a single mock operation', async () => {
      mockify(User).toReturn({ name: 'name' });
      mockify(User).reset('find');

      const doc = await User.find();
      expect(doc).toBeFalsy();
    });

    it('should fail to reset a single mock operation', async () => {
      mockify(User).toReturn([{ name: 'name' }]);
      mockify(User).reset('save');

      const doc = await User.find();
      expect(doc[0].toObject()).toMatchObject({ name: 'name' });
    });

    it('should be able to chain operations', async () => {
      mockify(User)
        .toReturn({ name: 'name' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save');

      const user = await User.findOne();
      expect(user.toObject()).toMatchObject({ name: 'name' });
      user.name = 'another name';
      user.email = 'name@email.com'; // or we will get Schema validation error
      const user1 = await user.save();
      expect(user1.toObject()).toMatchObject({ name: 'another name' });
    });

    it('should return object with .toJSON()', () => {
      mockify(User)
        .toReturn({ name: 'name' })
        .toReturn({ name: 'a name too' }, 'findOne')
        .toReturn({ name: 'another name' }, 'save');

      const mocksString =
        '{"User":{"find":{"name":"name"},"findOne":{"name":"a name too"},"save":{"name":"another name"}}}';
      const mockString =
        '{"find":{"name":"name"},"findOne":{"name":"a name too"},"save":{"name":"another name"}}';

      const mocksObject = {
        User: {
          find: {
            name: 'name',
          },
          findOne: {
            name: 'a name too',
          },
          save: {
            name: 'another name',
          },
        },
      };

      expect(JSON.stringify(mockify)).toBe(mocksString);
      expect(JSON.stringify(mockify(User))).toBe(mockString);
      expect(mockify.toJSON()).toEqual(mocksObject);
    });

    it('should populate the Query properly with findOne', async () => {
      const docObj = {
        _id: '507f191e810c19729de860ea',
        email: 'name@email.com',
        name: 'name',
      };
      const finder = (query) => {
        if (query.getQuery()._id === '507f191e810c19729de860ea') {
          return docObj;
        }
      };

      mockify(User).toReturn(finder, 'findOne'); // findById is findOne

      const doc = await User.findById('507f191e810c19729de860ea');
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(docObj);
    });

    it('should mock .populate', async () => {
      User.schema.path('foreignKey', Object);

      const doc = {
        email: 'test@mail.com',
        foreignKey: {
          _id: '5ca4af76384306089c1c30ba',
          name: 'test',
          value: 'test',
        },
        name: 'Name',
        saveCount: 1,
      };

      mockify(User).toReturn(doc);

      const result = await User.find();

      expect(result).toMatchObject(doc);
    });

    // DEPRICATED
    it.skip('return correct mock for remove', async () => {
      const doc = { n: 0, ok: 0, deletedCount: 0 };
      mockify(User).toReturn(doc, 'remove');

      const result = await User.remove({ name: 'test' });

      expect(result).toBe(doc);
    });

    it('return correct mock for deleteOne', async () => {
      const doc = { n: 0, ok: 0, deletedCount: 0 };
      mockify(User).toReturn(doc, 'deleteOne');

      const result = await User.deleteOne({ name: 'test' });

      expect(result).toBe(doc);
    });

    it('return correct mock for deleteMany', async () => {
      const doc = { n: 1, ok: 1, deletedCount: 10 };
      mockify(User).toReturn(doc, 'deleteOne');

      const result = await User.deleteOne({ name: 'test' });

      expect(result).toBe(doc);
    });

    it('should return error in orFail() if we pass null', async () => {
      mockify(User).toReturn(null, 'findOne');

      await expect(User.findOne().orFail()).rejects.toEqual(new Error());
    });

    it('should return our custom error in orFail() if we pass null', async () => {
      const error = new Error('Empty Document');
      mockify(User).toReturn(error, 'findOne');

      await expect(User.findOne().orFail()).rejects.toEqual(error);
    });

    it('should return error in orFail() with find() if we pass null', async () => {
      mockify(User).toReturn(null, 'find');

      await expect(User.findOne().orFail()).rejects.toEqual(new Error());
    });

    it('should pass orFail() if there are some doc exist', async () => {
      const doc = [{ _id: 'abc' }];
      mockify(User).toReturn(doc, 'find');

      const result = await User.find().orFail();

      expect(result.length).toEqual(doc.length);
    });
  });

  describe('check all instance methods', () => {
    const instanceMethods = ['save'];

    instanceMethods.forEach((op) => {
      it(`${op} resolves its promise correctly`, async () => {
        const mocked = {
          email: 'name@email.com',
          name: op,
        };

        mockify(User).toReturn(mocked, 'findOne').toReturn(mocked, op);

        const user = await User.findOne();
        const user1 = await user[op]();
        expect(user1).toBeTruthy();
      });
    });

    it.skip(`save calls its hook correctly`, () => {
      const mocked = {
        email: 'name@email.com',
        name: 'save',
      };

      mockify(User).toReturn(null, 'save');

      User.create(mocked).then((user) => {
        expect(user.saveCount).toBe(1);
        user.name = 'save2';
        user.save((err, user2) => {
          expect(user2.saveCount).toBe(2);
        });
      });
    });

    it('returns false for exists method', async () => {
      mockify(User).toReturn(null, 'findOne');

      const result = await User.exists({ name: 'test' });

      expect(result).toBeFalsy();
    });

    it('returns true for exists method', async () => {
      mockify(User).toReturn({}, 'findOne');

      const result = await User.exists({ name: 'test' });

      expect(result).toBeTruthy();
    });

    it('returns should correctly mock insertMany', async () => {
      const docs = [{ email: '1' }, { email: '2' }, { email: 3 }];

      mockify(User).toReturn(docs, 'insertMany');

      const result = await User.insertMany(docs);

      expect(result.map((doc) => doc instanceof mongoose.Model)).toStrictEqual([
        true,
        true,
        true,
      ]);
    });

    it('returns should correctly mock insertMany with lean option', async () => {
      const docs = [{ email: '1' }, { email: '2' }, { email: 3 }];

      mockify(User).toReturn(docs, 'insertMany');

      const result = await User.insertMany(docs, { lean: true });

      expect(result.map((doc) => doc instanceof mongoose.Model)).toStrictEqual([
        false,
        false,
        false,
      ]);
    });

    it('returns should correctly mock insertMany with rawResult option', async () => {
      const docs = [{ email: '1' }, { email: '2' }, { email: 3 }];

      mockify(User).toReturn(docs, 'insertMany');

      const result = await User.insertMany(docs, { rawResult: true });

      expect(result.map((doc) => doc instanceof mongoose.Model)).toStrictEqual([
        false,
        false,
        false,
      ]);
    });
  });

  describe('check all operations', () => {
    const ops = [
      'find',
      'findOne',
      'distinct',
      'findOneAndUpdate',
      'findOneAndRemove',
      'findOneAndDelete',
      'findOneAndReplace',
      'remove',
      'update',
      'updateOne',
      'updateMany',
      'deleteOne',
      'deleteMany',
    ];

    describe('with promise', () => {
      ops.forEach((op) => {
        it(op, () => {
          const mocked = {
            name: op,
          };

          mockify(User).toReturn(mocked, op);

          const args = [];

          if (op === 'update') {
            args.push({}, {});
          }

          if (!User[op]) {
            return;
          }

          return User[op](...args).then((doc) =>
            expect(
              doc instanceof mongoose.Model ? doc.toObject() : doc
            ).toMatchObject(mocked)
          );
        });
      });
    });

    describe('with exec and callback', () => {
      ops.forEach((op) => {
        it(op, (done) => {
          const mocked = {
            name: op,
          };

          mockify(User).toReturn(mocked, op);

          const args = [];

          if (['update', 'updateOne', 'updateMany'].includes(op)) {
            args.push({}, {});
          }

          if (!User[op]) {
            done();
            return;
          }

          User[op](...args).exec((err, doc) => {
            expect(err).toBeNull();
            expect(
              doc instanceof mongoose.Model ? doc.toObject() : doc
            ).toMatchObject(mocked);
            done();
          });
        });
      });
    });

    // DEPRICATED
    describe.skip('with callback', () => {
      ops.forEach((op) => {
        it(op, (done) => {
          const mocked = {
            name: op,
          };

          mockify(User).toReturn(mocked, op);

          const args = [];

          switch (op) {
            case 'distinct':
            case 'findOne':
            case 'findOneAndRemove':
            case 'findOneAndDelete':
            case 'findOneAndReplace':
              args.push({});
              break;
            case 'update':
            case 'updateOne':
            case 'updateMany':
            case 'findOneAndUpdate':
              args.push({}, {}, {});
              break;
          }

          args.push((err, doc) => {
            expect(err).toBeNull();
            expect(
              doc instanceof mongoose.Model ? doc.toObject() : doc
            ).toMatchObject(mocked);
            done();
          });

          User[op](...args);
        });
      });
    });
  });

  describe('mongoose connections', () => {
    it('should mock mongoose.connect', async () => {
      await mongoose.connect('mock');
      expect(mongoose.connect.called).toBe(true);
    });

    it('should mock mongoose.createConnection', (done) => {
      mongoose.createConnection('mock').then(() => {
        expect(mongoose.createConnection.called).toBe(true);
        done();
      });
    });

    it('createConnection with callback', () => {
      const conn = mongoose.createConnection('mongodb://localhost/test');

      // tslint:disable-next-line:no-console
      conn.once('open', console.log);
      // tslint:disable-next-line:no-console
      conn.on('error', console.error);

      conn.then((result) => {
        expect(result).toBe(conn);
      });
    });

    it('register models on createConnection instance', (done) => {
      mockify.Model.toReturn({ name: 'test' }, 'save');
      const conn = mongoose.createConnection('mongodb://localhost/test');

      const schema = new mongoose.Schema({
        name: String,
      });

      const Model = conn.model('Model', schema);

      Model.create({ name: 'test' }).then((result) => {
        expect(result.toObject()).toMatchObject({ name: 'test' });
        done();
      });
    });
  });
});
