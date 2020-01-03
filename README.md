# BPDCore v1.1.0-beta.5 使用文档

BPD-Core 是 web 形式的 bpmn 设计器，BPD-Core 仅提供建模和渲染， 不提供相应页面

![npm](https://img.shields.io/npm/v/bpd-core?style=flat-square) ![npm](https://img.shields.io/npm/dm/bpd-core?style=flat-square)

演示: [demo](https://ctank.github.io/bpd-core/dist/index.html)

<div align="left">
	<img title="preview" src="./docs/images/preview.gif"  >
</div>

## 项目目录

- `[build]`webpack
  - `build.js`
  - `check-versions.js`
  - `webpack.config.js`
  - `webpack.config.server.js`
- `[src]`源码
  - `[assets]`资源
  - `[core]`核心
  - `[draw]`绘图
  - `[features]`功能
    - `[anchor]`锚点
    - `[background]`背景
    - `[clipboard]`剪贴板(仅支持复制粘贴)
    - `[direction]`流向
    - `[drag]`拖拽
    - `[edit-name]`修改名称
    - `[group-panel]`分组面板
    - `[hand]`画布拖拽
    - `[hotkey]`快捷键
    - `[i18n]`国际化
    - `[record]`操作记录
    - `[select]`选择
    - `[snapline]`参考线
    - `[tooltip]`提示
    - `[xml]`
  - `[utils]`工具
- `[static]`静态文件
- `.babelrc`
- `.editorconfig`
- `.eslintignore`
- `.eslintrc.js`
- `.gitignore`
- `.postcssrc.js`
- `_config.yml`
- `package.json`
- `readme.md`

## 安装

使用 npm 安装

```
npm install bpd-core --save
```

## 引入

```javascript
import BPDCore from 'bpd-core'
import 'bpd-core/dist/css/bpd-core.css';
```

## 初始化

```js
new BPDCore({
  container: '#canvas',
  readonly: true,
  extensions: {
      t: Extension
  },
  filter: ['ServiceTask'],
  ...
})
```

## 键盘操作

| 操作   | 说明 |
| ------ | ---- |
| Ctrl+Z | 撤销 |
| Ctrl+Y | 重做 |
| Ctrl+C | 复制 |
| Ctrl+V | 粘贴 |

## 配置

| 参数       | 说明                         | 类型                      | 默认值  |
| ---------- | ---------------------------- | ------------------------- | ------- |
| container  | 容器                         | string                    | -       |
| definition | 流程定义(xml)                | string                    | default |
| readonly   | 只读                         | boolean                   | false   |
| extensions | 扩展属性(参考 extensions.js) | { key: json }             | -       |
| filter     | 需要过滤的节点类型           | [bpmnName]                | []      |
| local      | 国际化                       | "zh_CN"\|"zh_TW"\|"en_US" | zh_CN   |
| bpmnStyle  | 节点样式                     | {bpmnName: {}}            | -       |
| shapeStyle | 特定节点样式                 | [{nodeId, fillStyle}]     | -       |
| config     | 功能配置                     | {}                        | -       |

## 功能配置

#### 锚点(anchor)

| 参数  | 说明 | 类型   | 默认值  |
| ----- | ---- | ------ | ------- |
| size  | 尺寸 | number | 8       |
| color | 颜色 | string | #ec5343 |

#### 背景(background)

| 参数 | 说明     | 类型    | 默认值 |
| ---- | -------- | ------- | ------ |
| show | 显示     | boolean | true   |
| size | 网关间距 | number  | 15     |

#### 剪贴板(clipboard)

| 参数   | 说明           | 类型            | 默认值 |
| ------ | -------------- | --------------- | ------ |
| filter | 节点类型黑名单 | array[bpmnName] | []     |
| suffix | 粘贴名称后缀   | string          | ''     |

#### 修改名称(edit-name)

| 参数        | 说明             | 类型                | 默认值  |
| ----------- | ---------------- | ------------------- | ------- |
| borderColor | 文本框边框颜色   | string              | #999999 |
| onEdited    | 编辑完成回调事件 | function(shapeData) | -       |

#### 分组面板(group-panel)

| 参数   | 说明         | 类型   | 默认值 |
| ------ | ------------ | ------ | ------ |
| width  | 图形画布宽度 | number | 30     |
| height | 图形画布高度 | number | 30     |

#### 选择(select)

| 参数       | 说明     | 类型                | 默认值  |
| ---------- | -------- | ------------------- | ------- |
| color      | 选中颜色 | string              | #ec5343 |
| onSelected | 选中方法 | function(shapeData) | -       |

## API

| 名称                    | 说明                           | 参数                | 备注                          |
| ----------------------- | ------------------------------ | ------------------- | ----------------------------- |
| init                    | 初始化设计器                   | callback            | 回调函数                      |
| destroy                 | 销毁设计器                     | -                   | -                             |
| createShape             | 创建图形                       | event,callback      | {bpmnName: 节点名称},回调函数 |
| getAllElement           | 获取全部元素                   | -                   | return [shapeData]            |
| getRootElement          | 获取根元素                     | -                   | return processData            |
| getFrontElement         | 获取选中元素之前的元素         | element             | return shapeData              |
| getFrontElements        | 获取选中元素之前的全部元素     | element             | return [shapeData]            |
| getFrontElementsByBpmn  | 根据类型获取选中元素之前的元素 | element,bpmnName    | return [shapeData]            |
| handleClipboardEvent    | 触发剪贴板事件                 | 'copy' \|\| 'paste' | -                             |
| updateProperties        | 更新元素属性                   | shapeId,data        | 目前仅支持标题和扩展属性      |
| updateProcessProperties | 更新流程属性                   | data                | 目前仅支持标题和扩展属性      |
| updataLineStyle         | 更新图形边框颜色               | id, style           | -                             |
| activateSelect          | 激活选择模式                   | -                   | -                             |
| destroy                 | 销毁设计器                     | -                   | -                             |
| importBpmn              | 导入解析 xml 文件              | xml,callback        | 回调函数                      |
| exportBpmn              | 导出 xml                       | callback            | 回调函数                      |

## 数据结构(shapeData)

```js
{
  // 节点类型
  "bpmnName": "StartEvent",
  // 扩展属性
  "extensions": [
    {
      "name": "t:test1",
      "value": "测试1"
    }
  ],
  // 分组类型
  "groupName": "StartEvent",
  // id
  "id": "obj_1n567qa",
  //
  "name": "test"
}
```

## 支持节点

| 名称       | bpmnName          | groupName    |
| ---------- | ----------------- | ------------ |
| 开始事件   | StartEvent        | StartEvent   |
| 用户任务   | UserTask          | Task         |
| 系统任务   | ServiceTask       | Task         |
| 排他网关   | ExclusiveGateway  | Gateway      |
| 包容网关   | InclusiveGateway  | Gateway      |
| 复杂网关   | ComplexGateway    | Gateway      |
| 并行网关   | ParallelGateway   | Gateway      |
| 调用子流程 | CallActivity      | CallActivity |
| 结束事件   | EndEvent          | EndEvent     |
| 终止事件   | TerminateEndEvent | EndEvent     |
| 连线       | SequenceFlow      | -            |

## 其他

详细 demo 代码参考 static/index.html

## 未来

- ~~操作记录~~
- 其他快捷键



## 鸣谢

[moddle-xml](https://github.com/bpmn-io/moddle-xml)

[processon](https://www.processon.com)