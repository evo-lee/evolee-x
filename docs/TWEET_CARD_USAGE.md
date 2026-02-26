# TweetCard 使用指南

## 目标
将 Markdown 中的推文卡片从：

```markdown
<TweetCard
  tweetId="1770112626657247620"
  twitterId="luoleiorg"
  author="luolei"
  time="下午11:38 · 2024年3月19日"
  content="严肃话题..."
  avatar="https://pbs.twimg.com/..."
  comment=1105
  like=1140
/>
```

简化为：

```markdown
<TweetCard tweetId="1770112626657247620" />
```

## 使用步骤

### 1. 申请 Twitter API Token

1. 访问 https://developer.twitter.com/en/portal/dashboard
2. 创建应用
3. 获取 **Bearer Token** (以 `AAAAAAAAAAAAAAAAAAAAA...` 开头)

### 2. 获取推文数据

在项目根目录运行：

```bash
export TWITTER_BEARER_TOKEN="你的_token"
pnpm fetch:tweets
```

脚本会自动：
- 扫描所有 markdown 文件中的 `tweetId`
- 批量调用 Twitter API（100条/次）
- 保存到 `data/tweets-cache.json`

### 3. 在文章中使用

只需一行：

```markdown
## 文章正文

这是文章内容...

<TweetCard tweetId="1770112626657247620" />

继续文章内容...
```

### 4. 构建部署

```bash
pnpm build
pnpm deploy:vinext
```

## 数据更新

### 新增推文
如果新文章插入了 TweetCard，需要重新运行：

```bash
pnpm fetch:tweets
```

### 更新互动数据
推文数据（点赞数、评论数）会过期，建议每月更新一次：

```bash
pnpm fetch:tweets
```

## 成本说明

Twitter API Basic Plan ($100/月) 包含 **10,000次/月** 读取额度。

| 推文数量 | API 调用次数 | 成本 |
|---------|------------|------|
| 11 条   | 1 次       | ~$0.01 |
| 100 条  | 1 次       | ~$0.01 |
| 500 条  | 5 次       | ~$0.05 |

**博客场景下完全够用。**

## 故障排查

### 推文显示"数据未找到"

1. 检查是否运行了 `pnpm fetch:tweets`
2. 检查 `data/tweets-cache.json` 是否包含该 tweetId
3. 检查 tweetId 是否正确

### API 调用失败

```
❌ 错误: 请设置 TWITTER_BEARER_TOKEN 环境变量
```

确保 token 设置正确：
```bash
echo $TWITTER_BEARER_TOKEN
```

### 推文被删除或私密

如果推文获取失败，脚本会输出警告：
```
⚠️  1 条推文未能获取:
   - 1770112626657247620
```

这种情况下需要手动检查推文状态。

## 文件结构

```
├── data/
│   └── tweets-cache.json          # 推文数据缓存
├── scripts/
│   └── fetch-tweets.mjs           # 获取脚本
├── src/components/
│   ├── tweet-card.tsx             # 渲染组件
│   └── content-enhancer.tsx       # 客户端 hydrate
└── content/posts/
    └── *.md                       # 文章中插入 <TweetCard />
```

## 当前项目中的推文

运行以下命令查看项目中所有推文 ID：

```bash
grep -r 'tweetId="' content/posts/ | grep -o 'tweetId="[^"]*"' | sort -u
```

目前有 11 条推文需要获取数据。
