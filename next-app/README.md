# 🏆 2026 世界盃比分查詢小工具 (Next.js & Vercel 部署版)

這是一個基於 **Next.js App Router**、**TypeScript** 與 **Tailwind CSS** 開發的 2026 世界盃賽程/比分查詢小工具。
本專案已完全優化並適應行動裝置，同時自帶 football-data.org API 整合、15分鐘快取保護機制與本地 Fallback Mock 資料，確保您部署後能穩定不中斷。

---

## 📖 系統操作指引

### 1. 申請 football-data.org API Key
1. 前往 [football-data.org/client/register](https://www.football-data.org/client/register) 註冊頁面。
2. 填寫您的電郵地址並接受服務條款。
3. 註冊成功後，系統會將一封包含 **API Token (API Key)** 的郵件寄至您的信箱。
4. 複製該 API Token。

---

### 2. 佈置環境變數 (.env)
在本機目錄建立 `.env.local` 檔案（或直接參考 `.env.example`）：
```env
# 貼上您剛剛申請的 football-data.org API Token
FOOTBALL_DATA_API_KEY="YOUR_API_TOKEN_HERE"

# 預設本地 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
> **💡 提示：** 如果未提供 `FOOTBALL_DATA_API_KEY`，系統將自動啟動完美 Fallback 機制，讀取包含 32 強淘汰對決及 A ~ D 組排名的 `data/mock-worldcup.json` 資料庫，確保畫面正常展示。

---

### 3. 本機啟動步驟
請確認您處於本目錄 `/next-app` 下，然後在終端機執行：

```bash
# 1. 安裝依賴套件
npm install

# 2. 啟動本機開發伺服器
npm run dev
```
隨後在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 即可進行即時調整與預覽！

---

### 4. 部署到 Vercel 雲端
1. **將代碼上傳至 GitHub 儲存庫**：
   將 `/next-app` 資料夾內的完整專案推送到您的 GitHub。

2. **在 Vercel 建立專案**：
   - 登入 [Vercel 官網](https://vercel.com/)。
   - 點擊 **Add New** ➡️ **Project**。
   - 匯入您的世界盃專案 GitHub 儲存庫。

3. **配置 Vercel 環境變數**：
   - 在專案建置畫面的 **Environment Variables** 區塊中，新增以下欄位：
     - `FOOTBALL_DATA_API_KEY` = `[貼上您的 API Token]`
   - 點擊 **Save**。

4. **點擊 Deploy**：
   - Vercel 將自動為您完成生產環境編譯（Next.js Build），並配發一個獨立的 `https://xxxx.vercel.app` 網址！
