/**
 * 入口文件
 * @author ctank
 */
import './assets/styles/bpd-core.scss'

import eventBus from './core/eventBus'
import draw from './draw/draw'
import DrawUtils from './draw/drawUtils'

import $ from './utils/slimJQ'
import Ids from './utils/ids'
import { loadFont, setExportData, restoreScale } from './utils/utils'
import DomSize from './utils/domSize'

import BpmnXML from './features/xml'
import Background from './features/background'
import Clipboard from './features/clipboard'
import Direction from './features/direction'
import EditName from './features/edit-name'
import Record from './features/record'
import ShapeAnchor from './features/anchor'
import ShapeSelect from './features/select'
import ShapeDrag from './features/drag'
import Snapline from './features/snapline'
import Tooltip from './features/tooltip'
import Hand from './features/hand'
import GroupPanel from './features/group-panel'
import HotKey from './features/hotkey'
import I18n from './features/i18n'

// 流程图模板
const DEFAULT_DEFINITION =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
  'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
  'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
  'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
  'targetNamespace="http://bpmn.io/schema/bpmn"' +
  '></bpmn:definitions>'

const DEFAULT_DEFINITION1 =
  '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:do1="http://do1.com.cn/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="process_01"><bpmn:extensionElements><do1:cancelTask>false</do1:cancelTask><do1:cancelProcess>false</do1:cancelProcess><do1:clearHistoryWhenCancelProcess>false</do1:clearHistoryWhenCancelProcess><do1:cancelProcessExclusiveNode></do1:cancelProcessExclusiveNode><do1:defaultTitle>false</do1:defaultTitle><do1:title></do1:title><do1:relatedFormId></do1:relatedFormId><do1:description></do1:description></bpmn:extensionElements><bpmn:startEvent id="obj_01" name="开始事件" identify="obj_01"><bpmn:extensionElements /><bpmn:outgoing>obj_05</bpmn:outgoing></bpmn:startEvent><bpmn:userTask id="obj_02" name="人工任务"><bpmn:extensionElements><do1:description /><do1:showHistoricalRecord>false</do1:showHistoricalRecord><do1:operation>{"executeOperation":{"enabled":true,"buttonLabel":"提交"},"rejectOperation":{"enabled":true,"buttonLabel":"驳回"},"circularizeOperation":{"enabled":true,"buttonLabel":"抄送"},"agentOperation":{"enabled":true,"buttonLabel":"委托"},"terminateOperation":{"enabled":true,"buttonLabel":"终止"},"printOperation":{"enabled":false,"buttonLabel":"打印"},"signatureOperation":{"enabled":true,"buttonLabel":"加签"}}</do1:operation><do1:multiInstanceControl>{"method":"or","enabled":false,"taskCompletionRate":"100"}</do1:multiInstanceControl><do1:defaultCarbonCopy receiverType="">{"enabled":false,"triggerTime": "ACTIVITY_ARRIVE","receiverConfig": {}}</do1:defaultCarbonCopy><do1:condition type="initiatorRelateUsers">{"initiatorRelate":"0","findUpperSuperiorWhenMissSuperior":false}</do1:condition><do1:notification>{"channelList":["wbg","portal"]}</do1:notification><do1:formEditPermissions>{"formId":"","web":[],"mobile":[]}</do1:formEditPermissions><do1:actionWithoutHandler>{"transferMode":"enterNextNode"}</do1:actionWithoutHandler><do1:timeoutReminder>{"schedulerDefinitionId":"","enable":false}</do1:timeoutReminder><do1:timeoutHandler>{"schedulerDefinitionId":"","enable":false}</do1:timeoutHandler></bpmn:extensionElements><bpmn:incoming>obj_05</bpmn:incoming><bpmn:outgoing>obj_06</bpmn:outgoing></bpmn:userTask><bpmn:userTask id="obj_03" name="人工任务"><bpmn:extensionElements><do1:description /><do1:showHistoricalRecord>false</do1:showHistoricalRecord><do1:operation>{"executeOperation":{"enabled":true,"buttonLabel":"办理"},"rejectOperation":{"enabled":true,"buttonLabel":"驳回"},"circularizeOperation":{"enabled":true,"buttonLabel":"抄送"},"agentOperation":{"enabled":true,"buttonLabel":"委托"},"terminateOperation":{"enabled":true,"buttonLabel":"终止"},"printOperation":{"enabled":false,"buttonLabel":"打印"},"signatureOperation":{"enabled":true,"buttonLabel":"加签"}}</do1:operation><do1:multiInstanceControl>{"method":"or","enabled":false,"taskCompletionRate":"100"}</do1:multiInstanceControl><do1:defaultCarbonCopy receiverType="">{"enabled":false,"triggerTime": "ACTIVITY_ARRIVE","receiverConfig": {}}</do1:defaultCarbonCopy><do1:condition type="designatedUser">{"designatedUser":"true"}</do1:condition><do1:notification>{"channelList":["wbg","portal"]}</do1:notification><do1:formEditPermissions>{"formId":"","web":[],"mobile":[]}</do1:formEditPermissions><do1:actionWithoutHandler>{"transferMode":"enterNextNode"}</do1:actionWithoutHandler><do1:timeoutReminder>{"schedulerDefinitionId":"","enable":false}</do1:timeoutReminder><do1:timeoutHandler>{"schedulerDefinitionId":"","enable":false}</do1:timeoutHandler></bpmn:extensionElements><bpmn:incoming>obj_06</bpmn:incoming><bpmn:outgoing>obj_07</bpmn:outgoing></bpmn:userTask><bpmn:endEvent id="obj_04" name="结束事件" identify="obj_04"><bpmn:extensionElements /><bpmn:incoming>obj_07</bpmn:incoming></bpmn:endEvent><bpmn:sequenceFlow id="obj_05" name="" sourceRef="obj_01" targetRef="obj_02"><bpmn:extensionElements /></bpmn:sequenceFlow><bpmn:sequenceFlow id="obj_06" name="" sourceRef="obj_02" targetRef="obj_03"><bpmn:extensionElements /></bpmn:sequenceFlow><bpmn:sequenceFlow id="obj_07" name="" sourceRef="obj_03" targetRef="obj_04"><bpmn:extensionElements /></bpmn:sequenceFlow></bpmn:process><bpmndi:BPMNDiagram id="process_01_di"><bpmndi:BPMNPlane id="process_01_pl"><bpmndi:BPMNShape id="obj_01_di" bpmnElement="obj_01"><dc:Bounds x="2500" y="300" width="40" height="40" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="obj_02_di" bpmnElement="obj_02"><dc:Bounds x="2465" y="408" width="110" height="55" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="obj_03_di" bpmnElement="obj_03"><dc:Bounds x="2465" y="534" width="110" height="55" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="obj_04_di" bpmnElement="obj_04"><dc:Bounds x="2500" y="666" width="40" height="40" /></bpmndi:BPMNShape><bpmndi:BPMNEdge id="obj_05_di" bpmnElement="obj_05"><di:waypoint x="2520" y="340" /><di:waypoint x="2520" y="374" /><di:waypoint x="2520" y="374" /><di:waypoint x="2520" y="408" /></bpmndi:BPMNEdge><bpmndi:BPMNEdge id="obj_06_di" bpmnElement="obj_06"><di:waypoint x="2520" y="463" /><di:waypoint x="2520" y="498.5" /><di:waypoint x="2520" y="498.5" /><di:waypoint x="2520" y="534" /></bpmndi:BPMNEdge><bpmndi:BPMNEdge id="obj_07_di" bpmnElement="obj_07"><di:waypoint x="2520" y="589" /><di:waypoint x="2520" y="627.5" /><di:waypoint x="2520" y="627.5" /><di:waypoint x="2520" y="666" /></bpmndi:BPMNEdge></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>'


// 默认属性
const DEFAULT_OPTIONS = {
  ids: new Ids([32, 36, 1]),
  // 容器
  container: '',
  // 宽
  width: '100%',
  // 高
  height: '100%',
  // 比例
  scale: 1,
  // 只读
  readonly: false,
  // 页面样式
  pageStyle: {
    // 背景色
    backgroundColor: '255,255,255',
    // 高度
    height: 5000,
    // 宽度
    width: 5000
  },
  //
  // local: 'zh_TW',
  // 功能配置
  config: {},
  // bpmn样式
  bpmnStyle: {},
  // 图形样式
  shapeStyle: [],
  // 流程图定义
  definition: DEFAULT_DEFINITION || '',
  // 扩展属性
  extensions: {},
  // 过滤
  filter: [],
  // 支持节点
  bpmns: [
    'StartEvent',
    'UserTask',
    'ServiceTask',
    'ReceiveTask',
    'CallActivity',
    'ExclusiveGateway',
    'InclusiveGateway',
    'ParallelGateway',
    'ComplexGateway',
    'EndEvent',
    'TerminateEndEvent'
  ]
}

let IS_FONTLOAD = false

/**
 * 创建容器
 * @param {*} options
 */
const createContainer = options => {
  const container = $(options.container)
  if (!options.container || container.length <= 0) {
    throw new Error('Can not find container: ' + options.container)
  }
  const designerBox = $(
    '<div class="bpd-container"><div class="bpd-layout"><div class="bpd-designer"></div></div></div>'
  )
  designerBox.css({
    width: options.width,
    height: options.height
  })

  container.append(designerBox)
  return designerBox
}

/**
 * 初始化功能
 * @param {*} $container
 * @param {*} options
 */
const initFeatures = ($container, options) => {
  // 快捷键
  const hotKey = new HotKey()
  // 国际化
  const i18n = new I18n(options.local)
  // xml
  const bpmnXML = new BpmnXML(options.extensions)
  // 背景
  const background = new Background(
    $container,
    options,
    options.config.background
  )
  // 手
  const hand = new Hand($container, options.pageStyle)
  // 非只读状态时
  if (!options.readonly) {
    // 锚点
    const shapeAnchor = new ShapeAnchor($container, options.config.anchor)
    // 对齐
    const snapline = new Snapline($container, options.config.snapline)
    // 流向
    const direction = new Direction($container, options.config.direction)
    // 选择
    const shapeSelect = new ShapeSelect($container, options.config.select)
    // 记录
    const record = new Record()
    // 剪贴板
    const clipboard = new Clipboard(options, options.config.clipboard)
    // 编辑名称
    const editName = new EditName($container, options.config.editName)
    // 提示
    const tooltip = new Tooltip($container, options.config.tooltip)
    // 拖动
    const shapeDrag = new ShapeDrag(options, $container)
    // 组面板
    const groupPanel = new GroupPanel($container, options)
  }
}

class BPDCore {
  constructor(options = {}, callback = () => { }) {
    this.version = '1.1.0-beta.5'
    // 配置
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    // 容器
    this.$container = createContainer(this.options)
    // 初始化功能
    initFeatures(this.$container, this.options)
    // 绘图
    this.draw = draw(this.options, this.$container)
    // 检查字体载入
    loadFont('bpmn', () => {
      IS_FONTLOAD = true
    })

    this.init(callback)
  }

  init(callback) {
    this.importBpmn(this.options.definition, () => {
      this.resizeContainer()
      callback()
    })

    DomSize.bind(this.$container[0], () => {
      this.resizeContainer()
    })
  }

  resizeContainer() {
    const { $container, options } = this
    const { width, height } = options.pageStyle

    const containerWidth = $container.width()
    const containerHeight = $container.height()
    const defaultPos = {
      top: (options.pageStyle.height - containerHeight) / 2,
      left: (options.pageStyle.width - containerWidth) / 2
    }

    const elements = this.getAllElement()
    // 设置存在图形时的画布位置
    if (elements.length > 0) {
      const scrollPos = {
        top: this.$container.scrollTop(),
        left: this.$container.scrollLeft()
      }

      const range = {
        x: restoreScale(0),
        y: restoreScale(0),
        width: restoreScale(width),
        height: restoreScale(height)
      }
      const ids = DrawUtils.getElementIdsByRange(range)
      const shapeBox = DrawUtils.getElementsBox(ids)
      const screenBox = {
        x: Math.abs(scrollPos.left),
        y: Math.abs(scrollPos.top),
        width: $container.width(),
        height: $container.height()
      }

      if (
        shapeBox &&
        !DrawUtils.checkRang(screenBox, {
          x: shapeBox.x - shapeBox.width / 2,
          y: shapeBox.y - shapeBox.height / 2
        })
      ) {
        let top = shapeBox.y - screenBox.height / 2 + shapeBox.height / 2
        let left = shapeBox.x - screenBox.width / 2 + shapeBox.width / 2

        this.$container.scrollTop(top)
        this.$container.scrollLeft(left)
      }
    } else {
      this.$container.scrollTop(defaultPos.top)
      this.$container.scrollLeft(defaultPos.left)
    }
  }

  /**
   * 创建图形
   * @param {Event} event
   */
  createShape(event, callback = () => { }) {
    const target = $(event.target)
    if (target.hasClass('readonly') || this.options.readonly) {
      return
    }
    const shapeName = target.attr('shapeName')
    if (!shapeName || shapeName === '') {
      throw new Error('shapeName error')
    }
    this.draw.createShape(shapeName, callback)
  }

  /**
   * 获取全部元素
   */
  getAllElement() {
    const elements = []
    const elementObj = eventBus.trigger('element.get')
    for (let id in elementObj) {
      const element = setExportData(elementObj[id])
      elements.push(element)
    }
    return elements
  }

  /**
   * 获取根元素
   */
  getRootElement() {
    let root = eventBus.trigger('process.get')
    if (root) {
      return setExportData(root)
    }
    return null
  }

  /**
   * 获取当前选中元素
   */
  getCurrentElements() {
    const currentElements = eventBus.trigger('shape.select.get')
    for (let i = 0; i < currentElements.length; i += 1) {
      currentElements[i] = setExportData(currentElements[i])
    }
    return currentElements
  }

  /**
   * 根据类型获取选中元素之前的元素
   * @param {Object} element
   * @param {String} bpmn
   */
  getFrontElementsByBpmn(element, bpmn) {
    return this.getFrontElements(
      eventBus.trigger('element.get', element.id)
    ).filter(element => element.bpmnName === bpmn)
  }

  /**
   * 获取选中元素之前的元素
   * @param {Object} element
   * @return {Object} 选中元素前一个节点元素
   */
  getFrontElement(element) {
    if (!element) {
      throw new Error('select element error')
    }
    let frontElement = null
    const frontElements = this.getFrontElements(
      eventBus.trigger('element.get', element.id)
    )
    frontElements.forEach(ele => {
      if (!frontElement && ele.bpmnName !== 'SequenceFlow') {
        frontElement = ele
      }
    })
    return frontElement
  }

  /**
   * 获取选中元素之前的全部元素
   * @param {Object} element
   */
  getFrontElements(element) {
    if (!element) {
      throw new Error('select element error')
    }
    const getFront = (elements, fronts = [], isStart = false) => {
      const elems = []
      if (!isStart) {
        elements.forEach(ele => {
          if (ele.shape.bpmnName === 'SequenceFlow') {
            if (ele.data.sourceRef && ele.sourceRef !== '') {
              const element =
                eventBus.trigger('element.get', ele.data.sourceRef) || []
              let hasElement = false
              fronts.forEach(ele => {
                if (ele.data.id === element.data.id) {
                  hasElement = true
                }
              })
              if (!hasElement) {
                elems.push(element)
                fronts.push(element)
              }
            }
          } else {
            const linkerIds =
              eventBus.trigger('connections.get', ele.data.id) || []
            linkerIds.forEach(id => {
              const linker = eventBus.trigger('element.get', id)
              if (linker.data.targetRef === ele.data.id) {
                let hasElement = false
                fronts.forEach(ele => {
                  if (ele.data.id === linker.data.id) {
                    hasElement = true
                  }
                })
                if (!hasElement) {
                  elems.push(linker)
                  fronts.push(linker)
                }
              }
            })
          }
        })

        if (elems.length <= 0) {
          return getFront(elems, fronts, true)
        } else {
          return getFront(elems, fronts)
        }
      } else {
        return fronts
      }
    }
    const frontElements = getFront([element])

    for (let i = 0; i < frontElements.length; i += 1) {
      frontElements[i] = setExportData(frontElements[i])
    }
    return frontElements
  }

  /**
   * 触发剪贴板事件
   * @param {*} type 事件类型
   */
  handleClipboardEvent(type) {
    if (type !== 'copy' && type !== 'paste') {
      console.log('剪贴板事件类型错误')
    } else {
      eventBus.trigger(`clipboard.${type}`)
    }
  }

  /**
   * 更新元素属性
   * @param {String} id
   * @param {Object} data
   */
  updateProperties(id, data, callback = () => { }) {
    data.extensions.forEach(dataExtension => {
      dataExtension.$type = dataExtension.name
      delete dataExtension.name
    })

    const element = eventBus.trigger('element.get', id)

    if (!element) {
      return
    }

    const original = Object.assign({}, data.original)
    for (let key in original) {
      element.data[key] = original[key]
    }

    const { extensionElements } = element.data
    const extensions = []
    if (!extensionElements.values) {
      extensionElements.values = []
    }
    extensionElements.values.forEach(shapeExtension => {
      let hasExtension = false
      data.extensions.forEach(dataExtension => {
        if (dataExtension.$type === shapeExtension.$type) {
          hasExtension = true
        }
      })
      if (!hasExtension) {
        extensions.push(shapeExtension)
      }
    })

    extensionElements.values = [...extensions, ...data.extensions]

    if (element.shape.bpmnName === 'SequenceFlow') {
    } else {
      eventBus.trigger('shape.render', {
        type: element.shape.bpmnName,
        element
      })
    }

    callback()
  }

  /**
   * 更新流程属性,目前仅支持标题和扩展属性
   * @param {Object} data
   */
  updateProcessProperties(data, callback = () => { }) {
    data.extensions.forEach(dataExtension => {
      dataExtension.$type = dataExtension.name
      delete dataExtension.name
    })

    const process = eventBus.trigger('process.get')

    if (!process) {
      return
    }

    const original = Object.assign({}, data.original)
    for (let key in original) {
      process[key] = original[key]
    }

    const extensions = []
    if (!process.extensionElements.values) {
      process.extensionElements.values = []
    }
    process.extensionElements.values.forEach(shapeExtension => {
      let hasExtension = false
      data.extensions.forEach(dataExtension => {
        if (dataExtension.$type === shapeExtension.$type) {
          hasExtension = true
        }
      })
      if (!hasExtension) {
        extensions.push(shapeExtension)
      }
    })

    process.extensionElements.values = [...extensions, ...data.extensions]

    callback()
  }

  updataLineStyle(id, style) {
    this.draw.updataLineStyle(id, style)
  }

  destroy() {
    DomSize.remove(this.$container[0])
    this.$container.remove()
    this.draw.cancel()
    eventBus.trigger('key.clear')
    eventBus.destroy()
  }

  /**
   * 激活手模式
   */
  activateHand() {
    eventBus.trigger('hand.activate')
    this.draw.resetState()
  }

  /**
   * 激活选择模式
   */
  activateSelect() {
    if (!this.options.readonly) {
      eventBus.trigger('hand.destroy')
      eventBus.trigger('shape.multiSelect', {
        state: this.draw.state
      })
      this.draw.changeState('multiSelect')
    }
  }

  /**
   * 导入Bpmn
   */
  importBpmn(xmlStr, callback = () => { }) {
    const self = this
    let fontLoadCheck = setInterval(() => {
      if (IS_FONTLOAD) {
        clearInterval(fontLoadCheck)
        eventBus.trigger('record.initStatus', false)
        eventBus.trigger('model.import', xmlStr, (err, definitions) => {
          if (err) {
            console.log(err)
          } else {
            eventBus.trigger('record.start')
            self.draw.render(definitions)
            eventBus.trigger('record.end')
            eventBus.trigger('record.initStatus', true)
            // 执行回调
            callback()
          }
        })
      }
    }, 1000)
  }
  /**
   * 导出Bpmn
   */
  exportBpmn(callback = () => { }) {
    const definitions = this.draw.designer.createDefinition()
    eventBus.trigger('model.export', definitions, (err, xmlStrUpdated) => {
      if (err) {
        console.log(err, xmlStrUpdated)
      }
      callback(xmlStrUpdated)
    })
  }
}

export default BPDCore

window.BPDCore = BPDCore
