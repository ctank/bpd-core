/**
 * Built-in moddle types
 */
const BUILTINS = {
  String: true,
  Boolean: true,
  Integer: true,
  Real: true,
  Element: true
}

/**
 * Converters for built in types from string representations
 */
const TYPE_CONVERTERS = {
  String: function(s) {
    return s
  },
  Boolean: function(s) {
    return s === 'true'
  },
  Integer: function(s) {
    return parseInt(s, 10)
  },
  Real: function(s) {
    return parseFloat(s, 10)
  }
}

export const DEFAULT_NS_MAP = {
  xsi: 'http://www.w3.org/2001/XMLSchema-instance'
}

export const XSI_TYPE = 'xsi:type'

/**
 * Convert a type to its real representation
 */
export const coerceType = (type, value) => {
  var converter = TYPE_CONVERTERS[type]

  if (converter) {
    return converter(value)
  } else {
    return value
  }
}

/**
 * Return whether the given type is built-in
 */
export const isBuiltIn = type => {
  return !!BUILTINS[type]
}

/**
 * Return whether the given type is simple
 */
export const isSimple = type => {
  return !!TYPE_CONVERTERS[type]
}

export const hasLowerCaseAlias = pkg => {
  return pkg.xml && pkg.xml.tagAlias === 'lowerCase'
}

const serializeFormat = element => {
  return element.xml && element.xml.serialize
}

export const serializeAsType = element => {
  return serializeFormat(element) === XSI_TYPE
}

export const serializeAsProperty = element => {
  return serializeFormat(element) === 'property'
}

/**
 * Parses a namespaced attribute name of the form (ns:)localName to an object,
 * given a default prefix to assume in case no explicit namespace is given.
 *
 * @param {String} name
 * @param {String} [defaultPrefix] the default prefix to take, if none is present.
 *
 * @return {Object} the parsed name
 */
export const parseName = (name, defaultPrefix) => {
  var parts = name.split(/:/)

  var localName
  var prefix

  // no prefix (i.e. only local name)
  if (parts.length === 1) {
    localName = name
    prefix = defaultPrefix
  }
  // prefix + local name
  else if (parts.length === 2) {
    localName = parts[1]
    prefix = parts[0]
  } else {
    throw new Error('expected <prefix:localName> or <localName>, got ' + name)
  }

  name = (prefix ? prefix + ':' : '') + localName

  return {
    name: name,
    prefix: prefix,
    localName: localName
  }
}
