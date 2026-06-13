# Admin 安全升级指南

这份文档对应当前的安全方案：`密码 + TOTP / 恢复码 + 会话 + Turnstile + 限流`。

---

## 目标架构

```
Admin 前端 -> Cloudflare Worker -> R2 / KV
```

- `R2`：存照片、文章、JSON
- `KV`：存登录限流和短期 session
- `Worker`：做登录验证、二次验证、签发 session、保护写接口
- `Turnstile`：只作为风控，不作为唯一认证

---

## 你需要在 Cloudflare 做什么

### 1. 创建 / 确认 R2 Bucket

确保已有一个公开读取的 bucket，例如：

```bash
wrangler r2 bucket create hyonelin-gallery
```

### 2. 创建 / 确认 KV Namespace

用于限流和 session 存储：

```bash
wrangler kv namespace create RATE_LIMIT
```

把返回的 namespace ID 写进 `worker/wrangler.toml`。

### 3. 设置 Worker 环境变量

在 Cloudflare Dashboard 或 `wrangler secret put` 中配置这些值：

- `ADMIN_PASSWORD`：管理后台密码
- `ADMIN_SESSION_SECRET`：随机长字符串，用于 session 相关签名或后续扩展
- `ADMIN_TOTP_SECRET`：TOTP base32 secret
- `ADMIN_BACKUP_CODE_HASHES`：恢复码哈希数组
- `R2_BASE_URL`：R2 公共访问地址
- `TURNSTILE_SECRET`：Turnstile secret key
- `ALLOWED_ORIGIN`：你的前端站点来源，例如 `https://hyonelin.github.io`
- `SESSION_TTL_SECONDS`：可选，默认 8 小时

### 4. 配置 Turnstile

创建一个 Turnstile site，并把 site key / secret 配好。

建议只在这些情况下启用：

- 多次失败后
- 新设备登录
- 恢复码频繁触发时

### 5. 部署 Worker

```bash
cd worker
npm install
npx wrangler deploy
```

---

## 本地生成 TOTP 和恢复码

仓库已经提供了生成脚本：

```bash
npm run auth:generate
```

脚本会输出：

- `ADMIN_TOTP_SECRET`
- `ADMIN_BACKUP_CODE_HASHES`
- `OTPAUTH_URI`
- 一组恢复码明文

把输出里的：

- `ADMIN_TOTP_SECRET` 写入 Cloudflare 环境变量
- `ADMIN_BACKUP_CODE_HASHES` 写入 Cloudflare 环境变量
- 恢复码明文保存到离线安全位置，只显示一次

---

## Admin 前端如何登录

当前登录顺序是：

1. 输入 `ADMIN_PASSWORD`
2. 输入 6 位 TOTP
3. 如果 TOTP 不可用，输入恢复码
4. 通过后 Worker 返回短期 session
5. 后续上传、建相册等接口都用 session 访问

---

## 本地开发

1. 启动 Worker：

```bash
cd worker
npm run dev
```

2. 启动前端：

```bash
npm run dev
```

3. 打开 `/admin`

---

## 推荐安全配置

- 使用高强度 `ADMIN_PASSWORD`
- 使用独立的 `ADMIN_TOTP_SECRET`
- 恢复码每次更换后台密码时一起轮换
- 只给 `ALLOWED_ORIGIN` 放行你的前端域名
- 不要把秘密值提交到 git

---

## 后续升级建议

如果你之后想继续加固，下一步建议上：

- `passkey(WebAuthn)` 作为主登录方式
- `step-up` 二次确认用于删除 / 发布 / 绑定新设备
- 操作审计日志
- 管理员登录设备白名单

