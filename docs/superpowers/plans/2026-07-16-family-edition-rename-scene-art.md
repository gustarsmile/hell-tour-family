# 地獄遊記親子共讀版：更名＋序章換景＋回天看樹 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 序章依劇情分段換左上場景圖（含白色系濟公）、終幕結算「回天看樹」、全遊戲更名《地獄遊記・親子共讀版》（repo `hell-tour-family`），然後部署上線。

**Architecture:** 場景執行器（flow.js `runScene`）新增「場景圖軌跡」：節點帶 `art` 欄位者自該節點起換圖並延續、返回時回退；終幕 `done` 相位由 flow 切天堂主題、finaleView 以玩家 endingKey 對應花樹圖取代殿景。更名為 config 常數＋靜態字串的逐處替換，QR 重產。

**Tech Stack:** 原生 ES modules、Vitest（happy-dom）、sharp（webp 壓縮）、draw 技能（gpt-image-2 生圖）、gh CLI。無建置步驟、無新依賴。

**設計文件：** `docs/superpowers/specs/2026-07-16-family-edition-rename-and-scene-art-design.md`

## Global Constraints

- **絕不修改舊 repo** `C:\Users\yoyoc\Projects\hell-tour-game`。本計畫全部在 `C:\Users\yoyoc\Projects\heaven-tour-game`（Task 4 後資料夾將改名 `hell-tour-family`）。
- npm／git 一律在本機 repo 跑，不要在 Google Drive 資料夾跑 npm。
- 純靜態網站：不得引入 bundler、框架或新依賴。
- 每個 Task 結束時 `npx vitest run` 必須 **165+ 全過**（新增測試只增不減）再 commit。
- 守門不放寬：美術總體積 6MB（`tests/art.test.js`）、og.png 500KB、QR 解碼＝GAME_URL（`tests/qr.test.js`）。
- 文案、註解一律繁體中文；親子語氣（不陰森、不血腥）。
- 新名稱定案值：`GAME_TITLE = '地獄遊記・親子共讀版'`；`GAME_URL = 'https://gustarsmile.github.io/hell-tour-family/'`；封面主標「地獄遊記」、副標「親 子 共 讀 版」；tagline 不變。
- **原著書名引用一律保留不改**：`js/data/prologue.json` 的 `source.book: "天堂遊記"`、`js/data/hall10.json` 的 `source.label`（含《天堂遊記》）、README 對兩部善書的取材說明、封面 tagline「遊天堂」。
- GitHub 帳號是 `gustarsmile`。**Task 5 的 `gh repo create --public` 是公開發布動作，必須先取得使用者明確放行**（前次已被權限分類器擋下）。

## 現況（2026-07-16，commit dcc5c3d）

雙主題（body.theme-heaven＋白霧轉場）、場景感知音效（setScene）、終審對比修復皆完成，165 測試全過。尚未做：本計畫五個 Task。序章目前整場只有 `prologue-heaven.webp` 一張圖、intro2 有暗色舊立繪 `jigong-main.webp` 內嵌（風格衝突）；終幕結算畫面無樹圖、視覺停留暗色。

---

### Task 1: 生成 4 張白色系場景圖

**Files:**
- Create: `art-src/jigong-heaven.png`、`art-src/gate-nantianmen.png`、`art-src/yaochi-tea.png`、`art-src/tree-garden.png`（gitignored 原檔）
- Create: `assets/art/jigong-heaven.webp`、`assets/art/gate-nantianmen.webp`、`assets/art/yaochi-tea.webp`、`assets/art/tree-garden.webp`
- Modify: `tests/art.test.js`（ART_MANIFEST 41→45）

**Interfaces:**
- Produces: 4 張 1024×683 webp，檔名如上；Task 2 的 `prologue.json` 依這些檔名填 `art` 欄位。

- [ ] **Step 1: 更新 manifest 測試（先失敗）**

`tests/art.test.js` 的 `ART_MANIFEST` 陣列，在 `'prologue-heaven', 'interlude-descend',` 之後插入一行：

```js
  'jigong-heaven', 'gate-nantianmen', 'yaochi-tea', 'tree-garden',
```

同檔測試 `it('manifest 41 張齊備', …)` 改為：

```js
  it('manifest 45 張齊備', () => {
    expect(ART_MANIFEST.length).toBe(45);
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/art.test.js`
Expected: FAIL（4 個新檔不存在）

- [ ] **Step 3: 生圖（draw 技能腳本，--quality low）**

統一風格前綴（每個 prompt 開頭原樣使用，為舊專案廟宇彩繪前綴的白色系版）：

> 台灣廟宇彩繪與交趾陶風格插畫，溫暖祥和的宗教勸善繪卷，配色以雲白、鎏金、淡石青、粉霞為主，明亮雲白背景，礦物顏料質感與描金線條，構圖如廟宇壁畫。畫面莊嚴溫暖、明亮親切，適合長輩與孩童觀看。畫中不得出現任何文字。

```bash
cd C:/Users/yoyoc/Projects/heaven-tour-game
python C:/Users/yoyoc/.claude/skills/draw/draw.py "<前綴>濟公活佛半身像居畫面右側：破僧衣、手搖破蒲扇、腰掛酒葫蘆，笑容親切慈祥，立於金色蓮台上，白金雲海與祥雲繚繞" --size 1536x1024 --quality low --outdir art-src --name jigong-heaven
python C:/Users/yoyoc/.claude/skills/draw/draw.py "<前綴>南天門巍峨鎏金牌樓聳立雲海之上，門前一位毛茸茸的猴形天將手持金色長棒鎮守，姿態威風靈動帶笑意，白雲翻湧、仙鶴掠過" --size 1536x1024 --quality low --outdir art-src --name gate-nantianmen
python C:/Users/yoyoc/.claude/skills/draw/draw.py "<前綴>瑤池仙境白玉亭台浮於雲海，亭中白鬍長眉的老壽星與持拂塵的白袍仙人等神仙圍坐品茶談笑，亭邊一面圓形雲鏡泛著柔光，粉霞祥雲、仙鶴飛過" --size 1536x1024 --quality low --outdir art-src --name yaochi-tea
python C:/Users/yoyoc/.claude/skills/draw/draw.py "<前綴>天界花園遠景：園中種滿各式原靈花樹，有的繁花盛開結滿果實、有的枝葉斑黃，園徑蜿蜒，一棵小樹上掛著一塊空白小木牌，雲白鎏金、柔光普照" --size 1536x1024 --quality low --outdir art-src --name tree-garden
```

（`<前綴>` 替換為上方引文全文。draw.py 失敗（如 API 金鑰問題）→ 回報 BLOCKED，勿改用其他生圖方式。）

- [ ] **Step 4: 目檢原圖**

用 Read 工具逐張開 `art-src/*.png` 確認：畫面主題與描述相符、白色系配色、無任何文字、無恐怖細節。不合格的重生（同指令可加細節），最多重試 2 次，仍不合格回報 DONE_WITH_CONCERNS 附說明。

- [ ] **Step 5: 壓縮 webp（q50，僅此 4 張，勿跑全量 opt-art）**

```bash
node -e "const sharp=require('sharp');const ns=['jigong-heaven','gate-nantianmen','yaochi-tea','tree-garden'];(async()=>{for(const n of ns){await sharp('art-src/'+n+'.png').resize({width:1024,height:1024,fit:'inside'}).webp({quality:50}).toFile('assets/art/'+n+'.webp');console.log(n+'.webp')}})()"
```

- [ ] **Step 6: 跑測試確認通過（含 6MB 守門）**

Run: `npx vitest run tests/art.test.js`
Expected: 全過。若「總體積在 6MB 預算內」失敗，依序降級重壓直到過：(a) `quality:45`；(b) `quality:45` 且 `width:900,height:900`。守門值不得放寬。

- [ ] **Step 7: 全套測試＋Commit**

Run: `npx vitest run` → 165 全過（本 task 不加測試數）。

```bash
git add assets/art/jigong-heaven.webp assets/art/gate-nantianmen.webp assets/art/yaochi-tea.webp assets/art/tree-garden.webp tests/art.test.js
git commit -m "序章新美術 4 張：白色系濟公、南天門、瑤池茶會、原靈花樹園（manifest 45）"
```

---

### Task 2: 序章節點級換景（場景圖軌跡）

**Files:**
- Modify: `js/flow.js`（`runScene`，約 111–123 行）
- Modify: `js/data/prologue.json`（intro2 換 `art` 並移除 `img`；gate1／yao1／tree3 加 `art`）
- Test: `tests/flow.test.js`（「全流程整合」describe 內加一個 it）
- Test: `tests/data.test.js`（`validateScene` 的節點迴圈加 art/img 檔案存在驗證）

**Interfaces:**
- Consumes: Task 1 的 4 張 webp。
- Produces: 場景節點通用 `art` 欄位語意——「自該節點起左上場景圖換為該檔，延續至下一個帶 `art` 的節點，返回一步同步回退」。`renderNode` 介面不變（仍吃 `opts.art`）。

- [ ] **Step 1: 寫失敗測試（flow.test.js，加在「全流程整合」describe 內）**

```js
it('序章節點級換景：art 節點起換左上圖並延續，返回同步回退', async () => {
  const storage = fakeStorage();
  const root = document.createElement('div');
  let backFn = null;
  const nav = { setBack: (f) => { backFn = f; }, setMenu() {}, closeMenu() {}, toast() {} };
  await startGame({ root, loadJSON, storage, nav });
  [...root.querySelectorAll('button')].find((b) => b.textContent.includes('完整遊歷')).click();
  const artSrc = () => root.querySelector('.scene-art img').getAttribute('src');
  // intro1：場景級預設圖
  expect(artSrc()).toBe('assets/art/prologue-heaven.webp');
  // intro2（濟公自介）：換濟公圖，且不再有內嵌立繪
  root.querySelector('.btn-next').click();
  expect(artSrc()).toBe('assets/art/jigong-heaven.webp');
  expect(root.querySelector('.art-figure')).toBeNull();
  // intro3～ascend2 無 art 欄位：延續濟公圖
  for (let i = 0; i < 4; i++) root.querySelector('.btn-next').click();
  expect(artSrc()).toBe('assets/art/jigong-heaven.webp');
  // gate1：南天門
  root.querySelector('.btn-next').click();
  expect(artSrc()).toBe('assets/art/gate-nantianmen.webp');
  // 返回一步（回 ascend2）：回退為濟公圖
  backFn();
  expect(artSrc()).toBe('assets/art/jigong-heaven.webp');
});
```

（helper `fakeStorage`／`loadJSON` 為檔內既有；nav 物件形狀對齊 `NOOP_NAV = { setBack() {}, setMenu() {}, closeMenu() {}, toast() {} }`。）

- [ ] **Step 2: data.test.js 加資料守門（同屬本 task 的失敗測試）**

`tests/data.test.js` 的 `validateScene(scene)` 內 `for (const node of scene.nodes)` 迴圈開頭加：

```js
    if (node.art) expectArt(node.art);
    if (node.img) expectArt(node.img);
```

- [ ] **Step 3: 跑測試確認失敗**

Run: `npx vitest run tests/flow.test.js`
Expected: FAIL（intro2 仍是 prologue-heaven.webp 且存在 .art-figure）

- [ ] **Step 4: prologue.json 資料配置**

`js/data/prologue.json`：

- `intro2` 節點：`"img": "jigong-main.webp"` 整行**移除**，同位置加 `"art": "jigong-heaven.webp"`。
- `gate1` 節點：`"type": "line",` 之後加 `"art": "gate-nantianmen.webp",`。
- `yao1` 節點：同法加 `"art": "yaochi-tea.webp",`。
- `tree3` 節點：同法加 `"art": "tree-garden.webp",`。

（`jigong-main.webp` 仍被 `interlude.json` 與 `coverView.js` fallback 引用，**不刪檔**。）

- [ ] **Step 5: flow.js 實作場景圖軌跡**

`runScene` 整段替換為：

```js
  function runScene(sceneData, onEnd) {
    const player = createPlayer(sceneData, hooks);
    // 場景圖軌跡：節點帶 art 者自該節點起換左上場景圖，延續至下一個帶 art 的節點；返回時同步回退
    const artTrail = [player.current().art ?? sceneData.art];
    const step = () => {
      const node = player.current();
      if (node.type === 'end') { onEnd(); return; }
      setLocalBack(player.canBack() ? () => { player.back(); artTrail.pop(); step(); } : null);
      renderNode(node, {
        onAdvance: () => { player.advance(); artTrail.push(player.current().art ?? artTrail.at(-1)); step(); },
        onChoose: (i) => { player.choose(i); artTrail.push(player.current().art ?? artTrail.at(-1)); step(); },
      }, root, { art: artTrail.at(-1) });
    };
    step();
  }
```

（`choose()` 會清空 player 歷史、`canBack()` 隨之為 false，返回不會跨過 choice，artTrail 與步進恆同步。中斷續玩是整殿重跑（`runScreen` 由場景起點開始），無需另行推導。預載 `collectArtFiles` 遞迴撿所有 `.webp` 字串，新 `art` 欄位自動納入，毋須改。）

- [ ] **Step 6: 跑測試確認通過**

Run: `npx vitest run`
Expected: 166+ 全過

- [ ] **Step 7: Commit**

```bash
git add js/flow.js js/data/prologue.json tests/flow.test.js tests/data.test.js
git commit -m "序章節點級換景：art 欄位分段切換左上場景圖（濟公／南天門／瑤池／花樹園）"
```

---

### Task 3: 回天看樹（終幕結算切天堂＋花樹圖）

**Files:**
- Modify: `js/flow.js`（`runFinale` 的 `step`，約 219–224 行）
- Modify: `js/ui/finaleView.js`（`renderFinalePhase` 開頭 frame 的 art 選擇，約 22–24 行）
- Test: `tests/flow.test.js`（新 describe，仿檔尾「枉死城支線功德」的 miniFlow 寫法）

**Interfaces:**
- Consumes: `endingKey(state)`（engine/finale.js 既有）、`d.art.endings`（hall10.json 既有四樹對照）、flow 的 `setTheme(heaven)`（Task 1 接手計畫已有，閉包內函式）。
- Produces: 終幕 `done` 相位＝天堂主題＋左上花樹圖；其餘相位維持殿景與暗色。

- [ ] **Step 1: 寫失敗測試（flow.test.js 檔尾新 describe）**

```js
describe('回天看樹（終幕結算）', () => {
  const miniFlow = {
    screens: [
      { id: 'hall6', type: 'visit', src: 'hall6.json' },
      { id: 'hall10', type: 'finale', src: 'hall10.json' },
    ],
  };
  const miniLoad = async (p) =>
    p === 'js/data/flow.json' ? structuredClone(miniFlow) : loadJSON(p);

  it('done 相位切天堂主題、左上換玩家花樹圖；返回 mission 復為地府', async () => {
    document.body.classList.remove('theme-heaven');
    document.body.querySelectorAll('.fog').forEach((f) => f.remove());
    const storage = fakeStorage();
    const root = document.createElement('div');
    let backFn = null;
    const nav = { setBack: (f) => { backFn = f; }, setMenu() {}, closeMenu() {}, toast() {} };
    await startGame({ root, loadJSON: miniLoad, storage, nav });
    autoplay(root, storage, { acceptBranch: true }); // 全對全善 → highGood
    await nextFrame();
    expect(document.body.classList.contains('theme-heaven')).toBe(true);
    expect(root.querySelector('.scene-art img').getAttribute('src'))
      .toBe('assets/art/tree-highGood.webp');
    // 從結算返回上一步（mission）：主題復暗、左上復為轉輪殿景
    backFn();
    await nextFrame();
    expect(document.body.classList.contains('theme-heaven')).toBe(false);
    expect(root.querySelector('.scene-art img').getAttribute('src'))
      .toBe('assets/art/hall10-scene.webp');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/flow.test.js`
Expected: FAIL（done 相位 theme-heaven 為 false）

- [ ] **Step 3: flow.js——runFinale 的 step 開頭加主題同步**

```js
    const step = () => {
      setTheme(finale.phase === 'done'); // 回天看樹：結算切回天堂白，自結算返回則復暗
      setLocalBack(finale.phase !== finale.phases[0]
        ? () => { prevFinalePhase(finale); step(); }
        : null);
      renderFinalePhase(finale, handlers, root);
    };
```

（`runScreen` 進 hall10 時已 `setTheme(false)`，mengpo～mission 各相位呼叫為 no-op；分享卡返回、善書冊疊層不經 `step()` 之外的主題路徑，維持天堂；「重新開始」走 `showCover()` 本來就是天堂。）

- [ ] **Step 4: finaleView.js——done 相位左上換花樹**

`renderFinalePhase` 開頭（`const s = finale.state;` 之後）把既有 `const frame = sceneFrame('scene-box finale-box', d.art?.scene);` 替換為：

```js
  // 回天看樹：結算畫面左上改顯玩家的原靈花樹（四版依悟性×心性），其餘相位維持殿景
  const sceneArt = finale.phase === 'done'
    ? d.art?.endings?.[endingKey(s)] ?? d.art?.scene
    : d.art?.scene;
  const frame = sceneFrame('scene-box finale-box', sceneArt);
```

（`endingKey` 檔案第 2 行已 import，毋須新增。）

- [ ] **Step 5: 跑測試確認通過**

Run: `npx vitest run`
Expected: 167+ 全過

- [ ] **Step 6: Commit**

```bash
git add js/flow.js js/ui/finaleView.js tests/flow.test.js
git commit -m "回天看樹：終幕結算切天堂主題、左上場景圖換玩家的原靈花樹"
```

---

### Task 4: 更名《地獄遊記・親子共讀版》（repo hell-tour-family）

**Files:**
- Modify: `js/config.js`（GAME_TITLE、GAME_URL）
- Modify: `tests/config.test.js`（標題斷言）
- Modify: `js/ui/coverView.js`（封面主標、副標）
- Modify: `index.html`（title、description、og:title、og:description、og:url、og:image）
- Modify: `js/ui/finaleView.js`（分享卡下載檔名 ×2）
- Modify: `package.json`（name）＋ `package-lock.json`（用 npm 指令同步，勿手改）
- Modify: `README.md`（標題、簡介、正式網址）
- Modify: `docs/story-v2-heaven-frame.md`（檔頭加更名註記一行）
- Regenerate: `assets/qr.png`（`npm run gen-qr`）

**Interfaces:**
- Consumes: 全部既有。`tests/qr.test.js` 與 `tests/html.test.js` 會以新 `GAME_URL` 自動複驗。
- Produces: 新名稱／網址單一事實來源在 `js/config.js`；靜態檔（index.html、README）與其一致。

- [ ] **Step 1: 改測試斷言（先失敗）**

`tests/config.test.js`：

```js
  it('定義遊戲標題', () => {
    expect(GAME_TITLE).toBe('地獄遊記・親子共讀版');
  });
```

Run: `npx vitest run tests/config.test.js`
Expected: FAIL

- [ ] **Step 2: config.js**

```js
export const GAME_TITLE = '地獄遊記・親子共讀版';
```

```js
// 部署定址：GitHub Pages（帳號 gustarsmile）。改此值後必須重跑 npm run gen-qr。
export const GAME_URL = 'https://gustarsmile.github.io/hell-tour-family/';
```

- [ ] **Step 3: coverView.js（16–17 行）**

```js
  body.appendChild(el('div', 'cover-title', '地獄遊記'));
  body.appendChild(el('div', 'cover-subtitle', '親 子 共 讀 版'));
```

（tagline「乘蓮台・遊天堂・訪地府——回來，看看你的花樹。」不動。）

- [ ] **Step 4: index.html（head 內六處）**

```html
  <title>地獄遊記・親子共讀版</title>
  <meta name="description" content="地獄遊記・親子共讀版——取材《地獄遊記》《天堂遊記》兩部善書的親子網頁遊戲。乘蓮台上天堂、隨濟公訪地府見習，回瑤池看看你的原靈花樹開了幾朵花。">
  <meta property="og:type" content="website">
  <meta property="og:title" content="地獄遊記・親子共讀版">
  <meta property="og:description" content="取材《地獄遊記》《天堂遊記》。乘蓮台・遊天堂・訪地府——回來，看看你的花樹。親子同遊的善書勸化遊戲。">
  <meta property="og:url" content="https://gustarsmile.github.io/hell-tour-family/">
  <meta property="og:image" content="https://gustarsmile.github.io/hell-tour-family/assets/og.png">
```

- [ ] **Step 5: finaleView.js 分享卡檔名（126、138 行兩處）**

`'雲上之旅-稱號卡.png'` → `'地獄遊記親子版-稱號卡.png'`

- [ ] **Step 6: package.json name＋lock 同步**

`package.json`：`"name": "hell-tour-family",`

```bash
npm install --package-lock-only
```

- [ ] **Step 7: README.md**

- 第 1 行：`# 地獄遊記・親子共讀版`
- 第 3 行改為：`依《地獄遊記》《天堂遊記》兩部善書改編的親子教育網頁遊戲（自 hell-tour-game 分支，故事框架「天堂—地府—天堂」）。此為完整一輪遊：`
- 第 27 行網址改為：`` 正式網址：`https://gustarsmile.github.io/hell-tour-family/`（`js/config.js` 的 `GAME_URL`） ``
- 其餘出現「雲上之旅」「天堂遊記：」作為**遊戲名**之處一併改新名；作為**原著書名**（《天堂遊記》）之處保留。

- [ ] **Step 8: story-v2 設計文件檔頭註記**

`docs/story-v2-heaven-frame.md` 第 1 個標題下方加一行：

```markdown
> 2026-07-16 更名：《地獄遊記・親子共讀版》（repo `hell-tour-family`）。下文沿用舊稱《雲上之旅：天堂遊記》處屬歷史紀錄。
```

- [ ] **Step 9: 重產 QR**

```bash
npm run gen-qr
```

Expected: `assets/qr.png 已產生（https://gustarsmile.github.io/hell-tour-family/）`

- [ ] **Step 10: 殘留掃描**

```bash
grep -rn "雲上之旅\|heaven-tour-game" --include="*.js" --include="*.html" --include="*.json" --include="*.md" . | grep -v node_modules | grep -v ".superpowers" | grep -v "docs/superpowers" | grep -v "story-v2"
```

Expected: 無輸出（story-v2 歷史紀錄與 .superpowers 帳本除外）。「天堂遊記」不掃——原著引用合法存在（prologue.json source、hall10.json label、README 取材說明、index.html og 描述的《天堂遊記》）。

- [ ] **Step 11: 全套測試（qr.test／html.test 以新網址複驗）＋Commit**

Run: `npx vitest run`
Expected: 167+ 全過

```bash
git add js/config.js tests/config.test.js js/ui/coverView.js index.html js/ui/finaleView.js package.json package-lock.json README.md docs/story-v2-heaven-frame.md assets/qr.png
git commit -m "更名《地獄遊記・親子共讀版》：標題／封面／og／分享卡檔名／README，網址改 hell-tour-family 並重產 QR"
```

---

### Task 5: 目視驗收、資料夾改名與部署（控制者親自執行，非 subagent）

**Files:** 無程式改動。

- [ ] **Step 1: 控制者 Playwright 目視（390×844，`npm run dev` → localhost:8000）**

- 封面：新主標「地獄遊記」副標「親子共讀版」、天堂白主題。
- 序章五段換景：蓮花窗外（prologue-heaven）→ 濟公（jigong-heaven，無右下立繪）→ 南天門（gate-nantianmen）→ 瑤池（yaochi-tea）→ 花樹園（tree-garden）；返回鍵回退換景正確。
- 終幕（可用選單直達 hall10）：mengpo～mission 維持暗色；「回天 ▸」後白霧轉場、左上花樹圖、判詞／分享按鈕正常；分享卡返回仍為天堂＋樹。
- console 零 error。

- [ ] **Step 2: 資料夾改名（先停 dev server 與所有佔用進程）**

```powershell
Rename-Item "C:\Users\yoyoc\Projects\heaven-tour-game" "hell-tour-family"
```

改名後 `cd C:\Users\yoyoc\Projects\hell-tour-family && npx vitest run` 複驗 167+ 全過。

- [ ] **Step 3: 建 repo 並推送（需使用者明確放行——公開發布動作）**

```bash
gh auth status   # 確認 gustarsmile
cd C:/Users/yoyoc/Projects/hell-tour-family
gh repo create gustarsmile/hell-tour-family --public --source . --push
```

- [ ] **Step 4: 啟用 Pages（main 根目錄）**

```bash
gh api repos/gustarsmile/hell-tour-family/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

Expected: HTTP 201（409 表已啟用，改 `-X PUT`）。等 1–3 分鐘。

- [ ] **Step 5: 上線煙霧測試**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://gustarsmile.github.io/hell-tour-family/
curl -s -o /dev/null -w "%{http_code}\n" https://gustarsmile.github.io/hell-tour-family/assets/art/cover.webp
curl -s -o /dev/null -w "%{http_code}\n" https://gustarsmile.github.io/hell-tour-family/assets/og.png
```

Expected: 三個 200。再以 Playwright 開線上首頁：零 console error、新標題正確、390×844 版面不破、線上 QR 解碼＝新網址。

- [ ] **Step 6: 收尾**

- 更新使用者記憶檔（專案改名、已上線、新網址）與 MEMORY.md 索引。
- 提醒使用者人工項：手機實掃 QR、LINE／FB 分享預覽、實聽風鈴／鐵鍊環境音。

---

## 備註（給接手的 Model）

- 設計文件（需求與決策依據）：`docs/superpowers/specs/2026-07-16-family-edition-rename-and-scene-art-design.md`。
- 進度帳本：`.superpowers/sdd/progress.md`（先讀；已完成的 task 不重做）。
- 前次終審已收案的 defer 清單在帳本（fog 同幀競態、首繪深色、gain 斷言等），本計畫不處理。
- `jigong-main.webp` 仍被 interlude 與封面 fallback 引用，不得刪除。
- `assets/og.png` 已查證：由 `art-src/cover.png` 裁切產生（scripts/optimize-art.mjs 17–19 行），**無標題文字燒入**，更名不需重產；只有 index.html 的 og:image 網址要改（Task 4 Step 4 已含）。
- 生圖環境若無法跑 draw.py，停下回報，不要換生圖方案。
