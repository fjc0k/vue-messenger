/*!
 * vue-messenger v2.2.1
 * (c) 2018-present fjc0k <fjc0kb@gmail.com> (https://github.com/fjc0k)
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueMessenger = factory());
}(this, (function () { 'use strict';

  var isFunction = (function (value) {
    return typeof value === 'function';
  });

  var isNumeric = (function (value) {
    return !isNaN(value - parseFloat(value));
  });

  var isObject = (function (value) {
    return value && typeof value === 'object';
  });

  var cache = Object.create(null);
  var upperCaseFirst = (function (str) {
    if (!(str in cache)) {
      cache[str] = str.charAt(0).toUpperCase() + str.slice(1);
    }

    return cache[str];
  });

  var defaultModel = {
    prop: 'value',
    event: 'input'
  };
  var index = {
    beforeCreate: function beforeCreate() {
      if (this.__MessengerBeforeCreate__) return;
      this.__MessengerBeforeCreate__ = true;
      var options = this.$options;
      if (!options.localDataKeys) options.localDataKeys = [];
      if (!options.methods) options.methods = {};
      if (!options.watch) options.watch = {};
      var model = options.model || defaultModel;
      var props = options.props;

      var _arr = Object.keys(props);

      var _loop = function _loop() {
        var prop = _arr[_i];
        var descriptor = props[prop]; // enum

        if (Array.isArray(descriptor.enum)) {
          var nextValidator = descriptor.validator;

          descriptor.validator = function (value) {
            return descriptor.enum.indexOf(value) >= 0 && (nextValidator ? nextValidator.apply(this, arguments) : true);
          };

          if (!('default' in descriptor)) {
            descriptor.default = descriptor.enum[0];
          }
        } // numeric


        if (descriptor.numeric === true) {
          var _nextValidator = descriptor.validator;
          descriptor.type = [String, Number];

          descriptor.validator = function (value) {
            return isNumeric(value) && (_nextValidator ? _nextValidator.apply(this, arguments) : true);
          };
        }

        var isModelProp = prop === model.prop;
        var event = isModelProp ? model.event : "update:" + prop;
        var shouldEmit = isModelProp || !!descriptor.sync;
        var shouldTransform = !!descriptor.transform;
        var shouldProcess = shouldEmit || shouldTransform;

        if (shouldProcess) {
          var receiveTransform;
          var sendTransform;
          var transform = descriptor.transform;

          if (isFunction(transform)) {
            receiveTransform = transform;
          } else if (isObject(transform)) {
            if (isFunction(transform.receive)) {
              receiveTransform = transform.receive;
            }

            if (isFunction(transform.send)) {
              sendTransform = transform.send;
            }
          }

          var onReceive;
          var onSend;
          var onChange;
          var on = descriptor.on;

          if (isObject(on)) {
            if (isFunction(on.receive)) {
              onReceive = on.receive;
            }

            if (isFunction(on.send)) {
              onSend = on.send;
            }

            if (isFunction(on.change)) {
              onChange = on.change;
            }
          }

          var Prop = upperCaseFirst(prop);
          var localProp = "local" + Prop;
          var lastProp = "last" + Prop + "$$";
          var lastLocalProp = "lastLocal" + Prop + "$$";
          var sendProp = "send" + Prop;
          options.localDataKeys.push(localProp);
          options.watch[prop] = {
            immediate: true,
            handler: function handler(newValue, oldValue) {
              if (newValue === oldValue || newValue === this[lastLocalProp]) {
                this[lastProp] = newValue;
                return;
              }

              if (receiveTransform && newValue != null) {
                newValue = receiveTransform.call(this, newValue);
                if (newValue === oldValue || newValue === this[lastLocalProp]) return;
              }

              if (onReceive) {
                if (onReceive.call(this, newValue, oldValue) === false) {
                  return;
                }
              }

              if (onChange) {
                if (onChange.call(this, newValue, oldValue) === false) {
                  return;
                }
              }

              this[lastProp] = newValue;
              this[localProp] = newValue;
            }
          };
          options.watch[localProp] = {
            immediate: false,
            handler: function handler(newValue, oldValue) {
              if (newValue === oldValue || newValue === this[lastProp]) {
                this[lastLocalProp] = newValue;
                return;
              }

              if (sendTransform && newValue != null) {
                newValue = sendTransform.call(this, newValue);
                if (newValue === oldValue || newValue === this[lastProp]) return;
              }

              if (onSend) {
                if (onSend.call(this, newValue, oldValue) === false) {
                  return;
                }
              }

              if (onChange) {
                if (onChange.call(this, newValue, oldValue) === false) {
                  return;
                }
              }

              this[lastLocalProp] = newValue;

              if (shouldEmit) {
                this.$emit(event, newValue, oldValue);
              }
            }
          };

          if (shouldEmit) {
            options.methods[sendProp] = function (newValue) {
              this[localProp] = newValue;
            };
          }
        }
      };

      for (var _i = 0; _i < _arr.length; _i++) {
        _loop();
      }
    },
    data: function data() {
      if (this.__MessengerData__) return;
      this.__MessengerData__ = true;
      return this.$options.localDataKeys.reduce(function (data, key) {
        data[key] = null;
        return data;
      }, {});
    }
  };

  return index;

})));
