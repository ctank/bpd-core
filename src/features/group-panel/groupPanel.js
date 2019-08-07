import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import DrawUtils from '../../draw/drawUtils'
import {
  setScale,
  restoreScale,
  checkBpmnShape,
  cloneDeep
} from '../../utils/utils'

const DEFAULT_CONFIG = {
  width: 30,
  height: 30
}

const ELEMENT_TEMP = {
  data: {},
  plane: {
    bounds: {}
  }
}

class groupPanel {
  constructor($container, options) {
    this.$container = $container

    this.bpmns = options.bpmns

    this.bpmnStyle = options.bpmnStyle

    this.filter = options.filter

    this.config = Object.assign({}, DEFAULT_CONFIG, options.config.grouppanel)

    this.init()
  }
  init() {
    // 选中
    eventBus.on('group.show', this.showGroup.bind(this))
    // 选中
    eventBus.on('group.hide', this.hideGroup.bind(this))
    // 选中
    eventBus.on('group.connection.show', this.showConnectionGroup.bind(this))
  }
  showGroup(elements) {
    if (elements.length === 1) {
      const { $container, bpmns, filter } = this
      const $designer = $container.find('.bpd-designer')
      const $selectBox = $designer.find('.shape-select')
      const { data, plane, shape } = elements[0]

      const self = this

      if ($selectBox.length > 0) {
        let $group = $selectBox.find('.group-icon')
        if ($group.length <= 0) {
          $group = $(
            "<div class='group-icon' data-group='" +
              shape.groupName +
              "'></div>"
          ).appendTo($selectBox)
        }

        const shapeGroup = eventBus.trigger('group.get', shape.groupName) || []
        const items = []

        for (let i = 0; i < shapeGroup.length; i += 1) {
          const type = shapeGroup[i]

          if (checkBpmnShape(bpmns, filter, type)) {
            continue
          }
          items.push(type)
        }

        if (items.length <= 1 && items[0] === shape.bpmnName) {
          $group.hide()
        } else {
          $group.show()
        }

        $group.attr('data-group', shape.groupName)
        $group.off('mousedown').on('mousedown', function(e) {
          e.stopPropagation()

          const groupName = $(this).attr('data-group')
          const $parent = $(this).parent()
          const pos = $parent.position()
          const width = pos.left + $parent.width()
          const height = pos.top + $parent.height() + 10

          self.groupPanel(groupName, width, height, type => {
            if (elements[0].shape.bpmnName !== type) {
              eventBus.trigger('element.change', { target: elements[0], type })
              // eventBus.trigger('element.update', elements[0])
            }
          })
        })
      }
    }
  }

  /**
   *
   * @param {*} groupName
   * @param {*} width
   * @param {*} height
   * @param {*} callback
   */
  groupPanel(groupName, width, height, callback) {
    const { $container, config, bpmns, filter } = this
    const $designer = $container.find('.bpd-designer')

    const orders = eventBus.trigger('orders.get')

    $container.find('.group-panel').hide()

    let $groupPanel = $container.find(
      '.group-panel[data-group="' + groupName + '"]'
    )

    if ($groupPanel.length === 0) {
      $groupPanel = $(
        '<div class="group-panel" data-group="' + groupName + '"></div>'
      ).appendTo($designer)

      const shapeGroup = eventBus.trigger('group.get', groupName)

      for (let i = 0; i < shapeGroup.length; i += 1) {
        const type = shapeGroup[i]
        const element = eventBus.trigger('shape.create', {
          type,
          element: cloneDeep(ELEMENT_TEMP)
        })

        if (checkBpmnShape(bpmns, filter, type)) {
          continue
        }

        element.data.text = this.getShapeName(element.shape.bpmnName)

        const $groupItem = $(
          '<div class="group-item" data-type="' +
            type +
            '" data-shape="' +
            element.shape.bpmnName +
            '"><canvas title="' +
            element.data.text +
            '" width="' +
            config.width +
            '" height="' +
            config.height +
            '"></canvas></div>'
        ).appendTo($groupPanel)

        this.renderItem($groupItem.children('canvas')[0], element)
      }
      $groupPanel.on('mousedown', e => {
        e.stopPropagation()
      })
    }

    $groupPanel
      .css({ left: width, top: height, 'z-index': orders.length + 1 })
      .show()

    $groupPanel
      .children('.group-item')
      .off()
      .on('click', function() {
        const bpmn = $(this).attr('data-shape')
        callback(bpmn)
        $groupPanel.hide()
        $(document).off('mousedown.group-panel')
      })
    $(document).on('mousedown.group-panel', () => {
      $groupPanel.hide()
      $(document).off('mousedown.group-panel')
    })
    return $groupPanel
  }

  hideGroup($parents) {
    const $dom = $parents || this.$container
    $dom.find('.group-icon').hide()
  }

  /**
   *
   * @param {*} connection
   */
  showConnectionGroup(connection) {
    const { $container, config, bpmns, bpmnStyle, filter } = this
    const { data, plane, shape } = connection

    const self = this
    const orders = eventBus.trigger('orders.get')
    const $designer = $container.find('.bpd-designer')

    $container.find('.connection-group-panel').hide()
    let $groupPanel = $container.find(
      '.connection-group-panel[data-group="bpmn"]'
    )

    if ($groupPanel.length === 0) {
      $groupPanel = $(
        "<div class='connection-group-panel' data-group='bpmn'></div>"
      ).appendTo($designer)
      const shapeGroup = eventBus.trigger('group.get')
      for (let key in shapeGroup) {
        const group = []

        for (let i = 0; i < shapeGroup[key].length; i += 1) {
          if (!checkBpmnShape(bpmns, filter, shapeGroup[key][i])) {
            group.push(shapeGroup[key][i])
          }
        }

        if (group.length > 0) {
          const type = shapeGroup[key][0]
          const element = eventBus.trigger('shape.create', {
            type,
            element: cloneDeep(ELEMENT_TEMP)
          })

          element.data.text = this.getShapeName(element.shape.bpmnName)

          this.renderConnectionItem(element, group, $groupPanel)
        }
      }

      $groupPanel
        .on('mousemove', function(e) {
          e.stopPropagation()
        })
        .on('mousedown', function(e) {
          e.stopPropagation()
        })
    }

    $groupPanel
      .css({
        left: setScale(plane.waypoint[plane.waypoint.length - 1].x),
        top: setScale(plane.waypoint[plane.waypoint.length - 1].y),
        'z-index': orders.length
      })
      .show()
    $groupPanel
      .find('.group-icon')
      .off()
      .on('mousedown', function(e) {
        e.stopPropagation()

        const groupName = $(this).data('group')
        const itemPos = $(this)
          .parent()
          .position()
        const pos = $groupPanel.position()
        const width =
          pos.left +
          itemPos.left +
          $(this)
            .parent()
            .outerWidth() -
          10
        const height =
          pos.top +
          itemPos.top +
          $(this)
            .parent()
            .outerHeight()

        self.groupPanel(groupName, width, height, type => {
          self.renderShape(connection, type)
          $groupPanel.hide()
          $(document).off('mousedown.dashboard')
        })
      })
      .on('click', function(e) {
        e.stopPropagation()
      })
    $groupPanel
      .children('.group-item')
      .off()
      .on('click', function() {
        $groupPanel.hide()
        $(document).off('mousedown.dashboard')
        self.renderShape(connection, $(this).data('shape'))
      })
    $(document).on('mousedown.dashboard', function() {
      $groupPanel.hide()
      $(document).off('mousedown.dashboard')
    })
  }

  /**
   *
   * @param {*} connection
   * @param {*} type
   */
  renderShape(connection, type) {
    const waypoint = connection.plane.waypoint
    const angle = DrawUtils.getEndpointAngle(connection.shape, 'targetRef')
    const quadrant = DrawUtils.getAngleDir(angle)

    const name = this.getShapeName(type)
    const element = eventBus.trigger('element.create', {
      name,
      type,
      prefix: 'obj'
    })

    const anchors = element.shape.getAnchors()

    let point
    let num = null

    switch (quadrant) {
      case 1:
        num = null
        for (let i = 0; i < anchors.length; i += 1) {
          const anchor = anchors[i]
          if (num == null || anchor.y < num) {
            num = anchor.y
            point = anchor
          }
        }
        break
      case 2:
        num = null
        for (let i = 0; i < anchors.length; i += 1) {
          const anchor = anchors[i]
          if (num == null || anchor.x > num) {
            num = anchor.x
            point = anchor
          }
        }
        break
      case 3:
        num = null
        for (let i = 0; i < anchors.length; i += 1) {
          const anchor = anchors[i]
          if (num == null || anchor.y > num) {
            num = anchor.y
            point = anchor
          }
        }
        break
      case 4:
        num = null
        for (let i = 0; i < anchors.length; i += 1) {
          const anchor = anchors[i]
          if (num == null || anchor.x < num) {
            num = anchor.x
            point = anchor
          }
        }
        break
      default:
        break
    }

    element.plane.bounds.x = waypoint[waypoint.length - 1].x - point.x
    element.plane.bounds.y = waypoint[waypoint.length - 1].y - point.y

    // 开始记录
    eventBus.trigger('record.start')
    eventBus.trigger('shape.render', { type, element })
    eventBus.trigger('element.add', element)

    const targetAngle = DrawUtils.getPointAngle(
      this.$container,
      element.data.id,
      waypoint[waypoint.length - 1].x,
      waypoint[waypoint.length - 1].y,
      7
    )

    connection.data.targetRef = element.data.id
    waypoint[waypoint.length - 1].angle = targetAngle

    eventBus.trigger('connection.render', {
      element: connection,
      rendered: true
    })

    eventBus.trigger('element.update', connection)

    // 结束记录
    eventBus.trigger('record.end')
    eventBus.trigger('shape.select.remove')
    eventBus.trigger('shape.select', { ids: element.data.id })
  }

  /**
   *
   * @param {*} element
   * @param {*} group
   * @param {*} $groupPanel
   */
  renderConnectionItem(element, group, $groupPanel) {
    const { config, bpmnStyle } = this
    const title = this.getShapeName(element.shape.bpmnName)
    const $item = $(
      "<div class='group-item' data-group='" +
        element.shape.groupName +
        "'  data-shape='" +
        element.shape.bpmnName +
        "'><canvas title='" +
        title +
        "' width='" +
        config.width +
        "' height='" +
        config.height +
        "'></canvas></div>"
    ).appendTo($groupPanel)

    this.renderItem($item.children('canvas')[0], element)

    if (group.length > 1) {
      $item.append(
        "<div class='group-icon' data-group='" +
          element.shape.groupName +
          "'></div>"
      )
    }
  }

  /**
   *
   * @param {*} canvas
   * @param {*} element
   */
  renderItem(canvas, element) {
    const { config } = this
    const { data, plane, shape } = element
    const canvas2D = canvas.getContext('2d')

    const bounds = {
      x: 0,
      y: 0,
      width: plane.bounds.width,
      height: plane.bounds.height
    }

    canvas2D.clearRect(0, 0, config.width, config.height)

    if (bounds.width >= config.width || bounds.height >= config.width) {
      if (plane.bounds.width >= plane.bounds.height) {
        bounds.width = config.width - shape.lineStyle.lineWidth * 2
        bounds.height = parseInt(
          (plane.bounds.height / plane.bounds.width) * bounds.width
        )
        // 最小高度
        if (bounds.height < 20) {
          bounds.height = 20
        }
      } else {
        bounds.height = config.height - shape.lineStyle.lineWidth * 2
        bounds.width = parseInt(
          (plane.bounds.width / plane.bounds.height) * bounds.height
        )
        // 最小宽度
        if (bounds.width < 20) {
          bounds.width = 20
        }
      }
    }

    plane.bounds = bounds

    const paths = cloneDeep(shape.getPath())

    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    }

    for (let i = 0; i < paths.length; i += 1) {
      const path = paths[i]
      for (let j = 0; j < path.actions.length; j += 1) {
        const item = path.actions[j]
        if (item.action === 'font') {
          item.textAlign = 'center'
          item.textBaseline = 'middle'
          item.fontSize = '14px'
          item.x = center.x
          item.y = center.y
        }
      }
    }

    shape.actions = paths

    canvas2D.save()
    canvas2D.lineJoin = 'round'
    canvas2D.globalAlpha = shape.shapeStyle.alpha
    const x = (config.width - bounds.width) / 2
    const y = (config.height - bounds.height) / 2
    canvas2D.translate(x, y)
    canvas2D.translate(bounds.width / 2, bounds.height / 2)
    canvas2D.rotate(shape.shapeStyle.angle)
    canvas2D.translate(-(bounds.width / 2), -(bounds.height / 2))

    eventBus.trigger('shape.renderPath', {
      shape2D: canvas2D,
      element,
      render: true
    })

    canvas2D.restore()
  }

  getShapeName(type) {
    const { bpmnStyle } = this
    return bpmnStyle[type] && bpmnStyle[type].name
      ? bpmnStyle[type].name
      : eventBus.trigger('i18n', 'bpmn.' + type)
  }
}

export default groupPanel
