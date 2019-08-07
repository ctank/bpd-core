import eventBus from '../../core/eventBus'
import ArrayStack from './arrayStack'

class Record {
  constructor() {
    // 处理数量
    this.batSize = 0
    // 记录集
    this.records = []
    // 撤销堆栈
    this.undoStack = new ArrayStack()
    // 重做堆栈
    this.redoStack = new ArrayStack()
    //
    this.init()
  }

  init() {
    // 绑定Ctrl+Z
    eventBus.trigger('key.bind', {
      key: 'Ctrl+Z',
      fun: this.undo.bind(this)
    })
    // 绑定Ctrl+Y
    eventBus.trigger('key.bind', {
      key: 'Ctrl+Y',
      fun: this.redo.bind(this)
    })
    // 开始处理
    eventBus.on('record.start', this.start.bind(this))
    // 结束处理
    eventBus.on('record.end', this.end.bind(this))
    // 添加
    eventBus.on('record.push', this.push.bind(this))
    // 执行
    eventBus.on('record.execute', this.execute.bind(this))
  }

  /**
   * 开始处理,修改数量
   */
  start() {
    this.batSize++
  }

  /**
   * 结束处理,执行堆栈操作
   */
  end() {
    this.batSize--
    this.execute()
  }

  /**
   * 添加记录
   * @param {*} data
   */
  push(data) {
    this.records.push(data)
    // 如果不是多任务则立即执行
    this.execute()
  }

  /**
   * 执行
   */
  execute() {
    if (this.batSize === 0 && this.records.length !== 0) {
      if (this.undoStack.status) {
        // 将事件压入撤销堆栈
        this.undoStack.push(this.records)
      }
      this.records = []
    }
  }

  /**
   * 撤销
   */
  undo() {
    console.log('Ctrl+Z')
    const undoSize = this.undoStack.size()
    if (undoSize > 0) {
      // 获取最新记录
      const record = this.undoStack.top()
      // 清除最新记录
      this.undoStack.pop()
      // 移入重做栈中
      this.redoStack.push(record)
      // 锁定撤销栈
      this.undoStack.setStatus(false)

      this.start()

      record.forEach(item => {
        switch (item.action) {
          case 'create':
            // 清除选择
            eventBus.trigger('shape.select.remove')
            // 移除图形
            eventBus.trigger('shape.remove', {
              elements: item.content,
              isRemove: false
            })
            break
          case 'update':
            const elements = item.content.elements
            // 更新数据
            eventBus.trigger('element.update', elements)
            for (let i = 0; i < elements.length; i += 1) {
              const element = elements[i]
              const type = element.shape.bpmnName
              // 重绘图形
              if (type === 'SequenceFlow') {
                eventBus.trigger('connection.render', { element })
              } else {
                eventBus.trigger('shape.render', { type, element })
              }
            }
            // 重新选中
            const ids = eventBus.trigger('shape.select.getIds')
            eventBus.trigger('shape.select.remove')
            eventBus.trigger('shape.select', { ids })
            break
          case 'remove':
            console.log('remove')
            eventBus.trigger('element.add', item.content)
            for (let i = 0; i < item.content.length; i += 1) {
              const element = item.content[i]
              const type = element.shape.bpmnName
              // 重绘图形
              if (type === 'SequenceFlow') {
                eventBus.trigger('connection.render', { element })
              } else {
                eventBus.trigger('shape.render', { type, element })
              }
            }
            break
          default:
            break
        }
      })

      this.end()
    }
  }

  /**
   * 重做
   */
  redo() {
    console.log('Ctrl+Y')
  }
}

export default Record
