# 🏆 2026 世界盃比分查詢與直播中心 (FIFA World Cup 2026 Score Live Center)

本專案是一個兼備 **極速本地調試** 及 **企業級穩定性** 的 **2026 世界盃比分與賽程查詢智慧系統**。本專案為雙架構設計（Dual-Build Framework），確保不管是容器環境預覽或是正式 Vercel 部署上線都能維持最完美卓越的運行表現：
- **⚡ AI Studio 容器研發版（React Vite + Express）**：運行於專案根目錄。後端 Express 自帶 Vite Dev Middleware，適合在沙盒中一鍵啟動研發。
- **🚀 Vercel 正式生產版（Next.js App Router + TS）**：存放於 `/next-app` 目錄。專為無伺服器微服務（Serverless Functions）優化，可直接導入 Vercel 實現秒級全球分發。

---

## 📂 專案核心架構與檔案導覽

### 1. 根目錄：AI Studio 研發調試版
- `server.ts`: 全棧 Express 伺服器入口。在開發環境（`process.env.NODE_ENV !== 'production'`）中串接並代理託管 Vite，在生產環境中提供打包後 Static Asset 的安全靜態分發。
- `src/App.tsx`: 前端主頁。利用 React 狀態引擎管理與搜尋比分、切換標籤頁（「賽程」、「小組積分」、「淘汰賽樹狀圖」）。
- `src/components/`:
  - `SearchBar.tsx`: 響應式、高度優化的熱門搜尋與一鍵過濾器。
  - `MatchCard.tsx`: 精緻設計的比分卡。具備「進行中/LIVE」（動態呼吸紅點）、「已結束/FINISHED」與「未開始」狀態，字體採用等寬 JetBrains Mono。
  - `StandingsTable.tsx`: 小組積分響應式表格，支援在行動裝置上獨立水平滑動。
  - `BracketView.tsx`: 圖表化淘汰賽樹狀對決圖，提供完美寬幅行動端水平滾動體驗。
- `src/lib/footballData.ts`: `football-data.org` 遠端資料庫串接器，具備完整的隊伍中譯、賽段轉換與安全例外處理。
- `src/lib/cache.ts`: 全域 15 分鐘快取保護層。
- `data/mock-worldcup.json`: 超高精細度、包含 48 支國家隊完整比分與完整的 32 強晉級樹狀圖本地測試資料。

### 2. `/next-app` 目錄：Next.js Vercel 生產版
- `app/page.tsx`: 用戶介面
- `app/api/worldcup/route.ts`: Next.js 14+ Route Handler (API 端點)，採用全動態渲染並整合 60 秒強制作動節流器與 15 分鐘伺服端快取。
- `components/`: 重複利用的 UI 元件。
- `lib/`: `footballData.ts` 串接器與 `cache.ts` 快取保護機制。
- `data/`: `mock-worldcup.json` 安穩備援資料（已預先綁定於 Webpack Bundle 中）。

---

## 📖 快速啟動與開發指引

### 1. 本機啟動「根目錄預覽版（Express + React）」
```bash
# 安裝依賴項（若有需要）
npm install

# 啟動開發伺服器（此時 Express 會代理 Vite Dev UI）
npm run dev
```
瀏覽瀏覽器：`http://localhost:3000`

### 2. 本機打包測試「研發版」
```bash
# 進行 React Bundle 打包與 Server esbuild 編譯
npm run build

# 啟動正式編譯後的生產伺服器
npm start
```

### 3. 本機啟動「Next.js 生產版（/next-app）」
```bash
cd next-app
npm install
npm run dev
```
瀏覽瀏覽器：`http://localhost:3000`

---

## 🔑 football-data.org API Key 申請指南

為了獲取真實的 2026 世界盃即時比分與最新小組資訊，專案推薦串接第三方體育 API：
1. 進入 [football-data.org 官方網站](https://www.football-data.org/)。
2. 點選頁面右上角的 **"GET FREE API KEY"**，輸入並提交您的個人姓名與電郵地址。
3. 系統將會把一封內含 `X-Auth-Token`（即您的專屬 API Key）的信件發送到您的電子信箱中。
4. 本地偵錯時，請在根目錄或 `/next-app` 的新建 `.env` 檔案中設置環境變數：
   ```env
   FOOTBALL_DATA_API_KEY="您的 X-Auth-Token"
   ```

---

## 🛡️ API 安全與免費額度控制機制

### 1. 10 次 / 分鐘免費頻率防止被封鎖 (Throttling)
由於 `football-data.org` 的免費層 API 有每分鐘最多 **10 次請求** 的嚴格額度限制。為保護 API Key 在 Vercel 或 Cloud Run 上不會因為併發或使用者惡意連點而遭官方伺服器暫時停權（429 Too Many Requests），我們部署了雙重防禦方案：
- **十五分鐘快取（15-Min Global Cache）**：不論有幾萬個使用者訪問，只要在 15 分鐘之內，API 都會優先自記憶體極速讀取並分發快取資料，僅耗費 **0 次** Live API 請求。
- **強制重新整理微秒防連點（60-Sec Request Throttle）**：前端頁面提供手動「點擊同步重新整理」按鈕，但後端設有 **60 秒時間冷卻閘門**。即使使用者在前端以按鈕或重新整理網頁狂點，後端伺服器在 60 秒內皆會攔截該事件，禁止向遠端 football-data.org 伺服器發送請求，直接覆寫為快取資料回報。

### 2. Fallback Mock Data 備份機制
遠端 API 發生突發網路錯誤、或 API Key 輸入錯誤怎麼辦？
本系統在前後端皆實施了 **零白屏崩潰安全網機制**。
- 當遠端 API 下線或回應異常時，後端會主動捕捉 Error 並改採用預先載入的本地高品質世界盃測試資料（`mock-worldcup.json`）。
- 同時在 API 回應中將特別夾帶 `isFallback: true` 屬性。
- 前端會即時辨識此狀態，並在畫面上方貼心呈現 **「API 暫時無法連線，已切換為備份測試資料」** 的琥珀黃告知警告，兼顧使用者信心與極致防禦性開發。

---

## 🚀 如何部署至 Vercel (Next.js 生產版)

Vercel 是發佈 Next.js Web 應用的世界頂級平台。

### 步驟 1：匯入專案
1. 將專案程式碼上傳至您的 GitHub、GitLab 或 Bitbucket 個人軟體庫。
2. 前往 [Vercel 控制台](https://vercel.com/)，點選 **"Add New"** -> **"Project"**。
3. 匯入本專案的 Repository。

### 步驟 2：設定專案根目錄（重要）
因為生產版 Next.js 存放在 `/next-app` 子目錄中，您**必須**在 Vercel 建立設定中填入對應路徑：
- 在 **Framework Preset** 中選擇：`Next.js`
- 在 **Root Directory** 欄位中，點選選單或手動填入：`next-app` （請務必指定為 `next-app`）

### 步驟 3：設定正式生產環境變數
在 **Environment Variables** 折疊視窗內，新增以下變數：
1. **Name**: `FOOTBALL_DATA_API_KEY`
2. **Value**: `您的 football-data.org API Token`
3. 點選 **"Add"** (添加)。

### 步驟 4：一鍵部署 (Deploy)
- 點選頁面底部的 **"Deploy"**。
- Vercel 將自動在雲端完成 Next.js 建置、編譯與 Serverless Functions 路由配置。一分鐘內，您的 2026 世界盃最美直播小工具便會在全球伺服器正式上線！

---

## 🔧 常見錯誤排除 (FAQ/Troubleshooting)

**1. 畫面顯示「目前使用測試資料」，要如何切回即時即時數據？**
- 這代表伺服器未檢測到 `FOOTBALL_DATA_API_KEY` 環境變數。請在 Vercel 設定（或本地 `.env` 檔案）中填寫 API Token 後重啟服務，重整即可重返 API 線上抓取狀態。

**2. 為什麼點擊「重新整理」按鈕沒有反應？**
- 本系統具備 60 秒 API 節流機制，若您在 60 秒內連續點擊重新整理，伺服器會攔截並維持上一次的資料。請等待一分鐘冷卻，再重試點按。

**3. 在某些極窄螢幕的手機上，淘汰賽樹狀圖或積分表是否會變形？**
- 不會。我們對 `BracketView` 與 `StandingsTable` 分別套用了 `-mx-5 px-5 overflow-x-auto` 行動端水平直覺滑動軌跡，表格與樹狀圖會維持良好長寬比供滑動，且 **絕對不會** 造成整體 App 的水平破版。

**4. 伺服器回傳 429 錯誤？**
- 由於 `football-data.org` 免費額度的重設限制，若多人嘗試同時間多次不帶快取強打，可能在初期超過官方限制。請保持系統 15 分鐘快取開啟，即可自動恢復流暢運轉。
