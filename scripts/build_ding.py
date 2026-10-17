"""九州鼎 · P2 资产生成脚本（Blender 5.x，headless）

用途
----
用参数化方式生成三足圆鼎（立耳 / 深腹 / 柱足 / 弦纹），并程序化生成青铜与铜绿
纹理（basecolor + ORM），导出为 glTF 2.0 二进制容器（.glb）到 public/models/。

约定（见 docs/CONTRACT.md「3D 模型规范」）
----------------------------------------
- 单位按米理解，Y 轴向上（Blender 内为 Z 向上，导出时由 glTF 导出器自动转换）。
- 模型原点位于器物底部中心（足底平面中心）。
- 文件名小写 kebab-case。

重要声明
--------
本脚本产出的一切形制、纹饰、铭文与锈蚀分布均为**艺术复原示意，非考古还原**。
铭文为装饰性仿纹，不使用任何字体轮廓，也不还原真实金文内容。详见
docs/ASSET-SOURCES.md。

运行
----
    /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/build_ding.py -- --all
    /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/build_ding.py -- --preview
"""

from __future__ import annotations

import math
import os
import sys
import json

import bpy
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(ROOT, "public", "models")
TEX_DIR = os.path.join(ROOT, "public", "textures")
PREVIEW_DIR = os.path.join(ROOT, "docs", "assets", "previews")
DATA_DIR = os.path.join(ROOT, "data", "assets")

# ---------------------------------------------------------------------------
# 器物参数（单位：米）
# ---------------------------------------------------------------------------

# 主体剖面 (半径 r, 高度 z)，从底部中心起，沿外壁上行、过口沿、再沿内壁下行到底部中心。
# 剖面为闭合壳体，因此是一个带壁厚的实体。
PROFILE = [
    (0.0000, 0.3150),  # 0  外底中心
    (0.0750, 0.3130),  # 1
    (0.1600, 0.3070),  # 2
    (0.2500, 0.2920),  # 3
    (0.3150, 0.2720),  # 4  底缘转折
    (0.3600, 0.2450),  # 5  底腹过渡
    (0.3900, 0.2900),  # 6
    (0.4120, 0.3500),  # 7
    (0.4260, 0.4200),  # 8  下腹起纹饰带
    (0.4330, 0.4900),  # 9
    (0.4300, 0.5600),  # 10 最大腹径
    (0.4200, 0.6250),  # 11 纹饰带上缘
    (0.4100, 0.6800),  # 12
    (0.4040, 0.7150),  # 13
    (0.4080, 0.7450),  # 14 侈口
    (0.4160, 0.7620),  # 15
    (0.4200, 0.7700),  # 16 口沿外缘
    (0.4200, 0.7800),  # 17 口沿顶面
    (0.3960, 0.7800),  # 18 口沿内缘
    (0.3900, 0.7660),  # 19 内壁起
    (0.3860, 0.7450),  # 20
    (0.3800, 0.7150),  # 21
    (0.3900, 0.6800),  # 22
    (0.4000, 0.6250),  # 23
    (0.4030, 0.5600),  # 24
    (0.4060, 0.4900),  # 25
    (0.3960, 0.4200),  # 26
    (0.3820, 0.3500),  # 27
    (0.3600, 0.2900),  # 28
    (0.3000, 0.3000),  # 29 内底
    (0.1600, 0.3370),  # 30
    (0.0750, 0.3430),  # 31
    (0.0000, 0.3450),  # 32 内底中心
]

# 纹饰带（雷纹）与铭文带在剖面中的顶点索引区间
BAND_IDX = (8, 11)
INSCRIPTION_IDX = (20, 29)
# 口沿的横向面：着色时保持硬边
FLAT_ROWS = {16, 17, 18}

RIM_TOP_Z = 0.7800
SEGMENTS_LOD0 = 96
SEGMENTS_LOD1 = 48

# 九州资产参数。尺寸、锈蚀、铭文差异均为**艺术设定**，用于视觉区分，不是考古依据。
PROVINCES = [
    # id, 名称, 高度倍率, 锈蚀强度, 纹饰带行数, 铭文种子
    ("ji", "冀州", 1.000, 0.55, 3, 1103),
    ("yan", "兖州", 0.962, 0.62, 3, 2207),
    ("qing", "青州", 0.944, 0.72, 4, 3319),
    ("xu", "徐州", 0.978, 0.58, 3, 4421),
    ("yang", "扬州", 1.022, 0.80, 4, 5531),
    ("jing", "荆州", 1.041, 0.85, 3, 6643),
    ("yu", "豫州", 1.080, 0.45, 4, 7757),
    ("liang", "梁州", 0.951, 0.68, 3, 8861),
    ("yong", "雍州", 1.064, 0.35, 3, 9973),
]

BASE_PARAMS = ("ding-base", "基础鼎", 1.000, 0.50, 3, 1234)


# ---------------------------------------------------------------------------
# 程序化噪声
# ---------------------------------------------------------------------------


def _lattice(fu: int, fv: int, rng: np.random.Generator) -> np.ndarray:
    """生成可沿 u 方向首尾相接的随机格点。"""
    return rng.random((fv + 1, fu))


def _sample(lat: np.ndarray, u: np.ndarray, v: np.ndarray) -> np.ndarray:
    fu = lat.shape[1]
    fv = lat.shape[0] - 1
    x = u * fu
    y = v * fv
    x0 = np.floor(x).astype(np.int64)
    y0 = np.floor(y).astype(np.int64)
    fx = x - x0
    fy = y - y0
    fx = fx * fx * (3.0 - 2.0 * fx)
    fy = fy * fy * (3.0 - 2.0 * fy)
    xa = x0 % fu
    xb = (x0 + 1) % fu
    ya = np.clip(y0, 0, fv)
    yb = np.clip(y0 + 1, 0, fv)
    c00 = lat[ya, xa]
    c10 = lat[ya, xb]
    c01 = lat[yb, xa]
    c11 = lat[yb, xb]
    top = c00 + (c10 - c00) * fx
    bot = c01 + (c11 - c01) * fx
    return top + (bot - top) * fy


def fbm(u: np.ndarray, v: np.ndarray, base_f: int, octaves: int, rng: np.random.Generator) -> np.ndarray:
    """分形布朗噪声，u 方向周期，避免纹理接缝。"""
    total = np.zeros_like(u)
    amp = 1.0
    norm = 0.0
    f = base_f
    for _ in range(octaves):
        lat = _lattice(f, max(2, f // 2), rng)
        total += amp * _sample(lat, u, v)
        norm += amp
        amp *= 0.5
        f *= 2
    return total / norm


def smoothstep(a: float, b: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


# ---------------------------------------------------------------------------
# 纹理
# ---------------------------------------------------------------------------


def _leiwen_mask(u: np.ndarray, v: np.ndarray, band: tuple[float, float], rows: int) -> np.ndarray:
    """回/雷纹：每个格子里画嵌套方框（阴线），仿青铜器上的雷纹带。"""
    lo, hi = band
    cells_u = 40
    cu = u * cells_u
    a = cu - np.floor(cu)
    cv = (v - lo) / max(hi - lo, 1e-6) * rows
    b = cv - np.floor(cv)
    inside = (v >= lo) & (v <= hi)

    def rect_outline(ax, ay, hw, hh):
        sd = np.maximum(np.abs(ax - 0.5) - hw, np.abs(ay - 0.5) - hh)
        return np.abs(sd)

    d1 = rect_outline(a, b, 0.38, 0.30)
    d2 = rect_outline(a, b, 0.15, 0.10)
    stroke = (d1 < 0.045) | (d2 < 0.045)
    return stroke & inside


def _inscription_mask(u: np.ndarray, v: np.ndarray, band: tuple[float, float], seed: int) -> np.ndarray:
    """装饰性仿铭文：随机短竖/横笔画，非真实金文。"""
    rng = np.random.default_rng(seed)
    cells = 64
    lo, hi = band
    cu = u * cells
    idx = np.floor(cu).astype(np.int64) % cells
    a = cu - np.floor(cu)
    span = np.maximum(hi - lo, 1e-6)
    b = (v - lo) / span
    inside = (b >= 0.0) & (b <= 1.0)
    height = 0.35 + 0.5 * rng.random(cells)
    y0 = 0.12 + 0.25 * rng.random(cells)
    vertical = np.abs(a - 0.5) < 0.07
    within = (b >= y0[idx]) & (b <= y0[idx] + height[idx])
    horizontal = (np.abs(b - (y0[idx] + height[idx] * 0.5)) < 0.035) & (a > 0.28) & (a < 0.72)
    return (vertical & within | horizontal & inside) & inside


def build_texture(
    size: int,
    patina: float,
    band_rows: int,
    seed: int,
    band_v: tuple[float, float],
    insc_v: tuple[float, float],
) -> tuple[np.ndarray, np.ndarray]:
    """返回 (basecolor RGBA, ORM RGB)，均为 0-1、按 sRGB 直接写入。

    ORM 按 glTF 约定：R=AO，G=Roughness，B=Metallic。
    """
    H = W = size
    rng = np.random.default_rng(seed)
    vv, uu = np.meshgrid(
        np.linspace(0.0, 1.0, H, endpoint=False),
        np.linspace(0.0, 1.0, W, endpoint=False),
        indexing="ij",
    )
    u = uu.reshape(-1)
    v = vv.reshape(-1)

    n_big = fbm(u, v, 7, 5, rng)          # 大面积锈斑
    n_fine = fbm(u, v, 24, 3, rng)        # 细颗粒
    n_pit = fbm(u, v, 56, 2, rng)         # 点蚀/麻点
    # 竖向流挂：u 低频、v 高频
    lat_streak = _lattice(6, 96, rng)
    streak = _sample(lat_streak, u, v)

    # 底部更易积锈，口沿与腹部上段相对干净；另加少量中低频斑块让锈分布不均匀
    height_bias = 1.0 - 0.55 * smoothstep(0.02, 0.50, v)
    patch = smoothstep(0.58, 0.76, fbm(u, v, 3, 3, rng))
    patina_field = (0.55 * n_big + 0.30 * n_fine + 0.15 * streak) * height_bias
    # 叠加高频扰动让锈斑边缘呈不规则渗透状，而不是平涂色块
    patina_field = patina_field + 0.16 * (n_pit - 0.5) + 0.12 * (n_fine - 0.5)
    mask = smoothstep(0.42, 0.53, patina_field * (0.55 + patina))
    mask = np.clip(mask + 0.70 * patch * height_bias, 0.0, 1.0)

    bronze = np.array([0.298, 0.224, 0.128])
    bronze_dark = np.array([0.138, 0.102, 0.060])
    patina_col = np.array([0.148, 0.318, 0.238])       # 孔雀石绿
    patina_col_light = np.array([0.290, 0.452, 0.352])  # 浅绿锈
    azurite = np.array([0.098, 0.232, 0.268])          # 蓝铜矿（偏蓝、压暗）

    # 基础青铜色：随噪声在明暗之间过渡，模拟氧化前的铸造表面
    tone = np.clip(0.35 + 0.65 * (0.6 * n_fine + 0.4 * n_big), 0.0, 1.0)
    col = bronze[None, :] * tone[:, None] + bronze_dark[None, :] * (1.0 - tone[:, None])

    # 锈层内部分色：高频噪声决定偏绿还是偏蓝，再叠一层明暗与点蚀，避免整片纯色
    blue_mix = smoothstep(0.42, 0.68, fbm(u, v, 12, 3, rng))
    pat = (
        patina_col[None, :] * (1.0 - blue_mix[:, None])
        + azurite[None, :] * blue_mix[:, None]
    ) * (0.72 + 0.32 * n_fine[:, None])
    pat = pat + patina_col_light[None, :] * 0.18 * (1.0 - blue_mix[:, None])
    # 锈层点蚀：深色麻点，避免大面积均匀
    pat = pat * (0.82 + 0.18 * smoothstep(0.30, 0.55, n_pit[:, None]))
    col = col * (1.0 - mask[:, None]) + pat * mask[:, None]

    leiwen = _leiwen_mask(u, v, band_v, band_rows)
    insc = _inscription_mask(u, v, insc_v, seed + 7)

    # 阴线刻纹：压暗并减少金属反射，视觉上读作凹槽
    groove = np.zeros_like(mask)
    groove[leiwen] = 0.35
    groove[insc] = 0.60
    col = col * (1.0 - groove[:, None])

    ao = 1.0 - 0.45 * groove - 0.18 * mask
    rough = np.clip(0.45 + 0.28 * mask + 0.18 * groove + 0.14 * (n_fine - 0.5), 0.12, 0.98)
    metal = np.clip(1.0 - 0.9 * mask - 0.8 * groove, 0.0, 1.0)

    rgba = np.ones((u.size, 4), dtype=np.float32)
    rgba[:, :3] = np.clip(col, 0.0, 1.0)
    orm = np.stack([np.clip(ao, 0, 1), rough, metal], axis=1).astype(np.float32)
    return rgba, orm


def _write_image(name: str, pixels: np.ndarray, path: str, colorspace: str, size: int) -> None:
    img = bpy.data.images.new(name, width=size, height=size, alpha=True, float_buffer=False)
    img.colorspace_settings.name = colorspace
    if pixels.shape[1] == 3:
        rgba = np.ones((pixels.shape[0], 4), dtype=np.float32)
        rgba[:, :3] = pixels
        pixels = rgba
    img.pixels.foreach_set(np.ascontiguousarray(pixels, dtype=np.float32).reshape(-1))
    img.file_format = "PNG"
    img.filepath_raw = path
    img.save()
    img.pack()


# ---------------------------------------------------------------------------
# 几何
# ---------------------------------------------------------------------------


def _mesh_object(name: str, verts, faces, uv_per_vert, smooth_flags):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    uv_layer = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        if poly.index < len(smooth_flags):
            poly.use_smooth = smooth_flags[poly.index]
        for li in poly.loop_indices:
            vi = me.loops[li].vertex_index
            uv_layer.data[li].uv = uv_per_vert[vi]
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)

    # 统一法线朝向，避免扫掠体端盖朝向错误
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    me.update()
    return ob


def build_lathe(profile, segments: int, v_range=(0.0, 1.0), flat_rows=()):
    """旋转剖面生成带壁厚的回转体；返回 verts / faces / uv / smooth。"""
    n = len(profile)
    dist = [0.0]
    for i in range(1, n):
        dr = profile[i][0] - profile[i - 1][0]
        dz = profile[i][1] - profile[i - 1][1]
        dist.append(dist[-1] + math.hypot(dr, dz))
    total = dist[-1] or 1.0
    v0, v1 = v_range
    vs = [v0 + (v1 - v0) * (d / total) for d in dist]

    verts: list[tuple[float, float, float]] = []
    uv: list[tuple[float, float]] = []
    cols: list[list[int]] = []

    # 位于旋转轴上的剖面点只生成一个顶点，避免极点处出现重复顶点
    pole: dict[int, int] = {}
    for j, (r, z) in enumerate(profile):
        if r < 1e-6:
            pole[j] = len(verts)
            verts.append((0.0, 0.0, z))
            uv.append((0.0, vs[j]))

    for i in range(segments + 1):
        th = 2.0 * math.pi * i / segments
        c, s = math.cos(th), math.sin(th)
        col = []
        for j, (r, z) in enumerate(profile):
            if r < 1e-6:
                col.append(pole[j])
            else:
                verts.append((r * c, r * s, z))
                uv.append((i / segments, vs[j]))
                col.append(len(verts) - 1)
        cols.append(col)

    faces = []
    smooth = []
    for i in range(segments):
        for j in range(n - 1):
            a = cols[i][j]
            b = cols[i + 1][j]
            c = cols[i + 1][j + 1]
            d = cols[i][j + 1]
            r0 = profile[j][0]
            r1 = profile[j + 1][0]
            if r0 < 1e-6 and r1 < 1e-6:
                continue
            if r0 < 1e-6:
                faces.append((a, c, d))
            elif r1 < 1e-6:
                faces.append((a, b, c))
            else:
                faces.append((a, b, c, d))
            smooth.append(j not in flat_rows)
    return verts, faces, uv, smooth, vs


def _catmull_rom(points, samples: int):
    pts = [np.array(p, dtype=float) for p in points]
    ext = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    out = []
    segs = len(pts) - 1
    for k in range(samples):
        t = k / (samples - 1)
        f = t * segs
        i = min(int(f), segs - 1)
        lt = f - i
        p0, p1, p2, p3 = ext[i], ext[i + 1], ext[i + 2], ext[i + 3]
        lt2, lt3 = lt * lt, lt * lt * lt
        out.append(
            0.5
            * (
                (2 * p1)
                + (-p0 + p2) * lt
                + (2 * p0 - 5 * p1 + 4 * p2 - p3) * lt2
                + (-p0 + 3 * p1 - 3 * p2 + p3) * lt3
            )
        )
    return out


def build_tube(path, radii, sides: int, uv_v=(0.6, 0.76), closed=False, caps=True):
    """沿路径扫掠圆截面，生成耳/足等管状体。"""
    pts = np.array(path, dtype=float)
    tangents = []
    for i in range(len(pts)):
        if i == 0:
            t = pts[1] - pts[0]
        elif i == len(pts) - 1:
            t = pts[-1] - pts[-2]
        else:
            t = pts[i + 1] - pts[i - 1]
        nl = np.linalg.norm(t)
        tangents.append(t / nl if nl > 1e-9 else np.array([0.0, 0.0, 1.0]))

    # 平行传输参考系，避免扫掠时截面扭转
    ref = np.array([0.0, 1.0, 0.0])
    if abs(np.dot(ref, tangents[0])) > 0.95:
        ref = np.array([1.0, 0.0, 0.0])
    normal = ref - tangents[0] * np.dot(ref, tangents[0])
    normal /= np.linalg.norm(normal)

    verts, uv, rings = [], [], []
    for i, (p, t) in enumerate(zip(pts, tangents)):
        if i > 0:
            normal = normal - t * np.dot(normal, t)
            nl = np.linalg.norm(normal)
            normal = normal / nl if nl > 1e-9 else normal
        binormal = np.cross(t, normal)
        ring = []
        for s in range(sides):
            a = 2.0 * math.pi * s / sides
            off = normal * math.cos(a) * radii[i] + binormal * math.sin(a) * radii[i]
            verts.append(tuple(p + off))
            uv.append((s / sides, uv_v[0] + (uv_v[1] - uv_v[0]) * i / max(len(pts) - 1, 1)))
            ring.append(len(verts) - 1)
        rings.append(ring)

    faces, smooth = [], []
    last = len(rings) if closed else len(rings) - 1
    for i in range(last):
        r0 = rings[i]
        r1 = rings[(i + 1) % len(rings)]
        for s in range(sides):
            s2 = (s + 1) % sides
            faces.append((r0[s], r0[s2], r1[s2], r1[s]))
            smooth.append(True)
    if caps and not closed:
        for ring, flip in ((rings[0], True), (rings[-1], False)):
            ctr = np.mean([verts[i] for i in ring], axis=0)
            verts.append(tuple(ctr))
            uv.append((0.5, uv_v[0]))
            ci = len(verts) - 1
            for s in range(sides):
                s2 = (s + 1) % sides
                faces.append((ci, ring[s2], ring[s]) if flip else (ci, ring[s], ring[s2]))
                smooth.append(False)
    return verts, faces, uv, smooth


def build_disc_band(z: float, radius: float, minor: float, major_seg: int, minor_seg: int, uv_v=(0.6, 0.76)):
    """弦纹：绕腹一周的细凸棱。"""
    verts, uv, rings = [], [], []
    for i in range(major_seg):
        th = 2 * math.pi * i / major_seg
        c, s = math.cos(th), math.sin(th)
        ring = []
        for j in range(minor_seg):
            a = 2 * math.pi * j / minor_seg
            r = radius + minor * math.cos(a)
            zz = z + minor * math.sin(a)
            verts.append((r * c, r * s, zz))
            uv.append((i / major_seg, uv_v[0] + (uv_v[1] - uv_v[0]) * j / minor_seg))
            ring.append(len(verts) - 1)
        rings.append(ring)
    faces, smooth = [], []
    for i in range(major_seg):
        r0 = rings[i]
        r1 = rings[(i + 1) % major_seg]
        for j in range(minor_seg):
            j2 = (j + 1) % minor_seg
            faces.append((r0[j], r0[j2], r1[j2], r1[j]))
            smooth.append(True)
    return verts, faces, uv, smooth


def radius_at(z: float) -> float:
    """外壁在高度 z 处的半径（线性插值）。"""
    outer = [p for p in PROFILE[:17]]
    for i in range(len(outer) - 1):
        z0, z1 = outer[i][1], outer[i + 1][1]
        if z0 <= z <= z1:
            t = (z - z0) / (z1 - z0) if abs(z1 - z0) > 1e-9 else 0.0
            return outer[i][0] + (outer[i + 1][0] - outer[i][0]) * t
    return outer[-1][0]


# ---------------------------------------------------------------------------
# 组装与导出
# ---------------------------------------------------------------------------


def make_material(base_img, orm_img, name="bronze-patina"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (-300, 0)
    out.location = (50, 0)

    tex_bc = nt.nodes.new("ShaderNodeTexImage")
    tex_bc.image = base_img
    tex_bc.location = (-900, 200)

    tex_orm = nt.nodes.new("ShaderNodeTexImage")
    tex_orm.image = orm_img
    tex_orm.location = (-900, -200)
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    sep.location = (-600, -200)

    nt.links.new(tex_bc.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex_orm.outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs[1], bsdf.inputs["Roughness"])
    nt.links.new(sep.outputs[2], bsdf.inputs["Metallic"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def build_model(params, out_name, tex_size, segments, reset=True):
    _pid, _label, hscale, patina, band_rows, seed = params
    if reset:
        clear_scene()

    dist = [0.0]
    for i in range(1, len(PROFILE)):
        dr = PROFILE[i][0] - PROFILE[i - 1][0]
        dz = PROFILE[i][1] - PROFILE[i - 1][1]
        dist.append(dist[-1] + math.hypot(dr, dz))
    total = dist[-1]
    BODY_V = (0.0, 0.58)
    v_band = tuple(BODY_V[0] + (BODY_V[1] - BODY_V[0]) * dist[k] / total for k in BAND_IDX)
    v_insc = tuple(BODY_V[0] + (BODY_V[1] - BODY_V[0]) * dist[k] / total for k in INSCRIPTION_IDX)

    rgba, orm = build_texture(tex_size, patina, band_rows, seed, v_band, v_insc)
    base_path = os.path.join(TEX_DIR, f"{out_name}-basecolor.png")
    orm_path = os.path.join(TEX_DIR, f"{out_name}-orm.png")
    _write_image(f"{out_name}-basecolor", rgba, base_path, "sRGB", tex_size)
    _write_image(f"{out_name}-orm", orm, orm_path, "Non-Color", tex_size)
    mat = make_material(bpy.data.images[f"{out_name}-basecolor"], bpy.data.images[f"{out_name}-orm"])

    objs = []

    verts, faces, uv, smooth, _vs = build_lathe(PROFILE, segments, BODY_V, FLAT_ROWS)
    body = _mesh_object("body", verts, faces, uv, smooth)
    objs.append(body)

    # 三足：两前一后（前 = -Y），柱足较粗、微外撇
    leg_axis = [(0.255, 0.258), (0.268, 0.205), (0.283, 0.150), (0.297, 0.082), (0.306, 0.043), (0.310, 0.034)]
    leg_radii = [0.100, 0.094, 0.086, 0.078, 0.083, 0.074]
    for a_deg in (90.0, 210.0, 330.0):
        a = math.radians(a_deg)
        path = [(r * math.cos(a), r * math.sin(a), z) for (r, z) in leg_axis]
        path = _catmull_rom(path, 18)
        rr = np.interp(np.linspace(0, 1, len(path)), np.linspace(0, 1, len(leg_radii)), leg_radii)
        verts, faces, uv, smooth = build_tube(path, rr, 20, uv_v=(0.60, 0.74))
        # 端盖顶点不带半径，扫掠末端会低于路径终点；整体上移使足底恰好落在 z=0
        verts = [(x, y, z + rr[-1]) for (x, y, z) in verts]
        objs.append(_mesh_object(f"leg-{int(a_deg)}", verts, faces, uv, smooth))

    # 两立耳：位于 ±X，耳足下探贴壁，立耳基本竖直、略收腰
    ear_path = [
        (0.352, 0.690), (0.362, 0.735), (0.368, 0.778),
        (0.376, 0.858), (0.392, 0.912), (0.428, 0.912),
        (0.448, 0.858), (0.452, 0.778), (0.442, 0.715), (0.434, 0.690),
    ]
    for sign in (1.0, -1.0):
        path3 = [(sign * x, 0.0, z) for (x, z) in ear_path]
        path3 = _catmull_rom(path3, 44)
        radii = np.full(len(path3), 0.030)
        verts, faces, uv, smooth = build_tube(path3, radii, 14, uv_v=(0.60, 0.70))
        # 立耳做成「扁平环耳」：只压缩沿口沿切线方向（此处为 Y）的厚度，
        # 不影响耳在口径方向的位置，读起来更像商周鼎耳而非圆棒。
        verts = [(x, y * 0.55, z) for (x, y, z) in verts]
        objs.append(_mesh_object(f"ear-{'L' if sign > 0 else 'R'}", verts, faces, uv, smooth))

    # 两道弦纹
    for z in (0.648, 0.578):
        verts, faces, uv, smooth = build_disc_band(z, radius_at(z) + 0.001, 0.0085, segments, 8)
        objs.append(_mesh_object(f"band-{int(z * 1000)}", verts, faces, uv, smooth))

    for ob in objs:
        ob.data.materials.append(mat)
        # 缩放必须烘焙进网格：glTF 导出时对象级 scale 会被 apply，但多对象
        # 共享同一数据块时容易出偏差，这里直接作用于顶点，保证与契约一致。
        if abs(hscale - 1.0) > 1e-9:
            for v in ob.data.vertices:
                v.co.x *= hscale
                v.co.y *= hscale
                v.co.z *= hscale
        ob.data.update()

    # 归一化底面：以实际最低点为基准整体平移，保证足底恰好落在 z=0（契约要求原点在底部中心）
    zmin = min((ob.matrix_world @ v.co).z for ob in objs for v in ob.data.vertices)
    for ob in objs:
        for v in ob.data.vertices:
            v.co.z -= zmin
        ob.data.update()

    bpy.context.view_layer.update()

    # 足底落在 z=0，整体不再平移；原点即底部中心
    for o in objs:
        o.data.calc_loop_triangles()
    stats = {
        "objects": len(objs),
        "triangles": sum(len(o.data.loop_triangles) for o in objs),
        "vertices": sum(len(o.data.vertices) for o in objs),
        "texture": f"{tex_size}x{tex_size}",
        "height": max((v.co.z for o in objs for v in o.data.vertices), default=0.0),
    }

    return objs, stats, (base_path, orm_path)


def export_glb(objs, path):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_cameras=False,
        export_lights=False,
    )


# ---------------------------------------------------------------------------
# 预览渲染（用于人工审核形制）
# ---------------------------------------------------------------------------


def add_preview_rig():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("W")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.86, 0.85, 0.82, 1.0)
    bg.inputs[1].default_value = 1.0

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 85
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam

    key = bpy.data.lights.new("key", type="AREA")
    key.energy = 900
    key.size = 2.0
    ko = bpy.data.objects.new("key", key)
    ko.location = (2.2, -2.6, 2.6)
    ko.rotation_euler = (math.radians(50), 0, math.radians(40))
    bpy.context.collection.objects.link(ko)

    fill = bpy.data.lights.new("fill", type="AREA")
    fill.energy = 260
    fill.size = 3.0
    fo = bpy.data.objects.new("fill", fill)
    fo.location = (-2.8, -1.6, 1.4)
    fo.rotation_euler = (math.radians(75), 0, math.radians(-60))
    bpy.context.collection.objects.link(fo)

    ground = bpy.data.meshes.new("ground")
    ground.from_pydata([(-6, -6, -0.001), (6, -6, -0.001), (6, 6, -0.001), (-6, 6, -0.001)], [], [(0, 1, 2, 3)])
    go = bpy.data.objects.new("ground", ground)
    gm = bpy.data.materials.new("ground")
    gm.use_nodes = True
    gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.55, 0.53, 0.50, 1)
    gm.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.85
    ground.materials.append(gm)
    bpy.context.collection.objects.link(go)
    return cam, ko


def render_preview(cam, out_path, angle_deg, elev=0.20, dist=2.5, target_z=0.48):
    a = math.radians(angle_deg)
    cam.location = (dist * math.cos(a), dist * math.sin(a), target_z + elev * 2.2)
    direction = np.array([0.0, 0.0, target_z]) - np.array(cam.location)
    direction = direction / np.linalg.norm(direction)
    from mathutils import Vector

    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = Vector(direction.tolist()).to_track_quat("-Z", "Y")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)


# ---------------------------------------------------------------------------
# 热点坐标
# ---------------------------------------------------------------------------


def hotspots(scale: float):
    """以 glTF 坐标（Y 向上、原点在足底中心）给出热点位置。"""
    def g(x, y, z):
        # Blender(x, y, z) -> glTF(x, z, -y)
        return [round(x * scale, 4), round(z * scale, 4), round(-y * scale, 4)]

    return [
        {
            "id": "ear-left",
            "label": "立耳（左）",
            "position": g(0.408, 0.0, 0.898),
            "radius": round(0.040 * scale, 4),
            "note": "立于口沿、双足下探贴壁的双耳；艺术复原，形制参照商周圆鼎立耳。",
        },
        {
            "id": "ear-right",
            "label": "立耳（右）",
            "position": g(-0.408, 0.0, 0.898),
            "radius": round(0.040 * scale, 4),
            "note": "与左耳对称，供穿杠抬举之用（示意）。",
        },
        {
            "id": "rim",
            "label": "口沿（侈口）",
            "position": g(0.0, -0.408, 0.775),
            "radius": round(0.030 * scale, 4),
            "note": "口沿外撇加厚，是商周圆鼎常见的受力与装饰部位。",
        },
        {
            "id": "decor-band",
            "label": "腹部纹饰带",
            "position": g(0.0, -0.431, 0.490),
            "radius": round(0.045 * scale, 4),
            "note": "雷纹带为程序化生成的装饰性仿纹，不是对具体器物的摹写。",
        },
        {
            "id": "inscription",
            "label": "内壁铭文",
            "position": g(0.0, -0.370, 0.710),
            "radius": round(0.028 * scale, 4),
            "note": "内壁仿铭文为抽象笔画，不构成可释读的文字，也不对应任何真实铭文。",
        },
        {
            "id": "leg-front-left",
            "label": "足（左前）",
            "position": g(-0.251, -0.145, 0.120),
            "radius": round(0.040 * scale, 4),
            "note": "柱足，向下略外撇；三足承鼎是圆鼎的基本形制。",
        },
        {
            "id": "leg-front-right",
            "label": "足（右前）",
            "position": g(0.251, -0.145, 0.120),
            "radius": round(0.040 * scale, 4),
            "note": "与左前足对称。",
        },
        {
            "id": "leg-back",
            "label": "足（后）",
            "position": g(0.0, 0.297, 0.120),
            "radius": round(0.040 * scale, 4),
            "note": "后足位于 +Z 方向。",
        },
        {
            "id": "patina",
            "label": "铜绿锈蚀",
            "position": g(0.0, -0.398, 0.320),
            "radius": round(0.040 * scale, 4),
            "note": "锈蚀分布为艺术处理，用于表现埋藏环境差异，非检测结果。",
        },
    ]


# ---------------------------------------------------------------------------
# 入口
# ---------------------------------------------------------------------------


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    for d in (MODEL_DIR, TEX_DIR, PREVIEW_DIR, DATA_DIR):
        os.makedirs(d, exist_ok=True)

    manifest = {"version": 1, "models": []}

    targets = [BASE_PARAMS] + PROVINCES
    for params in targets:
        pid, label, hscale, patina, band_rows, seed = params
        name = "ding-base" if pid == "ding-base" else f"ding-{pid}"
        segments = SEGMENTS_LOD0 if pid == "ding-base" else 64
        tex = 1024 if pid == "ding-base" else 512
        objs, stats, tex_paths = build_model(params, name, tex, segments)
        glb = os.path.join(MODEL_DIR, f"{name}.glb")
        export_glb(objs, glb)
        size_kb = round(os.path.getsize(glb) / 1024.0, 1)
        print(f"[ok] {name}: {stats['triangles']} tris, {size_kb} KB, tex {stats['texture']}")
        manifest["models"].append(
            {
                "file": f"models/{name}.glb",
                "provinceId": None if pid == "ding-base" else pid,
                "label": label,
                "scale": hscale,
                "heightMeters": round(stats["height"], 4),
                "triangles": stats["triangles"],
                "vertices": stats["vertices"],
                "textureSize": tex,
                "fileSizeKB": size_kb,
                "textures": [os.path.relpath(p, ROOT) for p in tex_paths],
                "hotspots": hotspots(hscale),
            }
        )

    # LOD1：移动端简化版
    objs, stats, tex_paths = build_model(BASE_PARAMS, "ding-base-lod1", 512, SEGMENTS_LOD1)
    glb = os.path.join(MODEL_DIR, "ding-base-lod1.glb")
    export_glb(objs, glb)
    lod1_kb = round(os.path.getsize(glb) / 1024.0, 1)
    print(f"[ok] ding-base-lod1: {stats['triangles']} tris, {lod1_kb} KB")
    manifest["lod1"] = {
        "file": "models/ding-base-lod1.glb",
        "triangles": stats["triangles"],
        "textureSize": 512,
        "fileSizeKB": lod1_kb,
        "textures": [os.path.relpath(p, ROOT) for p in tex_paths],
    }
    manifest["coordinateSystem"] = {
        "up": "+Y",
        "unit": "meter",
        "origin": "器物足底平面中心",
        "note": "glTF 坐标；position 为热点在模型局部空间的位置，随模型整体缩放一起计算。",
    }
    manifest["disclaimer"] = "所有模型均为艺术复原示意，非考古还原。"

    with open(os.path.join(DATA_DIR, "ding-manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"[ok] manifest -> data/assets/ding-manifest.json")

    if "--preview" in argv:
        objs, stats, _ = build_model(BASE_PARAMS, "preview-only", 1024, SEGMENTS_LOD0)
        cam, _ = add_preview_rig()
        for angle, tag in ((255, "front"), (300, "three-quarter"), (180, "side"), (255, "top")):
            elev = 0.9 if tag == "top" else 0.20
            dist = 2.1 if tag == "top" else 2.5
            render_preview(cam, os.path.join(PREVIEW_DIR, f"ding-{tag}.png"), angle, elev, dist)
            print(f"[ok] preview {tag}")


if __name__ == "__main__":
    main()
