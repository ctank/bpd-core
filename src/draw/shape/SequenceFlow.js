import Base from './Base'

class SequenceFlow extends Base {
  constructor(element) {
    super()
    // bpmn数据
    this.data = element.data
    //
    this.plane = element.plane
    //
    this.bpmnName = 'SequenceFlow'
    //
    this.groupName = 'SequenceFlow'
    // 连线类型
    this.linkerType = 'broken'
    // 点集合
    this.points = []
    // 描边样式
    this.lineStyle = {
      lineWidth: 2,
      lineColor: '50,50,50',
      lineStyle: 'solid',
      beginArrowStyle: 'none',
      endArrowStyle: 'solidArrow'
    }
  }
}

export default SequenceFlow
