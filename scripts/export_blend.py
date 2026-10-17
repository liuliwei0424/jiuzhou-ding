"""导出 Blender 工程源文件（P2 交付归档用）

产出：
    assets-src/jiuzhou-ding.blend   Blender 工程（含基础鼎 + 九鼎，带材质与打包贴图）
    assets-src/README.txt           工程说明

说明：.blend 是「源文件」归档，不随网页部署包分发；网页只需要 public/models 下的 GLB。
"""

import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_ding as B  # noqa: E402

ROOT = B.ROOT
SRC_DIR = os.path.join(ROOT, "assets-src")


def main():
    os.makedirs(SRC_DIR, exist_ok=True)
    B.clear_scene()

    # 基础鼎（最高精度）+ 九鼎，全部放进同一个工程，各占一个集合
    for idx, params in enumerate([B.BASE_PARAMS] + B.PROVINCES):
        pid, label, hscale, patina, band_rows, seed = params
        name = "ding-base" if pid == "ding-base" else f"ding-{pid}"
        segs = B.SEGMENTS_LOD0 if pid == "ding-base" else 64
        tex = 1024 if pid == "ding-base" else 512
        objs, stats, _ = B.build_model(params, f"src-{name}", tex, segs, reset=False)

        coll = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(coll)
        for ob in objs:
            for c in list(ob.users_collection):
                c.objects.unlink(ob)
            coll.objects.link(ob)
            ob.name = f"{name}__{ob.name}"
        print(f"[ok] 加入工程: {name} ({stats['triangles']} tris)")

    # 贴图已 pack 进 .blend，这里再确认一次，避免换机器丢图
    packed = 0
    for img in bpy.data.images:
        if img.packed_file is None and img.filepath:
            try:
                img.pack()
                packed += 1
            except RuntimeError:
                pass
    print(f"[ok] 新打包贴图 {packed} 张")

    blend = os.path.join(SRC_DIR, "jiuzhou-ding.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    size_mb = round(os.path.getsize(blend) / 1024 / 1024, 1)
    print(f"[ok] 源文件 -> {blend} ({size_mb} MB)")


if __name__ == "__main__":
    main()
