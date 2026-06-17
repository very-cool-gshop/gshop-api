# gshop-api

電商後端 REST API，使用 Node.js + Express + PostgreSQL 建構，部署於 Google Kubernetes Engine。

## 技術棧

- **Runtime**: Node.js 24 (ESM)
- **Framework**: Express 5
- **Database**: PostgreSQL + Sequelize ORM
- **Auth**: JWT + bcrypt
- **Storage**: Google Cloud Storage（商品圖片）
- **AI**: Anthropic Claude（商品圖片分析）
- **Scheduler**: node-cron
- **Deploy**: Docker → GCP Artifact Registry → GKE

## 功能模組

| 模組 | 說明 |
|------|------|
| Auth | 註冊 / 登入 / 修改密碼，JWT 驗證 |
| Users | 使用者管理（admin only） |
| Categories | 商品分類 CRUD |
| Products | 商品 CRUD、多規格 Variant、庫存篩選 |
| Images | 媒體庫，圖片上傳至 GCS |
| Reviews | 商品評論 |
| Cart | 購物車 + 結帳（建立訂單） |
| Orders | 訂單管理、狀態更新 |
| Payments | 付款確認 |
| Dashboard | 銷售統計、低庫存警示、訂單狀態分布 |
| Analyze | 上傳商品圖片，由 Claude AI 自動產生名稱、描述與建議售價 |
| Jobs | Cron 排程管理與執行紀錄（admin） |

## 排程任務

| Job | 排程 | 說明 |
|-----|------|------|
| `generateOrders` | 每 3 小時 | 產生模擬訂單（開發 / demo 用） |
| `dailySnapshot` | 每日 00:05 | 建立每日銷售快照供 Dashboard 使用 |

## 快速開始

```bash
# 安裝套件
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 填入各項設定

# 啟動（需先有 PostgreSQL）
npm run dev
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串（必填） |
| `JWT_SECRET` | JWT 簽名金鑰（必填） |
| `PORT` | 監聽埠，預設 `3001` |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket 名稱 |
| `ANTHROPIC_API_KEY` | Claude AI API 金鑰（圖片分析功能） |

## API 總覽

所有 API 以 `/` 為根路徑，需要認證的路由須帶 `Authorization: Bearer <token>` header。

```
GET    /health

POST   /auth/register
POST   /auth/login
GET    /auth/me                  # 需登入
PATCH  /auth/change-password     # 需登入

GET    /categories
GET    /categories/:id
POST   /categories               # admin
PATCH  /categories/:id           # admin
DELETE /categories/:id           # admin

GET    /products                 # ?search &categoryId &minPrice &maxPrice &inStock &sortBy &order &page &limit
GET    /products/:id
POST   /products                 # admin
PATCH  /products/:id             # admin
DELETE /products/:id             # admin
POST   /products/analyze         # admin，上傳圖片由 AI 分析

GET    /products/:id/variants
POST   /products/:id/variants    # admin
PATCH  /products/:id/variants/:variantId  # admin
DELETE /products/:id/variants/:variantId  # admin

GET    /products/:productId/reviews
POST   /products/:productId/reviews   # 需登入
PATCH  /reviews/:id                   # 需登入
DELETE /reviews/:id                   # 需登入

GET    /images
POST   /images                   # admin
PATCH  /images/:imageId          # admin
DELETE /images/:imageId          # admin

GET    /cart                     # 需登入
POST   /cart/items               # 需登入
PATCH  /cart/items/:itemId       # 需登入
DELETE /cart/items/:itemId       # 需登入
POST   /cart/checkout            # 需登入

GET    /orders                   # 需登入
GET    /orders/:id               # 需登入
POST   /orders                   # 需登入
PATCH  /orders/:id/status        # admin

GET    /orders/:orderId/payment          # 需登入
POST   /orders/:orderId/payment/confirm  # 需登入

GET    /users                    # admin
GET    /users/:id                # admin
PATCH  /users/:id                # admin
DELETE /users/:id                # admin

GET    /dashboard                        # admin
GET    /dashboard/order-status-dist      # admin
GET    /dashboard/low-stock              # admin

GET    /admin/jobs               # admin
GET    /admin/jobs/logs          # admin
POST   /admin/jobs/:name/run     # admin
```

## 部署

Push 到 `main` branch 後，GitHub Actions 自動執行：

1. Build Docker image
2. Push 至 GCP Artifact Registry（`asia-east1`）
3. `kubectl rollout restart` 更新 GKE 上的 `gshop-api` Deployment
