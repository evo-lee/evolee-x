#!/usr/bin/env bash
# =============================================================================
# setup.sh — 服务器一次性初始化脚本（Ubuntu）
# 用法: bash setup.sh
# 适配: Gitee SSH 拉取
# =============================================================================
set -euo pipefail

# 修改为你的 Gitee 仓库 SSH 地址，格式: git@gitee.com:用户名/仓库名.git
REPO_URL="${REPO_URL:-git@gitee.com:your-username/evolee-x.git}"
APP_DIR="${APP_DIR:-/srv/evolee-x}"
NODE_VERSION=20

log() { echo -e "\n\033[1;32m[setup]\033[0m $*"; }
err() { echo -e "\033[1;31m[error]\033[0m $*" >&2; exit 1; }

# ── 1. 系统依赖 ──────────────────────────────────────────────────────────────
log "安装系统依赖..."
sudo apt-get update -qq
sudo apt-get install -y curl git nginx

# ── 2. Node.js ───────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null || node -e "process.exit(+process.versions.node.split('.')[0]<${NODE_VERSION}?1:0)"; then
  log "安装 Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  log "Node.js $(node -v) 已存在，跳过"
fi

# ── 3. PM2 ───────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "安装 PM2..."
  sudo npm install -g pm2
fi

# ── 4. 生成 SSH 密钥（用于 Gitee 私有仓库）──────────────────────────────────
SSH_KEY="$HOME/.ssh/id_ed25519_gitee"
if [[ ! -f "$SSH_KEY" ]]; then
  log "生成 Gitee 专用 SSH 密钥..."
  ssh-keygen -t ed25519 -C "deploy@$(hostname)" -f "$SSH_KEY" -N ""

  # 写入 SSH config，让 gitee.com 自动使用这个 key
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  cat >> "$HOME/.ssh/config" <<SSH_CONF

Host gitee.com
    HostName gitee.com
    User git
    IdentityFile $SSH_KEY
    StrictHostKeyChecking no
SSH_CONF
  chmod 600 "$HOME/.ssh/config"

  echo ""
  echo "  ┌─────────────────────────────────────────────────────────┐"
  echo "  │  请将以下公钥添加到 Gitee → 设置 → SSH公钥             │"
  echo "  │  https://gitee.com/profile/sshkeys                      │"
  echo "  └─────────────────────────────────────────────────────────┘"
  echo ""
  cat "${SSH_KEY}.pub"
  echo ""
  read -rp "  添加完成后按 Enter 继续..."
else
  log "SSH 密钥已存在: $SSH_KEY，跳过生成"
fi

# 测试 Gitee SSH 连通性
log "测试 Gitee SSH 连接..."
if ssh -T git@gitee.com 2>&1 | grep -q "successfully authenticated"; then
  log "Gitee SSH 连接正常"
else
  err "Gitee SSH 认证失败，请检查公钥是否已添加到 Gitee"
fi

# ── 5. 克隆项目 ──────────────────────────────────────────────────────────────
if [[ -d "$APP_DIR/.git" ]]; then
  log "项目目录已存在: $APP_DIR，跳过 clone"
else
  log "克隆项目到 $APP_DIR..."
  sudo mkdir -p "$APP_DIR"
  sudo chown "$USER:$USER" "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi

# ── 6. 环境变量 ──────────────────────────────────────────────────────────────
if [[ ! -f "$APP_DIR/.env.local" ]]; then
  log "创建 .env.local（请编辑填入真实值）..."
  cp "$APP_DIR/.env.example" "$APP_DIR/.env.local"
  echo ""
  echo "  ⚠  请编辑 $APP_DIR/.env.local 填入配置后，再运行 deploy.sh"
  echo ""
fi

# ── 7. Nginx 反向代理 ────────────────────────────────────────────────────────
NGINX_CONF="/etc/nginx/sites-available/evolee-x"
if [[ ! -f "$NGINX_CONF" ]]; then
  log "写入 Nginx 配置..."
  sudo tee "$NGINX_CONF" > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;          # 替换为你的域名，如 example.com

    location /_next/static/ {
        alias /srv/evolee-x/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/evolee-x
  sudo nginx -t && sudo systemctl reload nginx
fi

# ── 8. PM2 开机自启 ──────────────────────────────────────────────────────────
log "配置 PM2 开机自启..."
pm2 startup | tail -1 | sudo bash || true

log "✅ 初始化完成！下一步："
echo ""
echo "  1. 编辑环境变量:  nano $APP_DIR/.env.local"
echo "  2. 首次部署:      bash $APP_DIR/scripts/server/deploy.sh"
echo "  3. 查看进程:      pm2 status"
echo "  4. 查看日志:      pm2 logs evolee-x"
