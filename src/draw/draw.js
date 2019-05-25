import eventBus from '../core/eventBus'
import designer from '../core/designer'

import Operation from './operation'

import DrawShape from './drawShape'
import DrawConnection from './drawConnection'
import DrawUtils from './drawUtils'

import {
  cloneDeep,
  restoreScale,
  getBpmnNameByType,
  convertFirstLetter,
  setExportExtensions
} from '../utils/utils'
import $ from '../utils/slimJQ'

class Draw extends Operation {
  constructor(options, $container) {
    super()

    this.options = options

    this.$container = $container
    // 流程定义对象
    this.definitions = null

    // 设计器
    this.designer = designer(this.options, this.$container, this.definitions)

    this.drawShape = new DrawShape(this.options, this.$container)

    this.drawConnection = new DrawConnection(this.options, this.$container)
    this.init()
  }
  init() {
    this.$container
      .off('mousemove.operate')
      .on('mousemove.operate', this.move.bind(this))

    // 创建图形
    eventBus.on('shape.create', this.createShapeData.bind(this))
    // 渲染图形
    eventBus.on('shape.render', this.renderShape.bind(this))
    // 渲染路径
    eventBus.on('shape.renderPath', this.renderShapePath.bind(this))
    // 删除图形
    eventBus.on('shape.remove', this.removeShape.bind(this))
    // 渲染连线
    eventBus.on('connection.render', this.renderConnection.bind(this))
    // 渲染连线
    eventBus.on('connection.move', this.moveConnection.bind(this))
    // 删除事件
    eventBus.trigger('key.bind', {
      key: 'Delete',
      fun: () => {
        eventBus.trigger('shape.remove')
      }
    })
    eventBus.trigger('key.bind', {
      key: 'BackSpace',
      fun: () => {
        eventBus.trigger('shape.remove')
      }
    })
  }
  /**
   * 创建图形数据
   */
  createShapeData({ type, element }) {
    if (type === 'SequenceFlow') {
      element.shape = this.drawConnection.createConnection(element)
    } else {
      element.shape = this.drawShape.createShape(type, element)
    }
    return element
  }
  /**
   * 渲染
   * @param {*} definitions
   */
  render(definitions) {
    if (definitions === '') {
      console.log('流程定义为空', 'error')
      return
    }

    this.designer.removeShapes()

    this.designer.definitions = this.definitions = definitions
    const { diagrams, rootElements } = this.definitions
    const elements = {}

    if (!rootElements) {
      this.designer.setProcessModel()
    } else {
      rootElements.forEach((root, index) => {
        if (root.flowElements) {
          root.flowElements.forEach((element, elementIndex) => {
            const planeElement = diagrams[index].plane.planeElement
            if (planeElement && planeElement.length > 0) {
              planeElement.forEach((plane, planeIndex) => {
                if (plane.id === element.id + '_di') {
                  const data = cloneDeep(element)
                  if (element.extensionElements) {
                    data.extensionElements.values =
                      element.extensionElements.values || []
                  }
                  const type = getBpmnNameByType(element.$type)
                  if (type !== 'SequenceFlow') {
                    data.incoming = element.incoming ? element.incoming.id : ''
                    data.outgoing = element.outgoing ? element.outgoing.id : ''
                  } else {
                    data.sourceRef = element.sourceRef
                      ? element.sourceRef.id
                      : ''
                    data.targetRef = element.targetRef
                      ? element.targetRef.id
                      : ''
                  }
                  elements[element.id] = {
                    data,
                    plane: cloneDeep(plane)
                  }
                }
              })
            }
          })
        }
      })
    }

    // 渲染页面
    this.renderPage()

    let shapeCount = 0

    // 渲染图形
    for (let id in elements) {
      const element = elements[id]
      const type = getBpmnNameByType(element.data.$type)
      if (type !== 'SequenceFlow') {
        this.renderShape({ type, element })
        this.designer.addData(element, false)
      }
      shapeCount++
    }

    // 渲染连线
    for (let id in elements) {
      const element = elements[id]
      const type = getBpmnNameByType(element.data.$type)
      if (type === 'SequenceFlow') {
        this.renderConnection({ element })
        this.designer.addData(element, false)
      }
    }

    if (shapeCount === 0) {
      this.designer.build()
    }

    const { $container, options } = this
    const { width, height } = options.pageStyle

    const $layout = $container.find('.bpd-layout')
    const layoutPos = $layout.offset()

    const range = {
      x: restoreScale(0),
      y: restoreScale(0),
      width: restoreScale(width),
      height: restoreScale(height)
    }
    const ids = DrawUtils.getElementIdsByRange(range)
    const box = DrawUtils.getElementsBox(ids)

    let top = layoutPos.top
    if (box.y < -height / 2) {
      top = box.y
    } else if (box.y > 0) {
      top = 0
    }

    let left = layoutPos.left
    if (box.x < -width / 2) {
      left = box.x
    } else if (box.x > 0) {
      left = 0
    }

    $layout.css({ top, left })
  }
  /**
   * 渲染页面
   */
  renderPage() {
    const { pageStyle } = this.options
    const pageWidth = pageStyle.width
    const pageHeight = pageStyle.height
    const pageBackGroundColor = pageStyle.backgroundColor
    const darkerBGColor = DrawUtils.getDarkerColor(pageBackGroundColor)
    const darkestBGColor = DrawUtils.getDarkestColor(pageBackGroundColor)
    this.$container.find('.bpd-designer').css({
      'background-color': 'rgb(' + darkerBGColor + ')'
    })
    this.$container.find('.bpd-layout').css({
      width: pageWidth,
      height: pageHeight
    })
  }

  /**
   * 渲染图形
   * @param {*} type
   * @param {*} element
   */
  renderShape({ type, element }) {
    this.drawShape.render(type, element)
  }

  /**
   * 渲染路径
   * @param {*} data
   */
  renderShapePath({ shape2D, element, render }) {
    this.drawShape.renderShapePath(shape2D, element, render)
  }

  /**
   * 渲染连线
   * @param {*} type
   * @param {*} shapeData
   */
  renderConnection({ element, rendered }) {
    this.drawConnection.render(element, rendered)
  }

  moveConnection({ element, type, x, y }) {
    this.drawConnection.move(element, type, x, y)
  }

  updataLineStyle(id, style) {
    if (id) {
      const element = eventBus.trigger('element.get', id)
      if (element.shape.bpmnName === 'SequenceFlow') {
      } else {
        element.shape.lightStyle = { lineStyle: style }
        console.log(element)
        this.drawShape.renderShape(element)
      }
    } else {
      const elements = eventBus.trigger('element.get')
      for (let id in elements) {
        const element = elements[id]
        if (element.shape.bpmnName === 'SequenceFlow') {
        } else {
          element.shape.lightStyle = {}
          this.drawShape.renderShape(element)
        }
      }
    }
  }

  /**
   * 删除图形
   * @param {} shapes
   */
  removeShape(elements, isRemove) {
    if (!elements) {
      elements = eventBus.trigger('shape.select.get')
    }

    if (typeof isRemove === 'undefined') {
      isRemove = true
    }
    if (isRemove) {
      elements = this.beforeRemove(elements)
    }

    const newShapes = []
    const changedIds = []
    const parentShapes = []
    const range = []
    const connections = []

    if (elements.length === 0) {
      return false
    }

    elements.forEach(element => {
      if (element.shape.bpmnName === 'SequenceFlow') {
        connections.push(element.data.id)
      } else {
        range.push(element.data.id)
      }
    })

    elements.forEach(element => {
      newShapes.push(cloneDeep(element))

      const { data, shape } = element

      this.$container.find('.shape-box[data-id="' + data.id + '"]').remove()

      delete this.designer.elements[data.id]

      if (shape.bpmnName === 'SequenceFlow') {
        if (data.sourceRef != null) {
          //
        }
        if (data.targetRef != null) {
          //
        }
      } else {
        if (shape.parent && range.indexOf(shape.parent) < 0) {
          //
        }

        const connectionIds = this.designer.connections[data.id]
        if (connectionIds && connectionIds.length > 0) {
          for (let i = 0; i < connectionIds.length; i++) {
            const connection = connectionIds[i]
            if (connections.indexOf(connection) < 0) {
              const connectionElement = eventBus.trigger(
                'element.get',
                connection
              )
              if (
                connectionElement.data.sourceRef != null &&
                connectionElement.data.sourceRef === data.id
              ) {
                connectionElement.data.sourceRef = null
              }
              if (
                connectionElement.data.targetRef != null &&
                connectionElement.data.targetRef === data.id
              ) {
                connectionElement.data.targetRef = null
              }
            }
          }
        }

        delete this.designer.connections[data.id]
      }
    })

    this.designer.build()

    eventBus.trigger('shape.select.remove')

    return true
  }

  /**
   * 创建图形数据
   */
  createShape(type, callback = () => {}) {
    let element = null
    eventBus.trigger('data.create', type, data => {
      element = data
      callback(element)
    })
  }

  /**
   * 删除前事件
   */
  beforeRemove(elements) {
    const temp = {}
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i]
      temp[element.data.id] = element
    }
    elements = []
    for (let id in temp) {
      elements.push(temp[id])
    }
    return elements
  }

  /**
   * 删除后事件
   */
  removed(event) {}
}

const instance = (options, $container) => {
  return new Draw(options, $container)
}

export default instance
