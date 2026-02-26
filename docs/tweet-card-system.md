# Twitter 推文卡片系统

## 架构设计

为了解决 Twitter API 按调用量收费的问题，采用**构建时批量获取 + 本地 JSON 缓存 + 零运行时 API 调用**的架构。

### 工作流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Markdown 文章   │────>│  构建时获取推文  │────>│  JSON 缓存文件  │
│  (含 tweetId)   │     │  (一次性调用)   │     │  (data/tweets) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  客户端展示推文  │<────│  React 组件渲染 │<────│  从缓存读取数据  │
│  (零 API 调用)  │     │  (TweetCard)   │     │  (无网络请求)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 使用方法

### 1. 在文章中插入推文

只需提供 `tweetId`：

```markdown
<TweetCard tweetId="1832692685238571015" />
```

不需要手动填写：
- ❌ 作者名
- ❌ 推文内容  
- ❌ 时间/日期
- ❌ 点赞/评论数
- ❌ 头像/图片

### 2. 获取 Twitter API Token

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. 创建或选择应用
3. 在 "Keys and Tokens" 中生成 **Bearer Token**

### 3. 更新推文缓存

```bash
# 设置环境变量（临时）
export TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAA..."

# 运行获取脚本
pnpm fetch:tweets
```

或者在 package.json 中配置脚本后：

```json
{
  "scripts": {
    "fetch:tweets": "TWITTER_BEARER_TOKEN=your_token node scripts/fetch-tweets.mjs"
  }
}
```

### 4. 缓存文件说明

缓存文件位于 `data/tweets-cache.json`：

```json
{
  "tweets": {
    "1832692685238571015": {
      "id": "1832692685238571015",
      "text": "推文内容...",
      "created_at": "2024-09-08T08:09:00.000Z",
      "author": {
        "name": "罗磊",
        "username": "luoleiorg",
        "profile_image_url": "https://pbs.twimg.com/..."
      },
      "public_metrics": {
        "retweet_count": 2,
        "reply_count": 44,
        "like_count": 524
      },
      "media": [...]
    }
  },
  "lastUpdated": "2024-09-10T00:00:00.000Z"
}
```

## API 调用优化

### 批量获取

- Twitter API 支持单次请求最多 **100** 个推文 ID
- 脚本会自动分批处理，11 条推文只需 **1 次** API 调用
- 即使 200 条推文也只需 **2 次** API 调用

### 成本控制

| 推文数量 | API 调用次数 | 估算成本 (Basic Plan) |
|---------|------------|---------------------|
| 11 条   | 1 次        | ~$0.01             |
| 100 条  | 1 次        | ~$0.01             |
| 500 条  | 5 次        | ~$0.05             |

> Twitter API Basic Plan 每月 10,000 次读取，对于博客场景完全够用。

## 自动更新策略

建议在以下时机更新缓存：

1. **发布新文章** 时：运行 `pnpm fetch:tweets`
2. **定期更新**（可选）：每月/每季度更新一次以获取最新互动数据
3. **CI/CD 集成**：在构建前自动更新

```yaml
# 示例: GitHub Actions
- name: Fetch Tweet Data
  run: pnpm fetch:tweets
  env:
    TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
```

## 降级处理

如果某条推文获取失败（被删除或 ID 错误）：

```tsx
// 组件会显示友好的错误提示
<div className="rounded-xl border border-red-200 bg-red-50 p-4">
  推文数据未找到 (ID: 1234567890)
</div>
```

## 与旧版本对比

| 特性 | 旧版本 (手动) | 新版本 (API + 缓存) |
|------|--------------|-------------------|
| 需要填写 | 所有字段 | 仅 tweetId |
| 数据准确性 | 静态，可能过期 | 动态，构建时更新 |
| API 调用 | 每页浏览都调用 | 仅构建时调用 |
| 加载速度 | 依赖 Twitter API | 本地 JSON，即时加载 |
| 成本 | 可能有隐藏费用 | 可控，批量获取 |

## 故障排查

### 推文数据未显示

1. 检查 `data/tweets-cache.json` 是否存在
2. 检查缓存文件中是否包含对应的 tweetId
3. 运行 `pnpm fetch:tweets` 重新获取

### API 认证失败

```
❌ 错误: 请设置 TWITTER_BEARER_TOKEN 环境变量
```

确保环境变量已正确设置：
```bash
echo $TWITTER_BEARER_TOKEN  # 应该输出你的 token
```

### 推文获取失败

脚本会输出失败的推文 ID：
```
⚠️  2 条推文未能获取:
   - 1234567890
   - 0987654321
```

可能原因：
- 推文被删除
- 推文作者设为私密
- 推文 ID 错误
