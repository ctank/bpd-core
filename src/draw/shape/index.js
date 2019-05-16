import EndEvent from './EndEvent'
import StartEvent from './StartEvent'
import UserTask from './UserTask'
import ServiceTask from './ServiceTask'
import TerminateEndEvent from './TerminateEndEvent'
import ExclusiveGateway from './ExclusiveGateway'
import InclusiveGateway from './InclusiveGateway'
import ParallelGateway from './ParallelGateway'
import ComplexGateway from './ComplexGateway'
import CallActivity from './CallActivity'

import eventBus from '../../core/eventBus'

const group = {
  StartEvent: ['StartEvent'],
  Task: ['UserTask', 'ServiceTask'],
  CallActivity: ['CallActivity'],
  Gateway: [
    'ExclusiveGateway',
    'InclusiveGateway',
    'ParallelGateway',
    'ComplexGateway'
  ],
  EndEvent: ['EndEvent', 'TerminateEndEvent']
}

export const init = () => {
  eventBus.on('group.get', groupName => {
    if (groupName) {
      return group[groupName]
    }
    return group
  })
}

export default {
  EndEvent,
  StartEvent,
  UserTask,
  ServiceTask,
  TerminateEndEvent,
  ExclusiveGateway,
  InclusiveGateway,
  ParallelGateway,
  ComplexGateway,
  CallActivity
}
