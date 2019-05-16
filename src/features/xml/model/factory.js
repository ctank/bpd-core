import Base from './base'

/**
 * A model element factory.
 *
 * @param {Model} model
 * @param {Properties} properties
 */
export default function Factory(model, properties) {
  this.model = model
  this.properties = properties
}

Factory.prototype.createType = function(descriptor) {
  var model = this.model

  var props = this.properties

  var prototype = Object.create(Base.prototype)

  // initialize default values
  descriptor.properties.forEach(p => {
    if (!p.isMany && p.default !== undefined) {
      prototype[p.name] = p.default
    }
  })

  props.defineModel(prototype, model)
  props.defineDescriptor(prototype, descriptor)

  var name = descriptor.ns.name

  /**
   * The new type constructor
   */
  function ModelElement(attrs) {
    props.define(this, '$type', { value: name, enumerable: true })
    props.define(this, '$attrs', { value: {} })
    props.define(this, '$parent', { writable: true })

    for (let key in attrs) {
      this.set(key, attrs[key])
    }
  }

  ModelElement.prototype = prototype

  ModelElement.hasType = prototype.$instanceOf = this.model.hasType

  // static links
  props.defineModel(ModelElement, model)
  props.defineDescriptor(ModelElement, descriptor)

  return ModelElement
}
