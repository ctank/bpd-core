import eventBus from './eventBus'
import DrawUtils from '../draw/drawUtils'

import $ from '../utils/slimJQ'
import {
  cloneElement,
  convertFirstLetter,
  setScale,
  restoreScale,
  getBpmnNameByType,
  isArray
} from '../utils/utils'

import { cloneJSON } from '../utils/clone'

const getShapeTarget = type => {
  const target = {}
  switch (type) {
    case 'ConditionalStartEvent':
      target.type = 'StartEvent'
      target.eventDefinitionType = 'ConditionalEventDefinition'
      break
    case 'MessageStartEvent':
      target.type = 'StartEvent'
      target.eventDefinitionType = 'MessageEventDefinition'
      break
    case 'SignalStartEvent':
      target.type = 'StartEvent'
      target.eventDefinitionType = 'SignalEventDefinition'
      break
    case 'TimerStartEvent':
      target.type = 'StartEvent'
      target.eventDefinitionType = 'TimerEventDefinition'
      break
    default:
      target.type = type
      break
  }
  return target
}

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
    // 原始图形集合
    this.oriElements = {}
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
    eventBus.on('element.build', this.build.bind(this))
    //
    eventBus.on('process.get', this.getProcess.bind(this))
    //
    eventBus.on('connections.get', this.getShapeConnections.bind(this))
    //
    eventBus.on('orders.get', () => {
      return this.orders
    })
  }

  createData({ type, config }, callback = () => { }) {
    // const self = this

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
        const shapeTarget = getShapeTarget(
          convertFirstLetter(type, 'uppercase')
        )
        // 创建数据
        element = eventBus.trigger('element.create', {
          name: null,
          prefix: 'obj',
          pos: canvasPos,
          extensions: config.extensions || [],
          ...shapeTarget
        })

        bounds = element.plane.bounds

        bounds.x = restoreScale(canvasPos.x) - bounds.width / 2
        bounds.y = restoreScale(canvasPos.y) - bounds.height / 2

        keys = Object.keys(this.elements)

        // 渲染图形
        eventBus.trigger('shape.render', { type: shapeTarget.type, element })
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
          // 开始记录
          eventBus.trigger('record.start')
          $shape.attr('class', 'shape-box')
          this.addData(element)
          callback(element)
          // 结束记录
          eventBus.trigger('record.end')
        }
      }
    })
  }

  /**
   * 添加图形
   * @param {} shapes
   */
  addData(element, status) {
    if (element) {
      if (isArray(element)) {
        this.addDatas(element, status)
      } else {
        this.addDatas([element], status)
      }
    }
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
      // 新数据
      this.elements[element.data.id] = cloneElement(element)
      // 原始数据
      this.oriElements[element.data.id] = cloneElement(element)
    }
    this.build()
    // 添加记录
    eventBus.trigger('record.push', {
      action: 'create',
      content: addShapes
    })
  }

  /**
   * 删除图形
   */
  // removeData(selected, callback = () => {}) {
  //   if (!selected) {
  //     // TODO:
  //   }

  //   if (selected.length > 0) {
  //     let childrenShapes = []
  //     selected = selected.concat(childrenShapes)
  //     callback(selected)
  //   }
  // }

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
    if (element) {
      if (isArray(element)) {
        this.updateMulti(element)
      } else {
        this.updateMulti([element])
      }
    }
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
      // if (shape.bpmnName !== 'SequenceFlow') {
      //   shape.textBlock = shape.getTextBlock()
      // }
      if (this.elements[data.id]) {
        this.elements[data.id] = cloneElement(elements[i])
        // 添加更新前的数据
        oriElements.push(cloneElement(this.oriElements[data.id]))
        // 添加更新后的数据
        updateElements.push(cloneElement(elements[i]))
        // 更新原始数据
        this.oriElements[data.id] = cloneElement(elements[i])
      }
    }
    this.build()
    // 添加记录
    eventBus.trigger('record.push', {
      action: 'update',
      content: {
        elements: oriElements,
        updates: updateElements
      }
    })
  }

  /**
   * 更换图形
   * @param {} target
   * @param {} shapeName
   */
  change({ target, type }) {
    const id = target.data.id
    const name = eventBus.trigger('i18n', 'bpmn.' + type)
    const element = eventBus.trigger('element.create', {
      name,
      type,
      prefix: 'obj',
      id
    })

    target.data = element.data
    target.data.name = element.data.name
    target.shape = element.shape
    target.shape.data = target.data
    target.shape.plane = target.plane

    this.elements[id] = target
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
    eventBus.trigger('shape.remove', { elements })
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
      const { id, zindex } = this.orders[i]
      this.$container.find('.shape-box[data-id="' + id + '"]').css('z-index', zindex)
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
          case '$instanceOf':
          case '$type':
          case 'flowElements':
          case 'sourceRef':
          case 'targetRef':
          case 'incoming':
          case 'outgoing':
            break
          // 事件定义
          case 'eventDefinitions':
            obj.data.eventDefinitions = this.createEventModel(data[key] || [])
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
          case '$instanceOf':
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
  createElement(
    { type, eventDefinitionType, prefix, name, pos, id, extensions },
    callback = () => { }
  ) {
    const elementId = id || prefix + '_' + this.options.ids.next()
    // 元素数据
    const data = cloneJSON(
      this.createModel({
        descriptor: 'bpmn:' + type,
        attrs: {
          name,
          id: elementId,
          eventDefinitions: this.createEventModel(eventDefinitionType),
          extensionElements: this.createExtensionModel(extensions)
        }
      })
    )

    let plane = {}

    if (type === 'SequenceFlow') {
      // 连线绘图数据
      plane = cloneJSON(
        this.createModel({
          descriptor: 'bpmndi:BPMNEdge',
          attrs: {
            id: elementId + '_di',
            waypoint: []
          }
        })
      )
    } else {
      // 图形绘图数据
      plane = cloneJSON(
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
            bpmnElement: elementId,
            id: elementId + '_di'
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
      const modelMap = {}
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

          modelMap[modelData.id] = {
            modelData,
            modelPlane
          }
        }
      }
      // 后生成连线
      for (let id in this.elements) {
        const { data, plane, shape } = this.elements[id]
        const type = shape.bpmnName
        if (type === 'SequenceFlow') {
          const attrObj = this.createAttrs(data, plane, shape)

          if (data.sourceRef) {
            attrObj.data.sourceRef = modelMap[data.sourceRef].modelData
          }
          if (data.targetRef) {
            attrObj.data.targetRef = modelMap[data.targetRef].modelData
          }
          const modelData = this.createModel({
            descriptor: data.$type,
            attrs: attrObj.data
          })

          if (data.sourceRef) {
            modelMap[data.sourceRef].modelData.outgoing.push(modelData)
          }
          if (data.targetRef) {
            modelMap[data.targetRef].modelData.incoming.push(modelData)
          }

          attrObj.plane.bpmnElement = modelData
          const modelPlane = this.createModel({
            descriptor: plane.$type,
            attrs: attrObj.plane
          })

          modelMap[modelData.id] = {
            modelData,
            modelPlane
          }
        }
      }

      const flowElements = []
      const planeElement = []

      for (let id in this.elements) {
        const { modelData, modelPlane } = modelMap[id]
        flowElements.push(modelData)
        planeElement.push(modelPlane)
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
      const attrs = Object.assign({}, cloneJSON(extension), extension.$attrs)
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

  /**
   * 创建事件集合
   * @param {*} data
   */
  createEventModel(data) {
    const eventDefinitions = []
    if (data) {
      if (typeof data === 'string') {
        eventDefinitions.push(
          this.createModel({
            descriptor: 'bpmn:' + data,
            attrs: {}
          })
        )
      } else {
        data.forEach(item => {
          const descriptor = item.$type || item.name
          const attrs = Object.assign({}, cloneJSON(item), item.$attrs)
          delete attrs.$type
          delete attrs.name
          const definition = this.createModel({
            descriptor,
            attrs
          })
          if (definition) {
            eventDefinitions.push(definition)
          }
        })
      }
    }
    return eventDefinitions
  }
}

const instance = (options, $container, definitions) => {
  return new Designer(options, $container, definitions)
}

export default instance
