module.exports = function (err) {
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
};
