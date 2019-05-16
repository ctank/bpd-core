import BpmnModel from './bpmn'

import BpmnPackage from './xmlns/bpmn.json'
import BpmnDiPackage from './xmlns/bpmndi.json'
import DcPackage from './xmlns/dc.json'
import DiPackage from './xmlns/di.json'

const packages = {
  bpmn: BpmnPackage,
  bpmndi: BpmnDiPackage,
  dc: DcPackage,
  di: DiPackage
}

export default (additionalPackages, options) => {
  const pks = Object.assign({}, packages, additionalPackages)
  return new BpmnModel(pks, options)
}
