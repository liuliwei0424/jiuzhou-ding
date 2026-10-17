# 项目契约 v1

## 内容数据

- 数据格式：UTF-8 JSON；结构校验使用 `data/schema/zhou.schema.json`（JSON Schema 2020-12）。
- `provinces` 固定为九条，使用 `ji/yan/qing/xu/yang/jing/yu/liang/yong` 作为稳定 ID；运行时和验收时另行检查 ID 唯一性。
- 每州需包含简介、今地说明、物产和至少一条文献出处。对传说、文献记载和考古发现分别表述，不把艺术复原表述成考古事实。
- `layoutPosition` 是网页示意场景坐标，不是历史地理坐标。需要 P1 审核对应关系。

## 3D 模型规范

- 交付格式优先 `.glb`（glTF 2.0 二进制容器），放入 `public/models/`。
- 坐标约定：Y 轴向上；单位按米理解；模型原点位于器物底部中心；导出后由 P3 在浏览器复核方向、比例与材质。
- 文件名使用小写 kebab-case，例如 `ding-base.glb`。资产记录制作人、来源、许可状态及“艺术复原示意，非考古还原”声明。
- 基础 MVP 先以一个基础鼎模型复制/调整位置；九鼎独立高模、拆解动画和 VR 不属于首要交付。

## UI 与场景事件

事件 payload 均为 JSON 可序列化对象。事件名称使用冒号分隔，`provinceId` 必须为九州稳定 ID。

- `state:select`：地图/列表/时间轴请求切换州。payload：`{ provinceId: string, source: "map" | "list" | "timeline" }`。P3 监听并更新当前场景；P4 监听并更新选中态和信息面板。
- `view:change`：P3 在镜头移动开始/结束时发布。payload：`{ provinceId: string, phase: "start" | "complete" }`。UI 可据此显示过渡状态。
- `hotspot:select`：3D 热点被选中时发布。payload：`{ provinceId: string, hotspotId: string }`。P4 据热点 ID 显示说明。

由 P1 管理的内容字段及事件名不得在各分支单方面改动；确需调整时先在群内同步并更新本契约。
