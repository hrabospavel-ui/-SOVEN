# 北屿营造设计工作室静态官网

这是一个可部署到 GitHub Pages 的完整静态网站项目。入口文件保留为 `index.html`，样式位于 `assets/css/styles.css`，交互逻辑位于 `assets/js/app.js`，线上正式内容位于 `assets/data/site-data.json`。

## 正式维护方式

本项目采用“直接代码发布模式”：前台默认读取 `assets/data/site-data.json`，这个文件就是线上正式内容来源。

GitHub Pages 不能在线写入仓库，也不连接数据库、服务器或对象存储。图片、GIF、视频、GLB、PDF 等正式素材需要先手动上传到 GitHub 仓库的 `assets` 目录，再把相对路径写入 `assets/data/site-data.json`。

个人维护台保存会写入当前浏览器的 `localStorage`，只用于本机临时预览。刷新页面默认仍读取线上正式 JSON；如果本机显示和其他设备不同，请在维护台点击“使用线上数据 / Clear Draft”清除本地草稿。

## 推荐目录

项目素材：

```text
assets/projects/p001-northern-wind-court/cover.jpg
assets/projects/p001-northern-wind-court/article-01.jpg
assets/projects/p001-northern-wind-court/article-02.gif
assets/projects/p001-northern-wind-court/walkthrough.mp4
assets/projects/p001-northern-wind-court/model.glb
assets/projects/p001-northern-wind-court/panorama.jpg
assets/projects/p001-northern-wind-court/drawings.pdf
```

板块背景：

```text
assets/backgrounds/home-bg.jpg
assets/backgrounds/works-bg.jpg
assets/backgrounds/research-bg.jpg
```

瓦当图标当前代码优先使用 `assets/images/watang.webp`，并保留 `assets/watang/watang.png` 作为备用。

## 个人维护台

公开页面不显示维护入口。个人维护台通过隐藏触发方式打开，并需要输入维护密码；登录状态只保存在 `sessionStorage`，关闭浏览器后失效。

项目素材在“素材路径 / Asset Path Manager”中维护，支持：

- `coverImage`
- `gallery`
- `drawings`
- `model3d`
- `panorama`
- `video`
- `pdf`

多图字段一行一个路径。保存后会立即刷新当前浏览器中的前台展示，并保留在 `localStorage`。

要让所有设备看到更新，请直接修改 `assets/data/site-data.json`，然后把 JSON 和素材文件一起提交到 GitHub。

“本地临时预览导入”只保存到当前浏览器 IndexedDB，用于临时看效果；更换设备、清理站点数据或换浏览器后会丢失。正式发布请使用 `assets/...` 相对路径。

## 文章块路径

完整项目文章页继续使用 `articleBlocks`：

```json
[
  { "type": "heading", "text": "设计命题" },
  { "type": "paragraph", "text": "这里填写完整项目正文。" },
  {
    "type": "image",
    "asset": "assets/projects/p001-northern-wind-court/article-01.jpg",
    "caption": "入口空间效果图"
  },
  {
    "type": "gallery",
    "assets": [
      "assets/projects/p001-northern-wind-court/article-02.jpg",
      "assets/projects/p001-northern-wind-court/article-03.jpg"
    ],
    "caption": "空间序列"
  },
  {
    "type": "video",
    "asset": "assets/projects/p001-northern-wind-court/walkthrough.mp4",
    "caption": "空间漫游视频"
  },
  {
    "type": "pdf",
    "asset": "assets/projects/p001-northern-wind-court/drawings.pdf",
    "label": "查看完整图纸 PDF"
  },
  { "type": "model3d", "asset": "assets/projects/p001-northern-wind-court/model.glb" },
  { "type": "panorama", "asset": "assets/projects/p001-northern-wind-court/panorama.jpg" }
]
```

如果项目没有自定义 `articleBlocks`，前台会根据 `description`、`gallery`、`drawings`、`video`、`pdf`、`model3d`、`panorama` 自动生成默认文章。直接访问 `#project/p001` 可以打开完整项目文章。

## 板块背景

“板块背景 / Section Backgrounds”以路径方式维护，支持 `home` 在内的所有板块。填写路径后，背景图会垫在底层，原设计背景保留，并可调节：

- `imageOpacity`
- `designOpacity`
- `position`
- `blendMode`

没有填写背景路径时，原效果保持不变。

## 导入导出

个人维护台支持：

- 导出 `projects JSON`
- 导出 `siteSettings JSON`
- 导出 `site-data.json`
- 导入 `projects JSON`
- 导入 `siteSettings JSON`
- 导入 `site-data.json`

导出的 JSON 只包含路径和数据，不包含素材文件。正式发布时，请用导出的内容更新 `assets/data/site-data.json`，并确认素材文件已经提交到 GitHub 仓库。

## GitHub Pages 部署

上传整个项目到仓库根目录后，在 GitHub Pages 中选择对应分支和根目录部署。所有项目内引用都使用相对路径，适配：

```text
https://用户名.github.io/仓库名/
```

## 图片不显示排查

- 路径大小写是否与仓库文件完全一致；
- 文件是否真的提交到了 GitHub；
- 文件名是否包含空格或中文；
- GitHub Pages 是否已经完成部署；
- 是否误用了本机路径，如 `C:\...` 或 `file://...`；
- 是否把素材放在仓库外部；
- 如果页面部署在仓库子路径下，请继续使用 `assets/...` 这种相对路径，不要写 `/assets/...`。


## Cache Busting / 持续更新缓存说明

本版本已加入缓存破除机制，版本号：`202607090712`。

已修改：
- `index.html`：给 `assets/css/styles.css` 和 `assets/js/app.js` 增加 `?v=202607090712`
- `assets/js/app.js`：读取 `assets/data/site-data.json` 时增加动态版本号与 `cache: "no-store"`

以后更新规则：
1. 只更新后台导出的内容：覆盖 `assets/data/site-data.json` 即可。
2. 修改 CSS 或 JS：同时更新 `index.html` 中对应文件后面的 `?v=版本号`。
3. 替换图片 / 视频 / 模型：推荐使用新文件名，然后在 `site-data.json` 中更新路径。



## V18 数据缓存破除 / site-data.json 强制刷新

本版本已进一步优化持续更新缓存问题，版本号：`202607090714`。

已修改：
- `index.html`：更新 `styles.css` / `app.js` 的版本号。
- `assets/js/app.js`：读取 `assets/data/site-data.json` 时使用 `withCacheBust(SITE_DATA_URL)`，每次刷新都会追加当前时间戳。
- `assets/js/app.js`：支持用 `?fresh=1`、`?official=1` 或 `?clearDraft=1` 强制忽略本机后台草稿，读取 GitHub 上的正式 `site-data.json`。

以后更新后台数据：
1. 把后台导出的 JSON 改名为 `site-data.json`。
2. 覆盖 `assets/data/site-data.json`。
3. 提交 GitHub。
4. 用户刷新页面即可读取新数据。
5. 如果某台电脑仍显示旧草稿，可访问：`你的网址?fresh=1`。



## V19 数据安全优化

本版本进一步降低后台发布时用错 JSON 的风险，版本号：`202607090726`。

新增优化：
- 网站现在可以兼容“完整站点数据 JSON”和“设置 JSON”。
- 如果你误把设置 JSON 改名为 `site-data.json`，网站会保留现有项目数据，不会直接把项目清空。
- 后台导出“设置 JSON”时会弹出提示，提醒它不能替代完整 `site-data.json`。
- “导出完整站点数据 site-data.json”会附带 `schema` 和 `exportedAt`，便于识别正式数据文件。

正式发布仍然推荐：
1. 后台使用“导出完整站点数据 site-data.json”。
2. 覆盖 `assets/data/site-data.json`。
3. 提交 GitHub。
4. 如某台电脑仍显示旧草稿，访问 `?fresh=1`。



## V20 后台发布流程优化

本版本优化后台发布流程，版本号：`202607090732`。

新增：
- 后台顶部增加“正式发布三步”提示；
- 增加“复制数据路径”按钮：`assets/data/site-data.json`；
- 增加“复制强刷链接”按钮：`?fresh=1`；
- “导出完整站点数据”按钮更醒目；
- 导出完整 `site-data.json` 前增加发布步骤确认。

替换文件：
1. `index.html`
2. `assets/css/styles.css`
3. `assets/js/app.js`
4. `README.md`（可选）



## V21 首页动效微调

本版本在不重做首页结构的前提下，进一步优化首页观感，版本号：`202607090751`。

本次调整：
- 背景整体提亮约 20%，仍保持暗调基底；
- 追光不再单纯堆亮度，而是同时提升一点色温与亮度；
- 追光圆斑改为更暖一点的米金 / 暖白层次，更接近“追光”而不是冷白高光；
- 保持现有视差与动效结构不变，仅做安全覆盖式微调。



## V23 后台发布检查按钮

本版本把 v22 的控制台发布检查升级为后台按钮，版本号：`202607090810`。

新增：
- 后台“正式发布三步”区域增加“发布检查”按钮；
- 点击后直接在后台显示检查结果；
- 检查 `assets/data/site-data.json` 是否可读取、JSON 是否有效；
- 自动扫描所有 `assets/...` 路径并检查缺失素材；
- 检查结果会在后台面板显示，不再需要打开控制台。

替换文件：
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `README.md`（可选）



## V24 JSON 导入防误操作

本版本优化后台 JSON 导入逻辑，版本号：`202607090811`。

新增：
- 自动识别“完整站点数据 / 设置 JSON / 项目 JSON”；
- 在错误入口导入 JSON 时给出提示，而不是直接覆盖；
- 在“导入完整站点数据”入口导入设置 JSON 时，会询问是否只合并设置；
- 在“导入完整站点数据”入口导入项目 JSON 时，会询问是否只合并项目；
- 设置 JSON 导出文件名改为 `site-settings-only.json`，降低误当作正式 `site-data.json` 的概率。

替换文件：
- `index.html`
- `assets/js/app.js`
- `README.md`（可选）



## V25 追光减暗与项目卡片修复

版本号：`202607090845`。

本次修复：
- 首页圆形追光整体减暗约 25%；
- 保留暖白 / 米金色温，但降低中心亮度和外扩光晕；
- 修复项目卡片可能因滚动观察器未触发而全部不可见的问题；
- 不改变首页图层、项目数据、后台发布系统和 JSON 逻辑。

替换文件：
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `README.md`（可选）



## V26 运行时与项目卡片二次修复

版本号：`202607090852`。

本次重新检查后发现：
- V25 的项目卡片修复主要是 CSS 兜底，但如果某些浏览器阻止 IndexedDB，初始化流程可能提前中断，导致项目卡片根本没有渲染；
- V23/V24 的发布检查按钮存在一个作用域问题：`runPublishCheck()` 在主脚本作用域外调用了内部函数，点击时可能报错。

本次修复：
- IndexedDB 被阻止时，不再影响线上项目数据渲染；
- 初始化流程拆分容错，素材库失败不会阻断项目列表；
- renderAll 后增加项目卡片可见性兜底；
- 修复后台“发布检查”按钮的函数作用域问题；
- 保留 V25 的追光减暗约 25% 设置。



## V27 追光、背景与页面跳转动效修复

版本号：`202607091143`。

本次针对反馈修复：
- 追光在当前基础上减淡约 40%；
- 首页背景素材亮度在当前基础上提亮约 10%；
- 移除 v25 / v26 中默认强制项目卡片可见的 CSS 覆盖；
- 项目卡片兜底显示改为“进入视口仍不可见时才启用”，避免压掉页面跳转 / 入场动效；
- 保留 v26 的 IndexedDB 容错与项目渲染修复。



## V28 鼠标追光精修

版本号：`202607091151`。

本次针对反馈修复：
- 不再只调通用 `.hero-spotlight` 变量，而是直接调整真实生效的 `.hero-spotlight::before` / `::after`；
- 追光面积明显缩小；
- 光斑亮度进一步降低，不再形成大面积发白；
- 保留暖白 / 米金色温；
- 增加 mousemove 兜底绑定，避免部分浏览器 PointerEvent 下鼠标追光响应不明显；
- 背景亮度、页面跳转动效、项目卡片运行时修复保持 v27 状态。



## V29 鼠标追光直径缩减

版本号：`202607091338`。

本次针对反馈修复：
- 鼠标追光光圈直径在 V28 基础上进一步缩减约 40%；
- 边缘位置的光圈也同步收小；
- 取消追光层的负 inset，避免光圈在边缘被放大成大片泛光；
- 中心光和外圈光晕继续保持克制；
- 不改页面跳转动效、不改项目卡片逻辑、不改后台数据功能。



## V30 固定半径鼠标追光

版本号：`202607100205`。

本次针对反馈修复：
- 解决鼠标追光在画面边缘变大的问题；
- 将百分比 radial-gradient 改为固定 px 半径；
- 追光在首页中央、边缘、角落都会保持相近大小；
- 保留 V29 的小光斑、低亮度方向；
- 不改页面跳转动效、不改项目卡片和后台数据逻辑。



## V31 固定像素鼠标追光

版本号：`202607100216`。

本次针对反馈修复：
- 不再把追光画在整屏渐变层上；
- 改为固定宽高的伪元素跟随鼠标；
- 中央、边缘、角落光斑直径保持一致；
- 禁用图层泛光，避免边缘看起来变大；
- 不改页面跳转动效、不改项目卡片逻辑、不改后台数据功能。



## V32 清晰边界鼠标追光

版本号：`202607100451`。

本次针对反馈修复：
- 恢复可见的鼠标追光；
- 改成固定尺寸中等大小光斑；
- 光斑边界更清晰；
- 只保留轻微边界模糊；
- 禁用会让边缘变大的图层泛光；
- 不改页面跳转动效、不改项目卡片逻辑、不改后台数据功能。



## V33 参考图方向的电影感追光

版本号：`202607100508`。

本次根据你上传的参考图重新调整追光：
- 改为较明显的“局部照亮画面”的电影感追光；
- 比参考图小很多，不做大面积整屏泛光；
- 固定尺寸，不会在边缘变大；
- 边界比之前清楚，但保留轻微柔化；
- 保持页面跳转动效、项目卡片和后台功能不变。



## V34 圆形参考光斑修复

版本号：`202607100515`。

本次只按参考图方向重修首页鼠标光斑：
- 去掉锥形光、光束感、方向性泛光；
- 改成固定大小的圆形 / 近圆形局部光斑；
- 主光斑约 310px，软边约 372px；
- 边缘只有轻微柔化；
- 鼠标到边缘时只裁切，不放大；
- 页面跳转动效、项目卡片和后台功能不变。


## V35 真正去锥形圆光斑版
- 彻底移除锥形/三角形光束；
- 只保留一个固定尺寸圆形光斑；
- 替换 index.html、assets/css/styles.css、assets/js/app.js 即可。


## V36 柔和参考圆光斑版
- 降低光斑亮度；
- 柔化边界；
- 继续禁止锥形/光束；
- 替换 index.html、assets/css/styles.css、assets/js/app.js。


## V37 参考图亮度圆光斑版
- 在 V36 基础上提高亮度；
- 保持柔和边界；
- 继续禁止锥形/光束；
- 替换 index.html、assets/css/styles.css、assets/js/app.js。


## V38 光斑外缘柔化版
- 保持 V37 亮度；
- 外缘向外柔化；
- 继续禁止锥形/光束；
- 替换 index.html、assets/css/styles.css、assets/js/app.js。


## V39 融入画面的参考光斑版
- 改为 backdrop-filter 内容提亮 + 柔和暖色 bloom；
- 取消硬裁切圆盘；
- 边界自然消散；
- 继续禁止锥形/光束。


## V40 参考图亮度柔和光斑版
- 保持 V39 柔和边界；
- 提高光区亮度；
- 强化内容提亮和暖色 bloom；
- 继续禁止锥形/光束。


## V41 数据源与后台界面修复版
- 公开页默认只读 assets/data/site-data.json；
- localStorage 草稿不再自动覆盖正式内容；
- 后台顶部压缩，发布说明折叠，模块导航改为可收起侧栏；
- 替换 index.html、assets/css/styles.css、assets/js/app.js。


## V42 JSON 读取与项目卡片恢复版
- site-data.json 改为多路径读取；
- 正式 JSON 读取失败时不再清空项目卡片；
- 保留 V41 的数据源优先级与后台界面紧凑化修复。


## V43 稳定清理与数据保护版
- 阻止导出 fallback；
- 本机草稿导出前二次确认；
- 发布检查显示读取路径、项目数量和结构提醒；
- 清理 V34-V40 旧光斑补丁，保留最终光斑实现。


## V44 本地预览与后台顶部修复版
- 识别 file:/// 本地预览导致的 JSON fetch 限制；
- 缩短错误状态提示，完整错误放入控制台；
- 修复后台顶部过高和按钮裁切问题。


## V46 clean data system / 数据系统固化版
- 以 v44 为基础重写数据兜底策略；
- app.js 不再保留旧版正式内容 fallback；
- JSON 失败时显示诊断占位，不显示旧首页/旧项目；
- 项目为空时显示明确空状态；
- fallback 禁止导出，本机草稿导出二次确认。


## V47 图片集、图文文章与模型视角修复版
- 项目媒体区只保留图片集和图文文章；
- 不再渲染 PDF、图纸、附件和“文章封面”标签；
- 失效图片自动移除；
- 模型展示限制垂直轨道，避免看到模型底部。


## V48 文章保存与公众号式阅读页修复版
- 保存文章会自动收录上方当前填写内容，不再因整页重绘而消失；
- 阅读文章改成公众号式单栏图文排版，不再以全屏图片开场。


## V49 文章数据与导出一致性修复版
- 导出前同步当前后台可见输入；
- 多行正文拆分成多个段落块；
- 文章页完整显示所有段落；
- 导出 JSON 与当前编辑内容一致。


## V50 真实 360° 全景查看器修复版
- 使用 Pannellum 加载真实等距柱状全景；
- 移除原来的滑块模拟全景；
- 加入 2:1 比例检查、错误提示和实例销毁。


## V51 多板块暂存与文章空块清理版
- 各后台板块分别保存到同一份本机草稿；
- 导出完整 JSON 时合并所有已保存板块；
- 存在未保存板块时阻止导出；
- 文章默认不生成空白块，点击“新增块”后才创建。


## V53 项目图集折叠翻阅版
- 图片集默认单张浏览与缩略图导航；
- 可展开全部或收起；
- 保持文章、模型和全景入口靠前可见。


## V54 移动端体验优化版
- 桌面端不变；
- 移动端补充安全区、动态视口、导航、弹窗、文章、图集手势、模型/全景重算与后台键盘适配。


## V55 项目板块显示控制版
- 每个项目可多选显示板块；
- 取消全部板块可隐藏项目但保留数据；
- 新项目默认仅显示在“全部作品”；
- 旧 JSON 自动兼容迁移。


## V56 删除营造板块与联系复制键版
- 删除 06 营造板块并过滤旧 #studio 数据；
- 联系板块改为邮箱、小红书、公众号、VX 四个复制键；
- 删除作品集 PDF 与旧 IG / BE / RED；
- JSON 统一使用 siteSettings.contact 四字段。


## V57 独立研究文章系统
- 研究文章使用顶层 `researchArticles`，与 `projects` 分离；
- 独立编号、独立后台、独立前台索引与阅读页；
- p007、p008 保持项目属性。


## V58 项目与研究前台显示控制版
- 项目与研究文章使用 `visible` 控制前台显示；
- 隐藏记录仍完整保留并导出；
- 旧 `published` 自动迁移，不再出现在新导出的 JSON 中。


## V72 末页满幅文字帘优化

本版本在 V71 文字建筑方案上继续调整：

- 建筑本体整体缩小约 10%，并轻微上移；
- 文字帘列数与纵向字符密度明显提高；
- 文字帘覆盖范围接近满幅，主要长列延伸至页面底部，部分内容自然超出；
- 保留长短、疏密、字号、透明度和青绿色点缀的变化；
- 底部继续渐隐消散，不形成整齐切边；
- 鼠标与触摸撩动逻辑保留；
- 未修改 site-data.json、项目数据和后台维护系统。

## 本地字体系统

网站已经内置字体文件，不依赖第三方字体 CDN：

- 首页中文主标题：`assets/fonts/qiji.woff2`
- 中文导航、首页导语及板块标题：`assets/fonts/chill-longcang-medium.woff2`
- 项目卡片封面及项目信息：继续使用原字体体系

后续修改 `assets/data/site-data.json` 中的工作室名称、首页宣言、导航名称和板块导语时，字体会自动保持，不需要再次改 CSS。工作室名称建议继续使用 `中文名｜英文名` 的格式，以便中英文分别套用字体。
