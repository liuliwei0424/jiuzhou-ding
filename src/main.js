import './style.css';
import { mountScene } from './scene/bootstrap.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <h1>九州鼎</h1>
      <p class="disclaimer">艺术复原示意，非考古还原</p>
    </header>
    <section class="workspace" aria-label="九州鼎交互场景">
      <div id="scene-root" class="scene-root" aria-label="3D 场景加载区域">
        <p>3D 场景挂载点（由 P3 接入 Three.js）</p>
      </div>
      <aside id="side-panel" class="side-panel" aria-label="九州信息面板">
        <h2>九州信息</h2>
        <p>信息面板挂载点（由 P4 实现）</p>
      </aside>
    </section>
  </main>
`;

const scene = mountScene(document.querySelector('#scene-root'));
if (import.meta.hot) import.meta.hot.dispose(() => scene.dispose());
