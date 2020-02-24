### 时间框选组件
- Attributes

| 参数 | 类型 | 是否必须 | 说明  | 默认值  |
| --------  | ----- | --- | --- | --- |
| timeSetp | Number | 否 | 时间间隔(0.5 1 0.25)  | 0.5 |
| timeString | String | 否 | 时间字符串,对应时间间隔,如时间间隔为0.5 字符串为1和0组成的48 * 7位  | "00000...0000"(48*7位) |
| outCancel | Boolean | 否 | 框选到外部是否取消  | true |
| showResult | Boolean | 否 | 是否显示结果  | true |
| weekClickable | Boolean | 否 | 星期是否可点击  | true |
| timeClickable | Boolean | 否 | 顶部时间是否可点击  | true |
| comId | String | 否(同时存在多个必传) | 组件ID,同时存在多个时必传且不同 | scheduleComponent |

- Events

| 事件名 | 说明 | 回调参数 |
| -------- | ----- | ------ |
| result-change | 选中结果改变回调 | 选中结果[],例:[0,1,0,1,0...] |

- methods

| 方法名 | 说明 | 参数 | 返回值 |
| -------- | ----- | ------ |
| commonFn | 对外提供的方法 | - |
| -schedule2Time | 时间字符串转时间段 | scheduleTime 时间字符串,如 100010101(48位,1天的) | ["07:00","08:30"]的二维数组 |
| time2Schedule | 时间段数组转时间段字符串 | dateList 时间段数组 | ["05:00", "07:30"],["08:00", "24:00"]  转  "000000000011111011111111111111111111111111111111" |