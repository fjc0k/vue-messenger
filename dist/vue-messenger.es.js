/*!
 * vue-messenger v1.3.0
 * (c) 2018-present fjc0k <fjc0kb@gmail.com> (https://github.com/fjc0k)
 * Released under the MIT License.
 */
function string(value) {
  return value == null ? value : String(value);
}
function number(value) {
  return value == null ? value : Number(value);
}
function integer(value, radix) {
  if (radix === void 0) {
    radix = 10;
  }

  return value == null ? value : parseInt(value, radix);
}
function date(value) {
  return value == null ? value : value instanceof Date ? value : new Date(value);
}

var transforms = /*#__PURE__*/Object.freeze({
  string: string,
  number: number,
  integer: integer,
  date: date
});

var cache = Object.create(null);
function isFunction(fn) {
  return typeof fn === 'function';
}
function upperCaseFirst(str) {
  if (str in cache) return cache[str];
  cache[str] = str[0].toUpperCase() + str.slice(1);
  return cache[str];
}
var transformCache = Object.create(null);
function transform(literal) {
  if (!(literal in transformCache)) {
    var transformName;
    var args;

    if (Array.isArray(literal)) {
      transformName = literal[0];
      args = literal.slice(1);
    } else {
      transformName = literal;
      args = [];
    }

    transformCache[literal] = transforms[transformName] ? function (value) {
      return transforms[transformName].apply(null, [value].concat(args));
    } : function (value) {
      return value;
    };
  }

  return transformCache[literal];
}

/* eslint guard-for-in: 0 */
var index = {
  beforeCreate: function beforeCreate() {
    var ctx = this.$options; // Normalize options.

    if (!ctx.localDataKeys) ctx.localDataKeys = [];
    if (!ctx.methods) ctx.methods = {};
    if (!ctx.watch) ctx.watch = {}; // Normalize model.

    var model = ctx.model || {
      prop: 'value',
      event: 'input' // Get props.

    };
    var props = Object.keys(ctx.props);

    var _loop = function _loop(i) {
      var prop = props[i];
      var shouldProcess = true;
      var shouldEmit = true;
      var event = void 0;

      if (prop === model.prop) {
        event = model.event;
      } else if (ctx.props[prop].sync) {
        event = "update:" + prop;
      } else if (ctx.props[prop].watch) {
        shouldEmit = false;
      } else {
        shouldProcess = false;
      }

      if (shouldProcess) {
        var customTransform = ctx.props[prop].transform;
        var shouldTransform = false;
        var applyTransform;

        if (customTransform) {
          shouldTransform = true;
          applyTransform = isFunction(customTransform) ? function (value) {
            return value == null ? value : customTransform.call(this, value);
          } : transform(customTransform);
        }

        var Prop = upperCaseFirst(prop);
        var localProp = "local" + Prop;
        var transformedProp = "transformed" + Prop;
        var transformedLocalProp = "transformedLocal" + Prop;
        var sendProp = "send" + Prop;
        var onReceiveProp = "onReceive" + Prop;
        var onSendProp = "onSend" + Prop;
        ctx.localDataKeys.push(localProp);

        if (shouldEmit) {
          ctx.methods[sendProp] = function (newValue) {
            // Compatible to Event value.
            if (newValue instanceof Event && newValue.target && newValue.target.value) {
              newValue = newValue.target.value;
            }

            this[localProp] = newValue;
          };
        }

        ctx.watch[prop] = {
          // Immediately receive prop value.
          immediate: true,
          handler: function handler(newValue, oldValue) {
            if ( // If the newValue is equal to the oldValue, ignore it.
            newValue === oldValue || // If the prop-watcher was triggered by the mutation of the localProp, ignore it.
            newValue === this[transformedLocalProp]) {
              this[transformedProp] = newValue;
              return;
            }

            if (isFunction(this[onReceiveProp])) {
              this[onReceiveProp](newValue, function (transformedNewValue) {
                newValue = transformedNewValue;
              }, oldValue, function (transformedOldValue) {
                oldValue = transformedOldValue;
              });
              if (newValue === oldValue || newValue === this[transformedLocalProp]) return;
            }

            if (shouldTransform) {
              newValue = applyTransform.call(this, newValue);
              if (newValue === oldValue || newValue === this[transformedLocalProp]) return;
            }

            this[transformedProp] = newValue;
            this[localProp] = newValue;
          }
        };
        ctx.watch[localProp] = {
          immediate: false,
          handler: function handler(newValue, oldValue) {
            if (newValue === oldValue || newValue === this[transformedProp]) return;

            if (isFunction(this[onSendProp])) {
              this[onSendProp](newValue, function (transformedNewValue) {
                newValue = transformedNewValue;
              }, oldValue, function (transformedOldValue) {
                oldValue = transformedOldValue;
              });
              if (newValue === oldValue || newValue === this[transformedProp]) return;
            }

            this[transformedLocalProp] = newValue;

            if (shouldEmit) {
              this.$emit(event, newValue, oldValue);
            }
          }
        };
      }
    };

    for (var i in props) {
      _loop(i);
    }
  },
  data: function data() {
    return this.$options.localDataKeys.reduce(function (data, key) {
      data[key] = null;
      return data;
    }, {});
  }
};

export default index;
