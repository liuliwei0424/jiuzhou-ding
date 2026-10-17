## 概述

P2 Day 1–2 资产交付：三足圆鼎主模型 + 九鼎变体 + 程序化青铜纹理 + 热点坐标清单 + 资产台账。

> **所有模型与纹理均为艺术复原示意，非考古还原。** 详见 `docs/ASSET-SOURCES.md`。

## 变更内容

### 新增

| 文件 | 说明 |
|---|---|
| `scripts/build_ding.py` | 参数化建模/贴图/导出脚本，可在 Blender 5.x 下完整复现全部资产 |
| `public/models/ding-base.glb` | MVP 主模型，13.6k 三角面，1024² 纹理 |
| `public/models/ding-base-lod1.glb` | 移动端 LOD：9.1k 面，512² |
| `public/models/ding-{ji,yan,qing,xu,yang,jing,yu,liang,yong}.glb` | 九鼎变体，按州区分尺寸 / 锈蚀 / 纹饰行数 / 铭文种子 |
| `public/textures/ding-*-basecolor.png`、`ding-*-orm.png` | 程序化青铜 + 铜绿贴图（ORM 按 glTF 约定 R=AO/G=Roughness/B=Metallic） |
| `docs/assets/previews/ding-{front,three-quarter,side,top}.png` | Cycles 预览图，供形制人工审核 |
| `docs/ASSET-SOURCES.md` | 资产台账：来源、许可、艺术复原说明、对照器物史料出处 |
| `docs/ASSET-HANDOFF-P3.md` | P3 接入说明：坐标、加载、热点、材质、性能建议 |
| `data/assets/ding-manifest.json` | 机器可读资产清单与 9 个热点坐标 |

### 修改

- 无（本次未改动 `src/`、`docs/CONTRACT.md`、`data/schema/zhou.schema.json`）

## 契约符合性

- [x] 格式：`.glb`（glTF 2.0 二进制），位于 `public/models/`
- [x] 坐标：+Y 向上、单位米、**原点在足底中心**（底面已实测归零，脚本内保证）
- [x] 缩放已烘焙进顶点，P3 直接加载即可，不需二次校正
- [x] 文件名小写 kebab-case
- [x] 每个模型含 UV、单一材质、贴图内嵌 GLB
- [x] 提供 9 个热点坐标与建议拾取半径
- [x] 提供 LOD1 简化版

## 验证方式

```sh
npm ci
npm run build          # 通过，无错误
```

GLB 结构校验（自建脚本）：11 个文件均为 glTF v2、含 2 张内嵌图 / 1 材质 / 8 个 primitive、全部带 `TEXCOORD_0`，包围盒底面 y≈0。

## 权利与合规

- 未使用任何第三方模型、贴图、HDRI、字体或参考图；全部由本项目脚本程序化生成。
- 铭文为抽象笔画，不构成可释读文字；雷纹为装饰性仿纹。
- 对照器物数据（后母戊鼎、二里头网格纹铜鼎）仅用于说明，未参与建模，出处见台账 §6。

## 待人工处理

- [ ] **本机无 git 可执行文件**，分支 `asset/p2-ding` 的提交 / 推送需在装有 git 的终端完成，命令见台账 §9
- [ ] 推送前确认 GitHub LFS 配额（本次新增约 13 MB）
- [ ] 请 P1 审核形制与文案（重点：`docs/ASSET-SOURCES.md` §4 的复原声明、§6 的史料表述）

## 变更规模

约 +13 MB 二进制资产、1 个生成脚本（约 700 行）、3 份文档、1 份 manifest。
