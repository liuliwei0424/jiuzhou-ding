import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const TAU = Math.PI * 2;
const supportsReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SITES = [
  {
    id: "site-erlitou",
    ordinal: "01",
    shortName: "二里头青铜鼎",
    name: "二里头文化青铜鼎",
    scope: "单件完整器示意",
    site: "河南偃师二里头遗址",
    dating: "约公元前1750—前1530年",
    era: "夏代中晚期",
    height: 0.2,
    radius: 0.0765,
    measurements: ["通高 约20 cm", "口径 约15.3 cm"],
    lede: "目前考古发现中时代很早的青铜鼎之一。它把陶鼎“三足承器”的经验带进青铜容器，薄壁、小耳与细弱锥足，显示出早期铸铜技术尚未追求厚重与繁缛。",
    form: "卷沿、小立耳、扁圆腹、三锥状空足，腹部饰带状连珠网格纹。",
    context: "二里头都邑出现专业化的青铜生产。鼎在此既是炊煮容器，也是新兴礼仪体系中的贵重器物；但“九鼎”传说尚不能与二里头材料直接对号。",
    evidence: [
      "器高与口径以发掘简报的约20 cm、15.3 cm控制比例。",
      "三足与双耳的方位按同类早期铜鼎的通行构造复原。",
      "网格纹带以疏密节奏示意，未把线条位置逐笔对应到唯一实物。"
    ],
    audit: {
      checked: [
        "通高、口径与三足承器的整体比例。",
        "小立耳与口沿的落点、三锥足的数量及外撇方向。",
        "网格纹带的位置和浅浮雕层位。"
      ],
      missing: [
        "尚未逐点复刻原器的壁厚变化、范线与补铸痕迹。",
        "连珠网格的单元数量、锈层分布和耳根接缝仍为研究示意。"
      ]
    },
    boundary: "这是“依据尺寸与器形描述重建的三维研究示意”。锈色、铸造气孔、壁厚变化和残缺情形并未逐点扫描，因此不能替代出土器物的科学记录。",
    palette: {
      bronze: "#58695b",
      patina: "#344e47",
      highlight: "#8e7b54",
      ornament: "#647060",
      floor: "#101815"
    },
    hotspots: [
      { id: "ear", label: "小立耳", point: [-0.64, 0.92, 0.08], title: "两枚小立耳", note: "立在口沿两侧，尺寸克制。耳孔用于穿杠搬移，也提示器物并非体量巨大的重器。" },
      { id: "grid", label: "网格纹带", point: [0, 0.61, 0.99], title: "连珠网格纹", note: "腹部的网格带是二里头青铜容器上的标志性装饰之一。三维模型以细凸线表现其节奏，不声称逐线复制原器。" },
      { id: "legs", label: "三锥足", point: [0, 0.2, 0.58], title: "细长锥状空足", note: "三足把器身抬离火源，锥足向地面收尖。早期薄壁铸造要求形制简省，足部也因此显得轻盈。" }
    ],
    sources: [
      "中国社会科学院考古研究所：《偃师二里头：1959—1978年考古发掘报告》，中国大百科全书出版社，1999年。",
      "中国青铜器全集编辑委员会：《中国青铜器全集·夏商1》，文物出版社。"
    ]
  },
  {
    id: "site-zenghouyi",
    ordinal: "02",
    shortName: "曾侯乙九鼎",
    name: "曾侯乙墓青铜九鼎八簋",
    scope: "九鼎中的单件代表器",
    site: "湖北随县（今随州）曾侯乙墓",
    dating: "战国早期，约公元前433年",
    era: "诸侯列鼎",
    height: 0.35,
    radius: 0.17,
    measurements: ["通高 约34—36 cm", "口径 约32—34.5 cm"],
    lede: "九件升鼎与八簋成组随葬，把等级秩序落实在可见的器数与陈设中。与二里头单件小鼎相比，这里的鼎更大、更重，附耳、束颈与蹄足也更适合复杂的礼仪空间。",
    form: "敞口、平折沿、附耳、束颈、鼓腹、平底、三蹄足；器身饰细密蟠螭纹与云雷纹，并有“曾侯乙作持用终”一类铭文。",
    context: "曾侯乙墓的鼎制实物反映战国早期高等级贵族对礼器组合的实践。它可以用于讨论列鼎与身份，但不能据此把文献中的“天子九鼎”直接当成每一座墓的固定制度。",
    evidence: [
      "九件升鼎的通高与口径以发掘资料给出的范围取中值。",
      "附耳、深腹与三蹄足依墓中升鼎的器形特征重建。",
      "蟠螭纹以连续回旋凸线示意纹样密度，未复制单件器物的完整纹样单元。"
    ],
    audit: {
      checked: [
        "单件代表器采用升鼎的宽折沿、附耳、束颈、鼓腹与三蹄足构造。",
        "附耳两端落在器壁外侧，不再穿过器身。",
        "青铜色与纹样亮度已按旧铜和铜绿重新压低。"
      ],
      missing: [
        "九件升鼎的大小序列、逐件尺寸和铭文差异尚未逐件建模。",
        "具体蟠螭单元、附耳截面、足根兽面和铸造垫片仍非实测数据。"
      ]
    },
    boundary: "九鼎是一组器物，而本页为了让形制差异可读，只呈现其中一件的代表器形。模型属于艺术研究复原，不是墓内原位的三维扫描，也不代表九件器完全同形。",
    palette: {
      bronze: "#686343",
      patina: "#3c5546",
      highlight: "#9a845a",
      ornament: "#786f4d",
      floor: "#131916"
    },
    hotspots: [
      { id: "rim", label: "平折沿", point: [0.08, 0.9, 0.94], title: "宽平折沿", note: "口沿向外平折，加强薄壁口部，也让器口在成排陈设中显得更为开阔。" },
      { id: "ear", label: "附耳", point: [0.96, 0.89, 0.12], title: "器身附耳", note: "耳附着于器壁而非独立高立于口沿，是战国升鼎常见的搬移结构。" },
      { id: "pattern", label: "蟠螭纹", point: [0, 0.58, 0.99], title: "细密蟠螭纹", note: "连续回旋的蟠螭纹利用模印与铸接组织成繁密纹带，与早期简省的网格纹形成鲜明对照。" },
      { id: "hoof", label: "三蹄足", point: [0.38, 0.19, 0.58], title: "短壮蹄足", note: "蹄足承托更重的器身，足根常带兽面或环带装饰。它让整体重心下降，视觉也更稳定。" }
    ],
    sources: [
      "湖北省博物馆：《曾侯乙墓》，文物出版社，1989年。",
      "湖北省博物馆等：《随县曾侯乙墓发掘简报》，《文物》1979年第7期。"
    ]
  },
  {
    id: "site-haihunhou",
    ordinal: "03",
    shortName: "海昏侯汉鼎",
    name: "海昏侯刘贺墓青铜鼎群",
    scope: "鼎群中的单件代表器",
    site: "江西南昌西汉海昏侯墓",
    dating: "西汉中晚期，约公元前59年",
    era: "汉代实用器",
    height: 0.26,
    radius: 0.1215,
    measurements: ["通高 约22.5—30 cm", "器别 尺寸不一"],
    lede: "有盖、可闭合、常带容量与重量铭刻的汉鼎，把青铜鼎从礼制组合进一步推向可计量的食官器具。它没有简单“终结”古礼，而是让礼器传统进入汉代日常供养与管理体系。",
    form: "器身厚重，覆钵形盖与盖钮完整，附耳、三兽蹄足；部分器物带“昌邑籍田”“食官”等铭文，并记容积、重量。",
    context: "海昏侯墓的鼎群类型丰富，既有礼仪陈设，也可归入食官体系。铭文和计量信息使器物能够被追踪、管理与分配，显示汉代诸侯王墓中礼制与实用功能并存。",
    evidence: [
      "以带盖、附耳、三兽蹄足和约22.5—30 cm通高范围作为代表器形。",
      "盖面三层弦带与盖钮按汉代覆钵形铜鼎的常见构造重建。",
      "器身铭文带只以栏线示意位置，不伪造具体字形或铭文内容。"
    ],
    audit: {
      checked: [
        "单件代表器包含覆钵盖、中央盖钮、附耳与三兽蹄足。",
        "附耳已降至器盖下方，并与器壁外侧留出明确间距。",
        "青铜底色、铜绿与磨损采用旧器观感。"
      ],
      missing: [
        "鼎群中多种尺寸与器型尚未逐一建模，不能把单件代表器等同于整群。",
        "盖合结构、兽面足细节、真实铭文字形和锈蚀分布未做扫描级复刻。"
      ]
    },
    boundary: "海昏侯墓不是“九鼎”墓，出土鼎群也不是同一尺寸的一整套。本模型取一类带盖鼎代表该鼎群，尺寸落在公开通高范围内；具体器号、铭文与锈蚀均未逐一对应。",
    palette: {
      bronze: "#705b3f",
      patina: "#3c554a",
      highlight: "#aa8658",
      ornament: "#8a714d",
      floor: "#171713"
    },
    hotspots: [
      { id: "lid", label: "覆钵盖", point: [0, 0.97, 0.04], title: "覆钵形器盖", note: "盖使鼎可以密闭保温，也改变了器物的视觉轮廓。汉鼎的“完整器”形象因此比早期无盖鼎更接近有盖的容器。" },
      { id: "knob", label: "盖钮", point: [0.02, 1.06, 0], title: "顶部盖钮", note: "中央盖钮便于揭盖，周围弦带既是装饰，也强化盖面的结构层次。" },
      { id: "inscription", label: "铭文带", point: [0, 0.66, 0.98], title: "铭文与计量", note: "部分海昏侯铜鼎刻有自名、机构和容积重量等信息。这些文字让器物从“身份象征”进一步成为可管理、可核验的日常器具。" },
      { id: "foot", label: "兽蹄足", point: [0.4, 0.17, 0.56], title: "三兽蹄足", note: "粗壮蹄足承托带盖器身。足根与足端常作兽形或弦环装饰，显示汉代青铜铸造对细节和稳定性的兼顾。" }
    ],
    sources: [
      "江西省文物考古研究院、南昌汉代海昏侯国遗址博物馆：《南昌汉代海昏侯国遗址》，文物出版社。",
      "江西省文物考古研究所等：《南昌市西汉海昏侯墓》，《考古》2016年第7期。"
    ]
  }
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(min, max, value) {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

function makeColorMaterial(site, source = "bronze", options = {}) {
  return new THREE.MeshStandardMaterial({
    color: site.palette[source],
    metalness: options.metalness ?? 0.78,
    roughness: options.roughness ?? 0.38,
    envMapIntensity: 0.7,
    side: THREE.DoubleSide
  });
}

function patinateGeometry(geometry, site, { seed = 0, roughness = 0.0011 } = {}) {
  const position = geometry.getAttribute("position");
  if (!position) return geometry;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const radial = Math.hypot(x, z);
    if (radial < 0.0001) continue;
    const wave =
      Math.sin(x * 173 + y * 321 + seed) * 0.44 +
      Math.sin(z * 211 - y * 139 + seed * 2.3) * 0.31 +
      Math.sin((x + z) * 391 + seed * 0.7) * 0.25;
    const nextRadius = Math.max(0, radial + wave * roughness);
    position.setX(i, x * (nextRadius / radial));
    position.setZ(i, z * (nextRadius / radial));
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  const bronze = new THREE.Color(site.palette.bronze);
  const patina = new THREE.Color(site.palette.patina);
  const highlight = new THREE.Color(site.palette.highlight);
  const colors = new Float32Array(position.count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const angle = Math.atan2(x, z);
    const field =
      Math.sin(angle * 7 + y * 103 + seed) * 0.34 +
      Math.sin(angle * 13 - y * 211 - seed * 1.8) * 0.24 +
      Math.sin((x - z) * 487 + seed * 2.1) * 0.22;
    const copper = smoothstep(-0.05, 0.68, field) * 0.25;
    const verdigris = smoothstep(0.2, 0.82, Math.sin(angle * 4 - y * 79 + seed) * 0.6 + field * 0.58);
    color.copy(bronze).lerp(highlight, copper * 0.68).lerp(patina, verdigris * 0.68);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function makeBodyMesh(site, profile, seed) {
  const points = profile.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y));
  const geometry = new THREE.LatheGeometry(points, 112);
  patinateGeometry(geometry, site, { seed });
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    metalness: 0.82,
    roughness: 0.35,
    envMapIntensity: 0.82,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "器身";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeLidMesh(site, profile, seed) {
  const geometry = new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y)),
    112
  );
  patinateGeometry(geometry, site, { seed, roughness: 0.00075 });
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    metalness: 0.8,
    roughness: 0.37,
    envMapIntensity: 0.8,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "器盖";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addRing(parent, y, radius, tube, material, segments = 112) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, segments);
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  mesh.castShadow = true;
  meshesWithShadow(mesh);
  parent.add(mesh);
  return mesh;
}

function meshesWithShadow(object, cast = true, receive = true) {
  if (object.isMesh) {
    object.castShadow = cast;
    object.receiveShadow = receive;
  }
}

function addTube(parent, points, radius, material, closed = false, tubularSegments = 36) {
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal", 0.42);
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, 7, closed);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addBar(parent, start, end, radius, material, segments = 12) {
  const direction = end.clone().sub(start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, segments, 3, false);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function radiusAt(profile, y) {
  for (let i = 0; i < profile.length - 1; i += 1) {
    const current = profile[i];
    const next = profile[i + 1];
    if (y >= Math.min(current[1], next[1]) && y <= Math.max(current[1], next[1])) {
      if (Math.abs(next[1] - current[1]) < 0.00001) return Math.max(current[0], next[0]);
      const t = (y - current[1]) / (next[1] - current[1]);
      return current[0] + (next[0] - current[0]) * t;
    }
  }
  return profile[profile.length - 1][0];
}

function addGridBand(parent, { y0, y1, profile, material }) {
  const rows = 4;
  for (let row = 0; row < rows; row += 1) {
    const y = y0 + ((y1 - y0) * row) / (rows - 1);
    addRing(parent, y, radiusAt(profile, y) + 0.00055, 0.00075, material);
  }

  const count = 28;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU;
    const points = [0, 0.25, 0.5, 0.75, 1].map((step) => {
      const y = y0 + (y1 - y0) * step;
      const r = radiusAt(profile, y) + 0.0007;
      return new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r);
    });
    addTube(parent, points, 0.00034, material, false, 11);
  }
}

function addCloudMotifs(parent, { y, profile, count, material, invert = 1 }) {
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * TAU + 0.04;
    const normal = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const tangent = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
    const up = new THREE.Vector3(0, 1, 0);
    const scale = 0.016 + (index % 3) * 0.0015;
    const raw = [
      [-0.62, -0.06],
      [-0.34, 0.25],
      [0.02, 0.44],
      [0.36, 0.31],
      [0.47, 0.02],
      [0.25, -0.2],
      [0.43, -0.41],
      [0.17, -0.55],
      [-0.04, -0.34],
      [-0.26, -0.18]
    ];
    const points = raw.map(([tangentOffset, verticalOffset]) => {
      const localY = y + verticalOffset * scale * invert;
      const localRadius = radiusAt(profile, localY) + 0.0008;
      return normal
        .clone()
        .multiplyScalar(localRadius)
        .addScaledVector(tangent, tangentOffset * scale)
        .addScaledVector(up, localY);
    });
    addTube(parent, points, 0.00072, material, false, 16);
  }
}

function addWavyBand(parent, { y, profile, amplitude, material, waves = 7 }) {
  const points = [];
  const count = 84;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU;
    const localY = y + Math.sin(angle * waves) * amplitude;
    const localRadius = radiusAt(profile, localY) + 0.00085;
    points.push(new THREE.Vector3(Math.sin(angle) * localRadius, localY, Math.cos(angle) * localRadius));
  }
  addTube(parent, points, 0.0009, material, true, 190);
}

function addConicalLeg(parent, angle, { height, inset, topRadius, material }) {
  const leg = new THREE.Group();
  leg.name = "足";
  const geometry = new THREE.CylinderGeometry(topRadius, 0.0012, height, 14, 10, false);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height / 2;
  meshesWithShadow(mesh);
  leg.add(mesh);
  leg.position.set(Math.sin(angle) * inset, 0, Math.cos(angle) * inset);
  leg.rotation.x = Math.cos(angle) * 0.08;
  leg.rotation.z = -Math.sin(angle) * 0.08;
  leg.userData.explode = new THREE.Vector3(
    Math.sin(angle) * 0.022,
    -0.006,
    Math.cos(angle) * 0.022
  );
  parent.add(leg);
  return leg;
}

function addHoofLeg(parent, angle, { height, inset, material, accent }) {
  const leg = new THREE.Group();
  leg.name = "足";
  const radialX = Math.sin(angle);
  const radialZ = Math.cos(angle);

  const upperGeometry = new THREE.CylinderGeometry(0.018, 0.012, height * 0.48, 16, 5);
  const upper = new THREE.Mesh(upperGeometry, material);
  upper.position.y = height * 0.76;
  meshesWithShadow(upper);
  leg.add(upper);

  const lowerGeometry = new THREE.CylinderGeometry(0.012, 0.019, height * 0.58, 16, 7);
  const lower = new THREE.Mesh(lowerGeometry, material);
  lower.position.y = height * 0.27;
  meshesWithShadow(lower);
  leg.add(lower);

  const cuffGeometry = new THREE.TorusGeometry(0.018, 0.0028, 7, 36);
  cuffGeometry.rotateX(Math.PI / 2);
  const cuff = new THREE.Mesh(cuffGeometry, accent);
  cuff.position.y = height * 0.49;
  meshesWithShadow(cuff);
  leg.add(cuff);

  const hoofGeometry = new THREE.SphereGeometry(0.019, 18, 10, 0, TAU, 0, Math.PI * 0.62);
  hoofGeometry.scale(1.04, 0.62, 1.25);
  const hoof = new THREE.Mesh(hoofGeometry, material);
  hoof.position.set(0, 0.007, 0.002);
  meshesWithShadow(hoof);
  leg.add(hoof);

  const faceGeometry = new THREE.SphereGeometry(0.011, 14, 8);
  faceGeometry.scale(1.0, 0.58, 0.36);
  const face = new THREE.Mesh(faceGeometry, accent);
  face.position.set(radialX * 0.012, height * 0.43, radialZ * 0.012);
  face.lookAt(radialX * 0.2, height * 0.43, radialZ * 0.2);
  leg.add(face);

  leg.position.set(radialX * inset, 0, radialZ * inset);
  leg.rotation.x = radialZ * 0.045;
  leg.rotation.z = -radialX * 0.045;
  leg.userData.explode = new THREE.Vector3(radialX * 0.032, -0.004, radialZ * 0.032);
  parent.add(leg);
  return leg;
}

function addUprightEar(parent, side, { rimY, topY, innerX, outerX, footInnerX, footOuterX, material }) {
  const part = new THREE.Group();
  part.name = "立耳";
  const x = side * innerX;
  const xOuter = side * outerX;
  const xFootInner = side * footInnerX;
  const xFootOuter = side * footOuterX;
  const footY = rimY + 0.0012;
  const top = topY - 0.0026;
  const innerTop = new THREE.Vector3(x, top, 0);
  const outerTop = new THREE.Vector3(xOuter, top, 0);
  addBar(part, new THREE.Vector3(xFootInner, footY, 0), innerTop, 0.00265, material);
  addBar(part, new THREE.Vector3(xFootOuter, footY, 0), outerTop, 0.00265, material);
  addBar(part, innerTop, outerTop, 0.00265, material, 16);
  for (const corner of [innerTop, outerTop]) {
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.00265, 10, 7), material);
    joint.position.copy(corner);
    meshesWithShadow(joint);
    part.add(joint);
  }
  for (const anchorX of [xFootInner, xFootOuter]) {
    const footGeometry = new THREE.SphereGeometry(0.0038, 12, 8);
    footGeometry.scale(1.0, 0.55, 1.35);
    const foot = new THREE.Mesh(footGeometry, material);
    foot.position.set(anchorX, rimY + 0.0004, 0);
    meshesWithShadow(foot);
    part.add(foot);
  }
  part.userData.explode = new THREE.Vector3(side * 0.025, 0.012, 0);
  parent.add(part);
  return part;
}

function addAttachedEar(parent, side, { profile, bottomY, topY, material, projection = 0.028, accent = material }) {
  const part = new THREE.Group();
  part.name = "附耳";
  const lowerRadius = radiusAt(profile, bottomY);
  const upperAnchorY = topY - Math.min(0.026, (topY - bottomY) * 0.5);
  const upperAnchorRadius = radiusAt(profile, upperAnchorY);
  const middleY = (bottomY + topY) / 2;
  const middleRadius = radiusAt(profile, middleY);
  const points = [
    new THREE.Vector3(side * (lowerRadius + 0.0007), bottomY, 0),
    new THREE.Vector3(side * (lowerRadius + projection * 0.56), bottomY + 0.006, 0),
    new THREE.Vector3(side * (middleRadius + projection), middleY, 0),
    new THREE.Vector3(side * (upperAnchorRadius + projection * 0.82), topY - 0.012, 0),
    new THREE.Vector3(side * (upperAnchorRadius + projection * 0.72), topY, 0),
    new THREE.Vector3(side * (upperAnchorRadius + 0.001), upperAnchorY, 0)
  ];
  addTube(part, points, 0.0041, material, false, 44);
  const bossGeometry = new THREE.SphereGeometry(0.0062, 14, 9);
  bossGeometry.scale(0.52, 1.25, 1);
  const boss = new THREE.Mesh(bossGeometry, accent);
  boss.position.set(side * (lowerRadius + 0.001), bottomY + 0.0015, 0);
  meshesWithShadow(boss);
  part.add(boss);
  part.userData.explode = new THREE.Vector3(side * 0.032, 0.01, 0);
  parent.add(part);
  return part;
}

function buildErlitou(site) {
  const root = new THREE.Group();
  root.name = "二里头文化青铜鼎复原";
  const parts = [];
  const profile = [
    [0.0001, 0.073],
    [0.042, 0.0735],
    [0.066, 0.082],
    [0.0758, 0.102],
    [0.0745, 0.125],
    [0.0715, 0.151],
    [0.0685, 0.174],
    [0.0735, 0.184],
    [0.0685, 0.184],
    [0.0635, 0.174],
    [0.0665, 0.151],
    [0.0695, 0.125],
    [0.0708, 0.102],
    [0.0605, 0.082],
    [0.0375, 0.0785],
    [0.0001, 0.078]
  ];
  const body = new THREE.Group();
  body.name = "器身";
  body.add(makeBodyMesh(site, profile, 1.3));
  root.add(body);
  parts.push(body);

  const ornament = makeColorMaterial(site, "ornament", { metalness: 0.72, roughness: 0.48 });
  addGridBand(body, { y0: 0.108, y1: 0.143, profile, material: ornament });
  addRing(body, 0.166, radiusAt(profile, 0.166) + 0.0005, 0.00075, ornament);

  const legMaterial = makeColorMaterial(site, "bronze", { metalness: 0.76, roughness: 0.43 });
  [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6].forEach((angle) => {
    parts.push(addConicalLeg(root, angle, {
      height: 0.079,
      inset: 0.035,
      topRadius: 0.010,
      material: legMaterial
    }));
  });

  const earMaterial = makeColorMaterial(site, "highlight", { metalness: 0.72, roughness: 0.46 });
  parts.push(addUprightEar(root, -1, {
    rimY: 0.1835,
    topY: 0.199,
    innerX: 0.0595,
    outerX: 0.074,
    footInnerX: 0.0675,
    footOuterX: 0.0728,
    material: earMaterial
  }));
  parts.push(addUprightEar(root, 1, {
    rimY: 0.1835,
    topY: 0.199,
    innerX: 0.0595,
    outerX: 0.074,
    footInnerX: 0.0675,
    footOuterX: 0.0728,
    material: earMaterial
  }));

  return {
    root,
    parts,
    height: site.height,
    radius: site.radius,
    materials: [ornament, legMaterial, earMaterial]
  };
}

function buildZenghouyi(site) {
  const root = new THREE.Group();
  root.name = "曾侯乙墓青铜升鼎复原";
  const parts = [];
  const profile = [
    [0.0001, 0.105],
    [0.058, 0.108],
    [0.113, 0.131],
    [0.151, 0.17],
    [0.166, 0.213],
    [0.16, 0.252],
    [0.144, 0.291],
    [0.159, 0.316],
    [0.169, 0.327],
    [0.163, 0.327],
    [0.153, 0.316],
    [0.138, 0.291],
    [0.154, 0.252],
    [0.16, 0.213],
    [0.145, 0.17],
    [0.107, 0.137],
    [0.052, 0.114],
    [0.0001, 0.113]
  ];
  const body = new THREE.Group();
  body.name = "器身";
  body.add(makeBodyMesh(site, profile, 2.7));
  root.add(body);
  parts.push(body);

  const bandMaterial = makeColorMaterial(site, "ornament", { metalness: 0.66, roughness: 0.54 });
  [0.169, 0.194, 0.247, 0.282].forEach((y) => addRing(body, y, radiusAt(profile, y) + 0.00055, 0.00105, bandMaterial));
  addCloudMotifs(body, { y: 0.211, profile, count: 18, material: bandMaterial });
  addCloudMotifs(body, { y: 0.234, profile, count: 14, material: bandMaterial, invert: -0.82 });
  addWavyBand(body, { y: 0.257, profile, amplitude: 0.005, material: bandMaterial, waves: 9 });
  addWavyBand(body, { y: 0.278, profile, amplitude: 0.0032, material: bandMaterial, waves: 12 });

  const legMaterial = makeColorMaterial(site, "bronze", { metalness: 0.8, roughness: 0.4 });
  const accent = makeColorMaterial(site, "highlight", { metalness: 0.75, roughness: 0.43 });
  [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6].forEach((angle) => {
    parts.push(addHoofLeg(root, angle, {
      height: 0.118,
      inset: 0.081,
      material: legMaterial,
      accent
    }));
  });

  parts.push(addAttachedEar(root, -1, {
    profile,
    bottomY: 0.287,
    topY: 0.349,
    material: legMaterial,
    accent,
    projection: 0.031
  }));
  parts.push(addAttachedEar(root, 1, {
    profile,
    bottomY: 0.287,
    topY: 0.349,
    material: legMaterial,
    accent,
    projection: 0.031
  }));

  return {
    root,
    parts,
    height: site.height,
    radius: site.radius,
    materials: [bandMaterial, legMaterial, accent]
  };
}

function buildHaihunhou(site) {
  const root = new THREE.Group();
  root.name = "海昏侯墓带盖铜鼎复原";
  const parts = [];
  const profile = [
    [0.0001, 0.084],
    [0.042, 0.086],
    [0.088, 0.097],
    [0.115, 0.122],
    [0.122, 0.16],
    [0.116, 0.198],
    [0.11, 0.215],
    [0.121, 0.221],
    [0.115, 0.221],
    [0.104, 0.214],
    [0.108, 0.197],
    [0.114, 0.16],
    [0.107, 0.125],
    [0.078, 0.104],
    [0.035, 0.094],
    [0.0001, 0.093]
  ];
  const body = new THREE.Group();
  body.name = "器身";
  body.add(makeBodyMesh(site, profile, 4.8));
  root.add(body);
  parts.push(body);

  const ornament = makeColorMaterial(site, "ornament", { metalness: 0.66, roughness: 0.5 });
  const highlight = makeColorMaterial(site, "highlight", { metalness: 0.72, roughness: 0.42 });
  [0.147, 0.154, 0.161, 0.204].forEach((y) => addRing(body, y, radiusAt(profile, y) + 0.00045, 0.00095, ornament));
  addCloudMotifs(body, { y: 0.178, profile, count: 16, material: ornament, invert: 0.8 });

  const lidPart = new THREE.Group();
  lidPart.name = "器盖";
  const lidProfile = [
    [0.0001, 0.253],
    [0.022, 0.252],
    [0.052, 0.248],
    [0.079, 0.24],
    [0.103, 0.229],
    [0.119, 0.218],
    [0.124, 0.208],
    [0.118, 0.204],
    [0.0001, 0.204]
  ];
  lidPart.add(makeLidMesh(site, lidProfile, 7.1));
  addRing(lidPart, 0.213, 0.117, 0.0016, highlight);
  addRing(lidPart, 0.226, 0.097, 0.00135, ornament);
  addRing(lidPart, 0.239, 0.06, 0.0011, ornament);

  const knobGeometry = new THREE.CylinderGeometry(0.012, 0.016, 0.009, 20, 4);
  const knob = new THREE.Mesh(knobGeometry, highlight);
  knob.position.y = 0.253;
  meshesWithShadow(knob);
  lidPart.add(knob);
  addRing(lidPart, 0.258, 0.013, 0.0027, highlight, 48);
  lidPart.userData.explode = new THREE.Vector3(0, 0.07, 0);
  root.add(lidPart);
  parts.push(lidPart);

  const legMaterial = makeColorMaterial(site, "bronze", { metalness: 0.8, roughness: 0.4 });
  const accent = makeColorMaterial(site, "highlight", { metalness: 0.78, roughness: 0.42 });
  [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6].forEach((angle) => {
    parts.push(addHoofLeg(root, angle, {
      height: 0.089,
      inset: 0.061,
      material: legMaterial,
      accent
    }));
  });

  parts.push(addAttachedEar(root, -1, {
    profile,
    bottomY: 0.183,
    topY: 0.218,
    material: legMaterial,
    accent,
    projection: 0.022
  }));
  parts.push(addAttachedEar(root, 1, {
    profile,
    bottomY: 0.183,
    topY: 0.218,
    material: legMaterial,
    accent,
    projection: 0.022
  }));

  return {
    root,
    parts,
    height: site.height,
    radius: site.radius,
    materials: [ornament, highlight, legMaterial, accent]
  };
}

function buildArtifact(site) {
  if (site.id === "site-erlitou") return buildErlitou(site);
  if (site.id === "site-zenghouyi") return buildZenghouyi(site);
  return buildHaihunhou(site);
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && value.isTexture) value.dispose();
      });
      material.dispose();
    });
  });
}

class DingViewer {
  constructor(container, { onHotspot } = {}) {
    this.container = container;
    this.onHotspot = onHotspot;
    this.site = null;
    this.model = null;
    this.rotationEnabled = !supportsReducedMotion;
    this.hotspots = [];
    this.pointer = new THREE.Vector2();
    this.frame = this.frame.bind(this);
    this.resize = this.resize.bind(this);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.02, 30);
    this.camera.position.set(2.15, 1.6, 2.8);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.setAttribute("aria-label", "可拖动旋转、滚轮或双指缩放的三维青铜鼎复原模型");
    this.renderer.domElement.tabIndex = 0;
    container.appendChild(this.renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.035).texture;
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.82;
    room.dispose();
    pmrem.dispose();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.68, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.55;
    this.controls.maxDistance = 5.1;
    this.controls.minPolarAngle = 0.35;
    this.controls.maxPolarAngle = Math.PI / 2.02;
    this.controls.autoRotate = this.rotationEnabled;
    this.controls.autoRotateSpeed = 0.62;
    this.fitCamera();

    const ambient = new THREE.AmbientLight(0xf2e8d4, 0.72);
    this.scene.add(ambient);
    const hemisphere = new THREE.HemisphereLight(0xd6e6dc, 0x2d2318, 1.5);
    hemisphere.position.set(0, 2.4, 0);
    this.scene.add(hemisphere);

    const key = new THREE.DirectionalLight(0xffe4b5, 3.2);
    key.position.set(-2.6, 4.6, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2.2;
    key.shadow.camera.right = 2.2;
    key.shadow.camera.top = 3.1;
    key.shadow.camera.bottom = -0.5;
    key.shadow.normalBias = 0.012;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x81baa7, 1.5);
    rim.position.set(3.6, 2.2, -2.8);
    this.scene.add(rim);

    const warm = new THREE.PointLight(0xdca66a, 5.4, 5.6, 2);
    warm.position.set(-1.4, 0.6, 2.1);
    this.scene.add(warm);

    this.floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.15, 96),
      new THREE.MeshStandardMaterial({
        color: 0x111b17,
        metalness: 0.08,
        roughness: 0.96,
        transparent: true,
        opacity: 0.84
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.008;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.13, 0.009, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x8a7351, transparent: true, opacity: 0.38 })
    );
    this.floorRing.rotation.x = Math.PI / 2;
    this.floorRing.position.y = -0.002;
    this.scene.add(this.floorRing);

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.resize();
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  setSite(site, hotspotLayer) {
    this.site = site;
    this.hotspotLayer = hotspotLayer;
    this.hotspotLayer.replaceChildren();
    this.hotspots = [];
    this.clearModel();

    const built = buildArtifact(site);
    this.model = built.root;
    this.parts = built.parts;
    const scale = 1.56 / 0.35;
    this.model.scale.setScalar(scale);
    this.scene.add(this.model);

    this.floor.material.color.set(site.palette.floor);
    this.floorRing.material.color.set(site.palette.highlight);
    this.floorRing.scale.setScalar(scale / (1.56 / 0.35));

    for (const hotspot of site.hotspots) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hotspot-pin";
      button.dataset.hotspotId = hotspot.id;
      button.setAttribute("aria-label", `${hotspot.title}，查看说明`);
      button.innerHTML = `<span>${hotspot.label}</span>`;
      button.addEventListener("click", () => this.onHotspot?.(hotspot));
      this.hotspotLayer.appendChild(button);
      this.hotspots.push({ ...hotspot, button });
    }

    this.controls.target.set(0, 0.73, 0);
    this.controls.autoRotate = this.rotationEnabled;
    this.fitCamera();
  }

  clearModel() {
    if (!this.model) return;
    this.scene.remove(this.model);
    disposeObject(this.model);
    this.model = null;
    this.parts = [];
  }

  setRotation(enabled) {
    this.rotationEnabled = enabled;
    this.controls.autoRotate = enabled;
  }

  reset() {
    this.fitCamera();
  }

  fitCamera() {
    if (!this.controls || !this.camera) return;
    const aspect = Math.max(0.36, this.camera.aspect || 1);
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitHeight = 1.73;
    const fitWidth = 1.92;
    const distance = Math.max(
      fitHeight / (2 * Math.tan(verticalFov / 2)),
      fitWidth / (2 * Math.tan(verticalFov / 2) * aspect)
    ) * 1.18;
    const clampedDistance = clamp(distance, 2.65, 6.4);
    const direction = new THREE.Vector3(0.62, 0.24, 0.75).normalize();
    this.controls.target.set(0, 0.73, 0);
    this.camera.position.copy(this.controls.target).addScaledVector(direction, clampedDistance);
    this.controls.minDistance = Math.max(1.55, clampedDistance * 0.68);
    this.controls.maxDistance = Math.max(5.1, clampedDistance * 1.72);
    this.controls.update();
  }

  updateHotspots() {
    if (!this.model || !this.hotspots.length) return;
    const { width, height } = this.container.getBoundingClientRect();
    this.model.updateMatrixWorld(true);

    for (const hotspot of this.hotspots) {
      const [xF, yF, zF] = hotspot.point;
      const point = new THREE.Vector3(
        xF * this.site.radius,
        yF * this.site.height,
        zF * this.site.radius
      );
      this.model.localToWorld(point);
      point.project(this.camera);
      const visible = point.z > -1 && point.z < 1;
      hotspot.button.hidden = !visible;
      if (!visible) continue;
      hotspot.button.style.left = `${(point.x * 0.5 + 0.5) * width}px`;
      hotspot.button.style.top = `${(-point.y * 0.5 + 0.5) * height}px`;
    }
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 760 ? 1.6 : 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.fitCamera();
  }

  frame() {
    this.animationFrame = requestAnimationFrame(this.frame);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateHotspots();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver.disconnect();
    this.clearModel();
    this.controls.dispose();
    disposeObject(this.scene);
    this.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}

function comparisonRows() {
  return [
    ["关键语境", "早期青铜容器生产兴起", "高等级贵族九鼎列陈", "食官体系与可计量器具"],
    ["器形重点", "薄壁、小耳、锥足", "宽沿、附耳、鼓腹、蹄足", "覆钵盖、附耳、兽蹄足"],
    ["纹饰策略", "较节制的网格带", "密集蟠螭与云雷纹", "弦带、兽面与铭文信息"],
    ["能说明什么", "青铜鼎的早期成形", "礼器组合与身份表达", "礼制传统与实用管理并存"],
    ["不能推出什么", "大禹铸九鼎的实物证据", "统一的“天子九鼎”定额", "礼制在汉代已经消失"]
  ];
}

function renderComparison() {
  return `
    <section class="comparison-notes" aria-labelledby="comparison-title">
      <div class="comparison-intro">
        <p class="lab-overline">不是一条直线</p>
        <h3 id="comparison-title">同一种器名，<br>三种历史答案</h3>
        <p>三件鼎跨越约一千七百年。把它们并置，是为了比较制度、工艺与使用场景的变化，而不是证明每件器之间存在直接传承关系。</p>
      </div>
      <div class="comparison-grid">
        <div class="comparison-row head">
          <strong>对照维度</strong>
          ${SITES.map((site) => `<strong>${site.shortName}</strong>`).join("")}
        </div>
        ${comparisonRows().map((row) => `
          <div class="comparison-row">
            <strong>${row[0]}</strong>
            <span>${row[1]}</span>
            <span>${row[2]}</span>
            <span>${row[3]}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSources() {
  return `
    <section class="source-shelf" aria-labelledby="sources-title">
      <div>
        <p class="lab-overline">方法说明</p>
        <h3 id="sources-title">怎样看待这次“复原”</h3>
        <p class="method-note">本页模型根据公开尺寸、器形描述与同类器物构造重建，重点表现形制关系，不是可量测的三维扫描。锈色、纹样细节、铸造修补与具体残缺状态均属于艺术研究示意。</p>
        <a class="sketchfab-link" href="https://sketchfab.com/search?q=Chinese%20bronze%20ding&amp;type=models" target="_blank" rel="noopener noreferrer">继续浏览 Sketchfab 公开模型 <span aria-hidden="true">↗</span></a>
      </div>
      <div>
        <p class="lab-overline">主要查阅材料</p>
        <ul class="source-list">
          ${SITES.map((site) => `<li><strong>${site.name}：</strong>${site.sources.join(" ")}</li>`).join("")}
        </ul>
      </div>
    </section>
  `;
}

function renderSiteReadout(site) {
  return `
    <div class="readout-index">
      <span>${site.ordinal} / 03</span>
      <span>${site.era}</span>
    </div>
    <h3>${site.name}</h3>
    <p class="readout-site">${site.site}</p>
    <p class="readout-date">${site.dating}</p>
    <p class="readout-lede">${site.lede}</p>
    <dl class="readout-facts">
      ${site.measurements.map((measurement, index) => {
        const [label, ...rest] = measurement.split(" ");
        return `
          <div class="readout-fact">
            <dt>${label}</dt>
            <dd>${rest.join(" ")}</dd>
          </div>
        `;
      }).join("")}
    </dl>
    <section class="readout-section">
      <h4>器形与使用</h4>
      <p>${site.form}</p>
    </section>
    <section class="readout-section">
      <h4>历史位置</h4>
      <p>${site.context}</p>
    </section>
    <section class="readout-section">
      <h4>复原依据</h4>
      <ul>${site.evidence.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
    <section class="readout-section model-audit">
      <h4>器形校验与已知缺口</h4>
      <div class="audit-row">
        <span>已校核</span>
        <ul>${site.audit.checked.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div class="audit-row is-gap">
        <span>尚未覆盖</span>
        <ul>${site.audit.missing.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </section>
    <div class="reconstruction-boundary">
      <strong>复原边界：</strong>${site.boundary}
    </div>
  `;
}

class ArchaeologyView {
  constructor(root, options = {}) {
    this.root = root;
    this.sites = SITES;
    this.onSelect = options.onSelect;
    this.selectedId = SITES[0].id;
    this.previousSite = null;

    root.innerHTML = `
      <div class="restoration-lab">
        <div class="lab-page">
          <header class="lab-hero">
            <div>
              <p class="lab-kicker">考古材料 × 三维器形</p>
              <h2>让沉默的青铜，<br>重新<em>立起来</em>。</h2>
              <p class="lab-hero-copy">从二里头的薄壁小鼎，到曾侯乙的九鼎组合，再到海昏侯墓的可计量汉鼎：拖动模型，查看器形、纹饰与礼制语境的三个断面。</p>
            </div>
            <div class="lab-seal" aria-hidden="true">鼎</div>
          </header>

          <nav class="era-ribbon" aria-label="选择要复原的青铜鼎">
            ${SITES.map((site) => `
              <button class="era-stop" type="button" data-site-id="${site.id}" aria-pressed="false">
                <time>${site.dating.replace("约", "").replace("公元前", "前").split("，")[0]}</time>
                <span>${site.shortName} · ${site.era}</span>
              </button>
            `).join("")}
          </nav>

          <div class="workbench">
            <aside class="artifact-rail" aria-label="三件青铜鼎">
              <div class="rail-title">
                <p>三器对照</p>
                <strong>考古标本</strong>
              </div>
              <div role="tablist" aria-orientation="vertical">
                ${SITES.map((site) => `
                  <button class="artifact-choice" type="button" role="tab" data-site-id="${site.id}" aria-selected="false">
                    <span class="artifact-glyph" aria-hidden="true"><b>${site.ordinal}</b>鼎</span>
                    <span>
                      <span class="artifact-choice-index">${site.era}</span>
                      <strong>${site.shortName}</strong>
                      <small>${site.dating}</small>
                    </span>
                  </button>
                `).join("")}
              </div>
              <p class="rail-foot">拖动旋转 · 滚轮缩放<br>金色圆点可查看器形说明</p>
            </aside>

            <section class="model-chamber" aria-label="三维器形观察台">
              <div class="chamber-topline">
                <span class="chamber-label" id="model-scope-label">研究复原 · 单件完整器示意</span>
                <span class="chamber-index" id="model-index">01 / 03</span>
              </div>
              <div class="model-canvas" id="model-canvas"></div>
              <div class="hotspot-layer" id="hotspot-layer"></div>
              <div class="model-status" id="model-status" role="status" aria-live="polite">正在构建青铜器几何…</div>
              <div class="model-fallback" id="model-fallback" hidden>
                <p>当前浏览器无法启用 WebGL。右侧仍可查看完整器形资料与模型缺口说明。</p>
              </div>
              <div class="model-scale" aria-hidden="true">
                <div class="scale-bar"><span></span></div>
                <span id="scale-height">约20 cm</span>
              </div>
              <p class="model-hint">拖动旋转 · 双指或滚轮缩放</p>
              <div class="model-controls" role="group" aria-label="模型显示控制">
                <button type="button" data-control="rotate" aria-pressed="${supportsReducedMotion ? "false" : "true"}">自动旋转</button>
                <span class="control-spacer"></span>
                <button type="button" data-control="reset">重置视角</button>
              </div>
              <div class="hotspot-card" id="hotspot-card" hidden>
                <button type="button" data-control="close-hotspot" aria-label="关闭热点说明">×</button>
                <strong id="hotspot-title"></strong>
                <p id="hotspot-note"></p>
              </div>
            </section>

            <aside class="artifact-readout" id="artifact-readout" aria-live="polite"></aside>
          </div>

          ${renderComparison()}
          ${renderSources()}
        </div>
      </div>
    `;

    this.eraButtons = [...root.querySelectorAll(".era-stop")];
    this.tabButtons = [...root.querySelectorAll(".artifact-choice")];
    this.modelRoot = root.querySelector("#model-canvas");
    this.hotspotLayer = root.querySelector("#hotspot-layer");
    this.readout = root.querySelector("#artifact-readout");
    this.modelStatus = root.querySelector("#model-status");
    this.modelFallback = root.querySelector("#model-fallback");
    this.hotspotCard = root.querySelector("#hotspot-card");
    this.hotspotTitle = root.querySelector("#hotspot-title");
    this.hotspotNote = root.querySelector("#hotspot-note");
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    root.addEventListener("click", this.onClick);
    root.addEventListener("keydown", this.onKeyDown);

    try {
      this.viewer = new DingViewer(this.modelRoot, {
        onHotspot: (hotspot) => this.showHotspot(hotspot)
      });
      this.modelStatus.hidden = true;
    } catch (error) {
      console.error("三维复原视图初始化失败", error);
      this.modelStatus.hidden = true;
      this.modelFallback.hidden = false;
    }

    this.selectSite(SITES[0], false);
  }

  onClick(event) {
    const siteButton = event.target.closest("[data-site-id]");
    if (siteButton && this.root.contains(siteButton)) {
      const site = SITES.find((item) => item.id === siteButton.dataset.siteId);
      if (site) this.selectSite(site);
      return;
    }

    const control = event.target.closest("[data-control]");
    if (!control || !this.root.contains(control)) return;

    if (control.dataset.control === "rotate") {
      const active = control.getAttribute("aria-pressed") !== "true";
      control.setAttribute("aria-pressed", String(active));
      this.viewer?.setRotation(active);
    }

    if (control.dataset.control === "reset") {
      this.viewer?.reset();
    }

    if (control.dataset.control === "close-hotspot") {
      this.hotspotCard.hidden = true;
    }
  }

  onKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const button = event.target.closest(".artifact-choice");
    if (!button) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const index = this.tabButtons.indexOf(button);
    const next = this.tabButtons[(index + direction + this.tabButtons.length) % this.tabButtons.length];
    next.focus();
    this.selectSite(SITES.find((site) => site.id === next.dataset.siteId));
  }

  selectSite(site, notify = true) {
    this.previousSite = this.selectedId;
    this.selectedId = site.id;

    this.eraButtons.forEach((button) => {
      const active = button.dataset.siteId === site.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    this.tabButtons.forEach((button) => {
      const active = button.dataset.siteId === site.id;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    this.root.querySelector("#model-index").textContent = `${site.ordinal} / 03`;
    this.root.querySelector("#model-scope-label").textContent = `研究复原 · ${site.scope}`;
    this.root.querySelector("#scale-height").textContent = site.measurements[0];
    this.readout.innerHTML = renderSiteReadout(site);
    this.hotspotCard.hidden = true;

    if (this.viewer) {
      const previousTransform = this.getCardTransform();
      this.viewer.setSite(site, this.hotspotLayer);
      this.animateCardTransition(previousTransform);
    }

    if (notify) this.onSelect?.(site.id);
  }

  getCardTransform() {
    return this.readout.getBoundingClientRect().top;
  }

  animateCardTransition(previousTop) {
    if (supportsReducedMotion || !previousTop) return;
    const nextTop = this.readout.getBoundingClientRect().top;
    const offset = previousTop - nextTop;
    if (!Number.isFinite(offset) || Math.abs(offset) < 2) return;
    this.readout.animate(
      [
        { opacity: 0.72, transform: `translateY(${Math.min(offset, 28)}px)` },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" }
    );
  }

  showHotspot(hotspot) {
    this.hotspotTitle.textContent = hotspot.title;
    this.hotspotNote.textContent = hotspot.note;
    this.hotspotCard.hidden = false;
  }

  setActive() {
    if (!this.viewer) return;
    this.viewer.resize();
  }

  destroy() {
    this.root.removeEventListener("click", this.onClick);
    this.root.removeEventListener("keydown", this.onKeyDown);
    this.viewer?.dispose();
    this.root.replaceChildren();
  }
}

export { ArchaeologyView };
