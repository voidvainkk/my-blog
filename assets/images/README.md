# 图库（assets/images）

这个文件夹就是**你放图片的地方**。所有文章封面、正文配图、头像、动图……都往这里丢。

## 怎么用（两种）

1. **直接在电脑上把图片文件复制进这个文件夹**（Windows 资源管理器）。
2. 或者告诉我图在哪，我帮你复制进来。

## 放好之后怎么在网页里引用

图片放进 `assets/images/` 后，引用路径有两种写法，效果一样：

- 写相对路径：`assets/images/图片名.jpg`
- 或写根相对路径：`/assets/images/图片名.jpg`

举例（文章正文里）：

```html
<img src="assets/images/cover-01.jpg" alt="封面">
<img src="assets/images/photo.webp" alt="配图">
<img src="assets/images/动图.gif" alt="动图">
```

## 命名与规格建议

- **文件名只用英文 / 数字 / 短横线**，例如 `cover-01.jpg`、`avatar.png`。别用中文名（部分环境会乱码裂图），也别带空格。
- **格式**：`.webp`（最小，首选）、`.jpg`（照片）、`.png`（要透明 / 图标）、`.gif`（动图）。
- **体积**：单张压到 **200KB 以内**最舒服。手机原图动辄数 MB，务必先压缩（可用在线工具 tinypng 之类）。
- **封面**：做成 **16:9**，卡片会自动裁切居中，不会变形。

## 支持的图片类型

| 类型 | 扩展名 | 说明 |
|---|---|---|
| 普通图片 | .jpg .jpeg .png .webp .avif | 直接用 |
| 动图 | .gif | 会一直循环播放 |
| 动图 | .webp（动态 webp） | 部分浏览器支持 |
| 视频 | .mp4 .webm | 用 `<video>` 标签，不是 `<img>` |

> 不会动的 `.png/.jpg` 不能"动"；要动就用 `.gif`、动态 `.webp` 或 `<video>`。
