import Model from './model/model'
import eventBus from '../../core/eventBus'
import { Reader, Writer } from './model-xml'

/**
 * A sub class of {@link Model} with support for import and export of BPMN 2.0 xml files.
 *
 * @class BpmnModel
 * @extends Model
 *
 * @param {Object|Array} packages to use for instantiating the model
 * @param {Object} [options] additional options to pass over
 */
class BpmnModel extends Model {
  constructor(packages, options) {
    super(packages, options)
    // 导入
    eventBus.on('model.import', this.fromXML.bind(this))
    // 导出
    eventBus.on('model.export', this.toXML.bind(this))
    // 创建
    eventBus.on('model.create', this.createModel.bind(this))
  }
  /**
   * 创建模型数据
   * @param {*} data
   * @param {*} callback
   */
  createModel(data, callback = () => {}) {
    callback(this.create(data.descriptor, data.attrs))
  }
  /**
   * Instantiates a BPMN model tree from a given xml string.
   *
   * @param {String}   xmlStr
   * @param {String}   [typeName='bpmn:Definitions'] name of the root element
   * @param {Object}   [options]  options to pass to the underlying reader
   * @param {Function} done       callback that is invoked with (err, result, parseContext)
   *                              once the import completes
   */
  fromXML(xmlStr, typeName, options, done) {
    if (!(typeof typeName === 'string' && typeName.constructor === String)) {
      done = options
      options = typeName
      typeName = 'bpmn:Definitions'
    }

    if (typeof options === 'function' && options.constructor === Function) {
      done = options
      options = {}
    }

    var reader = new Reader(Object.assign({ model: this, lax: true }, options))
    var rootHandler = reader.handler(typeName)

    reader.fromXML(xmlStr, rootHandler, done)
  }

  /**
   * Serializes a BPMN 2.0 object tree to XML.
   *
   * @param {String}   element    the root element, typically an instance of `bpmn:Definitions`
   * @param {Object}   [options]  to pass to the underlying writer
   * @param {Function} done       callback invoked with (err, xmlStr) once the import completes
   */
  toXML(element, options, done) {
    if (typeof options === 'function' && options.constructor === Function) {
      done = options
      options = {}
    }

    var writer = new Writer(options)

    var result
    var err

    try {
      result = writer.toXML(element)
    } catch (e) {
      err = e
    }

    return done(err, result)
  }
}

export default BpmnModel
