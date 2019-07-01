/**
 * 验证字体文件加载
 * @param font
 * @param callback
 */
export const loadFont = (font, callback = () => {}) => {
  let span = document.createElement('span')
  // 这几个字母和符号宽度比较容易变化
  span.innerHTML = '&#xe810;'
  // 设置为不可见，但可以测量宽度
  span.style.visibility = 'hidden'
  // 字体大小为 500px，如果宽度变化比较容易区分
  span.style.fontSize = '500px'
  // 添加到页面
  document.body.appendChild(span)
  // 获取宽度
  let widthNow = span.offsetWidth
  // 获取高度
  let heightNow = span.offsetHeight
  // 设置字体
  span.style.fontFamily = font
  // 每 0.05 秒检查一次是否加载
  let intervalCheck = setInterval(() => {
    // 宽度变化，说明字体被加载
    if (span.offsetWidth !== widthNow || span.offsetHeight !== heightNow) {
      clearInterval(intervalCheck)
      // 设置字体为
      // ele.css('font-family', font)
      // 移除 span
      document.body.removeChild(span)
      span = null
      callback()
    }
  }, 50)
}

/**
 * 判断是否function
 * @param {*} fn
 */
export const isFunc = fn => {
  return typeof fn === 'function'
}

/**
 * 首字母大小写转换
 * @param {*} str
 * @param {*} type
 */
export const convertFirstLetter = (str, type) => {
  if (type === 'uppercase') {
    return str.substring(0, 1).toUpperCase() + str.substring(1)
  } else {
    return str.substring(0, 1).toLowerCase() + str.substring(1)
  }
}

/**
 * 深拷贝
 * @param  {Object|Array} obj 需要深拷贝的对象
 * @return {Object|Array}     深拷贝出来的对象
 */
export const cloneDeep = obj => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 数组合并去重
 * @param {*} arr1
 * @param {*} arr2
 */
export const mergeArray = (array1, array2) => {
  const array = []
  const array3 = array1.concat(array2)

  for (let i = 0; i < array3.length; i++) {
    for (let j = i + 1; j < array3.length; j++) {
      if (array3[i] === array3[j]) {
        j = ++i
      }
    }
    array.push(array3[i])
  }
  return array
}

/**
 * 设置比例
 * @param {*} number
 * @param {*} scale
 */
export const setScale = (data, scale = 1) => {
  if (typeof data === 'object') {
    const newData = {}
    for (let key in data) {
      newData[key] = data[key]
      if (typeof data[key] === 'number') {
        newData[key] = setScale(newData[key], scale)
      }
    }
    return newData
  }
  return data * scale
}

/**
 * 恢复比例
 * @param {*} number
 * @param {*} scale
 */

export const restoreScale = (data, scale = 1) => {
  if (typeof data === 'object') {
    const newData = {}
    for (let key in data) {
      newData[key] = data[key]
      if (typeof data[key] === 'number') {
        newData[key] = restoreScale(newData[key], scale)
      }
    }
    return newData
  }
  return data / scale
}

/**
 * 获取bpmn名称
 * @param {*} type
 */
export const getBpmnNameByType = type => {
  if (type.indexOf(':') >= 0) {
    return type.substr(type.indexOf(':') + 1)
  }
  return ''
}

/**
 * canvas操作
 */
export const canvasActions = {
  font: function(canvas, data, shapeStyle) {
    const {
      fontStyle,
      fontVariant,
      fontWeight,
      fontSize,
      fontFamily,
      content,
      fontColor,
      textAlign,
      textBaseline,
      x,
      y
    } = data
    // 水平
    if (textAlign) {
      canvas.textAlign = textAlign
    }
    // 垂直
    if (textBaseline) {
      canvas.textBaseline = textBaseline
    }
    // 颜色
    if (shapeStyle.lineStyle && shapeStyle.lineStyle.lineColor) {
      canvas.fillStyle = rgba2hex(shapeStyle.lineStyle.lineColor)
    } else if (fontColor) {
      canvas.fillStyle = rgba2hex(fontColor)
    }
    canvas.font =
      fontStyle +
      ' ' +
      fontVariant +
      ' ' +
      fontWeight +
      ' ' +
      fontSize +
      ' ' +
      fontFamily

    //  绘制内容
    canvas.fillText(content, x, y)
  },
  move: function(canvas, position) {
    canvas.moveTo(position.x, position.y)
  },
  line: function(canvas, position) {
    canvas.lineTo(position.x, position.y)
  },
  curve: function(canvas, position) {
    canvas.bezierCurveTo(
      position.x1,
      position.y1,
      position.x2,
      position.y2,
      position.x,
      position.y
    )
  },
  quadraticCurve: function(canvas, position) {
    canvas.quadraticCurveTo(position.x1, position.y1, position.x, position.y)
  },
  close: function(canvas) {
    canvas.closePath()
  }
}

/**
 *
 * @param {*} bpmns
 * @param {*} filter
 * @param {*} type
 */
export const checkBpmnShape = (bpmns, filter, type) => {
  let support = ''
  bpmns.forEach((bpmn, index) => {
    if (filter.indexOf(bpmn) < 0) {
      support += bpmn + (index !== bpmns.length ? ',' : '')
    }
  })
  if (support.indexOf(type) === -1) {
    return true
  }
  return false
}

/**
 *
 * @param {*} bpmns
 * @param {*} filter
 * @param {*} type
 */
export const setExportData = element => {
  const exportData = {}

  if (!element) {
    return false
  }

  if (element.$type === 'bpmn:Process') {
    exportData.id = element.id
    exportData.extensions = setExportExtensions(
      element.extensionElements.values || []
    )
  } else {
    const { data, shape } = element
    exportData.bpmnName = shape.bpmnName
    exportData.groupName = shape.groupName
    for (let key in data) {
      switch (key) {
        case '$type':
          break
        case 'extensionElements':
          exportData.extensions = setExportExtensions(data[key].values || [])
          break
        default:
          exportData[key] = data[key]
          break
      }
    }
  }

  return exportData
}

/**
 *
 * @param {*} values
 */
export const setExportExtensions = values => {
  const extensions = []
  for (let i = 0; i < values.length; i += 1) {
    const item = Object.assign({}, cloneDeep(values[i]), values[i].$attrs)
    if (item.$type) {
      item.name = item.$type
      delete item.$type
    }
    extensions.push(item)
  }

  return extensions
}

const rgba2hex = color => {
  const values = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',')
  let a = parseFloat(values[3] || 1),
    r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
    g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
    b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255)
  return (
    '#' +
    ('0' + r.toString(16)).slice(-2) +
    ('0' + g.toString(16)).slice(-2) +
    ('0' + b.toString(16)).slice(-2)
  )
}
