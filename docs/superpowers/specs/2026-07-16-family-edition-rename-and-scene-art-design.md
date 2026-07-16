# 《地獄遊記・親子共讀版》改名＋序章換景＋回天看樹 設計文件

日期：2026-07-16。狀態：使用者已於對話中逐項定案，待審此文件。

## 背景與目標

使用者試玩（485591b）後回饋三點：

1. 序章全程只有一張「雲上茶會」場景圖，南天門齊天大聖、瑤池眾仙、原靈花樹園皆無圖。
2. 濟公台詞出現時，左上白色系場景圖與右下暗色舊立繪同框，風格衝突。
3. 名稱誤導＋SEO：遊戲主體是十殿地府，叫「天堂遊記」誤導；生造詞又搜不到。另發現結局「回天看樹」意境未實作——樹圖只在判詞中途閃現一次，最終結算畫面無樹、視覺停留在暗色地府。

目標：序章分段換景、濟公單圖化、更名《地獄遊記・親子共讀版》、結局回天看樹，然後（另案）部署上線。

## 已定案決策（使用者選定）

| 議題 | 決策 |
|---|---|
| 序章配圖 | 補 3 張：南天門、瑤池茶會、原靈花樹園 |
| 濟公雙圖 | 立繪移到左上場景位，並重生白色系橫幅版濟公 |
| 名稱 | 《地獄遊記・親子共讀版》；repo `hell-tour-family`；封面主標「地獄遊記」副標「親子共讀版」；tagline 保留天堂元素；og description 含《天堂遊記》關鍵字 |
| 回天看樹 | 結算（done）畫面切天堂白主題＋左上場景圖換成玩家的花樹 |

## A. 序章節點級換景

**行為**：`prologue.json` 的節點可帶選用欄位 `"art": "<檔名>.webp"`。自該節點起，左上場景圖（`.scene-art`）換為該圖，並**延續**到下一個帶 `art` 的節點；場景開頭仍以場景級 `art`（`prologue-heaven.webp`）起始。

**機制**：場景執行器（`flow.js` 的 runScene／`engine/scene.js`）目前每節點重繪並傳入 `opts.art`（flow.js:120）。改為執行器內部追蹤「目前場景圖」：初始＝場景級 art，前進到帶 `art` 的節點時更新，每次重繪傳目前值。中斷續玩回到某節點時，依既有的續玩恢復路徑推導應顯示的圖（線性推進時即「起點到該節點間最後一個 art」）。

**資料配置**（新圖檔名以生圖時定案者為準）：

| 節點 | 左上圖 | 段落 |
|---|---|---|
| intro1 | prologue-heaven.webp（現有，場景級） | 蓮花到窗外 |
| intro2 | jigong-heaven.webp（新） | 濟公自介・天水（原 `"img": "jigong-main.webp"` 內嵌立繪**移除**） |
| gate1 | gate-nantianmen.webp（新） | 南天門齊天大聖 |
| yao1 | yaochi-tea.webp（新） | 瑤池茶會・雲鏡四問 |
| tree3 | tree-garden.webp（新） | 原靈花樹園・領旨下凡 |

**降級**：圖檔缺失沿用 `artImg` 既有 error→remove 優雅降級。地府殿內既有 `img` 內嵌立繪機制完全不動。

## B. 新美術（4 張）

- 用 draw 技能（gpt-image-2）生成，沿用白色系廟宇彩繪風格前綴（`docs/story-v2-heaven-frame.md`），**橫幅長寬比與既有場景圖一致**（含 jigong-heaven，解決立繪直式進橫位的版面問題）。
- PNG 原檔進 gitignored `art-src/`，經 sharp 壓 webp（q50 起，超體積降到 q45）。
- 美術總體積守門 **6MB 不放寬**（現況 5.63MB）；序章改版後若 `jigong-main.webp` 全 repo 無引用即移除釋放空間（jigong-warm/stern 為終幕引用，保留）。

## C. 結局回天看樹

**行為**：終幕相位 `done`（「回天 ▸」之後的結算畫面）：

- `body` 切回天堂主題（`theme-heaven`，含既有白霧轉場）。
- 左上場景圖由 `hall10-scene.webp` 換為玩家 `endingKey` 對應的 `tree-*.webp`（四版依悟性×心性）。
- 右欄內容不變（此行判詞、悟性值、格言、出處、三顆按鈕）。
- 判詞（`ending`）相位中途的樹圖保留不動；`mengpo`→`mission` 各相位維持暗色地府。
- 自結算畫面進入分享卡／善書冊再返回，仍為天堂主題＋樹圖；「重新開始」回封面（本來就是天堂主題）。

**機制**：`finaleView.renderFinalePhase` 的 `done` 分支改用 endingKey 對應樹圖作為 sceneFrame 的 art；主題切換由 flow 層驅動（flow 掌握 setTheme 閉包，於 finale 進入 done 相位的既有回呼點觸發），不讓 view 層直接碰 audio／theme 全域。實作細節（回呼介面）由實作計畫定。

## D. 更名《地獄遊記・親子共讀版》

- `js/config.js`：`GAME_TITLE` → `地獄遊記・親子共讀版`；`GAME_URL` → `https://gustarsmile.github.io/hell-tour-family/`。
- 封面：主標「地獄遊記」、副標「親子共讀版」；tagline 維持「乘蓮台・遊天堂・訪地府——回來，看看你的花樹。」
- `index.html`：`<title>`、`og:title`、`og:url`；`og:description` 改寫並含「取材《地獄遊記》《天堂遊記》」與「親子」關鍵字（SEO 用意：兩部善書書名都搜得到）。
- 全 repo 掃「雲上之旅」「天堂遊記」「heaven-tour-game」逐處人工判定替換：分享卡文字與下載檔名、README、package.json name、docs。**引用原著書名《天堂遊記》《地獄遊記》的出處標註一律保留不改**（如結算取材連結、source 欄位）。
- QR：`npm run gen-qr` 以新網址重產，`tests/qr.test.js` 守門。
- `assets/og.png`：檢查是否燒有舊標題字樣；有則以原產製流程重產（≤500KB 守門），無則不動。
- 本機資料夾改名 `C:\Users\yoyoc\Projects\heaven-tour-game` → `C:\Users\yoyoc\Projects\hell-tour-family`（排在全部程式工作與測試之後、部署之前，避免工作階段路徑失效）；GitHub repo 建立時直接用新名（尚未建立，無轉址問題）。
- 使用者記憶檔（heaven-tour-game-project.md）於收尾時同步改名更新。

## E. 測試策略

- 換景機制與回天看樹走 TDD：新增（1）場景執行器「節點 art 換圖且延續」測試（2）finale done 相位「樹圖＋theme-heaven」測試。
- `tests/data.test.js` 延伸：走訪 prologue 節點，凡帶 `art`／`img` 欄位者 `expectArt` 驗檔案存在。
- 既有守門不放寬：美術 6MB、og 500KB、QR 解碼＝GAME_URL、全套測試（現 165）只增不減，每個 task 結束全過才 commit。
- 完成後控制者以 Playwright（390×844）走序章五段換景與終幕回天看樹目視。

## F. 範圍外（本設計不含）

- 部署（GitHub repo 建立、Pages、煙霧測試）＝原接手計畫 Task 3，於本設計完成後以新 repo 名執行，公開發布仍需使用者放行。
- 地府殿內視覺、音效、故事文本（除更名觸及的字串外）不動。
- 舊 repo `hell-tour-game` 一律不碰。
