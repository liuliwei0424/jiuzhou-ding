# 九州鼎 3D 网页

四人小组的一周冲刺项目：以交互式 3D 网页展示九州与鼎的关联，并提供内容信息面板、时间轴和考古对照。

> **免责声明：本项目中的鼎模型及相关场景均为艺术复原示意，非考古还原。** 历史叙述与考古材料须附出处；不同学术解释应明确标注，不能把传说或文学记载表述为已证实的考古事实。

## 技术栈

- Vite：前端开发服务器与构建工具。
- Three.js：浏览器端 3D 场景、GLB 加载与交互。
- SVG：九州示意地图与点击区域。
- Git LFS：管理 GLB、纹理等大文件。

## 三器复原对照

`src/restoration.js` 提供二里头文化青铜鼎、曾侯乙墓青铜升鼎与海昏侯墓带盖铜鼎的可交互器形复原。三件器均以完整器形呈现，不包含拆解动画；支持旋转、缩放、自动旋转、重置视角和器形热点。

模型使用程序化几何重建，不依赖外部 GLB，便于持续校核耳、足、盖和纹样的接合位置。页面明确显示三件器的“已校核”与“尚未覆盖”事项，并说明曾侯乙、海昏侯部分为各自器物组合中的单件代表器，不能等同于整套器物的扫描复原。

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

- `main` 仅用于稳定版本，日常集成进入 `develop`。GitHub 已启用 `main` 分支保护：必须通过 Pull Request 合并，管理员也不能绕过。
- 所有改动先经 Pull Request，由 P1 审核后合并；保护规则不要求特定数量的批准审查。
- P2：`asset/p2-ding`；P3：`feat/p3-scene`；P4：`feat/p4-ui`。
- 每日提交个人分支并请求 P1 合并到 `develop`；合并前至少运行 `npm run build`。
- 大型二进制资产使用 Git LFS；提交来源、许可和艺术复原说明。

## 契约

参见 [`docs/CONTRACT.md`](docs/CONTRACT.md) 与 [`data/schema/zhou.schema.json`](data/schema/zhou.schema.json)。
