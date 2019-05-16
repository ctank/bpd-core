const SlimJQ = function() {
  var arr = []

  var document = window.document

  var getProto = Object.getPrototypeOf

  var slice = arr.slice

  var concat = arr.concat

  var push = arr.push

  var indexOf = arr.indexOf

  var class2type = {}

  var toString = class2type.toString

  var hasOwn = class2type.hasOwnProperty

  var fnToString = hasOwn.toString

  var ObjectFunctionString = fnToString.call(Object)

  var support = {}

  var isFunction = function isFunction(obj) {
    return typeof obj === 'function' && typeof obj.nodeType !== 'number'
  }

  var isWindow = function isWindow(obj) {
    return obj != null && obj === obj.window
  }

  var preservedScriptAttributes = {
    type: true,
    src: true,
    noModule: true
  }

  function DOMEval(code, doc, node) {
    doc = doc || document

    var i

    var script = doc.createElement('script')

    script.text = code
    if (node) {
      for (i in preservedScriptAttributes) {
        if (node[i]) {
          script[i] = node[i]
        }
      }
    }
    doc.head.appendChild(script).parentNode.removeChild(script)
  }

  function toType(obj) {
    if (obj == null) {
      return obj + ''
    }

    return typeof obj === 'object' || typeof obj === 'function'
      ? class2type[toString.call(obj)] || 'object'
      : typeof obj
  }
  var version = '3.3.1'

  var SlimJQ = function(selector, context) {
    return new SlimJQ.fn.Init(selector, context)
  }

  var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g

  SlimJQ.fn = SlimJQ.prototype = {
    slimJQ: version,
    constructor: SlimJQ,
    length: 0,

    toArray: function() {
      return slice.call(this)
    },

    get: function(num) {
      if (num == null) {
        return slice.call(this)
      }
      return num < 0 ? this[num + this.length] : this[num]
    },

    pushStack: function(elems) {
      var ret = SlimJQ.merge(this.constructor(), elems)

      ret.prevObject = this

      return ret
    },

    each: function(callback) {
      return SlimJQ.each(this, callback)
    },

    map: function(callback) {
      return this.pushStack(
        SlimJQ.map(this, function(elem, i) {
          return callback.call(elem, i, elem)
        })
      )
    },

    slice: function() {
      return this.pushStack(slice.apply(this, arguments))
    },

    first: function() {
      return this.eq(0)
    },

    last: function() {
      return this.eq(-1)
    },

    eq: function(i) {
      var len = this.length

      var j = +i + (i < 0 ? len : 0)
      return this.pushStack(j >= 0 && j < len ? [this[j]] : [])
    },

    end: function() {
      return this.prevObject || this.constructor()
    },

    push: push,
    sort: arr.sort,
    splice: arr.splice
  }

  SlimJQ.extend = SlimJQ.fn.extend = function() {
    var options

    var name

    var src

    var copy

    var copyIsArray

    var clone

    var target = arguments[0] || {}

    var i = 1

    var length = arguments.length

    var deep = false

    if (typeof target === 'boolean') {
      deep = target

      target = arguments[i] || {}
      i++
    }

    if (typeof target !== 'object' && !isFunction(target)) {
      target = {}
    }

    if (i === length) {
      target = this
      i--
    }

    for (; i < length; i++) {
      if ((options = arguments[i]) != null) {
        for (name in options) {
          src = target[name]
          copy = options[name]

          if (target === copy) {
            continue
          }

          if (
            deep &&
            copy &&
            (SlimJQ.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))
          ) {
            if (copyIsArray) {
              copyIsArray = false
              clone = src && Array.isArray(src) ? src : []
            } else {
              clone = src && SlimJQ.isPlainObject(src) ? src : {}
            }

            target[name] = SlimJQ.extend(deep, clone, copy)
          } else if (copy !== undefined) {
            target[name] = copy
          }
        }
      }
    }

    return target
  }

  SlimJQ.extend({
    expando: 'SlimJQ' + (version + Math.random()).replace(/\D/g, ''),

    isReady: true,

    error: function(msg) {
      throw new Error(msg)
    },

    noop: function() {},

    isPlainObject: function(obj) {
      var proto, Ctor

      if (!obj || toString.call(obj) !== '[object Object]') {
        return false
      }

      proto = getProto(obj)

      if (!proto) {
        return true
      }

      Ctor = hasOwn.call(proto, 'constructor') && proto.constructor
      return (
        typeof Ctor === 'function' &&
        fnToString.call(Ctor) === ObjectFunctionString
      )
    },

    isEmptyObject: function(obj) {
      var name

      for (name in obj) {
        return false
      }
      return true
    },

    globalEval: function(code) {
      DOMEval(code)
    },

    each: function(obj, callback) {
      var length

      var i = 0

      if (isArrayLike(obj)) {
        length = obj.length
        for (; i < length; i++) {
          if (callback.call(obj[i], i, obj[i]) === false) {
            break
          }
        }
      } else {
        for (i in obj) {
          if (callback.call(obj[i], i, obj[i]) === false) {
            break
          }
        }
      }

      return obj
    },

    trim: function(text) {
      return text == null ? '' : (text + '').replace(rtrim, '')
    },

    makeArray: function(arr, results) {
      var ret = results || []

      if (arr != null) {
        if (isArrayLike(Object(arr))) {
          SlimJQ.merge(ret, typeof arr === 'string' ? [arr] : arr)
        } else {
          push.call(ret, arr)
        }
      }

      return ret
    },

    inArray: function(elem, arr, i) {
      return arr == null ? -1 : indexOf.call(arr, elem, i)
    },

    merge: function(first, second) {
      var len = +second.length

      var j = 0

      var i = first.length

      for (; j < len; j++) {
        first[i++] = second[j]
      }

      first.length = i

      return first
    },

    grep: function(elems, callback, invert) {
      var callbackInverse

      var matches = []

      var i = 0

      var length = elems.length

      var callbackExpect = !invert

      for (; i < length; i++) {
        callbackInverse = !callback(elems[i], i)
        if (callbackInverse !== callbackExpect) {
          matches.push(elems[i])
        }
      }

      return matches
    },

    map: function(elems, callback, arg) {
      var length

      var value

      var i = 0

      var ret = []

      if (isArrayLike(elems)) {
        length = elems.length
        for (; i < length; i++) {
          value = callback(elems[i], i, arg)

          if (value != null) {
            ret.push(value)
          }
        }
      } else {
        for (i in elems) {
          value = callback(elems[i], i, arg)

          if (value != null) {
            ret.push(value)
          }
        }
      }

      return concat.apply([], ret)
    },

    guid: 1,

    support: support
  })

  if (typeof Symbol === 'function') {
    SlimJQ.fn[Symbol.iterator] = arr[Symbol.iterator]
  }

  SlimJQ.each(
    'Boolean Number String Function Array Date RegExp Object Error Symbol'.split(
      ' '
    ),
    function(i, name) {
      class2type['[object ' + name + ']'] = name.toLowerCase()
    }
  )

  function isArrayLike(obj) {
    var length = !!obj && 'length' in obj && obj.length

    var type = toType(obj)

    if (isFunction(obj) || isWindow(obj)) {
      return false
    }

    return (
      type === 'array' ||
      length === 0 ||
      (typeof length === 'number' && length > 0 && length - 1 in obj)
    )
  }
  var Sizzle = (function(window) {
    var i

    var support

    var Expr

    var getText

    var isXML

    var tokenize

    var compile

    var select

    var outermostContext

    var sortInput

    var hasDuplicate

    var setDocument

    var document

    var docElem

    var documentIsHTML

    var rbuggyQSA

    var rbuggyMatches

    var matches

    var contains

    var expando = 'sizzle' + 1 * new Date()

    var preferredDoc = window.document

    var dirruns = 0

    var done = 0

    var classCache = createCache()

    var tokenCache = createCache()

    var compilerCache = createCache()

    var sortOrder = function(a, b) {
      if (a === b) {
        hasDuplicate = true
      }
      return 0
    }

    var hasOwn = {}.hasOwnProperty

    var arr = []

    var pop = arr.pop

    var pushNative = arr.push

    var push = arr.push

    var slice = arr.slice

    var indexOf = function(list, elem) {
      var i = 0

      var len = list.length
      for (; i < len; i++) {
        if (list[i] === elem) {
          return i
        }
      }
      return -1
    }

    var booleans =
      'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped'

    var whitespace = '[\\x20\\t\\r\\n\\f]'

    var identifier = '(?:\\\\.|[\\w-]|[^\0-\\xa0])+'

    var attributes =
      '\\[' +
      whitespace +
      '*(' +
      identifier +
      ')(?:' +
      whitespace +
      '*([*^$|!~]?=)' +
      whitespace +
      '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)"|(' +
      identifier +
      '))|)' +
      whitespace +
      '*\\]'

    var pseudos =
      ':(' +
      identifier +
      ')(?:\\((' +
      '(\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)")|' +
      '((?:\\\\.|[^\\\\()[\\]]|' +
      attributes +
      ')*)|' +
      '.*' +
      ')\\)|)'

    var rwhitespace = new RegExp(whitespace + '+', 'g')

    var rtrim = new RegExp(
      '^' + whitespace + '+|((?:^|[^\\\\])(?:\\\\.)*)' + whitespace + '+$',
      'g'
    )

    var rcomma = new RegExp('^' + whitespace + '*,' + whitespace + '*')

    var rcombinators = new RegExp(
      '^' + whitespace + '*([>+~]|' + whitespace + ')' + whitespace + '*'
    )

    var rattributeQuotes = new RegExp(
      '=' + whitespace + '*([^\\]\'"]*?)' + whitespace + '*\\]',
      'g'
    )

    var rpseudo = new RegExp(pseudos)

    var ridentifier = new RegExp('^' + identifier + '$')

    var matchExpr = {
      ID: new RegExp('^#(' + identifier + ')'),
      CLASS: new RegExp('^\\.(' + identifier + ')'),
      TAG: new RegExp('^(' + identifier + '|[*])'),
      ATTR: new RegExp('^' + attributes),
      PSEUDO: new RegExp('^' + pseudos),
      CHILD: new RegExp(
        '^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' +
          whitespace +
          '*(even|odd|(([+-]|)(\\d*)n|)' +
          whitespace +
          '*(?:([+-]|)' +
          whitespace +
          '*(\\d+)|))' +
          whitespace +
          '*\\)|)',
        'i'
      ),
      bool: new RegExp('^(?:' + booleans + ')$', 'i'),
      needsContext: new RegExp(
        '^' +
          whitespace +
          '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' +
          whitespace +
          '*((?:-\\d)?\\d*)' +
          whitespace +
          '*\\)|)(?=[^-]|$)',
        'i'
      )
    }

    var rinputs = /^(?:input|select|textarea|button)$/i

    var rheader = /^h\d$/i

    var rnative = /^[^{]+\{\s*\[native \w/

    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/

    var rsibling = /[+~]/

    var runescape = new RegExp(
      '\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)',
      'ig'
    )

    var funescape = function(_, escaped, escapedWhitespace) {
      var high = '0x' + escaped - 0x10000
      return high !== high || escapedWhitespace
        ? escaped
        : high < 0
          ? String.fromCharCode(high + 0x10000)
          : String.fromCharCode((high >> 10) | 0xd800, (high & 0x3ff) | 0xdc00)
    }

    var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g

    var fcssescape = function(ch, asCodePoint) {
      if (asCodePoint) {
        if (ch === '\0') {
          return '\uFFFD'
        }

        return (
          ch.slice(0, -1) +
          '\\' +
          ch.charCodeAt(ch.length - 1).toString(16) +
          ' '
        )
      }

      return '\\' + ch
    }

    var unloadHandler = function() {
      setDocument()
    }

    var disabledAncestor = addCombinator(
      function(elem) {
        return elem.disabled === true && ('form' in elem || 'label' in elem)
      },
      { dir: 'parentNode', next: 'legend' }
    )

    try {
      push.apply(
        (arr = slice.call(preferredDoc.childNodes)),
        preferredDoc.childNodes
      )
      arr[preferredDoc.childNodes.length].nodeType
    } catch (e) {
      push = {
        apply: arr.length
          ? function(target, els) {
            pushNative.apply(target, slice.call(els))
          }
          : function(target, els) {
            var j = target.length

            var i = 0
            while ((target[j++] = els[i++])) {}
            target.length = j - 1
          }
      }
    }

    function Sizzle(selector, context, results, seed) {
      var m

      var i

      var elem

      var nid

      var match

      var groups

      var newSelector

      var newContext = context && context.ownerDocument

      var nodeType = context ? context.nodeType : 9

      results = results || []

      if (
        typeof selector !== 'string' ||
        !selector ||
        (nodeType !== 1 && nodeType !== 9 && nodeType !== 11)
      ) {
        return results
      }

      if (!seed) {
        if (
          (context ? context.ownerDocument || context : preferredDoc) !==
          document
        ) {
          setDocument(context)
        }
        context = context || document

        if (documentIsHTML) {
          if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
            if ((m = match[1])) {
              if (nodeType === 9) {
                if ((elem = context.getElementById(m))) {
                  if (elem.id === m) {
                    results.push(elem)
                    return results
                  }
                } else {
                  return results
                }
              } else {
                if (
                  newContext &&
                  (elem = newContext.getElementById(m)) &&
                  contains(context, elem) &&
                  elem.id === m
                ) {
                  results.push(elem)
                  return results
                }
              }
            } else if (match[2]) {
              push.apply(results, context.getElementsByTagName(selector))
              return results
            } else if (
              (m = match[3]) &&
              support.getElementsByClassName &&
              context.getElementsByClassName
            ) {
              push.apply(results, context.getElementsByClassName(m))
              return results
            }
          }

          if (
            support.qsa &&
            !compilerCache[selector + ' '] &&
            (!rbuggyQSA || !rbuggyQSA.test(selector))
          ) {
            if (nodeType !== 1) {
              newContext = context
              newSelector = selector
            } else if (context.nodeName.toLowerCase() !== 'object') {
              if ((nid = context.getAttribute('id'))) {
                nid = nid.replace(rcssescape, fcssescape)
              } else {
                context.setAttribute('id', (nid = expando))
              }

              groups = tokenize(selector)
              i = groups.length
              while (i--) {
                groups[i] = '#' + nid + ' ' + toSelector(groups[i])
              }
              newSelector = groups.join(',')

              newContext =
                (rsibling.test(selector) && testContext(context.parentNode)) ||
                context
            }

            if (newSelector) {
              try {
                push.apply(results, newContext.querySelectorAll(newSelector))
                return results
              } catch (qsaError) {
              } finally {
                if (nid === expando) {
                  context.removeAttribute('id')
                }
              }
            }
          }
        }
      }

      return select(selector.replace(rtrim, '$1'), context, results, seed)
    }

    function createCache() {
      var keys = []

      function cache(key, value) {
        if (keys.push(key + ' ') > Expr.cacheLength) {
          delete cache[keys.shift()]
        }
        return (cache[key + ' '] = value)
      }
      return cache
    }

    /**
     * Mark a function for special use by Sizzle
     * @param {Function} fn The function to mark
     */
    function markFunction(fn) {
      fn[expando] = true
      return fn
    }

    /**
     * Support testing using an element
     * @param {Function} fn Passed the created element and returns a boolean result
     */
    function assert(fn) {
      var el = document.createElement('fieldset')

      try {
        return !!fn(el)
      } catch (e) {
        return false
      } finally {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
        el = null
      }
    }

    /**
     * Adds the same handler for all of the specified attrs
     * @param {String} attrs Pipe-separated list of attributes
     * @param {Function} handler The method that will be applied
     */
    function addHandle(attrs, handler) {
      var arr = attrs.split('|')

      var i = arr.length

      while (i--) {
        Expr.attrHandle[arr[i]] = handler
      }
    }

    /**
     * Checks document order of two siblings
     * @param {Element} a
     * @param {Element} b
     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */
    function siblingCheck(a, b) {
      var cur = b && a

      var diff =
        cur &&
        a.nodeType === 1 &&
        b.nodeType === 1 &&
        a.sourceIndex - b.sourceIndex

      if (diff) {
        return diff
      }

      if (cur) {
        while ((cur = cur.nextSibling)) {
          if (cur === b) {
            return -1
          }
        }
      }

      return a ? 1 : -1
    }

    /**
     * Returns a function to use in pseudos for input types
     * @param {String} type
     */
    function createInputPseudo(type) {
      return function(elem) {
        var name = elem.nodeName.toLowerCase()
        return name === 'input' && elem.type === type
      }
    }

    /**
     * Returns a function to use in pseudos for buttons
     * @param {String} type
     */
    function createButtonPseudo(type) {
      return function(elem) {
        var name = elem.nodeName.toLowerCase()
        return (name === 'input' || name === 'button') && elem.type === type
      }
    }

    /**
     * Returns a function to use in pseudos for :enabled/:disabled
     * @param {Boolean} disabled true for :disabled; false for :enabled
     */
    function createDisabledPseudo(disabled) {
      return function(elem) {
        if ('form' in elem) {
          if (elem.parentNode && elem.disabled === false) {
            if ('label' in elem) {
              if ('label' in elem.parentNode) {
                return elem.parentNode.disabled === disabled
              } else {
                return elem.disabled === disabled
              }
            }

            return (
              elem.isDisabled === disabled ||
              (elem.isDisabled !== !disabled &&
                disabledAncestor(elem) === disabled)
            )
          }

          return elem.disabled === disabled
        } else if ('label' in elem) {
          return elem.disabled === disabled
        }

        return false
      }
    }

    /**
     * Returns a function to use in pseudos for positionals
     * @param {Function} fn
     */
    function createPositionalPseudo(fn) {
      return markFunction(function(argument) {
        argument = +argument
        return markFunction(function(seed, matches) {
          var j

          var matchIndexes = fn([], seed.length, argument)

          var i = matchIndexes.length

          while (i--) {
            if (seed[(j = matchIndexes[i])]) {
              seed[j] = !(matches[j] = seed[j])
            }
          }
        })
      })
    }

    /**
     * Checks a node for validity as a Sizzle context
     * @param {Element|Object=} context
     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */
    function testContext(context) {
      return (
        context &&
        typeof context.getElementsByTagName !== 'undefined' &&
        context
      )
    }

    support = Sizzle.support = {}

    /**
     * Detects XML nodes
     * @param {Element|Object} elem An element or a document
     * @returns {Boolean} True iff elem is a non-HTML XML node
     */
    isXML = Sizzle.isXML = function(elem) {
      var documentElement = elem && (elem.ownerDocument || elem).documentElement
      return documentElement ? documentElement.nodeName !== 'HTML' : false
    }

    /**
     * Sets document-related variables once based on the current document
     * @param {Element|Object} [doc] An element or document object to use to set the document
     * @returns {Object} Returns the current document
     */
    setDocument = Sizzle.setDocument = function(node) {
      var hasCompare

      var subWindow

      var doc = node ? node.ownerDocument || node : preferredDoc

      if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
        return document
      }

      document = doc
      docElem = document.documentElement
      documentIsHTML = !isXML(document)

      if (
        preferredDoc !== document &&
        (subWindow = document.defaultView) &&
        subWindow.top !== subWindow
      ) {
        if (subWindow.addEventListener) {
          subWindow.addEventListener('unload', unloadHandler, false)
        } else if (subWindow.attachEvent) {
          subWindow.attachEvent('onunload', unloadHandler)
        }
      }

      /* Attributes
	---------------------------------------------------------------------- */

      support.attributes = assert(function(el) {
        el.className = 'i'
        return !el.getAttribute('className')
      })

      /* getElement(s)By*
	---------------------------------------------------------------------- */

      support.getElementsByTagName = assert(function(el) {
        el.appendChild(document.createComment(''))
        return !el.getElementsByTagName('*').length
      })

      support.getElementsByClassName = rnative.test(
        document.getElementsByClassName
      )

      support.getById = assert(function(el) {
        docElem.appendChild(el).id = expando
        return (
          !document.getElementsByName ||
          !document.getElementsByName(expando).length
        )
      })

      if (support.getById) {
        Expr.filter['ID'] = function(id) {
          var attrId = id.replace(runescape, funescape)
          return function(elem) {
            return elem.getAttribute('id') === attrId
          }
        }
        Expr.find['ID'] = function(id, context) {
          if (typeof context.getElementById !== 'undefined' && documentIsHTML) {
            var elem = context.getElementById(id)
            return elem ? [elem] : []
          }
        }
      } else {
        Expr.filter['ID'] = function(id) {
          var attrId = id.replace(runescape, funescape)
          return function(elem) {
            var node =
              typeof elem.getAttributeNode !== 'undefined' &&
              elem.getAttributeNode('id')
            return node && node.value === attrId
          }
        }

        Expr.find['ID'] = function(id, context) {
          if (typeof context.getElementById !== 'undefined' && documentIsHTML) {
            var node

            var i

            var elems

            var elem = context.getElementById(id)

            if (elem) {
              node = elem.getAttributeNode('id')
              if (node && node.value === id) {
                return [elem]
              }

              elems = context.getElementsByName(id)
              i = 0
              while ((elem = elems[i++])) {
                node = elem.getAttributeNode('id')
                if (node && node.value === id) {
                  return [elem]
                }
              }
            }

            return []
          }
        }
      }

      Expr.find['TAG'] = support.getElementsByTagName
        ? function(tag, context) {
          if (typeof context.getElementsByTagName !== 'undefined') {
            return context.getElementsByTagName(tag)
          } else if (support.qsa) {
            return context.querySelectorAll(tag)
          }
        }
        : function(tag, context) {
          var elem

          var tmp = []

          var i = 0

          var results = context.getElementsByTagName(tag)

          if (tag === '*') {
            while ((elem = results[i++])) {
              if (elem.nodeType === 1) {
                tmp.push(elem)
              }
            }

            return tmp
          }
          return results
        }

      Expr.find['CLASS'] =
        support.getElementsByClassName &&
        function(className, context) {
          if (
            typeof context.getElementsByClassName !== 'undefined' &&
            documentIsHTML
          ) {
            return context.getElementsByClassName(className)
          }
        }

      /* QSA/matchesSelector
	---------------------------------------------------------------------- */

      rbuggyMatches = []

      rbuggyQSA = []

      if ((support.qsa = rnative.test(document.querySelectorAll))) {
        assert(function(el) {
          docElem.appendChild(el).innerHTML =
            "<a id='" +
            expando +
            "'></a>" +
            "<select id='" +
            expando +
            "-\r\\' msallowcapture=''>" +
            "<option selected=''></option></select>"

          if (el.querySelectorAll("[msallowcapture^='']").length) {
            rbuggyQSA.push('[*^$]=' + whitespace + '*(?:\'\'|"")')
          }

          if (!el.querySelectorAll('[selected]').length) {
            rbuggyQSA.push('\\[' + whitespace + '*(?:value|' + booleans + ')')
          }

          if (!el.querySelectorAll('[id~=' + expando + '-]').length) {
            rbuggyQSA.push('~=')
          }

          if (!el.querySelectorAll(':checked').length) {
            rbuggyQSA.push(':checked')
          }

          if (!el.querySelectorAll('a#' + expando + '+*').length) {
            rbuggyQSA.push('.#.+[+~]')
          }
        })

        assert(function(el) {
          el.innerHTML =
            "<a href='' disabled='disabled'></a>" +
            "<select disabled='disabled'><option/></select>"

          var input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          el.appendChild(input).setAttribute('name', 'D')

          if (el.querySelectorAll('[name=d]').length) {
            rbuggyQSA.push('name' + whitespace + '*[*^$|!~]?=')
          }

          if (el.querySelectorAll(':enabled').length !== 2) {
            rbuggyQSA.push(':enabled', ':disabled')
          }

          docElem.appendChild(el).disabled = true
          if (el.querySelectorAll(':disabled').length !== 2) {
            rbuggyQSA.push(':enabled', ':disabled')
          }

          el.querySelectorAll('*,:x')
          rbuggyQSA.push(',.*:')
        })
      }

      if (
        (support.matchesSelector = rnative.test(
          (matches =
            docElem.matches ||
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector)
        ))
      ) {
        assert(function(el) {
          support.disconnectedMatch = matches.call(el, '*')

          matches.call(el, "[s!='']:x")
          rbuggyMatches.push('!=', pseudos)
        })
      }

      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join('|'))
      rbuggyMatches =
        rbuggyMatches.length && new RegExp(rbuggyMatches.join('|'))

      /* Contains
	---------------------------------------------------------------------- */
      hasCompare = rnative.test(docElem.compareDocumentPosition)

      contains =
        hasCompare || rnative.test(docElem.contains)
          ? function(a, b) {
            var adown = a.nodeType === 9 ? a.documentElement : a

            var bup = b && b.parentNode
            return (
              a === bup ||
                !!(
                  bup &&
                  bup.nodeType === 1 &&
                  (adown.contains
                    ? adown.contains(bup)
                    : a.compareDocumentPosition &&
                      a.compareDocumentPosition(bup) & 16)
                )
            )
          }
          : function(a, b) {
            if (b) {
              while ((b = b.parentNode)) {
                if (b === a) {
                  return true
                }
              }
            }
            return false
          }

      /* Sorting
	---------------------------------------------------------------------- */

      sortOrder = hasCompare
        ? function(a, b) {
          if (a === b) {
            hasDuplicate = true
            return 0
          }

          var compare =
              !a.compareDocumentPosition - !b.compareDocumentPosition
          if (compare) {
            return compare
          }

          compare =
              (a.ownerDocument || a) === (b.ownerDocument || b)
                ? a.compareDocumentPosition(b)
                : 1

          if (
            compare & 1 ||
              (!support.sortDetached &&
                b.compareDocumentPosition(a) === compare)
          ) {
            if (
              a === document ||
                (a.ownerDocument === preferredDoc && contains(preferredDoc, a))
            ) {
              return -1
            }
            if (
              b === document ||
                (b.ownerDocument === preferredDoc && contains(preferredDoc, b))
            ) {
              return 1
            }

            return sortInput
              ? indexOf(sortInput, a) - indexOf(sortInput, b)
              : 0
          }

          return compare & 4 ? -1 : 1
        }
        : function(a, b) {
          if (a === b) {
            hasDuplicate = true
            return 0
          }

          var cur

          var i = 0

          var aup = a.parentNode

          var bup = b.parentNode

          var ap = [a]

          var bp = [b]

          if (!aup || !bup) {
            return a === document
              ? -1
              : b === document
                ? 1
                : aup
                  ? -1
                  : bup
                    ? 1
                    : sortInput
                      ? indexOf(sortInput, a) - indexOf(sortInput, b)
                      : 0
          } else if (aup === bup) {
            return siblingCheck(a, b)
          }

          cur = a
          while ((cur = cur.parentNode)) {
            ap.unshift(cur)
          }
          cur = b
          while ((cur = cur.parentNode)) {
            bp.unshift(cur)
          }

          while (ap[i] === bp[i]) {
            i++
          }

          return i
            ? siblingCheck(ap[i], bp[i])
            : ap[i] === preferredDoc
              ? -1
              : bp[i] === preferredDoc
                ? 1
                : 0
        }

      return document
    }

    Sizzle.matches = function(expr, elements) {
      return Sizzle(expr, null, null, elements)
    }

    Sizzle.matchesSelector = function(elem, expr) {
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem)
      }

      expr = expr.replace(rattributeQuotes, "='$1']")

      if (
        support.matchesSelector &&
        documentIsHTML &&
        !compilerCache[expr + ' '] &&
        (!rbuggyMatches || !rbuggyMatches.test(expr)) &&
        (!rbuggyQSA || !rbuggyQSA.test(expr))
      ) {
        try {
          var ret = matches.call(elem, expr)

          if (
            ret ||
            support.disconnectedMatch ||
            (elem.document && elem.document.nodeType !== 11)
          ) {
            return ret
          }
        } catch (e) {}
      }

      return Sizzle(expr, document, null, [elem]).length > 0
    }

    Sizzle.contains = function(context, elem) {
      if ((context.ownerDocument || context) !== document) {
        setDocument(context)
      }
      return contains(context, elem)
    }

    Sizzle.attr = function(elem, name) {
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem)
      }

      var fn = Expr.attrHandle[name.toLowerCase()]

      var val =
        fn && hasOwn.call(Expr.attrHandle, name.toLowerCase())
          ? fn(elem, name, !documentIsHTML)
          : undefined

      return val !== undefined
        ? val
        : support.attributes || !documentIsHTML
          ? elem.getAttribute(name)
          : (val = elem.getAttributeNode(name)) && val.specified
            ? val.value
            : null
    }

    Sizzle.escape = function(sel) {
      return (sel + '').replace(rcssescape, fcssescape)
    }

    Sizzle.error = function(msg) {
      throw new Error('Syntax error, unrecognized expression: ' + msg)
    }

    /**
     * Document sorting and removing duplicates
     * @param {ArrayLike} results
     */
    Sizzle.uniqueSort = function(results) {
      var elem

      var duplicates = []

      var j = 0

      var i = 0

      hasDuplicate = !support.detectDuplicates
      sortInput = !support.sortStable && results.slice(0)
      results.sort(sortOrder)

      if (hasDuplicate) {
        while ((elem = results[i++])) {
          if (elem === results[i]) {
            j = duplicates.push(i)
          }
        }
        while (j--) {
          results.splice(duplicates[j], 1)
        }
      }

      sortInput = null

      return results
    }

    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param {Array|Element} elem
     */
    getText = Sizzle.getText = function(elem) {
      var node

      var ret = ''

      var i = 0

      var nodeType = elem.nodeType

      if (!nodeType) {
        while ((node = elem[i++])) {
          ret += getText(node)
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        if (typeof elem.textContent === 'string') {
          return elem.textContent
        } else {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem)
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue
      }

      return ret
    }

    Expr = Sizzle.selectors = {
      cacheLength: 50,

      createPseudo: markFunction,

      match: matchExpr,

      attrHandle: {},

      find: {},

      relative: {
        '>': { dir: 'parentNode', first: true },
        ' ': { dir: 'parentNode' },
        '+': { dir: 'previousSibling', first: true },
        '~': { dir: 'previousSibling' }
      },

      preFilter: {
        ATTR: function(match) {
          match[1] = match[1].replace(runescape, funescape)

          match[3] = (match[3] || match[4] || match[5] || '').replace(
            runescape,
            funescape
          )

          if (match[2] === '~=') {
            match[3] = ' ' + match[3] + ' '
          }

          return match.slice(0, 4)
        },

        CHILD: function(match) {
          match[1] = match[1].toLowerCase()

          if (match[1].slice(0, 3) === 'nth') {
            if (!match[3]) {
              Sizzle.error(match[0])
            }

            match[4] = +(match[4]
              ? match[5] + (match[6] || 1)
              : 2 * (match[3] === 'even' || match[3] === 'odd'))
            match[5] = +(match[7] + match[8] || match[3] === 'odd')
          } else if (match[3]) {
            Sizzle.error(match[0])
          }

          return match
        },

        PSEUDO: function(match) {
          var excess

          var unquoted = !match[6] && match[2]

          if (matchExpr['CHILD'].test(match[0])) {
            return null
          }

          if (match[3]) {
            match[2] = match[4] || match[5] || ''
          } else if (
            unquoted &&
            rpseudo.test(unquoted) &&
            (excess = tokenize(unquoted, true)) &&
            (excess =
              unquoted.indexOf(')', unquoted.length - excess) - unquoted.length)
          ) {
            match[0] = match[0].slice(0, excess)
            match[2] = unquoted.slice(0, excess)
          }

          return match.slice(0, 3)
        }
      },

      filter: {
        TAG: function(nodeNameSelector) {
          var nodeName = nodeNameSelector
            .replace(runescape, funescape)
            .toLowerCase()
          return nodeNameSelector === '*'
            ? function() {
              return true
            }
            : function(elem) {
              return elem.nodeName && elem.nodeName.toLowerCase() === nodeName
            }
        },

        CLASS: function(className) {
          var pattern = classCache[className + ' ']

          return (
            pattern ||
            ((pattern = new RegExp(
              '(^|' + whitespace + ')' + className + '(' + whitespace + '|$)'
            )) &&
              classCache(className, function(elem) {
                return pattern.test(
                  (typeof elem.className === 'string' && elem.className) ||
                    (typeof elem.getAttribute !== 'undefined' &&
                      elem.getAttribute('class')) ||
                    ''
                )
              }))
          )
        },

        ATTR: function(name, operator, check) {
          return function(elem) {
            var result = Sizzle.attr(elem, name)

            if (result == null) {
              return operator === '!='
            }
            if (!operator) {
              return true
            }

            result += ''

            return operator === '='
              ? result === check
              : operator === '!='
                ? result !== check
                : operator === '^='
                  ? check && result.indexOf(check) === 0
                  : operator === '*='
                    ? check && result.indexOf(check) > -1
                    : operator === '$='
                      ? check && result.slice(-check.length) === check
                      : operator === '~='
                        ? (
                          ' ' +
                            result.replace(rwhitespace, ' ') +
                            ' '
                        ).indexOf(check) > -1
                        : operator === '|='
                          ? result === check ||
                            result.slice(0, check.length + 1) === check + '-'
                          : false
          }
        },

        CHILD: function(type, what, argument, first, last) {
          var simple = type.slice(0, 3) !== 'nth'

          var forward = type.slice(-4) !== 'last'

          var ofType = what === 'of-type'

          return first === 1 && last === 0
            ? function(elem) {
              return !!elem.parentNode
            }
            : function(elem, context, xml) {
              var cache

              var uniqueCache

              var outerCache

              var node

              var nodeIndex

              var start

              var dir = simple !== forward ? 'nextSibling' : 'previousSibling'

              var parent = elem.parentNode

              var name = ofType && elem.nodeName.toLowerCase()

              var useCache = !xml && !ofType

              var diff = false

              if (parent) {
                if (simple) {
                  while (dir) {
                    node = elem
                    while ((node = node[dir])) {
                      if (
                        ofType
                          ? node.nodeName.toLowerCase() === name
                          : node.nodeType === 1
                      ) {
                        return false
                      }
                    }
                    start = dir = type === 'only' && !start && 'nextSibling'
                  }
                  return true
                }

                start = [forward ? parent.firstChild : parent.lastChild]

                if (forward && useCache) {
                  node = parent
                  outerCache = node[expando] || (node[expando] = {})

                  uniqueCache =
                      outerCache[node.uniqueID] ||
                      (outerCache[node.uniqueID] = {})

                  cache = uniqueCache[type] || []
                  nodeIndex = cache[0] === dirruns && cache[1]
                  diff = nodeIndex && cache[2]
                  node = nodeIndex && parent.childNodes[nodeIndex]

                  while (
                    (node =
                        (++nodeIndex && node && node[dir]) ||
                        (diff = nodeIndex = 0) ||
                        start.pop())
                  ) {
                    if (node.nodeType === 1 && ++diff && node === elem) {
                      uniqueCache[type] = [dirruns, nodeIndex, diff]
                      break
                    }
                  }
                } else {
                  if (useCache) {
                    node = elem
                    outerCache = node[expando] || (node[expando] = {})

                    uniqueCache =
                        outerCache[node.uniqueID] ||
                        (outerCache[node.uniqueID] = {})

                    cache = uniqueCache[type] || []
                    nodeIndex = cache[0] === dirruns && cache[1]
                    diff = nodeIndex
                  }

                  if (diff === false) {
                    while (
                      (node =
                          (++nodeIndex && node && node[dir]) ||
                          (diff = nodeIndex = 0) ||
                          start.pop())
                    ) {
                      if (
                        (ofType
                          ? node.nodeName.toLowerCase() === name
                          : node.nodeType === 1) &&
                          ++diff
                      ) {
                        if (useCache) {
                          outerCache = node[expando] || (node[expando] = {})

                          uniqueCache =
                              outerCache[node.uniqueID] ||
                              (outerCache[node.uniqueID] = {})

                          uniqueCache[type] = [dirruns, diff]
                        }

                        if (node === elem) {
                          break
                        }
                      }
                    }
                  }
                }

                diff -= last
                return (
                  diff === first || (diff % first === 0 && diff / first >= 0)
                )
              }
            }
        },

        PSEUDO: function(pseudo, argument) {
          var args

          var fn =
            Expr.pseudos[pseudo] ||
            Expr.setFilters[pseudo.toLowerCase()] ||
            Sizzle.error('unsupported pseudo: ' + pseudo)

          if (fn[expando]) {
            return fn(argument)
          }

          if (fn.length > 1) {
            args = [pseudo, pseudo, '', argument]
            return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase())
              ? markFunction(function(seed, matches) {
                var idx

                var matched = fn(seed, argument)

                var i = matched.length
                while (i--) {
                  idx = indexOf(seed, matched[i])
                  seed[idx] = !(matches[idx] = matched[i])
                }
              })
              : function(elem) {
                return fn(elem, 0, args)
              }
          }

          return fn
        }
      },

      pseudos: {
        not: markFunction(function(selector) {
          var input = []

          var results = []

          var matcher = compile(selector.replace(rtrim, '$1'))

          return matcher[expando]
            ? markFunction(function(seed, matches, context, xml) {
              var elem

              var unmatched = matcher(seed, null, xml, [])

              var i = seed.length

              while (i--) {
                if ((elem = unmatched[i])) {
                  seed[i] = !(matches[i] = elem)
                }
              }
            })
            : function(elem, context, xml) {
              input[0] = elem
              matcher(input, null, xml, results)
              input[0] = null
              return !results.pop()
            }
        }),

        has: markFunction(function(selector) {
          return function(elem) {
            return Sizzle(selector, elem).length > 0
          }
        }),

        contains: markFunction(function(text) {
          text = text.replace(runescape, funescape)
          return function(elem) {
            return (
              (elem.textContent || elem.innerText || getText(elem)).indexOf(
                text
              ) > -1
            )
          }
        }),

        lang: markFunction(function(lang) {
          if (!ridentifier.test(lang || '')) {
            Sizzle.error('unsupported lang: ' + lang)
          }
          lang = lang.replace(runescape, funescape).toLowerCase()
          return function(elem) {
            var elemLang
            do {
              if (
                (elemLang = documentIsHTML
                  ? elem.lang
                  : elem.getAttribute('xml:lang') || elem.getAttribute('lang'))
              ) {
                elemLang = elemLang.toLowerCase()
                return elemLang === lang || elemLang.indexOf(lang + '-') === 0
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1)
            return false
          }
        }),

        target: function(elem) {
          var hash = window.location && window.location.hash
          return hash && hash.slice(1) === elem.id
        },

        root: function(elem) {
          return elem === docElem
        },

        focus: function(elem) {
          return (
            elem === document.activeElement &&
            (!document.hasFocus || document.hasFocus()) &&
            !!(elem.type || elem.href || ~elem.tabIndex)
          )
        },

        enabled: createDisabledPseudo(false),
        disabled: createDisabledPseudo(true),

        checked: function(elem) {
          var nodeName = elem.nodeName.toLowerCase()
          return (
            (nodeName === 'input' && !!elem.checked) ||
            (nodeName === 'option' && !!elem.selected)
          )
        },

        selected: function(elem) {
          if (elem.parentNode) {
            elem.parentNode.selectedIndex
          }

          return elem.selected === true
        },

        empty: function(elem) {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false
            }
          }
          return true
        },

        parent: function(elem) {
          return !Expr.pseudos['empty'](elem)
        },

        header: function(elem) {
          return rheader.test(elem.nodeName)
        },

        input: function(elem) {
          return rinputs.test(elem.nodeName)
        },

        button: function(elem) {
          var name = elem.nodeName.toLowerCase()
          return (
            (name === 'input' && elem.type === 'button') || name === 'button'
          )
        },

        text: function(elem) {
          var attr
          return (
            elem.nodeName.toLowerCase() === 'input' &&
            elem.type === 'text' &&
            ((attr = elem.getAttribute('type')) == null ||
              attr.toLowerCase() === 'text')
          )
        },

        first: createPositionalPseudo(function() {
          return [0]
        }),

        last: createPositionalPseudo(function(matchIndexes, length) {
          return [length - 1]
        }),

        eq: createPositionalPseudo(function(matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument]
        }),

        even: createPositionalPseudo(function(matchIndexes, length) {
          var i = 0
          for (; i < length; i += 2) {
            matchIndexes.push(i)
          }
          return matchIndexes
        }),

        odd: createPositionalPseudo(function(matchIndexes, length) {
          var i = 1
          for (; i < length; i += 2) {
            matchIndexes.push(i)
          }
          return matchIndexes
        }),

        lt: createPositionalPseudo(function(matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument
          for (; --i >= 0;) {
            matchIndexes.push(i)
          }
          return matchIndexes
        }),

        gt: createPositionalPseudo(function(matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument
          for (; ++i < length;) {
            matchIndexes.push(i)
          }
          return matchIndexes
        })
      }
    }

    Expr.pseudos['nth'] = Expr.pseudos['eq']

    for (i in {
      radio: true,
      checkbox: true,
      file: true,
      password: true,
      image: true
    }) {
      Expr.pseudos[i] = createInputPseudo(i)
    }
    for (i in { submit: true, reset: true }) {
      Expr.pseudos[i] = createButtonPseudo(i)
    }

    function setFilters() {}
    setFilters.prototype = Expr.filters = Expr.pseudos
    Expr.setFilters = new setFilters()

    tokenize = Sizzle.tokenize = function(selector, parseOnly) {
      var matched

      var match

      var tokens

      var type

      var soFar

      var groups

      var preFilters

      var cached = tokenCache[selector + ' ']

      if (cached) {
        return parseOnly ? 0 : cached.slice(0)
      }

      soFar = selector
      groups = []
      preFilters = Expr.preFilter

      while (soFar) {
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            soFar = soFar.slice(match[0].length) || soFar
          }
          groups.push((tokens = []))
        }

        matched = false

        if ((match = rcombinators.exec(soFar))) {
          matched = match.shift()
          tokens.push({
            value: matched,
            type: match[0].replace(rtrim, ' ')
          })
          soFar = soFar.slice(matched.length)
        }

        for (type in Expr.filter) {
          if (
            (match = matchExpr[type].exec(soFar)) &&
            (!preFilters[type] || (match = preFilters[type](match)))
          ) {
            matched = match.shift()
            tokens.push({
              value: matched,
              type: type,
              matches: match
            })
            soFar = soFar.slice(matched.length)
          }
        }

        if (!matched) {
          break
        }
      }

      return parseOnly
        ? soFar.length
        : soFar
          ? Sizzle.error(selector)
          : tokenCache(selector, groups).slice(0)
    }

    function toSelector(tokens) {
      var i = 0

      var len = tokens.length

      var selector = ''
      for (; i < len; i++) {
        selector += tokens[i].value
      }
      return selector
    }

    function addCombinator(matcher, combinator, base) {
      var dir = combinator.dir

      var skip = combinator.next

      var key = skip || dir

      var checkNonElements = base && key === 'parentNode'

      var doneName = done++

      return combinator.first
        ? function(elem, context, xml) {
          while ((elem = elem[dir])) {
            if (elem.nodeType === 1 || checkNonElements) {
              return matcher(elem, context, xml)
            }
          }
          return false
        }
        : function(elem, context, xml) {
          var oldCache

          var uniqueCache

          var outerCache

          var newCache = [dirruns, doneName]

          if (xml) {
            while ((elem = elem[dir])) {
              if (elem.nodeType === 1 || checkNonElements) {
                if (matcher(elem, context, xml)) {
                  return true
                }
              }
            }
          } else {
            while ((elem = elem[dir])) {
              if (elem.nodeType === 1 || checkNonElements) {
                outerCache = elem[expando] || (elem[expando] = {})

                uniqueCache =
                    outerCache[elem.uniqueID] ||
                    (outerCache[elem.uniqueID] = {})

                if (skip && skip === elem.nodeName.toLowerCase()) {
                  elem = elem[dir] || elem
                } else if (
                  (oldCache = uniqueCache[key]) &&
                    oldCache[0] === dirruns &&
                    oldCache[1] === doneName
                ) {
                  return (newCache[2] = oldCache[2])
                } else {
                  uniqueCache[key] = newCache

                  if ((newCache[2] = matcher(elem, context, xml))) {
                    return true
                  }
                }
              }
            }
          }
          return false
        }
    }

    function elementMatcher(matchers) {
      return matchers.length > 1
        ? function(elem, context, xml) {
          var i = matchers.length
          while (i--) {
            if (!matchers[i](elem, context, xml)) {
              return false
            }
          }
          return true
        }
        : matchers[0]
    }

    function multipleContexts(selector, contexts, results) {
      var i = 0

      var len = contexts.length
      for (; i < len; i++) {
        Sizzle(selector, contexts[i], results)
      }
      return results
    }

    function condense(unmatched, map, filter, context, xml) {
      var elem

      var newUnmatched = []

      var i = 0

      var len = unmatched.length

      var mapped = map != null

      for (; i < len; i++) {
        if ((elem = unmatched[i])) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem)
            if (mapped) {
              map.push(i)
            }
          }
        }
      }

      return newUnmatched
    }

    function setMatcher(
      preFilter,
      selector,
      matcher,
      postFilter,
      postFinder,
      postSelector
    ) {
      if (postFilter && !postFilter[expando]) {
        postFilter = setMatcher(postFilter)
      }
      if (postFinder && !postFinder[expando]) {
        postFinder = setMatcher(postFinder, postSelector)
      }
      return markFunction(function(seed, results, context, xml) {
        var temp

        var i

        var elem

        var preMap = []

        var postMap = []

        var preexisting = results.length

        var elems =
          seed ||
          multipleContexts(
            selector || '*',
            context.nodeType ? [context] : context,
            []
          )

        var matcherIn =
          preFilter && (seed || !selector)
            ? condense(elems, preMap, preFilter, context, xml)
            : elems

        var matcherOut = matcher
          ? postFinder || (seed ? preFilter : preexisting || postFilter)
            ? []
            : results
          : matcherIn

        if (matcher) {
          matcher(matcherIn, matcherOut, context, xml)
        }

        if (postFilter) {
          temp = condense(matcherOut, postMap)
          postFilter(temp, [], context, xml)

          i = temp.length
          while (i--) {
            if ((elem = temp[i])) {
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem)
            }
          }
        }

        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              temp = []
              i = matcherOut.length
              while (i--) {
                if ((elem = matcherOut[i])) {
                  temp.push((matcherIn[i] = elem))
                }
              }
              postFinder(null, (matcherOut = []), temp, xml)
            }

            i = matcherOut.length
            while (i--) {
              if (
                (elem = matcherOut[i]) &&
                (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1
              ) {
                seed[temp] = !(results[temp] = elem)
              }
            }
          }
        } else {
          matcherOut = condense(
            matcherOut === results
              ? matcherOut.splice(preexisting, matcherOut.length)
              : matcherOut
          )
          if (postFinder) {
            postFinder(null, results, matcherOut, xml)
          } else {
            push.apply(results, matcherOut)
          }
        }
      })
    }

    function matcherFromTokens(tokens) {
      var checkContext

      var matcher

      var j

      var len = tokens.length

      var leadingRelative = Expr.relative[tokens[0].type]

      var implicitRelative = leadingRelative || Expr.relative[' ']

      var i = leadingRelative ? 1 : 0

      var matchContext = addCombinator(
        function(elem) {
          return elem === checkContext
        },
        implicitRelative,
        true
      )

      var matchAnyContext = addCombinator(
        function(elem) {
          return indexOf(checkContext, elem) > -1
        },
        implicitRelative,
        true
      )

      var matchers = [
        function(elem, context, xml) {
          var ret =
            (!leadingRelative && (xml || context !== outermostContext)) ||
            ((checkContext = context).nodeType
              ? matchContext(elem, context, xml)
              : matchAnyContext(elem, context, xml))
          checkContext = null
          return ret
        }
      ]

      for (; i < len; i++) {
        if ((matcher = Expr.relative[tokens[i].type])) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)]
        } else {
          matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches)

          if (matcher[expando]) {
            j = ++i
            for (; j < len; j++) {
              if (Expr.relative[tokens[j].type]) {
                break
              }
            }
            return setMatcher(
              i > 1 && elementMatcher(matchers),
              i > 1 &&
                toSelector(
                  tokens
                    .slice(0, i - 1)
                    .concat({ value: tokens[i - 2].type === ' ' ? '*' : '' })
                ).replace(rtrim, '$1'),
              matcher,
              i < j && matcherFromTokens(tokens.slice(i, j)),
              j < len && matcherFromTokens((tokens = tokens.slice(j))),
              j < len && toSelector(tokens)
            )
          }
          matchers.push(matcher)
        }
      }

      return elementMatcher(matchers)
    }

    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0

      var byElement = elementMatchers.length > 0

      var superMatcher = function(seed, context, xml, results, outermost) {
        var elem

        var j

        var matcher

        var matchedCount = 0

        var i = '0'

        var unmatched = seed && []

        var setMatched = []

        var contextBackup = outermostContext

        var elems = seed || (byElement && Expr.find['TAG']('*', outermost))

        var dirrunsUnique = (dirruns +=
          contextBackup == null ? 1 : Math.random() || 0.1)

        var len = elems.length

        if (outermost) {
          outermostContext = context === document || context || outermost
        }

        for (; i !== len && (elem = elems[i]) != null; i++) {
          if (byElement && elem) {
            j = 0
            if (!context && elem.ownerDocument !== document) {
              setDocument(elem)
              xml = !documentIsHTML
            }
            while ((matcher = elementMatchers[j++])) {
              if (matcher(elem, context || document, xml)) {
                results.push(elem)
                break
              }
            }
            if (outermost) {
              dirruns = dirrunsUnique
            }
          }

          if (bySet) {
            if ((elem = !matcher && elem)) {
              matchedCount--
            }

            if (seed) {
              unmatched.push(elem)
            }
          }
        }

        matchedCount += i

        if (bySet && i !== matchedCount) {
          j = 0
          while ((matcher = setMatchers[j++])) {
            matcher(unmatched, setMatched, context, xml)
          }

          if (seed) {
            if (matchedCount > 0) {
              while (i--) {
                if (!(unmatched[i] || setMatched[i])) {
                  setMatched[i] = pop.call(results)
                }
              }
            }

            setMatched = condense(setMatched)
          }

          push.apply(results, setMatched)

          if (
            outermost &&
            !seed &&
            setMatched.length > 0 &&
            matchedCount + setMatchers.length > 1
          ) {
            Sizzle.uniqueSort(results)
          }
        }

        if (outermost) {
          dirruns = dirrunsUnique
          outermostContext = contextBackup
        }

        return unmatched
      }

      return bySet ? markFunction(superMatcher) : superMatcher
    }

    compile = Sizzle.compile = function(selector, match) {
      var i

      var setMatchers = []

      var elementMatchers = []

      var cached = compilerCache[selector + ' ']

      if (!cached) {
        if (!match) {
          match = tokenize(selector)
        }
        i = match.length
        while (i--) {
          cached = matcherFromTokens(match[i])
          if (cached[expando]) {
            setMatchers.push(cached)
          } else {
            elementMatchers.push(cached)
          }
        }

        cached = compilerCache(
          selector,
          matcherFromGroupMatchers(elementMatchers, setMatchers)
        )

        cached.selector = selector
      }
      return cached
    }

    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param {String|Function} selector A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param {Element} context
     * @param {Array} [results]
     * @param {Array} [seed] A set of elements to match against
     */
    select = Sizzle.select = function(selector, context, results, seed) {
      var i

      var tokens

      var token

      var type

      var find

      var compiled = typeof selector === 'function' && selector

      var match = !seed && tokenize((selector = compiled.selector || selector))

      results = results || []

      if (match.length === 1) {
        tokens = match[0] = match[0].slice(0)
        if (
          tokens.length > 2 &&
          (token = tokens[0]).type === 'ID' &&
          context.nodeType === 9 &&
          documentIsHTML &&
          Expr.relative[tokens[1].type]
        ) {
          context = (Expr.find['ID'](
            token.matches[0].replace(runescape, funescape),
            context
          ) || [])[0]
          if (!context) {
            return results
          } else if (compiled) {
            context = context.parentNode
          }

          selector = selector.slice(tokens.shift().value.length)
        }

        i = matchExpr['needsContext'].test(selector) ? 0 : tokens.length
        while (i--) {
          token = tokens[i]

          if (Expr.relative[(type = token.type)]) {
            break
          }
          if ((find = Expr.find[type])) {
            if (
              (seed = find(
                token.matches[0].replace(runescape, funescape),
                (rsibling.test(tokens[0].type) &&
                  testContext(context.parentNode)) ||
                  context
              ))
            ) {
              tokens.splice(i, 1)
              selector = seed.length && toSelector(tokens)
              if (!selector) {
                push.apply(results, seed)
                return results
              }

              break
            }
          }
        }
      }

      ;(compiled || compile(selector, match))(
        seed,
        context,
        !documentIsHTML,
        results,
        !context ||
          (rsibling.test(selector) && testContext(context.parentNode)) ||
          context
      )
      return results
    }

    support.sortStable =
      expando
        .split('')
        .sort(sortOrder)
        .join('') === expando

    support.detectDuplicates = !!hasDuplicate

    setDocument()

    support.sortDetached = assert(function(el) {
      return el.compareDocumentPosition(document.createElement('fieldset')) & 1
    })

    if (
      !assert(function(el) {
        el.innerHTML = "<a href='#'></a>"
        return el.firstChild.getAttribute('href') === '#'
      })
    ) {
      addHandle('type|href|height|width', function(elem, name, isXML) {
        if (!isXML) {
          return elem.getAttribute(name, name.toLowerCase() === 'type' ? 1 : 2)
        }
      })
    }

    if (
      !support.attributes ||
      !assert(function(el) {
        el.innerHTML = '<input/>'
        el.firstChild.setAttribute('value', '')
        return el.firstChild.getAttribute('value') === ''
      })
    ) {
      addHandle('value', function(elem, name, isXML) {
        if (!isXML && elem.nodeName.toLowerCase() === 'input') {
          return elem.defaultValue
        }
      })
    }

    if (
      !assert(function(el) {
        return el.getAttribute('disabled') == null
      })
    ) {
      addHandle(booleans, function(elem, name, isXML) {
        var val
        if (!isXML) {
          return elem[name] === true
            ? name.toLowerCase()
            : (val = elem.getAttributeNode(name)) && val.specified
              ? val.value
              : null
        }
      })
    }

    return Sizzle
  })(window)

  SlimJQ.find = Sizzle
  SlimJQ.expr = Sizzle.selectors

  SlimJQ.expr[':'] = SlimJQ.expr.pseudos
  SlimJQ.uniqueSort = SlimJQ.unique = Sizzle.uniqueSort
  SlimJQ.text = Sizzle.getText
  SlimJQ.isXMLDoc = Sizzle.isXML
  SlimJQ.contains = Sizzle.contains
  SlimJQ.escapeSelector = Sizzle.escape

  var dir = function(elem, dir, until) {
    var matched = []

    var truncate = until !== undefined

    while ((elem = elem[dir]) && elem.nodeType !== 9) {
      if (elem.nodeType === 1) {
        if (truncate && SlimJQ(elem).is(until)) {
          break
        }
        matched.push(elem)
      }
    }
    return matched
  }

  var siblings = function(n, elem) {
    var matched = []

    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== elem) {
        matched.push(n)
      }
    }

    return matched
  }

  var rneedsContext = SlimJQ.expr.match.needsContext

  function nodeName(elem, name) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase()
  }
  var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i

  function winnow(elements, qualifier, not) {
    if (isFunction(qualifier)) {
      return SlimJQ.grep(elements, function(elem, i) {
        return !!qualifier.call(elem, i, elem) !== not
      })
    }

    if (qualifier.nodeType) {
      return SlimJQ.grep(elements, function(elem) {
        return (elem === qualifier) !== not
      })
    }

    if (typeof qualifier !== 'string') {
      return SlimJQ.grep(elements, function(elem) {
        return indexOf.call(qualifier, elem) > -1 !== not
      })
    }

    return SlimJQ.filter(qualifier, elements, not)
  }

  SlimJQ.filter = function(expr, elems, not) {
    var elem = elems[0]

    if (not) {
      expr = ':not(' + expr + ')'
    }

    if (elems.length === 1 && elem.nodeType === 1) {
      return SlimJQ.find.matchesSelector(elem, expr) ? [elem] : []
    }

    return SlimJQ.find.matches(
      expr,
      SlimJQ.grep(elems, function(elem) {
        return elem.nodeType === 1
      })
    )
  }

  SlimJQ.fn.extend({
    find: function(selector) {
      var i

      var ret

      var len = this.length

      var self = this

      if (typeof selector !== 'string') {
        return this.pushStack(
          SlimJQ(selector).filter(function() {
            for (i = 0; i < len; i++) {
              if (SlimJQ.contains(self[i], this)) {
                return true
              }
            }
          })
        )
      }

      ret = this.pushStack([])

      for (i = 0; i < len; i++) {
        SlimJQ.find(selector, self[i], ret)
      }

      return len > 1 ? SlimJQ.uniqueSort(ret) : ret
    },
    filter: function(selector) {
      return this.pushStack(winnow(this, selector || [], false))
    },
    not: function(selector) {
      return this.pushStack(winnow(this, selector || [], true))
    },
    is: function(selector) {
      return !!winnow(
        this,

        typeof selector === 'string' && rneedsContext.test(selector)
          ? SlimJQ(selector)
          : selector || [],
        false
      ).length
    }
  })

  var rootSlimJQ

  var rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/

  var init = (SlimJQ.fn.Init = function(selector, context, root) {
    var match, elem

    if (!selector) {
      return this
    }

    root = root || rootSlimJQ

    if (typeof selector === 'string') {
      if (
        selector[0] === '<' &&
        selector[selector.length - 1] === '>' &&
        selector.length >= 3
      ) {
        match = [null, selector, null]
      } else {
        match = rquickExpr.exec(selector)
      }

      if (match && (match[1] || !context)) {
        if (match[1]) {
          context = context instanceof SlimJQ ? context[0] : context

          SlimJQ.merge(
            this,
            SlimJQ.parseHTML(
              match[1],
              context && context.nodeType
                ? context.ownerDocument || context
                : document,
              true
            )
          )

          if (rsingleTag.test(match[1]) && SlimJQ.isPlainObject(context)) {
            for (match in context) {
              if (isFunction(this[match])) {
                this[match](context[match])
              } else {
                this.attr(match, context[match])
              }
            }
          }

          return this
        } else {
          elem = document.getElementById(match[2])

          if (elem) {
            this[0] = elem
            this.length = 1
          }
          return this
        }
      } else if (!context || context.slimJQ) {
        return (context || root).find(selector)
      } else {
        return this.constructor(context).find(selector)
      }
    } else if (selector.nodeType) {
      this[0] = selector
      this.length = 1
      return this
    } else if (isFunction(selector)) {
      return root.ready !== undefined ? root.ready(selector) : selector(SlimJQ)
    }

    return SlimJQ.makeArray(selector, this)
  })

  init.prototype = SlimJQ.fn

  rootSlimJQ = SlimJQ(document)

  var rparentsprev = /^(?:parents|prev(?:Until|All))/

  var guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true
  }

  SlimJQ.fn.extend({
    has: function(target) {
      var targets = SlimJQ(target, this)

      var l = targets.length

      return this.filter(function() {
        var i = 0
        for (; i < l; i++) {
          if (SlimJQ.contains(this, targets[i])) {
            return true
          }
        }
      })
    },

    closest: function(selectors, context) {
      var cur

      var i = 0

      var l = this.length

      var matched = []

      var targets = typeof selectors !== 'string' && SlimJQ(selectors)

      if (!rneedsContext.test(selectors)) {
        for (; i < l; i++) {
          for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
            if (
              cur.nodeType < 11 &&
              (targets
                ? targets.index(cur) > -1
                : cur.nodeType === 1 &&
                  SlimJQ.find.matchesSelector(cur, selectors))
            ) {
              matched.push(cur)
              break
            }
          }
        }
      }

      return this.pushStack(
        matched.length > 1 ? SlimJQ.uniqueSort(matched) : matched
      )
    },

    index: function(elem) {
      if (!elem) {
        return this[0] && this[0].parentNode
          ? this.first().prevAll().length
          : -1
      }

      if (typeof elem === 'string') {
        return indexOf.call(SlimJQ(elem), this[0])
      }

      return indexOf.call(
        this,

        elem.slimJQ ? elem[0] : elem
      )
    },

    add: function(selector, context) {
      return this.pushStack(
        SlimJQ.uniqueSort(SlimJQ.merge(this.get(), SlimJQ(selector, context)))
      )
    },

    addBack: function(selector) {
      return this.add(
        selector == null ? this.prevObject : this.prevObject.filter(selector)
      )
    }
  })

  function sibling(cur, dir) {
    while ((cur = cur[dir]) && cur.nodeType !== 1) {}
    return cur
  }

  SlimJQ.each(
    {
      parent: function(elem) {
        var parent = elem.parentNode
        return parent && parent.nodeType !== 11 ? parent : null
      },
      parents: function(elem) {
        return dir(elem, 'parentNode')
      },
      parentsUntil: function(elem, i, until) {
        return dir(elem, 'parentNode', until)
      },
      next: function(elem) {
        return sibling(elem, 'nextSibling')
      },
      prev: function(elem) {
        return sibling(elem, 'previousSibling')
      },
      nextAll: function(elem) {
        return dir(elem, 'nextSibling')
      },
      prevAll: function(elem) {
        return dir(elem, 'previousSibling')
      },
      nextUntil: function(elem, i, until) {
        return dir(elem, 'nextSibling', until)
      },
      prevUntil: function(elem, i, until) {
        return dir(elem, 'previousSibling', until)
      },
      siblings: function(elem) {
        return siblings((elem.parentNode || {}).firstChild, elem)
      },
      children: function(elem) {
        return siblings(elem.firstChild)
      },
      contents: function(elem) {
        if (nodeName(elem, 'iframe')) {
          return elem.contentDocument
        }

        if (nodeName(elem, 'template')) {
          elem = elem.content || elem
        }

        return SlimJQ.merge([], elem.childNodes)
      }
    },
    function(name, fn) {
      SlimJQ.fn[name] = function(until, selector) {
        var matched = SlimJQ.map(this, fn, until)

        if (name.slice(-5) !== 'Until') {
          selector = until
        }

        if (selector && typeof selector === 'string') {
          matched = SlimJQ.filter(selector, matched)
        }

        if (this.length > 1) {
          if (!guaranteedUnique[name]) {
            SlimJQ.uniqueSort(matched)
          }

          if (rparentsprev.test(name)) {
            matched.reverse()
          }
        }

        return this.pushStack(matched)
      }
    }
  )
  var rnothtmlwhite = /[^\x20\t\r\n\f]+/g

  function createOptions(options) {
    var object = {}
    SlimJQ.each(options.match(rnothtmlwhite) || [], function(_, flag) {
      object[flag] = true
    })
    return object
  }

  /*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
  SlimJQ.Callbacks = function(options) {
    options =
      typeof options === 'string'
        ? createOptions(options)
        : SlimJQ.extend({}, options)

    var firing

    var memory

    var fired

    var locked

    var list = []

    var queue = []

    var firingIndex = -1

    var fire = function() {
      locked = locked || options.once

      fired = firing = true
      for (; queue.length; firingIndex = -1) {
        memory = queue.shift()
        while (++firingIndex < list.length) {
          if (
            list[firingIndex].apply(memory[0], memory[1]) === false &&
            options.stopOnFalse
          ) {
            firingIndex = list.length
            memory = false
          }
        }
      }

      if (!options.memory) {
        memory = false
      }

      firing = false

      if (locked) {
        if (memory) {
          list = []
        } else {
          list = ''
        }
      }
    }

    var self = {
      add: function() {
        if (list) {
          if (memory && !firing) {
            firingIndex = list.length - 1
            queue.push(memory)
          }

          ;(function add(args) {
            SlimJQ.each(args, function(_, arg) {
              if (isFunction(arg)) {
                if (!options.unique || !self.has(arg)) {
                  list.push(arg)
                }
              } else if (arg && arg.length && toType(arg) !== 'string') {
                add(arg)
              }
            })
          })(arguments)

          if (memory && !firing) {
            fire()
          }
        }
        return this
      },

      remove: function() {
        SlimJQ.each(arguments, function(_, arg) {
          var index
          while ((index = SlimJQ.inArray(arg, list, index)) > -1) {
            list.splice(index, 1)

            if (index <= firingIndex) {
              firingIndex--
            }
          }
        })
        return this
      },

      has: function(fn) {
        return fn ? SlimJQ.inArray(fn, list) > -1 : list.length > 0
      },

      empty: function() {
        if (list) {
          list = []
        }
        return this
      },

      disable: function() {
        locked = queue = []
        list = memory = ''
        return this
      },
      disabled: function() {
        return !list
      },

      lock: function() {
        locked = queue = []
        if (!memory && !firing) {
          list = memory = ''
        }
        return this
      },
      locked: function() {
        return !!locked
      },

      fireWith: function(context, args) {
        if (!locked) {
          args = args || []
          args = [context, args.slice ? args.slice() : args]
          queue.push(args)
          if (!firing) {
            fire()
          }
        }
        return this
      },

      fire: function() {
        self.fireWith(this, arguments)
        return this
      },

      fired: function() {
        return !!fired
      }
    }

    return self
  }

  function Identity(v) {
    return v
  }
  function Thrower(ex) {
    throw ex
  }

  function adoptValue(value, resolve, reject, noValue) {
    var method

    try {
      if (value && isFunction((method = value.promise))) {
        method
          .call(value)
          .done(resolve)
          .fail(reject)
      } else if (value && isFunction((method = value.then))) {
        method.call(value, resolve, reject)
      } else {
        resolve.apply(undefined, [value].slice(noValue))
      }
    } catch (value) {
      reject.apply(undefined, [value])
    }
  }

  SlimJQ.extend({
    Deferred: function(func) {
      var tuples = [
        [
          'notify',
          'progress',
          SlimJQ.Callbacks('memory'),
          SlimJQ.Callbacks('memory'),
          2
        ],
        [
          'resolve',
          'done',
          SlimJQ.Callbacks('once memory'),
          SlimJQ.Callbacks('once memory'),
          0,
          'resolved'
        ],
        [
          'reject',
          'fail',
          SlimJQ.Callbacks('once memory'),
          SlimJQ.Callbacks('once memory'),
          1,
          'rejected'
        ]
      ]

      var state = 'pending'

      var promise = {
        state: function() {
          return state
        },
        always: function() {
          deferred.done(arguments).fail(arguments)
          return this
        },
        catch: function(fn) {
          return promise.then(null, fn)
        },

        pipe: function() {
          var fns = arguments

          return SlimJQ.Deferred(function(newDefer) {
            SlimJQ.each(tuples, function(i, tuple) {
              var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]]

              deferred[tuple[1]](function() {
                var returned = fn && fn.apply(this, arguments)
                if (returned && isFunction(returned.promise)) {
                  returned
                    .promise()
                    .progress(newDefer.notify)
                    .done(newDefer.resolve)
                    .fail(newDefer.reject)
                } else {
                  newDefer[tuple[0] + 'With'](this, fn ? [returned] : arguments)
                }
              })
            })
            fns = null
          }).promise()
        },
        then: function(onFulfilled, onRejected, onProgress) {
          var maxDepth = 0
          function resolve(depth, deferred, handler, special) {
            return function() {
              var that = this

              var args = arguments

              var mightThrow = function() {
                var returned, then

                if (depth < maxDepth) {
                  return
                }

                returned = handler.apply(that, args)

                if (returned === deferred.promise()) {
                  throw new TypeError('Thenable self-resolution')
                }

                then =
                  returned &&
                  (typeof returned === 'object' ||
                    typeof returned === 'function') &&
                  returned.then

                if (isFunction(then)) {
                  if (special) {
                    then.call(
                      returned,
                      resolve(maxDepth, deferred, Identity, special),
                      resolve(maxDepth, deferred, Thrower, special)
                    )
                  } else {
                    maxDepth++

                    then.call(
                      returned,
                      resolve(maxDepth, deferred, Identity, special),
                      resolve(maxDepth, deferred, Thrower, special),
                      resolve(maxDepth, deferred, Identity, deferred.notifyWith)
                    )
                  }
                } else {
                  if (handler !== Identity) {
                    that = undefined
                    args = [returned]
                  }

                  ;(special || deferred.resolveWith)(that, args)
                }
              }

              var process = special
                ? mightThrow
                : function() {
                  try {
                    mightThrow()
                  } catch (e) {
                    if (SlimJQ.Deferred.exceptionHook) {
                      SlimJQ.Deferred.exceptionHook(e, process.stackTrace)
                    }

                    if (depth + 1 >= maxDepth) {
                      if (handler !== Thrower) {
                        that = undefined
                        args = [e]
                      }

                      deferred.rejectWith(that, args)
                    }
                  }
                }

              if (depth) {
                process()
              } else {
                if (SlimJQ.Deferred.getStackHook) {
                  process.stackTrace = SlimJQ.Deferred.getStackHook()
                }
                window.setTimeout(process)
              }
            }
          }

          return SlimJQ.Deferred(function(newDefer) {
            tuples[0][3].add(
              resolve(
                0,
                newDefer,
                isFunction(onProgress) ? onProgress : Identity,
                newDefer.notifyWith
              )
            )

            tuples[1][3].add(
              resolve(
                0,
                newDefer,
                isFunction(onFulfilled) ? onFulfilled : Identity
              )
            )

            tuples[2][3].add(
              resolve(
                0,
                newDefer,
                isFunction(onRejected) ? onRejected : Thrower
              )
            )
          }).promise()
        },

        promise: function(obj) {
          return obj != null ? SlimJQ.extend(obj, promise) : promise
        }
      }

      var deferred = {}

      SlimJQ.each(tuples, function(i, tuple) {
        var list = tuple[2]

        var stateString = tuple[5]

        promise[tuple[1]] = list.add

        if (stateString) {
          list.add(
            function() {
              state = stateString
            },

            tuples[3 - i][2].disable,

            tuples[3 - i][3].disable,

            tuples[0][2].lock,

            tuples[0][3].lock
          )
        }

        list.add(tuple[3].fire)

        deferred[tuple[0]] = function() {
          deferred[tuple[0] + 'With'](
            this === deferred ? undefined : this,
            arguments
          )
          return this
        }

        deferred[tuple[0] + 'With'] = list.fireWith
      })

      promise.promise(deferred)

      if (func) {
        func.call(deferred, deferred)
      }

      return deferred
    },

    when: function(singleValue) {
      var remaining = arguments.length

      var i = remaining

      var resolveContexts = Array(i)

      var resolveValues = slice.call(arguments)

      var master = SlimJQ.Deferred()

      var updateFunc = function(i) {
        return function(value) {
          resolveContexts[i] = this
          resolveValues[i] =
            arguments.length > 1 ? slice.call(arguments) : value
          if (!--remaining) {
            master.resolveWith(resolveContexts, resolveValues)
          }
        }
      }

      if (remaining <= 1) {
        adoptValue(
          singleValue,
          master.done(updateFunc(i)).resolve,
          master.reject,
          !remaining
        )

        if (
          master.state() === 'pending' ||
          isFunction(resolveValues[i] && resolveValues[i].then)
        ) {
          return master.then()
        }
      }

      while (i--) {
        adoptValue(resolveValues[i], updateFunc(i), master.reject)
      }

      return master.promise()
    }
  })

  var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/

  SlimJQ.Deferred.exceptionHook = function(error, stack) {
    if (
      window.console &&
      window.console.warn &&
      error &&
      rerrorNames.test(error.name)
    ) {
      window.console.warn(
        'SlimJQ.Deferred exception: ' + error.message,
        error.stack,
        stack
      )
    }
  }

  SlimJQ.readyException = function(error) {
    window.setTimeout(function() {
      throw error
    })
  }

  var readyList = SlimJQ.Deferred()

  SlimJQ.fn.ready = function(fn) {
    readyList
      .then(fn)

      .catch(function(error) {
        SlimJQ.readyException(error)
      })

    return this
  }

  SlimJQ.extend({
    isReady: false,

    readyWait: 1,

    ready: function(wait) {
      if (wait === true ? --SlimJQ.readyWait : SlimJQ.isReady) {
        return
      }

      SlimJQ.isReady = true

      if (wait !== true && --SlimJQ.readyWait > 0) {
        return
      }

      readyList.resolveWith(document, [SlimJQ])
    }
  })

  SlimJQ.ready.then = readyList.then

  function completed() {
    document.removeEventListener('DOMContentLoaded', completed)
    window.removeEventListener('load', completed)
    SlimJQ.ready()
  }

  if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
  ) {
    window.setTimeout(SlimJQ.ready)
  } else {
    document.addEventListener('DOMContentLoaded', completed)

    window.addEventListener('load', completed)
  }

  var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
    var i = 0

    var len = elems.length

    var bulk = key == null

    if (toType(key) === 'object') {
      chainable = true
      for (i in key) {
        access(elems, fn, i, key[i], true, emptyGet, raw)
      }
    } else if (value !== undefined) {
      chainable = true

      if (!isFunction(value)) {
        raw = true
      }

      if (bulk) {
        if (raw) {
          fn.call(elems, value)
          fn = null
        } else {
          bulk = fn
          fn = function(elem, key, value) {
            return bulk.call(SlimJQ(elem), value)
          }
        }
      }

      if (fn) {
        for (; i < len; i++) {
          fn(
            elems[i],
            key,
            raw ? value : value.call(elems[i], i, fn(elems[i], key))
          )
        }
      }
    }

    if (chainable) {
      return elems
    }

    if (bulk) {
      return fn.call(elems)
    }

    return len ? fn(elems[0], key) : emptyGet
  }

  var rmsPrefix = /^-ms-/

  var rdashAlpha = /-([a-z])/g

  function fcamelCase(all, letter) {
    return letter.toUpperCase()
  }

  function camelCase(string) {
    return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase)
  }
  var acceptData = function(owner) {
    return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType
  }

  function Data() {
    this.expando = SlimJQ.expando + Data.uid++
  }

  Data.uid = 1

  Data.prototype = {
    cache: function(owner) {
      var value = owner[this.expando]

      if (!value) {
        value = {}

        if (acceptData(owner)) {
          if (owner.nodeType) {
            owner[this.expando] = value
          } else {
            Object.defineProperty(owner, this.expando, {
              value: value,
              configurable: true
            })
          }
        }
      }

      return value
    },
    set: function(owner, data, value) {
      var prop

      var cache = this.cache(owner)

      if (typeof data === 'string') {
        cache[camelCase(data)] = value
      } else {
        for (prop in data) {
          cache[camelCase(prop)] = data[prop]
        }
      }
      return cache
    },
    get: function(owner, key) {
      return key === undefined
        ? this.cache(owner)
        : owner[this.expando] && owner[this.expando][camelCase(key)]
    },
    access: function(owner, key, value) {
      if (
        key === undefined ||
        (key && typeof key === 'string' && value === undefined)
      ) {
        return this.get(owner, key)
      }

      this.set(owner, key, value)

      return value !== undefined ? value : key
    },
    remove: function(owner, key) {
      var i

      var cache = owner[this.expando]

      if (cache === undefined) {
        return
      }

      if (key !== undefined) {
        if (Array.isArray(key)) {
          key = key.map(camelCase)
        } else {
          key = camelCase(key)

          key = key in cache ? [key] : key.match(rnothtmlwhite) || []
        }

        i = key.length

        while (i--) {
          delete cache[key[i]]
        }
      }

      if (key === undefined || SlimJQ.isEmptyObject(cache)) {
        if (owner.nodeType) {
          owner[this.expando] = undefined
        } else {
          delete owner[this.expando]
        }
      }
    },
    hasData: function(owner) {
      var cache = owner[this.expando]
      return cache !== undefined && !SlimJQ.isEmptyObject(cache)
    }
  }
  var dataPriv = new Data()

  var dataUser = new Data()

  var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/

  var rmultiDash = /[A-Z]/g

  function getData(data) {
    if (data === 'true') {
      return true
    }

    if (data === 'false') {
      return false
    }

    if (data === 'null') {
      return null
    }

    if (data === +data + '') {
      return +data
    }

    if (rbrace.test(data)) {
      return JSON.parse(data)
    }

    return data
  }

  function dataAttr(elem, key, data) {
    var name

    if (data === undefined && elem.nodeType === 1) {
      name = 'data-' + key.replace(rmultiDash, '-$&').toLowerCase()
      data = elem.getAttribute(name)

      if (typeof data === 'string') {
        try {
          data = getData(data)
        } catch (e) {}

        dataUser.set(elem, key, data)
      } else {
        data = undefined
      }
    }
    return data
  }

  SlimJQ.extend({
    hasData: function(elem) {
      return dataUser.hasData(elem) || dataPriv.hasData(elem)
    },

    data: function(elem, name, data) {
      return dataUser.access(elem, name, data)
    },

    removeData: function(elem, name) {
      dataUser.remove(elem, name)
    },

    _data: function(elem, name, data) {
      return dataPriv.access(elem, name, data)
    },

    _removeData: function(elem, name) {
      dataPriv.remove(elem, name)
    }
  })

  SlimJQ.fn.extend({
    data: function(key, value) {
      var i

      var name

      var data

      var elem = this[0]

      var attrs = elem && elem.attributes

      if (key === undefined) {
        if (this.length) {
          data = dataUser.get(elem)

          if (elem.nodeType === 1 && !dataPriv.get(elem, 'hasDataAttrs')) {
            i = attrs.length
            while (i--) {
              if (attrs[i]) {
                name = attrs[i].name
                if (name.indexOf('data-') === 0) {
                  name = camelCase(name.slice(5))
                  dataAttr(elem, name, data[name])
                }
              }
            }
            dataPriv.set(elem, 'hasDataAttrs', true)
          }
        }

        return data
      }

      if (typeof key === 'object') {
        return this.each(function() {
          dataUser.set(this, key)
        })
      }

      return access(
        this,
        function(value) {
          var data

          if (elem && value === undefined) {
            data = dataUser.get(elem, key)
            if (data !== undefined) {
              return data
            }

            data = dataAttr(elem, key)
            if (data !== undefined) {
              return data
            }

            return
          }

          this.each(function() {
            dataUser.set(this, key, value)
          })
        },
        null,
        value,
        arguments.length > 1,
        null,
        true
      )
    },

    removeData: function(key) {
      return this.each(function() {
        dataUser.remove(this, key)
      })
    }
  })

  SlimJQ.extend({
    queue: function(elem, type, data) {
      var queue

      if (elem) {
        type = (type || 'fx') + 'queue'
        queue = dataPriv.get(elem, type)

        if (data) {
          if (!queue || Array.isArray(data)) {
            queue = dataPriv.access(elem, type, SlimJQ.makeArray(data))
          } else {
            queue.push(data)
          }
        }
        return queue || []
      }
    },

    dequeue: function(elem, type) {
      type = type || 'fx'

      var queue = SlimJQ.queue(elem, type)

      var startLength = queue.length

      var fn = queue.shift()

      var hooks = SlimJQ._queueHooks(elem, type)

      var next = function() {
        SlimJQ.dequeue(elem, type)
      }

      if (fn === 'inprogress') {
        fn = queue.shift()
        startLength--
      }

      if (fn) {
        if (type === 'fx') {
          queue.unshift('inprogress')
        }

        delete hooks.stop
        fn.call(elem, next, hooks)
      }

      if (!startLength && hooks) {
        hooks.empty.fire()
      }
    },

    _queueHooks: function(elem, type) {
      var key = type + 'queueHooks'
      return (
        dataPriv.get(elem, key) ||
        dataPriv.access(elem, key, {
          empty: SlimJQ.Callbacks('once memory').add(function() {
            dataPriv.remove(elem, [type + 'queue', key])
          })
        })
      )
    }
  })

  SlimJQ.fn.extend({
    queue: function(type, data) {
      var setter = 2

      if (typeof type !== 'string') {
        data = type
        type = 'fx'
        setter--
      }

      if (arguments.length < setter) {
        return SlimJQ.queue(this[0], type)
      }

      return data === undefined
        ? this
        : this.each(function() {
          var queue = SlimJQ.queue(this, type, data)

          SlimJQ._queueHooks(this, type)

          if (type === 'fx' && queue[0] !== 'inprogress') {
            SlimJQ.dequeue(this, type)
          }
        })
    },
    dequeue: function(type) {
      return this.each(function() {
        SlimJQ.dequeue(this, type)
      })
    },
    clearQueue: function(type) {
      return this.queue(type || 'fx', [])
    },

    promise: function(type, obj) {
      var tmp

      var count = 1

      var defer = SlimJQ.Deferred()

      var elements = this

      var i = this.length

      var resolve = function() {
        if (!--count) {
          defer.resolveWith(elements, [elements])
        }
      }

      if (typeof type !== 'string') {
        obj = type
        type = undefined
      }
      type = type || 'fx'

      while (i--) {
        tmp = dataPriv.get(elements[i], type + 'queueHooks')
        if (tmp && tmp.empty) {
          count++
          tmp.empty.add(resolve)
        }
      }
      resolve()
      return defer.promise(obj)
    }
  })
  var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source

  var rcssNum = new RegExp('^(?:([+-])=|)(' + pnum + ')([a-z%]*)$', 'i')

  var cssExpand = ['Top', 'Right', 'Bottom', 'Left']

  var isHiddenWithinTree = function(elem, el) {
    elem = el || elem

    return (
      elem.style.display === 'none' ||
      (elem.style.display === '' &&
        SlimJQ.contains(elem.ownerDocument, elem) &&
        SlimJQ.css(elem, 'display') === 'none')
    )
  }

  var swap = function(elem, options, callback, args) {
    var ret

    var name

    var old = {}

    for (name in options) {
      old[name] = elem.style[name]
      elem.style[name] = options[name]
    }

    ret = callback.apply(elem, args || [])

    for (name in options) {
      elem.style[name] = old[name]
    }

    return ret
  }

  function adjustCSS(elem, prop, valueParts, tween) {
    var adjusted

    var scale

    var maxIterations = 20

    var currentValue = tween
      ? function() {
        return tween.cur()
      }
      : function() {
        return SlimJQ.css(elem, prop, '')
      }

    var initial = currentValue()

    var unit =
      (valueParts && valueParts[3]) || (SlimJQ.cssNumber[prop] ? '' : 'px')

    var initialInUnit =
      (SlimJQ.cssNumber[prop] || (unit !== 'px' && +initial)) &&
      rcssNum.exec(SlimJQ.css(elem, prop))

    if (initialInUnit && initialInUnit[3] !== unit) {
      initial = initial / 2

      unit = unit || initialInUnit[3]

      initialInUnit = +initial || 1

      while (maxIterations--) {
        SlimJQ.style(elem, prop, initialInUnit + unit)
        if (
          (1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <=
          0
        ) {
          maxIterations = 0
        }
        initialInUnit = initialInUnit / scale
      }

      initialInUnit = initialInUnit * 2
      SlimJQ.style(elem, prop, initialInUnit + unit)

      valueParts = valueParts || []
    }

    if (valueParts) {
      initialInUnit = +initialInUnit || +initial || 0

      adjusted = valueParts[1]
        ? initialInUnit + (valueParts[1] + 1) * valueParts[2]
        : +valueParts[2]
      if (tween) {
        tween.unit = unit
        tween.start = initialInUnit
        tween.end = adjusted
      }
    }
    return adjusted
  }

  var defaultDisplayMap = {}

  function getDefaultDisplay(elem) {
    var temp

    var doc = elem.ownerDocument

    var nodeName = elem.nodeName

    var display = defaultDisplayMap[nodeName]

    if (display) {
      return display
    }

    temp = doc.body.appendChild(doc.createElement(nodeName))
    display = SlimJQ.css(temp, 'display')

    temp.parentNode.removeChild(temp)

    if (display === 'none') {
      display = 'block'
    }
    defaultDisplayMap[nodeName] = display

    return display
  }

  function showHide(elements, show) {
    var display

    var elem

    var values = []

    var index = 0

    var length = elements.length

    for (; index < length; index++) {
      elem = elements[index]
      if (!elem.style) {
        continue
      }

      display = elem.style.display
      if (show) {
        if (display === 'none') {
          values[index] = dataPriv.get(elem, 'display') || null
          if (!values[index]) {
            elem.style.display = ''
          }
        }
        if (elem.style.display === '' && isHiddenWithinTree(elem)) {
          values[index] = getDefaultDisplay(elem)
        }
      } else {
        if (display !== 'none') {
          values[index] = 'none'

          dataPriv.set(elem, 'display', display)
        }
      }
    }

    for (index = 0; index < length; index++) {
      if (values[index] != null) {
        elements[index].style.display = values[index]
      }
    }

    return elements
  }

  SlimJQ.fn.extend({
    show: function() {
      return showHide(this, true)
    },
    hide: function() {
      return showHide(this)
    },
    toggle: function(state) {
      if (typeof state === 'boolean') {
        return state ? this.show() : this.hide()
      }

      return this.each(function() {
        if (isHiddenWithinTree(this)) {
          SlimJQ(this).show()
        } else {
          SlimJQ(this).hide()
        }
      })
    }
  })
  var rcheckableType = /^(?:checkbox|radio)$/i

  var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i

  var rscriptType = /^$|^module$|\/(?:java|ecma)script/i

  var wrapMap = {
    option: [1, "<select multiple='multiple'>", '</select>'],

    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],

    _default: [0, '', '']
  }

  wrapMap.optgroup = wrapMap.option

  wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption =
    wrapMap.thead
  wrapMap.th = wrapMap.td

  function getAll(context, tag) {
    var ret

    if (typeof context.getElementsByTagName !== 'undefined') {
      ret = context.getElementsByTagName(tag || '*')
    } else if (typeof context.querySelectorAll !== 'undefined') {
      ret = context.querySelectorAll(tag || '*')
    } else {
      ret = []
    }

    if (tag === undefined || (tag && nodeName(context, tag))) {
      return SlimJQ.merge([context], ret)
    }

    return ret
  }

  function setGlobalEval(elems, refElements) {
    var i = 0

    var l = elems.length

    for (; i < l; i++) {
      dataPriv.set(
        elems[i],
        'globalEval',
        !refElements || dataPriv.get(refElements[i], 'globalEval')
      )
    }
  }

  var rhtml = /<|&#?\w+;/

  function buildFragment(elems, context, scripts, selection, ignored) {
    var elem

    var tmp

    var tag

    var wrap

    var contains

    var j

    var fragment = context.createDocumentFragment()

    var nodes = []

    var i = 0

    var l = elems.length

    for (; i < l; i++) {
      elem = elems[i]

      if (elem || elem === 0) {
        if (toType(elem) === 'object') {
          SlimJQ.merge(nodes, elem.nodeType ? [elem] : elem)
        } else if (!rhtml.test(elem)) {
          nodes.push(context.createTextNode(elem))
        } else {
          tmp = tmp || fragment.appendChild(context.createElement('div'))

          tag = (rtagName.exec(elem) || ['', ''])[1].toLowerCase()
          wrap = wrapMap[tag] || wrapMap._default
          tmp.innerHTML = wrap[1] + SlimJQ.htmlPrefilter(elem) + wrap[2]

          j = wrap[0]
          while (j--) {
            tmp = tmp.lastChild
          }

          SlimJQ.merge(nodes, tmp.childNodes)

          tmp = fragment.firstChild

          tmp.textContent = ''
        }
      }
    }

    fragment.textContent = ''

    i = 0
    while ((elem = nodes[i++])) {
      if (selection && SlimJQ.inArray(elem, selection) > -1) {
        if (ignored) {
          ignored.push(elem)
        }
        continue
      }

      contains = SlimJQ.contains(elem.ownerDocument, elem)

      tmp = getAll(fragment.appendChild(elem), 'script')

      if (contains) {
        setGlobalEval(tmp)
      }

      if (scripts) {
        j = 0
        while ((elem = tmp[j++])) {
          if (rscriptType.test(elem.type || '')) {
            scripts.push(elem)
          }
        }
      }
    }

    return fragment
  }

  ;(function() {
    var fragment = document.createDocumentFragment()

    var div = fragment.appendChild(document.createElement('div'))

    var input = document.createElement('input')

    input.setAttribute('type', 'radio')
    input.setAttribute('checked', 'checked')
    input.setAttribute('name', 't')

    div.appendChild(input)

    support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked

    div.innerHTML = '<textarea>x</textarea>'
    support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue
  })()
  var documentElement = document.documentElement

  var rkeyEvent = /^key/

  var rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/

  var rtypenamespace = /^([^.]*)(?:\.(.+)|)/

  function returnTrue() {
    return true
  }

  function returnFalse() {
    return false
  }

  function safeActiveElement() {
    try {
      return document.activeElement
    } catch (err) {}
  }

  function on(elem, types, selector, data, fn, one) {
    var origFn, type

    if (typeof types === 'object') {
      if (typeof selector !== 'string') {
        data = data || selector
        selector = undefined
      }
      for (type in types) {
        on(elem, type, selector, data, types[type], one)
      }
      return elem
    }

    if (data == null && fn == null) {
      fn = selector
      data = selector = undefined
    } else if (fn == null) {
      if (typeof selector === 'string') {
        fn = data
        data = undefined
      } else {
        fn = data
        data = selector
        selector = undefined
      }
    }
    if (fn === false) {
      fn = returnFalse
    } else if (!fn) {
      return elem
    }

    if (one === 1) {
      origFn = fn
      fn = function(event) {
        SlimJQ().off(event)
        return origFn.apply(this, arguments)
      }

      fn.guid = origFn.guid || (origFn.guid = SlimJQ.guid++)
    }
    return elem.each(function() {
      SlimJQ.event.add(this, types, fn, data, selector)
    })
  }

  /*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
  SlimJQ.event = {
    global: {},

    add: function(elem, types, handler, data, selector) {
      var handleObjIn

      var eventHandle

      var tmp

      var events

      var t

      var handleObj

      var special

      var handlers

      var type

      var namespaces

      var origType

      var elemData = dataPriv.get(elem)

      if (!elemData) {
        return
      }

      if (handler.handler) {
        handleObjIn = handler
        handler = handleObjIn.handler
        selector = handleObjIn.selector
      }

      if (selector) {
        SlimJQ.find.matchesSelector(documentElement, selector)
      }

      if (!handler.guid) {
        handler.guid = SlimJQ.guid++
      }

      if (!(events = elemData.events)) {
        events = elemData.events = {}
      }
      if (!(eventHandle = elemData.handle)) {
        eventHandle = elemData.handle = function(e) {
          return typeof SlimJQ !== 'undefined' &&
            SlimJQ.event.triggered !== e.type
            ? SlimJQ.event.dispatch.apply(elem, arguments)
            : undefined
        }
      }

      types = (types || '').match(rnothtmlwhite) || ['']
      t = types.length
      while (t--) {
        tmp = rtypenamespace.exec(types[t]) || []
        type = origType = tmp[1]
        namespaces = (tmp[2] || '').split('.').sort()

        if (!type) {
          continue
        }

        special = SlimJQ.event.special[type] || {}

        type = (selector ? special.delegateType : special.bindType) || type

        special = SlimJQ.event.special[type] || {}

        handleObj = SlimJQ.extend(
          {
            type: type,
            origType: origType,
            data: data,
            handler: handler,
            guid: handler.guid,
            selector: selector,
            needsContext:
              selector && SlimJQ.expr.match.needsContext.test(selector),
            namespace: namespaces.join('.')
          },
          handleObjIn
        )

        if (!(handlers = events[type])) {
          handlers = events[type] = []
          handlers.delegateCount = 0

          if (
            !special.setup ||
            special.setup.call(elem, data, namespaces, eventHandle) === false
          ) {
            if (elem.addEventListener) {
              elem.addEventListener(type, eventHandle)
            }
          }
        }

        if (special.add) {
          special.add.call(elem, handleObj)

          if (!handleObj.handler.guid) {
            handleObj.handler.guid = handler.guid
          }
        }

        if (selector) {
          handlers.splice(handlers.delegateCount++, 0, handleObj)
        } else {
          handlers.push(handleObj)
        }

        SlimJQ.event.global[type] = true
      }
    },

    remove: function(elem, types, handler, selector, mappedTypes) {
      var j

      var origCount

      var tmp

      var events

      var t

      var handleObj

      var special

      var handlers

      var type

      var namespaces

      var origType

      var elemData = dataPriv.hasData(elem) && dataPriv.get(elem)

      if (!elemData || !(events = elemData.events)) {
        return
      }

      types = (types || '').match(rnothtmlwhite) || ['']
      t = types.length
      while (t--) {
        tmp = rtypenamespace.exec(types[t]) || []
        type = origType = tmp[1]
        namespaces = (tmp[2] || '').split('.').sort()

        if (!type) {
          for (type in events) {
            SlimJQ.event.remove(elem, type + types[t], handler, selector, true)
          }
          continue
        }

        special = SlimJQ.event.special[type] || {}
        type = (selector ? special.delegateType : special.bindType) || type
        handlers = events[type] || []
        tmp =
          tmp[2] &&
          new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)')

        origCount = j = handlers.length
        while (j--) {
          handleObj = handlers[j]

          if (
            (mappedTypes || origType === handleObj.origType) &&
            (!handler || handler.guid === handleObj.guid) &&
            (!tmp || tmp.test(handleObj.namespace)) &&
            (!selector ||
              selector === handleObj.selector ||
              (selector === '**' && handleObj.selector))
          ) {
            handlers.splice(j, 1)

            if (handleObj.selector) {
              handlers.delegateCount--
            }
            if (special.remove) {
              special.remove.call(elem, handleObj)
            }
          }
        }

        if (origCount && !handlers.length) {
          if (
            !special.teardown ||
            special.teardown.call(elem, namespaces, elemData.handle) === false
          ) {
            SlimJQ.removeEvent(elem, type, elemData.handle)
          }

          delete events[type]
        }
      }

      if (SlimJQ.isEmptyObject(events)) {
        dataPriv.remove(elem, 'handle events')
      }
    },

    dispatch: function(nativeEvent) {
      var event = SlimJQ.event.fix(nativeEvent)

      var i

      var j

      var ret

      var matched

      var handleObj

      var handlerQueue

      var args = new Array(arguments.length)

      var handlers = (dataPriv.get(this, 'events') || {})[event.type] || []

      var special = SlimJQ.event.special[event.type] || {}

      args[0] = event

      for (i = 1; i < arguments.length; i++) {
        args[i] = arguments[i]
      }

      event.delegateTarget = this

      if (
        special.preDispatch &&
        special.preDispatch.call(this, event) === false
      ) {
        return
      }

      handlerQueue = SlimJQ.event.handlers.call(this, event, handlers)

      i = 0
      while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
        event.currentTarget = matched.elem

        j = 0
        while (
          (handleObj = matched.handlers[j++]) &&
          !event.isImmediatePropagationStopped()
        ) {
          if (!event.rnamespace || event.rnamespace.test(handleObj.namespace)) {
            event.handleObj = handleObj
            event.data = handleObj.data

            ret = (
              (SlimJQ.event.special[handleObj.origType] || {}).handle ||
              handleObj.handler
            ).apply(matched.elem, args)

            if (ret !== undefined) {
              if ((event.result = ret) === false) {
                event.preventDefault()
                event.stopPropagation()
              }
            }
          }
        }
      }

      if (special.postDispatch) {
        special.postDispatch.call(this, event)
      }

      return event.result
    },

    handlers: function(event, handlers) {
      var i

      var handleObj

      var sel

      var matchedHandlers

      var matchedSelectors

      var handlerQueue = []

      var delegateCount = handlers.delegateCount

      var cur = event.target

      if (
        delegateCount &&
        cur.nodeType &&
        !(event.type === 'click' && event.button >= 1)
      ) {
        for (; cur !== this; cur = cur.parentNode || this) {
          if (
            cur.nodeType === 1 &&
            !(event.type === 'click' && cur.disabled === true)
          ) {
            matchedHandlers = []
            matchedSelectors = {}
            for (i = 0; i < delegateCount; i++) {
              handleObj = handlers[i]

              sel = handleObj.selector + ' '

              if (matchedSelectors[sel] === undefined) {
                matchedSelectors[sel] = handleObj.needsContext
                  ? SlimJQ(sel, this).index(cur) > -1
                  : SlimJQ.find(sel, this, null, [cur]).length
              }
              if (matchedSelectors[sel]) {
                matchedHandlers.push(handleObj)
              }
            }
            if (matchedHandlers.length) {
              handlerQueue.push({ elem: cur, handlers: matchedHandlers })
            }
          }
        }
      }

      cur = this
      if (delegateCount < handlers.length) {
        handlerQueue.push({
          elem: cur,
          handlers: handlers.slice(delegateCount)
        })
      }

      return handlerQueue
    },

    addProp: function(name, hook) {
      Object.defineProperty(SlimJQ.Event.prototype, name, {
        enumerable: true,
        configurable: true,

        get: isFunction(hook)
          ? function() {
            if (this.originalEvent) {
              return hook(this.originalEvent)
            }
          }
          : function() {
            if (this.originalEvent) {
              return this.originalEvent[name]
            }
          },

        set: function(value) {
          Object.defineProperty(this, name, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
          })
        }
      })
    },

    fix: function(originalEvent) {
      return originalEvent[SlimJQ.expando]
        ? originalEvent
        : new SlimJQ.Event(originalEvent)
    },

    special: {
      load: {
        noBubble: true
      },
      focus: {
        trigger: function() {
          if (this !== safeActiveElement() && this.focus) {
            this.focus()
            return false
          }
        },
        delegateType: 'focusin'
      },
      blur: {
        trigger: function() {
          if (this === safeActiveElement() && this.blur) {
            this.blur()
            return false
          }
        },
        delegateType: 'focusout'
      },
      click: {
        trigger: function() {
          if (
            this.type === 'checkbox' &&
            this.click &&
            nodeName(this, 'input')
          ) {
            this.click()
            return false
          }
        },

        _default: function(event) {
          return nodeName(event.target, 'a')
        }
      },

      beforeunload: {
        postDispatch: function(event) {
          if (event.result !== undefined && event.originalEvent) {
            event.originalEvent.returnValue = event.result
          }
        }
      }
    }
  }

  SlimJQ.removeEvent = function(elem, type, handle) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, handle)
    }
  }

  SlimJQ.Event = function(src, props) {
    if (!(this instanceof SlimJQ.Event)) {
      return new SlimJQ.Event(src, props)
    }

    if (src && src.type) {
      this.originalEvent = src
      this.type = src.type

      this.isDefaultPrevented =
        src.defaultPrevented ||
        (src.defaultPrevented === undefined && src.returnValue === false)
          ? returnTrue
          : returnFalse

      this.target =
        src.target && src.target.nodeType === 3
          ? src.target.parentNode
          : src.target

      this.currentTarget = src.currentTarget
      this.relatedTarget = src.relatedTarget
    } else {
      this.type = src
    }

    if (props) {
      SlimJQ.extend(this, props)
    }

    this.timeStamp = (src && src.timeStamp) || Date.now()

    this[SlimJQ.expando] = true
  }

  SlimJQ.Event.prototype = {
    constructor: SlimJQ.Event,
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,
    isSimulated: false,

    preventDefault: function() {
      var e = this.originalEvent

      this.isDefaultPrevented = returnTrue

      if (e && !this.isSimulated) {
        e.preventDefault()
      }
    },
    stopPropagation: function() {
      var e = this.originalEvent

      this.isPropagationStopped = returnTrue

      if (e && !this.isSimulated) {
        e.stopPropagation()
      }
    },
    stopImmediatePropagation: function() {
      var e = this.originalEvent

      this.isImmediatePropagationStopped = returnTrue

      if (e && !this.isSimulated) {
        e.stopImmediatePropagation()
      }

      this.stopPropagation()
    }
  }

  SlimJQ.each(
    {
      altKey: true,
      bubbles: true,
      cancelable: true,
      changedTouches: true,
      ctrlKey: true,
      detail: true,
      eventPhase: true,
      metaKey: true,
      pageX: true,
      pageY: true,
      shiftKey: true,
      view: true,
      char: true,
      charCode: true,
      key: true,
      keyCode: true,
      button: true,
      buttons: true,
      clientX: true,
      clientY: true,
      offsetX: true,
      offsetY: true,
      pointerId: true,
      pointerType: true,
      screenX: true,
      screenY: true,
      targetTouches: true,
      toElement: true,
      touches: true,

      which: function(event) {
        var button = event.button

        if (event.which == null && rkeyEvent.test(event.type)) {
          return event.charCode != null ? event.charCode : event.keyCode
        }

        if (
          !event.which &&
          button !== undefined &&
          rmouseEvent.test(event.type)
        ) {
          if (button & 1) {
            return 1
          }

          if (button & 2) {
            return 3
          }

          if (button & 4) {
            return 2
          }

          return 0
        }

        return event.which
      }
    },
    SlimJQ.event.addProp
  )

  SlimJQ.each(
    {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout',
      pointerenter: 'pointerover',
      pointerleave: 'pointerout'
    },
    function(orig, fix) {
      SlimJQ.event.special[orig] = {
        delegateType: fix,
        bindType: fix,

        handle: function(event) {
          var ret

          var target = this

          var related = event.relatedTarget

          var handleObj = event.handleObj

          if (
            !related ||
            (related !== target && !SlimJQ.contains(target, related))
          ) {
            event.type = handleObj.origType
            ret = handleObj.handler.apply(this, arguments)
            event.type = fix
          }
          return ret
        }
      }
    }
  )

  SlimJQ.fn.extend({
    on: function(types, selector, data, fn) {
      return on(this, types, selector, data, fn)
    },
    one: function(types, selector, data, fn) {
      return on(this, types, selector, data, fn, 1)
    },
    off: function(types, selector, fn) {
      var handleObj, type
      if (types && types.preventDefault && types.handleObj) {
        handleObj = types.handleObj
        SlimJQ(types.delegateTarget).off(
          handleObj.namespace
            ? handleObj.origType + '.' + handleObj.namespace
            : handleObj.origType,
          handleObj.selector,
          handleObj.handler
        )
        return this
      }
      if (typeof types === 'object') {
        for (type in types) {
          this.off(type, selector, types[type])
        }
        return this
      }
      if (selector === false || typeof selector === 'function') {
        fn = selector
        selector = undefined
      }
      if (fn === false) {
        fn = returnFalse
      }
      return this.each(function() {
        SlimJQ.event.remove(this, types, fn, selector)
      })
    }
  })

  var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi

  var rnoInnerhtml = /<script|<style|<link/i

  var rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i

  var rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g

  function manipulationTarget(elem, content) {
    if (
      nodeName(elem, 'table') &&
      nodeName(content.nodeType !== 11 ? content : content.firstChild, 'tr')
    ) {
      return SlimJQ(elem).children('tbody')[0] || elem
    }

    return elem
  }

  function disableScript(elem) {
    elem.type = (elem.getAttribute('type') !== null) + '/' + elem.type
    return elem
  }
  function restoreScript(elem) {
    if ((elem.type || '').slice(0, 5) === 'true/') {
      elem.type = elem.type.slice(5)
    } else {
      elem.removeAttribute('type')
    }

    return elem
  }

  function cloneCopyEvent(src, dest) {
    var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events

    if (dest.nodeType !== 1) {
      return
    }

    if (dataPriv.hasData(src)) {
      pdataOld = dataPriv.access(src)
      pdataCur = dataPriv.set(dest, pdataOld)
      events = pdataOld.events

      if (events) {
        delete pdataCur.handle
        pdataCur.events = {}

        for (type in events) {
          for (i = 0, l = events[type].length; i < l; i++) {
            SlimJQ.event.add(dest, type, events[type][i])
          }
        }
      }
    }

    if (dataUser.hasData(src)) {
      udataOld = dataUser.access(src)
      udataCur = SlimJQ.extend({}, udataOld)

      dataUser.set(dest, udataCur)
    }
  }

  function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase()

    if (nodeName === 'input' && rcheckableType.test(src.type)) {
      dest.checked = src.checked
    } else if (nodeName === 'input' || nodeName === 'textarea') {
      dest.defaultValue = src.defaultValue
    }
  }

  function domManip(collection, args, callback, ignored) {
    args = concat.apply([], args)

    var fragment

    var first

    var scripts

    var hasScripts

    var node

    var doc

    var i = 0

    var l = collection.length

    var iNoClone = l - 1

    var value = args[0]

    var valueIsFunction = isFunction(value)

    if (
      valueIsFunction ||
      (l > 1 &&
        typeof value === 'string' &&
        !support.checkClone &&
        rchecked.test(value))
    ) {
      return collection.each(function(index) {
        var self = collection.eq(index)
        if (valueIsFunction) {
          args[0] = value.call(this, index, self.html())
        }
        domManip(self, args, callback, ignored)
      })
    }

    if (l) {
      fragment = buildFragment(
        args,
        collection[0].ownerDocument,
        false,
        collection,
        ignored
      )
      first = fragment.firstChild

      if (fragment.childNodes.length === 1) {
        fragment = first
      }

      if (first || ignored) {
        scripts = SlimJQ.map(getAll(fragment, 'script'), disableScript)
        hasScripts = scripts.length

        for (; i < l; i++) {
          node = fragment

          if (i !== iNoClone) {
            node = SlimJQ.clone(node, true, true)

            if (hasScripts) {
              SlimJQ.merge(scripts, getAll(node, 'script'))
            }
          }

          callback.call(collection[i], node, i)
        }

        if (hasScripts) {
          doc = scripts[scripts.length - 1].ownerDocument

          SlimJQ.map(scripts, restoreScript)

          for (i = 0; i < hasScripts; i++) {
            node = scripts[i]
            if (
              rscriptType.test(node.type || '') &&
              !dataPriv.access(node, 'globalEval') &&
              SlimJQ.contains(doc, node)
            ) {
              if (node.src && (node.type || '').toLowerCase() !== 'module') {
                if (SlimJQ._evalUrl) {
                  SlimJQ._evalUrl(node.src)
                }
              } else {
                DOMEval(node.textContent.replace(rcleanScript, ''), doc, node)
              }
            }
          }
        }
      }
    }

    return collection
  }

  function remove(elem, selector, keepData) {
    var node

    var nodes = selector ? SlimJQ.filter(selector, elem) : elem

    var i = 0

    for (; (node = nodes[i]) != null; i++) {
      if (!keepData && node.nodeType === 1) {
        SlimJQ.cleanData(getAll(node))
      }

      if (node.parentNode) {
        if (keepData && SlimJQ.contains(node.ownerDocument, node)) {
          setGlobalEval(getAll(node, 'script'))
        }
        node.parentNode.removeChild(node)
      }
    }

    return elem
  }

  SlimJQ.extend({
    htmlPrefilter: function(html) {
      return html.replace(rxhtmlTag, '<$1></$2>')
    },

    clone: function(elem, dataAndEvents, deepDataAndEvents) {
      var i

      var l

      var srcElements

      var destElements

      var clone = elem.cloneNode(true)

      var inPage = SlimJQ.contains(elem.ownerDocument, elem)

      if (
        !support.noCloneChecked &&
        (elem.nodeType === 1 || elem.nodeType === 11) &&
        !SlimJQ.isXMLDoc(elem)
      ) {
        destElements = getAll(clone)
        srcElements = getAll(elem)

        for (i = 0, l = srcElements.length; i < l; i++) {
          fixInput(srcElements[i], destElements[i])
        }
      }

      if (dataAndEvents) {
        if (deepDataAndEvents) {
          srcElements = srcElements || getAll(elem)
          destElements = destElements || getAll(clone)

          for (i = 0, l = srcElements.length; i < l; i++) {
            cloneCopyEvent(srcElements[i], destElements[i])
          }
        } else {
          cloneCopyEvent(elem, clone)
        }
      }

      destElements = getAll(clone, 'script')
      if (destElements.length > 0) {
        setGlobalEval(destElements, !inPage && getAll(elem, 'script'))
      }

      return clone
    },

    cleanData: function(elems) {
      var data

      var elem

      var type

      var special = SlimJQ.event.special

      var i = 0

      for (; (elem = elems[i]) !== undefined; i++) {
        if (acceptData(elem)) {
          if ((data = elem[dataPriv.expando])) {
            if (data.events) {
              for (type in data.events) {
                if (special[type]) {
                  SlimJQ.event.remove(elem, type)
                } else {
                  SlimJQ.removeEvent(elem, type, data.handle)
                }
              }
            }

            elem[dataPriv.expando] = undefined
          }
          if (elem[dataUser.expando]) {
            elem[dataUser.expando] = undefined
          }
        }
      }
    }
  })

  SlimJQ.fn.extend({
    detach: function(selector) {
      return remove(this, selector, true)
    },

    remove: function(selector) {
      return remove(this, selector)
    },

    text: function(value) {
      return access(
        this,
        function(value) {
          return value === undefined
            ? SlimJQ.text(this)
            : this.empty().each(function() {
              if (
                this.nodeType === 1 ||
                  this.nodeType === 11 ||
                  this.nodeType === 9
              ) {
                this.textContent = value
              }
            })
        },
        null,
        value,
        arguments.length
      )
    },

    append: function() {
      return domManip(this, arguments, function(elem) {
        if (
          this.nodeType === 1 ||
          this.nodeType === 11 ||
          this.nodeType === 9
        ) {
          var target = manipulationTarget(this, elem)
          target.appendChild(elem)
        }
      })
    },

    prepend: function() {
      return domManip(this, arguments, function(elem) {
        if (
          this.nodeType === 1 ||
          this.nodeType === 11 ||
          this.nodeType === 9
        ) {
          var target = manipulationTarget(this, elem)
          target.insertBefore(elem, target.firstChild)
        }
      })
    },

    before: function() {
      return domManip(this, arguments, function(elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this)
        }
      })
    },

    after: function() {
      return domManip(this, arguments, function(elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this.nextSibling)
        }
      })
    },

    empty: function() {
      var elem

      var i = 0

      for (; (elem = this[i]) != null; i++) {
        if (elem.nodeType === 1) {
          SlimJQ.cleanData(getAll(elem, false))

          elem.textContent = ''
        }
      }

      return this
    },

    clone: function(dataAndEvents, deepDataAndEvents) {
      dataAndEvents = dataAndEvents == null ? false : dataAndEvents
      deepDataAndEvents =
        deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents

      return this.map(function() {
        return SlimJQ.clone(this, dataAndEvents, deepDataAndEvents)
      })
    },

    html: function(value) {
      return access(
        this,
        function(value) {
          var elem = this[0] || {}

          var i = 0

          var l = this.length

          if (value === undefined && elem.nodeType === 1) {
            return elem.innerHTML
          }

          if (
            typeof value === 'string' &&
            !rnoInnerhtml.test(value) &&
            !wrapMap[(rtagName.exec(value) || ['', ''])[1].toLowerCase()]
          ) {
            value = SlimJQ.htmlPrefilter(value)

            try {
              for (; i < l; i++) {
                elem = this[i] || {}

                if (elem.nodeType === 1) {
                  SlimJQ.cleanData(getAll(elem, false))
                  elem.innerHTML = value
                }
              }

              elem = 0
            } catch (e) {}
          }

          if (elem) {
            this.empty().append(value)
          }
        },
        null,
        value,
        arguments.length
      )
    },

    replaceWith: function() {
      var ignored = []

      return domManip(
        this,
        arguments,
        function(elem) {
          var parent = this.parentNode

          if (SlimJQ.inArray(this, ignored) < 0) {
            SlimJQ.cleanData(getAll(this))
            if (parent) {
              parent.replaceChild(elem, this)
            }
          }
        },
        ignored
      )
    }
  })

  SlimJQ.each(
    {
      appendTo: 'append',
      prependTo: 'prepend',
      insertBefore: 'before',
      insertAfter: 'after',
      replaceAll: 'replaceWith'
    },
    function(name, original) {
      SlimJQ.fn[name] = function(selector) {
        var elems

        var ret = []

        var insert = SlimJQ(selector)

        var last = insert.length - 1

        var i = 0

        for (; i <= last; i++) {
          elems = i === last ? this : this.clone(true)
          SlimJQ(insert[i])[original](elems)

          push.apply(ret, elems.get())
        }

        return this.pushStack(ret)
      }
    }
  )
  var rnumnonpx = new RegExp('^(' + pnum + ')(?!px)[a-z%]+$', 'i')

  var getStyles = function(elem) {
    var view = elem.ownerDocument.defaultView

    if (!view || !view.opener) {
      view = window
    }

    return view.getComputedStyle(elem)
  }

  var rboxStyle = new RegExp(cssExpand.join('|'), 'i')
  ;(function() {
    function computeStyleTests() {
      if (!div) {
        return
      }

      container.style.cssText =
        'position:absolute;left:-11111px;width:60px;' +
        'margin-top:1px;padding:0;border:0'
      div.style.cssText =
        'position:relative;display:block;box-sizing:border-box;overflow:scroll;' +
        'margin:auto;border:1px;padding:1px;' +
        'width:60%;top:1%'
      documentElement.appendChild(container).appendChild(div)

      var divStyle = window.getComputedStyle(div)
      pixelPositionVal = divStyle.top !== '1%'

      reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12

      div.style.right = '60%'
      pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36

      boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36

      div.style.position = 'absolute'
      scrollboxSizeVal = div.offsetWidth === 36 || 'absolute'

      documentElement.removeChild(container)

      div = null
    }

    function roundPixelMeasures(measure) {
      return Math.round(parseFloat(measure))
    }

    var pixelPositionVal

    var boxSizingReliableVal

    var scrollboxSizeVal

    var pixelBoxStylesVal

    var reliableMarginLeftVal

    var container = document.createElement('div')

    var div = document.createElement('div')

    if (!div.style) {
      return
    }

    div.style.backgroundClip = 'content-box'
    div.cloneNode(true).style.backgroundClip = ''
    support.clearCloneStyle = div.style.backgroundClip === 'content-box'

    SlimJQ.extend(support, {
      boxSizingReliable: function() {
        computeStyleTests()
        return boxSizingReliableVal
      },
      pixelBoxStyles: function() {
        computeStyleTests()
        return pixelBoxStylesVal
      },
      pixelPosition: function() {
        computeStyleTests()
        return pixelPositionVal
      },
      reliableMarginLeft: function() {
        computeStyleTests()
        return reliableMarginLeftVal
      },
      scrollboxSize: function() {
        computeStyleTests()
        return scrollboxSizeVal
      }
    })
  })()

  function curCSS(elem, name, computed) {
    var width

    var minWidth

    var maxWidth

    var ret

    var style = elem.style

    computed = computed || getStyles(elem)

    if (computed) {
      ret = computed.getPropertyValue(name) || computed[name]

      if (ret === '' && !SlimJQ.contains(elem.ownerDocument, elem)) {
        ret = SlimJQ.style(elem, name)
      }

      if (
        !support.pixelBoxStyles() &&
        rnumnonpx.test(ret) &&
        rboxStyle.test(name)
      ) {
        width = style.width
        minWidth = style.minWidth
        maxWidth = style.maxWidth

        style.minWidth = style.maxWidth = style.width = ret
        ret = computed.width

        style.width = width
        style.minWidth = minWidth
        style.maxWidth = maxWidth
      }
    }

    return ret !== undefined ? ret + '' : ret
  }

  function addGetHookIf(conditionFn, hookFn) {
    return {
      get: function() {
        if (conditionFn()) {
          delete this.get
          return
        }

        return (this.get = hookFn).apply(this, arguments)
      }
    }
  }

  var rdisplayswap = /^(none|table(?!-c[ea]).+)/

  var rcustomProp = /^--/

  var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' }

  var cssNormalTransform = {
    letterSpacing: '0',
    fontWeight: '400'
  }

  var cssPrefixes = ['Webkit', 'Moz', 'ms']

  var emptyStyle = document.createElement('div').style

  function vendorPropName(name) {
    if (name in emptyStyle) {
      return name
    }

    var capName = name[0].toUpperCase() + name.slice(1)

    var i = cssPrefixes.length

    while (i--) {
      name = cssPrefixes[i] + capName
      if (name in emptyStyle) {
        return name
      }
    }
  }

  function finalPropName(name) {
    var ret = SlimJQ.cssProps[name]
    if (!ret) {
      ret = SlimJQ.cssProps[name] = vendorPropName(name) || name
    }
    return ret
  }

  function setPositiveNumber(elem, value, subtract) {
    var matches = rcssNum.exec(value)
    return matches
      ? Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || 'px')
      : value
  }

  function boxModelAdjustment(
    elem,
    dimension,
    box,
    isBorderBox,
    styles,
    computedVal
  ) {
    var i = dimension === 'width' ? 1 : 0

    var extra = 0

    var delta = 0

    if (box === (isBorderBox ? 'border' : 'content')) {
      return 0
    }

    for (; i < 4; i += 2) {
      if (box === 'margin') {
        delta += SlimJQ.css(elem, box + cssExpand[i], true, styles)
      }

      if (!isBorderBox) {
        delta += SlimJQ.css(elem, 'padding' + cssExpand[i], true, styles)

        if (box !== 'padding') {
          delta += SlimJQ.css(
            elem,
            'border' + cssExpand[i] + 'Width',
            true,
            styles
          )
        } else {
          extra += SlimJQ.css(
            elem,
            'border' + cssExpand[i] + 'Width',
            true,
            styles
          )
        }
      } else {
        if (box === 'content') {
          delta -= SlimJQ.css(elem, 'padding' + cssExpand[i], true, styles)
        }

        if (box !== 'margin') {
          delta -= SlimJQ.css(
            elem,
            'border' + cssExpand[i] + 'Width',
            true,
            styles
          )
        }
      }
    }

    if (!isBorderBox && computedVal >= 0) {
      delta += Math.max(
        0,
        Math.ceil(
          elem['offset' + dimension[0].toUpperCase() + dimension.slice(1)] -
            computedVal -
            delta -
            extra -
            0.5
        )
      )
    }

    return delta
  }

  function getWidthOrHeight(elem, dimension, extra) {
    var styles = getStyles(elem)

    var val = curCSS(elem, dimension, styles)

    var isBorderBox =
      SlimJQ.css(elem, 'boxSizing', false, styles) === 'border-box'

    var valueIsBorderBox = isBorderBox

    if (rnumnonpx.test(val)) {
      if (!extra) {
        return val
      }
      val = 'auto'
    }

    valueIsBorderBox =
      valueIsBorderBox &&
      (support.boxSizingReliable() || val === elem.style[dimension])

    if (
      val === 'auto' ||
      (!parseFloat(val) &&
        SlimJQ.css(elem, 'display', false, styles) === 'inline')
    ) {
      val = elem['offset' + dimension[0].toUpperCase() + dimension.slice(1)]

      valueIsBorderBox = true
    }

    val = parseFloat(val) || 0

    return (
      val +
      boxModelAdjustment(
        elem,
        dimension,
        extra || (isBorderBox ? 'border' : 'content'),
        valueIsBorderBox,
        styles,

        val
      ) +
      'px'
    )
  }

  SlimJQ.extend({
    cssHooks: {
      opacity: {
        get: function(elem, computed) {
          if (computed) {
            var ret = curCSS(elem, 'opacity')
            return ret === '' ? '1' : ret
          }
        }
      }
    },

    cssNumber: {
      animationIterationCount: true,
      columnCount: true,
      fillOpacity: true,
      flexGrow: true,
      flexShrink: true,
      fontWeight: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      widows: true,
      zIndex: true,
      zoom: true
    },

    cssProps: {},

    style: function(elem, name, value, extra) {
      if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
        return
      }

      var ret

      var type

      var hooks

      var origName = camelCase(name)

      var isCustomProp = rcustomProp.test(name)

      var style = elem.style

      if (!isCustomProp) {
        name = finalPropName(origName)
      }

      hooks = SlimJQ.cssHooks[name] || SlimJQ.cssHooks[origName]

      if (value !== undefined) {
        type = typeof value

        if (type === 'string' && (ret = rcssNum.exec(value)) && ret[1]) {
          value = adjustCSS(elem, name, ret)

          type = 'number'
        }

        if (value == null || value !== value) {
          return
        }

        if (type === 'number') {
          value += (ret && ret[3]) || (SlimJQ.cssNumber[origName] ? '' : 'px')
        }

        if (
          !support.clearCloneStyle &&
          value === '' &&
          name.indexOf('background') === 0
        ) {
          style[name] = 'inherit'
        }

        if (
          !hooks ||
          !('set' in hooks) ||
          (value = hooks.set(elem, value, extra)) !== undefined
        ) {
          if (isCustomProp) {
            style.setProperty(name, value)
          } else {
            style[name] = value
          }
        }
      } else {
        if (
          hooks &&
          'get' in hooks &&
          (ret = hooks.get(elem, false, extra)) !== undefined
        ) {
          return ret
        }

        return style[name]
      }
    },

    css: function(elem, name, extra, styles) {
      var val

      var num

      var hooks

      var origName = camelCase(name)

      var isCustomProp = rcustomProp.test(name)

      if (!isCustomProp) {
        name = finalPropName(origName)
      }

      hooks = SlimJQ.cssHooks[name] || SlimJQ.cssHooks[origName]

      if (hooks && 'get' in hooks) {
        val = hooks.get(elem, true, extra)
      }

      if (val === undefined) {
        val = curCSS(elem, name, styles)
      }

      if (val === 'normal' && name in cssNormalTransform) {
        val = cssNormalTransform[name]
      }

      if (extra === '' || extra) {
        num = parseFloat(val)
        return extra === true || isFinite(num) ? num || 0 : val
      }

      return val
    }
  })

  SlimJQ.each(['height', 'width'], function(i, dimension) {
    SlimJQ.cssHooks[dimension] = {
      get: function(elem, computed, extra) {
        if (computed) {
          return rdisplayswap.test(SlimJQ.css(elem, 'display')) &&
            (!elem.getClientRects().length ||
              !elem.getBoundingClientRect().width)
            ? swap(elem, cssShow, function() {
              return getWidthOrHeight(elem, dimension, extra)
            })
            : getWidthOrHeight(elem, dimension, extra)
        }
      },

      set: function(elem, value, extra) {
        var matches

        var styles = getStyles(elem)

        var isBorderBox =
          SlimJQ.css(elem, 'boxSizing', false, styles) === 'border-box'

        var subtract =
          extra &&
          boxModelAdjustment(elem, dimension, extra, isBorderBox, styles)

        if (isBorderBox && support.scrollboxSize() === styles.position) {
          subtract -= Math.ceil(
            elem['offset' + dimension[0].toUpperCase() + dimension.slice(1)] -
              parseFloat(styles[dimension]) -
              boxModelAdjustment(elem, dimension, 'border', false, styles) -
              0.5
          )
        }

        if (
          subtract &&
          (matches = rcssNum.exec(value)) &&
          (matches[3] || 'px') !== 'px'
        ) {
          elem.style[dimension] = value
          value = SlimJQ.css(elem, dimension)
        }

        return setPositiveNumber(elem, value, subtract)
      }
    }
  })

  SlimJQ.cssHooks.marginLeft = addGetHookIf(
    support.reliableMarginLeft,
    function(elem, computed) {
      if (computed) {
        return (
          (parseFloat(curCSS(elem, 'marginLeft')) ||
            elem.getBoundingClientRect().left -
              swap(elem, { marginLeft: 0 }, function() {
                return elem.getBoundingClientRect().left
              })) + 'px'
        )
      }
    }
  )

  SlimJQ.each(
    {
      margin: '',
      padding: '',
      border: 'Width'
    },
    function(prefix, suffix) {
      SlimJQ.cssHooks[prefix + suffix] = {
        expand: function(value) {
          var i = 0

          var expanded = {}

          var parts = typeof value === 'string' ? value.split(' ') : [value]

          for (; i < 4; i++) {
            expanded[prefix + cssExpand[i] + suffix] =
              parts[i] || parts[i - 2] || parts[0]
          }

          return expanded
        }
      }

      if (prefix !== 'margin') {
        SlimJQ.cssHooks[prefix + suffix].set = setPositiveNumber
      }
    }
  )

  SlimJQ.fn.extend({
    css: function(name, value) {
      return access(
        this,
        function(elem, name, value) {
          var styles

          var len

          var map = {}

          var i = 0

          if (Array.isArray(name)) {
            styles = getStyles(elem)
            len = name.length

            for (; i < len; i++) {
              map[name[i]] = SlimJQ.css(elem, name[i], false, styles)
            }

            return map
          }

          return value !== undefined
            ? SlimJQ.style(elem, name, value)
            : SlimJQ.css(elem, name)
        },
        name,
        value,
        arguments.length > 1
      )
    }
  })

  SlimJQ.fn.delay = function(time, type) {
    time = SlimJQ.fx ? SlimJQ.fx.speeds[time] || time : time
    type = type || 'fx'

    return this.queue(type, function(next, hooks) {
      var timeout = window.setTimeout(next, time)
      hooks.stop = function() {
        window.clearTimeout(timeout)
      }
    })
  }
  ;(function() {
    var input = document.createElement('input')

    var select = document.createElement('select')

    var opt = select.appendChild(document.createElement('option'))

    input.type = 'checkbox'

    support.checkOn = input.value !== ''

    support.optSelected = opt.selected

    input = document.createElement('input')
    input.value = 't'
    input.type = 'radio'
    support.radioValue = input.value === 't'
  })()

  var boolHook

  var attrHandle = SlimJQ.expr.attrHandle

  SlimJQ.fn.extend({
    attr: function(name, value) {
      return access(this, SlimJQ.attr, name, value, arguments.length > 1)
    },

    removeAttr: function(name) {
      return this.each(function() {
        SlimJQ.removeAttr(this, name)
      })
    }
  })

  SlimJQ.extend({
    attr: function(elem, name, value) {
      var ret

      var hooks

      var nType = elem.nodeType

      if (nType === 3 || nType === 8 || nType === 2) {
        return
      }

      if (typeof elem.getAttribute === 'undefined') {
        return SlimJQ.prop(elem, name, value)
      }

      if (nType !== 1 || !SlimJQ.isXMLDoc(elem)) {
        hooks =
          SlimJQ.attrHooks[name.toLowerCase()] ||
          (SlimJQ.expr.match.bool.test(name) ? boolHook : undefined)
      }

      if (value !== undefined) {
        if (value === null) {
          SlimJQ.removeAttr(elem, name)
          return
        }

        if (
          hooks &&
          'set' in hooks &&
          (ret = hooks.set(elem, value, name)) !== undefined
        ) {
          return ret
        }

        elem.setAttribute(name, value + '')
        return value
      }

      if (hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret
      }

      ret = SlimJQ.find.attr(elem, name)

      return ret == null ? undefined : ret
    },

    attrHooks: {
      type: {
        set: function(elem, value) {
          if (
            !support.radioValue &&
            value === 'radio' &&
            nodeName(elem, 'input')
          ) {
            var val = elem.value
            elem.setAttribute('type', value)
            if (val) {
              elem.value = val
            }
            return value
          }
        }
      }
    },

    removeAttr: function(elem, value) {
      var name

      var i = 0

      var attrNames = value && value.match(rnothtmlwhite)

      if (attrNames && elem.nodeType === 1) {
        while ((name = attrNames[i++])) {
          elem.removeAttribute(name)
        }
      }
    }
  })

  boolHook = {
    set: function(elem, value, name) {
      if (value === false) {
        SlimJQ.removeAttr(elem, name)
      } else {
        elem.setAttribute(name, name)
      }
      return name
    }
  }

  SlimJQ.each(SlimJQ.expr.match.bool.source.match(/\w+/g), function(i, name) {
    var getter = attrHandle[name] || SlimJQ.find.attr

    attrHandle[name] = function(elem, name, isXML) {
      var ret

      var handle

      var lowercaseName = name.toLowerCase()

      if (!isXML) {
        handle = attrHandle[lowercaseName]
        attrHandle[lowercaseName] = ret
        ret = getter(elem, name, isXML) != null ? lowercaseName : null
        attrHandle[lowercaseName] = handle
      }
      return ret
    }
  })

  var rfocusable = /^(?:input|select|textarea|button)$/i

  var rclickable = /^(?:a|area)$/i

  SlimJQ.fn.extend({
    prop: function(name, value) {
      return access(this, SlimJQ.prop, name, value, arguments.length > 1)
    },

    removeProp: function(name) {
      return this.each(function() {
        delete this[SlimJQ.propFix[name] || name]
      })
    }
  })

  SlimJQ.extend({
    prop: function(elem, name, value) {
      var ret

      var hooks

      var nType = elem.nodeType

      if (nType === 3 || nType === 8 || nType === 2) {
        return
      }

      if (nType !== 1 || !SlimJQ.isXMLDoc(elem)) {
        name = SlimJQ.propFix[name] || name
        hooks = SlimJQ.propHooks[name]
      }

      if (value !== undefined) {
        if (
          hooks &&
          'set' in hooks &&
          (ret = hooks.set(elem, value, name)) !== undefined
        ) {
          return ret
        }

        return (elem[name] = value)
      }

      if (hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret
      }

      return elem[name]
    },

    propHooks: {
      tabIndex: {
        get: function(elem) {
          var tabindex = SlimJQ.find.attr(elem, 'tabindex')

          if (tabindex) {
            return parseInt(tabindex, 10)
          }

          if (
            rfocusable.test(elem.nodeName) ||
            (rclickable.test(elem.nodeName) && elem.href)
          ) {
            return 0
          }

          return -1
        }
      }
    },

    propFix: {
      for: 'htmlFor',
      class: 'className'
    }
  })

  if (!support.optSelected) {
    SlimJQ.propHooks.selected = {
      get: function(elem) {
        var parent = elem.parentNode
        if (parent && parent.parentNode) {
          parent.parentNode.selectedIndex
        }
        return null
      },
      set: function(elem) {
        var parent = elem.parentNode
        if (parent) {
          parent.selectedIndex

          if (parent.parentNode) {
            parent.parentNode.selectedIndex
          }
        }
      }
    }
  }

  SlimJQ.each(
    [
      'tabIndex',
      'readOnly',
      'maxLength',
      'cellSpacing',
      'cellPadding',
      'rowSpan',
      'colSpan',
      'useMap',
      'frameBorder',
      'contentEditable'
    ],
    function() {
      SlimJQ.propFix[this.toLowerCase()] = this
    }
  )

  function stripAndCollapse(value) {
    var tokens = value.match(rnothtmlwhite) || []
    return tokens.join(' ')
  }

  function getClass(elem) {
    return (elem.getAttribute && elem.getAttribute('class')) || ''
  }

  function classesToArray(value) {
    if (Array.isArray(value)) {
      return value
    }
    if (typeof value === 'string') {
      return value.match(rnothtmlwhite) || []
    }
    return []
  }

  SlimJQ.fn.extend({
    addClass: function(value) {
      var classes

      var elem

      var cur

      var curValue

      var clazz

      var j

      var finalValue

      var i = 0

      if (isFunction(value)) {
        return this.each(function(j) {
          SlimJQ(this).addClass(value.call(this, j, getClass(this)))
        })
      }

      classes = classesToArray(value)

      if (classes.length) {
        while ((elem = this[i++])) {
          curValue = getClass(elem)
          cur = elem.nodeType === 1 && ' ' + stripAndCollapse(curValue) + ' '

          if (cur) {
            j = 0
            while ((clazz = classes[j++])) {
              if (cur.indexOf(' ' + clazz + ' ') < 0) {
                cur += clazz + ' '
              }
            }

            finalValue = stripAndCollapse(cur)
            if (curValue !== finalValue) {
              elem.setAttribute('class', finalValue)
            }
          }
        }
      }

      return this
    },

    removeClass: function(value) {
      var classes

      var elem

      var cur

      var curValue

      var clazz

      var j

      var finalValue

      var i = 0

      if (isFunction(value)) {
        return this.each(function(j) {
          SlimJQ(this).removeClass(value.call(this, j, getClass(this)))
        })
      }

      if (!arguments.length) {
        return this.attr('class', '')
      }

      classes = classesToArray(value)

      if (classes.length) {
        while ((elem = this[i++])) {
          curValue = getClass(elem)

          cur = elem.nodeType === 1 && ' ' + stripAndCollapse(curValue) + ' '

          if (cur) {
            j = 0
            while ((clazz = classes[j++])) {
              while (cur.indexOf(' ' + clazz + ' ') > -1) {
                cur = cur.replace(' ' + clazz + ' ', ' ')
              }
            }

            finalValue = stripAndCollapse(cur)
            if (curValue !== finalValue) {
              elem.setAttribute('class', finalValue)
            }
          }
        }
      }

      return this
    },

    toggleClass: function(value, stateVal) {
      var type = typeof value

      var isValidValue = type === 'string' || Array.isArray(value)

      if (typeof stateVal === 'boolean' && isValidValue) {
        return stateVal ? this.addClass(value) : this.removeClass(value)
      }

      if (isFunction(value)) {
        return this.each(function(i) {
          SlimJQ(this).toggleClass(
            value.call(this, i, getClass(this), stateVal),
            stateVal
          )
        })
      }

      return this.each(function() {
        var className, i, self, classNames

        if (isValidValue) {
          i = 0
          self = SlimJQ(this)
          classNames = classesToArray(value)

          while ((className = classNames[i++])) {
            if (self.hasClass(className)) {
              self.removeClass(className)
            } else {
              self.addClass(className)
            }
          }
        } else if (value === undefined || type === 'boolean') {
          className = getClass(this)
          if (className) {
            dataPriv.set(this, '__className__', className)
          }

          if (this.setAttribute) {
            this.setAttribute(
              'class',
              className || value === false
                ? ''
                : dataPriv.get(this, '__className__') || ''
            )
          }
        }
      })
    },

    hasClass: function(selector) {
      var className

      var elem

      var i = 0

      className = ' ' + selector + ' '
      while ((elem = this[i++])) {
        if (
          elem.nodeType === 1 &&
          (' ' + stripAndCollapse(getClass(elem)) + ' ').indexOf(className) > -1
        ) {
          return true
        }
      }

      return false
    }
  })

  var rreturn = /\r/g

  SlimJQ.fn.extend({
    val: function(value) {
      var hooks

      var ret

      var valueIsFunction

      var elem = this[0]

      if (!arguments.length) {
        if (elem) {
          hooks =
            SlimJQ.valHooks[elem.type] ||
            SlimJQ.valHooks[elem.nodeName.toLowerCase()]

          if (
            hooks &&
            'get' in hooks &&
            (ret = hooks.get(elem, 'value')) !== undefined
          ) {
            return ret
          }

          ret = elem.value

          if (typeof ret === 'string') {
            return ret.replace(rreturn, '')
          }

          return ret == null ? '' : ret
        }

        return
      }

      valueIsFunction = isFunction(value)

      return this.each(function(i) {
        var val

        if (this.nodeType !== 1) {
          return
        }

        if (valueIsFunction) {
          val = value.call(this, i, SlimJQ(this).val())
        } else {
          val = value
        }

        if (val == null) {
          val = ''
        } else if (typeof val === 'number') {
          val += ''
        } else if (Array.isArray(val)) {
          val = SlimJQ.map(val, function(value) {
            return value == null ? '' : value + ''
          })
        }

        hooks =
          SlimJQ.valHooks[this.type] ||
          SlimJQ.valHooks[this.nodeName.toLowerCase()]

        if (
          !hooks ||
          !('set' in hooks) ||
          hooks.set(this, val, 'value') === undefined
        ) {
          this.value = val
        }
      })
    }
  })

  SlimJQ.extend({
    valHooks: {
      option: {
        get: function(elem) {
          var val = SlimJQ.find.attr(elem, 'value')
          return val != null ? val : stripAndCollapse(SlimJQ.text(elem))
        }
      },
      select: {
        get: function(elem) {
          var value

          var option

          var i

          var options = elem.options

          var index = elem.selectedIndex

          var one = elem.type === 'select-one'

          var values = one ? null : []

          var max = one ? index + 1 : options.length

          if (index < 0) {
            i = max
          } else {
            i = one ? index : 0
          }

          for (; i < max; i++) {
            option = options[i]

            if (
              (option.selected || i === index) &&
              !option.disabled &&
              (!option.parentNode.disabled ||
                !nodeName(option.parentNode, 'optgroup'))
            ) {
              value = SlimJQ(option).val()

              if (one) {
                return value
              }

              values.push(value)
            }
          }

          return values
        },

        set: function(elem, value) {
          var optionSet

          var option

          var options = elem.options

          var values = SlimJQ.makeArray(value)

          var i = options.length

          while (i--) {
            option = options[i]

            if (
              (option.selected =
                SlimJQ.inArray(SlimJQ.valHooks.option.get(option), values) > -1)
            ) {
              optionSet = true
            }
          }

          if (!optionSet) {
            elem.selectedIndex = -1
          }
          return values
        }
      }
    }
  })

  SlimJQ.each(['radio', 'checkbox'], function() {
    SlimJQ.valHooks[this] = {
      set: function(elem, value) {
        if (Array.isArray(value)) {
          return (elem.checked = SlimJQ.inArray(SlimJQ(elem).val(), value) > -1)
        }
      }
    }
    if (!support.checkOn) {
      SlimJQ.valHooks[this].get = function(elem) {
        return elem.getAttribute('value') === null ? 'on' : elem.value
      }
    }
  })

  support.focusin = 'onfocusin' in window

  var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/

  var stopPropagationCallback = function(e) {
    e.stopPropagation()
  }

  SlimJQ.extend(SlimJQ.event, {
    trigger: function(event, data, elem, onlyHandlers) {
      var i

      var cur

      var tmp

      var bubbleType

      var ontype

      var handle

      var special

      var lastElement

      var eventPath = [elem || document]

      var type = hasOwn.call(event, 'type') ? event.type : event

      var namespaces = hasOwn.call(event, 'namespace')
        ? event.namespace.split('.')
        : []

      cur = lastElement = tmp = elem = elem || document

      if (elem.nodeType === 3 || elem.nodeType === 8) {
        return
      }

      if (rfocusMorph.test(type + SlimJQ.event.triggered)) {
        return
      }

      if (type.indexOf('.') > -1) {
        namespaces = type.split('.')
        type = namespaces.shift()
        namespaces.sort()
      }
      ontype = type.indexOf(':') < 0 && 'on' + type

      event = event[SlimJQ.expando]
        ? event
        : new SlimJQ.Event(type, typeof event === 'object' && event)

      event.isTrigger = onlyHandlers ? 2 : 3
      event.namespace = namespaces.join('.')
      event.rnamespace = event.namespace
        ? new RegExp('(^|\\.)' + namespaces.join('\\.(?:.*\\.|)') + '(\\.|$)')
        : null

      event.result = undefined
      if (!event.target) {
        event.target = elem
      }

      data = data == null ? [event] : SlimJQ.makeArray(data, [event])

      special = SlimJQ.event.special[type] || {}
      if (
        !onlyHandlers &&
        special.trigger &&
        special.trigger.apply(elem, data) === false
      ) {
        return
      }

      if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
        bubbleType = special.delegateType || type
        if (!rfocusMorph.test(bubbleType + type)) {
          cur = cur.parentNode
        }
        for (; cur; cur = cur.parentNode) {
          eventPath.push(cur)
          tmp = cur
        }

        if (tmp === (elem.ownerDocument || document)) {
          eventPath.push(tmp.defaultView || tmp.parentWindow || window)
        }
      }

      i = 0
      while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
        lastElement = cur
        event.type = i > 1 ? bubbleType : special.bindType || type

        handle =
          (dataPriv.get(cur, 'events') || {})[event.type] &&
          dataPriv.get(cur, 'handle')
        if (handle) {
          handle.apply(cur, data)
        }

        handle = ontype && cur[ontype]
        if (handle && handle.apply && acceptData(cur)) {
          event.result = handle.apply(cur, data)
          if (event.result === false) {
            event.preventDefault()
          }
        }
      }
      event.type = type

      if (!onlyHandlers && !event.isDefaultPrevented()) {
        if (
          (!special._default ||
            special._default.apply(eventPath.pop(), data) === false) &&
          acceptData(elem)
        ) {
          if (ontype && isFunction(elem[type]) && !isWindow(elem)) {
            tmp = elem[ontype]

            if (tmp) {
              elem[ontype] = null
            }

            SlimJQ.event.triggered = type

            if (event.isPropagationStopped()) {
              lastElement.addEventListener(type, stopPropagationCallback)
            }

            elem[type]()

            if (event.isPropagationStopped()) {
              lastElement.removeEventListener(type, stopPropagationCallback)
            }

            SlimJQ.event.triggered = undefined

            if (tmp) {
              elem[ontype] = tmp
            }
          }
        }
      }

      return event.result
    },

    simulate: function(type, elem, event) {
      var e = SlimJQ.extend(new SlimJQ.Event(), event, {
        type: type,
        isSimulated: true
      })

      SlimJQ.event.trigger(e, null, elem)
    }
  })

  SlimJQ.fn.extend({
    trigger: function(type, data) {
      return this.each(function() {
        SlimJQ.event.trigger(type, data, this)
      })
    },
    triggerHandler: function(type, data) {
      var elem = this[0]
      if (elem) {
        return SlimJQ.event.trigger(type, data, elem, true)
      }
    }
  })

  if (!support.focusin) {
    SlimJQ.each({ focus: 'focusin', blur: 'focusout' }, function(orig, fix) {
      var handler = function(event) {
        SlimJQ.event.simulate(fix, event.target, SlimJQ.event.fix(event))
      }

      SlimJQ.event.special[fix] = {
        setup: function() {
          var doc = this.ownerDocument || this

          var attaches = dataPriv.access(doc, fix)

          if (!attaches) {
            doc.addEventListener(orig, handler, true)
          }
          dataPriv.access(doc, fix, (attaches || 0) + 1)
        },
        teardown: function() {
          var doc = this.ownerDocument || this

          var attaches = dataPriv.access(doc, fix) - 1

          if (!attaches) {
            doc.removeEventListener(orig, handler, true)
            dataPriv.remove(doc, fix)
          } else {
            dataPriv.access(doc, fix, attaches)
          }
        }
      }
    })
  }

  var rbracket = /\[\]$/

  var rCRLF = /\r?\n/g

  var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i

  var rsubmittable = /^(?:input|select|textarea|keygen)/i

  function buildParams(prefix, obj, traditional, add) {
    var name

    if (Array.isArray(obj)) {
      SlimJQ.each(obj, function(i, v) {
        if (traditional || rbracket.test(prefix)) {
          add(prefix, v)
        } else {
          buildParams(
            prefix + '[' + (typeof v === 'object' && v != null ? i : '') + ']',
            v,
            traditional,
            add
          )
        }
      })
    } else if (!traditional && toType(obj) === 'object') {
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add)
      }
    } else {
      add(prefix, obj)
    }
  }

  SlimJQ.param = function(a, traditional) {
    var prefix

    var s = []

    var add = function(key, valueOrFunction) {
      var value = isFunction(valueOrFunction)
        ? valueOrFunction()
        : valueOrFunction

      s[s.length] =
        encodeURIComponent(key) +
        '=' +
        encodeURIComponent(value == null ? '' : value)
    }

    if (Array.isArray(a) || (a.slimJQ && !SlimJQ.isPlainObject(a))) {
      SlimJQ.each(a, function() {
        add(this.name, this.value)
      })
    } else {
      for (prefix in a) {
        buildParams(prefix, a[prefix], traditional, add)
      }
    }

    return s.join('&')
  }

  SlimJQ.fn.extend({
    serialize: function() {
      return SlimJQ.param(this.serializeArray())
    },
    serializeArray: function() {
      return this.map(function() {
        var elements = SlimJQ.prop(this, 'elements')
        return elements ? SlimJQ.makeArray(elements) : this
      })
        .filter(function() {
          var type = this.type

          return (
            this.name &&
            !SlimJQ(this).is(':disabled') &&
            rsubmittable.test(this.nodeName) &&
            !rsubmitterTypes.test(type) &&
            (this.checked || !rcheckableType.test(type))
          )
        })
        .map(function(i, elem) {
          var val = SlimJQ(this).val()

          if (val == null) {
            return null
          }

          if (Array.isArray(val)) {
            return SlimJQ.map(val, function(val) {
              return { name: elem.name, value: val.replace(rCRLF, '\r\n') }
            })
          }

          return { name: elem.name, value: val.replace(rCRLF, '\r\n') }
        })
        .get()
    }
  })

  SlimJQ.fn.extend({
    wrapAll: function(html) {
      var wrap

      if (this[0]) {
        if (isFunction(html)) {
          html = html.call(this[0])
        }

        wrap = SlimJQ(html, this[0].ownerDocument)
          .eq(0)
          .clone(true)

        if (this[0].parentNode) {
          wrap.insertBefore(this[0])
        }

        wrap
          .map(function() {
            var elem = this

            while (elem.firstElementChild) {
              elem = elem.firstElementChild
            }

            return elem
          })
          .append(this)
      }

      return this
    },

    wrapInner: function(html) {
      if (isFunction(html)) {
        return this.each(function(i) {
          SlimJQ(this).wrapInner(html.call(this, i))
        })
      }

      return this.each(function() {
        var self = SlimJQ(this)

        var contents = self.contents()

        if (contents.length) {
          contents.wrapAll(html)
        } else {
          self.append(html)
        }
      })
    },

    wrap: function(html) {
      var htmlIsFunction = isFunction(html)

      return this.each(function(i) {
        SlimJQ(this).wrapAll(htmlIsFunction ? html.call(this, i) : html)
      })
    },

    unwrap: function(selector) {
      this.parent(selector)
        .not('body')
        .each(function() {
          SlimJQ(this).replaceWith(this.childNodes)
        })
      return this
    }
  })

  SlimJQ.expr.pseudos.hidden = function(elem) {
    return !SlimJQ.expr.pseudos.visible(elem)
  }
  SlimJQ.expr.pseudos.visible = function(elem) {
    return !!(
      elem.offsetWidth ||
      elem.offsetHeight ||
      elem.getClientRects().length
    )
  }

  support.createHTMLDocument = (function() {
    var body = document.implementation.createHTMLDocument('').body
    body.innerHTML = '<form></form><form></form>'
    return body.childNodes.length === 2
  })()

  SlimJQ.parseHTML = function(data, context, keepScripts) {
    if (typeof data !== 'string') {
      return []
    }
    if (typeof context === 'boolean') {
      keepScripts = context
      context = false
    }

    var base, parsed, scripts

    if (!context) {
      if (support.createHTMLDocument) {
        context = document.implementation.createHTMLDocument('')

        base = context.createElement('base')
        base.href = document.location.href
        context.head.appendChild(base)
      } else {
        context = document
      }
    }

    parsed = rsingleTag.exec(data)
    scripts = !keepScripts && []

    if (parsed) {
      return [context.createElement(parsed[1])]
    }

    parsed = buildFragment([data], context, scripts)

    if (scripts && scripts.length) {
      SlimJQ(scripts).remove()
    }

    return SlimJQ.merge([], parsed.childNodes)
  }

  SlimJQ.offset = {
    setOffset: function(elem, options, i) {
      var curPosition

      var curLeft

      var curCSSTop

      var curTop

      var curOffset

      var curCSSLeft

      var calculatePosition

      var position = SlimJQ.css(elem, 'position')

      var curElem = SlimJQ(elem)

      var props = {}

      if (position === 'static') {
        elem.style.position = 'relative'
      }

      curOffset = curElem.offset()
      curCSSTop = SlimJQ.css(elem, 'top')
      curCSSLeft = SlimJQ.css(elem, 'left')
      calculatePosition =
        (position === 'absolute' || position === 'fixed') &&
        (curCSSTop + curCSSLeft).indexOf('auto') > -1
      if (calculatePosition) {
        curPosition = curElem.position()
        curTop = curPosition.top
        curLeft = curPosition.left
      } else {
        curTop = parseFloat(curCSSTop) || 0
        curLeft = parseFloat(curCSSLeft) || 0
      }

      if (isFunction(options)) {
        options = options.call(elem, i, SlimJQ.extend({}, curOffset))
      }

      if (options.top != null) {
        props.top = options.top - curOffset.top + curTop
      }
      if (options.left != null) {
        props.left = options.left - curOffset.left + curLeft
      }

      if ('using' in options) {
        options.using.call(elem, props)
      } else {
        curElem.css(props)
      }
    }
  }

  SlimJQ.fn.extend({
    offset: function(options) {
      if (arguments.length) {
        return options === undefined
          ? this
          : this.each(function(i) {
            SlimJQ.offset.setOffset(this, options, i)
          })
      }

      var rect

      var win

      var elem = this[0]

      if (!elem) {
        return
      }

      if (!elem.getClientRects().length) {
        return { top: 0, left: 0 }
      }

      rect = elem.getBoundingClientRect()
      win = elem.ownerDocument.defaultView
      return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
      }
    },

    position: function() {
      if (!this[0]) {
        return
      }

      var offsetParent

      var offset

      var doc

      var elem = this[0]

      var parentOffset = { top: 0, left: 0 }

      if (SlimJQ.css(elem, 'position') === 'fixed') {
        offset = elem.getBoundingClientRect()
      } else {
        offset = this.offset()
        doc = elem.ownerDocument
        offsetParent = elem.offsetParent || doc.documentElement
        while (
          offsetParent &&
          (offsetParent === doc.body || offsetParent === doc.documentElement) &&
          SlimJQ.css(offsetParent, 'position') === 'static'
        ) {
          offsetParent = offsetParent.parentNode
        }
        if (
          offsetParent &&
          offsetParent !== elem &&
          offsetParent.nodeType === 1
        ) {
          parentOffset = SlimJQ(offsetParent).offset()
          parentOffset.top += SlimJQ.css(offsetParent, 'borderTopWidth', true)
          parentOffset.left += SlimJQ.css(offsetParent, 'borderLeftWidth', true)
        }
      }

      return {
        top:
          offset.top - parentOffset.top - SlimJQ.css(elem, 'marginTop', true),
        left:
          offset.left - parentOffset.left - SlimJQ.css(elem, 'marginLeft', true)
      }
    },

    offsetParent: function() {
      return this.map(function() {
        var offsetParent = this.offsetParent

        while (
          offsetParent &&
          SlimJQ.css(offsetParent, 'position') === 'static'
        ) {
          offsetParent = offsetParent.offsetParent
        }

        return offsetParent || documentElement
      })
    }
  })

  SlimJQ.each({ scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset' }, function(
    method,
    prop
  ) {
    var top = prop === 'pageYOffset'

    SlimJQ.fn[method] = function(val) {
      return access(
        this,
        function(elem, method, val) {
          var win
          if (isWindow(elem)) {
            win = elem
          } else if (elem.nodeType === 9) {
            win = elem.defaultView
          }

          if (val === undefined) {
            return win ? win[prop] : elem[method]
          }

          if (win) {
            win.scrollTo(
              !top ? val : win.pageXOffset,
              top ? val : win.pageYOffset
            )
          } else {
            elem[method] = val
          }
        },
        method,
        val,
        arguments.length
      )
    }
  })

  SlimJQ.each(['top', 'left'], function(i, prop) {
    SlimJQ.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(
      elem,
      computed
    ) {
      if (computed) {
        computed = curCSS(elem, prop)
        return rnumnonpx.test(computed)
          ? SlimJQ(elem).position()[prop] + 'px'
          : computed
      }
    })
  })

  SlimJQ.each({ Height: 'height', Width: 'width' }, function(name, type) {
    SlimJQ.each(
      { padding: 'inner' + name, content: type, '': 'outer' + name },
      function(defaultExtra, funcName) {
        SlimJQ.fn[funcName] = function(margin, value) {
          var chainable =
            arguments.length && (defaultExtra || typeof margin !== 'boolean')

          var extra =
            defaultExtra ||
            (margin === true || value === true ? 'margin' : 'border')

          return access(
            this,
            function(elem, type, value) {
              var doc

              if (isWindow(elem)) {
                return funcName.indexOf('outer') === 0
                  ? elem['inner' + name]
                  : elem.document.documentElement['client' + name]
              }

              if (elem.nodeType === 9) {
                doc = elem.documentElement
                return Math.max(
                  elem.body['scroll' + name],
                  doc['scroll' + name],
                  elem.body['offset' + name],
                  doc['offset' + name],
                  doc['client' + name]
                )
              }

              return value === undefined
                ? SlimJQ.css(elem, type, extra)
                : SlimJQ.style(elem, type, value, extra)
            },
            type,
            chainable ? margin : undefined,
            chainable
          )
        }
      }
    )
  })

  SlimJQ.each(
    (
      'blur focus focusin focusout resize scroll click dblclick ' +
      'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
      'change select submit keydown keypress keyup contextmenu'
    ).split(' '),
    function(i, name) {
      SlimJQ.fn[name] = function(data, fn) {
        return arguments.length > 0
          ? this.on(name, null, data, fn)
          : this.trigger(name)
      }
    }
  )

  SlimJQ.fn.extend({
    hover: function(fnOver, fnOut) {
      return this.mouseenter(fnOver).mouseleave(fnOut || fnOver)
    }
  })

  SlimJQ.fn.extend({
    bind: function(types, data, fn) {
      return this.on(types, null, data, fn)
    },
    unbind: function(types, fn) {
      return this.off(types, null, fn)
    },

    delegate: function(selector, types, data, fn) {
      return this.on(types, selector, data, fn)
    },
    undelegate: function(selector, types, fn) {
      return arguments.length === 1
        ? this.off(selector, '**')
        : this.off(types, selector || '**', fn)
    }
  })

  SlimJQ.proxy = function(fn, context) {
    var tmp, args, proxy

    if (typeof context === 'string') {
      tmp = fn[context]
      context = fn
      fn = tmp
    }

    if (!isFunction(fn)) {
      return undefined
    }

    args = slice.call(arguments, 2)
    proxy = function() {
      return fn.apply(context || this, args.concat(slice.call(arguments)))
    }

    proxy.guid = fn.guid = fn.guid || SlimJQ.guid++

    return proxy
  }

  SlimJQ.holdReady = function(hold) {
    if (hold) {
      SlimJQ.readyWait++
    } else {
      SlimJQ.ready(true)
    }
  }
  SlimJQ.isArray = Array.isArray
  SlimJQ.parseJSON = JSON.parse
  SlimJQ.nodeName = nodeName
  SlimJQ.isFunction = isFunction
  SlimJQ.isWindow = isWindow
  SlimJQ.camelCase = camelCase
  SlimJQ.type = toType

  SlimJQ.now = Date.now

  SlimJQ.isNumeric = function(obj) {
    var type = SlimJQ.type(obj)
    return (
      (type === 'number' || type === 'string') && !isNaN(obj - parseFloat(obj))
    )
  }

  return SlimJQ
}

// SlimJQ.fn.button = function(e) {
//   if (typeof e === 'string') {
//     if (e === 'disable') {
//       SlimJQ(this).addClass('disabled')
//       SlimJQ(this)
//         .find('input')
//         .attr('disabled', true)
//     } else {
//       if (e === 'enable') {
//         SlimJQ(this).removeClass('disabled')
//         SlimJQ(this)
//           .find('input')
//           .attr('disabled', false)
//       } else {
//         if (e === 'isDisabled') {
//           return SlimJQ(this).hasClass('disabled')
//         } else {
//           if (e === 'isSelected') {
//             return SlimJQ(this).hasClass('selected')
//           } else {
//             if (e === 'unselect') {
//               SlimJQ(this).removeClass('selected')
//             } else {
//               if (e === 'select') {
//                 SlimJQ(this).addClass('selected')
//               } else {
//                 if (e === 'setText') {
//                   SlimJQ(this)
//                     .children('.text_content')
//                     .html(arguments[1])
//                 } else {
//                   if (e === 'setColor') {
//                     SlimJQ(this)
//                       .children('.btn_color')
//                       .css('background-color', 'rgb(' + arguments[1] + ')')
//                   } else {
//                     if (e === 'getColor') {
//                       var d = SlimJQ(this)
//                         .children('.btn_color')
//                         .css('background-color')
//                         .replace(/\s/g, '')
//                       return d.substring(4, d.length - 1)
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//     return SlimJQ(this)
//   }
//   var f = SlimJQ(this)
//   f.unbind('click')
//   f.unbind('mousedown')
//   if (e.onClick) {
//     f.bind('click', function() {
//       if (f.button('isDisabled')) {
//         return
//       }
//       e.onClick()
//     })
//   }
//   if (e.onMousedown) {
//     f.bind('mousedown', function(g) {
//       if (f.button('isDisabled')) {
//         return
//       }
//       e.onMousedown()
//       g.stopPropagation()
//     })
//   }
// }

// var b = null

// SlimJQ.fn.dropdown = function(e) {
//   var i = SlimJQ(this)
//   if (typeof e === 'string') {
//     if (e === 'close') {
//       i.hide()
//       b.target.removeClass('selected')
//       SlimJQ(document).unbind('mousedown.ui_dropdown')
//       b = null
//     } else {
//       if (e === 'select') {
//         arguments[1].prepend("<div class='ico ico_selected'></div>")
//       }
//     }
//     return
//   }
//   i.find('.ico_selected').remove()
//   if (b != null) {
//     b.menu.dropdown('close')
//   }
//   var i = SlimJQ(this)
//   var d = e.target
//   b = { target: d, menu: i }
//   var h = d.offset()
//   d.addClass('selected')
//   i.show()
//   var g
//   if (e.position === 'center') {
//     g = h.left + d.outerWidth() / 2 - i.outerWidth() / 2
//   } else {
//     if (e.position === 'right') {
//       g = h.left + d.outerWidth() - i.outerWidth()
//     } else {
//       g = h.left
//     }
//   }
//   var f = h.top + d.outerHeight()
//   if (f + i.outerHeight() > SlimJQ(window).height()) {
//     f = SlimJQ(window).height() - i.outerHeight()
//   }
//   i.css({ top: f, left: g })
//   if (typeof e.zindex !== 'undefined') {
//     i.css('z-index', e.zindex)
//   }
//   i.unbind('mousedown').bind('mousedown', function(j) {
//     j.stopPropagation()
//   })
//   if (typeof e.bind === 'undefined' || e.bind === true) {
//     i.find('li:not(.devider,.menu_text)')
//       .unbind()
//       .bind('click', function() {
//         var j = SlimJQ(this)
//         if (
//           !j.menuitem('isDisabled') &&
//           j.children('.extend_menu').length === 0
//         ) {
//           if (e.onSelect) {
//             e.onSelect(j)
//           }
//           i.dropdown('close')
//         }
//       })
//   }
//   SlimJQ(document).bind('mousedown.ui_dropdown', function() {
//     i.dropdown('close')
//   })
// }
// SlimJQ.colorpicker = function(e) {
//   var d = SlimJQ('#color_picker')
//   d.find('.selected').removeClass('selected')
//   if (!d.attr('init')) {
//     d.find('div').each(function() {
//       var g = SlimJQ(this).css('background-color')
//       g = g.replace(/\s/g, '')
//       g = g.substring(4, g.length - 1)
//       SlimJQ(this).attr('col', g)
//     })
//     d.attr('init', true)
//   }
//   var f = SlimJQ.extend({}, e, { bind: false })
//   d.dropdown(f)
//   d.children('.color_items')
//     .children('div')
//     .unbind()
//     .bind('click', function() {
//       if (e.onSelect) {
//         var g = SlimJQ(this).css('background-color')
//         g = g.replace(/\s/g, '')
//         g = g.substring(4, g.length - 1)
//         e.onSelect(g)
//       }
//       SlimJQ('#color_picker').dropdown('close')
//     })
//   if (e.color) {
//     d.find("div[col='" + e.color + "']").addClass('selected')
//   }
//   SlimJQ('#color_picker')
//     .children('.color_extend')
//     .remove()
//   if (e.extend) {
//     SlimJQ('#color_picker').append(
//       "<div class='color_extend'>" + e.extend + '</div>'
//     )
//   }
// }
// SlimJQ.fn.colorButton = function(e) {
//   var d = SlimJQ(this)
//   if (typeof e === 'string') {
//     if (e === 'setColor') {
//       d.children('.picker_btn_holder').css(
//         'background-color',
//         'rgb(' + arguments[1] + ')'
//       )
//     }
//     return
//   }
//   d.html(
//     "<div class='picker_btn_holder'></div><div class='ico ico_colordrop'></div>"
//   )
//   d.bind('mousedown', function(h) {
//     if (d.button('isDisabled')) {
//       return
//     }
//     h.stopPropagation()
//     var g = SlimJQ.extend({}, e)
//     g.target = d
//     g.onSelect = function(i) {
//       d.colorButton('setColor', i)
//       if (e.onSelect) {
//         e.onSelect(i)
//       }
//     }
//     var f = SlimJQ(this)
//       .children('.picker_btn_holder')
//       .css('background-color')
//     f = f.replace(/\s/g, '')
//     f = f.substring(4, f.length - 1)
//     g.color = f
//     SlimJQ.colorpicker(g)
//   })
// }
// SlimJQ.fn.spinner = function(g) {
//   var i = SlimJQ(this)
//   if (typeof g === 'string') {
//     if (g === 'getValue') {
//       var d = i.find('input').val()
//       d = parseFloat(d)
//       return d
//     } else {
//       if (g === 'setValue') {
//         i.find('input').val(arguments[1])
//         i.attr('old', arguments[1])
//       }
//     }
//     return
//   }
//   i.html(
//     "<div class='spinner_input'><input readonly/></div><div class='buttons'><div class='spinner_up'></div><div class='spinner_down'></div></div>"
//   )
//   var h = { min: 0, max: Number.MAX_VALUE, step: 1, unit: '' }
//   g = SlimJQ.extend(h, g)
//   var e = i.children('.spinner_input')
//   var f = e.find('input')
//   i.spinner('setValue', g.min + g.unit)
//   i.find('.spinner_up').bind('click', function() {
//     if (i.button('isDisabled')) {
//       return
//     }
//     var k = i.spinner('getValue')
//     var j = k + g.step
//     a(i, j, g)
//   })
//   i.find('.spinner_down').bind('click', function() {
//     if (i.button('isDisabled')) {
//       return
//     }
//     var k = i.spinner('getValue')
//     var j = k - g.step
//     a(i, j, g)
//   })
//   f.bind('keydown', function(k) {
//     if (k.keyCode === 13) {
//       var j = parseInt(SlimJQ(this).val())
//       if (isNaN(j)) {
//         j = g.min
//       }
//       a(i, j, g)
//     }
//   })
//     .bind('focus', function(k) {
//       SlimJQ(this).select()
//       SlimJQ(this).bind('mouseup', function(l) {
//         l.preventDefault()
//         SlimJQ(this).unbind('mouseup')
//       })
//       var j = SlimJQ(this)
//         .parent()
//         .parent()
//       if (!j.hasClass('active')) {
//         j.addClass('active inset')
//       }
//     })
//     .bind('blur', function(k) {
//       var j = SlimJQ(this)
//         .parent()
//         .parent()
//       if (j.hasClass('inset')) {
//         j.removeClass('active inset')
//       }
//     })
// }

// function a(h, f, e) {
//   if (f > e.max) {
//     f = e.max
//   }
//   if (f < e.min) {
//     f = e.min
//   }
//   var d = h.attr('old')
//   var g = f + e.unit
//   if (d !== g) {
//     if (e.onChange) {
//       e.onChange(f)
//     }
//   }
//   h.spinner('setValue', f + e.unit)
// }

// SlimJQ.fn.menuitem = function(d) {
//   var e = SlimJQ(this)
//   if (typeof d === 'string') {
//     if (d === 'disable') {
//       e.addClass('disabled')
//     } else {
//       if (d === 'enable') {
//         e.removeClass('disabled')
//       } else {
//         if (d === 'isDisabled') {
//           return e.hasClass('disabled')
//         } else {
//           if (d === 'isSelected') {
//             return e.children('.ico_selected').length > 0
//           } else {
//             if (d === 'unselect') {
//               return e.children('.ico_selected').remove()
//             } else {
//               if (d === 'select') {
//                 return e.prepend("<div class='ico ico_selected'></div>")
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }

export default SlimJQ()
