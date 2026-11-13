# 部署到 Cloudflare Pages + D1（C 方案）

这个站点现在是「静态页面 + Pages Functions 后端 + D1 数据库」的结构：
浏览器 → `/api/*`（functions/ 里的函数）→ D1 数据库。
管理页登录后用密码写文章/下载/简介/友链，留言板公开可留言。

下面按顺序做，全程在 Cloudflare 网页控制台点，不需要命令行。

---

## 一、确认 Pages 项目能自动部署

1. 打开 https://dash.cloudflare.com → 左侧 **Workers & Pages** → 点你的 Pages 项目。
2. 如果还没连仓库：**Settings → Builds & deployments → Connect to Git**，选 `voidvainkk/my-blog`。
3. 构建配置这样填（这个项目没有打包步骤，是纯静态 + functions）：
   - **Framework preset**：`None`
   - **Build command**：留空
   - **Build output directory**：`/`（就一个斜杠，表示仓库根目录）
   - **Root directory (advanced)**：留空
4. 保存。以后你往 `main` 分支 push，它会自动重新部署。

> 注意：`functions/` 目录必须在**仓库根目录**（现在就是），Pages 会自动识别它作为后端函数。

---

## 二、建 D1 数据库

1. 左侧 **Storage & Databases → D1 SQL Database**（或 **Workers & Pages → D1**）→ **Create database**。
2. 名字填 `my-blog-db` → 创建。
3. 建好后点进这个库 → **Console** 标签页。
4. 把仓库里 `schema.sql` 的全部内容复制粘贴进 Console，点 **Execute / Run**。
   执行完应该有 4 张表：`posts`、`downloads`、`footprints`、`site_config`。

---

## 三、把数据库绑定到 Pages 项目

1. 回到你的 Pages 项目 → **Settings → Functions**（有的界面叫 **Bindings**）。
2. 找到 **D1 database bindings** → **Add binding**。
3. **Variable name** 一定要填 `DB`（大小写一致，代码里就是读 `env.DB`）。
4. **D1 database** 选刚才建的 `my-blog-db`。
5. 保存。（Production 和 Preview 环境都加上，或至少 Production。）

---

## 四、设两个环境变量（密码在这里自设）

1. 同 Pages 项目 → **Settings → Environment variables**（或 **Variables and Secrets**）。
2. **Production** 环境加两个变量（都点 **Encrypt / Secret** 类型）：

   | 变量名 | 值 |
   |---|---|
   | `ADMIN_PASSWORD` | 你自己设的管理密码（登录后台用） |
   | `SESSION_SECRET` | 一串足够长的随机字符串（用于给登录 cookie 签名，不要告诉别人） |

   > `SESSION_SECRET` 随便生成一串，比如 40 位以上的字母数字混合。它只用来签名，不需要记住。
   > 两个都加完，**再点一次 Deploy / Retry deployment**，让变量生效。

3. （可选）Preview 环境也重复加一遍，否则预览域名登录不了。

---

## 五、重新部署

改完绑定和变量后，最好手动触发一次部署：
- Pages 项目 → **Deployments** → 右上 **Retry deployment**（或重新 push 一次也行）。

部署完成后访问你的站点：
- 首页 `https://你的域名/`
- 管理页 `https://你的域名/admin.html` → 输入 `ADMIN_PASSWORD` 登录

---

## 六、日常怎么用

- **写文章 / 加下载 / 改简介 / 加友链 / 删留言**：全部在 `/admin.html` 里，登录后操作，直接写进 D1 数据库，任何访客都能看到。
- **留言板**：`/footprints` 页，任何人都能留言（公开）。
- **改样式 / 改代码**：本地改文件 → commit → push → Pages 自动重新部署。

---

## 排错

| 现象 | 原因 / 解决 |
|---|---|
| 打开页面一直「加载中」 | D1 绑定没加或变量名不是 `DB`；或 `schema.sql` 没执行 |
| 后台登录一直「密码错误」 | `ADMIN_PASSWORD` 没设、设错，或设完没重新部署 |
| 保存文章提示「未登录」 | cookie 过期（7 天），重新登录即可 |
| 保存文章报 500 | 多半是 `posts` 表不存在，回去第二步执行 `schema.sql` |
| 部署后 `/api/*` 404 | `functions/` 目录不在仓库根目录，或 Build output 目录不是 `/` |

---

## 文件结构参考

```
my-blog/
├─ index.html  archive.html  downloads.html  about.html
├─ footprints.html  admin.html  post.html  404.html
├─ assets/           静态资源（css/js/字体/图片）
├─ functions/api/    后端接口（login/logout/me/posts/downloads/site/footprints/_utils）
├─ schema.sql        D1 建表脚本
└─ DEPLOY.md         本文件
```
