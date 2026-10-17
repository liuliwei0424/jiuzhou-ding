import { SceneManager } from './SceneManager.js';
import './scene.css';

/** Temporary Day 1 feedback inside P4's existing scene mount point. */
export function mountScene(root) {
  const status = document.createElement('p');
  status.className = 'p3-scene-status';
  status.setAttribute('role', 'status');
  status.textContent = '正在加载鼎模型…';

  const pick = document.createElement('p');
  pick.className = 'p3-pick-status';
  pick.setAttribute('aria-live', 'polite');
  pick.textContent = '拖动旋转 · 滚轮缩放 · 点击部件拾取';
  root.replaceChildren(status, pick);

  const scene = new SceneManager(root, {
    onProgress(fraction) {
      status.textContent = fraction === null
        ? '正在加载鼎模型…'
        : `正在加载鼎模型… ${Math.round(fraction * 100)}%`;
    },
    onFallback() {
      status.textContent = 'P2 正式模型未就绪，切换至 P3 占位模型…';
    },
    onReady({ source }) {
      if (source === 'official') {
        status.hidden = true;
      } else {
        status.textContent = '当前为 P3 开发占位模型 · 艺术复原示意，非考古还原';
      }
    },
    onError(error) {
      status.setAttribute('role', 'alert');
      status.textContent = `3D 场景加载失败：${error.message}`;
    },
    onPick({ name, part, point }) {
      const label = name === part ? part : `${part} · ${name}`;
      pick.textContent = `${label} · 命中坐标 ${point.map((value) => value.toFixed(2)).join(' / ')}`;
    },
  });

  void scene.init();
  return {
    dispose() {
      scene.dispose();
      status.remove();
      pick.remove();
    },
  };
}
