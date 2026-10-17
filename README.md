# 九州鼎 3D 网页

四人小组的一周冲刺项目：以交互式 3D 网页展示九州与鼎的关联，并提供内容信息面板、时间轴和考古对照。

> **免责声明：本项目中的鼎模型及相关场景均为艺术复原示意，非考古还原。** 历史叙述与考古材料须附出处；不同学术解释应明确标注，不能把传说或文学记载表述为已证实的考古事实。

## 技术栈

- Vite：前端开发服务器与构建工具。
- Three.js：浏览器端 3D 场景、GLB 加载与交互。
- SVG：九州示意地图与点击区域。
- Git LFS：管理 GLB、纹理等大文件。

## 本地启动

建议 Node.js `22.12.0` 或更高的 22.x 版本。当前 Vite 官方指南要求 Node.js `20.19+` 或 `22.12+`。

```sh
npm install
npm run dev
npm run build
```

## 目录约定

- `src/`：网页源码。
- `public/models/`：GLB 模型（由 Git LFS 跟踪）。
- `public/textures/`：纹理资源（大文件由 Git LFS 跟踪）。
- `docs/`：契约、资产和协作说明。
- `data/`：九州内容数据及 Schema。

## 协作流程

- `main` 仅用于稳定版本，禁止直接 push；日常集成进入 `develop`。
- P2：`asset/p2-ding`；P3：`feat/p3-scene`；P4：`feat/p4-ui`。
- 每日提交个人分支并请求 P1 合并到 `develop`；合并前至少运行 `npm run build`。
- 大型二进制资产使用 Git LFS；提交来源、许可和艺术复原说明。

## 契约

参见 [`docs/CONTRACT.md`](docs/CONTRACT.md) 与 [`data/schema/zhou.schema.json`](data/schema/zhou.schema.json)。