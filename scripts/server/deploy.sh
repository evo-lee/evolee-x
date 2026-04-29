#!/usr/bin/env bash
# =============================================================================
# deploy.sh — 拉取最新代码并重启服务
# 用法:
#   手动运行:  bash /srv/evolee-x/scripts/server/deploy.sh
#   cron 自动: 见文件末尾注释
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/evolee-x}"
BRANCH="${BRANCH:-main}"
LOG_FILE="${LOG_FILE:-/var/log/evolee-x-deploy.log}"
APP_NAME="evolee-x"

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
err()  { log "ERROR: $*"; exit 1; }

[[ -d "$APP_DIR/.git" ]] || err "项目目录不存在: $APP_DIR，请先运行 setup.sh"

cd "$APP_DIR"

# ── 1. 拉取代码 ──────────────────────────────────────────────────────────────
log "拉取 $BRANCH 分支..."
git fetch origin "$BRANCH"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [[ "$LOCAL" == "$REMOTE" ]]; then
  log "已是最新版本 (${LOCAL:0:7})，无需重新构建"
  exit 0
fi

log "发现更新: ${LOCAL:0:7} → ${REMOTE:0:7}"
git reset --hard "origin/$BRANCH"

# ── 2. 安装依赖（仅 package-lock.json 变化时才慢）──────────────────────────
log "安装依赖..."
npm ci --prefer-offline

# ── 3. 构建 ──────────────────────────────────────────────────────────────────
log "构建中..."
npm run build

# ── 4. 重启/启动 PM2 ─────────────────────────────────────────────────────────
log "重启服务..."
if pm2 describe "$APP_NAME" &>/dev/null; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start npm --name "$APP_NAME" -- run start
  pm2 save
fi

log "✅ 部署完成 (${REMOTE:0:7})"

# =============================================================================
# 自动部署方式（二选一）
#
# 方式 A — cron 定时拉取（简单）
#   sudo crontab -e
#   加入: */10 * * * * APP_DIR=/srv/evolee-x bash /srv/evolee-x/scripts/server/deploy.sh
#
# 方式 B — GitHub Webhook（push 即触发，推荐）
#   1. 安装 webhook 服务:  sudo apt install webhook
#   2. 创建 /etc/webhook.conf（见 scripts/server/webhook.conf.example）
#   3. 启动: sudo systemctl enable --now webhook
#   4. 在 GitHub repo → Settings → Webhooks 添加:
#      Payload URL: http://your-server-ip:9000/hooks/deploy
#      Content type: application/json
#      Secret: 与 webhook.conf 中的 secret 一致
# =============================================================================
