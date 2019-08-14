import eventBus from '../../core/eventBus'
import $ from '../../utils/slimJQ'
import { setScale, restoreScale } from '../../utils/utils'

const DEFAULT_CONFIG = {
  // 边框颜色
  borderColor: '#FF884D',
  // 修改名称回调
  onEdited: () => {}
}

class EditName {
  constructor($container, config) {
    this.$container = $container

    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    this.init()
  }

  init() {
    //
    eventBus.on('edit.shape.name', this.editShapeName.bind(this))
  }

  editShapeName() {
    const { $container, config } = this

    const selectIds = eventBus.trigger('shape.select.getIds') || []
    if (selectIds.length === 1) {
      const element = eventBus.trigger('element.get', selectIds[0])
      console.log(element)

      const { data, plane, shape } = element

      if (shape.bpmnName === 'SequenceFlow') {
        this.editConnectionName(element)
        return true
      }

      let $edit = $container.find('.shape-name-edit')
      if ($edit.length === 0) {
        $edit = $("<textarea class='shape-name-edit'></textarea>").appendTo(
          $container.find('.bpd-designer')
        )
      }

      let $temp = $container.find('.shape-name-temp')
      if ($temp.length === 0) {
        $temp = $("<textarea class='shape-name-temp'></textarea>").appendTo(
          $container.find('.bpd-designer')
        )
      }

      $('.text-box[data-shape=' + data.id + ']').hide()

      const fontStyle = shape.fontStyle
      const textBlock = shape.getTextBlock()
      const editStyle = {
        width: textBlock.width + 'px',
        'border-color': config.borderColor,
        'line-height': Math.round(fontStyle.size * 1.25) + 'px',
        'font-size': fontStyle.size + 'px',
        'font-family': fontStyle.fontFamily,
        'font-weight': fontStyle.bold ? 'bold' : 'normal',
        'font-style': fontStyle.italic ? 'italic' : 'normal',
        'text-align': fontStyle.textAlign,
        color: 'rgb(' + fontStyle.color + ')',
        'text-decoration': fontStyle.underline ? 'underline' : 'none'
      }

      $edit.css(editStyle).show()
      $temp.css(editStyle)
      textBlock.x += plane.bounds.x
      textBlock.y += plane.bounds.y
      $edit.val(data.name)

      $edit
        .off()
        .on('keyup', () => {
          $temp.val($edit.val())
          $temp.scrollTop(99999)
          const tempHeight = $temp.scrollTop()
          $edit.css({ height: tempHeight })

          const shapeTextPos = {
            x: textBlock.x + textBlock.width / 2,
            y: textBlock.y + textBlock.height / 2
          }
          let editPosY = 0
          let editPadding = 5
          let editPaddingTop = 0
          let textHeight = textBlock.height

          switch (fontStyle.vAlign) {
            case 'middle':
              if (tempHeight > textHeight) {
                textHeight = tempHeight
                editPosY = shapeTextPos.y - textHeight / 2 - editPadding
                editPaddingTop = 0
              } else {
                editPosY = shapeTextPos.y - textBlock.height / 2 - editPadding
                editPaddingTop = (textBlock.height - tempHeight) / 2
                textHeight = textBlock.height - editPaddingTop
              }
              break
            default:
              editPosY = shapeTextPos.y - textBlock.height / 2 + editPadding
              if (tempHeight > textHeight) {
                textHeight = tempHeight
              } else {
                textHeight = textBlock.height
              }
              break
          }
          const editHeight = editPadding * 2 + textHeight
          const editPos = {
            x: textBlock.x + textBlock.width / 2 - editPadding,
            y: editPosY + editHeight / 2
          }
          $edit.css({
            width: textBlock.width,
            height: textHeight,
            'padding-top': editPaddingTop,
            padding: editPadding,
            left: setScale(editPos.x) - textBlock.width / 2 - 1,
            top: setScale(editPos.y) - editHeight / 2 - 1
          })
        })
        .on('blur', e => {
          this.updateShapeName(element)
        })
        .on('mousemove', e => {
          e.stopPropagation()
        })
        .on('mousedown', e => {
          e.stopPropagation()
        })
        .on('mouseenter', e => {
          console.log('mouseenter')
        })

      $edit.trigger('keyup')
    }
  }

  editConnectionName(element) {}

  updateShapeName(element) {
    const { data } = element
    const $edit = this.$container.find('.shape-name-edit')
    const shapeName = $edit.val()
    if ($edit.length && $edit.is(':visible')) {
      if (shapeName !== data.name) {
        data.name = shapeName
        // Model.update(d)
      }
      // 渲染图形
      eventBus.trigger('shape.render', {
        type: element.shape.bpmnName,
        element
      })
      $edit.remove()
    }
  }
}

export default EditName
