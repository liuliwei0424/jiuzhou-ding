# 给 P3 的资产接入说明（P2 → P3）

本文只讲「怎么把模型接进场景」，形制与权利说明见 [`ASSET-SOURCES.md`](./ASSET-SOURCES.md)，契约见 [`CONTRACT.md`](./CONTRACT.md)。

## 1. 文件在哪

```
public/models/ding-base.glb       # MVP 主模型（1024² 纹理，13.6k 三角面）
public/models/ding-base-lod1.glb  # 移动端 / 远景（512²，9.1k 三角面）
public/models/ding-ji.glb         # 九鼎：ji yan qing xu yang jing yu liang yong
...
public/textures/                  # 贴图已打包进 GLB，这里只是源文件，运行时不必再加载
data/assets/ding-manifest.json    # 尺寸、面数、热点坐标（运行时可直接 fetch）
```

## 2. 坐标与尺寸（已按契约烘焙，不用再改）

- **+Y 向上**，单位米，**原点在足底平面中心**，底部恰好 y = 0。
- 九鼎尺寸不同（0.82–0.93 m 总高），是**为了在地图上区分**的艺术设定，缩放已烘焙进顶点，直接 `scene.add(gltf.scene)` 即可，**不要再对 `gltf.scene` 乘缩放**，否则热点会错位。
- 朝向：两足在前、一足在后；`-Z` 为正面。

## 3. 加载示例

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const manifest = await fetch('/data/assets/ding-manifest.json').then(r => r.json());

// 按州取模型；移动端可换成 lod1
const entry = manifest.models.find(m => m.provinceId === provinceId);
const gltf = await loader.loadAsync(`/${entry.file}`);
gltf.scene.traverse(o => {
  if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
});
```

> 注意：`public/` 下的文件在运行时以站点根路径访问，`manifest.models[].file` 已经是 `models/xxx.glb` 形式，拼成 `/models/xxx.glb`。**不要**写 `/public/models/...`。

## 4. 热点

- 来源：`manifest.models[i].hotspots[]`，字段 `id` / `label` / `position`（局部坐标 `[x,y,z]`）/ `radius`（建议拾取半径，米）/ `note`（可直接展示的说明文本）。
- 位置已经换算到 glTF 坐标，**父级就是 `gltf.scene`**，不需要额外矩阵换算。
- 两种接法：
  1. 每个热点放一个 `THREE.Object3D` 作为锚点，`Raycaster` 递归检测时用 `intersectObject(scene, true)` 后按距离找最近锚点；
  2. 用 `Mesh` + `SphereGeometry(radius)` 做透明拾取球，命中后 `dispatchEvent` 发 `hotspot:select`。
- 契约事件：`hotspot:select`，payload `{ provinceId: string, hotspotId: string }`，`hotspotId` 直接透传上面的 `id`。
- 热点 id 固定为 9 个：`ear-left`、`ear-right`、`rim`、`decor-band`、`inscription`、`leg-front-left`、`leg-front-right`、`leg-back`、`patina`。

## 5. 材质与光照

- 单一材质 `bronze-patina`：Metallic-Roughness 工作流，贴图已嵌入 GLB（basecolor + ORM）。
- ORM 中 B 通道是 Metallic；场景里**需要有环境光或环境贴图**，否则纯金属部分会发黑。建议加一盏主光 + 一个 `RoomEnvironment`（Three.js 官方 addons，MIT）或低强度 `HemisphereLight`。
- 不要给模型再叠加自定义 `color`，会冲掉贴图里的锈色。

## 6. 性能

| 场景 | 建议 |
|---|---|
| 桌面 | `ding-base.glb`（13.6k 面，1.1 MB） |
| 移动端 / 弱网 | `ding-base-lod1.glb`（9.1k 面，505 KB，512²） |
| 九鼎同时在场 | 用九鼎各自的 512² 版本（每个 ≈540–610 KB），不建议九个都用 base |

全量资产约 13 MB。若需要进一步压缩，可以接 `DRACOLoader`（几何）+ `KTX2Loader`（纹理），但**请先测体积收益**再决定——当前九鼎合计 6.5 MB，在 3 MB 首屏预算下应先只预载当前州。

## 7. 已知限制

- 纹饰与铭文是**贴图里的仿纹**，不是实体几何，近看会有平面感；这是刻意的取舍（面数与真实性权衡），已在台账标为艺术复原。
- 没有骨骼 / 拆解动画（契约中属可砍项）。
- 没有 Draco / KTX2 压缩版本；需要时告诉我，我再出压缩版。
