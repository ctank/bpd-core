import StartEvent from './StartEvent'
import eventBus from '../../core/eventBus'

class TimerStartEvent extends StartEvent {
  constructor(element, style = {}) {
    super(style)

    if (!element.data.name) {
      element.data.name =
        style.name || eventBus.trigger('i18n', 'bpmn.TimerStartEvent')
    }

    this.eventDefinitionType = 'TimerEventDefinition'
  }
}

export default TimerStartEvent
