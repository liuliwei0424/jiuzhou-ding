# P2 Day 1 验收清单（P2 ↔ P3 联合）

任务原文：**「配合 P3 验收：浏览器能加载模型，其他成员可 pull 到文件。」**

P2 侧能自证的部分已经做完；带 🔲 的是需要 P3 在你机器上执行的动作。

---

## 一、P2 已自证（无需 P3 动手）

| 项 | 证据 |
|---|---|
| 模型为合法 glTF 2.0 二进制 | 11 个 `.glb` 文件头均为 `glTF` 魔数，版本 2，可被解析 |
| 材质字段完整 | `bronze-patina`：`baseColorTexture` + `metallicRoughnessTexture` 均已内嵌（2 张 PNG） |
| UV 齐全 | 全部 primitive 带 `TEXCOORD_0` |
| 坐标符合契约 | +Y 向上、单位米、**底面实测 y = 0.000** |
| 缩放已烘焙 | 九鼎包围盒各不相同（总高 0.829–0.949 m），无需 P3 二次缩放 |
| 构建通过 | `npm run build` 成功，`dist/models/` 下 11 个 GLB 完整（`ding-base.glb` 1,351,444 字节，非 LFS 指针） |
| 服务器可访问 | dev server 下 `/models/ding-base.glb`、`/data/assets/ding-manifest.json`、`/verify.html` 均返回 200 |
| 验收页可用 | `verify.html` 已通过语法校验，含 5 项自动断言 |

## 二、🔲 P3 需要执行

```sh
# 1. 拉到资产（需先装 git-lfs，见下）
git fetch origin asset/p2-ding
git switch --track origin/asset/p2-ding   # 或用自己分支 cherry-pick
git lfs pull

# 2. 起服务
npm ci
npm run dev

# 3. 浏览器打开验收页
open http://localhost:5173/verify.html
```

> **前提：必须装 `git-lfs`**，否则拉下来的 `.glb` 只有 130 字节左右的指针文本，加载必然失败。
> macOS：`brew install git-lfs && git lfs install`
> 判断方法：`head -c 4 public/models/ding-base.glb` 应输出 `glTF`；若输出 `vers`（`version https://git-lfs...` 的开头）说明是指针文件。

### 验收页会给出的 5 项断言

1. 加载成功
2. 底面 Y ≈ 0（阈值 0.005 m）
3. 有 UV 坐标
4. 热点数量 = 9
5. 总高与 `ding-manifest.json` 记录一致（阈值 0.01 m）

全部 ✅ 即表示「浏览器能加载模型」通过。

## 三、🔲 交互验收（对着实际场景做）

| 项 | 期望 | 记录 |
|---|---|---|
| 旋转 | 拖动可 360° 环绕，无抖动 | 🔲 |
| 缩放 | 滚轮范围 0.6–6 m，放大不过穿 | 🔲 |
| 材质 | 青铜高光可见，铜绿区域无金属反光 | 🔲 |
| 阴影（可选） | 若开启 `castShadow`，足部接地有阴影 | 🔲 |
| 移动端 | 手机打开验收页，触控旋转/双指缩放正常 | 🔲 |
| 帧率 | 桌面 ≥ 55 fps、移动端 ≥ 30 fps（开 DevTools 性能面板看） | 🔲 |

## 四、常见问题对照

| 现象 | 原因 | 处理 |
|---|---|---|
| 模型全黑 / 发暗 | 场景没有环境光或环境贴图；`metallicFactor=1` 的金属在无环境时只能反射黑色 | 加 `RoomEnvironment`（官方 addons，MIT）或 `HemisphereLight` |
| 模型翻倒 | 契约是 **+Y 向上**；若你的相机/地面按 Z 向上搭的会躺倒 | 不要对 `gltf.scene` 加 `rotation.x = -Math.PI/2`，只修正地面即可 |
| 位置偏移 / 悬空 | 不要对 `gltf.scene` 再乘缩放或位移；原点已在足底中心 | 直接 `scene.add(gltf.scene)` |
| 贴图不显示 | 用了 `/public/models/...` 路径 | 应为 `/models/...` |
| 加载 404 | 没跑 `git lfs pull`，或文件是指针 | 见上文 LFS 判断方法 |
| 热点错位 | 把 manifest 的 `position` 当世界坐标用了 | 热点父级就是 `gltf.scene`，直接 `mesh.position.fromArray(hs.position)` |

## 五、验收结论回填

```
P3 验收人：____________    日期：____________
加载通过：是 / 否        验收页 5 项断言：___ / 5
交互通过：是 / 否        备注：____________
```

把这段发群里 @P1 即可，P1 据此放行合并到 `develop`。
