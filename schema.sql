-- ============================================================
-- schema.sql — Cloudflare D1 数据库结构
-- 用法：在 Cloudflare 控制台 D1 -> 你的数据库 -> Console，
--       或本地 `wrangler d1 execute <库名> --file=schema.sql` 执行。
-- ============================================================

-- 文章
CREATE TABLE IF NOT EXISTS posts (
  slug        TEXT PRIMARY KEY,          -- URL 标识（唯一）
  title       TEXT NOT NULL,             -- 标题
  description TEXT DEFAULT '',           -- 摘要（首页卡片显示）
  uploader    TEXT DEFAULT '',           -- 作者
  date        TEXT DEFAULT '',           -- 日期 YYYY-MM-DD
  content     TEXT DEFAULT '',           -- 正文（HTML）
  created_at  INTEGER NOT NULL           -- 创建时间（毫秒）
);

-- 下载
CREATE TABLE IF NOT EXISTS downloads (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,             -- 文件名
  size        INTEGER DEFAULT 0,         -- 字节数
  description TEXT DEFAULT '',
  href        TEXT DEFAULT '#',          -- 下载链接
  date        TEXT DEFAULT '',
  created_at  INTEGER NOT NULL
);

-- 留言板（公开：谁都能留言；但需管理员审核通过才在留言板展示）
-- 审核状态存在 site_config 表的 key='fp_approved'（JSON 数组，存已通过展示的留言 id），
-- 所以这张表本身不需要额外列，旧库也无需改结构。
CREATE TABLE IF NOT EXISTS footprints (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,             -- 昵称
  text        TEXT NOT NULL,             -- 留言内容
  color       TEXT DEFAULT '#58a6ff',    -- 头像底色
  avatar      TEXT,                      -- 可选：base64 头像 data URL
  created_at  INTEGER NOT NULL
);

-- 站点配置（简介 / 友链等，按 key 存 JSON 字符串）
CREATE TABLE IF NOT EXISTS site_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_footprints_time ON footprints(created_at DESC);
