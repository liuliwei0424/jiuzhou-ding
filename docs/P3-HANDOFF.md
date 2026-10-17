# P3 Day 0–1 对接说明

## 已接入的边界

- P3 只在 P4 提供的 `#scene-root` 挂载 Canvas；入口是 `src/scene/bootstrap.js` 的 `mountScene(root)`，返回 `{ dispose() }`。P4 修改页面结构时保留此挂载点，并在自己的入口渲染完成后调用 `mountScene`。
- 场景实现位于 `src/scene/SceneManager.js`，样式位于 `src/scene/scene.css`；CSS 仅作用于 `.scene-root` 内。`#side-panel` 的结构和数据展示仍由 P4 负责。
- Day 1 的点击拾取通过模块回调 `onPick({ name, part, point })` 显示调试反馈，不发布跨模块事件。Day 2/3 联动仍按 `docs/CONTRACT.md` 中由 P1 冻结的 `state:select`、`view:change`、`hotspot:select` 实现；需要 P1/P4 确认每个热点的稳定 ID 与省份对应关系。

## 模型交接

1. P2 将正式 GLB 置于 `public/models/ding-base.glb`，使用 Git LFS 提交；模型遵循 Y 轴向上、米、底部中心原点。
2. 当前场景先加载该路径；失败时加载 `p3-demo-ding.glb`，页面明确标注占位状态。P2 模型合入后无需修改路径。
3. P2 提供部件命名清单，以及制作、来源、许可、史料说明。P3 再复核浏览器中的方向、比例、材质、阴影和拾取命中。

## Day 0–1 验收

使用 Node.js 22.12.0 或更高 22.x：

```sh
npm ci
npm run dev
npm run build
```

浏览器内确认：单鼎可见；鼠标拖动可旋转、滚轮可缩放；单击鼎身、鼎耳、鼎足或纹饰后，下方出现命中部件和坐标。没有正式模型时，左上角应显示 P3 占位提示。P1 可据此审核当前 PR，并待 P2/P4 分支合并时按上述边界联调。
