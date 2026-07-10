# 后台内容修改与 GitHub Pages 发布教程

这份教程说明如何使用网站后台修改内容、导出正式数据，并把修改发布到 GitHub Pages。后台适合先在当前电脑预览，真正让所有设备看到，还需要把导出的 `site-data.json` 和素材文件提交到 GitHub。

## 1. 后台保存、本机草稿、线上正式数据的区别

- 后台保存：点击后台里的保存按钮后，内容会保存到当前浏览器的 `localStorage`。
- 本机草稿：保存在当前浏览器里的预览数据，只在这台设备、这个浏览器可见。
- 线上正式数据：仓库里的 `assets/data/site-data.json`，GitHub Pages 发布后，所有设备都会读取它。

后台顶部会显示当前使用的数据来源：

- `当前使用：线上 JSON 数据；`
- `当前使用：本机草稿数据。`

## 2. 为什么后台保存后其他设备看不到

后台保存不会直接改 GitHub 仓库文件，也不会自动发布到 GitHub Pages。它只把内容存在当前浏览器里，方便你先预览。

如果要让手机、其他电脑或其他浏览器看到修改，需要：

1. 在后台导出 `site-data.json`。
2. 用导出的文件覆盖仓库里的 `assets/data/site-data.json`。
3. 把 `site-data.json` 和新增素材一起提交到 GitHub。
4. 等 GitHub Pages 部署完成。

## 3. 如何修改案例名称、板块文字、首页文字

修改案例名称：

1. 打开后台。
2. 进入“项目案卷”。
3. 在左侧选择要修改的项目。
4. 修改“中文标题”“英文标题”“年份”“地点”“摘要”等字段。
5. 点击“保存案卷”。

修改首页文字：

1. 进入“首页与联系”。
2. 修改“工作室名称”“首页中文主张”“英文副标题”“首页介绍”等字段。
3. 点击“更新首页文案”。

修改板块文字：

目前板块文字来自 `site-data.json` 的 `siteSettings.sections`。如果后台没有单独的板块文字输入框，可以先导出 `site-data.json`，在文件中找到对应板块，例如 `featured`、`works`、`architecture`，修改 `title`、`description` 后再提交。

## 4. 如何修改图片路径

图片路径必须写项目内相对路径，例如：

```text
assets/projects/project-a/cover.jpg
assets/projects/project-a/gallery-01.jpg
assets/hero-depth/hero-lady.webp
assets/backgrounds/home-bg.jpg
```

不要写本机路径，例如：

```text
C:\Users\...
/Users/...
file://...
```

常见图片字段：

- 首页分层素材路径：在“首页与联系”里修改。
- 板块背景图路径：在“板块背景”里修改。
- 案例封面图路径：在“项目案卷”或“素材路径”里修改。
- 案例详情主图路径：在“项目案卷”或“素材路径”里修改。
- 案例图集路径：一行一个图片路径，删除一行就是删除一张图。
- 文章封面图路径：在“项目案卷”里修改。

## 5. 如何修改视频路径

视频路径也必须写项目内相对路径，例如：

```text
assets/projects/project-a/video.mp4
assets/backgrounds/home-bg.mp4
```

视频封面 poster 路径写图片路径，例如：

```text
assets/projects/project-a/video-poster.jpg
```

常见视频字段：

- 板块视频路径：在“板块背景”里修改。
- 案例视频路径：在“项目案卷”或“素材路径”里修改。
- 案例视频封面 poster 路径：在“项目案卷”或“素材路径”里修改。
- 文章视频块的 poster：在“项目文章”里填写 Poster / Thumbnail 路径。

## 6. 如何新增或替换图片、视频、模型、全景、附件

建议把素材放到这些目录：

```text
assets/projects/项目ID-英文短名/
assets/backgrounds/
assets/hero-depth/
assets/models/
assets/panoramas/
assets/attachments/
assets/portfolio/
```

推荐命名：

```text
cover.jpg
detail-hero.jpg
article-cover.jpg
gallery-01.jpg
video.mp4
video-poster.jpg
model.glb
model-thumb.jpg
panorama.jpg
panorama-thumb.jpg
case.pdf
```

附件格式在后台中按一行一个填写：

```text
assets/projects/project-a/case.pdf | 完整案例 PDF | pdf | 下载完整项目文件
```

本机上传仅用于预览。若要让所有设备看到，请将素材文件上传到 GitHub 仓库对应 `assets` 目录，并在后台填写项目内相对路径。

## 7. 如何导出 site-data.json

1. 在后台确认内容修改完成。
2. 点击“导出 JSON”。
3. 浏览器会下载一个文件，文件名必须是：

```text
site-data.json
```

这个文件包含网站文字、项目、路径、附件等数据，不包含图片、视频、模型或 PDF 文件本身。

## 8. 如何覆盖 assets/data/site-data.json

1. 找到刚下载的 `site-data.json`。
2. 打开 GitHub 仓库或本地项目文件夹。
3. 找到：

```text
assets/data/site-data.json
```

4. 用下载的 `site-data.json` 覆盖它。
5. 确认文件名仍然是 `site-data.json`，位置仍然是 `assets/data/`。

## 9. 如何把文件提交到 GitHub

需要提交两类文件：

- 新的 `assets/data/site-data.json`
- 新增或替换的素材文件，例如图片、视频、模型、全景、附件

在 GitHub 网页上可以这样做：

1. 进入仓库。
2. 找到要上传的目录，例如 `assets/projects/project-a/`。
3. 上传素材文件。
4. 找到 `assets/data/site-data.json` 并覆盖。
5. 填写提交说明，例如“更新网站内容和项目素材”。
6. 点击提交。

## 10. GitHub Pages 更新后如何检查

1. 打开 GitHub 仓库的 Actions 或 Pages 部署状态。
2. 等部署完成。
3. 打开线上网址。
4. 强制刷新浏览器。
5. 用另一台设备或无痕窗口打开，确认看到的是线上正式数据。

## 11. 其他设备看不到修改时如何排查

先检查后台顶部状态：

- 如果显示“当前使用：本机草稿数据。”，说明当前设备还在看草稿。
- 如果显示“当前使用：线上 JSON 数据；”，说明当前设备正在看正式数据。

再检查这些事项：

1. 是否已经导出 `site-data.json`。
2. 是否覆盖了 `assets/data/site-data.json`。
3. 是否把图片、视频、模型、全景、附件也上传到了 GitHub。
4. 路径大小写是否完全一致。
5. GitHub Pages 是否部署完成。
6. 浏览器是否有缓存。

## 12. 如何清除本机草稿并查看线上正式数据

1. 打开后台。
2. 点击“恢复线上数据 / 清除本机草稿”。
3. 后台顶部应显示“当前使用：线上 JSON 数据；”。
4. 刷新页面，再确认内容是否与线上正式数据一致。

## 13. 常见错误说明

文件名不一致：

路径里写的是 `cover.jpg`，但 GitHub 上实际文件叫 `Cover.JPG`，线上可能加载失败。大小写也要一致。

路径写错：

正确路径一般以 `assets/` 开头。不要写 `C:\Users\...`、`/Users/...` 或 `file://...`。

图片没有上传到 GitHub：

后台只保存路径，不会把图片自动发布到 GitHub。图片必须单独上传到仓库。

视频太大：

视频太大会加载慢，也可能超过 GitHub 网页上传限制。建议压缩视频，或使用较短的 `.mp4` / `.webm` 文件。

浏览器缓存：

如果线上已经更新但你看不到，可以强制刷新，或用无痕窗口检查。

GitHub Pages 还没部署完成：

提交后需要等待 Pages 部署。部署没完成时，线上仍然是旧版本。

当前设备仍在看 localStorage 草稿：

如果后台顶部显示“当前使用：本机草稿数据。”，说明当前浏览器优先显示本机草稿。点击“恢复线上数据 / 清除本机草稿”即可查看线上正式数据。

## 14. 发布前检查

发布前建议进入后台“路径检查”：

1. 点击“重新检查”。
2. 查看“空路径提醒”。
3. 查看“本机路径提醒”。
4. 查看“可疑路径提醒”。
5. 查看“发布清单：所有被引用的素材路径”。

发布清单里的文件，都需要能在 GitHub 仓库中找到。只要路径以 `assets/` 开头，并且文件已经提交到 GitHub，其他设备通常就能访问。
