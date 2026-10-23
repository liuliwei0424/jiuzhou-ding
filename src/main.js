import "./style.css";
import "./restoration.css";
import { ArchaeologyView } from "./restoration.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <a class="skip-link" href="#archaeology-root">跳到器形复原对照</a>
  <header class="team-topbar">
    <div class="team-brand">
      <span class="team-brand-mark" aria-hidden="true">九</span>
      <div>
        <p>数字展陈 · P4</p>
        <h1>九州鼎</h1>
      </div>
    </div>
    <div class="team-topbar-meta">
      <span class="team-section-label">青铜器复原对照</span>
      <span class="team-disclaimer">依据公开资料重建 · 非考古扫描还原</span>
    </div>
  </header>
  <main id="archaeology-root" aria-label="三件历史青铜鼎复原对照"></main>
`;

const view = new ArchaeologyView(app.querySelector("#archaeology-root"));

if (import.meta.hot) {
  import.meta.hot.dispose(() => view.destroy());
}
