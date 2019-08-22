import eventBus from '../core/eventBus'
import { setScale, restoreScale } from '../utils/utils'

/**
 * 获取象限
 * @param {*} angle
 */
const getAngleDir = angle => {
  const pi = Math.PI
  if (angle >= pi / 4 && angle < (pi / 4) * 3) {
    return 1
  } else {
    if (angle >= (pi / 4) * 3 && angle < (pi / 4) * 5) {
      return 2
    } else {
      if (angle >= (pi / 4) * 5 && angle < (pi / 4) * 7) {
        return 3
      } else {
        return 4
      }
    }
  }
}

/**
 * 根据两点获取角度
 * @param {*} point1
 * @param {*} point2
 */
const getAngle = (point1, point2) => {
  let angle = Math.atan(
    Math.abs(point1.y - point2.y) / Math.abs(point1.x - point2.x)
  )
  if (point2.x <= point1.x && point2.y > point1.y) {
    angle = Math.PI - angle
  } else {
    if (point2.x < point1.x && point2.y <= point1.y) {
      angle = Math.PI + angle
    } else {
      if (point2.x >= point1.x && point2.y < point1.y) {
        angle = Math.PI * 2 - angle
      }
    }
  }
  return angle
}

/**
 *
 * @param {*} elements
 */
const getBounding = elements => {
  const pos = { x1: null, y1: null, x2: null, y2: null }
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i]
    let size
    if (element.shape.bpmnName === 'SequenceFlow') {
      size = getConnectionBox(element)
    } else {
      size = element.plane.bounds
    }
    if (pos.x1 == null || size.x < pos.x1) {
      pos.x1 = size.x
    }
    if (pos.y1 == null || size.y < pos.y1) {
      pos.y1 = size.y
    }
    if (pos.x2 == null || size.x + size.width > pos.x2) {
      pos.x2 = size.x + size.width
    }
    if (pos.y2 == null || size.y + size.height > pos.y2) {
      pos.y2 = size.y + size.height
    }
  }
  const bound = {
    x: pos.x1,
    y: pos.y1,
    width: pos.x2 - pos.x1,
    height: pos.y2 - pos.y1
  }
  return bound
}

/**
 * 获取圆行点集合
 * @param {*} x
 * @param {*} y
 * @param {*} padding
 */
const getCirclePoints = (x, y, padding) => {
  const num = Math.PI / 18
  const points = []
  for (let i = 0; i < 36; i += 1) {
    const angle = num * i
    const pos = {
      x: x - Math.cos(angle) * padding,
      y: y - Math.sin(angle) * padding,
      angle
    }
    points.push(pos)
  }
  return points
}

/**
 *
 * @param {*} element
 */
const getConnectionLength = element => {
  const points = getConnectionLinePoints(element)
  let length = 0
  for (let i = 1; i < points.length; i += 1) {
    const point1 = points[i - 1]
    const point2 = points[i]
    const distance = measureDistance(point1, point2)
    length += distance
  }
  return length
}

/**
 * 根据传入颜色获取浅色
 * @param {*} color
 */
const getLighterColor = (color, lighter = 60) => {
  const colors = color.split(',')
  const r = parseInt(colors[0])
  const g = parseInt(colors[1])
  const b = parseInt(colors[2])
  let r2 = Math.round(r + ((255 - r) / 255) * lighter)
  if (r2 > 255) {
    r2 = 255
  }
  let g2 = Math.round(g + ((255 - g) / 255) * lighter)
  if (g2 > 255) {
    g2 = 255
  }
  let b2 = Math.round(b + ((255 - b) / 255) * lighter)
  if (b2 > 255) {
    b2 = 255
  }
  return r2 + ',' + g2 + ',' + b2
}

/**
 * 根据传入颜色获取浅灰色
 */
const getDarkerColor = (color, darker = 13) => {
  const colors = color.split(',')
  const r = parseInt(colors[0])
  const g = parseInt(colors[1])
  const b = parseInt(colors[2])
  // 灰度后RGB颜色
  let r2 = Math.round(r - (r / 255) * darker)
  if (r2 < 0) {
    r2 = 0
  }
  let g2 = Math.round(g - (g / 255) * darker)
  if (g2 < 0) {
    g2 = 0
  }
  let b2 = Math.round(b - (b / 255) * darker)
  if (b2 < 0) {
    b2 = 0
  }
  return r2 + ',' + g2 + ',' + b2
}

/**
 * 根据传入颜色获取深灰色
 */
const getDarkestColor = color => {
  return getDarkerColor(color, 26)
}

/**
 *
 * @param {*} range
 */
const getElementIdsByRange = range => {
  const elements = eventBus.trigger('element.get')
  const items = []
  for (let id in elements) {
    const element = elements[id]
    let bounds = element.plane.bounds
    if (element.shape.bpmnName === 'SequenceFlow') {
      bounds = getConnectionBox(element)
    } else {
      bounds = getShapeBox(element)
    }
    if (
      pointInRect(bounds.x, bounds.y, range) &&
      pointInRect(bounds.x + bounds.width, bounds.y, range) &&
      pointInRect(bounds.x + bounds.width, bounds.y + bounds.height, range) &&
      pointInRect(bounds.x, bounds.y + bounds.height, range)
    ) {
      items.push(element.data.id)
    }
  }
  return items
}

/**
 * 原点1象限,目标点1象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS1T1 = (point1, point2, shape1) => {
  const r = 30
  const points = []
  const { x, width } = shape1.plane.bounds
  const point = {}
  if (point2.x >= x - r && point2.x <= x + width + r) {
    if (point2.x < x + width / 2) {
      point.x = x - r
    } else {
      point.x = x + width + r
    }
    point.y = point1.y - r
    points.push({ x: point1.x, y: point.y })
    points.push({ x: point.x, y: point.y })
    point.y = point2.y - r
    points.push({ x: point.x, y: point.y })
    points.push({ x: point2.x, y: point.y })
  } else {
    point.y = point1.y - r
    points.push({ x: point1.x, y: point.y })
    points.push({ x: point2.x, y: point.y })
  }
  return points
}

/**
 * 原点2象限,目标点2象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS2T2 = (point1, point2, shape1) => {
  const r = 30
  const points = []
  const { y, height } = shape1.plane.bounds
  const point = {}
  if (point2.y >= y - r && point2.y <= y + height + r) {
    point.x = point1.x + r
    if (point2.y < y + height / 2) {
      point.y = y - r
    } else {
      point.y = y + height + r
    }
    points.push({ x: point.x, y: point1.y })
    points.push({ x: point.x, y: point.y })
    point.x = point2.x + r
    points.push({ x: point.x, y: point.y })
    points.push({ x: point.x, y: point2.y })
  } else {
    point.x = point1.x + r
    points.push({ x: point.x, y: point1.y })
    points.push({ x: point.x, y: point2.y })
  }

  return points
}

/**
 * 原点3象限,目标点3象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS3T3 = (point1, point2, shape1) => {
  const r = 30
  const points = []
  const { x, width } = shape1.plane.bounds
  const point = {}
  if (point2.x >= x - r && point2.x <= x + width + r) {
    if (point2.x < x + width / 2) {
      point.x = x - r
    } else {
      point.x = x + width + r
    }
    point.y = point1.y + r
    points.push({ x: point1.x, y: point.y })
    points.push({ x: point.x, y: point.y })
    point.y = point2.y + r
    points.push({ x: point.x, y: point.y })
    points.push({ x: point2.x, y: point.y })
  } else {
    point.y = point1.y + r
    points.push({ x: point1.x, y: point.y })
    points.push({ x: point2.x, y: point.y })
  }

  return points
}

/**
 * 原点4象限,目标点4象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS4T4 = (point1, point2, shape1) => {
  const r = 30
  const points = []
  const { y, height } = shape1.plane.bounds
  const point = {}
  if (point2.y >= y - r && point2.y <= y + height + r) {
    point.x = point1.x + r
    if (point2.y < y + height / 2) {
      point.y = y - r
    } else {
      point.y = y + height + r
    }
    points.push({ x: point.x, y: point1.y })
    points.push({ x: point.x, y: point.y })
    point.x = point2.x - r
    points.push({ x: point.x, y: point.y })
    points.push({ x: point.x, y: point2.y })
  } else {
    point.x = point1.x - r
    points.push({ x: point.x, y: point1.y })
    points.push({ x: point.x, y: point2.y })
  }
  return points
}

/**
 * 原点1象限,目标点3象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS1T3 = (point1, point2, shape1, shape2, distanceY) => {
  const r = 30
  const points = []
  const bounds1 = shape1.plane.bounds
  const bounds2 = shape2.plane.bounds
  const point = {}
  if (point2.y <= point1.y) {
    point.y = point1.y - distanceY / 2
    points.push({ x: point1.x, y: point.y })
    points.push({ x: point2.x, y: point.y })
  } else {
    let shape1R = bounds1.x + bounds1.width
    let shape2R = bounds2.x + bounds2.width
    point.y = point1.y - r
    if (shape2R >= bounds1.x && bounds2.x <= shape1R) {
      let centerX = bounds1.x + bounds1.width / 2
      if (point2.x < centerX) {
        point.x = bounds1.x < bounds2.x ? bounds1.x - r : bounds2.x - r
      } else {
        point.x = shape1R > shape2R ? shape1R + r : shape2R + r
      }
      if (bounds2.y < point1.y) {
        point.y = bounds2.y - r
      }
    } else {
      if (point2.x < point1.x) {
        point.x = shape2R + (bounds1.x - shape2R) / 2
      } else {
        point.x = shape1R + (bounds2.x - shape1R) / 2
      }
    }
    points.push({ x: point1.x, y: point.y })
    points.push({ x: point.x, y: point.y })
    point.y = point2.y + r
    points.push({ x: point.x, y: point.y })
    points.push({ x: point2.x, y: point.y })
  }

  return points
}

/**
 * 原点2象限,目标点4象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS2T4 = (point1, point2, shape1, shape2, distanceX) => {
  const r = 30
  const points = []
  const bounds1 = shape1.plane.bounds
  const bounds2 = shape2.plane.bounds
  const point = {}

  if (point2.x > point1.x) {
    point.x = point1.x + distanceX / 2
    points.push({ x: point.x, y: point1.y })
    points.push({ x: point.x, y: point2.y })
  } else {
    let shape1B = bounds1.y + bounds1.height
    let shape2B = bounds2.y + bounds2.height
    point.x = point1.x + r
    if (shape2B >= bounds1.y && bounds2.y <= shape1B) {
      let centerY = bounds1.y + bounds1.height / 2
      if (point2.y < centerY) {
        point.y = bounds1.y < bounds2.y ? bounds1.y - r : bounds2.y - r
      } else {
        point.y = shape1B > shape2B ? shape1B + r : shape2B + r
      }
      if (bounds2.x + bounds2.width > point1.x) {
        point.x = bounds2.x + bounds2.width + r
      }
    } else {
      if (point2.y < point1.y) {
        point.y = shape2B + (bounds1.y - shape2B) / 2
      } else {
        point.y = shape1B + (bounds2.y - shape1B) / 2
      }
    }
    points.push({ x: point.x, y: point1.y })
    points.push({ x: point.x, y: point.y })
    point.x = point2.x - r
    points.push({ x: point.x, y: point.y })
    points.push({ x: point.x, y: point2.y })
  }
  return points
}

/**
 * 原点1象限,目标点2象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS1T2 = (point1, point2, shape1, shape2) => {
  const r = 30
  const points = []
  const bounds1 = shape1.plane.bounds
  const bounds2 = shape2.plane.bounds
  const point = {}

  if (point2.x > point1.x && point2.y > point1.y) {
    points.push({ x: point2.x, y: point1.y })
  } else {
    if (point2.x > point1.x && bounds2.x > point1.x) {
      if (bounds2.x - point1.x < r * 2) {
        point.x = point1.x + (bounds2.x - point1.x) / 2
      } else {
        point.x = point1.x + r
      }
      point.y = point2.y - r
      points.push({ x: point.x, y: point1.y })
      points.push({ x: point.x, y: point.y })
      points.push({ x: point2.x, y: point.y })
    } else {
      if (point2.x <= point1.x && point2.y > bounds1.y + bounds1.height) {
        let shape1B = bounds1.y + bounds1.height
        point.x = point1.x + r

        if (point2.y - shape1B < r * 2) {
          point.y = shape1B + (point2.y - shape1B) / 2
        } else {
          point.y = point2.y - r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      } else {
        let shape2R = bounds2.x + bounds2.width
        if (shape2R > point1.x) {
          point.x = shape2R + r
        } else {
          point.x = point1.x + r
        }

        if (point2.y < bounds1.y) {
          point.y = point2.y - r
        } else {
          point.y = bounds1.y - r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      }
    }
  }

  return points
}

/**
 * 原点1象限,目标点4象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS1T4 = (point1, point2, shape1, shape2) => {
  const r = 30
  const points = []
  const bounds1 = shape1.plane.bounds
  const bounds2 = shape2.plane.bounds
  const point = {}

  let shape2R = bounds2.x + bounds2.width
  if (point2.x < point1.x && point2.y > point1.y) {
    points.push({ x: point2.x, y: point1.y })
  } else {
    if (point2.x < point1.x && shape2R < point1.x) {
      if (point1.x - shape2R < r * 2) {
        point.x = shape2R + (point1.x - shape2R) / 2
      } else {
        point.x = point1.x - r
      }
      point.y = point2.y - r
      points.push({ x: point.x, y: point1.y })
      points.push({ x: point.x, y: point.y })
      points.push({ x: point2.x, y: point.y })
    } else {
      if (point2.x >= point1.x && point2.y > bounds1.y + bounds1.height) {
        let shape1B = bounds1.y + bounds1.height
        point.x = point1.x - r
        if (point2.y - shape1B < r * 2) {
          point.y = shape1B + (point2.y - shape1B) / 2
        } else {
          point.y = point2.y - r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      } else {
        if (bounds2.x < point1.x) {
          point.x = bounds2.x - r
        } else {
          point.x = point1.x - r
        }
        if (point2.y < bounds1.y) {
          point.y = point2.y - r
        } else {
          point.y = bounds1.y - r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      }
    }
  }

  return points
}

/**
 * 原点1象限,目标点4象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS2T3 = (point1, point2, shape1, shape2) => {
  const r = 30
  const points = []
  const bounds1 = shape1.plane.bounds
  const bounds2 = shape2.plane.bounds
  const point = {}

  if (point2.x > point1.x && point2.y < point1.y) {
    points.push({ x: point2.x, y: point1.y })
  } else {
    if (point2.x > point1.x && bounds2.x > point1.x) {
      if (bounds2.x - point1.x < r * 2) {
        point.x = point1.x + (bounds2.x - point1.x) / 2
      } else {
        point.x = point1.x + r
      }
      point.y = point2.y + r
      points.push({ x: point.x, y: point1.y })
      points.push({ x: point.x, y: point.y })
      points.push({ x: point2.x, y: point.y })
    } else {
      if (point2.x <= point1.x && point2.y < bounds1.y) {
        point.x = point1.x + r

        if (bounds1.y - point2.y < r * 2) {
          point.y = point2.y + (bounds1.y - point2.y) / 2
        } else {
          point.y = point2.y + r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      } else {
        let shape2R = bounds2.x + bounds2.width
        if (shape2R > point1.x) {
          point.x = shape2R + r
        } else {
          point.x = point1.x + r
        }
        if (point2.y > bounds1.y + bounds1.height) {
          point.y = point2.y + r
        } else {
          point.y = bounds1.y + bounds1.height + r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      }
    }
  }

  return points
}

/**
 * 原点1象限,目标点4象限
 * @param {*} point1
 * @param {*} point2
 * @param {*} shape1
 */
const getPointsWithS3T4 = (point1, point2, shape1, shape2) => {
  const r = 30
  const points = []
  const bounds1 = shape1.plane.bounds
  const bounds2 = shape2.plane.bounds
  const point = {}

  let shape2R = bounds2.x + bounds2.width
  if (point2.x < point1.x && point2.y < point1.y) {
    points.push({ x: point2.x, y: point1.y })
  } else {
    if (point2.x < point1.x && shape2R < point1.x) {
      if (point1.x - shape2R < r * 2) {
        point.x = shape2R + (point1.x - shape2R) / 2
      } else {
        point.x = point1.x - r
      }
      point.y = point2.y + r
      points.push({ x: point.x, y: point1.y })
      points.push({ x: point.x, y: point.y })
      points.push({ x: point2.x, y: point.y })
    } else {
      if (point2.x >= point1.x && point2.y < bounds1.y) {
        point.x = point1.x - r
        if (bounds1.y - point2.y < r * 2) {
          point.y = point2.y + (bounds1.y - point2.y) / 2
        } else {
          point.y = point2.y + r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      } else {
        if (bounds2.x < point1.x) {
          point.x = bounds2.x - r
        } else {
          point.x = point1.x - r
        }
        if (point2.y > bounds1.y + bounds1.height) {
          point.y = point2.y + r
        } else {
          point.y = bounds1.y + bounds1.height + r
        }
        points.push({ x: point.x, y: point1.y })
        points.push({ x: point.x, y: point.y })
        points.push({ x: point2.x, y: point.y })
      }
    }
  }

  return points
}

const getBezierCurce = (point1, point2, id, k) => {
  if (id != null) {
    return {
      x: point1.x - k * Math.cos(point1.angle),
      y: point1.y - k * Math.sin(point1.angle)
    }
  } else {
    const absY = Math.abs(point1.y - point2.y)
    const absX = Math.abs(point1.x - point2.x)
    const atan = Math.atan(absY / absX)
    const point = {}
    if (point1.x <= point2.x) {
      point.x = point1.x + k * Math.cos(atan)
    } else {
      point.x = point1.x - k * Math.cos(atan)
    }
    if (point1.y <= point2.y) {
      point.y = point1.y + k * Math.sin(atan)
    } else {
      point.y = point1.y - k * Math.sin(atan)
    }
    return point
  }
}

/**
 * 获取连线点集合
 * @param {*} connection
 */
const getConnectionPoints = (connection, elements) => {
  const { sourceRef, targetRef } = connection.data
  const sourceShape = elements[sourceRef]
  const targetShape = elements[targetRef]
  const { waypoint } = connection.plane
  const sourcePoint = waypoint[0]
  const targetPoint = waypoint[waypoint.length - 1]
  let points = []

  // 折线
  if (connection.linkerType === 'broken') {
    const distanceX = Math.abs(targetPoint.x - sourcePoint.x)
    const distanceY = Math.abs(targetPoint.y - sourcePoint.y)

    const pi = Math.PI

    var r = 30

    let reverse = false
    let point1, point2
    let shape1, shape2
    let angle

    if (sourceRef != null && targetRef != null) {
      const sourceQuadrant = getAngleDir(sourcePoint.angle) // c
      const targetQuadrant = getAngleDir(targetPoint.angle) // b

      if (sourceQuadrant === 1 && targetQuadrant === 1) {
        if (sourcePoint.y < targetPoint.y) {
          point1 = sourcePoint
          point2 = targetPoint
          shape1 = sourceShape
          shape2 = targetShape
          reverse = false
        } else {
          point1 = targetPoint
          point2 = sourcePoint
          shape1 = targetShape
          shape2 = sourceShape
          reverse = true
        }
        points = getPointsWithS1T1(point1, point2, shape1)
      } else {
        if (sourceQuadrant === 3 && targetQuadrant === 3) {
          if (sourcePoint.y > targetPoint.y) {
            point1 = sourcePoint
            point2 = targetPoint
            shape1 = sourceShape
            shape2 = targetShape
            reverse = false
          } else {
            point1 = targetPoint
            point2 = sourcePoint
            shape1 = targetShape
            shape2 = sourceShape
            reverse = true
          }
          points = getPointsWithS3T3(point1, point2, shape1)
        } else {
          if (sourceQuadrant === 2 && targetQuadrant === 2) {
            if (sourcePoint.y > targetPoint.y) {
              point1 = sourcePoint
              point2 = targetPoint
              shape1 = sourceShape
              shape2 = targetShape
              reverse = false
            } else {
              point1 = targetPoint
              point2 = sourcePoint
              shape1 = targetShape
              shape2 = sourceShape
              reverse = true
            }
            points = getPointsWithS2T2(point1, point2, shape1)
          } else {
            if (sourceQuadrant === 4 && targetQuadrant === 4) {
              if (sourcePoint.x < targetPoint.x) {
                point1 = sourcePoint
                point2 = targetPoint
                shape1 = sourceShape
                shape2 = targetShape
                reverse = false
              } else {
                point1 = targetPoint
                point2 = sourcePoint
                shape1 = targetShape
                shape2 = sourceShape
                reverse = true
              }
              points = getPointsWithS4T4(point1, point2, shape1)
            } else {
              if (
                (sourceQuadrant === 1 && targetQuadrant === 3) ||
                (sourceQuadrant === 3 && targetQuadrant === 1)
              ) {
                if (sourceQuadrant === 1) {
                  point1 = sourcePoint
                  point2 = targetPoint
                  shape1 = sourceShape
                  shape2 = targetShape
                  reverse = false
                } else {
                  point1 = targetPoint
                  point2 = sourcePoint
                  shape1 = targetShape
                  shape2 = sourceShape
                  reverse = true
                }
                points = getPointsWithS1T3(
                  point1,
                  point2,
                  shape1,
                  shape2,
                  distanceY
                )
              } else {
                if (
                  (sourceQuadrant === 2 && targetQuadrant === 4) ||
                  (sourceQuadrant === 4 && targetQuadrant === 2)
                ) {
                  if (sourceQuadrant === 2) {
                    point1 = sourcePoint
                    point2 = targetPoint
                    shape1 = sourceShape
                    shape2 = targetShape
                    reverse = false
                  } else {
                    point1 = targetPoint
                    point2 = sourcePoint
                    shape1 = targetShape
                    shape2 = sourceShape
                    reverse = true
                  }
                  points = getPointsWithS2T4(
                    point1,
                    point2,
                    shape1,
                    shape2,
                    distanceX
                  )
                } else {
                  if (
                    (sourceQuadrant === 1 && targetQuadrant === 2) ||
                    (sourceQuadrant === 2 && targetQuadrant === 1)
                  ) {
                    if (sourceQuadrant === 2) {
                      point1 = sourcePoint
                      point2 = targetPoint
                      shape1 = sourceShape
                      shape2 = targetShape
                      reverse = false
                    } else {
                      point1 = targetPoint
                      point2 = sourcePoint
                      shape1 = targetShape
                      shape2 = sourceShape
                      reverse = true
                    }
                    points = getPointsWithS1T2(point1, point2, shape1, shape2)
                  } else {
                    if (
                      (sourceQuadrant === 1 && targetQuadrant === 4) ||
                      (sourceQuadrant === 4 && targetQuadrant === 1)
                    ) {
                      if (sourceQuadrant === 4) {
                        point1 = sourcePoint
                        point2 = targetPoint
                        shape1 = sourceShape
                        shape2 = targetShape
                        reverse = false
                      } else {
                        point1 = targetPoint
                        point2 = sourcePoint
                        shape1 = targetShape
                        shape2 = sourceShape
                        reverse = true
                      }

                      points = getPointsWithS1T4(point1, point2, shape1, shape2)
                    } else {
                      if (
                        (sourceQuadrant === 2 && targetQuadrant === 3) ||
                        (sourceQuadrant === 3 && targetQuadrant === 2)
                      ) {
                        if (sourceQuadrant === 2) {
                          point1 = sourcePoint
                          point2 = targetPoint
                          shape1 = sourceShape
                          shape2 = targetShape
                          reverse = false
                        } else {
                          point1 = targetPoint
                          point2 = sourcePoint
                          shape1 = targetShape
                          shape2 = sourceShape
                          reverse = true
                        }

                        points = getPointsWithS2T3(
                          point1,
                          point2,
                          shape1,
                          shape2
                        )
                      } else {
                        if (
                          (sourceQuadrant === 3 && targetQuadrant === 4) ||
                          (sourceQuadrant === 4 && targetQuadrant === 3)
                        ) {
                          if (sourceQuadrant === 4) {
                            point1 = sourcePoint
                            point2 = targetPoint
                            shape1 = sourceShape
                            shape2 = targetShape
                            reverse = false
                          } else {
                            point1 = targetPoint
                            point2 = sourcePoint
                            shape1 = targetShape
                            shape2 = sourceShape
                            reverse = true
                          }

                          points = getPointsWithS3T4(
                            point1,
                            point2,
                            shape1,
                            shape2
                          )
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (reverse) {
        points.reverse()
      }
    } else {
      if (sourceRef != null || targetRef != null) {
        if (sourceRef != null) {
          point1 = sourcePoint
          point2 = targetPoint
          shape1 = sourceShape
          shape2 = targetShape
          reverse = false
          angle = sourcePoint.angle
        } else {
          point1 = targetPoint
          point2 = sourcePoint
          shape1 = targetShape
          shape2 = sourceShape
          reverse = true
          angle = targetPoint.angle
        }

        const bounds1 = shape1.plane.bounds

        if (angle >= pi / 4 && angle < (pi / 4) * 3) {
          if (point2.y < point1.y) {
            if (distanceX >= distanceY) {
              points.push({ x: point1.x, y: point2.y })
            } else {
              var z = distanceY / 2
              points.push({ x: point1.x, y: point1.y - z })
              points.push({ x: point2.x, y: point1.y - z })
            }
          } else {
            points.push({ x: point1.x, y: point1.y - r })
            if (distanceX >= distanceY) {
              if (
                point2.x >= bounds1.x - r &&
                point2.x <= bounds1.x + bounds1.width + r
              ) {
                var q = bounds1.x + bounds1.width / 2
                if (point2.x < q) {
                  points.push({ x: bounds1.x - r, y: point1.y - r })
                  points.push({ x: bounds1.x - r, y: point2.y })
                } else {
                  points.push({
                    x: bounds1.x + bounds1.width + r,
                    y: point1.y - r
                  })
                  points.push({ x: bounds1.x + bounds1.width + r, y: point2.y })
                }
              } else {
                if (point2.x < bounds1.x) {
                  points.push({ x: point2.x + r, y: point1.y - r })
                  points.push({ x: point2.x + r, y: point2.y })
                } else {
                  points.push({ x: point2.x - r, y: point1.y - r })
                  points.push({ x: point2.x - r, y: point2.y })
                }
              }
            } else {
              if (
                point2.x >= bounds1.x - r &&
                point2.x <= bounds1.x + bounds1.width + r
              ) {
                let shape1X = bounds1.x + bounds1.width / 2
                if (point2.x < shape1X) {
                  points.push({ x: bounds1.x - r, y: point1.y - r })
                  points.push({ x: bounds1.x - r, y: point2.y - r })
                  points.push({ x: point2.x, y: point2.y - r })
                } else {
                  points.push({
                    x: bounds1.x + bounds1.width + r,
                    y: point1.y - r
                  })
                  points.push({
                    x: bounds1.x + bounds1.width + r,
                    y: point2.y - r
                  })
                  points.push({ x: point2.x, y: point2.y - r })
                }
              } else {
                points.push({ x: point2.x, y: point1.y - r })
              }
            }
          }
        } else {
          if (angle >= (pi / 4) * 3 && angle < (pi / 4) * 5) {
            if (point2.x > point1.x) {
              if (distanceX >= distanceY) {
                points.push({ x: point1.x + distanceX / 2, y: point1.y })
                points.push({ x: point1.x + distanceX / 2, y: point2.y })
              } else {
                points.push({ x: point2.x, y: point1.y })
              }
            } else {
              points.push({ x: point1.x + r, y: point1.y })
              if (distanceX >= distanceY) {
                if (
                  point2.y >= bounds1.y - r &&
                  point2.y <= bounds1.y + bounds1.height + r
                ) {
                  let shape1Y = bounds1.y + bounds1.height / 2
                  if (point2.y < shape1Y) {
                    points.push({ x: point1.x + r, y: bounds1.y - r })
                    points.push({ x: point2.x + r, y: bounds1.y - r })
                    points.push({ x: point2.x + r, y: point2.y })
                  } else {
                    points.push({
                      x: point1.x + r,
                      y: bounds1.y + bounds1.height + r
                    })
                    points.push({
                      x: point2.x + r,
                      y: bounds1.y + bounds1.height + r
                    })
                    points.push({ x: point2.x + r, y: point2.y })
                  }
                } else {
                  points.push({ x: point1.x + r, y: point2.y })
                }
              } else {
                if (
                  point2.y >= bounds1.y - r &&
                  point2.y <= bounds1.y + bounds1.height + r
                ) {
                  let shape1Y = bounds1.y + bounds1.height / 2
                  if (point2.y < shape1Y) {
                    points.push({ x: point1.x + r, y: bounds1.y - r })
                    points.push({ x: point2.x, y: bounds1.y - r })
                  } else {
                    points.push({
                      x: point1.x + r,
                      y: bounds1.y + bounds1.height + r
                    })
                    points.push({
                      x: point2.x,
                      y: bounds1.y + bounds1.height + r
                    })
                  }
                } else {
                  if (point2.y < point1.y) {
                    points.push({ x: point1.x + r, y: point2.y + r })
                    points.push({ x: point2.x, y: point2.y + r })
                  } else {
                    points.push({ x: point1.x + r, y: point2.y - r })
                    points.push({ x: point2.x, y: point2.y - r })
                  }
                }
              }
            }
          } else {
            if (angle >= (pi / 4) * 5 && angle < (pi / 4) * 7) {
              if (point2.y > point1.y) {
                if (distanceX >= distanceY) {
                  points.push({ x: point1.x, y: point2.y })
                } else {
                  points.push({ x: point1.x, y: point1.y + distanceY / 2 })
                  points.push({ x: point2.x, y: point1.y + distanceY / 2 })
                }
              } else {
                points.push({ x: point1.x, y: point1.y + r })
                if (distanceX >= distanceY) {
                  if (
                    point2.x >= bounds1.x - r &&
                    point2.x <= bounds1.x + bounds1.width + r
                  ) {
                    let shape1X = bounds1.x + bounds1.width / 2
                    if (point2.x < shape1X) {
                      points.push({ x: bounds1.x - r, y: point1.y + r })
                      points.push({ x: bounds1.x - r, y: point2.y })
                    } else {
                      points.push({
                        x: bounds1.x + bounds1.width + r,
                        y: point1.y + r
                      })
                      points.push({
                        x: bounds1.x + bounds1.width + r,
                        y: point2.y
                      })
                    }
                  } else {
                    if (point2.x < bounds1.x) {
                      points.push({ x: point2.x + r, y: point1.y + r })
                      points.push({ x: point2.x + r, y: point2.y })
                    } else {
                      points.push({ x: point2.x - r, y: point1.y + r })
                      points.push({ x: point2.x - r, y: point2.y })
                    }
                  }
                } else {
                  if (
                    point2.x >= bounds1.x - r &&
                    point2.x <= bounds1.x + bounds1.width + r
                  ) {
                    let shape1X = bounds1.x + bounds1.width / 2
                    if (point2.x < shape1X) {
                      points.push({ x: bounds1.x - r, y: point1.y + r })
                      points.push({ x: bounds1.x - r, y: point2.y + r })
                      points.push({ x: point2.x, y: point2.y + r })
                    } else {
                      points.push({
                        x: bounds1.x + bounds1.width + r,
                        y: point1.y + r
                      })
                      points.push({
                        x: bounds1.x + bounds1.width + r,
                        y: point2.y + r
                      })
                      points.push({ x: point2.x, y: point2.y + r })
                    }
                  } else {
                    points.push({ x: point2.x, y: point1.y + r })
                  }
                }
              }
            } else {
              if (point2.x < point1.x) {
                if (distanceX >= distanceY) {
                  points.push({ x: point1.x - distanceX / 2, y: point1.y })
                  points.push({ x: point1.x - distanceX / 2, y: point2.y })
                } else {
                  points.push({ x: point2.x, y: point1.y })
                }
              } else {
                points.push({ x: point1.x - r, y: point1.y })
                if (distanceX >= distanceY) {
                  if (
                    point2.y >= bounds1.y - r &&
                    point2.y <= bounds1.y + bounds1.height + r
                  ) {
                    let shape1Y = bounds1.y + bounds1.height / 2
                    if (point2.y < shape1Y) {
                      points.push({ x: point1.x - r, y: bounds1.y - r })
                      points.push({ x: point2.x - r, y: bounds1.y - r })
                      points.push({ x: point2.x - r, y: point2.y })
                    } else {
                      points.push({
                        x: point1.x - r,
                        y: bounds1.y + bounds1.height + r
                      })
                      points.push({
                        x: point2.x - r,
                        y: bounds1.y + bounds1.height + r
                      })
                      points.push({ x: point2.x - r, y: point2.y })
                    }
                  } else {
                    points.push({ x: point1.x - r, y: point2.y })
                  }
                } else {
                  if (
                    point2.y >= bounds1.y - r &&
                    point2.y <= bounds1.y + bounds1.height + r
                  ) {
                    let shape1Y = bounds1.y + bounds1.height / 2
                    if (point2.y < shape1Y) {
                      points.push({ x: point1.x - r, y: bounds1.y - r })
                      points.push({ x: point2.x, y: bounds1.y - r })
                    } else {
                      points.push({
                        x: point1.x - r,
                        y: bounds1.y + bounds1.height + r
                      })
                      points.push({
                        x: point2.x,
                        y: bounds1.y + bounds1.height + r
                      })
                    }
                  } else {
                    if (point2.y < point1.y) {
                      points.push({ x: point1.x - r, y: point2.y + r })
                      points.push({ x: point2.x, y: point2.y + r })
                    } else {
                      points.push({ x: point1.x - r, y: point2.y - r })
                      points.push({ x: point2.x, y: point2.y - r })
                    }
                  }
                }
              }
            }
          }
        }
        if (reverse) {
          points.reverse()
        }
      } else {
        if (distanceX >= distanceY) {
          let x = (targetPoint.x - sourcePoint.x) / 2
          points.push({ x: sourcePoint.x + x, y: sourcePoint.y })
          points.push({ x: sourcePoint.x + x, y: targetPoint.y })
        } else {
          let y = (targetPoint.y - sourcePoint.y) / 2
          points.push({ x: sourcePoint.x, y: sourcePoint.y + y })
          points.push({ x: targetPoint.x, y: sourcePoint.y + y })
        }
      }
    }
  } else {
    // 弧线
    if (connection.linkerType === 'curve') {
      const distance = measureDistance(sourcePoint, targetPoint)
      var k = distance * 0.4
      points.push(getBezierCurce(sourcePoint, targetPoint, sourceRef, k))
      points.push(getBezierCurce(targetPoint, sourcePoint, targetRef, k))
    }
  }
  return points
}

/**
 * 获取连线中间点
 * @param {*} shape
 */
const getConnectionMidpoint = shape => {
  const midpoint = {}

  const { waypoint } = shape.plane
  const sourcePoint = waypoint[0]
  const targetPoint = waypoint[waypoint.length - 1]

  if (shape.linkerType === 'normal') {
    midpoint.x = 0.5 * sourcePoint.x + 0.5 * targetPoint.x
    midpoint.y = 0.5 * sourcePoint.y + 0.5 * targetPoint.y
  } else {
    if (shape.linkerType === 'curve') {
      midpoint.x =
        sourcePoint.x * 0.125 +
        shape.points[0].x * 0.375 +
        shape.points[1].x * 0.375 +
        targetPoint.x * 0.125
      midpoint.y =
        sourcePoint.y * 0.125 +
        shape.points[0].y * 0.375 +
        shape.points[1].y * 0.375 +
        targetPoint.y * 0.125
    } else {
      let points = []
      points.push(sourcePoint)
      points = points.concat(shape.points)
      points.push(targetPoint)
      let distanceTotal = 0
      for (let i = 1; i < points.length; i += 1) {
        distanceTotal += measureDistance(points[i - 1], points[i])
      }
      const distanceHalf = distanceTotal / 2
      let distanceItem = 0
      for (let i = 1; i < points.length; i += 1) {
        const point1 = points[i - 1]
        const point2 = points[i]
        let distance = distanceItem + measureDistance(point1, point2)
        if (distance > distanceHalf) {
          const midDistance = (distanceHalf - distanceItem) / distance
          midpoint.x = (1 - midDistance) * point1.x + midDistance * point2.x
          midpoint.y = (1 - midDistance) * point1.y + midDistance * point2.y
          break
        }
        distanceItem = distance
      }
    }
  }
  return midpoint
}

/**
 *
 * @param {*} shape
 * @param {*} type
 */
const getEndpointAngle = (shape, type) => {
  const { sourceRef, targetRef } = shape.data
  const { waypoint } = shape.plane
  const sourcePoint = waypoint[0]
  const targetPoint = waypoint[waypoint.length - 1]

  let point1, point2

  if (shape.linkerType === 'normal') {
    if (type === 'source') {
      point1 = targetPoint
    } else {
      point1 = sourcePoint
    }
  } else {
    if (shape.linkerType === 'broken') {
      if (type === 'source') {
        point1 = shape.points[0]
      } else {
        point1 = shape.points[shape.points.length - 1]
      }
    } else {
      const aWidth = 12
      const distance = measureDistance(sourcePoint, targetPoint)
      let proportion
      if (type === 'source') {
        proportion = aWidth / distance
      } else {
        proportion = 1 - aWidth / distance
      }
      point1 = {
        x:
          (1 - proportion) *
            (1 - proportion) *
            (1 - proportion) *
            sourcePoint.x +
          3 *
            (1 - proportion) *
            (1 - proportion) *
            proportion *
            shape.points[0].x +
          3 * (1 - proportion) * proportion * proportion * shape.points[1].x +
          proportion * proportion * proportion * targetPoint.x,
        y:
          (1 - proportion) *
            (1 - proportion) *
            (1 - proportion) *
            sourcePoint.y +
          3 *
            (1 - proportion) *
            (1 - proportion) *
            proportion *
            shape.points[0].y +
          3 * (1 - proportion) * proportion * proportion * shape.points[1].y +
          proportion * proportion * proportion * targetPoint.y
      }
    }
  }

  if (type === 'source') {
    point2 = sourcePoint
  } else {
    point2 = targetPoint
  }
  return getAngle(point1, point2)
}

/**
 *
 * @param {*} element
 */
const getConnectionLinePoints = element => {
  const { plane, shape } = element
  let points = []
  if (shape.linkerType !== 'curve') {
    points.push(plane.waypoint[0])
    points = points.concat(shape.points)
  } else {
    let step = 0.05
    let num = 0
    while (num <= 1) {
      const point = {
        x:
          (1 - num) * (1 - num) * (1 - num) * shape.points[0].x +
          3 * (1 - num) * (1 - num) * num * shape.points[1].x +
          3 * (1 - num) * num * num * shape.points[2].x +
          num * num * num * shape.points[shape.points.length - 1].x,
        y:
          (1 - num) * (1 - num) * (1 - num) * shape.points[0].y +
          3 * (1 - num) * (1 - num) * num * shape.points[1].y +
          3 * (1 - num) * num * num * shape.points[2].y +
          num * num * num * shape.points[shape.points.length - 1].y
      }
      points.push(point)
      num += step
    }
  }
  points.push(plane.waypoint[plane.waypoint.length - 1])
  return points
}

const getConnectionBox = element => {
  const points = getConnectionLinePoints(element)
  let sourceX = points[0].x
  let sourceY = points[0].y
  let targetX = points[0].x
  let targetY = points[0].y
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i]
    if (point.x < sourceX) {
      sourceX = point.x
    } else {
      if (point.x > targetX) {
        targetX = point.x
      }
    }
    if (point.y < sourceY) {
      sourceY = point.y
    } else {
      if (point.y > targetY) {
        targetY = point.y
      }
    }
  }
  const box = {
    x: sourceX,
    y: sourceY,
    width: targetX - sourceX,
    height: targetY - sourceY
  }
  return box
}

/**
 *
 * @param {*} elements
 */
const getOutConnections = elements => {
  const connections = []
  const ids = []
  const selectIds = eventBus.trigger('shape.select.getIds')
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i]
    if (element.shape.bpmnName !== 'SequenceFlow') {
      const connectionIds = eventBus.trigger('connections.get', element.data.id)
      if (connectionIds && connectionIds.length > 0) {
        for (let j = 0; j < connectionIds.length; j += 1) {
          const connectionId = connectionIds[j]
          if (
            !(selectIds.indexOf(connectionId) >= 0) &&
            ids.indexOf(connectionId) < 0
          ) {
            connections.push(eventBus.trigger('element.get', connectionId))
            ids.push(connectionId)
          }
        }
      }
    }
  }
  return connections
}

const getSelectedConnectionIds = () => {
  const selects = eventBus.trigger('shape.select.get')

  const ids = []
  for (let i = 0; i < selects.length; i += 1) {
    const element = selects[i]
    if (element.shape.bpmnName === 'SequenceFlow') {
      ids.push(element.data.id)
    }
  }
  return ids
}

/**
 *
 * @param {*} $container
 * @param {*} id
 * @param {*} x
 * @param {*} y
 * @param {*} padding
 */
const getPointAngle = ($container, id, x, y, padding) => {
  const $shape = $container.find('.shape-box[data-id="' + id + '"]')
  const shapePos = $shape.position()
  const $shapeCanvas = $shape.find('.shape-canvas')
  const shape2D = $shapeCanvas[0].getContext('2d')

  x = setScale(x) - shapePos.left
  y = setScale(y) - shapePos.top

  const points = getCirclePoints(x, y, padding)
  const length = points.length
  let inPath = false
  for (let i = 0; i < length; i += 1) {
    const point = points[i]
    if (shape2D.isPointInPath(point.x, point.y)) {
      point.inPath = true
      inPath = true
    } else {
      point.inPath = false
    }
  }
  if (inPath === false) {
    return null
  }

  let forward = null
  let next = null
  for (let i = 0; i < length; i += 1) {
    const point = points[i]
    if (!point.inPath) {
      if (forward == null) {
        if (points[(i - 1 + length) % length].inPath) {
          forward = point.angle
        }
      }
      if (next == null) {
        if (points[(i + 1 + length) % length].inPath) {
          next = point.angle
        }
      }
      if (forward != null && next != null) {
        break
      }
    }
  }
  const angle =
    (forward + ((Math.PI * 2 + next - forward) % (Math.PI * 2)) / 2) %
    (Math.PI * 2)
  return angle
}

/**
 * 获取相对坐标
 * @param {*} x
 * @param {*} y
 * @param {*} elm
 */
const getRelativePos = (x, y, $elm, $layout) => {
  const offset = $elm.offset()
  const position = $elm.children().position()
  if (offset == null) {
    offset.left = 0
    offset.top = 0
  }
  return {
    x: x - offset.left + Math.abs(position.left),
    y: y - offset.top + Math.abs(position.top)
  }
}

/**
 * 获取旋转后图形盒子位置数据
 * @param {*} data
 * @param {*} angle
 * @param {*} center
 */
const getRotatedBox = (data, angle, center) => {
  if (angle === 0) {
    return data
  } else {
    if (!center) {
      center = { x: data.x + data.width / 2, y: data.y + data.height / 2 }
    }
    const lt = getRotated(center, { x: data.x, y: data.y }, angle)
    const rt = getRotated(center, { x: data.x + data.width, y: data.y }, angle)
    const rb = getRotated(
      center,
      { x: data.x + data.width, y: data.y + data.height },
      angle
    )
    const lb = getRotated(center, { x: data.x, y: data.y + data.height }, angle)

    const x = Math.min(lt.x, rt.x, rb.x, lb.x)
    const y = Math.min(lt.y, rt.y, rb.y, lb.y)
    const width = Math.max(lt.x, rt.x, rb.x, lb.x) - x
    const height = Math.max(lt.y, rt.y, rb.y, lb.y) - y

    return { x, y, width, height }
  }
}

/**
 * 获取多个元素的整体范围
 * @param {*} ids
 */
const getElementsBox = ids => {
  const size = { x1: null, y1: null, x2: null, y2: null }
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i]
    const element = eventBus.trigger('element.get', id)
    const { data, plane, shape } = element

    let shapeBoxSize

    if (shape.bpmnName === 'SequenceFlow') {
      shapeBoxSize = getConnectionBox(element)
    } else {
      shapeBoxSize = getShapeBox(element)
    }
    if (size.x1 == null || shapeBoxSize.x < size.x1) {
      size.x1 = shapeBoxSize.x
    }
    if (size.y1 == null || shapeBoxSize.y < size.y1) {
      size.y1 = shapeBoxSize.y
    }
    if (size.x2 == null || shapeBoxSize.x + shapeBoxSize.width > size.x2) {
      size.x2 = shapeBoxSize.x + shapeBoxSize.width
    }
    if (size.y2 == null || shapeBoxSize.y + shapeBoxSize.height > size.y2) {
      size.y2 = shapeBoxSize.y + shapeBoxSize.height
    }
  }

  const box = {
    x: size.x1,
    y: size.y1,
    width: size.x2 - size.x1,
    height: size.y2 - size.y1
  }

  return box.x ? box : null
}

/**
 * 获取旋转后点位置
 * @param {*} center
 * @param {*} position
 * @param {*} angle
 */
const getRotated = (center, position, angle) => {
  const distance = measureDistance(center, position)
  if (distance === 0 || angle === 0) {
    return position
  }
  let atan = Math.atan(
    Math.abs(position.x - center.x) / Math.abs(center.y - position.y)
  )
  if (position.x >= center.x && position.y >= center.y) {
    atan = Math.PI - atan
  } else {
    if (position.x <= center.x && position.y >= center.y) {
      atan = Math.PI + atan
    } else {
      if (position.x <= center.x && position.y <= center.y) {
        atan = Math.PI * 2 - atan
      }
    }
  }
  atan = atan % (Math.PI * 2)
  // TODO:
  const xx = (atan + angle) % (Math.PI * 2)
  return {
    x: center.x + Math.sin(xx) * distance,
    y: center.y - Math.cos(xx) * distance
  }
}

/**
 * 获取图形盒子位置数据
 * @param {*} element
 */
const getShapeBox = element => {
  const { plane, shape } = element
  return getRotatedBox(plane.bounds, shape.shapeStyle.angle)
}

/**
 * 根据位置获取图形
 * @param {*} data
 */
const getShapeByPosition = (mouseX, mouseY, $container, xx) => {
  const items = []
  const elements = eventBus.trigger('element.get')
  for (let id in elements) {
    const element = elements[id]
    const { data, plane, shape } = element
    const $shape = $container.find('.shape-box[data-id="' + data.id + '"]')
    const position = $shape.position()
    const x = mouseX - position.left
    const y = mouseY - position.top
    let padding, mouseSize
    let shapePos = {
      x: position.left,
      y: position.top,
      width: $shape.width(),
      height: $shape.height()
    }

    const $shapeCanvas = $shape.find('.shape-canvas')
    const shape2D = $shapeCanvas[0].getContext('2d')

    const inRect = pointInRect(mouseX, mouseY, shapePos)

    if (shape.bpmnName === 'SequenceFlow') {
      if (!inRect) {
        continue
      }
      // TODO:
      if (xx) {
        continue
      }

      padding = setScale(10)
      mouseSize = {
        x: mouseX - padding,
        y: mouseY - padding,
        width: padding * 2,
        height: padding * 2
      }
      const sourcePoint = {
        x: plane.waypoint[0].x,
        y: plane.waypoint[0].y
      }
      const targetPoint = {
        x: plane.waypoint[plane.waypoint.length - 1].x,
        y: plane.waypoint[plane.waypoint.length - 1].y
      }

      if (
        pointInRect(setScale(targetPoint.x), setScale(targetPoint.y), mouseSize)
      ) {
        const targetData = { type: 'sequence_point', point: 'target', element }
        items.push(targetData)
        continue
      } else {
        if (
          pointInRect(
            setScale(sourcePoint.x),
            setScale(sourcePoint.y),
            mouseSize
          )
        ) {
          const sourceData = {
            type: 'sequence_point',
            point: 'source',
            element
          }
          items.push(sourceData)
          continue
        } else {
          const $text = $shape.find('.text-box')
          const textPos = $text.position()
          const textSize = {
            x: textPos.left,
            y: textPos.top,
            width: $text.width(),
            height: $text.height()
          }
          if (pointInRect(x, y, textSize)) {
            const textData = { type: 'sequence_text', element }
            items.push(textData)
            continue
          }

          padding = setScale(7)
          const inSequence = pointInSequence(
            { x: restoreScale(mouseX), y: restoreScale(mouseY) },
            element,
            padding
          )
          if (inSequence > -1) {
            items.push({
              type: 'sequence',
              element,
              pointIndex: inSequence
            })
            continue
          }
        }
      }
    } else {
      if (inRect && shape.locked && !xx) {
        if (shape2D.isPointInPath(x, y)) {
          items.push({ type: 'shape', element })
        }
        continue
      }

      padding = setScale(7)

      if (inRect) {
        mouseSize = {
          x: mouseX - padding,
          y: mouseY - padding,
          width: padding * 2,
          height: padding * 2
        }
        shapePos = {
          x: plane.bounds.x + plane.bounds.width / 2,
          y: plane.bounds.y + plane.bounds.height / 2
        }
        const anchors = shape.getAnchors()
        let boundData = null
        for (let i = 0; i < anchors.length; i += 1) {
          const anchor = getRotated(
            shapePos,
            {
              x: plane.bounds.x + anchors[i].x,
              y: plane.bounds.y + anchors[i].y
            },
            shape.shapeStyle.angle
          )
          if (pointInRect(setScale(anchor.x), setScale(anchor.y), mouseSize)) {
            anchor.angle = getPointAngle(
              $container,
              data.id,
              anchor.x,
              anchor.y,
              padding
            )
            boundData = { type: 'bounds', element, anchor }
            if (shape2D.isPointInPath(x, y)) {
              boundData.inPath = true
            }
            break
          }
        }
        if (boundData != null) {
          items.push(boundData)
          continue
        }
      }
      if (!inRect) {
        continue
      }

      if (shape2D.isPointInPath(x, y)) {
        if (xx) {
          const anchors = shape.getAnchors()
          if (anchors && anchors.length) {
            items.push({ type: 'shape', element })
            continue
          } else {
            continue
          }
        } else {
          items.push({ type: 'shape', element })
          continue
        }
      }
    }
  }

  let item = null
  if (items.length === 1) {
    item = items[0]
  }
  if (items.length > 1 && xx) {
    item = items[0]
  } else {
    if (items.length > 1) {
      if (
        items[0].type === 'bounds' &&
        items[0].type !== 'sequence_point' &&
        items[0].type !== 'sequence'
      ) {
        return items[0]
      }
      const sequences = []
      const sequencePoints = []
      const bounds = []
      for (let i = 0; i < items.length; i += 1) {
        var item2 = items[i]
        if (item2.type === 'bounds') {
          bounds.push(item2)
        } else {
          if (item2.type === 'sequence') {
            sequences.push(item2)
          } else {
            if (item2.type === 'sequence_point') {
              sequencePoints.push(item2)
            }
          }
        }
      }
      if (bounds.length > 0 && sequencePoints.length > 0) {
        for (var i = 0; i < bounds.length; i += 1) {
          if (bounds[i].inPath) {
            item = bounds[i]
            break
          }
        }
      }
      if (item == null && sequencePoints.length > 0) {
        sequencePoints.sort((item1, item2) => {
          if (
            eventBus.trigger('shape.select.check', item1.element.data.id) &&
            !eventBus.trigger('shape.select.check', item2.element.data.id)
          ) {
            return -1
          } else {
            if (
              !eventBus.trigger('shape.select.check', item1.element.data.id) &&
              eventBus.trigger('shape.select.check', item2.element.data.id)
            ) {
              return 1
            } else {
              return (
                item2.element.shape.shapeStyle.zindex -
                item1.element.shape.shapeStyle.zindex
              )
            }
          }
        })
        item = sequencePoints[0]
      }
      if (item == null && sequences.length > 0) {
        sequences.sort((item1, item2) => {
          if (
            eventBus.trigger('shape.select.check', item1.element.data.id) &&
            !eventBus.trigger('shape.select.check', item2.element.data.id)
          ) {
            return -1
          } else {
            if (
              !eventBus.trigger('shape.select.check', item1.element.data.id) &&
              eventBus.trigger('shape.select.check', item2.element.data.id)
            ) {
              return 1
            } else {
              return (
                item2.element.shape.shapeStyle.zindex -
                item1.element.shape.shapeStyle.zindex
              )
            }
          }
        })
        item = sequences[0]
      }
      if (item == null) {
        item = items[0]
      }
    }
  }
  return item
}

/**
 * 测量距离
 * @param {*} point1
 * @param {*} point2
 */
const measureDistance = (point1, point2) => {
  const distanceY = point2.y - point1.y
  const distanceX = point2.x - point1.x
  return Math.sqrt(Math.pow(distanceY, 2) + Math.pow(distanceX, 2))
}

/**
 * 设置虚线
 */
const setLineDash = (shape2D, segments) => {
  if (!shape2D.setLineDash) {
    shape2D.setLineDash = function() {}
  }
  shape2D.setLineDash(segments)
  shape2D.mozDash = segments
  shape2D.webkitLineDash = segments
}

/**
 * 判断点是否在矩形上
 */
const pointInRect = (x, y, pos) => {
  if (
    x >= pos.x &&
    x <= pos.x + pos.width &&
    y >= pos.y &&
    y <= pos.y + pos.height
  ) {
    return true
  }
  return false
}

/**
 *
 * @param {*} pos
 * @param {*} element
 * @param {*} padding
 */
const pointInSequence = (pos, element, padding) => {
  const points = getConnectionLinePoints(element)
  const left = { x: pos.x - padding, y: pos.y }
  const right = { x: pos.x + padding, y: pos.y }
  const bottom = { x: pos.x, y: pos.y - padding }
  const top = { x: pos.x, y: pos.y + padding }
  for (let i = 1; i < points.length; i += 1) {
    const forwardPoint = points[i - 1]
    const point = points[i]
    let isCross = checkCross(left, right, forwardPoint, point)
    if (isCross) {
      return i
    }
    isCross = checkCross(bottom, top, forwardPoint, point)
    if (isCross) {
      return i
    }
  }
  return -1
}

/**
 *
 * @param {*} pos1
 * @param {*} pos2
 * @param {*} point1
 * @param {*} point2
 */
const checkCross = (pos1, pos2, point1, point2) => {
  let inCross = false
  let xx =
    (pos2.x - pos1.x) * (point2.y - point1.y) -
    (pos2.y - pos1.y) * (point2.x - point1.x)
  if (xx !== 0) {
    let a =
      ((pos1.y - point1.y) * (point2.x - point1.x) -
        (pos1.x - point1.x) * (point2.y - point1.y)) /
      xx
    let b =
      ((pos1.y - point1.y) * (pos2.x - pos1.x) -
        (pos1.x - point1.x) * (pos2.y - pos1.y)) /
      xx
    if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
      inCross = true
    }
  }
  return inCross
}

/**
 *
 * @param {*} rang
 * @param {*} point
 */
const checkRang = (rang, point) => {
  let inRang = false
  if (point.x > rang.x && point.x < rang.x + rang.width) {
    inRang = true
  } else {
    inRang = false
  }
  if (point.y > rang.y && point.y < rang.y + rang.height) {
    inRang = true
  } else {
    inRang = false
  }
  return inRang
}

export default {
  getAngle,
  getAngleDir,
  getBounding,
  getConnectionLength,
  getConnectionMidpoint,
  getConnectionPoints,
  getEndpointAngle,
  getElementsBox,
  getElementIdsByRange,
  getConnectionBox,
  getLighterColor,
  getDarkerColor,
  getDarkestColor,
  getOutConnections,
  getPointAngle,
  getRelativePos,
  getRotated,
  getRotatedBox,
  getSelectedConnectionIds,
  getShapeByPosition,
  getShapeBox,
  checkRang,
  measureDistance,
  setLineDash
}
