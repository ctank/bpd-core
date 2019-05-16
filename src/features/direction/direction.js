import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'

import { setScale, restoreScale, mergeArray } from '../../utils/utils'
import DrawUtils from '../../draw/drawUtils'

const DEFAULT_CONFIG = {}

class Direction {
  constructor($container, config) {
    this.$container = $container

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.interval = null

    this.init()
  }

  init() {
    //
    eventBus.on('direction.show', this.showDirection.bind(this))
    //
    eventBus.on('direction.hide', this.hideDirection.bind(this))
    //
    eventBus.on('select.clear', this.hideDirection.bind(this))
  }

  /**
   * 显示
   */
  showDirection() {
    this.hideDirection()
    const selectIds = eventBus.trigger('shape.select.getIds')
    if (selectIds.length === 1) {
      const element = eventBus.trigger('element.get', selectIds[0])
      const { data, plane, shape } = element
      if (shape.bpmnName !== 'SequenceFlow') {
        const connections = eventBus.trigger('connections.get', data.id)
        if (connections && connections.length) {
          const directionList = []
          for (let i = 0; i < connections.length; i += 1) {
            const connection = eventBus.trigger('element.get', connections[i])
            if (
              data.id !== connection.data.sourceRef ||
              !connection.data.targetRef
            ) {
              continue
            }
            const length = setScale(DrawUtils.getConnectionLength(connection))
            const points = []
            if (connection.shape.linkerType === 'broken') {
              const waypoint = connection.plane.waypoint
              points.push({
                x: setScale(waypoint[0].x),
                y: setScale(waypoint[0].y),
                t: 0
              })
              for (let j = 0; j < connection.shape.points.length; j += 1) {
                const point = connection.shape.points[j]
                points.push({ x: setScale(point.x), y: setScale(point.y) })
              }
              points.push({
                x: setScale(waypoint[waypoint.length - 1].x),
                y: setScale(waypoint[waypoint.length - 1].y)
              })
              let distance = 0
              for (let j = 1; j < points.length; j += 1) {
                var point1 = points[j - 1]
                var point2 = points[j]
                distance += DrawUtils.measureDistance(point1, point2)
                point2.t = distance / length
              }
            }
            const step = 3 / length
            const maxT = (Math.ceil(length / 120) * 120) / length
            let num = 0
            while (num < length) {
              directionList.push({
                t: num / length,
                step,
                connection,
                points,
                maxT
              })
              num += 120
            }
          }
          this.playDirection(directionList)
        }
      }
    }
  }

  /**
   *
   * @param {*} directionList
   */
  playDirection(directionList) {
    const { $container, options } = this

    const $designer = $container.find('.bpd-designer')

    for (let i = 0; i < directionList.length; i += 1) {
      const item = directionList[i]

      const { data, plane, shape } = item.connection

      const $direction = $("<div class='connection-direction'></div>").appendTo(
        $designer
      )
      let lineWidth = setScale(shape.lineStyle.lineWidth + 2)
      if (lineWidth < 5) {
        lineWidth = 5
      }
      var halfWidth = lineWidth / 2
      item.half = halfWidth
      item.dom = $direction
      $direction.css({
        width: lineWidth,
        height: lineWidth,
        '-webkit-border-radius': halfWidth,
        '-moz-border-radius': halfWidth,
        '-ms-border-radius': halfWidth,
        '-o-border-radius': halfWidth,
        'border-radius': halfWidth,
        'z-index': $('#' + data.id).css('z-index')
      })
    }
    this.interval = setInterval(function() {
      for (let i = 0; i < directionList.length; i += 1) {
        const item = directionList[i]
        const { data, plane, shape } = item.connection
        if (item.t >= item.maxT) {
          item.t = 0
          item.dom.show()
        }
        const t = item.t
        if (shape.linkerType === 'broken') {
          for (let j = 1; j < item.points.length; j++) {
            const point1 = item.points[j - 1]
            const point2 = item.points[j]
            if (t >= point1.t && t < point2.t) {
              const num = (t - point1.t) / (point2.t - point1.t)
              const left = (1 - num) * point1.x + num * point2.x
              const top = (1 - num) * point1.y + num * point2.y
              item.dom.css({ left: left - item.half, top: top - item.half })
              break
            }
          }
        } else {
          const source = plane.waypoint[0]
          const target = plane.waypoint[plane.waypoint.length - 1]
          if (shape.linkerType === 'curve') {
            const point1 = shape.points[0]
            const point2 = shape.points[1]
            const left =
              setScale(source.x) * Math.pow(1 - t, 3) +
              setScale(point1.x) * t * Math.pow(1 - t, 2) * 3 +
              setScale(point2.x) * Math.pow(t, 2) * (1 - t) * 3 +
              setScale(target.x) * Math.pow(t, 3)
            const top =
              setScale(source.y) * Math.pow(1 - t, 3) +
              setScale(point1.y) * t * Math.pow(1 - t, 2) * 3 +
              setScale(point2.y) * Math.pow(t, 2) * (1 - t) * 3 +
              setScale(target.y) * Math.pow(t, 3)
            item.dom.css({ left: left - item.half, top: top - item.half })
          } else {
            const left = (1 - t) * setScale(source.x) + t * setScale(target.x)
            const top = (1 - t) * setScale(source.y) + t * setScale(target.y)
            item.dom.css({ left: left - item.half, top: top - item.half })
          }
        }
        item.t += item.step
        if (item.t >= 1) {
          item.dom.hide()
        }
      }
    }, 30)
  }

  /**
   * 隐藏
   */
  hideDirection() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.$container.find('.connection-direction').remove()
  }
}

export default Direction
