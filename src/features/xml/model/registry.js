import DescriptorBuilder from './descriptor-builder'
import { isBuiltIn as isBuiltInType, parseName as parseNameNs } from '../utils'

/**
 * A registry of Model packages.
 *
 * @param {Array<Package>} packages
 * @param {Properties} properties
 */
export default function Registry(packages, properties) {
  this.packageMap = {}
  this.typeMap = {}

  this.packages = []

  this.properties = properties

  const keys = Object.keys(packages)
  keys.forEach(key => {
    this.registerPackage(packages[key])
  })

  // forEach(packages, this.registerPackage.bind(this))
}

Registry.prototype.getPackage = function(uriOrPrefix) {
  return this.packageMap[uriOrPrefix]
}

Registry.prototype.getPackages = function() {
  return this.packages
}

Registry.prototype.registerPackage = function(pkg) {
  // copy package
  pkg = Object.assign({}, pkg)

  var pkgMap = this.packageMap

  ensureAvailable(pkgMap, pkg, 'prefix')
  ensureAvailable(pkgMap, pkg, 'uri')

  // register types
  pkg.types.forEach(descriptor => {
    this.registerType(descriptor, pkg)
  })

  // forEach(
  //   pkg.types,
  //   function(descriptor) {
  //     this.registerType(descriptor, pkg)
  //   }.bind(this)
  // )

  pkgMap[pkg.uri] = pkgMap[pkg.prefix] = pkg
  this.packages.push(pkg)
}

/**
 * Register a type from a specific package with us
 */
Registry.prototype.registerType = function(type, pkg) {
  type = Object.assign({}, type, {
    superClass: (type.superClass || []).slice(),
    extends: (type.extends || []).slice(),
    properties: (type.properties || []).slice(),
    meta: Object.assign(({}, type.meta || {}))
  })

  var ns = parseNameNs(type.name, pkg.prefix)

  var name = ns.name

  var propertiesByName = {}

  // parse properties
  type.properties.forEach(p => {
    // namespace property names
    var propertyNs = parseNameNs(p.name, ns.prefix)

    var propertyName = propertyNs.name

    // namespace property types
    if (!isBuiltInType(p.type)) {
      p.type = parseNameNs(p.type, propertyNs.prefix).name
    }

    Object.assign(p, {
      ns: propertyNs,
      name: propertyName
    })

    propertiesByName[propertyName] = p
  })

  // forEach(type.properties, function(p) {
  //   // namespace property names
  //   var propertyNs = parseNameNs(p.name, ns.prefix)

  //   var propertyName = propertyNs.name

  //   // namespace property types
  //   if (!isBuiltInType(p.type)) {
  //     p.type = parseNameNs(p.type, propertyNs.prefix).name
  //   }

  //   Object.assign(p, {
  //     ns: propertyNs,
  //     name: propertyName
  //   })

  //   propertiesByName[propertyName] = p
  // })

  // update ns + name
  Object.assign(type, {
    ns: ns,
    name: name,
    propertiesByName: propertiesByName
  })

  type.extends.forEach(extendsName => {
    var extended = this.typeMap[extendsName]

    extended.traits = extended.traits || []
    extended.traits.push(name)
  })

  // link to package
  this.definePackage(type, pkg)

  // register
  this.typeMap[name] = type
}

/**
 * Traverse the type hierarchy from bottom to top,
 * calling iterator with (type, inherited) for all elements in
 * the inheritance chain.
 *
 * @param {Object} nsName
 * @param {Function} iterator
 * @param {Boolean} [trait=false]
 */
Registry.prototype.mapTypes = function(nsName, iterator, trait) {
  var type = isBuiltInType(nsName.name)
    ? { name: nsName.name }
    : this.typeMap[nsName.name]

  var self = this

  /**
   * Traverse the selected trait.
   *
   * @param {String} cls
   */
  function traverseTrait(cls) {
    return traverseSuper(cls, true)
  }

  /**
   * Traverse the selected super type or trait
   *
   * @param {String} cls
   * @param {Boolean} [trait=false]
   */
  function traverseSuper(cls, trait) {
    var parentNs = parseNameNs(cls, isBuiltInType(cls) ? '' : nsName.prefix)
    self.mapTypes(parentNs, iterator, trait)
  }

  if (!type) {
    throw new Error('unknown type <' + nsName.name + '>')
  }

  if (type.superClass) {
    type.superClass.forEach(cls => {
      if (trait) {
        traverseTrait(cls)
      } else {
        traverseSuper(cls)
      }
    })
  }

  // call iterator with (type, inherited=!trait)
  iterator(type, !trait)

  if (type.traits && type.traits.length > 0) {
    type.traits.forEach(trait => {
      traverseTrait(trait)
    })
  }
}

/**
 * Returns the effective descriptor for a type.
 *
 * @param  {String} type the namespaced name (ns:localName) of the type
 *
 * @return {Descriptor} the resulting effective descriptor
 */
Registry.prototype.getEffectiveDescriptor = function(name) {
  var nsName = parseNameNs(name)

  var builder = new DescriptorBuilder(nsName)

  this.mapTypes(nsName, function(type, inherited) {
    builder.addTrait(type, inherited)
  })

  var descriptor = builder.build()

  // define package link
  this.definePackage(
    descriptor,
    descriptor.allTypes[descriptor.allTypes.length - 1].$pkg
  )

  return descriptor
}

Registry.prototype.definePackage = function(target, pkg) {
  this.properties.define(target, '$pkg', { value: pkg })
}

function ensureAvailable(packageMap, pkg, identifierKey) {
  var value = pkg[identifierKey]

  if (value in packageMap) {
    throw new Error(
      'package with ' + identifierKey + ' <' + value + '> already defined'
    )
  }
}
