import Stack from '../../../utils/tinyStack'
import Saxen from '../../../utils/saxen'

import Model from '../model/model'
import {
  coerceType,
  isSimple as isSimpleType,
  XSI_TYPE,
  serializeAsType,
  hasLowerCaseAlias,
  parseName as parseNameNs
} from '../utils'

const SaxParser = Saxen.Parser

function find(collection, matcher) {
  matcher =
    typeof matcher === 'function' && matcher.constructor === Function
      ? matcher
      : e => {
          return e === matcher
        }

  var match

  collection.forEach((val, key) => {
    if (matcher(val, key)) {
      match = val

      return false
    }
  })

  return match
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function aliasToName(aliasNs, pkg) {
  if (!hasLowerCaseAlias(pkg)) {
    return aliasNs.name
  }

  return aliasNs.prefix + ':' + capitalize(aliasNs.localName)
}

function prefixedToName(nameNs, pkg) {
  var name = nameNs.name

  var localName = nameNs.localName

  var typePrefix = pkg.xml && pkg.xml.typePrefix

  if (typePrefix && localName.indexOf(typePrefix) === 0) {
    return nameNs.prefix + ':' + localName.slice(typePrefix.length)
  } else {
    return name
  }
}

function normalizeXsiTypeName(name, model) {
  var nameNs = parseNameNs(name)
  var pkg = model.getPackage(nameNs.prefix)

  return prefixedToName(nameNs, pkg)
}

function error(message) {
  return new Error(message)
}

/**
 * Get the model descriptor for a given instance or type.
 *
 * @param  {ModelElement|Function} element
 *
 * @return {Object} the model descriptor
 */
function getModelDescriptor(element) {
  return element.$descriptor
}

function defer(fn) {
  setTimeout(fn, 0)
}

/**
 * A parse context.
 *
 * @class
 *
 * @param {Object} options
 * @param {ElementHandler} options.rootHandler the root handler for parsing a document
 * @param {boolean} [options.lax=false] whether or not to ignore invalid elements
 */
export function Context(options) {
  /**
   * @property {ElementHandler} rootHandler
   */

  /**
   * @property {Boolean} lax
   */

  Object.assign(this, options)

  this.elementsById = {}
  this.references = []
  this.warnings = []

  /**
   * Add an unresolved reference.
   *
   * @param {Object} reference
   */
  this.addReference = function(reference) {
    this.references.push(reference)
  }

  /**
   * Add a processed element.
   *
   * @param {ModelElement} element
   */
  this.addElement = function(element) {
    if (!element) {
      throw error('expected element')
    }

    var elementsById = this.elementsById

    var descriptor = getModelDescriptor(element)

    var idProperty = descriptor.idProperty

    var id

    if (idProperty) {
      id = element.get(idProperty.name)

      if (id) {
        if (elementsById[id]) {
          throw error('duplicate ID <' + id + '>')
        }

        elementsById[id] = element
      }
    }
  }

  /**
   * Add an import warning.
   *
   * @param {Object} warning
   * @param {String} warning.message
   * @param {Error} [warning.error]
   */
  this.addWarning = function(warning) {
    this.warnings.push(warning)
  }
}

function BaseHandler() {}

BaseHandler.prototype.handleEnd = function() {}
BaseHandler.prototype.handleText = function() {}
BaseHandler.prototype.handleNode = function() {}

/**
 * A simple pass through handler that does nothing except for
 * ignoring all input it receives.
 *
 * This is used to ignore unknown elements and
 * attributes.
 */
function NoopHandler() {}

NoopHandler.prototype = Object.create(BaseHandler.prototype)

NoopHandler.prototype.handleNode = function() {
  return this
}

function BodyHandler() {}

BodyHandler.prototype = Object.create(BaseHandler.prototype)

BodyHandler.prototype.handleText = function(text) {
  this.body = (this.body || '') + text
}

function ReferenceHandler(property, context) {
  this.property = property
  this.context = context
}

ReferenceHandler.prototype = Object.create(BodyHandler.prototype)

ReferenceHandler.prototype.handleNode = function(node) {
  if (this.element) {
    throw error('expected no sub nodes')
  } else {
    this.element = this.createReference(node)
  }

  return this
}

ReferenceHandler.prototype.handleEnd = function() {
  this.element.id = this.body
}

ReferenceHandler.prototype.createReference = function(node) {
  return {
    property: this.property.ns.name,
    id: ''
  }
}

function ValueHandler(propertyDesc, element) {
  this.element = element
  this.propertyDesc = propertyDesc
}

ValueHandler.prototype = Object.create(BodyHandler.prototype)

ValueHandler.prototype.handleEnd = function() {
  var value = this.body || ''

  var element = this.element

  var propertyDesc = this.propertyDesc

  value = coerceType(propertyDesc.type, value)

  if (propertyDesc.isMany) {
    element.get(propertyDesc.name).push(value)
  } else {
    element.set(propertyDesc.name, value)
  }
}

function BaseElementHandler() {}

BaseElementHandler.prototype = Object.create(BodyHandler.prototype)

BaseElementHandler.prototype.handleNode = function(node) {
  var parser = this

  var element = this.element

  if (!element) {
    element = this.element = this.createElement(node)

    this.context.addElement(element)
  } else {
    parser = this.handleChild(node)
  }

  return parser
}

/**
 * @class Reader.ElementHandler
 *
 */
export function ElementHandler(model, typeName, context) {
  this.model = model
  this.type = model.getType(typeName)
  this.context = context
}

ElementHandler.prototype = Object.create(BaseElementHandler.prototype)

ElementHandler.prototype.addReference = function(reference) {
  this.context.addReference(reference)
}

ElementHandler.prototype.handleText = function(text) {
  var element = this.element

  var descriptor = getModelDescriptor(element)

  var bodyProperty = descriptor.bodyProperty

  if (!bodyProperty) {
    throw error('unexpected body text <' + text + '>')
  }

  BodyHandler.prototype.handleText.call(this, text)
}

ElementHandler.prototype.handleEnd = function() {
  var value = this.body

  var element = this.element

  var descriptor = getModelDescriptor(element)

  var bodyProperty = descriptor.bodyProperty

  if (bodyProperty && value !== undefined) {
    value = coerceType(bodyProperty.type, value)
    element.set(bodyProperty.name, value)
  }
}

/**
 * Create an instance of the model from the given node.
 *
 * @param  {Element} node the xml node
 */
ElementHandler.prototype.createElement = function(node) {
  var attributes = node.attributes

  var Type = this.type

  var descriptor = getModelDescriptor(Type)

  var context = this.context

  var instance = new Type({})

  var model = this.model

  var propNameNs

  const keys = Object.keys(attributes)

  keys.forEach(key => {
    let value = attributes[key]
    var prop = descriptor.propertiesByName[key]

    var values

    if (prop && prop.isReference) {
      if (!prop.isMany) {
        context.addReference({
          element: instance,
          property: prop.ns.name,
          id: value
        })
      } else {
        values = value.split(' ')
        values.forEach(v => {
          context.addReference({
            element: instance,
            property: prop.ns.name,
            id: v
          })
        })
      }
    } else {
      if (prop) {
        value = coerceType(prop.type, value)
      } else if (key !== 'xmlns') {
        propNameNs = parseNameNs(key, descriptor.ns.prefix)

        // check whether attribute is defined in a well-known namespace
        // if that is the case we emit a warning to indicate potential misuse
        if (model.getPackage(propNameNs.prefix)) {
          context.addWarning({
            message: 'unknown attribute <' + key + '>',
            element: instance,
            property: key,
            value: value
          })
        }
      }

      instance.set(key, value)
    }
  })

  return instance
}

ElementHandler.prototype.getPropertyForNode = function(node) {
  var name = node.name
  var nameNs = parseNameNs(name)

  var type = this.type

  var model = this.model

  var descriptor = getModelDescriptor(type)

  var propertyName = nameNs.name

  var property = descriptor.propertiesByName[propertyName]

  var elementTypeName

  var elementType

  // search for properties by name first

  if (property) {
    if (serializeAsType(property)) {
      elementTypeName = node.attributes[XSI_TYPE]

      // xsi type is optional, if it does not exists the
      // default type is assumed
      if (elementTypeName) {
        // take possible type prefixes from XML
        // into account, i.e.: xsi:type="t{ActualType}"
        elementTypeName = normalizeXsiTypeName(elementTypeName, model)

        elementType = model.getType(elementTypeName)

        return Object.assign({}, property, {
          effectiveType: getModelDescriptor(elementType).name
        })
      }
    }

    // search for properties by name first
    return property
  }

  var pkg = model.getPackage(nameNs.prefix)

  if (pkg) {
    elementTypeName = aliasToName(nameNs, pkg)
    elementType = model.getType(elementTypeName)

    // search for collection members later
    property = find(descriptor.properties, function(p) {
      return (
        !p.isVirtual &&
        !p.isReference &&
        !p.isAttribute &&
        elementType.hasType(p.type)
      )
    })

    if (property) {
      return Object.assign({}, property, {
        effectiveType: getModelDescriptor(elementType).name
      })
    }
  } else {
    // parse unknown element (maybe extension)
    property = find(descriptor.properties, function(p) {
      return !p.isReference && !p.isAttribute && p.type === 'Element'
    })

    if (property) {
      return property
    }
  }

  throw error('unrecognized element <' + nameNs.name + '>')
}

ElementHandler.prototype.toString = function() {
  return 'ElementDescriptor[' + getModelDescriptor(this.type).name + ']'
}

ElementHandler.prototype.valueHandler = function(propertyDesc, element) {
  return new ValueHandler(propertyDesc, element)
}

ElementHandler.prototype.referenceHandler = function(propertyDesc) {
  return new ReferenceHandler(propertyDesc, this.context)
}

ElementHandler.prototype.handler = function(type) {
  if (type === 'Element') {
    return new GenericElementHandler(this.model, type, this.context)
  } else {
    return new ElementHandler(this.model, type, this.context)
  }
}

/**
 * Handle the child element parsing
 *
 * @param  {Element} node the xml node
 */
ElementHandler.prototype.handleChild = function(node) {
  var propertyDesc, type, element, childHandler

  propertyDesc = this.getPropertyForNode(node)
  element = this.element

  type = propertyDesc.effectiveType || propertyDesc.type

  if (isSimpleType(type)) {
    return this.valueHandler(propertyDesc, element)
  }

  if (propertyDesc.isReference) {
    childHandler = this.referenceHandler(propertyDesc).handleNode(node)
  } else {
    childHandler = this.handler(type).handleNode(node)
  }

  var newElement = childHandler.element

  // child handles may decide to skip elements
  // by not returning anything
  if (newElement !== undefined) {
    if (propertyDesc.isMany) {
      element.get(propertyDesc.name).push(newElement)
    } else {
      element.set(propertyDesc.name, newElement)
    }

    if (propertyDesc.isReference) {
      Object.assign(newElement, {
        element: element
      })

      this.context.addReference(newElement)
    } else {
      // establish child -> parent relationship
      newElement.$parent = element
    }
  }

  return childHandler
}

/**
 * An element handler that performs special validation
 * to ensure the node it gets initialized with matches
 * the handlers type (namespace wise).
 *
 * @param {Model} model
 * @param {String} typeName
 * @param {Context} context
 */
function RootElementHandler(model, typeName, context) {
  ElementHandler.call(this, model, typeName, context)
}

RootElementHandler.prototype = Object.create(ElementHandler.prototype)

RootElementHandler.prototype.createElement = function(node) {
  var name = node.name

  var nameNs = parseNameNs(name)

  var model = this.model

  var type = this.type

  var pkg = model.getPackage(nameNs.prefix)

  var typeName = (pkg && aliasToName(nameNs, pkg)) || name

  // verify the correct namespace if we parse
  // the first element in the handler tree
  //
  // this ensures we don't mistakenly import wrong namespace elements
  if (!type.hasType(typeName)) {
    throw error('unexpected element <' + node.originalName + '>')
  }

  return ElementHandler.prototype.createElement.call(this, node)
}

function GenericElementHandler(model, typeName, context) {
  this.model = model
  this.context = context
}

GenericElementHandler.prototype = Object.create(BaseElementHandler.prototype)

GenericElementHandler.prototype.createElement = function(node) {
  var name = node.name

  var ns = parseNameNs(name)

  var prefix = ns.prefix

  var uri = node.ns[prefix + '$uri']

  var attributes = node.attributes

  return this.model.createAny(name, uri, attributes)
}

GenericElementHandler.prototype.handleChild = function(node) {
  var handler = new GenericElementHandler(
    this.model,
    'Element',
    this.context
  ).handleNode(node)

  var element = this.element

  var newElement = handler.element

  var children

  if (newElement !== undefined) {
    children = element.$children = element.$children || []
    children.push(newElement)

    // establish child -> parent relationship
    newElement.$parent = element
  }

  return handler
}

GenericElementHandler.prototype.handleEnd = function() {
  if (this.body) {
    this.element.$body = this.body
  }
}

/**
 * A reader for a meta-model
 *
 * @param {Object} options
 * @param {Model} options.model used to read xml files
 * @param {Boolean} options.lax whether to make parse errors warnings
 */
export function Reader(options) {
  if (options instanceof Model) {
    options = {
      model: options
    }
  }

  Object.assign(this, { lax: false }, options)
}

/**
 * Parse the given XML into a model document tree.
 *
 * @param {String} xml
 * @param {ElementHandler|Object} options or rootHandler
 * @param  {Function} done
 */
Reader.prototype.fromXML = function(xml, options, done) {
  var rootHandler = options.rootHandler

  if (options instanceof ElementHandler) {
    // root handler passed via (xml, { rootHandler: ElementHandler }, ...)
    rootHandler = options
    options = {}
  } else {
    if (typeof options === 'string') {
      // rootHandler passed via (xml, 'someString', ...)
      rootHandler = this.handler(options)
      options = {}
    } else if (typeof rootHandler === 'string') {
      // rootHandler passed via (xml, { rootHandler: 'someString' }, ...)
      rootHandler = this.handler(rootHandler)
    }
  }

  var model = this.model

  var lax = this.lax

  var context = new Context(
    Object.assign({}, options, { rootHandler: rootHandler })
  )

  var parser = new SaxParser({ proxy: true })

  var stack = new Stack()

  rootHandler.context = context

  // push root handler
  stack.push(rootHandler)

  /**
   * Handle error.
   *
   * @param  {Error} err
   * @param  {Function} getContext
   * @param  {boolean} lax
   *
   * @return {boolean} true if handled
   */
  function handleError(err, getContext, lax) {
    var ctx = getContext()

    var line = ctx.line

    var column = ctx.column

    var data = ctx.data

    // we receive the full context data here,
    // for elements trim down the information
    // to the tag name, only
    if (data.charAt(0) === '<' && data.indexOf(' ') !== -1) {
      data = data.slice(0, data.indexOf(' ')) + '>'
    }

    var message =
      'unparsable content ' +
      (data ? data + ' ' : '') +
      'detected\n\t' +
      'line: ' +
      line +
      '\n\t' +
      'column: ' +
      column +
      '\n\t' +
      'nested error: ' +
      err.message

    if (lax) {
      context.addWarning({
        message: message,
        error: err
      })

      console.warn('could not parse node')
      console.warn(err)

      return true
    } else {
      console.error('could not parse document')
      console.error(err)

      throw error(message)
    }
  }

  function handleWarning(err, getContext) {
    // just like handling errors in <lax=true> mode
    return handleError(err, getContext, true)
  }

  /**
   * Resolve collected references on parse end.
   */
  function resolveReferences() {
    var elementsById = context.elementsById
    var references = context.references

    var i, r

    for (i = 0; (r = references[i]); i++) {
      var element = r.element
      var reference = elementsById[r.id]
      var property = getModelDescriptor(element).propertiesByName[r.property]

      if (!reference) {
        context.addWarning({
          message: 'unresolved reference <' + r.id + '>',
          element: r.element,
          property: r.property,
          value: r.id
        })
      }

      if (property.isMany) {
        var collection = element.get(property.name)

        var idx = collection.indexOf(r)

        // we replace an existing place holder (idx != -1) or
        // append to the collection instead
        if (idx === -1) {
          idx = collection.length
        }

        if (!reference) {
          // remove unresolvable reference
          collection.splice(idx, 1)
        } else {
          // add or update reference in collection
          collection[idx] = reference
        }
      } else {
        element.set(property.name, reference)
      }
    }
  }

  function handleClose() {
    stack.pop().handleEnd()
  }

  var PREAMBLE_START_PATTERN = /^<\?xml /i

  var ENCODING_PATTERN = / encoding="([^"]+)"/i

  var UTF_8_PATTERN = /^utf-8$/i

  function handleQuestion(question) {
    if (!PREAMBLE_START_PATTERN.test(question)) {
      return
    }

    var match = ENCODING_PATTERN.exec(question)
    var encoding = match && match[1]

    if (!encoding || UTF_8_PATTERN.test(encoding)) {
      return
    }

    context.addWarning({
      message:
        'unsupported document encoding <' +
        encoding +
        '>, ' +
        'falling back to UTF-8'
    })
  }

  function handleOpen(node, getContext) {
    var handler = stack.peek()

    try {
      stack.push(handler.handleNode(node))
    } catch (err) {
      if (handleError(err, getContext, lax)) {
        stack.push(new NoopHandler())
      }
    }
  }

  function handleCData(text, getContext) {
    try {
      stack.peek().handleText(text)
    } catch (err) {
      handleWarning(err, getContext)
    }
  }

  function handleText(text, getContext) {
    // strip whitespace only nodes, i.e. before
    // <!CDATA[ ... ]> sections and in between tags
    text = text.trim()

    if (!text) {
      return
    }

    handleCData(text, getContext)
  }

  var uriMap = model.getPackages().reduce(function(uriMap, p) {
    uriMap[p.uri] = p.prefix

    return uriMap
  }, {})

  parser
    .ns(uriMap)
    .on('openTag', function(obj, decodeStr, selfClosing, getContext) {
      // gracefully handle unparsable attributes (attrs=false)
      var attrs = obj.attrs || {}

      var decodedAttrs = Object.keys(attrs).reduce(function(d, key) {
        var value = decodeStr(attrs[key])

        d[key] = value

        return d
      }, {})

      var node = {
        name: obj.name,
        originalName: obj.originalName,
        attributes: decodedAttrs,
        ns: obj.ns
      }

      handleOpen(node, getContext)
    })
    .on('question', handleQuestion)
    .on('closeTag', handleClose)
    .on('cdata', handleCData)
    .on('text', function(text, decodeEntities, getContext) {
      handleText(decodeEntities(text), getContext)
    })
    .on('error', handleError)
    .on('warn', handleWarning)

  // deferred parse XML to make loading really ascnchronous
  // this ensures the execution environment (node or browser)
  // is kept responsive and that certain optimization strategies
  // can kick in
  defer(function() {
    var err

    try {
      parser.parse(xml)

      resolveReferences()
    } catch (e) {
      err = e
    }

    var element = rootHandler.element

    // handle the situation that we could not extract
    // the desired root element from the document
    if (!err && !element) {
      err = error(
        'failed to parse document as <' +
          rootHandler.type.$descriptor.name +
          '>'
      )
    }

    done(err, err ? undefined : element, context)
  })
}

Reader.prototype.handler = function(name) {
  return new RootElementHandler(this.model, name)
}
