# 我的博客

一个纯静态的个人博客。左侧固定栏（头像 / 名字 / 大标题 / 竖排导航 / 社交按钮）+ 右侧主内容，右下角悬浮音乐播放器。

## 页面

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页（文章卡片） |
| `archive.html` | 归档（按年份分组） |
| `downloads.html` | 下载（资源卡片） |
| `about.html` | 关于 |
| `footprints.html` | 留言板 |
| `admin.html` | 管理（增删文章/下载、管理留言） |
| `post.html` | 文章详情 `?slug=xxx` |
| `404.html` | 404 页 |

## 目录

```
my-blog/
├─ index.html  archive.html  downloads.html  about.html
├─ footprints.html  admin.html  post.html  404.html
└─ assets/
   ├─ base.css   全部样式（配色/字体/间距在这里调）
   ├─ data.js    数据层（文章/下载/留言，用 localStorage 模拟后端）
   └─ app.js     全站共享（侧栏/页脚/音乐播放器/社交弹窗）
```

## 怎么改内容

1. **站点信息**（名字、标题、导航、社交账号、页脚、歌单）：改 `assets/app.js` 顶部的 `window.SITE` 和 `window.SONGS`。
2. **文章 / 下载**：在 `admin.html` 里增删，或改 `assets/data.js` 里的 `SEED_POSTS` / `SEED_DOWNLOADS`。
3. **配色、字体、间距**：改 `assets/base.css` 顶部的 `:root` 变量。

## 本地预览

直接双击 `index.html` 即可。或用本地服务器：

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 关于数据存储

这是纯静态站，没有服务器。留言和后台改动保存在**访问者自己的浏览器**（localStorage）里，换设备就看不到——这是让功能先跑起来的模拟方案。想要所有人实时可见，需要接 Cloudflare Pages Functions + D1 之类的后端。

## 部署

推送到 GitHub 后，在 Cloudflare Pages 里连接本仓库即可自动部署，再绑定自定义域名。
