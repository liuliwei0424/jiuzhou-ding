import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL_URL = `${import.meta.env.BASE_URL}models/ding-base.glb`;
const DEMO_MODEL_URL = `${import.meta.env.BASE_URL}models/p3-demo-ding.glb`;
const DEFAULT_CAMERA = new THREE.Vector3(5.1, 3.65, 6.8);
const DEFAULT_TARGET = new THREE.Vector3(0, 1.35, 0);

function disposeGraph(root) {
  const resources = new Set();
  root.traverse((object) => {
    if (!object.isMesh) return;
    if (object.geometry) resources.add(object.geometry);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material) return;
      resources.add(material);
      Object.values(material).forEach((value) => {
        if (value?.isTexture) resources.add(value);
      });
    });
  });
  resources.forEach((resource) => resource.dispose());
}

/**
 * P3's scene module. Mount in a P4-owned element. Component callbacks are
 * local integration hooks; project-wide events remain those in CONTRACT.md.
 */
export class SceneManager {
  constructor(container, { onProgress, onReady, onError, onPick, onFallback } = {}) {
    if (!(container instanceof HTMLElement)) throw new TypeError('SceneManager needs a DOM container');
    this.container = container;
    this.callbacks = { onProgress, onReady, onError, onPick, onFallback };
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    this.camera.position.copy(DEFAULT_CAMERA);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.model = null;
    this.disposed = false;
    this.animationFrame = null;
    this.pointerStart = null;
    this.selectionTimeout = null;
    this.selectedMesh = null;
    this.onResize = this.onResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.animate = this.animate.bind(this);
  }

  async init() {
    if (this.renderer || this.disposed) throw new Error('SceneManager 已初始化或已销毁');
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.95;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer.domElement.setAttribute('aria-label', '可旋转的三维青铜鼎');
      this.container.appendChild(this.renderer.domElement);

      this.scene.background = null;
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      this.environment = pmrem.fromScene(room, 0.04).texture;
      this.scene.environment = this.environment;
      room.dispose();
      pmrem.dispose();
      this.addLightsAndStage();

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.copy(DEFAULT_TARGET);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.065;
      this.controls.enablePan = false;
      this.controls.minDistance = 3.3;
      this.controls.maxDistance = 13;
      this.controls.minPolarAngle = 0.26;
      this.controls.maxPolarAngle = Math.PI / 2.07;
      this.controls.update();

      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.container);
      this.onResize();
      this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
      this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
      this.animate();

      const loader = new GLTFLoader();
      const trackProgress = (event) => {
        const progress = event.total ? Math.min(1, event.loaded / event.total) : null;
        this.callbacks.onProgress?.(progress);
      };
      let gltf;
      let source = 'official';
      try {
        gltf = await loader.loadAsync(MODEL_URL, trackProgress);
      } catch (officialError) {
        if (this.disposed) return;
        source = 'demo';
        this.callbacks.onFallback?.(officialError);
        gltf = await loader.loadAsync(DEMO_MODEL_URL, trackProgress);
      }
      if (this.disposed) {
        disposeGraph(gltf.scene);
        return;
      }
      this.model = gltf.scene;
      this.fitModel();
      this.scene.add(this.model);
      this.assetSource = source;
      this.callbacks.onReady?.({ source });
    } catch (error) {
      if (!this.disposed) {
        this.callbacks.onError?.(error);
      }
    }
  }

  addLightsAndStage() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    this.scene.add(new THREE.HemisphereLight(0xd9eef2, 0x49321d, 0.8));

    const key = new THREE.DirectionalLight(0xffd6a0, 2.2);
    key.position.set(-3.5, 6, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.normalBias = 0.025;
    key.shadow.bias = -0.0002;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x8ccac4, 1.2);
    rim.position.set(4, 3.5, -4);
    this.scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(5.5, 96),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.32 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.035;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.05, 0.16, 96),
      new THREE.MeshStandardMaterial({ color: 0x2e3937, metalness: 0.42, roughness: 0.58 }),
    );
    pedestal.position.y = -0.12;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    const pedestalEdge = new THREE.Mesh(
      new THREE.TorusGeometry(1.96, 0.013, 8, 96),
      new THREE.MeshStandardMaterial({ color: 0x937b55, metalness: 0.8, roughness: 0.3 }),
    );
    pedestalEdge.rotation.x = Math.PI / 2;
    pedestalEdge.position.y = -0.04;
    this.scene.add(pedestalEdge);
  }

  fitModel() {
    const box = new THREE.Box3().setFromObject(this.model);
    if (box.isEmpty()) throw new Error('GLB 模型为空');
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 3.05 / Math.max(size.x, size.y, size.z);
    this.model.scale.setScalar(scale);
    this.model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    this.model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }

  onResize() {
    if (!this.renderer || this.disposed) return;
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  onPointerDown(event) {
    if (event.button !== 0) return;
    this.pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  onPointerUp(event) {
    const start = this.pointerStart;
    this.pointerStart = null;
    if (!start || start.id !== event.pointerId || !this.model) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.model, true)[0];
    if (!hit) return;

    const mesh = hit.object;
    const name = mesh.name || mesh.parent?.name || '鼎身';
    const part = this.inferPart(name);
    const point = hit.point.toArray();
    this.highlight(mesh);
    const detail = { name, part, point };
    this.callbacks.onPick?.(detail);
  }

  inferPart(name) {
    if (/鼎耳|ear|handle/i.test(name)) return '鼎耳';
    if (/鼎足|leg|foot/i.test(name)) return '鼎足';
    if (/纹饰|pattern|ornament/i.test(name)) return '纹饰';
    return '鼎身';
  }

  highlight(mesh) {
    this.clearHighlight();
    if (!mesh.material?.isMeshStandardMaterial) return;
    // Imported materials may be shared, so only the selected mesh receives a clone.
    this.selectedMesh = mesh;
    this.originalMaterial = mesh.material;
    mesh.material = mesh.material.clone();
    mesh.material.emissive.set('#c79b5d');
    mesh.material.emissiveIntensity = 0.5;
    this.selectionTimeout = window.setTimeout(() => this.clearHighlight(), 1000);
  }

  clearHighlight() {
    if (this.selectionTimeout) window.clearTimeout(this.selectionTimeout);
    if (this.selectedMesh && this.originalMaterial) {
      this.selectedMesh.material.dispose();
      this.selectedMesh.material = this.originalMaterial;
    }
    this.selectedMesh = null;
    this.originalMaterial = null;
    this.selectionTimeout = null;
  }

  resetView() {
    if (!this.controls) return;
    this.camera.position.copy(DEFAULT_CAMERA);
    this.controls.target.copy(DEFAULT_TARGET);
    this.controls.update();
  }

  animate() {
    if (this.disposed) return;
    this.animationFrame = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
    this.renderer?.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer?.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.clearHighlight();
    this.controls?.dispose();
    disposeGraph(this.scene);
    this.environment?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
