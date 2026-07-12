# 雲上之旅：白色系主題＋場景感知音效＋部署 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓《雲上之旅：天堂遊記》的介面呈現「白（天堂）—暗（地府）—白（回天）」三段式視覺與聽覺，並公開部署到 GitHub Pages。

**Architecture:** 以 `body.theme-heaven` class 切換 CSS 變數雙主題（天堂白金／地府墨黑），由 `flow.js` 的換場點統一驅動；音效層新增 `setScene('heaven'|'hell')`，天堂環境音改輕風＋風鈴、鐵鍊聲只留地府。部署為純靜態網站推上 GitHub Pages。

**Tech Stack:** 原生 ES modules、CSS custom properties、WebAudio、Vitest（happy-dom）、gh CLI。無建置步驟、無新依賴。

## Global Constraints

- **絕不修改舊 repo** `C:\Users\yoyoc\Projects\hell-tour-game`（使用者明確要求）。本計畫全部在 `C:\Users\yoyoc\Projects\heaven-tour-game`。
- npm／git 一律在本機 repo 跑，**不要在 Google Drive 資料夾跑 npm**（會壞，見使用者記憶）。
- 純靜態網站：不得引入 bundler 或框架。
- 每個 Task 結束時 `npx vitest run` 必須 **162+ 全過**（新增測試只增不減）再 commit。
- 文案一律繁體中文；親子語氣（不陰森、不血腥）。
- 遊戲標題「雲上之旅：天堂遊記」；正式網址 `https://gustarsmile.github.io/heaven-tour-game/`（qr.png 已按此產生，改網址必須重跑 `npm run gen-qr`）。
- GitHub 帳號是 `gustarsmile`（不是信箱前綴 polarisgustar）。

## 現況（2026-07-13，commit 2f48af3）

已完成：故事腳本全改（序章雲上茶會／過場蓮台下凡／hall10 回天結局／十殿親子化）、UI 文案、7 張正式美術（gpt-image-2，廟宇彩繪白色系，PNG 原檔在 gitignored 的 `art-src/`）、磬聲改明亮風鈴、162 測試全過。設計文件：`docs/story-v2-heaven-frame.md`。

尚未做：本計畫的三個 Task。

---

### Task 1: CSS 雙主題與白霧轉場

**Files:**
- Modify: `css/style.css`（`:root` 變數區之後加 `body.theme-heaven` 覆寫、`.fog` 轉場層）
- Modify: `js/flow.js`（`runScreen`／`showCover` 加 `setTheme()`）
- Test: `tests/flow.test.js`（新增一個 it）

**Interfaces:**
- Produces: `setTheme(heaven: boolean)`（flow.js 模組內函式，不匯出）；`body.theme-heaven` class；`audio.setScene(name)` 的呼叫點（Task 2 實作該方法前先以 `audio.setScene?.(…)` optional-chaining 呼叫，避免順序耦合）。

- [ ] **Step 1: 寫失敗測試**（加在 `tests/flow.test.js` 的「全流程整合」describe 內，仿照既有測試的 fakeStorage/root 寫法）

```js
it('主題切換：封面與序章為天堂白，入殿轉暗', async () => {
  const storage = fakeStorage();
  const root = document.createElement('div');
  await startGame({ root, audio: fakeAudio(), nav: fakeNav(), storage, fetcher: fakeFetcher() });
  // 封面＝天堂
  expect(document.body.classList.contains('theme-heaven')).toBe(true);
  [...root.querySelectorAll('button')].find((b) => b.textContent.includes('完整遊歷')).click();
  // 序章＝天堂
  expect(document.body.classList.contains('theme-heaven')).toBe(true);
});
```

（`fakeAudio`/`fakeNav`/`fakeFetcher` 等 helper 名稱以檔內既有測試為準，照抄同檔案其他整合測試的建構方式。）

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/flow.test.js`
Expected: FAIL（body 沒有 theme-heaven class）

- [ ] **Step 3: flow.js 加 setTheme**

在 `runScreen` 函式之前加：

```js
const HEAVEN_SCREENS = new Set(['prologue']); // 天堂場景清單；封面另於 showCover 處理
function setTheme(heaven) {
  if (document.body.classList.contains('theme-heaven') === heaven) return;
  const fog = document.createElement('div');
  fog.className = 'fog';
  document.body.appendChild(fog);
  requestAnimationFrame(() => {
    document.body.classList.toggle('theme-heaven', heaven);
    fog.classList.add('fade');
    fog.addEventListener('transitionend', () => fog.remove(), { once: true });
    setTimeout(() => fog.remove(), 2000); // happy-dom 無 transition 事件的保險
  });
  audio.setScene?.(heaven ? 'heaven' : 'hell'); // Task 2 實作；實作前為 no-op
}
```

在 `runScreen(id)` 內 `currentScreenId = id;` 之後加一行：`setTheme(HEAVEN_SCREENS.has(id));`
在 `showCover()` 內 `currentScreenId = null;` 之後加一行：`setTheme(true);`

註：hall10 前段（孟婆亭～判詞）維持地府暗色，`mission` 文字本身描寫「衝出黑霧、天光大亮」，視覺留給結局圖；若要更講究可在 `finaleView.js` 的 `mission`/`done` 分支加 `document.body.classList.add('theme-heaven')`，但 YAGNI，先不做。

- [ ] **Step 4: style.css 加天堂主題覆寫**（緊接 `:root` 區塊之後）

```css
/* 天堂主題：雲白、鎏金、淡石青、粉霞（body.theme-heaven 由 flow.js 切換） */
body.theme-heaven {
  color-scheme: light;
  --ink: #f7f2e7;
  --ink-2: #fffdf6;
  --vermilion: #b0582a;
  --vermilion-dim: #d8a06a;
  --gold: #a9832a;
  --gold-dim: #cdb56e;
  --azure: #6f9fae;
  --paper: #4a3b28;
  --paper-dim: #8a795e;
  background: radial-gradient(ellipse at 50% -10%, #fffef9 0%, #f3ead4 60%, #e9dcba 100%);
}
body.theme-heaven .scene-box {
  background: linear-gradient(180deg, var(--ink-2), #f6eed9);
}
/* 白霧轉場 */
.fog {
  position: fixed; inset: 0; z-index: 999;
  background: #fdfaf2; opacity: 1; pointer-events: none;
  transition: opacity 1.2s ease;
}
.fog.fade { opacity: 0; }
body { transition: background 0.6s ease, color 0.6s ease; }
```

之後 `grep -n "#1d1710\|#2c231a\|#17130f" css/style.css`，凡在天堂主題下仍會露出的寫死深色（如 `.scene-box` 漸層第二色、按鈕底色），一律補 `body.theme-heaven …` 覆寫成 `#f6eed9` 系淺色。目視檢查方式見 Step 6。

- [ ] **Step 5: 跑測試確認通過**

Run: `npx vitest run`
Expected: 163+ 全過

- [ ] **Step 6: 人工目視**

Run: `npm run dev` → http://localhost:8000
確認：封面與序章為白金色調、文字深棕可讀；點進第一殿轉為墨黑；返回封面時白霧淡出。行動版寬 390 檢查按鈕對比度（淺底上 `.btn` 若看不清，補 `body.theme-heaven .btn` 邊框 `--gold`、字色 `--paper`）。

- [ ] **Step 7: Commit**

```bash
git add css/style.css js/flow.js tests/flow.test.js
git commit -m "天堂白色系雙主題：body.theme-heaven 變數覆寫＋白霧轉場"
```

---

### Task 2: 場景感知音效（天堂輕風風鈴／地府風聲鐵鍊）

**Files:**
- Modify: `js/audio.js`
- Test: `tests/audio.test.js`（新增一個 it）

**Interfaces:**
- Consumes: Task 1 的 `audio.setScene?.(…)` 呼叫點（若 Task 1 未做，本 Task 完成後該呼叫自動生效，順序可互換）。
- Produces: `audio.setScene(scene: 'heaven'|'hell')`，加入 `createAudio()` 回傳物件。

- [ ] **Step 1: 寫失敗測試**（加在 `tests/audio.test.js`，仿照既有 mock AudioContext 寫法）

```js
it('setScene 切換場景不擲錯，且重建環境音', () => {
  const a = createAudio({ storage: fakeStorage(), AC: FakeAC });
  a.startAmbient();
  expect(() => { a.setScene('hell'); a.setScene('heaven'); a.setScene('heaven'); }).not.toThrow();
});
```

（`fakeStorage`/`FakeAC` 名稱照該檔既有測試。）

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/audio.test.js`
Expected: FAIL（setScene is not a function）

- [ ] **Step 3: audio.js 實作**

在 `let ambient = null;` 之後加 `let scene = 'heaven';`。

在 `clank()` 之後新增：

```js
function windChime() { // 天堂環境點綴：一串輕風鈴（G6-C7-A6）
  const c = ensureCtx(); if (!c) return;
  const t = c.currentTime;
  for (const [freq, peak, delay] of [[1568, 0.03, 0], [2093, 0.02, 0.18], [1760, 0.025, 0.36]]) {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    env(g, t + delay, peak, 1.2);
    o.connect(g).connect(c.destination);
    o.start(t + delay); o.stop(t + delay + 1.3);
  }
}

function setScene(next) {
  if (scene === next) return;
  scene = next;
  if (ambient) { stopAmbient(); startAmbient(); } // 以新場景參數重建環境音
}
```

修改 `startAmbient()` 兩處：
- `lp.frequency.value = 320;` → `lp.frequency.value = scene === 'hell' ? 320 : 620;`（天堂風聲較清亮）
- `g.gain.value = 0.05;` → `g.gain.value = scene === 'hell' ? 0.05 : 0.035;`
- `const timer = setInterval(clank, 12000);` → `const timer = setInterval(scene === 'hell' ? clank : windChime, 12000);`（鐵鍊只在地府）

回傳物件加 `setScene`：`return { tick, chime, flip, startAmbient, stopAmbient, toggle, setScene, isEnabled: () => enabled };`

- [ ] **Step 4: 跑測試確認通過**

Run: `npx vitest run`
Expected: 全過

- [ ] **Step 5: 人工聽感**

Run: `npm run dev` → 封面點一下（解鎖 autoplay）等 12 秒應聽到輕風鈴；進第一殿後等 12 秒應變回鐵鍊遠響；答對判獄題的磬聲應為明亮琶音（已在 commit 2f48af3 改過，此處只驗證）。

- [ ] **Step 6: Commit**

```bash
git add js/audio.js tests/audio.test.js
git commit -m "場景感知音效：setScene 切換天堂風鈴／地府鐵鍊環境音"
```

---

### Task 3: 部署 GitHub Pages 與上線煙霧測試

**Files:**
- 無程式改動（`js/config.js` 的 `GAME_URL` 與 `assets/qr.png` 已就緒）

**Interfaces:**
- Consumes: repo 全部內容（純靜態，根目錄直接發佈）。
- Produces: 公開網址 `https://gustarsmile.github.io/heaven-tour-game/`。

- [ ] **Step 1: 建立 GitHub repo 並推送**

```bash
cd C:/Users/yoyoc/Projects/heaven-tour-game
gh auth status   # 確認登入帳號為 gustarsmile
gh repo create gustarsmile/heaven-tour-game --public --source . --push
```

Expected: repo 建立、main 分支推上。

- [ ] **Step 2: 啟用 Pages（根目錄）**

```bash
gh api repos/gustarsmile/heaven-tour-game/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

Expected: HTTP 201。若 409 表示已啟用，改用 `-X PUT` 更新。等 1–3 分鐘部署。

- [ ] **Step 3: 上線煙霧測試**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://gustarsmile.github.io/heaven-tour-game/
curl -s -o /dev/null -w "%{http_code}\n" https://gustarsmile.github.io/heaven-tour-game/assets/art/cover.webp
curl -s -o /dev/null -w "%{http_code}\n" https://gustarsmile.github.io/heaven-tour-game/assets/og.png
```

Expected: 三個都 200。再以 Playwright MCP（若可用）開首頁：檢查 console 零 error、封面圖與標題「雲上之旅」正確、手機視窗 390×844 版面不破。

- [ ] **Step 4: QR 實掃複驗**

`assets/qr.png` 應解碼為遊戲網址（測試 `tests/qr.test.js` 已守門）；請使用者用手機實掃線上版 QR 確認開啟的是 heaven-tour-game。

- [ ] **Step 5: 收尾**

- 提醒使用者：LINE／FB 分享預覽（og.png）需人工貼連結確認。
- 更新使用者記憶檔 `heaven-tour-game-project.md`：補上「已上線」與網址。

---

## 備註（給接手的 Model）

- 專案總覽讀 `docs/story-v2-heaven-frame.md`（故事框架、取材、已完成清單、美術 TODO）。
- 正式美術若要重生：風格前綴在該文件與舊專案階段 4 計畫；用 draw 技能生 PNG 到 `art-src/`，webp 壓縮流程參考 `scripts/optimize-art.mjs`（q60）與本次採用的 q50；美術總體積守門 6MB（`tests/art.test.js`）。
- 新角色立繪（南極仙翁、太白金星、齊天大聖）為可選加分項：生成後在 `prologue.json` 對應 line 節點加 `"img": "<檔名>.webp"` 即可，`render.js` 會自動顯示、缺檔優雅降級。
