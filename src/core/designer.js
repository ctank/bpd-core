import eventBus from './eventBus'
import DrawUtils from '../draw/drawUtils'

import $ from '../utils/slimJQ'
import {
  cloneDeep,
  convertFirstLetter,
  setScale,
  restoreScale
} from '../utils/utils'

class Designer {
  constructor(options, $container, definitions) {
    // 配置
    this.options = options
    //
    this.$container = $container
    //
    this.definitions = definitions
    // 最大z坐标
    this.maxZIndex = 0
    // 图形集合
    this.elements = {}
    //
    this.groups = {}
    //
    this.connections = {}
    //
    this.orders = []
    //
    this.init()
  }
  init() {
    // 创建数据
    eventBus.on('data.create', this.createData.bind(this))
    // 删除数据
    eventBus.on('data.remove', this.removeData.bind(this))
    // 创建数据
    eventBus.on('element.create', this.createElement.bind(this))
    //
    eventBus.on('element.get', this.getElement.bind(this))
    //
    eventBus.on('element.add', this.addData.bind(this))
    //
    eventBus.on('element.update', this.update.bind(this))
    //
    eventBus.on('element.change', this.change.bind(this))
    //
    eventBus.on('process.get', this.getProcess.bind(this))
    //
    eventBus.on('connections.get', this.getShapeConnections.bind(this))
    //
    eventBus.on('orders.get', () => {
      return this.orders
    })
  }

  createData(type, callback = () => {}) {
    const self = this

    let shapeAnchors = []
    let element = null

    let $shape = null
    let $layout = this.$container.find('.bpd-layout')
    let $designer = $layout.find('.bpd-designer')

    $layout.on('mousemove.create', event => {
      const canvasPos = DrawUtils.getRelativePos(
        event.pageX,
        event.pageY,
        $designer
      )

      let keys = 0
      let bounds = null

      if (element == null) {
        // 创建数据
        element = eventBus.trigger('element.create', {
          name: null,
          type: convertFirstLetter(type, 'uppercase'),
          prefix: 'obj',
          pos: canvasPos
        })

        bounds = element.plane.bounds

        bounds.x = restoreScale(canvasPos.x) - bounds.width / 2
        bounds.y = restoreScale(canvasPos.y) - bounds.height / 2

        keys = Object.keys(this.elements)

        // 渲染图形
        eventBus.trigger('shape.render', { type, element })
        $shape = this.$container.find(
          '.shape-box[data-id="' + element.data.id + '"]'
        )
        $shape.attr('class', 'shape-box-creating')
        $shape.css({
          left: canvasPos.x - $shape.width() / 2 + 'px',
          top: canvasPos.y - $shape.height() / 2 + 'px',
          'z-index': keys.length
        })
      } else {
        bounds = element.plane.bounds
        bounds.x = restoreScale(canvasPos.x) - bounds.width / 2
        bounds.y = restoreScale(canvasPos.y) - bounds.height / 2
      }

      const snapLine = eventBus.trigger('shape.snapline.show', {
        size: bounds,
        ids: []
      })

      $shape.css({
        left: setScale(bounds.x - 10) + 'px',
        top: setScale(bounds.y - 10) + 'px',
        'z-index': keys.length
      })
    })
    let isCreated = false
    $layout.on('mouseup.create', () => {
      isCreated = true
    })

    $(document).on('mouseup.create', () => {
      $(document).off('mouseup.create')
      $designer.off('mousemove.creating')
      eventBus.trigger('shape.snapline.hide')
      $layout.off('mouseup.create').off('mousemove.create')
      if (element != null) {
        if (isCreated === false) {
          $shape.remove()
        } else {
          $shape.attr('class', 'shape-box')
          this.addData(element)
          callback(element)
        }
      }
    })
  }

  /**
   * 添加图形
   * @param {} shapes
   */
  addData(element, status) {
    this.addDatas([element], status)
  }

  /**
   * 添加多个形状
   * @param {} elements
   */
  addDatas(elements, status) {
    if (typeof status === 'undefined') {
      status = true
    }
    const addShapes = []
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i]
      addShapes.push(element)
      this.elements[element.data.id] = element
    }
    this.build()
  }

  /**
   * 删除图形
   */
  removeData(selected, callback = () => {}) {
    if (!selected) {
      // TODO:
    }

    if (selected.length > 0) {
      let childrenShapes = []
      selected = selected.concat(childrenShapes)
      callback(selected)
    }
  }

  getElement(id) {
    if (id) {
      return this.elements[id]
    }
    return this.elements
  }

  getProcess() {
    let root = null
    if (this.definitions) {
      root = this.definitions.rootElements[0]
      delete root.flowElements
    }
    return root
  }

  /**
   * 设置组数据
   * @param {*} group
   * @param {*} shapeId
   */
  setShapeGroups(group, shapeId) {
    if (!this.groups[group]) {
      this.groups[group] = []
    }
    if (this.groups[group].indexOf(shapeId) < 0) {
      this.groups[group].push(shapeId)
    }
  }

  getShapeConnections(id) {
    return this.connections[id]
  }

  /**
   * 设置连线和图形关联数据
   * @param {*} id
   * @param {*} shapeId
   */
  setShapeConnections(id, shapeId) {
    if (!this.connections[id]) {
      this.connections[id] = []
    }
    if (this.connections[id].indexOf(shapeId) < 0) {
      this.connections[id].push(shapeId)
    }
  }

  /**
   * 更新形状
   * @param {} shape
   */
  update(element) {
    this.updateMulti([element])
  }

  /**
   * 更新多个形状定义
   * @param {} shapes
   */
  updateMulti(elements) {
    const updateElements = []
    const oriElements = []
    for (let i = 0; i < elements.length; i += 1) {
      const { data, plane, shape } = elements[i]
      if (shape.bpmnName !== 'SequenceFlow') {
        shape.textBlock = shape.getTextBlock()
      }
      if (this.elements[shape.id]) {
        this.elements[data.id] = cloneDeep(elements[i])
        oriElements.push(cloneDeep(this.getPersistenceById(data.id)))
        updateElements.push(cloneDeep(elements[i]))
      }
    }
    this.build()
  }

  /**
   * 更换图形
   * @param {} target
   * @param {} shapeName
   */
  change({ target, type }) {
    const name = eventBus.trigger('i18n', 'bpmn.' + type)
    const element = eventBus.trigger('element.create', {
      name,
      type,
      prefix: 'obj'
    })

    target.data.$type = element.data.$type
    target.data.extensionElements.values = element.data.extensionElements.values
    target.data.name = element.data.name
    target.plane.id = element.plane.id
    target.shape = element.shape
    target.shape.data = target.data
    target.shape.plane = target.plane

    eventBus.trigger('shape.render', { type, element: target })
  }

  /**
   * 删除全部图形
   */
  removeShapes() {
    eventBus.trigger('shape.select.remove')
    const elements = []
    for (let key in this.elements) {
      elements.push(this.elements[key])
    }
    eventBus.trigger('shape.remove', elements)
  }

  build() {
    this.orders = []
    this.connections = {}
    for (let id in this.elements) {
      const { data, plane, shape } = this.elements[id]
      this.orders.push({ id: data.id, zindex: shape.shapeStyle.zindex })
      if (shape.bpmnName === 'SequenceFlow') {
        if (data.sourceRef != null) {
          this.setShapeConnections(data.sourceRef, data.id)
        }
        if (data.targetRef != null) {
          this.setShapeConnections(data.targetRef, data.id)
        }
      }
      if (shape.group) {
        this.setShapeGroups(shape.group, data.id)
      }
    }

    this.orders.sort((item1, item2) => {
      return item1.zindex - item2.zindex
    })
    for (let i = 0; i < this.orders.length; i += 1) {
      const id = this.orders[i].id
      this.$container.find('.shape-box[data-id="' + id + '"]').css('z-index', i)
    }
    let index = 0
    if (this.orders.length > 0) {
      index = this.orders[this.orders.length - 1].zindex
    }
    this.maxZIndex = index
  }

  /**
   * 创建元素模型
   * @param {*} data
   */
  createAttrs(data, plane, shape) {
    const obj = {
      data: {},
      plane: {}
    }
    let id = data.id || 'obj_' + this.options.ids.next()
    if (data) {
      for (let key in data) {
        switch (key) {
          // 不处理
          case '$type':
          case 'flowElements':
          case 'sourceRef':
          case 'targetRef':
          case 'incoming':
          case 'outgoing':
            break
          // 扩展属性
          case 'extensionElements':
            obj.data.extensionElements = this.createExtensionModel(
              data[key].values || []
            )
            break
          default:
            obj.data[key] = data[key]
            break
        }
      }
    }
    if (plane) {
      for (let key in plane) {
        switch (key) {
          // 不处理
          case '$type':
            break
          // id与数据id对应
          case 'id':
            obj.plane[key] = id + '_di'
            break
          case 'waypoint':
            if (shape.bpmnName === 'SequenceFlow') {
              const start = plane[key][0]
              const end = plane[key][plane[key].length - 1]
              const waypoint = []
              // 插入起始点
              waypoint.push(
                this.createModel({
                  descriptor: 'dc:Point',
                  attrs: {
                    x: start.x,
                    y: start.y
                  }
                })
              )
              // 插入折点
              shape.points.forEach(point => {
                waypoint.push(
                  this.createModel({
                    descriptor: 'dc:Point',
                    attrs: {
                      x: point.x,
                      y: point.y
                    }
                  })
                )
              })
              // 插入结束点
              waypoint.push(
                this.createModel({
                  descriptor: 'dc:Point',
                  attrs: {
                    x: end.x,
                    y: end.y
                  }
                })
              )
              obj.plane[key] = waypoint
            }
            break
          case 'bounds':
            if (shape.bpmnName !== 'SequenceFlow') {
              const { height, width, x, y } = plane[key]
              obj.plane[key] = this.createModel({
                descriptor: 'dc:Bounds',
                attrs: {
                  height,
                  width,
                  x,
                  y
                }
              })
            }
            break
          default:
            obj.plane[key] = plane[key]
            break
        }
      }
    }
    return obj
  }

  /**
   * 创建数据
   * @param {*} callback
   */
  createElement({ type, prefix, name, pos }, callback = () => {}) {
    const id = prefix + '_' + this.options.ids.next()
    // 元素数据
    const data = cloneDeep(
      this.createModel({
        descriptor: 'bpmn:' + type,
        attrs: {
          name,
          id,
          extensionElements: this.createExtensionModel()
        }
      })
    )

    let plane = {}

    if (type === 'SequenceFlow') {
      // 连线绘图数据
      plane = cloneDeep(
        this.createModel({
          descriptor: 'bpmndi:BPMNEdge',
          attrs: {
            id: id + '_di',
            waypoint: []
          }
        })
      )
    } else {
      // 图形绘图数据
      plane = cloneDeep(
        this.createModel({
          descriptor: 'bpmndi:BPMNShape',
          attrs: {
            bounds: this.createModel({
              descriptor: 'dc:Bounds',
              attrs: {
                x: 0,
                y: 0
              }
            }),
            bpmnElement: id,
            id: id + '_di'
          }
        })
      )

      if (pos) {
        plane.bounds.x = restoreScale(pos.x) - plane.bounds.width
        plane.bounds.y = restoreScale(pos.y) - plane.bounds.height
      }
    }

    // 图形数据

    let element = {
      data,
      plane
    }

    element = eventBus.trigger('shape.create', {
      type,
      element
    })

    this.maxZIndex = element.shape.shapeStyle.zindex = this.maxZIndex + 1

    callback(element)

    return element
  }

  /**
   * 创建定义数据
   */
  createDefinition() {
    this.definitions.rootElements.forEach((root, index) => {
      const shapes = {}
      const flowElements = []
      const planeElement = []
      // 先生成图形
      for (let id in this.elements) {
        const { data, plane, shape } = this.elements[id]
        const type = shape.bpmnName
        if (type !== 'SequenceFlow') {
          const attrObj = this.createAttrs(data, plane, shape)
          attrObj.data.incoming = []
          attrObj.data.outgoing = []

          const modelData = this.createModel({
            descriptor: data.$type,
            attrs: attrObj.data
          })

          attrObj.plane.bpmnElement = modelData
          const modelPlane = this.createModel({
            descriptor: plane.$type,
            attrs: attrObj.plane
          })

          shapes[modelData.id] = modelData

          flowElements.push(modelData)
          planeElement.push(modelPlane)
        }
      }
      // 后生成连线
      for (let id in this.elements) {
        const { data, plane, shape } = this.elements[id]
        const type = shape.bpmnName
        if (type === 'SequenceFlow') {
          const attrObj = this.createAttrs(data, plane, shape)
          attrObj.data.sourceRef = shapes[data.sourceRef]
          attrObj.data.targetRef = shapes[data.targetRef]

          const modelData = this.createModel({
            descriptor: data.$type,
            attrs: attrObj.data
          })

          if (data.sourceRef) {
            shapes[data.sourceRef].outgoing.push(modelData)
          }
          if (data.targetRef) {
            shapes[data.targetRef].incoming.push(modelData)
          }

          attrObj.plane.bpmnElement = modelData
          const modelPlane = this.createModel({
            descriptor: plane.$type,
            attrs: attrObj.plane
          })

          flowElements.push(modelData)
          planeElement.push(modelPlane)
        }
      }

      this.definitions.diagrams[index].plane.planeElement = planeElement
      this.definitions.rootElements[index] = this.createModel({
        descriptor: root.$type,
        attrs: {
          id: root.id || this.options.ids.next(),
          extensionElements: this.createExtensionModel(
            root.extensionElements.values || []
          )
        }
      })
      this.definitions.rootElements[index].flowElements = flowElements
    })

    return this.definitions
  }

  setProcessModel() {
    const id = 'process_' + this.options.ids.next()
    const rootElements = [
      this.createModel({
        descriptor: 'bpmn:Process',
        attrs: {
          id,
          flowElements: [],
          extensionElements: this.createExtensionModel([])
        }
      })
    ]

    const diagrams = [
      this.createModel({
        descriptor: 'bpmndi:BPMNDiagram',
        attrs: {
          id: id + '_di',
          plane: this.createModel({
            descriptor: 'bpmndi:BPMNPlane',
            attrs: {
              id: id + '_pl',
              planeElement: []
            }
          })
        }
      })
    ]

    this.definitions.rootElements = rootElements
    this.definitions.diagrams = diagrams
  }

  /**
   * 创建模型数据
   * @param {*} data
   */
  createModel(data) {
    let bpmnModel = null
    eventBus.trigger('model.create', data, model => {
      bpmnModel = model
    })
    return bpmnModel
  }

  /**
   * 创建扩展属性模型
   * @param {*} values
   */
  createExtensionModel(values = []) {
    const extensions = []
    values.forEach(extension => {
      const descriptor = extension.$type || extension.name
      const attrs = Object.assign({}, cloneDeep(extension), extension.$attrs)
      delete attrs.$type
      delete attrs.name
      const extensionModel = this.createModel({
        descriptor,
        attrs
      })
      if (extensionModel) {
        extensions.push(extensionModel)
      }
    })

    return this.createModel({
      descriptor: 'bpmn:ExtensionElements',
      attrs: { values: extensions }
    })
  }
}

const instance = (options, $container, definitions) => {
  return new Designer(options, $container, definitions)
}

export default instance
