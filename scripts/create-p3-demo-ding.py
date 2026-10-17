"""Create a small, original P3 demo ding in glTF 2.0 binary format.

The runtime prefers P2's public/models/ding-base.glb; this file is only a
temporary fallback for scene acceptance while P2's asset is unavailable.
"""

from __future__ import annotations

import json
import math
import struct
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/models/p3-demo-ding.glb"
SEGMENTS = 64


def mesh_from_rings(rings, loop=True):
    """Connect ring arrays, keeping the first axis as ring index."""
    vertices = np.asarray(rings, dtype=np.float32).reshape(-1, 3)
    count = len(rings[0])
    faces = []
    for row in range(len(rings) - 1):
        for col in range(count if loop else count - 1):
            next_col = (col + 1) % count
            a = row * count + col
            b = row * count + next_col
            c = (row + 1) * count + col
            d = (row + 1) * count + next_col
            faces.extend(((a, c, b), (b, c, d)))
    return vertices, np.asarray(faces, dtype=np.uint32)


def lathe(profile, segments=SEGMENTS):
    rings = []
    for radius, y in profile:
        rings.append([
            (radius * math.cos(2 * math.pi * i / segments), y,
             radius * math.sin(2 * math.pi * i / segments))
            for i in range(segments)
        ])
    return mesh_from_rings(rings)


def torus(major, minor, center=(0, 0, 0), plane="xz", scale=(1, 1), segments=SEGMENTS, sides=12):
    rings = []
    cx, cy, cz = center
    for j in range(sides + 1):
        phi = 2 * math.pi * j / sides
        row = []
        for i in range(segments):
            theta = 2 * math.pi * i / segments
            radial = major + minor * math.cos(phi)
            if plane == "xz":
                row.append((cx + scale[0] * radial * math.cos(theta),
                            cy + minor * math.sin(phi),
                            cz + scale[1] * radial * math.sin(theta)))
            else:
                row.append((cx + scale[0] * radial * math.cos(theta),
                            cy + scale[1] * radial * math.sin(theta),
                            cz + minor * math.sin(phi)))
        rings.append(row)
    return mesh_from_rings(rings)


def leg(angle):
    rings = []
    for radius, y, offset in ((0.12, 0.0, 0.81), (0.16, 0.10, 0.78),
                              (0.18, 0.66, 0.66), (0.27, 0.94, 0.60)):
        cx = offset * math.cos(angle)
        cz = offset * math.sin(angle)
        rings.append([(cx + radius * math.cos(2 * math.pi * i / 24), y,
                       cz + radius * math.sin(2 * math.pi * i / 24))
                      for i in range(24)])
    return mesh_from_rings(rings)


def sphere(center, radius=0.045, slices=12, stacks=8):
    cx, cy, cz = center
    rings = []
    for j in range(stacks + 1):
        phi = math.pi * (0.001 + 0.998 * j / stacks)
        rings.append([(cx + radius * math.sin(phi) * math.cos(2 * math.pi * i / slices),
                       cy + radius * math.cos(phi),
                       cz + radius * math.sin(phi) * math.sin(2 * math.pi * i / slices))
                      for i in range(slices)])
    return mesh_from_rings(rings)


def normals(vertices, faces):
    result = np.zeros_like(vertices)
    tri = vertices[faces]
    face_normal = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    np.add.at(result, faces[:, 0], face_normal)
    np.add.at(result, faces[:, 1], face_normal)
    np.add.at(result, faces[:, 2], face_normal)
    lengths = np.linalg.norm(result, axis=1)
    result /= np.maximum(lengths[:, None], 1e-8)
    return result.astype(np.float32)


parts = []


def add(name, geometry, material):
    vertices, faces = geometry
    parts.append((name, vertices, normals(vertices, faces), faces, material))


add("鼎身", lathe([
    (0.025, 0.85), (0.56, 0.85), (0.73, 0.91), (0.86, 1.11),
    (0.96, 1.42), (0.99, 1.77), (0.94, 2.01), (0.87, 2.19),
    (0.82, 2.22), (0.73, 2.22), (0.67, 1.95), (0.62, 1.55),
    (0.53, 1.33), (0.18, 1.26), (0.025, 1.26),
]), 0)

for i, angle in enumerate((-math.pi / 2, math.pi / 6, 5 * math.pi / 6), 1):
    add(f"鼎足-{i}", leg(angle), 0)

for side, x in (("左", -0.72), ("右", 0.72)):
    add(f"鼎耳-{side}", torus(0.295, 0.083, (x, 2.40, 0), "xy", (0.77, 1.14)), 0)

add("纹饰-口沿", torus(0.82, 0.057, (0, 2.21, 0)), 1)
add("纹饰-上环", torus(0.968, 0.027, (0, 1.88, 0)), 1)
add("纹饰-下环", torus(0.921, 0.029, (0, 1.29, 0)), 1)

for i in range(20):
    angle = 2 * math.pi * i / 20
    radius = 0.99
    add(f"纹饰-乳钉-{i + 1}", sphere((radius * math.cos(angle), 1.61,
                                  radius * math.sin(angle)), 0.053), 1)


materials = [
    {"name": "青铜", "pbrMetallicRoughness": {
        "baseColorFactor": [0.23, 0.13, 0.055, 1], "metallicFactor": 0.68, "roughnessFactor": 0.44},
     "doubleSided": True},
    {"name": "磨光纹饰", "pbrMetallicRoughness": {
        "baseColorFactor": [0.43, 0.27, 0.115, 1], "metallicFactor": 0.73, "roughnessFactor": 0.34},
     "doubleSided": True},
]


def pad4(data):
    return data + b"\0" * ((-len(data)) % 4)


def build():
    binary = bytearray()
    gltf = {
        "asset": {"version": "2.0", "generator": "jiuzhou-ding placeholder generator"},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(parts)))}],
        "nodes": [], "meshes": [], "materials": materials,
        "accessors": [], "bufferViews": [], "buffers": [],
    }

    def append_data(array, component_type, type_name, target=None):
        offset = len(binary)
        raw = pad4(array.tobytes(order="C"))
        binary.extend(raw)
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(raw)}
        if target is not None:
            view["target"] = target
        view_index = len(gltf["bufferViews"])
        gltf["bufferViews"].append(view)
        accessor = {"bufferView": view_index, "componentType": component_type,
                    "count": len(array), "type": type_name}
        if type_name == "VEC3" and target == 34962:
            accessor["min"] = array.min(axis=0).astype(float).tolist()
            accessor["max"] = array.max(axis=0).astype(float).tolist()
        index = len(gltf["accessors"])
        gltf["accessors"].append(accessor)
        return index

    for name, vertices, vertex_normals, faces, material in parts:
        position = append_data(vertices.astype("<f4"), 5126, "VEC3", 34962)
        normal = append_data(vertex_normals.astype("<f4"), 5126, "VEC3", 34962)
        indices = append_data(faces.reshape(-1).astype("<u4"), 5125, "SCALAR", 34963)
        gltf["meshes"].append({"name": name, "primitives": [{
            "attributes": {"POSITION": position, "NORMAL": normal},
            "indices": indices, "material": material, "mode": 4,
        }]})
        gltf["nodes"].append({"name": name, "mesh": len(gltf["meshes"]) - 1})

    gltf["buffers"] = [{"byteLength": len(binary)}]
    json_chunk = json.dumps(gltf, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_chunk += b" " * ((-len(json_chunk)) % 4)
    body = struct.pack("<I4s", len(json_chunk), b"JSON") + json_chunk
    body += struct.pack("<I4s", len(binary), b"BIN\0") + binary
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_bytes(struct.pack("<4sII", b"glTF", 2, 12 + len(body)) + body)
    print(f"Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes, {len(parts)} meshes)")


if __name__ == "__main__":
    build()
