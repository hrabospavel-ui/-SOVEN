(function () {
  "use strict";

  var PUBLIC_SECTIONS = [
    { id: "home", labelCN: "首页", labelEN: "Home" },
    { id: "featured", labelCN: "精选作品", labelEN: "Featured" },
    { id: "works", labelCN: "作品总览", labelEN: "Works" },
    { id: "architecture", labelCN: "建筑", labelEN: "Architecture" },
    { id: "objects", labelCN: "器物", labelEN: "Objects" },
    { id: "research", labelCN: "研究", labelEN: "Research" },
    { id: "studio", labelCN: "营造", labelEN: "Studio" },
    { id: "contact", labelCN: "联系", labelEN: "Contact" }
  ];

  var ASSET_DB_NAME = "NorthernAtelierAssetDB";
  var ASSET_DB_VERSION = 1;
  var ASSET_STORE = "assets";
  var ASSET_ID_PREFIX = "asset_";
  var SITE_DATA_URL = "assets/data/site-data.json";
  var ADMIN_HASH_ROUTE = "#atelier-console";
  var ADMIN_SESSION_KEY = "northernAtelier.adminSession.v1";
  var ADMIN_PASSWORD_HASH = "50b1458955475f1f949da12c1ac7f4c6e77264e59df06ceb82ac1e650ae2d02d";

  var FALLBACK_SITE_DATA = {
    "siteSettings": {
      "studioName": "北屿营造",
      "studioSeal": "北屿",
      "taglineCN": "在黑色天幕中，重构北方高古的空间秩序。",
      "taglineEN": "Northern Tectonics Reframed for Contemporary Space and Objects.",
      "intro": "以建筑、器物、空间研究和数字模型为方法，把传统营造的秩序转译为当代生活与展示系统。",
      "philosophy": "我们关注北方建筑的尺度、风、影、材料和秩序，也关注产品在手中被使用的瞬间。每个项目从线稿、模型、图纸和现场材料同时推进。",
      "email": "hello@northern-atelier.example",
      "portfolioPdf": "assets/portfolio/northern-atelier-portfolio.pdf",
      "accentColor": "#536A63",
      "hero": {
        "sealSuffix": "NORTHERN TECTONIC INDEX",
        "primaryAction": {
          "labelCN": "展开案例",
          "labelEN": "Browse Works",
          "href": "#works"
        },
        "secondaryAction": {
          "labelCN": "营造探析",
          "labelEN": "Studio Method",
          "href": "#studio"
        },
        "indexLinks": [
          {
            "no": "01",
            "label": "建筑",
            "href": "#architecture"
          },
          {
            "no": "02",
            "label": "造物",
            "href": "#objects"
          },
          {
            "no": "03",
            "label": "营造",
            "href": "#research"
          }
        ],
        "bottomStrip": [
          "AXIS",
          "PLINTH",
          "EAVE LINE",
          "MODEL PLATFORM"
        ]
      },
      "sections": {
        "featured": {
          "eyebrow": "FEATURED WORKS / 精选作品",
          "title": "沿通道斜切，异形玻璃体连通老建筑与新剧场。",
          "description": "一座街区，如何同时装下菜场、市政、图书馆。"
        },
        "works": {
          "eyebrow": "WORKS / 作品总览",
          "title": "项目索引不是目录，而是一套可维护的设计案卷。",
          "description": "项目通过统一数据层渲染，支持分类筛选、发布状态、媒体能力和后期内容更新。"
        },
        "architecture": {
          "eyebrow": "ARCHITECTURE / 建筑",
          "title": "从中轴线、台基和屋脊线开始，重排空间秩序。",
          "description": "建筑与空间设计入口，覆盖展陈、公共空间、更新改造和沉浸式场景。"
        },
        "objects": {
          "eyebrow": "OBJECTS / 器物",
          "title": "器物不是小建筑，而是材料、尺度与手感的独立系统。",
          "description": "产品设计、家具、装置与器物实验，保持克制的东方平面和年轻的结构敏感度。"
        },
        "research": {
          "eyebrow": "RESEARCH / 研究",
          "title": "把构造、材料、形态生成、3D 模型和全景场景放在同一张工作台上。",
          "description": ""
        },
        "studio": {
          "eyebrow": "STUDIO METHOD / 营造",
          "title": "年轻团队，使用现代系统重新组织传统营造精神。",
          "description": "我们关注北方建筑的尺度、风、影、材料和秩序，也关注产品在手中被使用的瞬间。每个项目从线稿、模型、图纸和现场材料同时推进。"
        },
        "contact": {
          "eyebrow": "CONTACT / 联系",
          "title": "让新的空间、器物或研究案卷从一封邮件开始。",
          "description": ""
        }
      },
      "contact": {
        "emailLabel": "邮件联系",
        "portfolioLabel": "作品集 PDF",
        "portfolioCaption": "Portfolio",
        "socialLinks": [
          {
            "label": "Instagram",
            "text": "IG",
            "href": "#"
          },
          {
            "label": "Behance",
            "text": "BE",
            "href": "#"
          },
          {
            "label": "Xiaohongshu",
            "text": "RED",
            "href": "#"
          }
        ]
      },
      "footer": {
        "copyright": "© Northern Atelier",
        "note": "Static site content is maintained in assets/data/site-data.json."
      },
      "visualAssets": {
        "heroDepth": {
          "mountain": "assets/hero-depth/hero-mountain.webp",
          "windowFrame": "assets/hero-depth/hero-window-frame.webp",
          "lady": "assets/hero-depth/hero-lady.webp",
          "vignette": "assets/hero-depth/hero-vignette.webp",
          "reference": "assets/hero-depth/hero-reference.webp"
        },
        "watang": {
          "webp": "assets/images/watang.webp",
          "pngFallback": "assets/watang/watang.png"
        }
      },
      "sectionBackgrounds": {
        "home": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        },
        "featured": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        },
        "works": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center top",
          "blendMode": "multiply"
        },
        "architecture": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        },
        "objects": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        },
        "research": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        },
        "studio": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        },
        "contact": {
          "image": "",
          "imageOpacity": 0,
          "designOpacity": 1,
          "position": "center",
          "blendMode": "screen"
        }
      }
    },
    "navigation": [
      {
        "labelCN": "首页",
        "labelEN": "Home",
        "href": "#home"
      },
      {
        "labelCN": "作品",
        "labelEN": "Works",
        "href": "#works"
      },
      {
        "labelCN": "建筑",
        "labelEN": "Architecture",
        "href": "#architecture"
      },
      {
        "labelCN": "器物",
        "labelEN": "Objects",
        "href": "#objects"
      },
      {
        "labelCN": "研究",
        "labelEN": "Research",
        "href": "#research"
      },
      {
        "labelCN": "营造",
        "labelEN": "Studio",
        "href": "#studio"
      },
      {
        "labelCN": "联系",
        "labelEN": "Contact",
        "href": "#contact"
      }
    ],
    "methods": [
      {
        "no": "01",
        "title": "秩序提取",
        "text": "从中轴线、台基、屋脊和院落尺度中提取组织方法，而不是复刻传统符号。"
      },
      {
        "no": "02",
        "title": "材料转译",
        "text": "把瓦灰、木褐、冷青、朱砂和砖石触感转成当代材料、色彩与界面系统。"
      },
      {
        "no": "03",
        "title": "数字预演",
        "text": "通过图纸、模型台和全景场景提前测试空间氛围、观看路径和维护方式。"
      },
      {
        "no": "04",
        "title": "轻量交付",
        "text": "官网内容以后可由数据层维护，项目、素材和发布状态都预留接口位置。"
      }
    ],
    "projects": [
      {
        "id": "p001",
        "titleCN": "北台风庭",
        "titleEN": "Northern Wind Court",
        "category": "Architecture",
        "year": "2026",
        "location": "Hohhot",
        "status": "Published",
        "material": "brick, dark timber, glass, wind channel",
        "scale": "1,850 sqm",
        "role": "concept, spatial design, exhibition route",
        "concept": "把台基、风廊和中轴线压缩成一座可行走的数字高台。",
        "description": "项目从北方高台建筑的体量感出发，用暗色砖石、冷青光线和折线屋脊组织展陈路径，让空间像从黑色地平线中升起。",
        "coverImage": "abstract:ridge",
        "gallery": [
          "assets/projects/p001-northern-wind-court/article-01.png"
        ],
        "drawings": [
          "assets/projects/p001-northern-wind-court/drawings.pdf"
        ],
        "model3d": "assets/projects/p001-northern-wind-court/model.glb",
        "panorama": "assets/projects/p001-northern-wind-court/panorama.png",
        "video": "",
        "pdf": "assets/projects/p001-northern-wind-court/case.pdf",
        "tags": [
          "中轴线",
          "台基",
          "展陈",
          "冷青光"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "项目从北方高台建筑的体量感出发，用暗色砖石、冷青光线和折线屋脊组织展陈路径，让空间像从黑色地平线中升起。"
          },
          {
            "type": "quote",
            "text": "把台基、风廊和中轴线压缩成一座可行走的数字高台。"
          },
          {
            "type": "image",
            "asset": "assets/projects/p001-northern-wind-court/article-01.png",
            "caption": "项目图像"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p001-northern-wind-court/drawings.pdf",
            "label": "查看图纸 / Drawing"
          },
          {
            "type": "model3d",
            "asset": "assets/projects/p001-northern-wind-court/model.glb"
          },
          {
            "type": "panorama",
            "asset": "assets/projects/p001-northern-wind-court/panorama.png"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p001-northern-wind-court/case.pdf",
            "label": "下载完整项目 PDF"
          }
        ],
        "featured": true,
        "published": true
      },
      {
        "id": "p002",
        "titleCN": "器物之山",
        "titleEN": "Vessel Mountain Index",
        "category": "Objects",
        "year": "2026",
        "location": "Beijing",
        "status": "Prototype",
        "material": "aluminum, ash wood, cyan glaze",
        "scale": "object series",
        "role": "product design, prototype direction",
        "concept": "把山墙与瓦当转译成可握持、可陈列的器物比例。",
        "description": "一组从山墙折线、瓦灰与青釉中生成的桌面器物，不追求仿古，而用当代加工方式保留北方器物的稳定和锋利。",
        "coverImage": "abstract:vessel",
        "gallery": [
          "assets/projects/p002-vessel-mountain-index/article-01.png"
        ],
        "drawings": [],
        "model3d": "assets/projects/p002-vessel-mountain-index/model.glb",
        "panorama": "",
        "video": "",
        "pdf": "assets/projects/p002-vessel-mountain-index/case.pdf",
        "tags": [
          "器物",
          "青釉",
          "瓦当",
          "产品"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "一组从山墙折线、瓦灰与青釉中生成的桌面器物，不追求仿古，而用当代加工方式保留北方器物的稳定和锋利。"
          },
          {
            "type": "quote",
            "text": "把山墙与瓦当转译成可握持、可陈列的器物比例。"
          },
          {
            "type": "image",
            "asset": "assets/projects/p002-vessel-mountain-index/article-01.png",
            "caption": "项目图像"
          },
          {
            "type": "model3d",
            "asset": "assets/projects/p002-vessel-mountain-index/model.glb"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p002-vessel-mountain-index/case.pdf",
            "label": "下载完整项目 PDF"
          }
        ],
        "featured": true,
        "published": true
      },
      {
        "id": "p003",
        "titleCN": "黑穹模型台",
        "titleEN": "Obsidian Model Platform",
        "category": "Research",
        "year": "2025",
        "location": "Online Lab",
        "status": "Published",
        "material": "web canvas, GLB, point light",
        "scale": "digital prototype",
        "role": "interaction research, viewer prototype",
        "concept": "让模型在加载前保持沉默，只在需要时展开。",
        "description": "面向未来项目库的 3D 展示模块研究，默认不加载大型模型，点击后再进入模型台，以保证作品集首屏和列表体验轻盈。",
        "coverImage": "abstract:grid",
        "gallery": [],
        "drawings": [],
        "model3d": "assets/projects/p003-obsidian-model-platform/model.glb",
        "panorama": "",
        "video": "",
        "pdf": "",
        "tags": [
          "3D",
          "GLB",
          "交互",
          "模型台"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "面向未来项目库的 3D 展示模块研究，默认不加载大型模型，点击后再进入模型台，以保证作品集首屏和列表体验轻盈。"
          },
          {
            "type": "quote",
            "text": "让模型在加载前保持沉默，只在需要时展开。"
          },
          {
            "type": "model3d",
            "asset": "assets/projects/p003-obsidian-model-platform/model.glb"
          }
        ],
        "featured": true,
        "published": true
      },
      {
        "id": "p004",
        "titleCN": "塞上院落更新",
        "titleEN": "Frontier Courtyard Renewal",
        "category": "Architecture",
        "year": "2025",
        "location": "Datong",
        "status": "Design Development",
        "material": "gray brick, rammed earth, recycled wood",
        "scale": "620 sqm",
        "role": "renovation strategy, facade, interior",
        "concept": "旧院落保留风口和阴影，新界面只做必要介入。",
        "description": "以灰砖、夯土和木构为材料基础，保留院落的风道和尺度，通过现代平面和模块化构造减少历史符号堆叠。",
        "coverImage": "abstract:plinth",
        "gallery": [
          "assets/projects/p004-frontier-courtyard-renewal/article-01.png"
        ],
        "drawings": [
          "assets/projects/p004-frontier-courtyard-renewal/drawings.pdf"
        ],
        "model3d": "",
        "panorama": "assets/projects/p004-frontier-courtyard-renewal/panorama.png",
        "video": "",
        "pdf": "assets/projects/p004-frontier-courtyard-renewal/case.pdf",
        "tags": [
          "更新",
          "灰砖",
          "院落",
          "360"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "以灰砖、夯土和木构为材料基础，保留院落的风道和尺度，通过现代平面和模块化构造减少历史符号堆叠。"
          },
          {
            "type": "quote",
            "text": "旧院落保留风口和阴影，新界面只做必要介入。"
          },
          {
            "type": "image",
            "asset": "assets/projects/p004-frontier-courtyard-renewal/article-01.png",
            "caption": "项目图像"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p004-frontier-courtyard-renewal/drawings.pdf",
            "label": "查看图纸 / Drawing"
          },
          {
            "type": "panorama",
            "asset": "assets/projects/p004-frontier-courtyard-renewal/panorama.png"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p004-frontier-courtyard-renewal/case.pdf",
            "label": "下载完整项目 PDF"
          }
        ],
        "featured": false,
        "published": true
      },
      {
        "id": "p005",
        "titleCN": "冷青扶手系统",
        "titleEN": "Cangqing Rail System",
        "category": "Objects",
        "year": "2025",
        "location": "Shanghai",
        "status": "Prototype",
        "material": "anodized aluminum, ash wood, leather",
        "scale": "modular system",
        "role": "industrial design, detail design",
        "concept": "从斗拱的支撑逻辑抽出模块嵌套关系。",
        "description": "一套面向展厅和住宅的扶手与展架系统，结构关系来自传统支撑系统，但外观保持低调、锋利和可量产。",
        "coverImage": "",
        "gallery": [],
        "drawings": [
          "assets/projects/p005-cangqing-rail-system/drawings.pdf"
        ],
        "model3d": "assets/projects/p005-cangqing-rail-system/model.glb",
        "panorama": "",
        "video": "",
        "pdf": "assets/projects/p005-cangqing-rail-system/case.pdf",
        "tags": [
          "产品",
          "模块",
          "支撑",
          "金属"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "一套面向展厅和住宅的扶手与展架系统，结构关系来自传统支撑系统，但外观保持低调、锋利和可量产。"
          },
          {
            "type": "quote",
            "text": "从斗拱的支撑逻辑抽出模块嵌套关系。"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p005-cangqing-rail-system/drawings.pdf",
            "label": "查看图纸 / Drawing"
          },
          {
            "type": "model3d",
            "asset": "assets/projects/p005-cangqing-rail-system/model.glb"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p005-cangqing-rail-system/case.pdf",
            "label": "下载完整项目 PDF"
          }
        ],
        "featured": false,
        "published": true
      },
      {
        "id": "p006",
        "titleCN": "入此空间：北境展厅",
        "titleEN": "Enter Scene: Northern Gallery",
        "category": "Space",
        "year": "2024",
        "location": "Beijing",
        "status": "Published",
        "material": "panorama, light scan, dark stone",
        "scale": "immersive route",
        "role": "spatial narrative, panorama prototype",
        "concept": "把展厅入口变成一条从暗场进入光幕的路径。",
        "description": "以 360 全景为核心的空间展示原型，用户先在暗场看到轴线和光幕，再进入可滑动的全景场景。",
        "coverImage": "abstract:ridge",
        "gallery": [
          "assets/projects/p006-northern-gallery/article-01.png"
        ],
        "drawings": [],
        "model3d": "",
        "panorama": "assets/projects/p006-northern-gallery/panorama.png",
        "video": "",
        "pdf": "",
        "tags": [
          "360",
          "展厅",
          "光幕",
          "叙事"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "以 360 全景为核心的空间展示原型，用户先在暗场看到轴线和光幕，再进入可滑动的全景场景。"
          },
          {
            "type": "quote",
            "text": "把展厅入口变成一条从暗场进入光幕的路径。"
          },
          {
            "type": "image",
            "asset": "assets/projects/p006-northern-gallery/article-01.png",
            "caption": "项目图像"
          },
          {
            "type": "panorama",
            "asset": "assets/projects/p006-northern-gallery/panorama.png"
          }
        ],
        "featured": false,
        "published": true
      },
      {
        "id": "p007",
        "titleCN": "瓦灰材料谱系",
        "titleEN": "Tile Gray Material Atlas",
        "category": "Research",
        "year": "2024",
        "location": "Material Lab",
        "status": "Archive",
        "material": "tile powder, mineral pigment, paper sample",
        "scale": "material atlas",
        "role": "material research, visual system",
        "concept": "把瓦灰从历史材料转成现代设计色谱。",
        "description": "研究瓦灰、木褐、冷青与朱砂在不同材质上的显色关系，输出适用于建筑界面、产品外壳和图册系统的材料索引。",
        "coverImage": "abstract:paper",
        "gallery": [],
        "drawings": [
          "assets/projects/p007-tile-gray-material-atlas/drawings.pdf"
        ],
        "model3d": "",
        "panorama": "",
        "video": "",
        "pdf": "assets/projects/p007-tile-gray-material-atlas/case.pdf",
        "tags": [
          "材料",
          "色谱",
          "图册",
          "瓦灰"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "研究瓦灰、木褐、冷青与朱砂在不同材质上的显色关系，输出适用于建筑界面、产品外壳和图册系统的材料索引。"
          },
          {
            "type": "quote",
            "text": "把瓦灰从历史材料转成现代设计色谱。"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p007-tile-gray-material-atlas/drawings.pdf",
            "label": "查看图纸 / Drawing"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p007-tile-gray-material-atlas/case.pdf",
            "label": "下载完整项目 PDF"
          }
        ],
        "featured": false,
        "published": true
      },
      {
        "id": "p008",
        "titleCN": "轴线生成研究",
        "titleEN": "Axis Generation Study",
        "category": "Research",
        "year": "2023",
        "location": "Computational Studio",
        "status": "Published",
        "material": "parametric drawing, SVG, canvas",
        "scale": "research notes",
        "role": "geometry research, drawing system",
        "concept": "不复刻总平面，而提取秩序、方向和节奏。",
        "description": "项目以传统建筑中轴线为出发点，生成一套可用于页面布局、展陈路线和项目编号的几何系统。",
        "coverImage": "",
        "gallery": [],
        "drawings": [
          "assets/projects/p008-axis-generation-study/drawings.pdf"
        ],
        "model3d": "",
        "panorama": "",
        "video": "",
        "pdf": "assets/projects/p008-axis-generation-study/case.pdf",
        "tags": [
          "参数化",
          "中轴线",
          "图纸",
          "系统"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "项目以传统建筑中轴线为出发点，生成一套可用于页面布局、展陈路线和项目编号的几何系统。"
          },
          {
            "type": "quote",
            "text": "不复刻总平面，而提取秩序、方向和节奏。"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p008-axis-generation-study/drawings.pdf",
            "label": "查看图纸 / Drawing"
          },
          {
            "type": "pdf",
            "asset": "assets/projects/p008-axis-generation-study/case.pdf",
            "label": "下载完整项目 PDF"
          }
        ],
        "featured": false,
        "published": true
      },
      {
        "id": "p009",
        "titleCN": "木构灯具一号",
        "titleEN": "Timber Lamp 01",
        "category": "Objects",
        "year": "2023",
        "location": "Hangzhou",
        "status": "Private Draft",
        "material": "dark timber, linen, brass line",
        "scale": "lighting prototype",
        "role": "object design",
        "concept": "用极少木构线条支撑一层柔光。",
        "description": "未发布草稿项目，用于展示维护端的发布状态切换和前台过滤逻辑。",
        "coverImage": "abstract:plinth",
        "gallery": [],
        "drawings": [],
        "model3d": "",
        "panorama": "",
        "video": "",
        "pdf": "",
        "tags": [
          "草稿",
          "木构",
          "灯具"
        ],
        "articleBlocks": [
          {
            "type": "heading",
            "text": "项目概述"
          },
          {
            "type": "paragraph",
            "text": "未发布草稿项目，用于展示维护端的发布状态切换和前台过滤逻辑。"
          },
          {
            "type": "quote",
            "text": "用极少木构线条支撑一层柔光。"
          }
        ],
        "featured": false,
        "published": false
      }
    ]
  };

  var siteSettings = {
    studioName: "营造设计工作室",
    studioSeal: "营造",
    taglineCN: "内容正在从正式数据文件加载。",
    taglineEN: "Loading official site data.",
    intro: "请维护 assets/data/site-data.json 作为线上正式内容来源。",
    philosophy: "正式案例、路径和详情文字集中维护在 assets/data/site-data.json。",
    email: "hello@northern-atelier.example",
    portfolioPdf: "assets/portfolio/northern-atelier-portfolio.pdf",
    accentColor: "#536A63",
    hero: createDefaultHeroContent(),
    sections: createDefaultSectionContent(),
    contact: createDefaultContactContent(),
    footer: createDefaultFooterContent(),
    visualAssets: createDefaultVisualAssets(),
    sectionBackgrounds: createDefaultSectionBackgrounds()
  };

  var navigation = [
    { labelCN: "首页", labelEN: "Home", href: "#home" },
    { labelCN: "作品", labelEN: "Works", href: "#works" },
    { labelCN: "建筑", labelEN: "Architecture", href: "#architecture" },
    { labelCN: "器物", labelEN: "Objects", href: "#objects" },
    { labelCN: "研究", labelEN: "Research", href: "#research" },
    { labelCN: "营造", labelEN: "Studio", href: "#studio" },
    { labelCN: "联系", labelEN: "Contact", href: "#contact" }
  ];

  var projects = [];

  var state = {
    settings: null,
    navigation: [],
    projects: [],
    filter: "All",
    activeProjectId: null,
    lastFocusedElement: null,
    lastScrollY: 0,
    scrollDirection: 1,
    adminOpen: false,
    cursorHover: false,
    cursorDown: false,
    activeSectionBgId: "home",
    activeArticleProjectId: "",
    activeArticleId: "",
    articleReturnHash: "",
    assets: [],
    assetURLs: {},
    assetDb: null,
    assetDbReady: false,
    assetDbError: "",
    assetPreviewRefs: [],
    dataSource: "official",
    dataLoadError: "",
    hasLocalDraft: false,
    adminEntryClickCount: 0,
    adminEntryTimer: 0,
    adminAuthPending: false
  };

  var ASSET_FIELD_CONFIG = {
    coverImage: {
      label: "coverImage / 封面",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      allowAbstract: true,
      kind: "image"
    },
    detailImage: {
      label: "detailImage / 详情主图",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      kind: "image"
    },
    articleCoverImage: {
      label: "articleCoverImage / 文章封面",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      kind: "image"
    },
    gallery: {
      label: "gallery / 图集",
      multiple: true,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      kind: "image"
    },
    drawings: {
      label: "drawings / 图纸",
      multiple: true,
      extensions: ["pdf", "jpg", "jpeg", "png"],
      kind: "mixed"
    },
    model3d: {
      label: "model3d / 模型",
      multiple: false,
      extensions: ["glb", "gltf"],
      kind: "model"
    },
    modelThumbnail: {
      label: "modelThumbnail / 模型缩略图",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      kind: "image"
    },
    panorama: {
      label: "panorama / 全景",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp"],
      kind: "image"
    },
    panoramaThumbnail: {
      label: "panoramaThumbnail / 全景缩略图",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      kind: "image"
    },
    video: {
      label: "video / 视频",
      multiple: false,
      extensions: ["mp4", "webm", "mov"],
      kind: "video"
    },
    videoPoster: {
      label: "videoPoster / 视频封面 poster",
      multiple: false,
      extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      kind: "image"
    },
    pdf: {
      label: "pdf / PDF",
      multiple: false,
      extensions: ["pdf"],
      kind: "pdf"
    },
    attachments: {
      label: "attachments / 附件",
      multiple: true,
      extensions: ["pdf", "zip", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "webp", "mp4", "webm", "glb", "gltf"],
      kind: "file"
    }
  };

  var methods = [];

  var STORAGE_KEYS = {
    settings: "northernAtelier.siteSettings.v3",
    projects: "northernAtelier.projects.v3",
    navigation: "northernAtelier.navigation.v1",
    methods: "northernAtelier.methods.v1",
    draftSavedAt: "northernAtelier.localDraftSavedAt.v1"
  };
  var defaultSiteSettings = clone(siteSettings);
  var defaultProjects = clone(projects);
  var reduceMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function createDefaultSectionBackgrounds() {
    var result = {};
    PUBLIC_SECTIONS.forEach(function (section) {
      result[section.id] = defaultSectionBackground(section.id);
    });
    return result;
  }

  function createDefaultHeroContent() {
    return {
      sealSuffix: "NORTHERN TECTONIC INDEX",
      primaryAction: {
        labelCN: "展开案例",
        labelEN: "Browse Works",
        href: "#works"
      },
      secondaryAction: {
        labelCN: "营造探析",
        labelEN: "Studio Method",
        href: "#studio"
      },
      indexLinks: [
        { no: "01", label: "建筑", href: "#architecture" },
        { no: "02", label: "造物", href: "#objects" },
        { no: "03", label: "营造", href: "#research" }
      ],
      bottomStrip: ["AXIS", "PLINTH", "EAVE LINE", "MODEL PLATFORM"]
    };
  }

  function createDefaultSectionContent() {
    return {
      featured: {
        eyebrow: "FEATURED WORKS / 精选作品",
        title: "沿通道斜切，异形玻璃体连通老建筑与新剧场。",
        description: "一座街区，如何同时装下菜场、市政、图书馆。"
      },
      works: {
        eyebrow: "WORKS / 作品总览",
        title: "项目索引不是目录，而是一套可维护的设计案卷。",
        description: "项目通过统一数据层渲染，支持分类筛选、发布状态、媒体能力和后期内容更新。"
      },
      architecture: {
        eyebrow: "ARCHITECTURE / 建筑",
        title: "从中轴线、台基和屋脊线开始，重排空间秩序。",
        description: "建筑与空间设计入口，覆盖展陈、公共空间、更新改造和沉浸式场景。"
      },
      objects: {
        eyebrow: "OBJECTS / 器物",
        title: "器物不是小建筑，而是材料、尺度与手感的独立系统。",
        description: "产品设计、家具、装置与器物实验，保持克制的东方平面和年轻的结构敏感度。"
      },
      research: {
        eyebrow: "RESEARCH / 研究",
        title: "把构造、材料、形态生成、3D 模型和全景场景放在同一张工作台上。",
        description: ""
      },
      studio: {
        eyebrow: "STUDIO METHOD / 营造",
        title: "年轻团队，使用现代系统重新组织传统营造精神。",
        description: "我们关注北方建筑的尺度、风、影、材料和秩序，也关注产品在手中被使用的瞬间。每个项目从线稿、模型、图纸和现场材料同时推进。"
      },
      contact: {
        eyebrow: "CONTACT / 联系",
        title: "让新的空间、器物或研究案卷从一封邮件开始。",
        description: ""
      }
    };
  }

  function createDefaultContactContent() {
    return {
      emailLabel: "邮件联系",
      portfolioLabel: "作品集 PDF",
      portfolioCaption: "Portfolio",
      socialLinks: [
        { label: "Instagram", text: "IG", href: "#" },
        { label: "Behance", text: "BE", href: "#" },
        { label: "Xiaohongshu", text: "RED", href: "#" }
      ]
    };
  }

  function createDefaultFooterContent() {
    return {
      copyright: "© Northern Atelier",
      note: "Static site content is maintained in assets/data/site-data.json."
    };
  }

  function createDefaultVisualAssets() {
    return {
      heroDepth: {
        mountain: "assets/hero-depth/hero-mountain.webp",
        windowFrame: "assets/hero-depth/hero-window-frame.webp",
        lady: "assets/hero-depth/hero-lady.webp",
        vignette: "assets/hero-depth/hero-vignette.webp",
        reference: "assets/hero-depth/hero-reference.webp"
      },
      watang: {
        webp: "assets/images/watang.webp",
        pngFallback: "assets/watang/watang.png"
      }
    };
  }

  function defaultSectionBackground(id) {
    return {
      image: "",
      video: "",
      videoPoster: "",
      imageOpacity: 0,
      designOpacity: 1,
      position: id === "works" ? "center top" : "center",
      blendMode: id === "works" ? "multiply" : "screen"
    };
  }

  function clampUnit(value, fallback) {
    var number = parseFloat(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.max(0, Math.min(1, number));
  }

  function normalizeSectionBackgrounds(input) {
    var source = input || {};
    var normalized = {};
    PUBLIC_SECTIONS.forEach(function (section) {
      var defaults = defaultSectionBackground(section.id);
      var current = Object.assign({}, defaults, source[section.id] || {});
      current.image = String(current.image || "").trim();
      current.video = String(current.video || "").trim();
      current.videoPoster = String(current.videoPoster || current.poster || "").trim();
      current.imageOpacity = clampUnit(current.imageOpacity, current.image ? 1 : 0);
      current.designOpacity = clampUnit(current.designOpacity, 1);
      current.position = String(current.position || defaults.position).trim() || defaults.position;
      current.blendMode = String(current.blendMode || defaults.blendMode).trim() || defaults.blendMode;
      if (!current.image && !current.video) {
        current.imageOpacity = 0;
        current.designOpacity = 1;
      }
      normalized[section.id] = current;
    });
    return normalized;
  }

  function normalizeAction(input, fallback) {
    var source = input || {};
    var defaults = fallback || {};
    return {
      labelCN: String(source.labelCN || defaults.labelCN || ""),
      labelEN: String(source.labelEN || defaults.labelEN || ""),
      href: String(source.href || defaults.href || "#")
    };
  }

  function normalizeHeroContent(input) {
    var defaults = createDefaultHeroContent();
    var source = input || {};
    var defaultIndexLinks = defaults.indexLinks;
    var indexLinks = Array.isArray(source.indexLinks) ? source.indexLinks : defaultIndexLinks;
    return {
      sealSuffix: String(source.sealSuffix || defaults.sealSuffix),
      primaryAction: normalizeAction(source.primaryAction, defaults.primaryAction),
      secondaryAction: normalizeAction(source.secondaryAction, defaults.secondaryAction),
      indexLinks: indexLinks.map(function (item, index) {
        var fallback = defaultIndexLinks[index] || {};
        return {
          no: String(item.no || fallback.no || padNumber(index)),
          label: String(item.label || fallback.label || ""),
          href: String(item.href || fallback.href || "#")
        };
      }),
      bottomStrip: parseList(source.bottomStrip && source.bottomStrip.length ? source.bottomStrip : defaults.bottomStrip)
    };
  }

  function normalizeSectionContent(input) {
    var defaults = createDefaultSectionContent();
    var source = input || {};
    var normalized = {};
    Object.keys(defaults).forEach(function (id) {
      var current = Object.assign({}, defaults[id], source[id] || {});
      normalized[id] = {
        eyebrow: String(current.eyebrow || ""),
        title: String(current.title || ""),
        description: String(current.description || "")
      };
    });
    Object.keys(source).forEach(function (id) {
      if (normalized[id]) {
        return;
      }
      var current = source[id] || {};
      normalized[id] = {
        eyebrow: String(current.eyebrow || ""),
        title: String(current.title || ""),
        description: String(current.description || "")
      };
    });
    return normalized;
  }

  function normalizeContactContent(input) {
    var defaults = createDefaultContactContent();
    var source = input || {};
    var links = Array.isArray(source.socialLinks) ? source.socialLinks : defaults.socialLinks;
    return {
      emailLabel: String(source.emailLabel || defaults.emailLabel),
      portfolioLabel: String(source.portfolioLabel || defaults.portfolioLabel),
      portfolioCaption: String(source.portfolioCaption || defaults.portfolioCaption),
      socialLinks: links.map(function (link) {
        return {
          label: String(link.label || link.text || ""),
          text: String(link.text || link.label || ""),
          href: String(link.href || "#")
        };
      })
    };
  }

  function normalizeFooterContent(input) {
    var defaults = createDefaultFooterContent();
    var source = input || {};
    return {
      copyright: String(source.copyright || defaults.copyright),
      note: String(source.note || defaults.note)
    };
  }

  function normalizeVisualAssets(input) {
    var defaults = createDefaultVisualAssets();
    var source = input || {};
    var heroDepth = Object.assign({}, defaults.heroDepth, source.heroDepth || {});
    var watang = Object.assign({}, defaults.watang, source.watang || {});
    return {
      heroDepth: {
        mountain: String(heroDepth.mountain || ""),
        windowFrame: String(heroDepth.windowFrame || ""),
        lady: String(heroDepth.lady || ""),
        vignette: String(heroDepth.vignette || ""),
        reference: String(heroDepth.reference || "")
      },
      watang: {
        webp: String(watang.webp || ""),
        pngFallback: String(watang.pngFallback || "")
      }
    };
  }

  function normalizeSiteSettings(settings) {
    var incoming = settings || {};
    var merged = Object.assign({}, defaultSiteSettings || siteSettings, incoming);
    merged.hero = normalizeHeroContent(incoming.hero || merged.hero);
    merged.sections = normalizeSectionContent(incoming.sections || merged.sections);
    merged.contact = normalizeContactContent(incoming.contact || merged.contact);
    merged.footer = normalizeFooterContent(incoming.footer || merged.footer);
    merged.visualAssets = normalizeVisualAssets(incoming.visualAssets || merged.visualAssets);
    merged.sectionBackgrounds = normalizeSectionBackgrounds(incoming.sectionBackgrounds || merged.sectionBackgrounds);
    return merged;
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function padNumber(index) {
    return String(index + 1).padStart(3, "0");
  }

  function parseTags(value) {
    if (Array.isArray(value)) {
      return value;
    }
    return String(value || "").split(/[,，]/).map(function (item) {
      return item.trim();
    }).filter(Boolean);
  }

  function parseList(value) {
    if (Array.isArray(value)) {
      return value.map(function (item) { return String(item).trim(); }).filter(Boolean);
    }
    return String(value || "").split(/[,，\n]/).map(function (item) {
      return item.trim();
    }).filter(Boolean);
  }

  function formatPathList(value) {
    return parseList(value).join("\n");
  }

  function pathExtension(value) {
    var clean = String(value || "").split(/[?#]/)[0].trim().toLowerCase();
    var match = clean.match(/\.([a-z0-9]+)$/);
    return match ? match[1] : "";
  }

  function isExternalPath(value) {
    return /^(https?:)?\/\//i.test(String(value || ""));
  }

  function isRelativeAssetPath(value) {
    var path = String(value || "").trim();
    return !path || isAssetReference(path) || isMockReference(path) || isExternalPath(path) || path.indexOf("assets/") === 0 || path.indexOf("./assets/") === 0 || path.indexOf("abstract:") === 0;
  }

  function validatePathForField(path, field) {
    var value = String(path || "").trim();
    var config = ASSET_FIELD_CONFIG[field] || {};
    if (!value) {
      return { ok: true, message: "" };
    }
    if (config.allowAbstract && value.indexOf("abstract:") === 0) {
      return { ok: true, message: "抽象视觉键会继续使用内置视觉。" };
    }
    if (isLocalFilePath(value)) {
      return { ok: false, message: "不能使用本地电脑路径。" };
    }
    if (!isRelativeAssetPath(value)) {
      return { ok: false, message: "建议使用 assets/ 开头的相对路径，不要使用本机路径。" };
    }
    if (!isAssetReference(value) && !isMockReference(value) && !isExternalPath(value)) {
      var ext = pathExtension(value);
      if (config.extensions && config.extensions.length && ext && config.extensions.indexOf(ext) === -1) {
        return { ok: false, message: "扩展名不匹配，建议使用：" + config.extensions.join(", ") };
      }
      if (config.extensions && config.extensions.length && !ext && value.indexOf("abstract:") !== 0) {
        return { ok: false, message: "路径缺少文件扩展名。" };
      }
    }
    return { ok: true, message: "" };
  }

  function pathStatusMessage(path, field) {
    var validation = validatePathForField(path, field);
    if (!validation.ok) {
      return validation.message;
    }
    if (!path) {
      return "未填写路径。";
    }
    if (isExternalPath(path)) {
      return "外部 URL 可预览，但 GitHub Pages 正式维护建议使用 assets/ 相对路径。";
    }
    if (isAssetReference(path)) {
      return "本地 IndexedDB 临时预览资源。正式发布请改为 assets/ 路径。";
    }
    if (isMockReference(path)) {
      return "本地 mock 标记。正式发布请改为 assets/ 路径。";
    }
    return "若预览不显示，请确认文件已上传到 GitHub 仓库且路径大小写一致。";
  }

  function isLocalFilePath(value) {
    var path = String(value || "").trim();
    return /^[A-Za-z]:\\/.test(path) || /^file:\/\//i.test(path) || /^\/Users\//.test(path) || /^\/home\//.test(path);
  }

  function isSuspiciousAssetPath(value) {
    var path = String(value || "").trim();
    if (!path || isExternalPath(path) || isAssetReference(path) || isMockReference(path) || path.indexOf("abstract:") === 0) {
      return false;
    }
    return path.indexOf("assets/") !== 0 && path.indexOf("./assets/") !== 0;
  }

  function normalizeArticleBlocks(blocks) {
    if (!Array.isArray(blocks)) {
      return [];
    }
    return blocks.map(function (block) {
      var current = Object.assign({
        type: "paragraph",
        text: "",
        asset: "",
        assets: [],
        poster: "",
        thumbnail: "",
        caption: "",
        label: ""
      }, block || {});
      current.type = String(current.type || "paragraph");
      current.text = String(current.text || "");
      current.asset = normalizeAssetReference(current.asset || "");
      current.assets = Array.isArray(current.assets) ? current.assets.map(normalizeAssetReference).filter(Boolean) : parseList(current.assets).map(normalizeAssetReference).filter(Boolean);
      current.poster = normalizeAssetReference(current.poster || "");
      current.thumbnail = normalizeAssetReference(current.thumbnail || "");
      current.caption = String(current.caption || "");
      current.label = String(current.label || "");
      return current;
    });
  }

  function normalizeAssetReference(value) {
    if (!value) {
      return "";
    }
    if (typeof value === "string") {
      return value.trim();
    }
    if (value.id) {
      return String(value.id);
    }
    return String(value || "").trim();
  }

  function normalizeAttachments(value) {
    var list = Array.isArray(value) ? value : parseAttachmentLines(value);
    return list.map(function (item) {
      var current = typeof item === "string" ? parseAttachmentLine(item) : Object.assign({}, item || {});
      return {
        filePath: normalizeAssetReference(current.filePath || current.path || current.url || current.asset || ""),
        fileName: String(current.fileName || current.name || "").trim(),
        fileType: String(current.fileType || current.type || "").trim(),
        description: String(current.description || current.desc || "").trim()
      };
    }).filter(function (item) {
      return item.filePath || item.fileName || item.fileType || item.description;
    });
  }

  function parseAttachmentLines(value) {
    return String(value || "").split(/\n/).map(parseAttachmentLine).filter(function (item) {
      return item.filePath || item.fileName || item.fileType || item.description;
    });
  }

  function parseAttachmentLine(line) {
    var parts = String(line || "").split("|").map(function (part) { return part.trim(); });
    return {
      filePath: parts[0] || "",
      fileName: parts[1] || "",
      fileType: parts[2] || "",
      description: parts.slice(3).join(" | ")
    };
  }

  function formatAttachments(value) {
    return normalizeAttachments(value).map(function (item) {
      return [item.filePath, item.fileName, item.fileType, item.description].join(" | ").replace(/\s+\|\s+$/, "");
    }).join("\n");
  }

  function normalizeProject(project) {
    var base = {
      id: "p" + Date.now(),
      titleCN: "未命名案卷",
      titleEN: "Untitled Archive",
      category: "Architecture",
      year: new Date().getFullYear().toString(),
      location: "",
      status: "Draft",
      material: "",
      scale: "",
      role: "",
      concept: "",
      description: "",
      coverImage: "",
      detailImage: "",
      articleCoverImage: "",
      gallery: [],
      drawings: [],
      model3d: "",
      modelThumbnail: "",
      panorama: "",
      panoramaThumbnail: "",
      video: "",
      videoPoster: "",
      pdf: "",
      attachments: [],
      tags: [],
      articleBlocks: [],
      featured: false,
      published: false
    };
    var next = Object.assign({}, base, project || {});
    next.tags = parseTags(next.tags);
    next.gallery = parseList(next.gallery);
    next.drawings = parseList(next.drawings);
    next.attachments = normalizeAttachments(next.attachments);
    next.articleBlocks = normalizeArticleBlocks(next.articleBlocks);
    next.featured = Boolean(next.featured);
    next.published = Boolean(next.published);
    return next;
  }

  function delay(data) {
    return Promise.resolve(clone(data));
  }

  function readStorage(key, fallback) {
    try {
      if (typeof localStorage === "undefined") {
        return clone(fallback);
      }
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch (error) {
      return clone(fallback);
    }
  }

  function localDraftExists() {
    try {
      if (typeof localStorage === "undefined") {
        return false;
      }
      return Boolean(localStorage.getItem(STORAGE_KEYS.settings) || localStorage.getItem(STORAGE_KEYS.projects) || localStorage.getItem(STORAGE_KEYS.navigation) || localStorage.getItem(STORAGE_KEYS.methods));
    } catch (error) {
      return false;
    }
  }

  function updateLocalDraftState() {
    state.hasLocalDraft = localDraftExists();
  }

  function writeStorage() {
    try {
      if (typeof localStorage === "undefined") {
        return;
      }
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(siteSettings));
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEYS.navigation, JSON.stringify(navigation));
      localStorage.setItem(STORAGE_KEYS.methods, JSON.stringify(methods));
      localStorage.setItem(STORAGE_KEYS.draftSavedAt, new Date().toISOString());
      state.dataSource = "local";
      updateLocalDraftState();
    } catch (error) {
      console.warn("Mock data could not be persisted.", error);
    }
  }

  function normalizeNavigation(items) {
    var list = Array.isArray(items) ? items : navigation;
    return list.map(function (item) {
      return {
        labelCN: String(item.labelCN || ""),
        labelEN: String(item.labelEN || ""),
        href: String(item.href || "#")
      };
    });
  }

  function normalizeMethods(items) {
    if (!Array.isArray(items)) {
      return methods;
    }
    return items.map(function (item) {
      return {
        no: String(item.no || ""),
        title: String(item.title || ""),
        text: String(item.text || "")
      };
    });
  }

  function normalizeSiteData(data) {
    var incoming = data || {};
    return {
      siteSettings: normalizeSiteSettings(incoming.siteSettings || incoming.settings || {}),
      navigation: normalizeNavigation(incoming.navigation),
      methods: normalizeMethods(incoming.methods),
      projects: Array.isArray(incoming.projects) ? incoming.projects.map(normalizeProject) : []
    };
  }

  function applySiteData(data, source) {
    var normalized = normalizeSiteData(data);
    siteSettings = normalized.siteSettings;
    navigation = normalized.navigation;
    methods = normalized.methods;
    projects = normalized.projects;
    state.dataSource = source || "official";
    updateLocalDraftState();
    if (state.dataSource === "official") {
      defaultSiteSettings = clone(siteSettings);
      defaultProjects = clone(projects);
    }
  }

  async function loadOfficialSiteData() {
    try {
      var response = await fetch(SITE_DATA_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      applySiteData(await response.json(), "official");
      state.dataLoadError = "";
      return true;
    } catch (error) {
      state.dataLoadError = "正式数据文件读取失败：" + (error && error.message ? error.message : "未知错误");
      console.warn(state.dataLoadError);
      applySiteData(FALLBACK_SITE_DATA, "fallback");
      return false;
    }
  }

  function loadLocalDraftData() {
    if (!localDraftExists()) {
      updateLocalDraftState();
      return false;
    }
    applySiteData({
      siteSettings: readStorage(STORAGE_KEYS.settings, defaultSiteSettings),
      navigation: readStorage(STORAGE_KEYS.navigation, navigation),
      methods: readStorage(STORAGE_KEYS.methods, methods),
      projects: readStorage(STORAGE_KEYS.projects, defaultProjects)
    }, "local");
    return true;
  }

  async function useOfficialSiteData() {
    clearLocalDraftStorage();
    await loadOfficialSiteData();
    return { ok: true };
  }

  function useLocalDraftData() {
    var ok = loadLocalDraftData();
    return delay({ ok: ok });
  }

  function clearLocalDraftStorage() {
    try {
      if (typeof localStorage === "undefined") {
        return;
      }
      localStorage.removeItem(STORAGE_KEYS.settings);
      localStorage.removeItem(STORAGE_KEYS.projects);
      localStorage.removeItem(STORAGE_KEYS.navigation);
      localStorage.removeItem(STORAGE_KEYS.methods);
      localStorage.removeItem(STORAGE_KEYS.draftSavedAt);
    } catch (error) {
      console.warn("Local draft could not be cleared.", error);
    }
    updateLocalDraftState();
  }

  async function resetMockData() {
    return useOfficialSiteData();
  }

  // 前端级入口保护：这里的哈希校验只能防止普通游客误入维护台，
  // 不能替代真正的服务端认证或访问控制。
  function hasAdminSession() {
    try {
      return typeof sessionStorage !== "undefined" && sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok";
    } catch (error) {
      return false;
    }
  }

  function setAdminSession() {
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
      }
    } catch (error) {
      console.warn("Admin session could not be stored.", error);
    }
  }

  async function sha256Hex(value) {
    if (!window.crypto || !window.crypto.subtle || typeof TextEncoder === "undefined") {
      throw new Error("当前浏览器不支持前端密码校验。");
    }
    var bytes = new TextEncoder().encode(String(value || ""));
    var digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.prototype.map.call(new Uint8Array(digest), function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  async function requestAdminAccess() {
    if (hasAdminSession()) {
      return true;
    }
    if (state.adminAuthPending) {
      return false;
    }
    state.adminAuthPending = true;
    try {
      var password = await promptAdminPassword();
      if (!password) {
        showAdminAccessDenied("");
        return false;
      }
      var hash = await sha256Hex(password);
      if (hash === ADMIN_PASSWORD_HASH) {
        setAdminSession();
        return true;
      }
      showAdminAccessDenied("无权限访问。");
      return false;
    } catch (error) {
      showAdminAccessDenied(error && error.message ? error.message : "无法验证权限。");
      return false;
    } finally {
      state.adminAuthPending = false;
    }
  }

  function promptAdminPassword() {
    return new Promise(function (resolve) {
      var oldPrompt = qs("#adminAuthPrompt");
      if (oldPrompt) {
        oldPrompt.remove();
      }
      var prompt = document.createElement("div");
      prompt.className = "admin-auth-prompt";
      prompt.id = "adminAuthPrompt";
      prompt.innerHTML =
        '<div class="admin-auth-card" role="dialog" aria-modal="true" aria-labelledby="adminAuthTitle">' +
          '<form id="adminAuthForm">' +
            '<h2 id="adminAuthTitle">维护验证</h2>' +
            '<p>请输入维护密码。</p>' +
            '<label><span>密码</span><input id="adminAuthPassword" type="password" autocomplete="current-password" required></label>' +
            '<div class="form-actions">' +
              '<button class="button button-primary" type="submit"><span>进入</span><em>Verify</em></button>' +
              '<button class="button button-outline" type="button" id="adminAuthCancel"><span>取消</span><em>Cancel</em></button>' +
            '</div>' +
          '</form>' +
        '</div>';
      document.body.appendChild(prompt);
      document.body.classList.add("admin-auth-open");
      var passwordInput = qs("#adminAuthPassword", prompt);
      var form = qs("#adminAuthForm", prompt);
      var cancel = qs("#adminAuthCancel", prompt);

      function finish(value) {
        document.removeEventListener("keydown", handleEscape);
        document.body.classList.remove("admin-auth-open");
        prompt.remove();
        resolve(value || "");
      }

      function handleEscape(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          finish("");
        }
      }

      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          finish(passwordInput ? passwordInput.value : "");
        });
      }
      if (cancel) {
        cancel.addEventListener("click", function () { finish(""); });
      }
      prompt.addEventListener("click", function (event) {
        if (event.target === prompt) {
          finish("");
        }
      });
      document.addEventListener("keydown", handleEscape);
      window.setTimeout(function () {
        if (passwordInput) {
          passwordInput.focus();
        }
      }, 0);
    });
  }

  function showAdminAccessDenied(message) {
    closeAdminConsole(true);
    if (window.location.hash === ADMIN_HASH_ROUTE || window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (message && window.alert) {
      window.alert(message);
    }
  }

  function exportJSON(filename, data, options) {
    var exportOptions = options || {};
    if (!exportOptions.skipNotice && typeof window !== "undefined" && window.confirm) {
      var ok = window.confirm("导出只包含路径和数据，不包含图片、视频、GLB 或 PDF 文件。正式发布前请确认素材文件已手动上传到 GitHub 仓库 assets 目录。继续导出？");
      if (!ok) {
        return;
      }
    }
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function currentSiteData() {
    return {
      siteSettings: siteSettings,
      navigation: navigation,
      methods: methods,
      projects: projects
    };
  }

  function exportFullSiteData() {
    var data = normalizeSiteData(currentSiteData());
    var pathIssues = collectOfficialPathIssues(data);
    if (pathIssues.length && typeof window !== "undefined" && window.confirm) {
      var preview = pathIssues.slice(0, 8).map(function (issue) {
        return "- " + issue;
      }).join("\n");
      var ok = window.confirm("导出的 site-data.json 中发现非正式项目相对路径。提交到 GitHub 前建议改成 assets/... 路径。\n\n" + preview + (pathIssues.length > 8 ? "\n- 还有 " + (pathIssues.length - 8) + " 项" : "") + "\n\n仍然继续导出？");
      if (!ok) {
        return;
      }
    }
    exportJSON("site-data.json", data);
  }

  function collectOfficialPathIssues(data) {
    var issues = [];
    var settings = data.siteSettings || {};
    checkOfficialPath(settings.portfolioPdf, "siteSettings.portfolioPdf", issues, false);
    var visualAssets = normalizeVisualAssets(settings.visualAssets);
    checkOfficialPath(visualAssets.heroDepth.mountain, "siteSettings.visualAssets.heroDepth.mountain", issues, false);
    checkOfficialPath(visualAssets.heroDepth.windowFrame, "siteSettings.visualAssets.heroDepth.windowFrame", issues, false);
    checkOfficialPath(visualAssets.heroDepth.lady, "siteSettings.visualAssets.heroDepth.lady", issues, false);
    checkOfficialPath(visualAssets.heroDepth.vignette, "siteSettings.visualAssets.heroDepth.vignette", issues, false);
    checkOfficialPath(visualAssets.heroDepth.reference, "siteSettings.visualAssets.heroDepth.reference", issues, false);
    checkOfficialPath(visualAssets.watang.webp, "siteSettings.visualAssets.watang.webp", issues, false);
    checkOfficialPath(visualAssets.watang.pngFallback, "siteSettings.visualAssets.watang.pngFallback", issues, false);
    var backgrounds = normalizeSectionBackgrounds(settings.sectionBackgrounds);
    Object.keys(backgrounds).forEach(function (id) {
      checkOfficialPath(backgrounds[id].image, "siteSettings.sectionBackgrounds." + id + ".image", issues, false);
      checkOfficialPath(backgrounds[id].video, "siteSettings.sectionBackgrounds." + id + ".video", issues, false);
      checkOfficialPath(backgrounds[id].videoPoster, "siteSettings.sectionBackgrounds." + id + ".videoPoster", issues, false);
    });
    (data.projects || []).forEach(function (project, projectIndex) {
      var prefix = "projects[" + projectIndex + "]." + (project.id || "project");
      checkOfficialPath(project.coverImage, prefix + ".coverImage", issues, true);
      checkOfficialPath(project.detailImage, prefix + ".detailImage", issues, false);
      checkOfficialPath(project.articleCoverImage, prefix + ".articleCoverImage", issues, false);
      ["gallery", "drawings"].forEach(function (field) {
        parseList(project[field]).forEach(function (path, pathIndex) {
          checkOfficialPath(path, prefix + "." + field + "[" + pathIndex + "]", issues, false);
        });
      });
      ["model3d", "modelThumbnail", "panorama", "panoramaThumbnail", "video", "videoPoster", "pdf"].forEach(function (field) {
        checkOfficialPath(project[field], prefix + "." + field, issues, false);
      });
      normalizeAttachments(project.attachments).forEach(function (attachment, attachmentIndex) {
        checkOfficialPath(attachment.filePath, prefix + ".attachments[" + attachmentIndex + "].filePath", issues, false);
      });
      normalizeArticleBlocks(project.articleBlocks).forEach(function (block, blockIndex) {
        checkOfficialPath(block.asset, prefix + ".articleBlocks[" + blockIndex + "].asset", issues, false);
        checkOfficialPath(block.poster, prefix + ".articleBlocks[" + blockIndex + "].poster", issues, false);
        checkOfficialPath(block.thumbnail, prefix + ".articleBlocks[" + blockIndex + "].thumbnail", issues, false);
        parseList(block.assets).forEach(function (path, pathIndex) {
          checkOfficialPath(path, prefix + ".articleBlocks[" + blockIndex + "].assets[" + pathIndex + "]", issues, false);
        });
      });
    });
    return issues;
  }

  function checkOfficialPath(value, label, issues, allowAbstract) {
    var path = String(value || "").trim();
    if (!path) {
      return;
    }
    if (allowAbstract && path.indexOf("abstract:") === 0) {
      return;
    }
    if (isAssetReference(path) || isMockReference(path)) {
      issues.push(label + " 使用了本机临时资源：" + path);
      return;
    }
    if (isLocalFilePath(path)) {
      issues.push(label + " 使用了本机绝对路径：" + path);
      return;
    }
    if (/^(https?:)?\/\//i.test(path) || path.charAt(0) === "/") {
      issues.push(label + " 不是项目内相对路径：" + path);
      return;
    }
    if (path.indexOf("assets/") !== 0 && path.indexOf("./assets/") !== 0) {
      issues.push(label + " 建议改为 assets/... 路径：" + path);
    }
  }

  function collectPathReport(data) {
    var report = {
      empty: [],
      local: [],
      suspicious: [],
      referenced: []
    };
    function add(label, value, options) {
      var opts = options || {};
      var path = String(value || "").trim();
      if (!path) {
        if (!opts.optional) {
          report.empty.push(label);
        }
        return;
      }
      if (opts.allowAbstract && path.indexOf("abstract:") === 0) {
        report.referenced.push({ label: label, path: path });
        return;
      }
      report.referenced.push({ label: label, path: path });
      if (isLocalFilePath(path) || isAssetReference(path) || isMockReference(path)) {
        report.local.push({ label: label, path: path });
        return;
      }
      if (isSuspiciousAssetPath(path) || isExternalPath(path) || path.charAt(0) === "/") {
        report.suspicious.push({ label: label, path: path });
      }
    }

    var normalized = normalizeSiteData(data);
    var settings = normalized.siteSettings;
    var visualAssets = normalizeVisualAssets(settings.visualAssets);
    add("作品集 PDF", settings.portfolioPdf);
    add("首页分层素材：山体", visualAssets.heroDepth.mountain);
    add("首页分层素材：窗框", visualAssets.heroDepth.windowFrame);
    add("首页分层素材：人物", visualAssets.heroDepth.lady);
    add("首页分层素材：暗角", visualAssets.heroDepth.vignette);
    add("首页分层素材：参考图", visualAssets.heroDepth.reference);
    add("瓦当 WebP", visualAssets.watang.webp);
    add("瓦当 PNG 备用", visualAssets.watang.pngFallback);

    var backgrounds = normalizeSectionBackgrounds(settings.sectionBackgrounds);
    PUBLIC_SECTIONS.forEach(function (section) {
      var bg = backgrounds[section.id];
      add("板块背景图：" + section.labelCN, bg.image, { optional: true });
      add("板块视频：" + section.labelCN, bg.video, { optional: true });
      add("板块视频 poster：" + section.labelCN, bg.videoPoster, { optional: true });
    });

    normalized.projects.forEach(function (project) {
      var prefix = project.titleCN || project.id;
      add(prefix + " / 案例封面图", project.coverImage, { allowAbstract: true });
      add(prefix + " / 案例详情主图", project.detailImage, { optional: true });
      add(prefix + " / 文章封面图", project.articleCoverImage, { optional: true });
      parseList(project.gallery).forEach(function (path, index) {
        add(prefix + " / 图集 " + String(index + 1), path);
      });
      parseList(project.drawings).forEach(function (path, index) {
        add(prefix + " / 图纸 " + String(index + 1), path);
      });
      add(prefix + " / 案例视频", project.video, { optional: true });
      add(prefix + " / 视频 poster", project.videoPoster, { optional: true });
      add(prefix + " / 模型文件", project.model3d, { optional: true });
      add(prefix + " / 模型缩略图", project.modelThumbnail, { optional: true });
      add(prefix + " / 全景图", project.panorama, { optional: true });
      add(prefix + " / 全景缩略图", project.panoramaThumbnail, { optional: true });
      add(prefix + " / PDF", project.pdf, { optional: true });
      normalizeAttachments(project.attachments).forEach(function (attachment, index) {
        add(prefix + " / 附件 " + String(index + 1) + " / " + (attachment.fileName || attachment.fileType || "file"), attachment.filePath);
      });
      normalizeArticleBlocks(project.articleBlocks).forEach(function (block, blockIndex) {
        add(prefix + " / 文章块 " + String(blockIndex + 1) + " / 主素材", block.asset, { optional: block.type === "heading" || block.type === "paragraph" || block.type === "quote" || block.type === "divider" });
        add(prefix + " / 文章块 " + String(blockIndex + 1) + " / poster", block.poster, { optional: true });
        add(prefix + " / 文章块 " + String(blockIndex + 1) + " / thumbnail", block.thumbnail, { optional: true });
        parseList(block.assets).forEach(function (path, pathIndex) {
          add(prefix + " / 文章块 " + String(blockIndex + 1) + " / 图集 " + String(pathIndex + 1), path);
        });
      });
    });
    return report;
  }

  function renderPathReport() {
    var container = qs("#pathReport");
    if (!container) {
      return;
    }
    var report = collectPathReport(currentSiteData());
    container.innerHTML =
      '<div class="path-report-section"><h4>空路径提醒</h4>' + reportListHTML(report.empty.map(function (label) { return { label: label, path: "未填写" }; }), "当前没有必须填写的空路径。") + '</div>' +
      '<div class="path-report-section"><h4>本机路径提醒</h4>' + reportListHTML(report.local, "未发现本机路径或本机临时资源。") + '</div>' +
      '<div class="path-report-section"><h4>可疑路径提醒</h4>' + reportListHTML(report.suspicious, "未发现可疑路径。") + '</div>' +
      '<div class="path-report-section"><h4>发布清单：所有被引用的素材路径</h4>' + reportListHTML(report.referenced, "当前没有素材引用。") + '</div>';
  }

  function reportListHTML(items, emptyText) {
    if (!items.length) {
      return '<p class="asset-note">' + escapeHTML(emptyText) + '</p>';
    }
    return '<ul class="path-report-list">' + items.map(function (item) {
      return '<li><strong>' + escapeHTML(item.label) + '</strong><code>' + escapeHTML(item.path) + '</code></li>';
    }).join("") + '</ul>';
  }

  function publishListText() {
    var report = collectPathReport(currentSiteData());
    return report.referenced.map(function (item) {
      return item.label + ": " + item.path;
    }).join("\n");
  }

  async function copyPublishList() {
    var text = publishListText();
    if (!text) {
      showAdminStamp("暂无路径可复制");
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showAdminStamp("发布清单已复制");
        return;
      }
    } catch (error) {
      console.warn("Clipboard failed.", error);
    }
    window.prompt("复制发布清单", text);
  }

  function readJSONFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          resolve(JSON.parse(reader.result));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function initAssetDB() {
    return new Promise(function (resolve) {
      if (!("indexedDB" in window)) {
        state.assetDbReady = false;
        state.assetDbError = "当前浏览器不支持 IndexedDB，无法持久保存本地上传文件。";
        resolve(null);
        return;
      }
      var request = indexedDB.open(ASSET_DB_NAME, ASSET_DB_VERSION);
      request.onupgradeneeded = function (event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains(ASSET_STORE)) {
          var store = db.createObjectStore(ASSET_STORE, { keyPath: "id" });
          store.createIndex("projectId", "projectId", { unique: false });
          store.createIndex("sectionId", "sectionId", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      request.onsuccess = function (event) {
        state.assetDb = event.target.result;
        state.assetDbReady = true;
        state.assetDbError = "";
        resolve(state.assetDb);
      };
      request.onerror = function () {
        state.assetDbReady = false;
        state.assetDbError = "IndexedDB 初始化失败：" + (request.error && request.error.message ? request.error.message : "未知错误");
        resolve(null);
      };
    });
  }

  function assetStore(mode) {
    if (!state.assetDb) {
      return null;
    }
    return state.assetDb.transaction(ASSET_STORE, mode || "readonly").objectStore(ASSET_STORE);
  }

  function saveAssetToDB(file, meta) {
    return new Promise(function (resolve, reject) {
      var store = assetStore("readwrite");
      if (!store) {
        reject(new Error(state.assetDbError || "IndexedDB 不可用"));
        return;
      }
      var id = ASSET_ID_PREFIX + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      var record = Object.assign({
        id: id,
        name: file && file.name ? file.name : "untitled.asset",
        type: meta && meta.type ? meta.type : "asset",
        mime: file && file.type ? file.type : "",
        size: file && Number.isFinite(file.size) ? file.size : 0,
        projectId: meta && meta.projectId ? meta.projectId : "",
        sectionId: meta && meta.sectionId ? meta.sectionId : "",
        createdAt: new Date().toISOString(),
        source: "indexedDB",
        blob: file
      }, meta || {});
      record.id = id;
      record.objectUrl = "";
      var request = store.put(record);
      request.onsuccess = function () {
        resolve(assetRecordToMeta(record));
      };
      request.onerror = function () {
        reject(request.error || new Error("保存文件到 IndexedDB 失败"));
      };
    });
  }

  function getAssetFromDB(assetId) {
    return new Promise(function (resolve, reject) {
      var store = assetStore("readonly");
      if (!store || !assetId) {
        resolve(null);
        return;
      }
      var request = store.get(assetId);
      request.onsuccess = function () { resolve(request.result || null); };
      request.onerror = function () { reject(request.error || new Error("读取 IndexedDB 文件失败")); };
    });
  }

  function deleteAssetFromDB(assetId) {
    return new Promise(function (resolve, reject) {
      var store = assetStore("readwrite");
      if (!store || !assetId) {
        resolve(false);
        return;
      }
      var request = store.delete(assetId);
      request.onsuccess = function () {
        if (state.assetURLs[assetId]) {
          revokeAssetObjectURL(state.assetURLs[assetId]);
          delete state.assetURLs[assetId];
        }
        resolve(true);
      };
      request.onerror = function () { reject(request.error || new Error("删除 IndexedDB 文件失败")); };
    });
  }

  function listAssetsFromDB() {
    return new Promise(function (resolve) {
      var store = assetStore("readonly");
      if (!store) {
        resolve([]);
        return;
      }
      var request = store.getAll();
      request.onsuccess = function () {
        resolve((request.result || []).map(assetRecordToMeta).sort(function (a, b) {
          return String(b.createdAt).localeCompare(String(a.createdAt));
        }));
      };
      request.onerror = function () { resolve([]); };
    });
  }

  async function createAssetObjectURL(assetId) {
    if (!assetId) {
      return "";
    }
    if (state.assetURLs[assetId]) {
      return state.assetURLs[assetId];
    }
    var record = await getAssetFromDB(assetId);
    if (!record || !record.blob) {
      return "";
    }
    var url = URL.createObjectURL(record.blob);
    state.assetURLs[assetId] = url;
    return url;
  }

  function revokeAssetObjectURL(url) {
    if (url && String(url).startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  async function rebuildAssetObjectURLs() {
    Object.keys(state.assetURLs || {}).forEach(function (id) {
      revokeAssetObjectURL(state.assetURLs[id]);
    });
    state.assetURLs = {};
    for (var i = 0; i < state.assets.length; i += 1) {
      await createAssetObjectURL(state.assets[i].id);
    }
  }

  function assetRecordToMeta(record) {
    if (!record) {
      return null;
    }
    return {
      id: record.id,
      name: record.name,
      type: record.type,
      mime: record.mime,
      size: record.size,
      projectId: record.projectId || "",
      sectionId: record.sectionId || "",
      createdAt: record.createdAt,
      objectUrl: state.assetURLs[record.id] || "",
      source: record.source || "indexedDB"
    };
  }

  // GitHub Pages 正式版本读取 assets/data/site-data.json。
  // 维护台保存只写入本机 localStorage，用于当前浏览器临时预览。
  function fetchSiteSettings() {
    return delay(siteSettings);
  }

  function updateSiteSettings(data) {
    siteSettings = normalizeSiteSettings(Object.assign({}, siteSettings, data));
    writeStorage();
    return delay(siteSettings);
  }

  function fetchNavigation() {
    return delay(navigation);
  }

  function fetchProjects() {
    return delay(projects);
  }

  function fetchProjectById(id) {
    var project = projects.find(function (item) { return item.id === id; });
    return delay(project || null);
  }

  function createProject(data) {
    var next = normalizeProject(Object.assign({}, data, {
      id: data && data.id ? data.id : "p" + Date.now()
    }));
    projects.unshift(next);
    writeStorage();
    return delay(next);
  }

  function updateProject(id, data) {
    var index = projects.findIndex(function (item) { return item.id === id; });
    if (index === -1) {
      return delay(null);
    }
    projects[index] = normalizeProject(Object.assign({}, projects[index], data));
    writeStorage();
    return delay(projects[index]);
  }

  function deleteProject(id) {
    projects = projects.filter(function (item) { return item.id !== id; });
    writeStorage();
    return delay({ ok: true, id: id });
  }

  function togglePublishStatus(id) {
    var project = projects.find(function (item) { return item.id === id; });
    if (project) {
      project.published = !project.published;
      project.status = project.published ? "Published" : "Draft";
      writeStorage();
    }
    return delay(project || null);
  }

  async function uploadAsset(file, type, projectId, options) {
    var uploadOptions = options || {};
    var externalUrl = uploadOptions.url ? String(uploadOptions.url).trim() : "";
    var realFile = isRealUploadFile(file);
    var safeName = realFile && file.name ? file.name.replace(/\s+/g, "-").toLowerCase() : externalUrl ? externalUrl.split("/").pop() || "external-asset" : "mock-asset";
    var assetReference = externalUrl || "mock:" + type + "-" + Date.now() + "-" + safeName;
    var assetMeta = null;
    if (realFile) {
      assetMeta = await saveAssetToDB(file, {
        type: type,
        projectId: type === "sectionBackground" ? "" : projectId,
        sectionId: type === "sectionBackground" ? projectId : "",
        mime: file.type || inferMimeFromName(file.name),
        size: file.size || 0
      });
      await createAssetObjectURL(assetMeta.id);
      state.assets = await listAssetsFromDB();
      assetReference = assetMeta.id;
    }
    var result = {
      ok: true,
      type: type,
      projectId: projectId,
      targetId: projectId,
      name: safeName,
      url: assetReference,
      assetId: assetMeta ? assetMeta.id : "",
      asset: assetMeta,
      source: assetMeta ? "indexedDB" : externalUrl ? "url" : "mock"
    };
    if (type === "sectionBackground") {
      applyAssetToSectionBackground(projectId, result, uploadOptions);
      writeStorage();
      return result;
    }
    var project = projects.find(function (item) { return item.id === projectId; });
    if (project) {
      applyAssetToProject(project, result, uploadOptions);
      writeStorage();
    }
    return result;
  }

  function isRealUploadFile(file) {
    return Boolean(file && typeof file === "object" && typeof file.arrayBuffer === "function" && Number.isFinite(file.size));
  }

  function inferMimeFromName(name) {
    var value = String(name || "").toLowerCase();
    if (/\.gif$/.test(value)) { return "image/gif"; }
    if (/\.jpe?g$/.test(value)) { return "image/jpeg"; }
    if (/\.png$/.test(value)) { return "image/png"; }
    if (/\.webp$/.test(value)) { return "image/webp"; }
    if (/\.mp4$/.test(value)) { return "video/mp4"; }
    if (/\.webm$/.test(value)) { return "video/webm"; }
    if (/\.pdf$/.test(value)) { return "application/pdf"; }
    if (/\.glb$/.test(value)) { return "model/gltf-binary"; }
    if (/\.gltf$/.test(value)) { return "model/gltf+json"; }
    return "";
  }

  function applyAssetToSectionBackground(sectionId, asset, options) {
    var exists = PUBLIC_SECTIONS.some(function (section) { return section.id === sectionId; });
    if (!exists) {
      return;
    }
    siteSettings.sectionBackgrounds = normalizeSectionBackgrounds(siteSettings.sectionBackgrounds);
    var current = Object.assign({}, defaultSectionBackground(sectionId), siteSettings.sectionBackgrounds[sectionId], {
      image: asset.url,
      imageOpacity: clampUnit(options.imageOpacity, 1),
      designOpacity: clampUnit(options.designOpacity, 0.35),
      position: options.position || (siteSettings.sectionBackgrounds[sectionId] && siteSettings.sectionBackgrounds[sectionId].position) || defaultSectionBackground(sectionId).position,
      blendMode: options.blendMode || (siteSettings.sectionBackgrounds[sectionId] && siteSettings.sectionBackgrounds[sectionId].blendMode) || defaultSectionBackground(sectionId).blendMode
    });
    siteSettings.sectionBackgrounds[sectionId] = normalizeSectionBackgrounds(Object.assign({}, siteSettings.sectionBackgrounds, {
      [sectionId]: current
    }))[sectionId];
  }

  function applyAssetToProject(project, asset, options) {
    var type = asset.type;
    var url = asset.url;
    if (type === "cover") {
      project.coverImage = url;
      return;
    }
    if (type === "drawing") {
      project.drawings = options.replace ? [url] : parseList(project.drawings).concat(url);
      if (options.setCover) {
        project.coverImage = url;
      }
      return;
    }
    if (type === "gallery") {
      project.gallery = options.replace ? [url] : parseList(project.gallery).concat(url);
      if (options.setCover) {
        project.coverImage = url;
      }
      return;
    }
    if (type === "model3d" || type === "panorama" || type === "video" || type === "pdf") {
      project[type] = url;
      if (options.setCover && (type === "panorama" || type === "video")) {
        project.coverImage = url;
      }
      return;
    }
    if (type === "articleImage" || type === "articleGif") {
      project.articleBlocks = normalizeArticleBlocks(project.articleBlocks).concat({
        type: "image",
        asset: url,
        caption: asset.name || "项目图片"
      });
      if (options.setCover) {
        project.coverImage = url;
      }
      return;
    }
    if (type === "articleVideo") {
      project.articleBlocks = normalizeArticleBlocks(project.articleBlocks).concat({
        type: "video",
        asset: url,
        caption: asset.name || "项目视频"
      });
    }
  }

  async function removeAsset(projectId, type, url) {
    var project = projects.find(function (item) { return item.id === projectId; });
    if (!project) {
      return delay(null);
    }
    if (type === "gallery") {
      project.gallery = parseList(project.gallery).filter(function (item) { return item !== url; });
    } else if (type === "drawing") {
      project.drawings = parseList(project.drawings).filter(function (item) { return item !== url; });
    } else if (type === "cover") {
      project.coverImage = "";
    } else if (type === "model3d" || type === "panorama" || type === "video" || type === "pdf") {
      project[type] = "";
    } else if (type === "article") {
      project.articleBlocks = normalizeArticleBlocks(project.articleBlocks).filter(function (block) {
        return block.asset !== url && parseList(block.assets).indexOf(url) === -1;
      });
    }
    project.articleBlocks = normalizeArticleBlocks(project.articleBlocks).map(function (block) {
      if (block.asset === url) {
        block.asset = "";
      }
      block.assets = parseList(block.assets).filter(function (item) { return item !== url; });
      return block;
    }).filter(function (block) {
      return block.type !== "image" && block.type !== "video" && block.type !== "pdf" || block.asset || block.assets.length;
    });
    if (isAssetReference(url)) {
      await deleteAssetFromDB(url);
    }
    writeStorage();
    return delay(project);
  }

  window.StudioMockAPI = {
    fetchSiteSettings: fetchSiteSettings,
    updateSiteSettings: updateSiteSettings,
    fetchNavigation: fetchNavigation,
    fetchProjects: fetchProjects,
    fetchProjectById: fetchProjectById,
    createProject: createProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
    togglePublishStatus: togglePublishStatus,
    uploadAsset: uploadAsset,
    removeAsset: removeAsset,
    resetMockData: resetMockData,
    useOfficialSiteData: useOfficialSiteData,
    useLocalDraftData: useLocalDraftData,
    initAssetDB: initAssetDB,
    saveAssetToDB: saveAssetToDB,
    getAssetFromDB: getAssetFromDB,
    deleteAssetFromDB: deleteAssetFromDB,
    listAssetsFromDB: listAssetsFromDB,
    createAssetObjectURL: createAssetObjectURL,
    revokeAssetObjectURL: revokeAssetObjectURL,
    rebuildAssetObjectURLs: rebuildAssetObjectURLs
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    await initAssetDB();
    await loadOfficialSiteData();
    if (localDraftExists()) {
      loadLocalDraftData();
    }
    await refreshData();
    renderAll();
    bindGlobalEvents();
    initWadangCursorStable();
    initHeroStageStable();
    window.setTimeout(initEmberCanvas, 900);
    initSectionObserver();
  }

  async function refreshData() {
    state.settings = await fetchSiteSettings();
    state.navigation = await fetchNavigation();
    state.projects = await fetchProjects();
    state.assets = await listAssetsFromDB();
    await rebuildAssetObjectURLs();
  }

  function renderAll() {
    renderSettings();
    renderNavigation();
    renderFeatured();
    renderFilters();
    renderWorks();
    renderCategoryRail("Architecture", "architectureRail");
    renderCategoryRail("Objects", "objectsRail");
    renderResearch();
    renderMethods();
    applySectionBackgrounds();
    renderAdminList();
    renderAssetProjectOptions();
    fillAssetPathForm();
    renderSectionBgControls();
    renderArticleEditorControls();
    fillSettingsForm();
    renderDataSourceStatus();
    renderPathReport();
  }

  function renderSettings() {
    var settings = state.settings;
    document.title = settings.studioName + " | Independent Design Studio";
    setText("navStudioName", settings.studioName);
    setText("brandSeal", settings.studioSeal.slice(0, 1));
    setText("heroSeal", settings.studioSeal);
    setText("heroTitle", settings.taglineCN);
    setText("heroTitleEN", settings.taglineEN);
    setText("heroIntro", settings.intro);
    setText("studioPhilosophy", settings.philosophy);
    setText("contactEmail", settings.email);
    var emailLink = qs("#emailLink");
    var pdfLink = qs("#pdfLink");
    if (emailLink) {
      emailLink.href = "mailto:" + settings.email;
    }
    if (pdfLink) {
      pdfLink.href = settings.portfolioPdf || "#";
    }
    document.documentElement.style.setProperty("--cangqing", settings.accentColor || "#536A63");
    renderHeroContent(settings.hero);
    renderSectionContent(settings.sections, settings.philosophy);
    renderContactContent(settings.contact);
    applyVisualAssets(settings.visualAssets);
  }

  function renderHeroContent(hero) {
    var content = normalizeHeroContent(hero);
    var sealSuffix = qs("#home .seal-line span:last-child");
    if (sealSuffix) {
      sealSuffix.textContent = content.sealSuffix;
    }
    renderHeroAction("#home .hero-actions .button-primary", content.primaryAction);
    renderHeroAction("#home .hero-actions .button-ghost", content.secondaryAction);
    var index = qs("#home .hero-index");
    if (index) {
      index.innerHTML = content.indexLinks.map(function (link) {
        return '<a href="' + escapeHTML(link.href) + '"><span>' + escapeHTML(link.no) + '</span> ' + escapeHTML(link.label) + '</a>';
      }).join("");
    }
    var bottomStrip = qs("#home .hero-bottom-strip");
    if (bottomStrip) {
      bottomStrip.innerHTML = content.bottomStrip.map(function (item) {
        return '<span>' + escapeHTML(item) + '</span>';
      }).join("");
    }
  }

  function renderHeroAction(selector, action) {
    var link = qs(selector);
    if (!link || !action) {
      return;
    }
    link.href = action.href || "#";
    link.innerHTML = '<span>' + escapeHTML(action.labelCN) + '</span><em>' + escapeHTML(action.labelEN) + '</em>';
  }

  function renderSectionContent(sections, studioFallback) {
    var content = normalizeSectionContent(sections);
    Object.keys(content).forEach(function (id) {
      var section = qs("#" + id);
      var heading = section ? qs(".section-heading", section) : null;
      if (!heading) {
        return;
      }
      var copy = content[id];
      var eyebrow = qs(".eyebrow", heading);
      var title = qs("h2", heading);
      var description = qsa("p", heading).find(function (node) {
        return !node.classList.contains("eyebrow");
      });
      if (eyebrow && copy.eyebrow) {
        eyebrow.textContent = copy.eyebrow;
      }
      if (title && copy.title) {
        title.textContent = copy.title;
      }
      if (description) {
        description.textContent = copy.description || (id === "studio" ? studioFallback || "" : description.textContent);
      }
    });
  }

  function renderContactContent(contact) {
    var content = normalizeContactContent(contact);
    var emailLabel = qs("#emailLink span");
    var pdfLabel = qs("#pdfLink span");
    var pdfCaption = qs("#pdfLink em");
    var socialLinks = qs("#contact .social-links");
    if (emailLabel) {
      emailLabel.textContent = content.emailLabel;
    }
    if (pdfLabel) {
      pdfLabel.textContent = content.portfolioLabel;
    }
    if (pdfCaption) {
      pdfCaption.textContent = content.portfolioCaption;
    }
    if (socialLinks) {
      socialLinks.innerHTML = content.socialLinks.map(function (link) {
        return '<a href="' + escapeHTML(link.href) + '" aria-label="' + escapeHTML(link.label) + '">' + escapeHTML(link.text) + '</a>';
      }).join("");
    }
  }

  function applyVisualAssets(visualAssets) {
    var assets = normalizeVisualAssets(visualAssets);
    var root = document.documentElement;
    if (assets.heroDepth.mountain) {
      root.style.setProperty("--hero-mountain-image", cssUrl(assets.heroDepth.mountain));
    }
    if (assets.heroDepth.windowFrame) {
      root.style.setProperty("--hero-window-image", cssUrl(assets.heroDepth.windowFrame));
    }
    if (assets.heroDepth.lady) {
      root.style.setProperty("--hero-lady-image", cssUrl(assets.heroDepth.lady));
    }
  }

  function renderDataSourceStatus() {
    updateLocalDraftState();
    var status = qs("#dataSourceStatus");
    var useOfficialButton = qs("#useOfficialDataButton");
    var useLocalDraftButton = qs("#useLocalDraftButton");
    if (status) {
      var label = state.dataSource === "local" ? "当前使用：本机草稿数据。" : state.dataSource === "fallback" ? "当前使用：内置 fallback 数据。" : "当前使用：线上 JSON 数据；";
      if (state.hasLocalDraft && state.dataSource !== "local") {
        label += "已检测到本机草稿，可切换使用。";
      }
      if (state.dataLoadError && state.dataSource !== "local") {
        label += " " + state.dataLoadError;
      }
      status.textContent = label;
    }
    if (useOfficialButton) {
      useOfficialButton.disabled = state.dataSource === "official" && !state.hasLocalDraft;
    }
    if (useLocalDraftButton) {
      useLocalDraftButton.disabled = !state.hasLocalDraft || state.dataSource === "local";
    }
  }

  function applySectionBackgrounds() {
    if (!state.settings) {
      return;
    }
    var backgrounds = normalizeSectionBackgrounds(state.settings.sectionBackgrounds);
    PUBLIC_SECTIONS.forEach(function (sectionInfo) {
      var section = qs("#" + sectionInfo.id);
      if (!section) {
        return;
      }
      ensureSectionBackgroundLayers(section);
      var config = backgrounds[sectionInfo.id] || defaultSectionBackground(sectionInfo.id);
      applySectionBackgroundConfig(section, config);
    });
  }

  function applySectionBackgroundConfig(section, config) {
    if (!section) {
      return;
    }
    ensureSectionBackgroundLayers(section);
    var current = config || defaultSectionBackground(section.id || "home");
    var hasImage = Boolean(current.image);
    var hasVideo = Boolean(current.video);
    var bgUrl = resolveAssetURL(current.image) || current.image;
    var video = qs(".section-bg-video", section);
    section.classList.toggle("has-section-bg-upload", hasImage || hasVideo);
    section.style.setProperty("--section-upload-bg-image", hasImage && bgUrl ? cssUrl(bgUrl) : "none");
    section.style.setProperty("--section-upload-bg-opacity", hasImage ? String(current.imageOpacity) : "0");
    section.style.setProperty("--section-upload-bg-position", current.position || "center");
    section.style.setProperty("--section-upload-bg-blend-mode", current.blendMode || "screen");
    section.style.setProperty("--section-design-bg-opacity", hasImage || hasVideo ? String(current.designOpacity) : "1");
    if (video) {
      var videoUrl = resolveAssetURL(current.video) || current.video || "";
      var posterUrl = resolveAssetURL(current.videoPoster) || current.videoPoster || "";
      if (hasVideo && video.getAttribute("src") !== videoUrl) {
        video.setAttribute("src", videoUrl);
      }
      if (posterUrl) {
        video.setAttribute("poster", posterUrl);
      } else {
        video.removeAttribute("poster");
      }
      video.toggleAttribute("hidden", !hasVideo);
      if (!hasVideo) {
        video.removeAttribute("src");
      } else {
        video.load();
        var playPromise = video.play && video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
    }
  }

  function ensureSectionBackgroundLayers(section) {
    var uploadLayer = qs(".section-bg-upload", section);
    var designLayer = qs(".section-bg-design", section);
    if (!uploadLayer) {
      uploadLayer = document.createElement("div");
      uploadLayer.className = "section-bg-upload";
      uploadLayer.setAttribute("aria-hidden", "true");
      section.insertBefore(uploadLayer, section.firstChild);
    }
    if (!qs(".section-bg-video", section)) {
      var videoLayer = document.createElement("video");
      videoLayer.className = "section-bg-video";
      videoLayer.setAttribute("aria-hidden", "true");
      videoLayer.muted = true;
      videoLayer.loop = true;
      videoLayer.autoplay = true;
      videoLayer.playsInline = true;
      videoLayer.setAttribute("playsinline", "");
      videoLayer.setAttribute("preload", "metadata");
      videoLayer.hidden = true;
      section.insertBefore(videoLayer, uploadLayer.nextSibling);
    }
    if (!designLayer) {
      designLayer = document.createElement("div");
      designLayer.className = "section-bg-design";
      designLayer.setAttribute("aria-hidden", "true");
    }
    if (uploadLayer.parentNode !== section) {
      section.insertBefore(uploadLayer, section.firstChild);
    }
    if (designLayer.parentNode !== section) {
      section.insertBefore(designLayer, uploadLayer.nextSibling);
    } else if (designLayer.previousSibling !== uploadLayer) {
      section.insertBefore(designLayer, uploadLayer.nextSibling);
    }
  }

  function cssUrl(value) {
    var raw = String(value || "").trim();
    var resolved = raw;
    if (raw && !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(raw)) {
      try {
        resolved = new URL(raw, window.location.href).href;
      } catch (error) {
        resolved = raw;
      }
    }
    return 'url("' + resolved.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\n\r]/g, "") + '")';
  }

  function isAssetReference(value) {
    if (!value) {
      return false;
    }
    if (typeof value === "object" && value.id) {
      return true;
    }
    return typeof value === "string" && value.indexOf(ASSET_ID_PREFIX) === 0;
  }

  function resolveAssetId(value) {
    if (!value) {
      return "";
    }
    return typeof value === "object" && value.id ? String(value.id) : String(value);
  }

  function resolveAssetMeta(value) {
    var id = resolveAssetId(value);
    if (!id || !isAssetReference(id)) {
      return null;
    }
    return state.assets.find(function (asset) { return asset.id === id; }) || null;
  }

  function resolveAssetURL(value) {
    if (!value) {
      return "";
    }
    if (isMockReference(value)) {
      return "";
    }
    if (isAssetReference(value)) {
      var id = resolveAssetId(value);
      return state.assetURLs[id] || "";
    }
    return typeof value === "string" ? value : "";
  }

  function isMockReference(value) {
    return /^mock:/i.test(String(value || ""));
  }

  function assetKind(value) {
    var meta = resolveAssetMeta(value);
    var mime = meta && meta.mime ? meta.mime : "";
    var name = meta && meta.name ? meta.name : String(value || "");
    if (/image\/gif/i.test(mime) || /\.gif($|\?)/i.test(name)) { return "gif"; }
    if (/image\//i.test(mime) || /\.(jpe?g|png|webp|gif|avif)($|\?)/i.test(name)) { return "image"; }
    if (/video\//i.test(mime) || /\.(mp4|webm|mov)($|\?)/i.test(name)) { return "video"; }
    if (/pdf/i.test(mime) || /\.pdf($|\?)/i.test(name)) { return "pdf"; }
    if (/model|gltf/i.test(mime) || /\.(glb|gltf)($|\?)/i.test(name)) { return "model"; }
    return "file";
  }

  function renderAssetPreview(value, caption, options) {
    var previewOptions = options || {};
    var url = resolveAssetURL(value);
    var meta = resolveAssetMeta(value);
    var label = caption || (meta && meta.name) || String(value || "");
    var kind = assetKind(value);
    if (isMockReference(value)) {
      return '<div class="asset-preview asset-preview-empty"><strong>MOCK ASSET</strong><span>' + escapeHTML(label) + '</span></div>';
    }
    if (!url && value) {
      url = String(value);
    }
    if (!url) {
      return '<div class="asset-preview asset-preview-empty">暂无素材</div>';
    }
    if (kind === "video") {
      var poster = previewOptions.poster ? (resolveAssetURL(previewOptions.poster) || previewOptions.poster) : "";
      return '<figure class="article-media path-preview-card"><video src="' + escapeHTML(url) + '"' + (poster ? ' poster="' + escapeHTML(poster) + '"' : '') + ' controls muted playsinline preload="metadata" onerror="this.closest(\'.path-preview-card\').classList.add(\'is-invalid\')"></video>' + captionHTML(label) + invalidPathHTML() + '</figure>';
    }
    if (kind === "pdf" || previewOptions.type === "attachment") {
      return '<div class="article-file-card"><strong>FILE / 附件</strong><a href="' + escapeHTML(url) + '" target="_blank" rel="noreferrer" download>' + escapeHTML(label || "打开附件") + '</a>' + (caption ? '<p>' + escapeHTML(caption) + '</p>' : '') + '</div>';
    }
    if (kind === "model") {
      return '<div class="article-file-card"><strong>MODEL / 模型台</strong><code>' + escapeHTML(label || url) + '</code></div>';
    }
    return '<figure class="article-media path-preview-card"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="' + escapeHTML(label) + '" onerror="this.closest(\'.path-preview-card\').classList.add(\'is-invalid\')">' + captionHTML(label) + invalidPathHTML() + '</figure>';
  }

  function captionHTML(text) {
    return text ? '<figcaption>' + escapeHTML(text) + '</figcaption>' : "";
  }

  function invalidPathHTML() {
    return '<p class="path-invalid-message">路径可能无效，请确认文件已上传到 GitHub 仓库。</p>';
  }

  function pathPreviewHTML(path, field, caption) {
    var value = String(path || "").trim();
    var label = caption || value;
    var validation = validatePathForField(value, field);
    var kind = assetKind(value);
    var url = resolveAssetURL(value) || value;
    if (!value) {
      return '<div class="path-preview-card asset-preview-empty"><strong>EMPTY</strong><span>未填写路径。</span></div>';
    }
    if (field === "coverImage" && value.indexOf("abstract:") === 0) {
      return '<div class="path-preview-card asset-preview-empty"><strong>ABSTRACT</strong><span>' + escapeHTML(value) + ' 将使用内置抽象视觉。</span></div>';
    }
    if (!validation.ok) {
      return '<div class="path-preview-card is-invalid"><strong>PATH CHECK</strong><span>' + escapeHTML(value) + '</span><p class="path-invalid-message">' + escapeHTML(validation.message) + '</p></div>';
    }
    if (kind === "image" || kind === "gif") {
      return '<figure class="path-preview-card article-media"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="' + escapeHTML(label) + '" onerror="this.closest(\'.path-preview-card\').classList.add(\'is-invalid\')">' + captionHTML(label) + invalidPathHTML() + '</figure>';
    }
    if (kind === "video") {
      return '<figure class="path-preview-card article-media"><video src="' + escapeHTML(url) + '" controls muted playsinline preload="metadata" onerror="this.closest(\'.path-preview-card\').classList.add(\'is-invalid\')"></video>' + captionHTML(label) + invalidPathHTML() + '</figure>';
    }
    if (kind === "pdf") {
      return '<div class="path-preview-card article-file-card"><strong>PDF / 图纸</strong><a href="' + escapeHTML(url) + '" target="_blank" rel="noreferrer" download>' + escapeHTML(label || "打开 PDF") + '</a><p>' + escapeHTML(pathStatusMessage(value, field)) + '</p></div>';
    }
    if (kind === "model") {
      return '<div class="path-preview-card article-file-card"><strong>MODEL / 模型文件</strong><code>' + escapeHTML(value) + '</code><p>GLB / GLTF 路径会在模型台中使用。请确认文件已提交到 GitHub 仓库。</p></div>';
    }
    return '<div class="path-preview-card asset-preview-empty"><strong>PATH</strong><span>' + escapeHTML(value) + '</span><p>' + escapeHTML(pathStatusMessage(value, field)) + '</p></div>';
  }

  function setText(id, text) {
    var node = qs("#" + id);
    if (node) {
      node.textContent = text || "";
    }
  }

  function renderNavigation() {
    var mainNav = qs("#mainNav");
    var mobilePanel = qs("#mobileNavPanel");
    var mainItems = state.navigation.filter(function (item) { return item.href !== "#admin"; });
    if (mainNav) {
      mainNav.innerHTML = mainItems.map(navLinkHTML).join("");
    }
    if (mobilePanel) {
      mobilePanel.innerHTML = mainItems.map(navLinkHTML).join("");
    }
  }

  function navLinkHTML(item) {
    return '<a href="' + escapeHTML(item.href) + '" data-nav-link title="' + escapeHTML(item.labelEN) + '"><span>' + escapeHTML(item.labelEN) + ' / ' + escapeHTML(item.labelCN) + '</span></a>';
  }

  function renderFeatured() {
    var container = qs("#featuredGrid");
    if (!container) {
      return;
    }
    var featured = state.projects.filter(function (project) { return project.featured && project.published; }).slice(0, 3);
    container.innerHTML = featured.map(function (project, index) {
      return projectCardHTML(project, index, "featured");
    }).join("");
  }

  function renderFilters() {
    var container = qs("#filterBar");
    if (!container) {
      return;
    }
    var categories = ["All"].concat(Array.from(new Set(state.projects.filter(function (item) { return item.published; }).map(function (item) { return item.category; }))));
    container.innerHTML = categories.map(function (category) {
      var active = category === state.filter ? " is-active" : "";
      return '<button type="button" class="' + active + '" data-filter="' + escapeHTML(category) + '">' + escapeHTML(category) + '</button>';
    }).join("");
  }

  function renderWorks() {
    var container = qs("#worksGrid");
    if (!container) {
      return;
    }
    var visible = state.projects.filter(function (project) {
      return project.published && (state.filter === "All" || project.category === state.filter);
    });
    container.innerHTML = visible.map(function (project, index) {
      return projectCardHTML(project, index, "work");
    }).join("");
  }

  function renderCategoryRail(category, id) {
    var container = qs("#" + id);
    if (!container) {
      return;
    }
    var visible = state.projects.filter(function (project) {
      return project.published && project.category === category;
    }).slice(0, 4);
    container.innerHTML = visible.map(function (project, index) {
      return projectCardHTML(project, index, "category");
    }).join("");
  }

  function renderResearch() {
    var container = qs("#researchGrid");
    if (!container) {
      return;
    }
    var research = state.projects.filter(function (project) {
      return project.published && (project.category === "Research" || project.model3d || project.panorama);
    }).slice(0, 4);
    container.innerHTML = research.map(function (project, index) {
      var icon = ["轴", "模", "景", "材"][index % 4];
      return '<article class="research-card" data-project-id="' + escapeHTML(project.id) + '" tabindex="0" role="button">' +
        '<div class="research-icon">' + icon + '</div>' +
        '<div><p class="eyebrow">' + escapeHTML(project.category) + ' / ' + escapeHTML(project.year) + '</p><h3>' + escapeHTML(project.titleCN) + '</h3><p>' + escapeHTML(project.concept || project.description) + '</p></div>' +
        mediaTagsHTML(project) +
      '</article>';
    }).join("");
  }

  function renderMethods() {
    var container = qs("#methodStack");
    if (!container) {
      return;
    }
    container.innerHTML = methods.map(function (item) {
      return '<article class="method-card"><strong>' + item.no + '</strong><div><h3>' + escapeHTML(item.title) + '</h3><p>' + escapeHTML(item.text) + '</p></div></article>';
    }).join("");
  }

  function projectCardHTML(project, index, mode) {
    var textOnly = !project.coverImage;
    var classes = "project-card" + (textOnly ? " text-only-card" : "") + (mode === "featured" ? " featured-card" : "");
    var number = padNumber(index);
    var tags = project.tags.slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHTML(tag) + '</span>';
    }).join("");
    var visual = textOnly ? '<div class="axis-rule"></div>' : visualHTML(project, "card");
    var archiveNumber = textOnly ? '<div class="archive-number">' + number + '</div>' : "";
    var status = project.featured ? '<span class="status-pill">FEATURED</span>' : '<span>' + escapeHTML(project.status) + '</span>';
    return '<article class="' + classes + '" data-project-id="' + escapeHTML(project.id) + '" tabindex="0" role="button" aria-label="查看项目 ' + escapeHTML(project.titleCN) + '">' +
      visual +
      '<span class="ember-dot" aria-hidden="true"></span>' +
      '<div class="card-topline"><span class="card-number">BY-' + number + '</span>' + status + '</div>' +
      '<div class="card-content">' + archiveNumber +
        '<div><p class="eyebrow">' + escapeHTML(project.category) + ' / ' + escapeHTML(project.year) + '</p>' +
        '<h3 class="card-title"><span class="cn">' + escapeHTML(project.titleCN) + '</span><span class="en">' + escapeHTML(project.titleEN) + '</span></h3></div>' +
        '<p class="card-description">' + escapeHTML(project.concept || project.description) + '</p>' +
        '<div class="tags">' + tags + '</div>' + mediaTagsHTML(project) +
      '</div></article>';
  }

  function visualHTML(project, context) {
    var visualPath = context === "article" ? (project.articleCoverImage || project.detailImage || project.coverImage) : project.coverImage;
    if (visualPath && !String(visualPath).startsWith("abstract:") && !isMockReference(visualPath)) {
      var url = resolveAssetURL(visualPath);
      return '<div class="project-visual visual-image" aria-hidden="true"><img loading="lazy" decoding="async" src="' + escapeHTML(url || visualPath) + '" alt="" onerror="this.closest(\'.visual-image\').classList.add(\'is-invalid\')"><span class="path-invalid-message">路径可能无效，请确认文件已上传到 GitHub 仓库。</span></div>';
    }
    var visualClass = getVisualClass(visualPath || project.coverImage);
    return '<div class="project-visual ' + visualClass + '" aria-hidden="true"><span class="line-art"></span></div>';
  }

  function getVisualClass(coverImage) {
    var key = String(coverImage || "").replace("abstract:", "");
    var map = {
      ridge: "visual-ridge",
      plinth: "visual-plinth",
      vessel: "visual-vessel",
      grid: "visual-grid",
      paper: "visual-paper"
    };
    return map[key] || "visual-ridge";
  }

  function mediaTagsHTML(project) {
    var items = [];
    if (project.coverImage) { items.push("IMG"); }
    if (project.model3d) { items.push("3D"); }
    if (project.panorama) { items.push("360"); }
    if (project.pdf || project.drawings.length) { items.push("PDF"); }
    if (project.video) { items.push("VIDEO"); }
    return '<div class="media-tags">' + items.map(function (item) {
      return '<span class="media-tag media-' + item.toLowerCase() + '">' + item + '</span>';
    }).join("") + '</div>';
  }

  function bindGlobalEvents() {
    document.addEventListener("click", async function (event) {
      var filterButton = event.target.closest("[data-filter]");
      if (filterButton) {
        state.filter = filterButton.getAttribute("data-filter") || "All";
        renderFilters();
        renderWorks();
        return;
      }

      var card = event.target.closest("[data-project-id]");
      if (card && !event.target.closest(".admin-list-item")) {
        openProjectModal(card.getAttribute("data-project-id"));
        return;
      }

      var navLink = event.target.closest("[data-nav-link]");
      if (navLink) {
        closeMobileNav();
      }

      var anchor = event.target.closest('a[href^="#"]');
      if (anchor) {
        var href = anchor.getAttribute("href");
        if (href === ADMIN_HASH_ROUTE) {
          event.preventDefault();
          openAdminConsole();
          return;
        }
        var target = href && /^#[A-Za-z][A-Za-z0-9_-]*$/.test(href) ? qs(href) : null;
        if (target) {
          event.preventDefault();
          closeMobileNav();
          smoothScrollTo(target, 560, true);
        }
      }
    });

    document.addEventListener("keydown", function (event) {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-project-id]")) {
        event.preventDefault();
        openProjectModal(event.target.getAttribute("data-project-id"));
      }
      if (event.key === "Escape") {
        closeProjectArticle();
        closeProjectModal();
        closeAdminConsole();
        closeMobileNav();
      }
    });

    var modal = qs("#projectModal");
    var close = qs("#modalClose");
    if (close) {
      close.addEventListener("click", closeProjectModal);
    }
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeProjectModal();
        }
      });
    }

    var articleClose = qs("#articleCloseButton");
    var articleBack = qs("#articleBackButton");
    var articleOverlay = qs("#projectArticleOverlay");
    if (articleClose) {
      articleClose.addEventListener("click", closeProjectArticle);
    }
    if (articleBack) {
      articleBack.addEventListener("click", closeProjectArticle);
    }
    if (articleOverlay) {
      articleOverlay.addEventListener("click", function (event) {
        if (event.target === articleOverlay) {
          closeProjectArticle();
        }
      });
    }

    var mobileButton = qs("#mobileMenuButton");
    if (mobileButton) {
      mobileButton.addEventListener("click", toggleMobileNav);
    }

    bindAdminEvents();
    bindAdminTrigger();
    handleAdminHashRoute();
    window.addEventListener("hashchange", handleProjectArticleHashRoute);
    handleProjectArticleHashRoute();
  }

  function getHeaderOffset() {
    var header = qs(".site-header");
    return header ? Math.ceil(header.getBoundingClientRect().height + 34) : 96;
  }

  function smoothScrollTo(target, duration, withThreshold) {
    if (reduceMotionQuery.matches) {
      window.scrollTo(0, Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset()));
      return;
    }
    var start = window.scrollY || window.pageYOffset;
    var end = target.getBoundingClientRect().top + start - getHeaderOffset();
    var distance = end - start;
    var startTime = 0;
    var wait = withThreshold ? 90 : 0;
    if (withThreshold) {
      startThresholdJump(target);
    }
    document.body.classList.add("is-anchor-scrolling");
    function ease(t) {
      var c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : t < 0.82
        ? 1 - Math.pow(2, -8 * t) * Math.cos(t * c4)
        : 1 - Math.pow(1 - t, 2) * 0.12;
    }
    function step(now) {
      if (!startTime) {
        startTime = now + wait;
      }
      if (now < startTime) {
        requestAnimationFrame(step);
        return;
      }
      var progress = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, start + distance * ease(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        document.body.classList.remove("is-anchor-scrolling");
        if (withThreshold) {
          finishThresholdJump(target);
        }
        history.replaceState(null, "", "#" + target.id);
      }
    }
    requestAnimationFrame(step);
  }

  function startThresholdJump(target) {
    var layer = qs("#thresholdTransition");
    if (!layer || reduceMotionQuery.matches) {
      return;
    }
    layer.classList.remove("is-active");
    void layer.offsetWidth;
    document.body.classList.add("is-threshold-jumping");
    layer.classList.add("is-active");
    window.dispatchEvent(new CustomEvent("atelier:ember-burst", {
      detail: { x: window.innerWidth * 0.52, y: Math.min(180, window.innerHeight * 0.2), count: window.innerWidth < 700 ? 3 : 5 }
    }));
  }

  function finishThresholdJump(target) {
    target.classList.add("is-threshold-arrived");
    window.setTimeout(function () {
      target.classList.remove("is-threshold-arrived");
      document.body.classList.remove("is-threshold-jumping");
      var layer = qs("#thresholdTransition");
      if (layer) {
        layer.classList.remove("is-active");
      }
    }, 360);
  }

  async function openProjectModal(id) {
    var project = await fetchProjectById(id);
    if (!project) {
      return;
    }
    var modal = qs("#projectModal");
    var content = qs("#modalContent");
    if (!modal || !content) {
      return;
    }
    state.lastFocusedElement = document.activeElement;
    content.innerHTML = modalHTML(project);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    bindModalMedia(project);
    var closeButton = qs("#modalClose");
    if (closeButton) {
      closeButton.focus();
    }
    document.addEventListener("keydown", trapModalFocus);
  }

  function closeProjectModal() {
    var modal = qs("#projectModal");
    if (!modal) {
      return;
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", trapModalFocus);
    if (state.lastFocusedElement && state.lastFocusedElement.focus) {
      state.lastFocusedElement.focus();
    }
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab") {
      return;
    }
    var modal = qs("#projectModal");
    if (!modal || !modal.classList.contains("is-open")) {
      return;
    }
    var focusables = qsa('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
      .filter(function (node) { return node.offsetParent !== null; });
    if (!focusables.length) {
      return;
    }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function modalHTML(project) {
    var tags = project.tags.map(function (tag) {
      return '<span class="tag">' + escapeHTML(tag) + '</span>';
    }).join("");
    var number = projectNumber(project);
    var modelEntry = project.model3d ? '<button class="button button-dark" type="button" data-panel-target="modelPanel"><span>模型台</span><em>Model Platform</em></button>' : "";
    var panoramaEntry = project.panorama ? '<button class="button button-outline" type="button" data-panel-target="panoramaPanel"><span>入此空间</span><em>Enter Scene</em></button>' : "";
    return '<div class="modal-layout">' +
      '<div class="modal-visual">' + visualHTML(project, "modal") + '</div>' +
      '<div class="modal-copy">' +
        '<div><span class="modal-archive-code">BY-' + number + ' / ' + escapeHTML(project.category) + '</span><h2 id="modalTitle">' + escapeHTML(project.titleCN) + '<span>' + escapeHTML(project.titleEN) + '</span></h2></div>' +
        '<div class="project-meta">' + metaItem("No.", "BY-" + number) + metaItem("Category", project.category) + metaItem("Year", project.year) + metaItem("Status", project.status) + metaItem("Location", project.location) + metaItem("Material", project.material) + metaItem("Scale", project.scale) + metaItem("Role", project.role) + '</div>' +
        '<div class="concept-panel"><strong>DESIGN PROPOSITION</strong><p>' + escapeHTML(project.concept || project.description) + '</p></div>' +
        '<p class="modal-description">' + escapeHTML(project.description) + '</p>' +
        '<div class="tags">' + tags + '</div>' +
        modalAssetsHTML(project) +
        '<div class="hero-actions"><a class="button button-primary" href="#project/' + escapeHTML(project.id) + '"><span>查看完整项目</span><em>Full Case</em></a>' + modelEntry + panoramaEntry + '</div>' +
        modalMediaPanels(project) +
      '</div></div>';
  }

  async function handleProjectArticleHashRoute() {
    var match = String(window.location.hash || "").match(/^#project\/([^/]+)$/);
    if (!match) {
      return;
    }
    await openProjectArticle(match[1], true);
  }

  async function openProjectArticle(id, fromHash) {
    var project = await fetchProjectById(id);
    if (!project) {
      return;
    }
    var overlay = qs("#projectArticleOverlay");
    var content = qs("#projectArticleContent");
    if (!overlay || !content) {
      return;
    }
    state.articleReturnHash = fromHash ? "" : window.location.hash;
    state.activeArticleId = id;
    content.innerHTML = projectArticleHTML(project);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("article-open");
    closeProjectModal();
    bindArticleView(project);
    if (!fromHash) {
      history.replaceState(null, "", "#project/" + id);
    }
    var close = qs("#articleCloseButton");
    if (close) {
      close.focus();
    }
  }

  function closeProjectArticle() {
    var overlay = qs("#projectArticleOverlay");
    if (!overlay || !overlay.classList.contains("is-open")) {
      return;
    }
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("article-open");
    state.activeArticleId = "";
    if (/^#project\//.test(window.location.hash || "")) {
      history.replaceState(null, "", window.location.pathname + window.location.search + (state.articleReturnHash && state.articleReturnHash !== window.location.hash ? state.articleReturnHash : ""));
    }
  }

  function projectArticleHTML(project) {
    var number = projectNumber(project);
    var blocks = getArticleBlocks(project);
    var index = state.projects.findIndex(function (item) { return item.id === project.id; });
    var prev = state.projects[(index - 1 + state.projects.length) % state.projects.length];
    var next = state.projects[(index + 1) % state.projects.length];
    return '<header class="article-hero">' +
      '<div class="article-hero-visual">' + visualHTML(project, "article") + '</div>' +
      '<div class="article-hero-copy"><span class="modal-archive-code">BY-' + number + ' / ' + escapeHTML(project.category) + '</span>' +
      '<h1 id="projectArticleTitle">' + escapeHTML(project.titleCN) + '</h1><p>' + escapeHTML(project.titleEN) + '</p>' +
      '<div class="article-meta-grid">' + metaItem("Year", project.year) + metaItem("Status", project.status) + metaItem("Location", project.location) + metaItem("Material", project.material) + metaItem("Scale", project.scale) + metaItem("Role", project.role) + '</div></div></header>' +
      '<main class="article-body">' +
      '<section class="article-summary"><strong>DESIGN PROPOSITION</strong><p>' + escapeHTML(project.concept || project.description) + '</p></section>' +
      blocks.map(articleBlockHTML).join("") +
      '<nav class="article-nav"><button class="button button-outline" type="button" data-open-article="' + escapeHTML(prev.id) + '"><span>上一个项目</span><em>' + escapeHTML(prev.titleCN) + '</em></button><button class="button button-dark" type="button" data-open-article="' + escapeHTML(next.id) + '"><span>下一个项目</span><em>' + escapeHTML(next.titleCN) + '</em></button></nav>' +
      '</main>';
  }

  function getArticleBlocks(project) {
    var blocks = normalizeArticleBlocks(project.articleBlocks);
    if (blocks.length) {
      return blocks;
    }
    var generated = [
      { type: "heading", text: "项目概述" },
      { type: "paragraph", text: project.description || project.concept || "" },
      { type: "quote", text: project.concept || "让设计方法在空间、材料与观看路径中逐层展开。" }
    ];
    parseList(project.gallery).forEach(function (asset) {
      generated.push({ type: "image", asset: asset, caption: "项目图像" });
    });
    parseList(project.drawings).forEach(function (asset) {
      generated.push({ type: "pdf", asset: asset, label: "查看图纸 / Drawing" });
    });
    if (project.video) { generated.push({ type: "video", asset: project.video, poster: project.videoPoster, caption: "项目视频" }); }
    if (project.model3d) { generated.push({ type: "model3d", asset: project.model3d, thumbnail: project.modelThumbnail }); }
    if (project.panorama) { generated.push({ type: "panorama", asset: project.panorama, thumbnail: project.panoramaThumbnail }); }
    if (project.pdf) { generated.push({ type: "pdf", asset: project.pdf, label: "下载完整项目 PDF" }); }
    normalizeAttachments(project.attachments).forEach(function (attachment) {
      generated.push({ type: "attachment", asset: attachment.filePath, caption: attachment.description, label: attachment.fileName || attachment.filePath });
    });
    return normalizeArticleBlocks(generated);
  }

  function articleBlockHTML(block) {
    var type = block.type;
    if (type === "heading") {
      return '<h2 class="article-block-heading">' + escapeHTML(block.text) + '</h2>';
    }
    if (type === "paragraph") {
      return '<p class="article-paragraph">' + escapeHTML(block.text) + '</p>';
    }
    if (type === "quote") {
      return '<blockquote class="article-quote">' + escapeHTML(block.text) + '</blockquote>';
    }
    if (type === "divider") {
      return '<hr class="article-divider">';
    }
    if (type === "gallery") {
      return '<div class="article-gallery">' + parseList(block.assets).map(function (asset) {
        return renderAssetPreview(asset, "");
      }).join("") + captionHTML(block.caption) + '</div>';
    }
    if (type === "video" || type === "image" || type === "pdf" || type === "attachment") {
      return renderAssetPreview(block.asset, block.caption || block.label, { poster: block.poster, thumbnail: block.thumbnail, type: type });
    }
    if (type === "model3d") {
      var modelThumb = block.thumbnail ? '<div class="path-preview-grid">' + pathPreviewHTML(block.thumbnail, "gallery", "模型缩略图") + '</div>' : "";
      return '<section class="article-module"><p class="eyebrow">MODEL PLATFORM / 模型台</p><h3>模型台预留</h3><p>路径：<code>' + escapeHTML(resolveAssetURL(block.asset) || block.asset || "") + '</code></p>' + modelThumb + '<button class="button button-dark" type="button" data-article-model="' + escapeHTML(block.asset || "") + '"><span>模型台</span><em>Model Platform</em></button></section>';
    }
    if (type === "panorama") {
      var panoramaThumb = block.thumbnail ? '<div class="path-preview-grid">' + pathPreviewHTML(block.thumbnail, "gallery", "全景缩略图") + '</div>' : "";
      return '<section class="article-module"><p class="eyebrow">ENTER SCENE / 入此空间</p><h3>全景场景预留</h3><p>路径：<code>' + escapeHTML(resolveAssetURL(block.asset) || block.asset || "") + '</code></p>' + panoramaThumb + '<button class="button button-outline" type="button" data-article-panorama="' + escapeHTML(block.asset || "") + '"><span>入此空间</span><em>Enter Scene</em></button></section>';
    }
    return "";
  }

  function bindArticleView(project) {
    qsa("[data-open-article]").forEach(function (button) {
      button.addEventListener("click", function () {
        openProjectArticle(button.getAttribute("data-open-article"));
      });
    });
    qsa("[data-article-model]").forEach(function (button) {
      button.addEventListener("click", function () {
        loadModelViewer(resolveAssetURL(button.getAttribute("data-article-model")) || button.getAttribute("data-article-model"));
        showAdminStamp("模型台已预留");
      });
    });
    qsa("[data-article-panorama]").forEach(function (button) {
      button.addEventListener("click", function () {
        loadPanoramaViewer(resolveAssetURL(button.getAttribute("data-article-panorama")) || button.getAttribute("data-article-panorama"));
        showAdminStamp("全景已预留");
      });
    });
  }

  function projectNumber(project) {
    var index = projects.findIndex(function (item) { return item.id === project.id; });
    return String(index + 1 || 1).padStart(3, "0");
  }

  function metaItem(label, value) {
    if (!value) {
      return "";
    }
    return "<div><small>" + escapeHTML(label) + "</small><strong>" + escapeHTML(value) + "</strong></div>";
  }

  function modalAssetsHTML(project) {
    var chips = [];
    parseList(project.gallery).forEach(function (item, index) {
      chips.push(assetChip("IMG " + String(index + 1).padStart(2, "0"), item));
    });
    parseList(project.drawings).forEach(function (item, index) {
      chips.push(assetChip("DRAW " + String(index + 1).padStart(2, "0"), item));
    });
    if (project.detailImage) { chips.push(assetChip("DETAIL", project.detailImage)); }
    if (project.articleCoverImage) { chips.push(assetChip("ARTICLE COVER", project.articleCoverImage)); }
    if (project.video) { chips.push(assetChip("VIDEO", project.video)); }
    if (project.videoPoster) { chips.push(assetChip("VIDEO POSTER", project.videoPoster)); }
    if (project.modelThumbnail) { chips.push(assetChip("MODEL THUMB", project.modelThumbnail)); }
    if (project.panoramaThumbnail) { chips.push(assetChip("360 THUMB", project.panoramaThumbnail)); }
    if (project.pdf) {
      chips.push(assetChip("PDF", project.pdf));
    }
    normalizeAttachments(project.attachments).forEach(function (attachment, index) {
      chips.push(assetChip("FILE " + String(index + 1).padStart(2, "0"), attachment.filePath));
    });
    if (!chips.length) {
      return "";
    }
    return '<div class="modal-assets"><h3>Gallery / Drawings / PDF</h3>' + chips.join("") + '</div>';
  }

  function assetChip(label, value) {
    return '<div class="asset-chip"><small>' + escapeHTML(label) + '</small><code>' + escapeHTML(value) + '</code></div>';
  }

  function modalMediaPanels(project) {
    var html = "";
    if (project.model3d) {
      var modelThumb = project.modelThumbnail ? '<img class="viewer-thumb" src="' + escapeHTML(resolveAssetURL(project.modelThumbnail) || project.modelThumbnail) + '" alt="" loading="lazy" decoding="async">' : "";
      html += '<section class="media-panel" id="modelPanel"><div class="viewer-stage">' + modelThumb + '<canvas width="760" height="320" data-model-canvas></canvas><div class="model-placeholder" data-model-placeholder><div><p class="eyebrow">GLB READY</p><h3>模型台 / Model Platform</h3><p>点击后模拟加载模型。真实接入时在这里挂载 GLB viewer。</p><button class="button button-primary" type="button" data-load-model><span>载入模型</span><em>Load Model</em></button></div></div></div><div class="viewer-caption"><p>模型路径：' + escapeHTML(project.model3d) + '</p><p>缩略图：' + escapeHTML(project.modelThumbnail || "未设置") + '</p></div></section>';
    }
    if (project.panorama) {
      var panoramaThumb = project.panoramaThumbnail ? '<img class="viewer-thumb" src="' + escapeHTML(resolveAssetURL(project.panoramaThumbnail) || project.panoramaThumbnail) + '" alt="" loading="lazy" decoding="async">' : "";
      html += '<section class="media-panel" id="panoramaPanel"><div class="viewer-stage">' + panoramaThumb + '<div class="panorama-strip" data-panorama-strip></div><div class="panorama-placeholder"><div><p class="eyebrow">360 READY</p><h3>入此空间 / Enter Scene</h3><p>拖动滑块模拟全景视角。真实接入时替换为 360 viewer。</p></div></div></div><div class="viewer-caption"><p>全景路径：' + escapeHTML(project.panorama) + '</p><p>缩略图：' + escapeHTML(project.panoramaThumbnail || "未设置") + '</p><input type="range" min="0" max="100" value="45" data-panorama-range aria-label="全景视角"></div></section>';
    }
    return html;
  }

  function bindModalMedia(project) {
    qsa("[data-panel-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = qs("#" + button.getAttribute("data-panel-target"));
        if (target) {
          qsa(".media-panel").forEach(function (panel) { panel.classList.remove("is-visible"); });
          target.classList.add("is-visible");
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });

    var loadModelButton = qs("[data-load-model]");
    if (loadModelButton) {
      loadModelButton.addEventListener("click", function () {
        var placeholder = qs("[data-model-placeholder]");
        if (placeholder) {
          placeholder.style.display = "none";
        }
        loadModelViewer(project.model3d);
      });
    }

    var range = qs("[data-panorama-range]");
    var strip = qs("[data-panorama-strip]");
    if (range && strip) {
      var updatePanorama = function () {
        strip.style.backgroundPosition = range.value + "% 50%";
      };
      range.addEventListener("input", updatePanorama);
      updatePanorama();
      range.addEventListener("change", function () {
        loadPanoramaViewer(project.panorama);
      }, { once: true });
    }
  }

  function loadModelViewer(modelPath) {
    var canvas = qs("[data-model-canvas]");
    if (!canvas) {
      return;
    }
    // 后期可将这里替换为 <model-viewer> 或 Three.js GLB viewer，并使用 modelPath 加载真实模型。
    drawMockModel(canvas, modelPath);
  }

  function loadPanoramaViewer(panoramaPath) {
    var strip = qs("[data-panorama-strip]");
    if (!strip) {
      return;
    }
    // 后期可将这里替换为 Pannellum 或 Photo Sphere Viewer，并使用 panoramaPath 加载真实 360 全景图。
    strip.dataset.loadedPanorama = panoramaPath || "";
  }

  function drawMockModel(canvas, modelPath) {
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    var gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#050708");
    gradient.addColorStop(0.5, "#162B28");
    gradient.addColorStop(1, "#0E1110");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(142, 167, 160, 0.62)";
    ctx.lineWidth = 1;
    ctx.save();
    ctx.translate(width / 2, height / 2 + 34);
    for (var i = 0; i < 9; i += 1) {
      var scale = 1 - i * 0.075;
      ctx.beginPath();
      ctx.moveTo(-220 * scale, 80 * scale - i * 7);
      ctx.lineTo(0, -80 * scale - i * 10);
      ctx.lineTo(220 * scale, 80 * scale - i * 7);
      ctx.lineTo(160 * scale, 110 * scale + i * 2);
      ctx.lineTo(-160 * scale, 110 * scale + i * 2);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(176, 138, 84, 0.65)";
    ctx.beginPath();
    ctx.moveTo(-260, 116);
    ctx.lineTo(260, 116);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(243, 238, 227, 0.82)";
    ctx.font = "12px Space Grotesk, sans-serif";
    ctx.fillText("Mock GLB viewer placeholder", 24, 32);
    ctx.fillText(modelPath || "", 24, 52);
  }

  function toggleMobileNav() {
    var panel = qs("#mobileNavPanel");
    var button = qs("#mobileMenuButton");
    if (!panel || !button) {
      return;
    }
    var open = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeMobileNav() {
    var panel = qs("#mobileNavPanel");
    var button = qs("#mobileMenuButton");
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  }

  function bindAdminEvents() {
    var loginButton = qs("#adminLoginButton");
    if (loginButton) {
      loginButton.addEventListener("click", async function () {
        var allowed = await requestAdminAccess();
        if (allowed) {
          qs("#adminLogin").classList.add("is-hidden");
          qs("#adminConsole").classList.remove("is-hidden");
        }
      });
    }

    qsa("[data-admin-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        var name = button.getAttribute("data-admin-tab");
        qsa("[data-admin-tab]").forEach(function (item) { item.classList.toggle("is-active", item === button); });
        qsa("[data-admin-panel]").forEach(function (panel) { panel.classList.toggle("is-active", panel.getAttribute("data-admin-panel") === name); });
      });
    });

    var projectForm = qs("#projectForm");
    if (projectForm) {
      projectForm.addEventListener("submit", handleProjectFormSubmit);
    }

    var newProjectButton = qs("#newProjectButton");
    if (newProjectButton) {
      newProjectButton.addEventListener("click", function () { fillProjectForm(null); });
    }

    var settingsForm = qs("#settingsForm");
    if (settingsForm) {
      settingsForm.addEventListener("submit", handleSettingsSubmit);
    }

    var useOfficialButton = qs("#useOfficialDataButton");
    if (useOfficialButton) {
      useOfficialButton.addEventListener("click", async function () {
        await useOfficialSiteData();
        await refreshData();
        renderAll();
        showAdminStamp("已恢复线上数据，并清除本机草稿");
      });
    }

    var useLocalDraftButton = qs("#useLocalDraftButton");
    if (useLocalDraftButton) {
      useLocalDraftButton.addEventListener("click", async function () {
        var result = await useLocalDraftData();
        if (!result.ok) {
          renderDataSourceStatus();
          showAdminStamp("暂无本机草稿");
          return;
        }
        await refreshData();
        renderAll();
        showAdminStamp("已使用本机草稿");
      });
    }

    var uploadButton = qs("#uploadButton");
    if (uploadButton) {
      uploadButton.addEventListener("click", handleUpload);
    }

    var assetProject = qs("#assetProject");
    if (assetProject) {
      assetProject.addEventListener("change", function () {
        fillAssetPathForm();
        renderAssetLibrary();
      });
    }

    var assetType = qs("#assetType");
    if (assetType) {
      assetType.addEventListener("change", fillAssetPathForm);
    }

    var saveAssetPathsButton = qs("#saveAssetPathsButton");
    if (saveAssetPathsButton) {
      saveAssetPathsButton.addEventListener("click", saveAssetPathsFromManager);
    }

    var previewAssetPathsButton = qs("#previewAssetPathsButton");
    if (previewAssetPathsButton) {
      previewAssetPathsButton.addEventListener("click", renderAssetPathPreview);
    }

    var exportProjectsButton = qs("#exportProjectsButton");
    if (exportProjectsButton) {
      exportProjectsButton.addEventListener("click", function () {
        exportJSON("northern-atelier-projects.json", projects);
      });
    }

    var exportSettingsButton = qs("#exportSettingsButton");
    if (exportSettingsButton) {
      exportSettingsButton.addEventListener("click", function () {
        exportJSON("northern-atelier-site-settings.json", siteSettings);
      });
    }

    var exportFullDataButton = qs("#exportFullDataButton");
    if (exportFullDataButton) {
      exportFullDataButton.addEventListener("click", exportFullSiteData);
    }

    var exportFullDataTopButton = qs("#exportFullDataTopButton");
    if (exportFullDataTopButton) {
      exportFullDataTopButton.addEventListener("click", exportFullSiteData);
    }

    var importProjectsInput = qs("#importProjectsInput");
    if (importProjectsInput) {
      importProjectsInput.addEventListener("change", handleProjectsImport);
    }

    var importSettingsInput = qs("#importSettingsInput");
    if (importSettingsInput) {
      importSettingsInput.addEventListener("change", handleSettingsImport);
    }

    var importFullDataInput = qs("#importFullDataInput");
    if (importFullDataInput) {
      importFullDataInput.addEventListener("change", handleFullDataImport);
    }

    var importFullDataTopInput = qs("#importFullDataTopInput");
    if (importFullDataTopInput) {
      importFullDataTopInput.addEventListener("change", handleFullDataImport);
    }

    var resetButton = qs("#resetMockButton");
    if (resetButton) {
      resetButton.addEventListener("click", async function () {
        await resetMockData();
        await refreshData();
        renderAll();
        showAdminStamp("已恢复线上数据，并清除本机草稿");
      });
    }

    var runPathCheckButton = qs("#runPathCheckButton");
    if (runPathCheckButton) {
      runPathCheckButton.addEventListener("click", function () {
        renderPathReport();
        showAdminStamp("路径检查已更新");
      });
    }

    var copyPublishListButton = qs("#copyPublishListButton");
    if (copyPublishListButton) {
      copyPublishListButton.addEventListener("click", copyPublishList);
    }

    bindSectionBackgroundEvents();
    bindArticleEditorEvents();
  }

  function bindSectionBackgroundEvents() {
    var targetSelect = qs("#sectionBgTarget");
    var saveButton = qs("#saveSectionBgButton");
    var previewButton = qs("#previewSectionBgButton");
    var forceButton = qs("#forceShowSectionBgButton");
    var uploadButton = qs("#uploadSectionBgButton");
    var clearButton = qs("#clearSectionBgButton");
    var resetButton = qs("#resetSectionBgButton");
    var imageInput = qs("#sectionBgImage");
    var videoInput = qs("#sectionBgVideo");
    var videoPosterInput = qs("#sectionBgVideoPoster");
    var imageOpacity = qs("#sectionBgImageOpacity");
    var designOpacity = qs("#sectionBgDesignOpacity");
    var positionSelect = qs("#sectionBgPosition");
    var blendSelect = qs("#sectionBgBlendMode");

    if (targetSelect) {
      targetSelect.addEventListener("change", function () {
        state.activeSectionBgId = targetSelect.value || "home";
        fillSectionBgForm(state.activeSectionBgId);
      });
    }

    [imageInput, videoInput, videoPosterInput, imageOpacity, designOpacity, positionSelect, blendSelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", updateSectionBgRangeLabels);
      control.addEventListener("change", updateSectionBgRangeLabels);
    });

    if (saveButton) {
      saveButton.addEventListener("click", saveSectionBackgroundFromForm);
    }

    if (previewButton) {
      previewButton.addEventListener("click", previewSectionBackgroundFromForm);
    }

    if (forceButton) {
      forceButton.addEventListener("click", forceShowCurrentSectionBackground);
    }

    if (uploadButton) {
      uploadButton.addEventListener("click", uploadSectionBackgroundFromForm);
    }

    if (clearButton) {
      clearButton.addEventListener("click", clearCurrentSectionBackground);
    }

    if (resetButton) {
      resetButton.addEventListener("click", resetAllSectionBackgrounds);
    }
  }

  function renderSectionBgControls() {
    var select = qs("#sectionBgTarget");
    if (!select || !state.settings) {
      return;
    }
    var current = state.activeSectionBgId || select.value || "home";
    select.innerHTML = PUBLIC_SECTIONS.map(function (section) {
      return '<option value="' + escapeHTML(section.id) + '">' + escapeHTML(section.labelCN) + ' / ' + escapeHTML(section.labelEN) + '</option>';
    }).join("");
    state.activeSectionBgId = PUBLIC_SECTIONS.some(function (section) { return section.id === current; }) ? current : "home";
    select.value = state.activeSectionBgId;
    fillSectionBgForm(state.activeSectionBgId);
    renderSectionBgPreview();
  }

  function getSectionBackground(sectionId) {
    var backgrounds = normalizeSectionBackgrounds(state.settings && state.settings.sectionBackgrounds);
    return backgrounds[sectionId] || defaultSectionBackground(sectionId);
  }

  function fillSectionBgForm(sectionId) {
    var config = getSectionBackground(sectionId);
    var imageInput = qs("#sectionBgImage");
    var videoInput = qs("#sectionBgVideo");
    var videoPosterInput = qs("#sectionBgVideoPoster");
    var imageOpacity = qs("#sectionBgImageOpacity");
    var designOpacity = qs("#sectionBgDesignOpacity");
    var positionSelect = qs("#sectionBgPosition");
    var blendSelect = qs("#sectionBgBlendMode");
    if (imageInput) {
      imageInput.value = config.image || "";
    }
    if (videoInput) {
      videoInput.value = config.video || "";
    }
    if (videoPosterInput) {
      videoPosterInput.value = config.videoPoster || "";
    }
    if (imageOpacity) {
      imageOpacity.value = String(config.image ? config.imageOpacity : 0);
    }
    if (designOpacity) {
      designOpacity.value = String(config.image ? config.designOpacity : 1);
    }
    if (positionSelect) {
      positionSelect.value = config.position || "center";
    }
    if (blendSelect) {
      blendSelect.value = config.blendMode || "screen";
    }
    updateSectionBgRangeLabels();
  }

  function updateSectionBgRangeLabels() {
    var imageOpacity = qs("#sectionBgImageOpacity");
    var designOpacity = qs("#sectionBgDesignOpacity");
    setText("sectionBgImageOpacityValue", imageOpacity ? Number(imageOpacity.value).toFixed(2) : "0");
    setText("sectionBgDesignOpacityValue", designOpacity ? Number(designOpacity.value).toFixed(2) : "1");
  }

  function sectionBgFromForm(sectionId) {
    var imageInput = qs("#sectionBgImage");
    var videoInput = qs("#sectionBgVideo");
    var videoPosterInput = qs("#sectionBgVideoPoster");
    var imageOpacity = qs("#sectionBgImageOpacity");
    var designOpacity = qs("#sectionBgDesignOpacity");
    var positionSelect = qs("#sectionBgPosition");
    var blendSelect = qs("#sectionBgBlendMode");
    var image = imageInput ? imageInput.value.trim() : "";
    var video = videoInput ? videoInput.value.trim() : "";
    var videoPoster = videoPosterInput ? videoPosterInput.value.trim() : "";
    var previous = getSectionBackground(sectionId);
    var firstImage = (image || video) && !previous.image && !previous.video;
    var imageOpacityValue = imageOpacity && imageOpacity.value;
    var designOpacityValue = designOpacity && designOpacity.value;
    var config = {
      image: image,
      video: video,
      videoPoster: videoPoster,
      imageOpacity: firstImage && Number(imageOpacityValue) === 0 ? 1 : clampUnit(imageOpacityValue, image ? 1 : 0),
      designOpacity: firstImage && Number(designOpacityValue) === 1 ? 0.35 : clampUnit(designOpacityValue, image ? 0.35 : 1),
      position: positionSelect ? positionSelect.value : defaultSectionBackground(sectionId).position,
      blendMode: blendSelect ? blendSelect.value : defaultSectionBackground(sectionId).blendMode
    };
    return normalizeSectionBackgrounds(Object.assign({}, state.settings.sectionBackgrounds, {
      [sectionId]: config
    }))[sectionId];
  }

  async function saveSectionBackgroundFromForm() {
    var sectionId = state.activeSectionBgId || "home";
    qsa(".debug-bg-visible").forEach(function (section) { section.classList.remove("debug-bg-visible"); });
    var backgrounds = normalizeSectionBackgrounds(state.settings.sectionBackgrounds);
    backgrounds[sectionId] = sectionBgFromForm(sectionId);
    await updateSiteSettings({ sectionBackgrounds: backgrounds });
    await refreshData();
    applySectionBackgrounds();
    renderSectionBgControls();
    showAdminStamp("背景已保存");
  }

  function previewSectionBackgroundFromForm() {
    var sectionId = state.activeSectionBgId || "home";
    var config = sectionBgFromForm(sectionId);
    var section = qs("#" + sectionId);
    if (section) {
      section.classList.remove("debug-bg-visible");
      applySectionBackgroundConfig(section, config);
    }
    renderSectionBgPreview(config);
    showAdminStamp("背景预览已更新");
  }

  function forceShowCurrentSectionBackground() {
    var sectionId = state.activeSectionBgId || "home";
    var imageOpacity = qs("#sectionBgImageOpacity");
    var designOpacity = qs("#sectionBgDesignOpacity");
    var blendSelect = qs("#sectionBgBlendMode");
    if (imageOpacity) {
      imageOpacity.value = "1";
    }
    if (designOpacity) {
      designOpacity.value = "0";
    }
    if (blendSelect) {
      blendSelect.value = "normal";
    }
    updateSectionBgRangeLabels();
    var section = qs("#" + sectionId);
    var config = sectionBgFromForm(sectionId);
    if (section) {
      applySectionBackgroundConfig(section, config);
      section.classList.toggle("debug-bg-visible", sectionId === "home");
    }
    renderSectionBgPreview(config);
    if (sectionId === "home") {
      logHomeBackgroundDebug();
    }
    showAdminStamp("已强制显示背景");
  }

  function logHomeBackgroundDebug() {
    var home = document.getElementById("home");
    var uploadLayer = document.querySelector("#home .section-bg-upload");
    var uploadStyles = uploadLayer ? getComputedStyle(uploadLayer) : null;
    console.log({
      uploadLayer: uploadLayer,
      backgroundImage: uploadStyles ? uploadStyles.backgroundImage : "",
      uploadOpacity: uploadStyles ? uploadStyles.opacity : "",
      uploadZIndex: uploadStyles ? uploadStyles.zIndex : "",
      homeVars: home ? {
        image: home.style.getPropertyValue("--section-upload-bg-image"),
        opacity: home.style.getPropertyValue("--section-upload-bg-opacity"),
        blend: home.style.getPropertyValue("--section-upload-bg-blend-mode")
      } : {}
    });
  }

  async function uploadSectionBackgroundFromForm() {
    var input = qs("#sectionBgFile");
    var file = input && input.files && input.files[0];
    if (!file) {
      showAdminStamp("请选择本地预览文件");
      return;
    }
    if (!state.assetDbReady) {
      showAdminStamp("IndexedDB 不可用");
      return;
    }
    var asset = await saveAssetToDB(file, {
      type: "sectionBackground",
      projectId: "",
      sectionId: state.activeSectionBgId || "home",
      mime: file.type || inferMimeFromName(file.name),
      size: file.size || 0
    });
    await createAssetObjectURL(asset.id);
    await refreshData();
    var previewPatch = assetKind(asset.id) === "video" ? { video: asset.id } : { image: asset.id };
    renderSectionBgPreview(Object.assign({}, sectionBgFromForm(state.activeSectionBgId || "home"), previewPatch));
    if (input) {
      input.value = "";
    }
    showAdminStamp("本地背景预览已导入");
  }

  async function clearCurrentSectionBackground() {
    var sectionId = state.activeSectionBgId || "home";
    qsa(".debug-bg-visible").forEach(function (section) { section.classList.remove("debug-bg-visible"); });
    var backgrounds = normalizeSectionBackgrounds(state.settings.sectionBackgrounds);
    backgrounds[sectionId] = defaultSectionBackground(sectionId);
    await updateSiteSettings({ sectionBackgrounds: backgrounds });
    await refreshData();
    applySectionBackgrounds();
    renderSectionBgControls();
    showAdminStamp("背景已清除");
  }

  async function resetAllSectionBackgrounds() {
    qsa(".debug-bg-visible").forEach(function (section) { section.classList.remove("debug-bg-visible"); });
    await updateSiteSettings({ sectionBackgrounds: createDefaultSectionBackgrounds() });
    await refreshData();
    applySectionBackgrounds();
    renderSectionBgControls();
    showAdminStamp("背景已复位");
  }

  function renderSectionBgPreview(overrideConfig) {
    var container = qs("#sectionBgPreview");
    if (!container || !state.settings) {
      return;
    }
    var backgrounds = normalizeSectionBackgrounds(state.settings.sectionBackgrounds);
    var previewConfig = overrideConfig || backgrounds[state.activeSectionBgId || "home"];
    var previewItems = [];
    if (previewConfig && previewConfig.image) {
      previewItems.push(pathPreviewHTML(previewConfig.image, "gallery", "当前背景图预览"));
    }
    if (previewConfig && previewConfig.video) {
      previewItems.push(pathPreviewHTML(previewConfig.video, "video", "当前背景视频预览"));
    }
    if (previewConfig && previewConfig.videoPoster) {
      previewItems.push(pathPreviewHTML(previewConfig.videoPoster, "gallery", "当前视频 poster 预览"));
    }
    var previewHTML = previewItems.length ? '<div class="path-preview-grid">' + previewItems.join("") + '</div>' : '<p class="asset-note">未填写背景路径时，板块保持默认效果。</p>';
    container.innerHTML = '<h4>当前板块背景</h4>' + previewHTML + PUBLIC_SECTIONS.map(function (section) {
      var bg = backgrounds[section.id];
      var active = section.id === state.activeSectionBgId ? " is-active" : "";
      return '<button class="section-bg-item' + active + '" type="button" data-section-bg-pick="' + escapeHTML(section.id) + '">' +
        '<span><strong>' + escapeHTML(section.labelCN) + '</strong><small>' + escapeHTML(section.labelEN) + '</small></span>' +
        '<code>' + escapeHTML([bg.image, bg.video, bg.videoPoster].filter(Boolean).join(" / ") || "默认背景") + '</code>' +
        '<em>IMG ' + Number(bg.imageOpacity).toFixed(2) + ' / DESIGN ' + Number(bg.designOpacity).toFixed(2) + '</em>' +
      '</button>';
    }).join("");
    qsa("[data-section-bg-pick]", container).forEach(function (button) {
      button.addEventListener("click", function () {
        state.activeSectionBgId = button.getAttribute("data-section-bg-pick") || "home";
        var select = qs("#sectionBgTarget");
        if (select) {
          select.value = state.activeSectionBgId;
        }
        fillSectionBgForm(state.activeSectionBgId);
        renderSectionBgPreview();
      });
    });
  }

  function bindArticleEditorEvents() {
    var projectSelect = qs("#articleProjectSelect");
    var addButton = qs("#addArticleBlockButton");
    var saveButton = qs("#saveArticleBlocksButton");
    var uploadButton = qs("#uploadArticleAssetButton");
    var previewButton = qs("#previewArticleAssetButton");
    if (projectSelect) {
      projectSelect.addEventListener("change", function () {
        state.activeArticleProjectId = projectSelect.value;
        renderArticleEditorControls();
      });
    }
    if (addButton) {
      addButton.addEventListener("click", addArticleBlockFromControls);
    }
    if (saveButton) {
      saveButton.addEventListener("click", saveArticleBlocksFromEditor);
    }
    if (uploadButton) {
      uploadButton.addEventListener("click", uploadInlineArticleAsset);
    }
    if (previewButton) {
      previewButton.addEventListener("click", previewArticleAssetFromControls);
    }
  }

  function renderArticleEditorControls() {
    var select = qs("#articleProjectSelect");
    var list = qs("#articleBlockList");
    var assetInput = qs("#articleBlockAsset");
    if (!select || !list) {
      return;
    }
    var current = state.activeArticleProjectId || select.value || (state.projects[0] && state.projects[0].id) || "";
    select.innerHTML = state.projects.map(function (project) {
      return '<option value="' + escapeHTML(project.id) + '">' + escapeHTML(project.titleCN) + ' / ' + escapeHTML(project.year) + '</option>';
    }).join("");
    state.activeArticleProjectId = state.projects.some(function (project) { return project.id === current; }) ? current : (state.projects[0] && state.projects[0].id) || "";
    select.value = state.activeArticleProjectId;
    if (assetInput) {
      assetInput.value = "";
    }
    renderArticleBlockList();
  }

  function articleAssetOptions(projectId, current) {
    var project = state.projects.find(function (item) { return item.id === projectId; });
    var projectAssets = project ? collectProjectAssets(project) : [];
    var known = {};
    var options = ['<option value="">不使用素材</option>'];
    projectAssets.forEach(function (asset) {
      if (!asset.url || known[asset.url]) {
        return;
      }
      known[asset.url] = true;
      var meta = resolveAssetMeta(asset.url);
      var label = (meta && meta.name) || asset.url;
      options.push('<option value="' + escapeHTML(asset.url) + '"' + (asset.url === current ? " selected" : "") + '>' + escapeHTML(asset.type + " / " + label) + '</option>');
    });
    state.assets.filter(function (asset) {
      return !asset.projectId || asset.projectId === projectId;
    }).forEach(function (asset) {
      if (known[asset.id]) {
        return;
      }
      known[asset.id] = true;
      options.push('<option value="' + escapeHTML(asset.id) + '"' + (asset.id === current ? " selected" : "") + '>' + escapeHTML(asset.type + " / " + asset.name) + '</option>');
    });
    return options.join("");
  }

  function renderArticleBlockList() {
    var list = qs("#articleBlockList");
    var project = state.projects.find(function (item) { return item.id === state.activeArticleProjectId; });
    if (!list) {
      return;
    }
    if (!project) {
      list.innerHTML = "<p>请选择项目。</p>";
      return;
    }
    var blocks = normalizeArticleBlocks(project.articleBlocks);
    list.innerHTML = '<h4>' + escapeHTML(project.titleCN) + ' / Article Blocks</h4>' + (blocks.length ? blocks.map(function (block, index) {
      return articleBlockEditorHTML(block, index, project.id);
    }).join("") : '<p>还没有自定义文章块。前台会自动根据项目素材生成默认文章。</p>');

    qsa("[data-article-delete]", list).forEach(function (button) {
      button.addEventListener("click", function () {
        if (!window.confirm("删除这个文章块？")) {
          return;
        }
        removeArticleBlock(Number(button.getAttribute("data-article-delete")));
      });
    });
    qsa("[data-article-up]", list).forEach(function (button) {
      button.addEventListener("click", function () { moveArticleBlock(Number(button.getAttribute("data-article-up")), -1); });
    });
    qsa("[data-article-down]", list).forEach(function (button) {
      button.addEventListener("click", function () { moveArticleBlock(Number(button.getAttribute("data-article-down")), 1); });
    });
  }

  function articleBlockEditorHTML(block, index, projectId) {
    var typeOptions = ["heading", "paragraph", "image", "gallery", "video", "quote", "divider", "model3d", "panorama", "pdf", "attachment"].map(function (type) {
      return '<option value="' + type + '"' + (block.type === type ? " selected" : "") + '>' + type + '</option>';
    }).join("");
    var assetValue = block.asset || formatPathList(block.assets);
    var posterValue = block.poster || block.thumbnail || "";
    return '<div class="article-block-editor" data-article-block="' + index + '">' +
      '<div class="article-block-editor-head"><strong>' + String(index + 1).padStart(2, "0") + '</strong><div><button class="icon-button" type="button" data-article-up="' + index + '">↑</button><button class="icon-button" type="button" data-article-down="' + index + '">↓</button><button class="icon-button" type="button" data-article-delete="' + index + '">×</button></div></div>' +
      '<label>类型<select data-article-field="type">' + typeOptions + '</select></label>' +
      '<label>文字<textarea data-article-field="text" rows="3">' + escapeHTML(block.text) + '</textarea></label>' +
      '<label>素材路径<textarea data-article-field="asset" rows="3" placeholder="gallery 支持一行一个路径">' + escapeHTML(assetValue) + '</textarea></label>' +
      '<label>Poster / Thumbnail 路径<input data-article-field="poster" value="' + escapeHTML(posterValue) + '" placeholder="assets/projects/p001/video-poster.jpg"></label>' +
      '<label>说明<input data-article-field="caption" value="' + escapeHTML(block.caption || block.label || "") + '"></label>' +
    '</div>';
  }

  async function addArticleBlockFromControls() {
    var type = qs("#articleBlockType") ? qs("#articleBlockType").value : "paragraph";
    var text = qs("#articleBlockText") ? qs("#articleBlockText").value.trim() : "";
    var asset = qs("#articleBlockAsset") ? qs("#articleBlockAsset").value.trim() : "";
    var poster = qs("#articleBlockPoster") ? qs("#articleBlockPoster").value.trim() : "";
    var caption = qs("#articleBlockCaption") ? qs("#articleBlockCaption").value.trim() : "";
    var block = { type: type, text: text, asset: asset, poster: type === "video" ? poster : "", thumbnail: type === "model3d" || type === "panorama" ? poster : "", caption: caption, label: caption };
    if (type === "gallery") {
      block.assets = parseList(asset);
      block.asset = "";
    }
    if (type === "divider") {
      block.text = "";
      block.asset = "";
    }
    await appendArticleBlock(state.activeArticleProjectId, block);
    await refreshData();
    renderAll();
    showAdminStamp("文章块已添加");
  }

  async function saveArticleBlocksFromEditor() {
    var project = projects.find(function (item) { return item.id === state.activeArticleProjectId; });
    var list = qs("#articleBlockList");
    if (!project || !list) {
      return;
    }
    var blocks = qsa("[data-article-block]", list).map(function (node) {
      var type = qs('[data-article-field="type"]', node).value;
      var text = qs('[data-article-field="text"]', node).value;
      var asset = qs('[data-article-field="asset"]', node).value.trim();
      var poster = qs('[data-article-field="poster"]', node).value.trim();
      var caption = qs('[data-article-field="caption"]', node).value;
      return {
        type: type,
        text: text,
        asset: type === "gallery" ? "" : asset,
        assets: type === "gallery" ? parseList(asset) : [],
        poster: type === "video" ? poster : "",
        thumbnail: type === "model3d" || type === "panorama" ? poster : "",
        caption: caption,
        label: caption
      };
    });
    project.articleBlocks = normalizeArticleBlocks(blocks);
    writeStorage();
    await refreshData();
    renderAll();
    if (state.activeArticleId === project.id) {
      await openProjectArticle(project.id, true);
    }
    showAdminStamp("文章已保存");
  }

  function previewArticleAssetFromControls() {
    var type = qs("#articleBlockType") ? qs("#articleBlockType").value : "image";
    var asset = qs("#articleBlockAsset") ? qs("#articleBlockAsset").value.trim() : "";
    var poster = qs("#articleBlockPoster") ? qs("#articleBlockPoster").value.trim() : "";
    var caption = qs("#articleBlockCaption") ? qs("#articleBlockCaption").value.trim() : "";
    var container = qs("#articlePathPreview");
    if (!container) {
      return;
    }
    var refs = type === "gallery" ? parseList(asset) : parseList(asset).slice(0, 1);
    var field = type === "pdf" ? "pdf" : type === "video" ? "video" : type === "model3d" ? "model3d" : type === "panorama" ? "panorama" : "gallery";
    container.innerHTML = refs.length
      ? refs.map(function (ref) { return pathPreviewHTML(ref, field, caption || ref); }).join("") + (poster ? pathPreviewHTML(poster, "gallery", "Poster / Thumbnail") : "")
      : '<div class="path-preview-card asset-preview-empty"><strong>EMPTY</strong><span>请先填写素材路径。</span></div>';
    showAdminStamp("文章路径预览已更新");
  }

  async function uploadInlineArticleAsset() {
    var input = qs("#articleInlineFile");
    var file = input && input.files && input.files[0];
    if (!file) {
      showAdminStamp("请选择文件");
      return;
    }
    var type = file.type && file.type.indexOf("video/") === 0 ? "articleVideo" : file.type === "application/pdf" ? "pdf" : "articleImage";
    try {
      if (!state.assetDbReady) {
        showAdminStamp("IndexedDB 不可用");
        return;
      }
      var asset = await saveAssetToDB(file, {
        type: type,
        projectId: state.activeArticleProjectId,
        sectionId: "",
        mime: file.type || inferMimeFromName(file.name),
        size: file.size || 0
      });
      await createAssetObjectURL(asset.id);
      await refreshData();
      var container = qs("#articlePathPreview");
      if (container) {
        container.innerHTML = pathPreviewHTML(asset.id, type === "pdf" ? "pdf" : type === "articleVideo" ? "video" : "gallery", asset.name) +
          '<p class="asset-note">本机上传仅用于预览。若要让所有设备看到，请将素材文件上传到 GitHub 仓库对应 assets 目录，并在后台填写项目内相对路径。</p>';
      }
      if (input) {
        input.value = "";
      }
      showAdminStamp("本地预览已导入");
    } catch (error) {
      showAdminStamp("本地预览失败");
    }
  }

  function removeArticleBlock(index) {
    var project = projects.find(function (item) { return item.id === state.activeArticleProjectId; });
    if (!project) {
      return;
    }
    var blocks = normalizeArticleBlocks(project.articleBlocks);
    blocks.splice(index, 1);
    project.articleBlocks = blocks;
    writeStorage();
    refreshData().then(function () {
      renderAll();
      showAdminStamp("文章块已删除");
    });
  }

  function moveArticleBlock(index, direction) {
    var project = projects.find(function (item) { return item.id === state.activeArticleProjectId; });
    if (!project) {
      return;
    }
    var blocks = normalizeArticleBlocks(project.articleBlocks);
    var nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) {
      return;
    }
    var item = blocks[index];
    blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, item);
    project.articleBlocks = blocks;
    writeStorage();
    refreshData().then(function () {
      renderAll();
      showAdminStamp("顺序已调整");
    });
  }

  function bindAdminTrigger() {
    var trigger = qs("#adminTrigger");
    if (trigger) {
      trigger.addEventListener("click", openAdminConsole);
    }
    var brand = qs(".brand-pill");
    if (brand) {
      brand.addEventListener("click", handleHiddenAdminLogoClick);
    }
    document.addEventListener("keydown", handleHiddenAdminKey);
    qsa("[data-admin-close]").forEach(function (button) {
      button.addEventListener("click", closeAdminConsole);
    });
    window.addEventListener("hashchange", handleAdminHashRoute);
  }

  function handleAdminHashRoute() {
    if (window.location.hash === ADMIN_HASH_ROUTE) {
      window.setTimeout(openAdminConsole, 0);
    }
  }

  function handleHiddenAdminLogoClick(event) {
    window.clearTimeout(state.adminEntryTimer);
    state.adminEntryClickCount += 1;
    if (state.adminEntryClickCount >= 5) {
      state.adminEntryClickCount = 0;
      event.preventDefault();
      event.stopPropagation();
      openAdminConsole();
      return;
    }
    state.adminEntryTimer = window.setTimeout(function () {
      state.adminEntryClickCount = 0;
    }, 1800);
  }

  function handleHiddenAdminKey(event) {
    if (!event.ctrlKey || !event.altKey || event.shiftKey || event.metaKey) {
      return;
    }
    if (String(event.key || "").toLowerCase() !== "m") {
      return;
    }
    event.preventDefault();
    openAdminConsole();
  }

  async function openAdminConsole() {
    var allowed = await requestAdminAccess();
    if (!allowed) {
      return;
    }
    showAdminConsole();
  }

  function showAdminConsole() {
    var overlay = qs("#adminOverlay");
    if (!overlay || overlay.classList.contains("is-open")) {
      return;
    }
    state.lastFocusedElement = document.activeElement;
    state.lastScrollY = window.scrollY || window.pageYOffset || 0;
    state.adminOpen = true;
    overlay.hidden = false;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-open");
    document.body.style.top = "-" + state.lastScrollY + "px";
    document.body.style.width = "100%";
    var login = qs("#adminLogin");
    var consolePanel = qs("#adminConsole");
    if (login && consolePanel) {
      login.classList.add("is-hidden");
      consolePanel.classList.remove("is-hidden");
    }
    var close = qs(".admin-close", overlay);
    if (close) {
      close.focus();
    }
  }

  function closeAdminConsole(silent) {
    var overlay = qs("#adminOverlay");
    if (!overlay || !overlay.classList.contains("is-open")) {
      return;
    }
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.classList.remove("admin-open");
    document.body.style.top = "";
    document.body.style.width = "";
    state.adminOpen = false;
    window.scrollTo(0, state.lastScrollY || 0);
    if (window.location.hash === ADMIN_HASH_ROUTE || window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (!silent && state.lastFocusedElement && state.lastFocusedElement.focus) {
      state.lastFocusedElement.focus();
    }
  }

  async function toggleAdminConsole() {
    var overlay = qs("#adminOverlay");
    if (overlay && overlay.classList.contains("is-open")) {
      closeAdminConsole();
    } else {
      await openAdminConsole();
    }
  }

  function showAdminStamp(text) {
    var drawer = qs(".admin-drawer");
    if (!drawer) {
      return;
    }
    var stamp = qs(".admin-stamp-feedback", drawer);
    if (!stamp) {
      stamp = document.createElement("div");
      stamp.className = "admin-stamp-feedback";
      drawer.appendChild(stamp);
    }
    stamp.textContent = text || "已保存";
    stamp.classList.remove("is-visible");
    void stamp.offsetWidth;
    stamp.classList.add("is-visible");
    window.setTimeout(function () {
      stamp.classList.remove("is-visible");
    }, 1200);
  }

  function openAdminOverlay() {
    openAdminConsole();
  }

  function closeAdminOverlay() {
    closeAdminConsole();
  }

  window.openAdminConsole = openAdminConsole;
  window.closeAdminConsole = closeAdminConsole;
  window.toggleAdminConsole = toggleAdminConsole;
  window.handleAdminHashRoute = handleAdminHashRoute;
  window.bindAdminTrigger = bindAdminTrigger;

  function renderAdminList() {
    var list = qs("#adminProjectList");
    if (!list) {
      return;
    }
    list.innerHTML = state.projects.map(function (project) {
      var assetCount = collectProjectAssets(project).length;
      return '<div class="admin-list-item" data-admin-project="' + escapeHTML(project.id) + '"><div><strong>' + escapeHTML(project.titleCN) + '</strong><span>' + escapeHTML(project.category) + ' / ' + escapeHTML(project.year) + ' / ' + (project.published ? "已发布" : "草稿") + ' / 素材 ' + assetCount + '</span></div><div class="admin-item-actions"><button class="icon-button" type="button" title="编辑" data-edit-project="' + escapeHTML(project.id) + '">✎</button><button class="icon-button" type="button" title="切换发布" data-toggle-project="' + escapeHTML(project.id) + '">●</button><button class="icon-button" type="button" title="删除" data-delete-project="' + escapeHTML(project.id) + '">×</button></div></div>';
    }).join("");

    qsa("[data-edit-project]", list).forEach(function (button) {
      button.addEventListener("click", function () {
        var project = state.projects.find(function (item) { return item.id === button.getAttribute("data-edit-project"); });
        fillProjectForm(project);
      });
    });

    qsa("[data-toggle-project]", list).forEach(function (button) {
      button.addEventListener("click", async function () {
        await togglePublishStatus(button.getAttribute("data-toggle-project"));
        await refreshData();
        renderAll();
      });
    });

    qsa("[data-delete-project]", list).forEach(function (button) {
      button.addEventListener("click", async function () {
        if (!window.confirm("确定删除这个项目？这个操作会更新本地项目数据。")) {
          return;
        }
        await deleteProject(button.getAttribute("data-delete-project"));
        await refreshData();
        renderAll();
      });
    });
  }

  function fillProjectForm(project) {
    var form = qs("#projectForm");
    if (!form) {
      return;
    }
    form.reset();
    form.elements.id.value = project ? project.id : "";
    form.elements.titleCN.value = project ? project.titleCN : "";
    form.elements.titleEN.value = project ? project.titleEN : "";
    form.elements.category.value = project ? project.category : "Architecture";
    form.elements.year.value = project ? project.year : new Date().getFullYear().toString();
    form.elements.location.value = project ? project.location : "";
    form.elements.status.value = project ? project.status : "Draft";
    form.elements.material.value = project ? project.material : "";
    form.elements.scale.value = project ? project.scale : "";
    form.elements.role.value = project ? project.role : "";
    form.elements.coverImage.value = project ? project.coverImage : "";
    form.elements.detailImage.value = project ? project.detailImage : "";
    form.elements.articleCoverImage.value = project ? project.articleCoverImage : "";
    form.elements.gallery.value = project ? formatPathList(project.gallery) : "";
    form.elements.drawings.value = project ? formatPathList(project.drawings) : "";
    form.elements.model3d.value = project ? project.model3d : "";
    form.elements.modelThumbnail.value = project ? project.modelThumbnail : "";
    form.elements.panorama.value = project ? project.panorama : "";
    form.elements.panoramaThumbnail.value = project ? project.panoramaThumbnail : "";
    form.elements.video.value = project ? project.video : "";
    form.elements.videoPoster.value = project ? project.videoPoster : "";
    form.elements.pdf.value = project ? project.pdf : "";
    form.elements.attachments.value = project ? formatAttachments(project.attachments) : "";
    form.elements.tags.value = project ? project.tags.join(", ") : "";
    form.elements.concept.value = project ? project.concept : "";
    form.elements.description.value = project ? project.description : "";
    form.elements.featured.checked = project ? Boolean(project.featured) : false;
    form.elements.published.checked = project ? Boolean(project.published) : true;
  }

  async function handleProjectFormSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var data = {
      titleCN: form.elements.titleCN.value.trim(),
      titleEN: form.elements.titleEN.value.trim(),
      category: form.elements.category.value,
      year: form.elements.year.value.trim(),
      location: form.elements.location.value.trim(),
      status: form.elements.status.value.trim() || (form.elements.published.checked ? "Published" : "Draft"),
      material: form.elements.material.value.trim(),
      scale: form.elements.scale.value.trim(),
      role: form.elements.role.value.trim(),
      coverImage: form.elements.coverImage.value.trim(),
      detailImage: form.elements.detailImage.value.trim(),
      articleCoverImage: form.elements.articleCoverImage.value.trim(),
      gallery: parseList(form.elements.gallery.value),
      drawings: parseList(form.elements.drawings.value),
      model3d: form.elements.model3d.value.trim(),
      modelThumbnail: form.elements.modelThumbnail.value.trim(),
      panorama: form.elements.panorama.value.trim(),
      panoramaThumbnail: form.elements.panoramaThumbnail.value.trim(),
      video: form.elements.video.value.trim(),
      videoPoster: form.elements.videoPoster.value.trim(),
      pdf: form.elements.pdf.value.trim(),
      attachments: normalizeAttachments(form.elements.attachments.value),
      tags: parseTags(form.elements.tags.value),
      description: form.elements.description.value.trim(),
      concept: form.elements.concept.value.trim() || form.elements.description.value.trim().slice(0, 48),
      featured: form.elements.featured.checked,
      published: form.elements.published.checked
    };
    var id = form.elements.id.value;
    if (id) {
      await updateProject(id, data);
    } else {
      await createProject(data);
    }
    await refreshData();
    renderAll();
    fillProjectForm(null);
    showAdminStamp("案卷已保存");
  }

  function fillSettingsForm() {
    var form = qs("#settingsForm");
    if (!form || !state.settings) {
      return;
    }
    form.elements.studioName.value = state.settings.studioName;
    form.elements.studioSeal.value = state.settings.studioSeal;
    form.elements.taglineCN.value = state.settings.taglineCN;
    form.elements.taglineEN.value = state.settings.taglineEN;
    form.elements.intro.value = state.settings.intro;
    form.elements.email.value = state.settings.email;
    form.elements.portfolioPdf.value = state.settings.portfolioPdf;
    var visualAssets = normalizeVisualAssets(state.settings.visualAssets);
    form.elements.heroDepthMountain.value = visualAssets.heroDepth.mountain;
    form.elements.heroDepthWindowFrame.value = visualAssets.heroDepth.windowFrame;
    form.elements.heroDepthLady.value = visualAssets.heroDepth.lady;
    form.elements.heroDepthVignette.value = visualAssets.heroDepth.vignette;
    form.elements.heroDepthReference.value = visualAssets.heroDepth.reference;
    form.elements.watangWebp.value = visualAssets.watang.webp;
    form.elements.watangPngFallback.value = visualAssets.watang.pngFallback;
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    await updateSiteSettings({
      studioName: form.elements.studioName.value.trim(),
      studioSeal: form.elements.studioSeal.value.trim(),
      taglineCN: form.elements.taglineCN.value.trim(),
      taglineEN: form.elements.taglineEN.value.trim(),
      intro: form.elements.intro.value.trim(),
      email: form.elements.email.value.trim(),
      portfolioPdf: form.elements.portfolioPdf.value.trim(),
      visualAssets: normalizeVisualAssets({
        heroDepth: {
          mountain: form.elements.heroDepthMountain.value.trim(),
          windowFrame: form.elements.heroDepthWindowFrame.value.trim(),
          lady: form.elements.heroDepthLady.value.trim(),
          vignette: form.elements.heroDepthVignette.value.trim(),
          reference: form.elements.heroDepthReference.value.trim()
        },
        watang: {
          webp: form.elements.watangWebp.value.trim(),
          pngFallback: form.elements.watangPngFallback.value.trim()
        }
      })
    });
    await refreshData();
    renderAll();
    showAdminStamp("首页已更新");
  }

  function selectedAssetProject() {
    var select = qs("#assetProject");
    return state.projects.find(function (item) { return item.id === (select && select.value); }) || state.projects[0] || null;
  }

  function selectedAssetField() {
    var select = qs("#assetType");
    var field = select && select.value ? select.value : "coverImage";
    return ASSET_FIELD_CONFIG[field] ? field : "coverImage";
  }

  function getProjectFieldValue(project, field) {
    if (!project) {
      return "";
    }
    if (field === "attachments") {
      return formatAttachments(project.attachments);
    }
    if (field === "gallery" || field === "drawings") {
      return formatPathList(project[field]);
    }
    return project[field] || "";
  }

  function fillAssetPathForm() {
    var project = selectedAssetProject();
    var field = selectedAssetField();
    var input = qs("#assetPathInput");
    if (input) {
      input.value = getProjectFieldValue(project, field);
      input.placeholder = assetPlaceholderForField(project, field);
    }
    renderAssetPathPreview();
  }

  function assetPlaceholderForField(project, field) {
    var slug = project ? project.id + "-" + slugify(project.titleEN || project.titleCN || "project") : "p001-project";
    var base = "assets/projects/" + slug + "/";
    if (field === "coverImage") { return "abstract:ridge\n" + base + "cover.jpg"; }
    if (field === "detailImage") { return base + "detail-hero.jpg"; }
    if (field === "articleCoverImage") { return base + "article-cover.jpg"; }
    if (field === "gallery") { return base + "article-01.jpg\n" + base + "article-02.gif"; }
    if (field === "drawings") { return base + "drawings.pdf\n" + base + "section.jpg"; }
    if (field === "model3d") { return base + "model.glb"; }
    if (field === "modelThumbnail") { return base + "model-thumb.jpg"; }
    if (field === "panorama") { return base + "panorama.jpg"; }
    if (field === "panoramaThumbnail") { return base + "panorama-thumb.jpg"; }
    if (field === "video") { return base + "walkthrough.mp4"; }
    if (field === "videoPoster") { return base + "video-poster.jpg"; }
    if (field === "pdf") { return base + "case.pdf"; }
    if (field === "attachments") { return base + "case.pdf | 完整案例 PDF | pdf | 下载完整案例"; }
    return base;
  }

  function slugify(value) {
    return String(value || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  }

  async function saveAssetPathsFromManager() {
    var project = selectedAssetProject();
    var field = selectedAssetField();
    var input = qs("#assetPathInput");
    if (!project || !input) {
      showAdminStamp("请选择项目");
      return;
    }
    var config = ASSET_FIELD_CONFIG[field];
    var values = field === "attachments" ? normalizeAttachments(input.value).map(function (item) { return item.filePath; }).filter(Boolean) : parseList(input.value);
    var invalid = values.map(function (path) {
      return validatePathForField(path, field);
    }).find(function (result) { return !result.ok; });
    if (invalid) {
      showAdminStamp("路径需确认");
      renderAssetPathPreview();
      return;
    }
    var data = {};
    data[field] = field === "attachments" ? normalizeAttachments(input.value) : config.multiple ? values : (values[0] || "");
    await updateProject(project.id, data);
    await refreshData();
    renderAll();
    var refreshed = state.projects.find(function (item) { return item.id === project.id; });
    if (refreshed) {
      var select = qs("#assetProject");
      if (select) {
        select.value = refreshed.id;
      }
    }
    showAdminStamp("路径已保存");
  }

  function renderAssetPathPreview() {
    var container = qs("#assetLibrary");
    var project = selectedAssetProject();
    var field = selectedAssetField();
    var input = qs("#assetPathInput");
    if (!container || !project || !input) {
      return;
    }
    var values = field === "attachments" ? normalizeAttachments(input.value).map(function (item) { return item.filePath; }).filter(Boolean) : parseList(input.value);
    var config = ASSET_FIELD_CONFIG[field];
    var preview = values.length ? values.map(function (path) {
      return pathPreviewHTML(path, field, path);
    }).join("") : '<div class="path-preview-card asset-preview-empty"><strong>EMPTY</strong><span>当前字段没有路径。</span></div>';
    container.innerHTML =
      '<h4>路径预览 / ' + escapeHTML(project.titleCN) + '</h4>' +
      '<p class="asset-note">' + escapeHTML(config.label) + '。保存后会写入 localStorage 并立即更新当前浏览器预览；线上正式发布请修改 assets/data/site-data.json 并提交到 GitHub。</p>' +
      '<div class="path-preview-grid">' + preview + '</div>' +
      projectPathSummaryHTML(project);
  }

  function projectPathSummaryHTML(project) {
    var fields = Object.keys(ASSET_FIELD_CONFIG);
    return '<div class="asset-path-summary"><h4>当前项目路径清单</h4>' + fields.map(function (field) {
      var value = field === "attachments" ? formatAttachments(project.attachments) : field === "gallery" || field === "drawings" ? parseList(project[field]).join(" / ") : (project[field] || "");
      return '<p><strong>' + escapeHTML(field) + '</strong><code>' + escapeHTML(value || "未设置") + '</code></p>';
    }).join("") + '</div>';
  }

  async function handleUpload() {
    var input = qs("#assetInput");
    var type = selectedAssetField();
    var projectId = qs("#assetProject").value;
    var log = qs("#uploadLog");
    var progress = qs("#uploadProgress");
    var files = input && input.files.length ? Array.prototype.slice.call(input.files) : [];
    if (!projectId) {
      showAdminStamp("请选择项目");
      return;
    }
    if (!state.assetDbReady && files.length) {
      showAdminStamp("IndexedDB 不可用");
      if (log) {
        log.innerHTML = '<p class="upload-error">' + escapeHTML(state.assetDbError || "当前浏览器不支持 IndexedDB，无法保存本地文件。") + '</p>';
      }
      return;
    }
    if (!files.length) {
      showAdminStamp("请选择文件");
      if (log) {
        log.innerHTML = '<p class="upload-error">本机上传仅用于预览。若要让所有设备看到，请将素材文件上传到 GitHub 仓库对应 assets 目录，并在后台填写项目内相对路径。</p>';
      }
      return;
    }
    var results = [];
    try {
      for (var i = 0; i < files.length; i += 1) {
        setUploadProgress(progress, Math.round((i / Math.max(files.length, 1)) * 74));
        results.push(await saveAssetToDB(files[i], {
          type: type,
          projectId: projectId,
          sectionId: "",
          mime: files[i].type || inferMimeFromName(files[i].name),
          size: files[i].size || 0
        }));
        await createAssetObjectURL(results[results.length - 1].id);
      }
    } catch (error) {
      setUploadProgress(progress, 0);
      if (log) {
        log.innerHTML = '<p class="upload-error">上传失败：' + escapeHTML(error.message || error) + '</p>';
      }
      showAdminStamp("上传失败");
      return;
    }
    setUploadProgress(progress, 100);
    window.setTimeout(function () { setUploadProgress(progress, 0); }, 900);
    await refreshData();
    renderAssetPathPreview();
    if (log) {
      log.innerHTML = results.map(function (item) {
        return "<p>本地预览已导入：<strong>" + escapeHTML(item.type) + "</strong> / <code>" + escapeHTML(item.name) + "</code>。本机上传仅用于预览。若要让所有设备看到，请将素材文件上传到 GitHub 仓库对应 assets 目录，并在后台填写项目内相对路径。</p>";
      }).join("");
    }
    if (input) { input.value = ""; }
    showAdminStamp("本地预览已导入");
  }

  function setUploadProgress(progress, value) {
    if (!progress) {
      return;
    }
    progress.style.setProperty("--progress", value + "%");
    progress.setAttribute("aria-hidden", value ? "false" : "true");
  }

  function renderAssetProjectOptions() {
    var select = qs("#assetProject");
    if (!select) {
      return;
    }
    var current = select.value || (state.projects[0] && state.projects[0].id);
    select.innerHTML = state.projects.map(function (project) {
      return '<option value="' + escapeHTML(project.id) + '">' + escapeHTML(project.titleCN) + ' / ' + escapeHTML(project.year) + '</option>';
    }).join("");
    if (current) {
      select.value = current;
    }
  }

  function renderAssetLibrary() {
    renderAssetPathPreview();
  }

  function assetLibraryItemHTML(asset) {
    var meta = resolveAssetMeta(asset.url);
    var url = resolveAssetURL(asset.url) || asset.url;
    var label = (meta && meta.name) || asset.url;
    var kind = assetKind(asset.url);
    var thumb = kind === "image" || kind === "gif"
      ? '<img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="">'
      : kind === "video"
        ? '<video src="' + escapeHTML(url) + '" muted playsinline preload="metadata"></video>'
        : '<span class="asset-type-icon">' + escapeHTML(kind.toUpperCase()) + '</span>';
    return '<div class="asset-item asset-item-rich"><div class="asset-thumb">' + thumb + '</div><div><small>' + escapeHTML(asset.type) + '</small><code>' + escapeHTML(label) + '</code></div><div class="asset-actions">' +
      '<button class="icon-button" type="button" title="设为封面" data-cover-asset="' + escapeHTML(asset.url) + '">□</button>' +
      '<button class="icon-button" type="button" title="插入文章" data-article-asset="' + escapeHTML(asset.url) + '">文</button>' +
      '<label class="icon-button replace-button" title="替换素材">↻<input type="file" data-replace-type="' + escapeHTML(asset.type) + '" data-replace-asset="' + escapeHTML(asset.url) + '" accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.pdf,.glb,.gltf,image/*,video/*,application/pdf"></label>' +
      '<button class="icon-button" type="button" title="删除素材" data-remove-asset="' + escapeHTML(asset.type) + '" data-asset-url="' + escapeHTML(asset.url) + '">×</button>' +
    '</div></div>';
  }

  function collectProjectAssets(project) {
    var items = [];
    if (project.coverImage) { items.push({ type: "cover", url: project.coverImage }); }
    if (project.detailImage) { items.push({ type: "detailImage", url: project.detailImage }); }
    if (project.articleCoverImage) { items.push({ type: "articleCoverImage", url: project.articleCoverImage }); }
    parseList(project.gallery).forEach(function (url) { items.push({ type: "gallery", url: url }); });
    parseList(project.drawings).forEach(function (url) { items.push({ type: "drawing", url: url }); });
    ["model3d", "modelThumbnail", "panorama", "panoramaThumbnail", "video", "videoPoster", "pdf"].forEach(function (type) {
      if (project[type]) {
        items.push({ type: type, url: project[type] });
      }
    });
    normalizeAttachments(project.attachments).forEach(function (attachment) {
      if (attachment.filePath) {
        items.push({ type: "attachment", url: attachment.filePath });
      }
    });
    normalizeArticleBlocks(project.articleBlocks).forEach(function (block) {
      if (block.asset) {
        items.push({ type: "article", url: block.asset });
      }
      if (block.poster) {
        items.push({ type: "articlePoster", url: block.poster });
      }
      if (block.thumbnail) {
        items.push({ type: "articleThumbnail", url: block.thumbnail });
      }
      parseList(block.assets).forEach(function (url) {
        items.push({ type: "article", url: url });
      });
    });
    return items;
  }

  async function appendArticleBlock(projectId, block) {
    var project = projects.find(function (item) { return item.id === projectId; });
    if (!project) {
      return null;
    }
    project.articleBlocks = normalizeArticleBlocks(project.articleBlocks).concat(block);
    writeStorage();
    return project;
  }

  function replaceProjectAssetReference(project, oldValue, nextValue) {
    ["coverImage", "detailImage", "articleCoverImage", "model3d", "modelThumbnail", "panorama", "panoramaThumbnail", "video", "videoPoster", "pdf"].forEach(function (field) {
      if (project[field] === oldValue) {
        project[field] = nextValue;
      }
    });
    ["gallery", "drawings"].forEach(function (field) {
      project[field] = parseList(project[field]).map(function (item) {
        return item === oldValue ? nextValue : item;
      });
    });
    project.articleBlocks = normalizeArticleBlocks(project.articleBlocks).map(function (block) {
      if (block.asset === oldValue) {
        block.asset = nextValue;
      }
      if (block.poster === oldValue) {
        block.poster = nextValue;
      }
      if (block.thumbnail === oldValue) {
        block.thumbnail = nextValue;
      }
      block.assets = parseList(block.assets).map(function (item) {
        return item === oldValue ? nextValue : item;
      });
      return block;
    });
    project.attachments = normalizeAttachments(project.attachments).map(function (attachment) {
      if (attachment.filePath === oldValue) {
        attachment.filePath = nextValue;
      }
      return attachment;
    });
  }

  async function handleProjectsImport(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    projects = (await readJSONFile(file)).map(normalizeProject);
    writeStorage();
    await refreshData();
    renderAll();
    event.target.value = "";
    showAdminStamp("项目 JSON 已导入为本机草稿");
  }

  async function handleSettingsImport(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    siteSettings = normalizeSiteSettings(await readJSONFile(file));
    writeStorage();
    await refreshData();
    renderAll();
    event.target.value = "";
    showAdminStamp("设置 JSON 已导入为本机草稿");
  }

  async function handleFullDataImport(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    var data = await readJSONFile(file);
    var normalized = normalizeSiteData(data);
    siteSettings = normalized.siteSettings;
    navigation = normalized.navigation;
    methods = normalized.methods;
    projects = normalized.projects;
    writeStorage();
    await refreshData();
    renderAll();
    event.target.value = "";
    showAdminStamp("site-data.json 已导入为本机草稿");
  }

  function initSectionObserver() {
    var links = qsa("[data-nav-link]");
    var sections = qsa(".section-observe");
    if (!("IntersectionObserver" in window)) {
      sections.forEach(function (section) { section.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
        if (entry.isIntersecting) {
          var id = "#" + entry.target.id;
          entry.target.classList.add("is-entering");
          window.setTimeout(function () {
            entry.target.classList.remove("is-entering");
          }, 900);
          if (document.body.classList.contains("is-threshold-jumping")) {
            triggerSectionEmbers(entry.target);
          }
          links.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        } else if (entry.boundingClientRect.top < 0) {
          entry.target.classList.add("is-passed");
        } else {
          entry.target.classList.remove("is-passed");
        }
      });
    }, { rootMargin: "-36% 0px -42% 0px", threshold: 0.02 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function triggerSectionEmbers(section) {
    if (reduceMotionQuery.matches) {
      return;
    }
    var rect = section.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("atelier:ember-burst", {
      detail: {
        x: Math.min(window.innerWidth - 80, Math.max(80, rect.left + rect.width * 0.62)),
        y: Math.max(80, Math.min(window.innerHeight - 80, rect.top + 80)),
        count: window.innerWidth < 700 ? 2 : 5
      }
    }));
  }

  function initWadangCursorStable() {
    var cursor = qs("#watangCursor");
    var dot = qs("#watangCursorDot");
    var pointerQuery = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : { matches: false };
    if (!cursor || !dot) {
      return;
    }

    var visualAssets = normalizeVisualAssets(state.settings && state.settings.visualAssets);
    var watangWebpUrl = new URL(visualAssets.watang.webp || "assets/images/watang.webp", window.location.href).href;
    var watangPngUrl = new URL(visualAssets.watang.pngFallback || "assets/watang/watang.png", window.location.href).href;
    var image = new Image();
    image.onload = function () {
      document.documentElement.style.setProperty("--watang-image", 'url("' + image.src + '")');
      document.documentElement.classList.add("watang-image-ready");
    };
    image.onerror = function () {
      if (image.src !== watangPngUrl) {
        image.src = watangPngUrl;
        return;
      }
      document.documentElement.classList.add("watang-image-fallback");
    };
    image.src = watangWebpUrl;

    if (!pointerQuery.matches) {
      document.documentElement.classList.add("watang-cursor-static");
      return;
    }

    document.body.classList.add("watang-cursor-enabled");
    var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var follower = { x: pointer.x, y: pointer.y };
    var lastX = pointer.x;
    var rotation = 0;
    var cursorVisible = false;
    var cursorTyping = false;
    var cursorHover = false;
    var raf = 0;

    function isFormTarget(target) {
      return Boolean(target && target.closest("input, textarea, select, option, label, .admin-form, .asset-uploader"));
    }

    function isInteractiveTarget(target) {
      return Boolean(target && target.closest("a, button, .project-card, .research-card, .method-card, .contact-panel, .admin-list-item, [role='button']"));
    }

    function render() {
      var eased = reduceMotionQuery.matches ? 1 : 0.18;
      follower.x += (pointer.x - follower.x) * eased;
      follower.y += (pointer.y - follower.y) * eased;
      if (reduceMotionQuery.matches) {
        rotation = 0;
      } else {
        rotation += Math.max(-5, Math.min(5, (pointer.x - lastX) * 0.08));
        rotation *= 0.86;
      }
      lastX = pointer.x;
      var scale = state.cursorDown ? 0.86 : cursorHover ? 1.14 : 1;
      cursor.style.transform = "translate3d(" + follower.x + "px, " + follower.y + "px, 0) translate(-50%, -50%) rotate(" + rotation.toFixed(2) + "deg) scale(" + scale + ")";
      dot.style.transform = "translate3d(" + pointer.x + "px, " + pointer.y + "px, 0) translate(-50%, -50%)";
      raf = requestAnimationFrame(render);
    }

    function setCursorTargetState(target) {
      var nextTyping = isFormTarget(target);
      var nextHover = isInteractiveTarget(target) && !nextTyping;
      if (nextTyping !== cursorTyping) {
        cursorTyping = nextTyping;
        document.body.classList.toggle("watang-cursor-typing", cursorTyping);
      }
      if (nextHover !== cursorHover) {
        cursorHover = nextHover;
        state.cursorHover = cursorHover;
        document.body.classList.toggle("watang-cursor-hover", cursorHover);
      }
    }

    document.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        document.body.classList.add("watang-cursor-visible");
      }
    }, { passive: true });

    document.addEventListener("pointerover", function (event) {
      setCursorTargetState(event.target);
    }, { passive: true });

    document.addEventListener("pointerdown", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }
      state.cursorDown = true;
      document.body.classList.add("watang-cursor-down");
    }, { passive: true });

    document.addEventListener("pointerup", function () {
      state.cursorDown = false;
      document.body.classList.remove("watang-cursor-down");
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      cursorVisible = false;
      document.body.classList.remove("watang-cursor-visible");
    });

    raf = requestAnimationFrame(render);
  }

  function initWatangCursor() {
    initWadangCursorStable();
  }

  function initEmberCanvas() {
    var reduceMotion = reduceMotionQuery.matches;
    var canvas = document.createElement("canvas");
    canvas.className = "ember-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var size = { width: 0, height: 0, dpr: 1 };
    var embers = [];
    var resizeTimer = 0;
    var lastScrollY = window.scrollY || 0;
    var ambientTimer = 0;

    function resize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        size.dpr = Math.min(window.devicePixelRatio || 1, 2);
        size.width = window.innerWidth;
        size.height = window.innerHeight;
        canvas.width = Math.floor(size.width * size.dpr);
        canvas.height = Math.floor(size.height * size.dpr);
        ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      }, 80);
    }

    function spawn(x, y, count, burst) {
      var mobile = window.innerWidth < 700;
      var finalCount = reduceMotion ? Math.min(2, count || 1) : Math.min(mobile ? 3 : 8, count || 1);
      for (var i = 0; i < finalCount; i += 1) {
        embers.push({
          x: x + (Math.random() - 0.5) * 70,
          y: y + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.46) * (burst ? 0.9 : 0.35),
          vy: (burst ? 1.1 : 0.45) + Math.random() * 0.8,
          curve: (Math.random() - 0.5) * 0.012,
          life: 0,
          maxLife: burst ? 90 + Math.random() * 42 : 150 + Math.random() * 80,
          r: burst ? 1.4 + Math.random() * 1.4 : 0.8 + Math.random() * 1.1,
          trail: []
        });
      }
    }

    function draw(time) {
      var currentY = window.scrollY || 0;
      state.scrollDirection = currentY >= lastScrollY ? 1 : -1;
      lastScrollY = currentY;
      ctx.clearRect(0, 0, size.width, size.height);
      ambientTimer += 1;
      if (ambientTimer > (reduceMotion ? 180 : window.innerWidth < 700 ? 150 : 92)) {
        ambientTimer = 0;
        spawn(size.width * (0.48 + Math.random() * 0.18), size.height * 0.72, 1, false);
      }
      embers = embers.filter(function (ember) {
        ember.life += 1;
        ember.vx += ember.curve;
        ember.x += ember.vx + Math.sin((ember.life + time * 0.01) * 0.04) * 0.16;
        ember.y += ember.vy + Math.max(0, state.scrollDirection) * 0.12;
        ember.trail.push({ x: ember.x, y: ember.y });
        if (ember.trail.length > 14) {
          ember.trail.shift();
        }
        var alpha = Math.max(0, 1 - ember.life / ember.maxLife);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var i = 1; i < ember.trail.length; i += 1) {
          var a = (i / ember.trail.length) * alpha * 0.26;
          ctx.strokeStyle = "rgba(242, 140, 56, " + a + ")";
          ctx.lineWidth = ember.r * (i / ember.trail.length);
          ctx.beginPath();
          ctx.moveTo(ember.trail[i - 1].x, ember.trail[i - 1].y);
          ctx.lineTo(ember.trail[i].x, ember.trail[i].y);
          ctx.stroke();
        }
        var glow = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.r * 8);
        glow.addColorStop(0, "rgba(255, 180, 92, " + alpha * 0.72 + ")");
        glow.addColorStop(0.38, "rgba(242, 140, 56, " + alpha * 0.22 + ")");
        glow.addColorStop(1, "rgba(242, 140, 56, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.r * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return ember.life < ember.maxLife && ember.y < size.height + 80;
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("atelier:ember-burst", function (event) {
      var detail = event.detail || {};
      spawn(detail.x || size.width * 0.62, detail.y || size.height * 0.3, detail.count || 4, true);
    });
    resize();
    requestAnimationFrame(draw);
  }

  function initHeroStageStable() {
    var hero = qs("#home.hero");
    var stage = hero ? qs(".hero-depth-stage", hero) : null;

    if (!hero || !stage) {
      return;
    }

    if (hero.dataset.heroStageSourceOptimizedBound === "true") {
      return;
    }
    hero.dataset.heroStageSourceOptimizedBound = "true";

    var rect = null;
    var raf = 0;
    var imageReadyTimer = 0;

    var target = {
      x: 0,
      y: 0,
      lightX: 44,
      lightY: 48,
      strength: 0.50
    };

    var current = {
      x: 0,
      y: 0,
      lightX: 44,
      lightY: 48,
      strength: 0.50
    };

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function updateRect() {
      rect = hero.getBoundingClientRect();
    }

    function applyVars() {
      hero.style.setProperty("--hero-x", current.x.toFixed(4));
      hero.style.setProperty("--hero-y", current.y.toFixed(4));
      hero.style.setProperty("--light-x", current.lightX.toFixed(2) + "%");
      hero.style.setProperty("--light-y", current.lightY.toFixed(2) + "%");
      hero.style.setProperty("--light-strength", current.strength.toFixed(4));
    }

    function markAssetsReady() {
      window.clearTimeout(imageReadyTimer);
      hero.classList.add("hero-assets-ready");
    }

    function decodeImage(src) {
      return new Promise(function (resolve) {
        var image = new Image();
        image.onload = function () {
          if (image.decode) {
            image.decode().then(resolve).catch(resolve);
            return;
          }
          resolve();
        };
        image.onerror = resolve;
        image.src = src;
      });
    }

    function preloadHeroAssets() {
      var sources = [
        "assets/hero-depth/optimized/hero-mountain-2560.webp",
        "assets/hero-depth/optimized/hero-window-frame-2560.webp",
        "assets/hero-depth/optimized/hero-lady-2560.webp",
        "assets/hero-depth/optimized/hero-vignette-2560.webp"
      ];

      imageReadyTimer = window.setTimeout(markAssetsReady, 1200);
      Promise.all(sources.map(decodeImage)).then(markAssetsReady).catch(markAssetsReady);
    }

    function setCenter() {
      target.x = 0;
      target.y = 0;
      target.lightX = 44;
      target.lightY = 48;
      target.strength = 0.50;
    }

    function needsFrame() {
      return Math.abs(target.x - current.x) > 0.001 ||
        Math.abs(target.y - current.y) > 0.001 ||
        Math.abs(target.lightX - current.lightX) > 0.035 ||
        Math.abs(target.lightY - current.lightY) > 0.035 ||
        Math.abs(target.strength - current.strength) > 0.002;
    }

    function renderFrame() {
      raf = 0;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.lightX += (target.lightX - current.lightX) * 0.14;
      current.lightY += (target.lightY - current.lightY) * 0.14;
      current.strength += (target.strength - current.strength) * 0.10;

      applyVars();

      if (needsFrame()) {
        requestRender();
      }
    }

    function requestRender() {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(renderFrame);
    }

    function updateTarget(clientX, clientY) {
      if (!rect || !rect.width || !rect.height) {
        updateRect();
      }

      if (!rect || !rect.width || !rect.height) {
        return;
      }

      var localX = clamp((clientX - rect.left) / rect.width, 0, 1);
      var localY = clamp((clientY - rect.top) / rect.height, 0, 1);

      target.x = (localX - 0.5) * 2;
      target.y = (localY - 0.5) * 2;
      target.lightX = clamp(localX * 100, 8, 92);
      target.lightY = clamp(localY * 100, 10, 88);
      target.strength = 0.68;

      requestRender();
    }

    function handlePointerMove(event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }
      updateTarget(event.clientX, event.clientY);
    }

    function handleMouseMove(event) {
      updateTarget(event.clientX, event.clientY);
    }

    updateRect();
    applyVars();
    preloadHeroAssets();

    if ("PointerEvent" in window) {
      hero.addEventListener("pointerenter", function (event) {
        updateRect();
        if (!event.pointerType || event.pointerType === "mouse") {
          updateTarget(event.clientX, event.clientY);
        }
      }, { passive: true });

      hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    } else {
      hero.addEventListener("mouseenter", function (event) {
        updateRect();
        updateTarget(event.clientX, event.clientY);
      }, { passive: true });

      hero.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    hero.addEventListener("pointerleave", function () {
      setCenter();
      requestRender();
    }, { passive: true });

    hero.addEventListener("mouseleave", function () {
      setCenter();
      requestRender();
    }, { passive: true });

    window.addEventListener("resize", function () {
      updateRect();
    }, { passive: true });

    window.addEventListener("scroll", function () {
      updateRect();
    }, { passive: true });
  }

  function initHeroDepthStage() {
    initHeroStageStable();
  }

  function initHeroCanvas() {
    // Layered hero stage owns the only active homepage animation loop.
    return;
    var canvas = qs("#heroCanvas");
    if (!canvas) {
      return;
    }
    var ctx = canvas.getContext("2d");
    var hero = qs("#home");
    var reduceMotion = reduceMotionQuery.matches;
    var size = { width: 0, height: 0, dpr: 1 };
    var stars = [];
    var mouse = { x: 0, y: 0 };
    var heroRect = null;
    var heroRectDirty = true;
    var resizeTimer = 0;
    var canvasRaf = 0;
    var isVisible = true;

    function resize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        size.dpr = Math.min(window.devicePixelRatio || 1, 2);
        size.width = canvas.clientWidth;
        size.height = canvas.clientHeight;
        canvas.width = Math.floor(size.width * size.dpr);
        canvas.height = Math.floor(size.height * size.dpr);
        ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
        heroRectDirty = true;
        createStars();
        if (reduceMotion) {
          draw(performance.now());
        } else {
          requestCanvasFrame();
        }
      }, 70);
    }

    function createStars() {
      var mobile = window.innerWidth < 700;
      var count = reduceMotion ? 34 : mobile ? 62 : 118;
      stars = [];
      for (var i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * size.width,
          y: Math.random() * size.height * 0.68,
          r: Math.random() * 1.25 + 0.25,
          a: Math.random() * 0.5 + 0.16,
          p: Math.random() * Math.PI * 2,
          s: Math.random() * 0.0015 + 0.0004
        });
      }
    }

    function requestCanvasFrame() {
      if (reduceMotion || !isVisible || canvasRaf) {
        return;
      }
      canvasRaf = requestAnimationFrame(draw);
    }

    function draw(time) {
      canvasRaf = 0;
      if (!reduceMotion && !isVisible) {
        return;
      }
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.width, size.height);
      drawSky();
      drawStars(time);
      drawAurora(time);
      drawHorizon(time);
      drawAxis(time);
      drawEaveLine(time);
      if (!reduceMotion) {
        requestCanvasFrame();
      }
    }

    function drawSky() {
      var gradient = ctx.createLinearGradient(0, 0, 0, size.height);
      gradient.addColorStop(0, "#030405");
      gradient.addColorStop(0.42, "#07100e");
      gradient.addColorStop(0.76, "#10201d");
      gradient.addColorStop(1, "#050708");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size.width, size.height);
    }

    function drawStars(time) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      stars.forEach(function (star) {
        var flicker = reduceMotion ? 0.7 : 0.55 + Math.sin(time * star.s + star.p) * 0.35;
        ctx.globalAlpha = star.a * flicker;
        ctx.fillStyle = "#d8eee8";
        ctx.beginPath();
        ctx.arc(star.x + mouse.x * 8, star.y + mouse.y * 5, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawAurora(time) {
      var t = reduceMotion ? 0 : time * 0.00018;
      var centerX = size.width / 2 + mouse.x * 24 + Math.sin(t) * 18;
      var baseY = size.height * 0.96 + mouse.y * 18;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < 4; i += 1) {
        var alpha = 0.22 - i * 0.034;
        var rx = size.width * (0.42 + i * 0.11);
        var ry = size.height * (0.48 + i * 0.07);
        ctx.beginPath();
        ctx.ellipse(centerX, baseY + i * 10, rx, ry, 0, Math.PI + 0.12, Math.PI * 2 - 0.12);
        ctx.strokeStyle = "rgba(142, 167, 160, " + alpha + ")";
        ctx.lineWidth = 2.4 + i * 1.4;
        ctx.shadowColor = "rgba(83, 106, 99, 0.65)";
        ctx.shadowBlur = 26 + i * 12;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(centerX + Math.sin(t * 1.7) * 35, baseY - 18, size.width * 0.54, size.height * 0.52, 0, Math.PI + 0.04, Math.PI * 1.96);
      ctx.strokeStyle = "rgba(215, 230, 107, 0.035)";
      ctx.lineWidth = 8;
      ctx.shadowBlur = 34;
      ctx.stroke();
      ctx.restore();
    }

    function drawHorizon(time) {
      var y = size.height * 0.72;
      var glow = ctx.createRadialGradient(size.width / 2, y + 40, 20, size.width / 2, y + 40, size.width * 0.52);
      glow.addColorStop(0, "rgba(255, 180, 92, 0.26)");
      glow.addColorStop(0.18, "rgba(242, 140, 56, 0.2)");
      glow.addColorStop(0.34, "rgba(83, 106, 99, 0.18)");
      glow.addColorStop(1, "rgba(5, 7, 8, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, y - 160, size.width, 280);

      ctx.fillStyle = "rgba(5, 7, 8, 0.62)";
      ctx.beginPath();
      ctx.moveTo(0, size.height);
      ctx.lineTo(0, y + 76);
      ctx.lineTo(size.width * 0.12, y + 28);
      ctx.lineTo(size.width * 0.25, y + 54);
      ctx.lineTo(size.width * 0.44, y + 8);
      ctx.lineTo(size.width * 0.58, y + 38);
      ctx.lineTo(size.width * 0.76, y + 10);
      ctx.lineTo(size.width, y + 64);
      ctx.lineTo(size.width, size.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(176, 138, 84, 0.34)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size.width * 0.2, y + 78);
      ctx.lineTo(size.width * 0.8, y + 78);
      ctx.stroke();

      ctx.strokeStyle = "rgba(242, 140, 56, 0.24)";
      ctx.shadowColor = "rgba(242, 140, 56, 0.42)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(size.width * 0.34, y + 48);
      ctx.bezierCurveTo(size.width * 0.44, y + 35, size.width * 0.58, y + 34, size.width * 0.68, y + 48);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawAxis(time) {
      var x = size.width / 2 + mouse.x * 12;
      var y = size.height * 0.72 + mouse.y * 8;
      ctx.save();
      ctx.strokeStyle = "rgba(142, 167, 160, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, size.height * 0.16);
      ctx.lineTo(x, size.height * 0.9);
      ctx.stroke();
      for (var i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(size.width * (0.22 + i * 0.08), y + i * 16);
        ctx.lineTo(size.width * (0.78 - i * 0.08), y + i * 16);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawEaveLine(time) {
      var y = size.height * 0.63 + mouse.y * 6;
      var left = size.width * 0.22;
      var right = size.width * 0.78;
      ctx.save();
      ctx.strokeStyle = "rgba(243, 238, 227, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, y + 26);
      ctx.lineTo(size.width * 0.36, y + 8);
      ctx.lineTo(size.width * 0.5, y - 20);
      ctx.lineTo(size.width * 0.64, y + 8);
      ctx.lineTo(right, y + 26);
      ctx.stroke();
      ctx.strokeStyle = "rgba(163, 58, 46, 0.22)";
      ctx.beginPath();
      ctx.moveTo(size.width * 0.42, y + 36);
      ctx.lineTo(size.width * 0.58, y + 36);
      ctx.stroke();
      ctx.restore();
    }

    window.addEventListener("resize", resize);
    if (hero) {
      function markHeroRectDirty() {
        heroRectDirty = true;
      }

      function getHeroRect() {
        if (heroRectDirty || !heroRect) {
          heroRect = hero.getBoundingClientRect();
          heroRectDirty = false;
        }
        return heroRect;
      }

      hero.addEventListener("mousemove", function (event) {
        var rect = getHeroRect();
        if (!rect.width || !rect.height) {
          return;
        }
        mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      }, { passive: true });
      hero.addEventListener("mouseleave", function () {
        mouse.x = 0;
        mouse.y = 0;
      });
      window.addEventListener("scroll", markHeroRectDirty, { passive: true });
      window.addEventListener("resize", markHeroRectDirty, { passive: true });
      if ("IntersectionObserver" in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          isVisible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio > 0.04);
          if (isVisible) {
            requestCanvasFrame();
          } else if (canvasRaf) {
            cancelAnimationFrame(canvasRaf);
            canvasRaf = 0;
          }
        }, { threshold: [0, 0.04, 0.2] });
        observer.observe(hero);
      }
    }
    resize();
    if (!reduceMotion) {
      requestCanvasFrame();
    }
  }
})();
