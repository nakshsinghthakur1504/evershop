const { error } = require('@evershop/evershop/src/lib/log/logger');
const { setDelegate } = require('./delegate');

// eslint-disable-next-line no-multi-assign
module.exports = exports = {};

exports.asyncMiddlewareWrapper = async function asyncMiddlewareWrapper(
  id,
  middlewareFunc,
  request,
  response,
  delegates,
  next
) {
  const startTime = process.hrtime();
  const debuging = {
    id
  };
  response.debugMiddlewares.push(debuging);
  try {
    // If the middleware function has the next function as a parameter
    let delegate;
    if (middlewareFunc.length === 4) {
      delegate = middlewareFunc(request, response, delegates, (err) => {
        const endTime = process.hrtime(startTime);
        debuging.time = endTime[1] / 1000000;
        next(err);
      });
    } else {
      delegate = middlewareFunc(request, response, delegates);
      const endTime = process.hrtime(startTime);
      debuging.time = endTime[1] / 1000000;
    }
    setDelegate(id, delegate, request);
    await delegate;
  } catch (e) {
    // Log the error
    e.message = `Exception in middleware ${id}: ${e.message}`;
    error(e);
    // Call error handler middleware if it is not called yet
    next(e);
  }
};
