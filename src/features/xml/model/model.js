import Factory from './factory'
import Registry from './registry'
import Properties from './properties'
import { parseName as parseNameNs } from '../utils'

/**
 * A model that can be used to create elements of a specific type.
 * @param {Array<Package>} packages the packages to contain
 */
class Model {
  constructor(packages) {
    this.properties = new Properties(this)

    this.factory = new Factory(this, this.properties)

    this.registry = new Registry(packages, this.properties)

    this.typeCache = {}
  }

  /**
   * Create an instance of the specified type.
   * @param  {String|Object} descriptor the type descriptor or name know to the model
   * @param  {Object} attrs   a number of attributes to initialize the model instance with
   * @return {Object}         model instance
   */
  create(descriptor, attrs) {
    const Type = this.getType(descriptor)
    if (!Type) {
      throw new Error('unknown type <' + descriptor + '>')
    }
    return new Type(attrs)
  }

  /**
   * Returns the type representing a given descriptor
   * @param  {String|Object} descriptor the type descriptor or name know to the model
   * @return {Object}         the type representing the descriptor
   */
  getType(descriptor) {
    var cache = this.typeCache

    var name =
      typeof descriptor === 'string' && descriptor.constructor === String
        ? descriptor
        : descriptor.ns.name

    var type = cache[name]

    if (!type) {
      descriptor = this.registry.getEffectiveDescriptor(name)
      type = cache[name] = this.factory.createType(descriptor)
    }

    return type
  }

  /**
   * Creates an any-element type to be used within model instances.
   *
   * This can be used to create custom elements that lie outside the meta-model.
   * The created element contains all the meta-data required to serialize it
   *
   * @param  {String} name  the name of the element
   * @param  {String} nsUri the namespace uri of the element
   * @param  {Object} [properties] a map of properties to initialize the instance with
   * @return {Object} the any type instance
   */
  createAny(name, nsUri, properties) {
    var nameNs = parseNameNs(name)

    var element = {
      $type: name,
      $instanceOf: function(type) {
        return type === this.$type
      }
    }

    var descriptor = {
      name: name,
      isGeneric: true,
      ns: {
        prefix: nameNs.prefix,
        localName: nameNs.localName,
        uri: nsUri
      }
    }

    this.properties.defineDescriptor(element, descriptor)
    this.properties.defineModel(element, this)
    this.properties.define(element, '$parent', {
      enumerable: false,
      writable: true
    })

    for (let key in properties) {
      const prop = properties[key]
      if (
        typeof prop === 'object' &&
        prop.constructor === Object &&
        prop.value !== undefined
      ) {
        element[prop.name] = a.value
      } else {
        element[key] = prop
      }
    }

    return element
  }

  /**
   * Returns a registered package by uri or prefix
   *
   * @return {Object} the package
   */
  getPackage(uriOrPrefix) {
    return this.registry.getPackage(uriOrPrefix)
  }

  /**
   * Returns a snapshot of all known packages
   *
   * @return {Object} the package
   */
  getPackages() {
    return this.registry.getPackages()
  }

  /**
   * Returns the descriptor for an element
   */
  getElementDescriptor(element) {
    return element.$descriptor
  }

  /**
   * Returns true if the given descriptor or instance
   * represents the given type.
   *
   * May be applied to this, if element is omitted.
   */
  hasType(element, type) {
    if (type === undefined) {
      type = element
      element = this
    }

    var descriptor = element.$model.getElementDescriptor(element)

    return type in descriptor.allTypesByName
  }

  /**
   * Returns the descriptor of an elements named property
   */
  getPropertyDescriptor(element, property) {
    return this.getElementDescriptor(element).propertiesByName[property]
  }

  /**
   * Returns a mapped type's descriptor
   */
  getTypeDescriptor(type) {
    return this.registry.typeMap[type]
  }
}

export default Model
