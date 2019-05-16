'use strict'

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
})()

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

/**
 * Tiny stack for browser or server
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2018
 * @license BSD-3-Clause
 * @link http://avoidwork.github.io/tiny-stack
 * @version 1.1.0
 */
;(function(global) {
  'use strict'

  var TinyStack = (function() {
    function TinyStack() {
      _classCallCheck(this, TinyStack)

      for (
        var _len = arguments.length, args = Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      this.data = [null].concat(args)
      this.top = this.data.length - 1
    }

    _createClass(TinyStack, [
      {
        key: 'clear',
        value: function clear() {
          this.data.length = 1
          this.top = 0

          return this
        }
      },
      {
        key: 'empty',
        value: function empty() {
          return this.top === 0
        }
      },
      {
        key: 'length',
        value: function length() {
          return this.top
        }
      },
      {
        key: 'peek',
        value: function peek() {
          return this.data[this.top]
        }
      },
      {
        key: 'pop',
        value: function pop() {
          var result = void 0

          if (this.top > 0) {
            result = this.data.pop()
            this.top--
          }

          return result
        }
      },
      {
        key: 'push',
        value: function push(arg) {
          this.data[++this.top] = arg

          return this
        }
      },
      {
        key: 'search',
        value: function search(arg) {
          var index = this.data.indexOf(arg)

          return index === -1 ? -1 : this.data.length - index
        }
      }
    ])

    return TinyStack
  })()

  function factory() {
    for (
      var _len2 = arguments.length, args = Array(_len2), _key2 = 0;
      _key2 < _len2;
      _key2++
    ) {
      args[_key2] = arguments[_key2]
    }

    return new (Function.prototype.bind.apply(TinyStack, [null].concat(args)))()
  }

  // Node, AMD & window supported
  if (typeof exports !== 'undefined') {
    module.exports = factory
  } else if (typeof define === 'function' && define.amd !== void 0) {
    define(function() {
      return factory
    })
  } else {
    global.stack = factory
  }
})(typeof window !== 'undefined' ? window : global)
