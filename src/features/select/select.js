import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import {
  setScale,
  restoreScale,
  mergeArray,
  setExportData
} from '../../utils/utils'
import DrawUtils from '../../draw/drawUtils'

const DEFAULT_CONFIG = {
  // 颜色
  color: '#ec5343',
  // 选中事件
  onSelected: () => { }
}

class ShapeSelect {
  constructor($container, config) {
    this.$container = $container

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.selectIds = []

    this.init()
  }
  init() {
    // 选中
    eventBus.on('shape.hover', this.selectable.bind(this))
    //
    eventBus.on('shape.multiSelect', this.multiSelectable.bind(this))
    // 获取选中图形id
    eventBus.on('shape.select.getIds', this.getSelectedIds.bind(this))
    // 获取选中图形集合
    eventBus.on('shape.select.get', this.getSelected.bind(this))
    // 选中图形
    eventBus.on('shape.select', this.selectShape.bind(this))
    //
    eventBus.on('shape.move', this.moveSelect.bind(this))
    // 删除选中图形
    eventBus.on('shape.select.remove', this.unselect.bind(this))
    //
    eventBus.on('shape.select.check', this.isSelected.bind(this))
    //
    eventBus.on('destroy', this.destroy.bind(this))
  }

  selectable({ state, element }) {
    const { $container } = this

    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    const self = this

    $designer.on('mousedown.select', e => {
      state.change('select_shapes')
      const id = element.data.id
      if (e.ctrlKey) {
        if (this.isSelected(id)) {
        } else {
          this.selectIds.push(id)
        }
        this.unselect()
        if (this.selectIds.length > 0) {
        }
      } else {
        if (!this.isSelected(id)) {
          this.unselect()
          this.selectShape({ ids: id })
        }
      }

      if (
        element.shape.groupName &&
        element.shape.groupName !== 'CallActivity'
      ) {
        eventBus.trigger('group.show', this.getSelected())
      }
      $(document).on('mouseup.select', function () {

        if (state.state === 'select_shapes') {
          // 选中回调
          if (self.config.onSelected) {
            if (self.selectIds.length === 1) {
              self.config.onSelected(setExportData(self.getSelected()[0]))
            } else {
              self.config.onSelected(null)
            }
          }
        } else if (state.state === 'drag_shapes') {
          self.unselect()
        }

        state.reset()
        $designer.off('mousedown.select')
        $(document).off('mouseup.select')
      })
    })
  }

  multiSelectable({ state }) {
    const { $container, config } = this

    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    const orders = eventBus.trigger('orders.get')

    const self = this

    $layout
      .off('mousedown.multiselect')
      .on('mousedown.multiselect', function (e) {
        let $multiSelect = null
        if (!e.ctrlKey) {
          self.unselect()
        }

        if (state.state === 'multiSelect') {
          const mouseDownPos = DrawUtils.getRelativePos(
            e.pageX,
            e.pageY,
            $designer
          )
          $layout.on('mousemove.multiselect', function (e) {
            if ($multiSelect == null) {
              $multiSelect = $("<div class='multiselect-box'></div>").appendTo(
                $designer
              )
            }
            const mousePos = DrawUtils.getRelativePos(
              e.pageX,
              e.pageY,
              $designer
            )
            const style = {
              'z-index': orders.length,
              left: mousePos.x,
              top: mousePos.y
            }
            if (mousePos.x > mouseDownPos.x) {
              style.left = mouseDownPos.x
            }
            if (mousePos.y > mouseDownPos.y) {
              style.top = mouseDownPos.y
            }
            style.width = Math.abs(mousePos.x - mouseDownPos.x)
            style.height = Math.abs(mousePos.y - mouseDownPos.y)
            $multiSelect.css(style)
          })
          $(document)
            .off('mouseup.multiselect')
            .on('mouseup.multiselect', function (e) {
              if ($multiSelect != null) {
                const range = {
                  x: restoreScale($multiSelect.position().left),
                  y: restoreScale($multiSelect.position().top),
                  width: restoreScale($multiSelect.width()),
                  height: restoreScale($multiSelect.height())
                }
                const ids = DrawUtils.getElementIdsByRange(range)
                if (e.ctrlKey) {
                  const selectIds = self.getSelectedIds()
                  mergeArray(ids, selectIds)
                }
                self.unselect()
                self.selectShape({ ids })
                $multiSelect.remove()
              }
              state.reset()
              $(document).off('mouseup.multiselect')
              $layout.off('mousemove.multiselect')
            })
        }
        $layout.off('mousedown.multiselect')
      })
  }

  /**
   * 获取选中图形id集合
   */
  getSelectedIds() {
    return this.selectIds
  }

  /**
   * 获取选中图形集合
   */
  getSelected() {
    const elements = []
    for (let i = 0; i < this.selectIds.length; i += 1) {
      const id = this.selectIds[i]
      const element = eventBus.trigger('element.get', id)
      if (!element.shape.locked) {
        elements.push(element)
      }
    }
    return elements
  }

  /**
   *
   * @param {*} ids
   */
  selectShape({ ids }) {
    if (typeof ids === 'string') {
      ids = [ids]
    }
    if (ids.length <= 0) {
      return
    }
    const uniqueArr = mergeArray([], ids)
    const newIds = []
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i]
      const element = eventBus.trigger('element.get', id)
      if (
        element.shape.parent &&
        element.shape.resizeDir.length === 0 &&
        newIds.indexOf(element.shape.parent) < 0
      ) {
        newIds.push(element.shape.parent)
      } else {
        if (newIds.indexOf(id) < 0) {
          newIds.push(id)
        }
      }
    }
    ids = newIds
    eventBus.trigger('anchor.remove')
    this.selectIds = []
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i]
      const element = eventBus.trigger('element.get', id)
      this.selectIds.push(id)
      if (element.shape.bpmnName === 'SequenceFlow') {
        eventBus.trigger('connection.render', { element })
      } else {
        eventBus.trigger('anchor.show', element)
      }
    }

    var selectIds = this.selectIds
    var n = false
    if (selectIds.length === 1) {
      const element = eventBus.trigger('element.get', selectIds[0])

      if (element.shape.bpmnName === 'SequenceFlow') {
        n = true
      }
    }
    if (selectIds.length > 0 && !n) {
      this.renderSelectBox(selectIds)
    }

    eventBus.trigger('direction.show')
  }

  /**
   *
   * @param {*} selectIds
   */
  renderSelectBox(selectIds) {
    const { $container } = this

    const $layout = $container.find('.bpd-layout')
    const $designer = $container.find('.bpd-designer')

    const orders = eventBus.trigger('orders.get')

    let $selectBox = $designer.find('.shape-select')

    if ($selectBox.length === 0) {
      $selectBox = $(
        "<div class='shape-select'><canvas class='shape-bound'></canvas></div>"
      ).appendTo($designer)
    }
    $selectBox.show()
    eventBus.trigger('group.hide', $selectBox)

    let angle = 0
    let data = {}
    if (selectIds.length === 1) {
      const element = eventBus.trigger('element.get', selectIds[0])
      data.angle = angle = element.shape.shapeStyle.angle
      data.zindex = element.shape.shapeStyle.zindex
      data.height = element.plane.bounds.height
      data.width = element.plane.bounds.width
      data.x = element.plane.bounds.x
      data.y = element.plane.bounds.y

      if (
        element.shape.groupName &&
        element.shape.groupName !== 'CallActivity'
      ) {
        eventBus.trigger('group.show', this.getSelected())
      }
    } else {
      data = DrawUtils.getElementsBox(selectIds)
    }
    const shapeBox = DrawUtils.getRotatedBox(data, angle)

    this.renderControlBound($selectBox, data, shapeBox, angle)

    $selectBox.css({
      left: setScale(shapeBox.x),
      top: setScale(shapeBox.y),
      width: setScale(shapeBox.width),
      height: setScale(shapeBox.height),
      'z-index': orders.length,
      display: 'block'
    })
  }

  /**
   *
   * @param {*} $selectBox
   * @param {*} shapeBox
   * @param {*} angle
   */
  renderControlBound($selectBox, data, shapeBox, angle) {
    const { config } = this

    const width = setScale(shapeBox.width)
    const height = setScale(shapeBox.height)
    const boundW = width + 20
    const boundH = height + 20

    const $bound = $selectBox.find('.shape-bound')

    $bound.attr({ width: boundW, height: boundH })

    const bound2D = $bound[0].getContext('2d')
    bound2D.lineJoin = 'round'
    bound2D.lineWidth = 1
    bound2D.strokeStyle = config.color
    bound2D.globalAlpha = 0.5
    bound2D.save()
    bound2D.clearRect(0, 0, boundW, boundH)
    bound2D.translate(boundW / 2, boundH / 2)
    bound2D.rotate(angle)
    bound2D.translate(-boundW / 2, -boundH / 2)
    bound2D.translate(9.5, 9.5)
    const rect = {
      x: setScale(Math.round(data.x - shapeBox.x)),
      y: setScale(Math.round(data.y - shapeBox.y)),
      width: Math.floor(setScale(data.width) + 1),
      heigth: Math.floor(setScale(data.height) + 1)
    }
    bound2D.strokeRect(rect.x, rect.y, rect.width, rect.heigth)
    bound2D.restore()
  }

  moveSelect({ elements, pos }) {
    const ids = DrawUtils.getSelectedConnectionIds()
    if (elements.length === 1 && ids.length === 1) {
      return
    }
    if (ids.length > 0) {
      const selectIds = eventBus.trigger('shape.select.getIds')
      this.renderSelectBox(selectIds)
    } else {
      const $contour = this.$container.find('.shape-select')
      $contour.css({
        left: parseFloat($contour.css('left')) + pos.x,
        top: parseFloat($contour.css('top')) + pos.y
      })
    }
  }

  /**
   * 清空选中
   */
  unselect() {
    const selectIds = this.selectIds
    this.selectIds = []
    for (let i = 0; i < selectIds.length; i += 1) {
      const id = selectIds[i]
      const element = eventBus.trigger('element.get', id)
      if (element && element.shape.bpmnName === 'SequenceFlow') {
        eventBus.trigger('connection.render', { element })
      }
    }
    this.$container.find('.shape-select').hide()
    eventBus.trigger('select.clear')
  }

  /**
   * 判断是否选中
   * @param {*} id
   */
  isSelected(id) {
    if (this.selectIds.indexOf(id) >= 0) {
      return true
    }
    return false
  }

  /**
   * 销毁
   */
  destroy() {
    const $layout = this.$container.find('.bpd-layout')
    const $designer = this.$container.find('.bpd-designer')
    $designer.off('mousedown.select')
    $layout.off('mousedown.multiselect')
  }
}

export default ShapeSelect
