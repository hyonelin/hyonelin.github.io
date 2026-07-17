# Admin 管理后台部署指南

本指南将一步步教你如何部署照片管理后台。

---

## 架构概览

```
Admin 页面 (前端) → Cloudflare Worker (后端) → Cloudflare R2 (存储)
```

- **Admin 页面**: `/admin` 路由，含「照片」与「文章」两个模块
- **Worker**: 密码验证、照片上传、博客 CRUD、文章插图上传
- **R2**: 存储图片、摄影索引，以及 `blogs/{cn|en}/` 下的文章

### 文章能力（需重新 deploy Worker）

```bash
cd worker && wrangler deploy
```

Admin →「文章」可：
1. 「从站点导入」把现有 `public/blogs` 同步到 R2
2. 新建/编辑 Markdown
3. 「插入图片」上传到 R2 并写入 `![](url)`

---

## 第一步：在 Cloudflare 创建 API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)

2. 点击右上角头像 → **My Profile** → **API Tokens**

3. 点击 **Create Token**

4. 选择 **Create Custom Token**

5. 配置权限：
   - **Token name**: `photo-admin`
   - **Permissions**:
     - `Account` → `Cloudflare Workers` → `Edit`
     - `Account` → `Workers R2 Storage` → `Edit`
   - **Account Resources**: `Include` → `All accounts`
   - **Zone Resources**: `Include` → `All zones`

6. 点击 **Continue to summary** → **Create Token**

7. **重要**: 复制生成的 Token，只显示一次！

---

## 第二步：本地安装 Wrangler

Wrangler 是 Cloudflare 的命令行工具。

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

登录时会打开浏览器，授权即可。

---

## 第三步：配置 Worker 环境变量

1. 进入 Worker 目录：
   ```bash
   cd worker
   ```

2. 复制环境变量示例文件：
   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. 编辑 `.dev.vars` 文件：
   ```
   ADMIN_PASSWORD=你的管理密码
   R2_BASE_URL=https://pub-e00c2328da0440458b54fe471887ca39.r2.dev
   ```

4. 安装依赖：
   ```bash
   npm install
   ```

---

## 第四步：创建 R2 Bucket（如果还没有）

```bash
# 创建名为 photos 的 bucket
wrangler r2 bucket create photos
```

如果提示 bucket 已存在，说明你已经创建过了，可以跳过这步。

---

## 第五步：上传现有 JSON 文件到 R2

Worker 需要从 R2 读取 JSON 文件，所以需要先把现有的 JSON 上传上去。

```bash
# 上传 index.json
wrangler r2 object put photos/photos/index.json --file=public/photos/index.json

# 上传 albums.json
wrangler r2 object put photos/photos/albums.json --file=public/photos/albums.json
```

---

## 第六步：部署 Worker

### 方式 A：本机命令行

```bash
# 在 worker 目录下
wrangler deploy
```

### 方式 B：手机 / 无电脑（GitHub Actions）

仓库已包含 `.github/workflows/deploy-worker.yml`。推送到 `main`（或手动 Run workflow）即可部署。

1. 手机打开 Cloudflare → My Profile → API Tokens  
   创建 Token，权限至少包含：`Account - Cloudflare Workers - Edit`，以及 R2 如需一并管理
2. 手机打开 GitHub 仓库 → **Settings → Secrets and variables → Actions**  
   新增：
   - `CLOUDFLARE_API_TOKEN` = 上一步的 Token
   - `CLOUDFLARE_ACCOUNT_ID` = Cloudflare Dashboard 右侧 Account ID
3. 把包含 Worker 改动的 PR **合并进 main**，或到 **Actions → Deploy Cloudflare Worker → Run workflow**
4. 等绿色勾，再到 Admin 文章页确认不再提示「博客接口不可用」

部署成功后地址一般为：

```
https://photo-admin.<你的子域名>.workers.dev
```

---

## 第七步：在 Cloudflare Dashboard 配置环境变量

为了安全，我们需要在 Dashboard 中配置环境变量（而不是写在代码里）。

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/)

2. 左侧菜单 → **Workers & Pages**

3. 点击你刚部署的 `photo-admin` Worker

4. 点击 **Settings** → **Variables**

5. 添加环境变量：
   - `ADMIN_PASSWORD`: 你的管理密码
   - `R2_BASE_URL`: `https://pub-e00c2328da0440458b54fe471887ca39.r2.dev`

6. 点击 **Save and deploy**

---

## 第八步：更新 Admin 页面的 Worker URL

编辑 `src/pages/Admin.tsx`，找到这一行：

```typescript
const WORKER_URL = 'https://photo-admin.your-subdomain.workers.dev'
```

替换为你的 Worker URL：

```typescript
const WORKER_URL = 'https://photo-admin.你的子域名.workers.dev'
```

---

## 第九步：测试

1. 启动本地开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 `http://localhost:5173/admin`

3. 输入你在 `ADMIN_PASSWORD` 中设置的密码

4. 尝试上传一张照片

---

## 常见问题

### Q: 上传失败，提示 "Failed to load albums"

A: 你需要先上传现有的 JSON 文件到 R2：
```bash
wrangler r2 object put photos/photos/index.json --file=public/photos/index.json
wrangler r2 object put photos/photos/albums.json --file=public/photos/albums.json
```

### Q: Worker 部署失败

A: 检查你的 API Token 权限是否正确设置。

### Q: 密码验证失败

A: 确保你在 Cloudflare Dashboard 中正确设置了 `ADMIN_PASSWORD` 环境变量。

### Q: 图片上传成功但无法访问

A: 检查 R2 bucket 是否开启了公开访问。在 Cloudflare Dashboard → R2 → photos bucket → Settings → Public access。

---

## 文件结构

```
worker/
├── src/
│   └── index.ts        # Worker 主代码
├── wrangler.toml       # Worker 配置
├── package.json
├── tsconfig.json
├── .dev.vars           # 本地环境变量（不提交）
└── .dev.vars.example   # 环境变量示例

src/pages/
└── Admin.tsx           # Admin 页面
```

---

## 安全建议

1. **使用强密码**: `ADMIN_PASSWORD` 应该是一个复杂的密码
2. **不要提交 `.dev.vars`**: 这个文件包含敏感信息
3. **定期更换密码**: 建议每隔一段时间更换管理密码
4. **限制 R2 访问**: 确保 R2 bucket 只有读取权限是公开的

---

## 成本

Cloudflare 免费额度：
- Workers: 每天 10 万次请求
- R2 存储: 10 GB
- R2 操作: 100 万次上传/月，1000 万次读取/月

对于个人博客完全够用！
