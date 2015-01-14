function Ev (scope) {

  var EXPECTED_NUMBER = 'expected a number';
  var EXPECTED_STRING_ID = 'id must be a string';
  var EXPECTED_FUNCTION_CALLBACK = 'listener must be a function';

  var _defaultMaxListeners  = 10;

  /**
   * Adds EventEmitter functionality for the given scope.
   * @function
   * @param {*} scope
   * @returns {*} scope
   */

  (function (scope) {
    var cbs = {};

    var maxListeners = _defaultMaxListeners;

    scope._ev_maxWarning = {};
    scope.dedupListener = false;

    /**
     * @function
     * @param {number} i
     */

    scope.setMaxListeners = function (i) {
      if (typeof i !== 'number') throw new Error(EXPECTED_NUMBER);
      if (i < 0 || i !== ~~i) throw new Error(EXPECTED_NUMBER);
      maxListeners = i;
    };

    /**
     * @function
     * @param {string} id
     * @returns {function[]}
     */

    scope.listeners = function (id) {
      if (!id) return cbs;
      return cbs[id] || [];
    };

    /**
     * @function
     * @param {string} id
     * @param {function} cb
     * @param {boolean} unique
     */

    scope.bind = function bind (id, cb, unique) {
      if (!id) id = 'all';
      if (typeof id !== 'string') throw new Error(EXPECTED_STRING_ID);
      if (typeof cb !== 'function') throw new Error(EXPECTED_FUNCTION_CALLBACK);
      cbs[id] = cbs[id] || [];
      var index = cbs[id].indexOf(cb);
      if (~index && unique) return;
      scope.trigger('newListener', id, cb);
      cbs[id].push(cb);
      scope._ev_maxWarning[id] = false;
      if (!maxListeners) return;
      if (cbs[id].length > maxListeners) {
        console.log('More than ' + maxListeners + ' listeners for ' + id + ' : ' + cbs[id].length );
        scope._ev_maxWarning[id] = true;
      }
    };

    /**
     * @function
     * @param {string} id
     * @param {function} cb
     */

    scope.unbind = function unbind (id, cb) {
      if (typeof id !== 'string' || typeof cb !== 'function') {
        if (id) delete cbs[id];
        else cbs = {};
        return;
      }
      if (!cbs[id]) return;
      var i = cbs[id].indexOf(cb);
      if (i === -1) return;
      cbs[id].splice(i,1);
      if (!cbs[id].length) delete cbs[id];
      scope.trigger('removeListener', id, cb);
    };

    /**
     * @function
     * @param {string} id
     * @param {*} args...
     */

    scope.trigger = function trigger (id) {
      if (typeof id !== 'string' || !id.length) throw new Error(EXPECTED_STRING_ID);
      var args = Array.prototype.slice.apply(arguments);
      function _callCallbacks (ctx, callbacks) {
        var l = callbacks.length;
        var fns = [];
        for (var i=0; i < l; ++i) {
          if (callbacks[i]) {
            fns.push(callbacks[i]);
            if (scope.dedupListener) break;
          }
        }
        l = fns.length;
        for (var j = 0; j < l; ++j) {
          if (fns[j]._onceBound) scope.unbind(id, fns[j]);
          fns[j].apply(ctx, args);
        }
      }

      if (!id) return;
      if (cbs.all) _callCallbacks(scope, cbs.all);
      args.shift();
      if (id === 'error' && !cbs[id]) throw args[0];
      if (!cbs[id]) return;
      _callCallbacks(scope, cbs[id]);
    };

    /**
     * @function
     * @param {string} eventId
     * @param {function} callback
     */

    scope.once = function once (eventId, callback) {
      callback._onceBound = true;
      scope.bind(eventId, callback);
    };

    /* Convenience and compatibility to other event libraries */

    scope.on = scope.bind;
    scope.off = scope.unbind;
    scope.removeListener = scope.unbind;
    scope.removeAllListeners = scope.unbind;
    scope.addListener = scope.addEventListener = scope.bind;
    scope.emit = scope.trigger;

  })(scope);

  return scope;
}

/**
 * @function
 * @param {number} x
 */

Ev.defaultMaxListeners = function (x) {
  _defaultMaxListeners = x;
};

/**
 * @function
 * @param {*} emitter
 * @param {string} eventId
 * @returns {function[]}
 */

Ev.listenerCount = function (emitter, eventId) {
  return emitter.listeners(eventId);
};

module.exports = Ev;
