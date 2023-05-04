const handleMock = require('./handle-mock');

module.exports = function (methodName) {
  return function (options, cb) {
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
  };
};
