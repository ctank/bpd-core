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
  }

  /**
   * 重做
   */
  redo() {
    console.log('Ctrl+Y')
  }
}

export default Record
