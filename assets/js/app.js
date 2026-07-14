// CACHE_BUST_VERSION: 20260714103453
(function () {
  "use strict";

  var PUBLIC_SECTIONS = [
    { id: "home", labelCN: "首页", labelEN: "Home" },
    { id: "featured", labelCN: "精选作品", labelEN: "Featured" },
    { id: "works", labelCN: "作品总览", labelEN: "Works" },
    { id: "architecture", labelCN: "建筑", labelEN: "Architecture" },
    { id: "objects", labelCN: "器物", labelEN: "Objects" },
    { id: "research", labelCN: "研究", labelEN: "Research" },
    { id: "contact", labelCN: "联系", labelEN: "Contact" }
  ];

  var ASSET_DB_NAME = "NorthernAtelierAssetDB";
  var ASSET_DB_VERSION = 1;
  var ASSET_STORE = "assets";
  var ASSET_ID_PREFIX = "asset_";
  var SITE_DATA_URL = "assets/data/site-data.json";

  function withCacheBust(url) {
    var separator = url.indexOf("?") === -1 ? "?" : "&";
    return url + separator + "v=" + Date.now();
  }

  function isFileProtocolPreview() {
    return typeof window !== "undefined" && window.location && window.location.protocol === "file:";
  }

  function readURLParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams("");
    }
  }

  function shouldForceOfficialData() {
    var params = readURLParams();
    return params.has("fresh") ||
      params.has("official") ||
      params.get("source") === "official";
  }

  function shouldClearDraftData() {
    var params = readURLParams();
    return params.get("clearDraft") === "1";
  }

  function shouldUseDraftData() {
    var params = readURLParams();
    return params.has("draft") ||
      params.get("draft") === "1" ||
      params.get("source") === "local" ||
      params.get("source") === "draft";
  }

  var ADMIN_HASH_ROUTE = "#atelier-console";
  var ADMIN_SESSION_KEY = "northernAtelier.adminSession.v1";
  var ADMIN_PASSWORD_HASH = "62a58a23ca12cfdf3350eb9e7b5b2430b32ce49a94704cebfa248e948f343c14";

  var FALLBACK_SITE_DATA = {
    siteSettings: {
      studioName: "站点数据未读取",
      studioSeal: "DATA",
      taglineCN: "site-data.json 未读取成功。",
      taglineEN: "Site data was not loaded.",
      intro: "当前显示的是诊断占位内容，不是正式网站内容。请检查 assets/data/site-data.json，或在后台导入完整 site-data.json。",
      accentColor: "#536A63",
      hero: createDefaultHeroContent(),
      sections: createDefaultSectionContent(),
      contact: createDefaultContactContent(),
      footer: createDefaultFooterContent(),
      visualAssets: createDefaultVisualAssets(),
      sectionBackgrounds: createDefaultSectionBackgrounds()
    },
    navigation: [
      { labelCN: "数据检查", labelEN: "Data Check", href: "#atelier-console" }
    ],
    methods: [],
    projects: [],
    researchArticles: []
  }

  var siteSettings = {
    studioName: "营造设计工作室",
    studioSeal: "营造",
    taglineCN: "内容正在从正式数据文件加载。",
    taglineEN: "Loading official site data.",
    intro: "请维护 assets/data/site-data.json 作为线上正式内容来源。",
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
    { labelCN: "联系", labelEN: "Contact", href: "#contact" }
  ];

  var projects = [];
  var researchArticles = [];
  var activePanoramaViewer = null;
  var mobilePageLocks = {};
  var mobilePageScrollY = 0;
  var mobileViewportTimer = 0;

  var state = {
    settings: null,
    navigation: [],
    projects: [],
    researchArticles: [],
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
    adminAuthPending: false,
    adminDirtyPanels: {},
    adminSavedSections: {},
    articleEditorDrafts: {},
    activeResearchEditorId: "",
    activeResearchId: "",
    researchReturnHash: "",
    researchEditorDrafts: {}
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
    draftSavedAt: "northernAtelier.localDraftSavedAt.v1",
    sectionStatus: "northernAtelier.adminSectionStatus.v1",
    research: "northernAtelier.researchArticles.v1"
  };
  var defaultSiteSettings = clone(siteSettings);
  var defaultProjects = clone(projects);
  var defaultResearchArticles = clone(researchArticles);
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
      sealSuffix: "DATA SOURCE",
      primaryAction: {
        labelCN: "检查数据",
        labelEN: "Check Data",
        href: "#atelier-console"
      },
      secondaryAction: {
        labelCN: "导入 JSON",
        labelEN: "Import JSON",
        href: "#atelier-console"
      },
      indexLinks: [
        { no: "01", label: "JSON", href: "#atelier-console" },
        { no: "02", label: "DATA", href: "#atelier-console" },
        { no: "03", label: "CHECK", href: "#atelier-console" }
      ],
      bottomStrip: ["SITE-DATA.JSON", "OFFICIAL SOURCE", "NO OLD FALLBACK", "CHECK DATA"]
    };
  }

  function createDefaultSectionContent() {
    return {
      featured: {
        eyebrow: "FEATURED / 数据状态",
        title: "正式内容正在等待 site-data.json。",
        description: "这里不会再显示旧版默认内容；请检查正式 JSON 是否读取成功。"
      },
      works: {
        eyebrow: "WORKS / 项目数据",
        title: "项目卡片由 assets/data/site-data.json 渲染。",
        description: "如果项目为空或 JSON 读取失败，会显示明确占位，不会回到旧版内容。"
      },
      architecture: {
        eyebrow: "ARCHITECTURE / 分类数据",
        title: "分类内容等待正式项目数据。",
        description: "请在 site-data.json 的 projects 数组中维护项目类别。"
      },
      objects: {
        eyebrow: "OBJECTS / 分类数据",
        title: "器物分类等待正式项目数据。",
        description: "请在 site-data.json 中维护项目内容与素材路径。"
      },
      research: {
        eyebrow: "RESEARCH / 研究数据",
        title: "研究内容等待正式数据。",
        description: "研究板块后续使用独立文章数据，不再依赖营造板块。"
      },
      contact: {
        eyebrow: "CONTACT / 联系信息",
        title: "点击键位，复制对应的联系方式。",
        description: "邮箱、小红书、公众号与 VX 的具体内容不会直接显示在页面上。"
      }
    };
  }

  function createDefaultContactContent() {
    return {
      email: "",
      xiaohongshu: "",
      officialAccount: "",
      vx: ""
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
    var secondary = normalizeAction(source.secondaryAction, defaults.secondaryAction);
    if (secondary.href === "#studio" || secondary.href === "studio") {
      secondary = { labelCN: "", labelEN: "", href: "" };
    }
    return {
      sealSuffix: String(source.sealSuffix || defaults.sealSuffix),
      primaryAction: normalizeAction(source.primaryAction, defaults.primaryAction),
      secondaryAction: secondary,
      indexLinks: indexLinks.map(function (item, index) {
        var fallback = defaultIndexLinks[index] || {};
        return {
          no: String(item.no || fallback.no || padNumber(index)),
          label: String(item.label || fallback.label || ""),
          href: String(item.href || fallback.href || "#")
        };
      }).filter(function (item) {
        return item.href !== "#studio" && item.href !== "studio";
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
    return normalized;
  }

  function normalizeContactContent(input, legacySettings) {
    var defaults = createDefaultContactContent();
    var source = input || {};
    var legacy = legacySettings || {};
    var legacyLinks = Array.isArray(source.socialLinks) ? source.socialLinks : [];

    function legacySocialValue(pattern) {
      var match = legacyLinks.find(function (link) {
        var haystack = [link && link.label, link && link.text].join(" ").toLowerCase();
        return pattern.test(haystack);
      });
      if (!match) {
        return "";
      }
      var value = String(match.value || match.account || match.href || "").trim();
      return value === "#" ? "" : value;
    }

    return {
      email: String(source.email || legacy.email || defaults.email || "").trim(),
      xiaohongshu: String(source.xiaohongshu || source.red || legacy.xiaohongshu || legacy.red || legacySocialValue(/xiaohongshu|小红书|\bred\b/) || defaults.xiaohongshu || "").trim(),
      officialAccount: String(source.officialAccount || source.wechatOfficial || source.official || legacy.officialAccount || legacy.wechatOfficial || defaults.officialAccount || "").trim(),
      vx: String(source.vx || source.wechat || legacy.vx || legacy.wechat || defaults.vx || "").trim()
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
    merged.contact = normalizeContactContent(incoming.contact || merged.contact, Object.assign({}, merged, incoming));
    merged.footer = normalizeFooterContent(incoming.footer || merged.footer);
    merged.visualAssets = normalizeVisualAssets(incoming.visualAssets || merged.visualAssets);
    merged.sectionBackgrounds = normalizeSectionBackgrounds(incoming.sectionBackgrounds || merged.sectionBackgrounds);

    delete merged.email;
    delete merged.portfolioPdf;
    delete merged.xiaohongshu;
    delete merged.red;
    delete merged.officialAccount;
    delete merged.wechatOfficial;
    delete merged.vx;
    delete merged.wechat;
    delete merged.philosophy;
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

  function isMeaningfulArticleBlock(block) {
    var current = normalizeArticleBlocks([block])[0];
    if (!current) {
      return false;
    }
    if (current.type === "divider") {
      return true;
    }
    if (current.type === "heading" || current.type === "paragraph" || current.type === "quote") {
      return Boolean(String(current.text || "").trim());
    }
    if (current.type === "image") {
      return Boolean(current.asset);
    }
    if (current.type === "gallery") {
      return parseList(current.assets).length > 0;
    }
    return false;
  }

  function sanitizeArticleBlocks(blocks) {
    return normalizeArticleBlocks(blocks).filter(isMeaningfulArticleBlock);
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

  var PROJECT_DISPLAY_SECTIONS = ["featured", "works", "architecture", "objects"];
  var PROJECT_DISPLAY_SECTION_LABELS = {
    featured: "精选作品",
    works: "全部作品",
    architecture: "建筑",
    objects: "物件"
  };

  function normalizeProjectDisplaySections(value) {
    var source = Array.isArray(value) ? value : parseList(value);
    var normalized = PROJECT_DISPLAY_SECTIONS.filter(function (section) {
      return source.indexOf(section) !== -1;
    });
    if (source.indexOf("research") !== -1 && normalized.indexOf("works") === -1) {
      normalized.push("works");
    }
    return normalized;
  }

  function deriveLegacyProjectDisplaySections(project) {
    var current = project || {};
    var sections = [];
    if (current.featured) {
      sections.push("featured");
    }
    sections.push("works");
    if (current.category === "Architecture") {
      sections.push("architecture");
    }
    if (current.category === "Objects") {
      sections.push("objects");
    }
    return normalizeProjectDisplaySections(sections);
  }

  function isProjectVisible(project) {
    if (!project) {
      return false;
    }
    if (Object.prototype.hasOwnProperty.call(project, "visible")) {
      return project.visible !== false;
    }
    return project.published !== false;
  }

  function isResearchArticleVisible(article) {
    if (!article) {
      return false;
    }
    if (Object.prototype.hasOwnProperty.call(article, "visible")) {
      return article.visible !== false;
    }
    return article.published !== false;
  }

  function projectAppearsIn(project, section) {
    if (!isProjectVisible(project)) {
      return false;
    }
    return normalizeProjectDisplaySections(project.displaySections).indexOf(section) !== -1;
  }

  function readProjectDisplaySections(form) {
    if (!form) {
      return [];
    }
    return qsa('input[name="displaySections"]:checked', form).map(function (input) {
      return input.value;
    }).filter(function (section) {
      return PROJECT_DISPLAY_SECTIONS.indexOf(section) !== -1;
    });
  }

  function formatProjectDisplaySections(project) {
    return normalizeProjectDisplaySections(project && project.displaySections).map(function (section) {
      return PROJECT_DISPLAY_SECTION_LABELS[section] || section;
    });
  }

  function normalizeProject(project) {
    var source = project || {};
    var hasExplicitDisplaySections = Object.prototype.hasOwnProperty.call(source, "displaySections");
    var hasExplicitVisible = Object.prototype.hasOwnProperty.call(source, "visible");
    var hasLegacyPublished = Object.prototype.hasOwnProperty.call(source, "published");
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
      displaySections: ["works"],
      featured: false,
      visible: true
    };
    var next = Object.assign({}, base, source);
    next.tags = parseTags(next.tags);
    next.gallery = parseList(next.gallery);
    next.drawings = parseList(next.drawings);
    next.attachments = normalizeAttachments(next.attachments);
    next.articleBlocks = sanitizeArticleBlocks(next.articleBlocks);
    next.displaySections = hasExplicitDisplaySections
      ? normalizeProjectDisplaySections(source.displaySections)
      : deriveLegacyProjectDisplaySections(next);
    next.featured = next.displaySections.indexOf("featured") !== -1;
    next.visible = hasExplicitVisible ? Boolean(source.visible) : (hasLegacyPublished ? Boolean(source.published) : true);
    delete next.published;
    return next;
  }


  function normalizeResearchNumber(value, index) {
    var text = String(value || "").trim().toUpperCase();
    if (/^R-?\d+$/.test(text)) {
      var digits = text.replace(/\D/g, "");
      return "R-" + String(parseInt(digits, 10) || index + 1).padStart(3, "0");
    }
    return text || ("R-" + String(index + 1).padStart(3, "0"));
  }

  function normalizeResearchArticle(article, index) {
    var source = article || {};
    var fallbackIndex = Number.isFinite(index) ? index : 0;
    var hasExplicitVisible = Object.prototype.hasOwnProperty.call(source, "visible");
    var hasLegacyPublished = Object.prototype.hasOwnProperty.call(source, "published");
    return {
      id: String(source.id || ("r" + Date.now() + Math.random().toString(36).slice(2, 6))),
      number: normalizeResearchNumber(source.number || source.no, fallbackIndex),
      titleCN: String(source.titleCN || "未命名研究").trim(),
      titleEN: String(source.titleEN || "").trim(),
      topic: String(source.topic || source.category || "Research Note").trim(),
      date: String(source.date || source.year || "").trim(),
      author: String(source.author || "SOVEN Research").trim(),
      readTime: String(source.readTime || "").trim(),
      summary: String(source.summary || source.description || "").trim(),
      coverImage: normalizeAssetReference(source.coverImage || ""),
      tags: parseTags(source.tags),
      articleBlocks: sanitizeArticleBlocks(source.articleBlocks),
      featured: Boolean(source.featured),
      visible: hasExplicitVisible ? Boolean(source.visible) : (hasLegacyPublished ? Boolean(source.published) : true),
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : fallbackIndex
    };
  }

  function normalizeResearchArticles(items) {
    var list = Array.isArray(items) ? items : [];
    return list.map(function (item, index) {
      return normalizeResearchArticle(item, index);
    }).sort(function (a, b) {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return String(a.number).localeCompare(String(b.number));
    });
  }

  function nextResearchNumber() {
    var max = researchArticles.reduce(function (value, item) {
      var digits = parseInt(String(item.number || "").replace(/\D/g, ""), 10);
      return Number.isFinite(digits) ? Math.max(value, digits) : value;
    }, 0);
    return "R-" + String(max + 1).padStart(3, "0");
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
      return Boolean(
        localStorage.getItem(STORAGE_KEYS.settings) ||
        localStorage.getItem(STORAGE_KEYS.projects) ||
        localStorage.getItem(STORAGE_KEYS.navigation) ||
        localStorage.getItem(STORAGE_KEYS.research)
      );
    } catch (error) {
      return false;
    }
  }

  function updateLocalDraftState() {
    state.hasLocalDraft = localDraftExists();
  }

  var ADMIN_PANEL_LABELS = {
    projects: "项目案卷",
    settings: "首页与联系",
    assets: "素材路径",
    backgrounds: "板块背景",
    article: "项目文章",
    research: "研究文章",
    pathCheck: "路径检查"
  };

  function readAdminSectionStatus() {
    try {
      if (typeof localStorage === "undefined") {
        return {};
      }
      var raw = localStorage.getItem(STORAGE_KEYS.sectionStatus);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function writeAdminSectionStatus() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.sectionStatus, JSON.stringify(state.adminSavedSections || {}));
      }
    } catch (error) {
      console.warn("Section save status could not be persisted.", error);
    }
  }

  function activeAdminPanelName() {
    var active = qs("[data-admin-panel].is-active");
    return active ? active.getAttribute("data-admin-panel") : "projects";
  }

  function markAdminPanelDirty(panelName) {
    var name = panelName || activeAdminPanelName();
    if (!name || name === "pathCheck") {
      return;
    }
    state.adminDirtyPanels[name] = true;
    renderAdminSectionSaveState();
  }

  function markAdminPanelSaved(panelName, label) {
    var name = panelName || activeAdminPanelName();
    delete state.adminDirtyPanels[name];
    state.adminSavedSections[name] = {
      label: label || ADMIN_PANEL_LABELS[name] || name,
      savedAt: new Date().toISOString()
    };
    writeAdminSectionStatus();
    renderAdminSectionSaveState();
  }

  function dirtyAdminPanelNames() {
    return Object.keys(state.adminDirtyPanels || {}).filter(function (name) {
      return Boolean(state.adminDirtyPanels[name]);
    });
  }

  function renderAdminSectionSaveState() {
    var panelName = activeAdminPanelName();
    var currentLabel = qs("#adminCurrentSectionLabel");
    var summary = qs("#adminDraftSummary");
    var saveButton = qs("#saveCurrentAdminPanelButton");
    var label = ADMIN_PANEL_LABELS[panelName] || panelName;

    if (currentLabel) {
      currentLabel.textContent = "当前板块：" + label + (state.adminDirtyPanels[panelName] ? " · 有未保存修改" : " · 已同步");
    }

    if (summary) {
      var saved = Object.keys(state.adminSavedSections || {}).map(function (name) {
        var item = state.adminSavedSections[name] || {};
        var time = item.savedAt ? new Date(item.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
        return (item.label || ADMIN_PANEL_LABELS[name] || name) + (time ? " " + time : "");
      });
      summary.textContent = saved.length
        ? "本机已暂存：" + saved.join("；") + "。导出完整 JSON 时会合并全部已保存板块。"
        : "尚未暂存板块。请在每个板块完成编辑后点击保存。";
    }

    if (saveButton) {
      saveButton.disabled = panelName === "pathCheck";
      saveButton.classList.toggle("is-dirty", Boolean(state.adminDirtyPanels[panelName]));
    }
  }

  async function saveCurrentAdminPanel() {
    var panelName = activeAdminPanelName();
    if (panelName === "projects") {
      var projectForm = qs("#projectForm");
      if (projectForm) {
        if (typeof projectForm.requestSubmit === "function") { projectForm.requestSubmit(); }
        else { projectForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }
      }
      return;
    }
    if (panelName === "settings") {
      var settingsForm = qs("#settingsForm");
      if (settingsForm) {
        if (typeof settingsForm.requestSubmit === "function") { settingsForm.requestSubmit(); }
        else { settingsForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }
      }
      return;
    }
    if (panelName === "assets") { await saveAssetPathsFromManager(); return; }
    if (panelName === "backgrounds") { await saveSectionBackgroundFromForm(); return; }
    if (panelName === "article") { await saveArticleBlocksFromEditor(); return; }
    if (panelName === "research") { await saveResearchArticle(); return; }
    showAdminStamp("当前板块无需保存");
  }

  function bindAdminDirtyTracking() {
    var consolePanel = qs("#adminConsole");
    if (!consolePanel || consolePanel.dataset.dirtyTrackingBound === "true") {
      return;
    }
    consolePanel.dataset.dirtyTrackingBound = "true";
    var navigationOnlyControls = {
      researchArticleSelect: true,
      articleProjectSelect: true,
      assetProject: true,
      sectionBgTarget: true
    };
    ["input", "change"].forEach(function (eventName) {
      consolePanel.addEventListener(eventName, function (event) {
        var control = event.target;
        if (!control || !control.closest) {
          return;
        }
        var panel = control.closest("[data-admin-panel]");
        if (!panel || control.type === "file" || navigationOnlyControls[control.id]) {
          return;
        }
        markAdminPanelDirty(panel.getAttribute("data-admin-panel"));
      });
    });
  }

  function writeStorage() {
    try {
      if (typeof localStorage === "undefined") {
        return;
      }
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(siteSettings));
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEYS.navigation, JSON.stringify(navigation));
      localStorage.setItem(STORAGE_KEYS.research, JSON.stringify(researchArticles));
      localStorage.removeItem(STORAGE_KEYS.methods);
      localStorage.setItem(STORAGE_KEYS.draftSavedAt, new Date().toISOString());
      state.dataSource = "local";
      updateLocalDraftState();
    } catch (error) {
      console.warn("Draft data could not be persisted.", error);
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
    }).filter(function (item) {
      return item.href !== "#studio" && item.href !== "studio";
    });
  }

  function normalizeMethods(items) {
    return [];
  }


  function isPlainSettingsData(data) {
    var incoming = data || {};
    return !incoming.siteSettings &&
      !incoming.projects &&
      !incoming.navigation &&
      !incoming.methods &&
      (
        Object.prototype.hasOwnProperty.call(incoming, "studioName") ||
        Object.prototype.hasOwnProperty.call(incoming, "studioSeal") ||
        Object.prototype.hasOwnProperty.call(incoming, "taglineCN") ||
        Object.prototype.hasOwnProperty.call(incoming, "visualAssets") ||
        Object.prototype.hasOwnProperty.call(incoming, "sectionBackgrounds") ||
        Object.prototype.hasOwnProperty.call(incoming, "sections")
      );
  }

  function warnPlainSettingsData(data, source) {
    if (source === "official" && isPlainSettingsData(data) && typeof console !== "undefined" && console.warn) {
      console.warn("当前 assets/data/site-data.json 看起来是设置 JSON，而不是完整站点数据。页面会保留现有项目数据，但正式发布建议使用“导出完整站点数据 site-data.json”。");
    }
  }

  function normalizeSiteData(data) {
    var incoming = data || {};
    var settingsSource = incoming.siteSettings || incoming.settings || (isPlainSettingsData(incoming) ? incoming : {});
    return {
      siteSettings: normalizeSiteSettings(settingsSource),
      navigation: Array.isArray(incoming.navigation) ? normalizeNavigation(incoming.navigation) : normalizeNavigation([]),
      methods: [],
      projects: Array.isArray(incoming.projects) ? incoming.projects.map(normalizeProject) : [],
      researchArticles: normalizeResearchArticles(incoming.researchArticles)
    };
  }

  function applySiteData(data, source) {
    warnPlainSettingsData(data, source);
    var normalized = normalizeSiteData(data);
    siteSettings = normalized.siteSettings;
    navigation = normalized.navigation;
    methods = [];
    projects = normalized.projects;
    researchArticles = normalized.researchArticles;
    state.dataSource = source || "official";
    updateLocalDraftState();
    if (state.dataSource === "official") {
      defaultSiteSettings = clone(siteSettings);
      defaultProjects = clone(projects);
      defaultResearchArticles = clone(researchArticles);
    }
  }

  function createEmergencyFallbackSiteData() {
    return clone(FALLBACK_SITE_DATA);
  }

  function getSiteDataURLCandidates() {
    var candidates = [];
    var basePath = "";
    try {
      basePath = window.location.pathname.replace(/\/[^\/]*$/, "/");
    } catch (error) {
      basePath = "/";
    }

    function add(url) {
      if (url && candidates.indexOf(url) === -1) {
        candidates.push(url);
      }
    }

    add(SITE_DATA_URL);
    add("./" + SITE_DATA_URL);

    try {
      add(new URL(SITE_DATA_URL, window.location.href).toString());
    } catch (error) {
      /* noop */
    }

    if (basePath) {
      add(basePath + SITE_DATA_URL);
    }

    if (window.location.hostname && window.location.hostname.indexOf("github.io") !== -1) {
      var parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length) {
        add("/" + parts[0] + "/" + SITE_DATA_URL);
      }
    }

    return candidates;
  }

  async function fetchSiteDataCandidate(url) {
    var response = await fetch(withCacheBust(url), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    var text = await response.text();
    if (!text || !text.trim()) {
      throw new Error("empty JSON");
    }
    try {
      return JSON.parse(text.replace(/^\uFEFF/, ""));
    } catch (error) {
      throw new Error("JSON 格式错误：" + (error && error.message ? error.message : "未知错误"));
    }
  }

  function applySafeFallbackAfterDataFailure(message) {
    if (isFileProtocolPreview()) {
      message = "当前是 file:/// 本地直接打开模式，浏览器通常会禁止读取 assets/data/site-data.json。请用 GitHub Pages、VS Code Live Server，或在当前后台点击“导入 JSON”导入 site-data.json。原始错误：" + message;
    }

    state.dataLoadError = message;
    console.warn(message);

    /*
      V46 clean rule:
      JSON failure never falls back to old official-looking content.
      It uses neutral diagnostic data only. Export is blocked while source=fallback.
    */
    applySiteData(clone(FALLBACK_SITE_DATA), "fallback");
  }

  async function loadOfficialSiteData() {
    var errors = [];
    var candidates = getSiteDataURLCandidates();

    for (var index = 0; index < candidates.length; index += 1) {
      var url = candidates[index];
      try {
        var data = await fetchSiteDataCandidate(url);
        applySiteData(data, "official");
        state.dataLoadError = "";
        state.officialDataURL = url;
        return true;
      } catch (error) {
        errors.push(url + " -> " + (error && error.message ? error.message : "未知错误"));
      }
    }

    applySafeFallbackAfterDataFailure("正式数据文件读取失败，已临时使用内置备用数据防止项目卡片消失。尝试路径：" + errors.join("；"));
    return false;
  }

  function loadLocalDraftData() {
    if (!localDraftExists()) {
      updateLocalDraftState();
      return false;
    }
    applySiteData({
      siteSettings: readStorage(STORAGE_KEYS.settings, defaultSiteSettings),
      navigation: readStorage(STORAGE_KEYS.navigation, navigation),
      methods: [],
      projects: readStorage(STORAGE_KEYS.projects, defaultProjects),
      researchArticles: readStorage(STORAGE_KEYS.research, defaultResearchArticles)
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
      localStorage.removeItem(STORAGE_KEYS.research);
      localStorage.removeItem(STORAGE_KEYS.draftSavedAt);
      localStorage.removeItem(STORAGE_KEYS.sectionStatus);
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
    return clone({
      schema: "northern-atelier-site-data-v2",
      exportedAt: new Date().toISOString(),
      siteSettings: siteSettings,
      navigation: navigation,
      methods: [],
      projects: projects,
      researchArticles: researchArticles
    });
  }

  function splitArticleTextForBlocks(value) {
    var text = String(value || "").replace(/\r\n?/g, "\n").trim();
    if (!text) {
      return [];
    }
    var parts = text.split(/\n\s*\n+/).map(function (part) { return part.trim(); }).filter(Boolean);
    if (parts.length === 1 && text.indexOf("\n") !== -1) {
      parts = text.split(/\n+/).map(function (part) { return part.trim(); }).filter(Boolean);
    }
    return parts;
  }

  function expandArticleBlockForSave(block) {
    var current = normalizeArticleBlocks([block])[0];
    if (!current) {
      return [];
    }
    if (current.type === "paragraph" || current.type === "heading" || current.type === "quote") {
      var parts = splitArticleTextForBlocks(current.text);
      return parts.map(function (text) {
        var copy = clone(current);
        copy.text = text;
        return copy;
      });
    }
    return [current];
  }

  function readProjectFormSnapshot() {
    var form = qs("#projectForm");
    if (!form || !form.elements || !form.elements.id || !form.elements.id.value) {
      return null;
    }
    var visible = Boolean(form.elements.visible && form.elements.visible.checked);
    return {
      id: form.elements.id.value,
      data: {
        titleCN: form.elements.titleCN.value.trim(),
        titleEN: form.elements.titleEN.value.trim(),
        category: form.elements.category.value,
        year: form.elements.year.value.trim(),
        location: form.elements.location.value.trim(),
        status: form.elements.status.value.trim() || (visible ? "Published" : "Hidden"),
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
        displaySections: readProjectDisplaySections(form),
        featured: readProjectDisplaySections(form).indexOf("featured") !== -1,
        visible: visible
      }
    };
  }

  function flushVisibleAdminEditorsToMemory() {
    var changed = false;

    var projectSnapshot = readProjectFormSnapshot();
    if (projectSnapshot) {
      var projectIndex = projects.findIndex(function (item) { return item.id === projectSnapshot.id; });
      if (projectIndex !== -1) {
        var preservedArticleBlocks = clone(projects[projectIndex].articleBlocks || []);
        projects[projectIndex] = normalizeProject(Object.assign({}, projects[projectIndex], projectSnapshot.data, {
          articleBlocks: preservedArticleBlocks
        }));
        var renderedIndex = state.projects.findIndex(function (item) { return item.id === projectSnapshot.id; });
        if (renderedIndex !== -1) {
          state.projects[renderedIndex] = clone(projects[projectIndex]);
        }
        changed = true;
      }
    }

    var articleProjectId = state.activeArticleProjectId;
    var articleProject = projects.find(function (item) { return item.id === articleProjectId; });
    if (articleProject) {
      var list = qs("#articleBlockList");
      var editorNodes = list ? qsa("[data-article-block]", list) : [];
      var blocks = collectArticleBlocksFromEditor();
      var pending = readPendingArticleBlock();
      var pendingBlocks = articleBlockHasContent(pending) ? expandArticleBlockForSave(pending) : [];
      if (editorNodes.length || pendingBlocks.length) {
        blocks = blocks.concat(pendingBlocks);
        syncArticleBlocksToProject(articleProjectId, blocks);
        changed = true;
      }
    }

    if (changed) {
      writeStorage();
    }
    return changed;
  }

  function buildExactExportData() {
    var snapshot = currentSiteData();
    var normalized = normalizeSiteData(snapshot);
    return {
      schema: snapshot.schema,
      exportedAt: snapshot.exportedAt,
      siteSettings: normalized.siteSettings,
      navigation: normalized.navigation,
      methods: [],
      projects: normalized.projects,
      researchArticles: normalized.researchArticles
    };
  }

  function exportFullSiteData() {
    var dirtyPanels = dirtyAdminPanelNames();
    if (dirtyPanels.length) {
      var dirtyLabels = dirtyPanels.map(function (name) {
        return ADMIN_PANEL_LABELS[name] || name;
      });
      if (typeof window !== "undefined" && window.alert) {
        window.alert("以下板块还有未保存修改：\n\n- " + dirtyLabels.join("\n- ") + "\n\n请分别点击保存后，再导出完整 site-data.json。");
      }
      showAdminStamp("导出被阻止：存在未保存板块");
      return;
    }

    if (state.dataSource === "fallback") {
      var message = "当前页面正在使用诊断占位数据，不是正式 site-data.json，也不是你明确选择的本机草稿。\n\n已阻止导出，避免把占位内容误当正式数据。\n\n请先确认 assets/data/site-data.json 可读取，或点击“使用本机草稿”后再导出。";
      if (typeof window !== "undefined" && window.alert) {
        window.alert(message);
      }
      showAdminStamp("已阻止导出 fallback");
      return;
    }

    var data = buildExactExportData();
    var title = data.siteSettings && data.siteSettings.taglineCN ? String(data.siteSettings.taglineCN).trim() : "";
    var projectCount = Array.isArray(data.projects) ? data.projects.length : 0;
    var researchCount = Array.isArray(data.researchArticles) ? data.researchArticles.length : 0;

    if (!title || title.indexOf("site-data.json 未读取成功") !== -1) {
      if (typeof window !== "undefined" && window.alert) {
        window.alert("当前首页标题为空或仍是诊断占位内容，已阻止导出。请先确认正式内容已加载。");
      }
      showAdminStamp("导出被阻止：标题异常");
      return;
    }

    if (!projectCount && typeof window !== "undefined" && window.confirm) {
      var emptyOk = window.confirm("当前 projects 数组为空。\n\n导出的 site-data.json 将不会包含项目卡片数据。\n\n如果这是刻意的，可以继续；否则请取消并检查数据源。\n\n仍然继续导出？");
      if (!emptyOk) {
        return;
      }
    }

    if (state.dataSource === "local" && typeof window !== "undefined" && window.confirm) {
      var draftOk = window.confirm("当前使用的是本机草稿。\n\n导出的 site-data.json 将来自这个浏览器的草稿内容，而不是线上正式 JSON。\n\n确认继续导出草稿为正式数据？");
      if (!draftOk) {
        return;
      }
    }

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
    if (typeof window !== "undefined" && window.confirm) {
      var publishOk = window.confirm("即将导出完整站点数据 site-data.json。\n\n当前数据源：" + state.dataSource + "\n首页标题：" + title + "\n项目数量：" + projectCount + "\n研究文章：" + researchCount + "\n\n发布步骤：\n1. 下载后保持文件名 site-data.json；\n2. 上传覆盖 assets/data/site-data.json；\n3. 提交 GitHub；\n4. 用 ?fresh=1 检查线上数据。\n\n继续导出？");
      if (!publishOk) {
        return;
      }
    }
    exportJSON("site-data.json", data, { skipNotice: true });
    showAdminStamp("site-data.json 已导出");
  }

  function collectOfficialPathIssues(data) {
    var issues = [];
    var settings = data.siteSettings || {};
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
      parseList(project.gallery).forEach(function (path, pathIndex) { checkOfficialPath(path, prefix + ".gallery[" + pathIndex + "]", issues, false); });
      ["model3d", "modelThumbnail", "panorama", "panoramaThumbnail", "video", "videoPoster"].forEach(function (field) { checkOfficialPath(project[field], prefix + "." + field, issues, false); });
      sanitizeArticleBlocks(project.articleBlocks).forEach(function (block, blockIndex) {
        if (block.type === "image") { checkOfficialPath(block.asset, prefix + ".articleBlocks[" + blockIndex + "].asset", issues, false); }
        if (block.type === "gallery") { parseList(block.assets).forEach(function (path, pathIndex) { checkOfficialPath(path, prefix + ".articleBlocks[" + blockIndex + "].assets[" + pathIndex + "]", issues, false); }); }
      });
    });
    (data.researchArticles || []).forEach(function (article, articleIndex) {
      var prefix = "researchArticles[" + articleIndex + "]." + (article.id || "research");
      checkOfficialPath(article.coverImage, prefix + ".coverImage", issues, false);
      sanitizeArticleBlocks(article.articleBlocks).forEach(function (block, blockIndex) {
        if (block.type === "image") { checkOfficialPath(block.asset, prefix + ".articleBlocks[" + blockIndex + "].asset", issues, false); }
        if (block.type === "gallery") { parseList(block.assets).forEach(function (path, pathIndex) { checkOfficialPath(path, prefix + ".articleBlocks[" + blockIndex + "].assets[" + pathIndex + "]", issues, false); }); }
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
    var report = { empty: [], local: [], suspicious: [], referenced: [] };
    function add(label, value, options) {
      var opts = options || {};
      var path = String(value || "").trim();
      if (!path) { if (!opts.optional) { report.empty.push(label); } return; }
      if (opts.allowAbstract && path.indexOf("abstract:") === 0) { report.referenced.push({ label: label, path: path }); return; }
      report.referenced.push({ label: label, path: path });
      if (isLocalFilePath(path) || isAssetReference(path) || isMockReference(path)) { report.local.push({ label: label, path: path }); return; }
      if (isSuspiciousAssetPath(path) || isExternalPath(path) || path.charAt(0) === "/") { report.suspicious.push({ label: label, path: path }); }
    }
    var normalized = normalizeSiteData(data);
    var settings = normalized.siteSettings;
    var visualAssets = normalizeVisualAssets(settings.visualAssets);
    add("首页分层素材：山体", visualAssets.heroDepth.mountain);
    add("首页分层素材：窗框", visualAssets.heroDepth.windowFrame);
    add("首页分层素材：人物", visualAssets.heroDepth.lady);
    add("首页分层素材：暗角", visualAssets.heroDepth.vignette);
    add("首页分层素材：参考图", visualAssets.heroDepth.reference, { optional: true });
    add("瓦当 WebP", visualAssets.watang.webp);
    add("瓦当 PNG 备用", visualAssets.watang.pngFallback, { optional: true });
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
      parseList(project.gallery).forEach(function (path, index) { add(prefix + " / 图片集 " + String(index + 1), path); });
      add(prefix + " / 案例视频", project.video, { optional: true });
      add(prefix + " / 视频 poster", project.videoPoster, { optional: true });
      add(prefix + " / 模型文件", project.model3d, { optional: true });
      add(prefix + " / 模型缩略图", project.modelThumbnail, { optional: true });
      add(prefix + " / 全景图", project.panorama, { optional: true });
      add(prefix + " / 全景缩略图", project.panoramaThumbnail, { optional: true });
      sanitizeArticleBlocks(project.articleBlocks).forEach(function (block, blockIndex) {
        if (block.type === "image") { add(prefix + " / 图文文章图片 " + String(blockIndex + 1), block.asset); }
        if (block.type === "gallery") { parseList(block.assets).forEach(function (path, pathIndex) { add(prefix + " / 图文文章图集 " + String(blockIndex + 1) + "-" + String(pathIndex + 1), path); }); }
      });
    });
    normalized.researchArticles.forEach(function (article) {
      var prefix = (article.number || article.id) + " / " + article.titleCN;
      add(prefix + " / 研究封面", article.coverImage, { optional: true });
      sanitizeArticleBlocks(article.articleBlocks).forEach(function (block, blockIndex) {
        if (block.type === "image") { add(prefix + " / 正文图片 " + String(blockIndex + 1), block.asset); }
        if (block.type === "gallery") { parseList(block.assets).forEach(function (path, pathIndex) { add(prefix + " / 正文图集 " + String(blockIndex + 1) + "-" + String(pathIndex + 1), path); }); }
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
      try {
        if (!("indexedDB" in window) || !window.indexedDB) {
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
          console.warn(state.assetDbError);
          resolve(null);
        };
        request.onblocked = function () {
          state.assetDbReady = false;
          state.assetDbError = "IndexedDB 被浏览器阻止，本地上传素材不会持久保存，但线上项目数据仍可显示。";
          console.warn(state.assetDbError);
          resolve(null);
        };
      } catch (error) {
        state.assetDbReady = false;
        state.assetDbError = "IndexedDB 初始化被浏览器阻止：" + (error && error.message ? error.message : "未知错误");
        console.warn(state.assetDbError);
        resolve(null);
      }
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

  function fetchResearchArticles() {
    return delay(researchArticles);
  }

  function fetchResearchArticleById(id) {
    var article = researchArticles.find(function (item) { return item.id === id; });
    return delay(article || null);
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
      project.visible = !isProjectVisible(project);
      delete project.published;
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

  function isMobileExperience() {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(max-width: 840px), (hover: none) and (pointer: coarse) and (max-width: 1100px)").matches;
  }

  function updateMobileViewportMetrics() {
    var viewport = window.visualViewport;
    var height = viewport && viewport.height ? viewport.height : window.innerHeight;
    var offsetTop = viewport && viewport.offsetTop ? viewport.offsetTop : 0;
    document.documentElement.style.setProperty("--mobile-viewport-height", Math.max(320, Math.round(height)) + "px");
    document.documentElement.style.setProperty("--mobile-viewport-offset-top", Math.max(0, Math.round(offsetTop)) + "px");
    document.documentElement.classList.toggle("is-mobile-experience", isMobileExperience());
  }

  function lockMobilePageScroll(source) {
    if (!isMobileExperience()) {
      return;
    }
    var key = source || "overlay";
    if (mobilePageLocks[key]) {
      return;
    }
    mobilePageLocks[key] = true;
    if (Object.keys(mobilePageLocks).length > 1) {
      return;
    }
    mobilePageScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("mobile-scroll-locked");
    document.body.style.top = "-" + mobilePageScrollY + "px";
  }

  function unlockMobilePageScroll(source) {
    var key = source || "overlay";
    delete mobilePageLocks[key];
    if (Object.keys(mobilePageLocks).length) {
      return;
    }
    if (!document.body.classList.contains("mobile-scroll-locked")) {
      return;
    }
    document.body.classList.remove("mobile-scroll-locked");
    document.body.style.top = "";
    window.scrollTo(0, mobilePageScrollY || 0);
  }

  function resizeInteractiveMedia() {
    window.clearTimeout(mobileViewportTimer);
    mobileViewportTimer = window.setTimeout(function () {
      if (activePanoramaViewer && typeof activePanoramaViewer.resize === "function") {
        try {
          activePanoramaViewer.resize();
        } catch (error) {
          /* viewer may be closing */
        }
      }
      var modelViewer = qs("[data-model-viewer]");
      if (modelViewer && typeof modelViewer.updateFraming === "function") {
        try {
          modelViewer.updateFraming();
        } catch (error) {
          /* model-viewer may still be loading */
        }
      }
    }, 120);
  }

  function updateArticleReadingProgress() {
    var view = qs(".project-article-view");
    if (!view) {
      return;
    }
    var range = Math.max(1, view.scrollHeight - view.clientHeight);
    var progress = Math.max(0, Math.min(1, view.scrollTop / range));
    view.style.setProperty("--article-reading-progress", progress.toFixed(4));
  }

  function initResponsiveAmbientEffects() {
    if (isMobileExperience()) {
      document.documentElement.classList.add("mobile-lite-fx");
      return;
    }
    document.documentElement.classList.remove("mobile-lite-fx");
    if (!qs(".ember-canvas")) {
      initEmberCanvas();
    }
  }

  function initMobileExperience() {
    updateMobileViewportMetrics();

    var viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener("resize", function () {
        updateMobileViewportMetrics();
        resizeInteractiveMedia();
      }, { passive: true });
      viewport.addEventListener("scroll", updateMobileViewportMetrics, { passive: true });
    }

    window.addEventListener("resize", function () {
      updateMobileViewportMetrics();
      resizeInteractiveMedia();
      if (!isMobileExperience()) {
        closeMobileNav();
      }
    }, { passive: true });

    window.addEventListener("orientationchange", function () {
      window.setTimeout(function () {
        updateMobileViewportMetrics();
        resizeInteractiveMedia();
      }, 180);
    }, { passive: true });

    var navBackdrop = qs("#mobileNavBackdrop");
    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeMobileNav);
    }

    var articleView = qs(".project-article-view");
    if (articleView) {
      articleView.addEventListener("scroll", updateArticleReadingProgress, { passive: true });
    }

    document.addEventListener("focusin", function (event) {
      if (!isMobileExperience() || !event.target || !event.target.closest) {
        return;
      }
      if (!event.target.closest("#adminOverlay")) {
        return;
      }
      window.setTimeout(function () {
        try {
          event.target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        } catch (error) {
          /* older browsers */
        }
      }, 260);
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    initMobileExperience();
    try {
      await initAssetDB();
    } catch (error) {
      state.assetDbReady = false;
      state.assetDbError = "IndexedDB 初始化失败：" + (error && error.message ? error.message : "未知错误");
      console.warn(state.assetDbError);
    }

    try {
      await loadOfficialSiteData();

      if (shouldClearDraftData()) {
        clearLocalDraftStorage();
      }

      /*
        V41 data rule:
        Public pages always use assets/data/site-data.json by default.
        localStorage drafts never override the public page automatically.
        Draft data is loaded only when explicitly requested with ?draft=1 / ?source=local,
        or when the user clicks "使用本机草稿" inside the admin console.
      */
      if (!shouldForceOfficialData() && shouldUseDraftData()) {
        loadLocalDraftData();
      } else {
        updateLocalDraftState();
      }
    } catch (error) {
      state.dataLoadError = "站点数据初始化失败：" + (error && error.message ? error.message : "未知错误");
      console.warn(state.dataLoadError);
      applySiteData(createEmergencyFallbackSiteData(), "fallback");
    }

    try {
      await refreshData();
    } catch (error) {
      console.warn("状态刷新失败，使用当前内存数据继续渲染。", error);
      state.settings = siteSettings;
      state.navigation = navigation;
      state.projects = projects;
      state.researchArticles = researchArticles;
      state.assets = [];
    }

    ensureProjectsNotEmpty();
    renderAll();
    bindGlobalEvents();
    initWadangCursorStable();
    initHeroStageStable();
    window.setTimeout(initResponsiveAmbientEffects, 900);
    initSectionObserver();
    window.setTimeout(ensureProjectCardsVisible, 900);
  }

  async function refreshData() {
    state.settings = await fetchSiteSettings();
    state.navigation = await fetchNavigation();
    state.projects = await fetchProjects();
    state.researchArticles = await fetchResearchArticles();
    state.assets = await listAssetsFromDB();
    await rebuildAssetObjectURLs();
    ensureProjectsNotEmpty();
    if (!Array.isArray(state.researchArticles)) {
      state.researchArticles = [];
    }
  }

  function ensureProjectsNotEmpty() {
    if (!Array.isArray(state.projects)) {
      state.projects = [];
    }
    if (!Array.isArray(projects)) {
      projects = [];
    }
  }


  function ensureProjectCardsVisible() {
    if (state.cardVisibilityFallbackTimer) {
      window.clearTimeout(state.cardVisibilityFallbackTimer);
    }

    function isNearViewport(element) {
      if (!element || !element.getBoundingClientRect) {
        return false;
      }
      var rect = element.getBoundingClientRect();
      var buffer = Math.min(360, Math.max(180, window.innerHeight * 0.32));
      return rect.bottom >= -buffer && rect.top <= window.innerHeight + buffer;
    }

    function isHiddenByStyle(element) {
      var style = window.getComputedStyle ? window.getComputedStyle(element) : null;
      if (!style) {
        return false;
      }
      return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) < 0.05;
    }

    state.cardVisibilityFallbackTimer = window.setTimeout(function () {
      var publishedExists = state.projects && state.projects.some(isProjectVisible);

      var cards = qsa(".project-card, .research-card");

      if (!cards.length && publishedExists) {
        console.warn("项目数据已加载，但项目卡片尚未渲染。正在尝试重新渲染项目区。");
        renderFeatured();
        renderFilters();
        renderWorks();
        renderCategoryRail("Architecture", "architectureRail");
        renderCategoryRail("Objects", "objectsRail");
        renderResearch();
        cards = qsa(".project-card, .research-card");
      }

      var nearCards = cards.filter(function (card) {
        return isNearViewport(card.closest(".section") || card);
      });

      if (nearCards.length && nearCards.every(isHiddenByStyle)) {
        console.warn("项目卡片进入视口后仍不可见，启用兜底显示。");
        document.body.classList.add("cards-fallback-visible");
      } else {
        document.body.classList.remove("cards-fallback-visible");
      }
    }, 1200);
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
    applySectionBackgrounds();
    renderAdminList();
    renderResearchEditorControls();
    renderAdminSectionSaveState();
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
    document.documentElement.style.setProperty("--cangqing", settings.accentColor || "#536A63");
    renderHeroContent(settings.hero);
    renderSectionContent(settings.sections);
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
    if (!link) {
      return;
    }
    var invalid = !action || !action.href || action.href === "#studio" || action.href === "studio" || (!action.labelCN && !action.labelEN);
    link.hidden = invalid;
    link.setAttribute("aria-hidden", invalid ? "true" : "false");
    if (invalid) {
      return;
    }
    link.href = action.href;
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

  function copyContactText(value) {
    var text = String(value || "").trim();
    if (!text) {
      return Promise.reject(new Error("empty"));
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      try {
        var ok = document.execCommand("copy");
        textarea.remove();
        ok ? resolve() : reject(new Error("copy-failed"));
      } catch (error) {
        textarea.remove();
        reject(error);
      }
    });
  }

  function renderContactContent(contact) {
    var content = normalizeContactContent(contact);
    var grid = qs("#contactCopyGrid");
    var status = qs("#contactCopyStatus");
    if (!grid) {
      return;
    }

    var channels = [
      { key: "email", label: "邮箱", value: content.email },
      { key: "xiaohongshu", label: "小红书", value: content.xiaohongshu },
      { key: "officialAccount", label: "公众号", value: content.officialAccount },
      { key: "vx", label: "VX", value: content.vx }
    ];

    grid.innerHTML = channels.map(function (channel) {
      var disabled = !channel.value;
      return '<button class="contact-copy-key" type="button" data-contact-copy="' + escapeHTML(channel.key) + '"' +
        (disabled ? ' disabled aria-disabled="true"' : '') +
        ' aria-label="复制' + escapeHTML(channel.label) + '"><span>' + escapeHTML(channel.label) + '</span></button>';
    }).join("");

    qsa("[data-contact-copy]", grid).forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-contact-copy");
        var channel = channels.find(function (item) { return item.key === key; });
        if (!channel || !channel.value) {
          if (status) {
            status.textContent = channel ? channel.label + "尚未设置。" : "联系方式尚未设置。";
          }
          return;
        }
        copyContactText(channel.value).then(function () {
          qsa(".contact-copy-key", grid).forEach(function (item) { item.classList.remove("is-copied"); });
          button.classList.add("is-copied");
          if (status) {
            status.textContent = channel.label + "已复制。";
          }
          window.setTimeout(function () {
            button.classList.remove("is-copied");
          }, 1400);
        }).catch(function () {
          if (status) {
            status.textContent = channel.label + "复制失败，请检查浏览器权限。";
          }
        });
      });
    });
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
      status.classList.remove("is-official", "is-local", "is-fallback");
      status.classList.add(state.dataSource === "local" ? "is-local" : state.dataSource === "fallback" ? "is-fallback" : "is-official");
      status.dataset.source = state.dataSource || "official";

      var sourceDetail = state.officialDataURL ? "（读取：" + state.officialDataURL + "）" : "";
      var isFileMode = isFileProtocolPreview();
      var label = state.dataSource === "local"
        ? "当前使用：本机草稿。导出前会二次确认。"
        : state.dataSource === "fallback"
          ? (isFileMode ? "当前使用：诊断占位数据。file:/// 直接预览不能可靠读取 JSON；不会显示旧版内容。" : "当前使用：诊断占位数据。正式 JSON 未读取成功；不会显示旧版内容，也不能导出。")
          : "当前使用：正式 site-data.json" + sourceDetail + "。";
      if (state.hasLocalDraft && state.dataSource !== "local") {
        label += " 检测到本机草稿，可手动切换。";
      }
      if (state.dataLoadError && state.dataSource !== "local") {
        status.title = state.dataLoadError;
      } else {
        status.removeAttribute("title");
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

  function emptyStateHTML(title, text) {
    return '<article class="data-empty-state" role="status">' +
      '<strong>' + escapeHTML(title) + '</strong>' +
      '<p>' + escapeHTML(text) + '</p>' +
      '</article>';
  }

  function renderFeatured() {
    var container = qs("#featuredGrid");
    if (!container) {
      return;
    }
    var featured = state.projects.filter(function (project) {
      return projectAppearsIn(project, "featured");
    }).slice(0, 3);
    container.innerHTML = featured.length
      ? featured.map(function (project, index) { return projectCardHTML(project, index, "featured"); }).join("")
      : emptyStateHTML("暂无精选项目", state.dataSource === "fallback" ? "正式 JSON 未读取成功；当前不会显示旧版项目。" : "没有项目选择显示在“精选作品”板块。");
  }

  function renderFilters() {
    var container = qs("#filterBar");
    if (!container) {
      return;
    }
    var published = state.projects.filter(function (item) {
      return projectAppearsIn(item, "works");
    });
    var categories = ["All"].concat(Array.from(new Set(published.map(function (item) { return item.category; }))).filter(Boolean));
    if (categories.indexOf(state.filter) === -1) {
      state.filter = "All";
    }
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
      return projectAppearsIn(project, "works") && (state.filter === "All" || project.category === state.filter);
    });
    if (!visible.length) {
      container.innerHTML = emptyStateHTML(
        state.dataSource === "fallback" ? "正式项目数据未读取" : "暂无可显示项目",
        state.dataSource === "fallback"
          ? "请检查 assets/data/site-data.json 是否能读取，或在后台导入完整 site-data.json。"
          : "当前筛选条件下，没有项目选择显示在“全部作品”板块。"
      );
      return;
    }
    container.innerHTML = visible.map(function (project, index) {
      return projectCardHTML(project, index, "work");
    }).join("");
  }

  function renderCategoryRail(category, id) {
    var container = qs("#" + id);
    if (!container) {
      return;
    }
    var sectionKey = category === "Architecture" ? "architecture" : category === "Objects" ? "objects" : String(category || "").toLowerCase();
    var visible = state.projects.filter(function (project) {
      return projectAppearsIn(project, sectionKey);
    }).slice(0, 4);
    container.innerHTML = visible.length
      ? visible.map(function (project, index) { return projectCardHTML(project, index, "category"); }).join("")
      : emptyStateHTML("暂无 " + category + " 项目", state.dataSource === "fallback" ? "正式 JSON 未读取成功；不会显示旧版项目。" : "没有项目选择显示在该板块。");
  }

  function researchCoverHTML(article, className) {
    var source = normalizeAssetReference(article && article.coverImage);
    if (source && !isMockReference(source) && String(source).indexOf("abstract:") !== 0) {
      var kind = assetKind(source);
      if (kind === "image" || kind === "gif") {
        var url = resolveAssetURL(source) || source;
        return '<figure class="' + escapeHTML(className || "research-cover") + '"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="' + escapeHTML(article.titleCN) + '" onerror="this.closest(\'figure\').classList.add(\'is-missing\');this.remove()"></figure>';
      }
    }
    return '<figure class="' + escapeHTML(className || "research-cover") + ' is-abstract"><span></span><i></i><b>' + escapeHTML(article.number || "R—") + '</b></figure>';
  }

  function renderResearch() {
    var container = qs("#researchLibrary");
    if (!container) {
      return;
    }
    var published = (state.researchArticles || []).filter(isResearchArticleVisible);
    if (!published.length) {
      container.innerHTML = '<div class="research-empty-archive"><span>R—000</span><div><strong>研究档案尚未公开</strong><p>研究文章将在 researchArticles 中独立维护，不会再重复展示项目卡片。</p></div></div>';
      return;
    }

    var lead = published.find(function (article) { return article.featured; }) || published[0];
    var remaining = published.filter(function (article) { return article.id !== lead.id; });
    var leadCover = researchCoverHTML(lead, "research-lead-visual");
    var leadTags = lead.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join("");

    var leadHTML = '<article class="research-lead-card research-card" data-research-id="' + escapeHTML(lead.id) + '" tabindex="0" role="button">' +
      leadCover +
      '<div class="research-lead-copy"><div class="research-ledger-line"><strong>' + escapeHTML(lead.number) + '</strong><span>' + escapeHTML([lead.topic, lead.date].filter(Boolean).join(" · ")) + '</span></div>' +
      '<h3>' + escapeHTML(lead.titleCN) + '</h3>' +
      (lead.titleEN ? '<p class="research-title-en">' + escapeHTML(lead.titleEN) + '</p>' : '') +
      '<p class="research-summary">' + escapeHTML(lead.summary) + '</p>' +
      '<div class="research-lead-footer"><div class="research-tag-line">' + leadTags + '</div><span class="research-read-link">READ NOTE <i>↗</i></span></div></div>' +
      '</article>';

    var indexHTML = '<div class="research-index-panel"><div class="research-index-head"><span>INDEX / 研究索引</span><strong>' + String(published.length).padStart(2, "0") + '</strong></div>' +
      '<div class="research-index-list">' + remaining.map(function (article) {
        return '<article class="research-index-card research-card" data-research-id="' + escapeHTML(article.id) + '" tabindex="0" role="button">' +
          '<div class="research-index-number">' + escapeHTML(article.number) + '</div>' +
          '<div class="research-index-copy"><span>' + escapeHTML([article.topic, article.date].filter(Boolean).join(" / ")) + '</span><h3>' + escapeHTML(article.titleCN) + '</h3><p>' + escapeHTML(article.summary) + '</p></div>' +
          '<div class="research-index-arrow">↗</div>' +
        '</article>';
      }).join("") + '</div></div>';

    container.innerHTML = leadHTML + indexHTML;
  }

  function renderMethods() {
    var container = qs("#methodStack");
    if (!container) {
      return;
    }
    container.innerHTML = methods.length
      ? methods.map(function (item) {
        return '<article class="method-card"><strong>' + item.no + '</strong><div><h3>' + escapeHTML(item.title) + '</h3><p>' + escapeHTML(item.text) + '</p></div></article>';
      }).join("")
      : emptyStateHTML("方法论数据未设置", "请在 site-data.json 的 methods 数组中维护内容。");
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
    var status = projectAppearsIn(project, "featured") ? '<span class="status-pill">FEATURED</span>' : '<span>' + escapeHTML(project.status) + '</span>';
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
    var gallery = collectDisplayImages(project);
    var visualPath = context === "article"
      ? (project.detailImage || gallery[0] || project.coverImage)
      : project.coverImage;
    if (visualPath && !String(visualPath).startsWith("abstract:") && !isMockReference(visualPath)) {
      var url = resolveAssetURL(visualPath);
      return '<div class="project-visual visual-image" aria-hidden="true"><img loading="lazy" decoding="async" src="' + escapeHTML(url || visualPath) + '" alt="" onerror="var p=this.parentNode;p.className=\'project-visual visual-ridge\';p.innerHTML=\'<span class=&quot;line-art&quot;></span>\';"></div>';
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
    if (collectDisplayImages(project).length) { items.push("IMG"); }
    if (project.model3d) { items.push("3D"); }
    if (project.panorama) { items.push("360"); }
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

      var researchCard = event.target.closest("[data-research-id]");
      if (researchCard) {
        openResearchArticle(researchCard.getAttribute("data-research-id"));
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
      if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-research-id]")) {
        event.preventDefault();
        openResearchArticle(event.target.getAttribute("data-research-id"));
        return;
      }
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
    if (!project || !isProjectVisible(project)) {
      return;
    }
    var modal = qs("#projectModal");
    var content = qs("#modalContent");
    if (!modal || !content) {
      return;
    }
    closeMobileNav();
    destroyPanoramaViewer();
    state.lastFocusedElement = document.activeElement;
    content.innerHTML = modalHTML(project);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    lockMobilePageScroll("projectModal");
    bindModalMedia(project);
    resizeInteractiveMedia();
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
    destroyPanoramaViewer();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    unlockMobilePageScroll("projectModal");
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

  function collectDisplayImages(project) {
    var values = [];
    function add(value) {
      var current = normalizeAssetReference(value);
      if (!current || isMockReference(current) || String(current).indexOf("abstract:") === 0) {
        return;
      }
      var kind = assetKind(current);
      if (kind !== "image" && kind !== "gif") {
        return;
      }
      if (values.indexOf(current) === -1) {
        values.push(current);
      }
    }
    parseList(project.gallery).forEach(add);
    add(project.detailImage);
    add(project.articleCoverImage);
    add(project.coverImage);
    return values;
  }

  function galleryFigureHTML(asset, index, scopeClass) {
    var url = resolveAssetURL(asset) || asset;
    var label = "项目图片 " + String(index + 1).padStart(2, "0");
    var scope = scopeClass || "project-image-gallery";
    return '<figure class="project-gallery-item"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="' + escapeHTML(label) + '" onerror="var f=this.closest(\'figure\');var s=this.closest(\'.' + scope + '\');if(f){f.remove();}if(s&&!s.querySelector(\'figure\')){var section=s.closest(\'section\');if(section){section.remove();}}"></figure>';
  }

  function projectGalleryHTML(images) {
    if (!images.length) {
      return "";
    }

    var urls = images.map(function (asset) {
      return resolveAssetURL(asset) || asset;
    });
    var firstURL = urls[0];
    var total = urls.length;
    var navigation = total > 1
      ? '<button class="project-gallery-nav project-gallery-prev" type="button" data-gallery-prev aria-label="上一张图片">&#8592;</button>' +
        '<button class="project-gallery-nav project-gallery-next" type="button" data-gallery-next aria-label="下一张图片">&#8594;</button>'
      : "";
    var thumbnails = total > 1
      ? '<div class="project-gallery-thumbs" data-gallery-thumbs role="tablist" aria-label="图片缩略图">' + urls.map(function (url, index) {
          return '<button class="project-gallery-thumb' + (index === 0 ? ' is-active' : '') + '" type="button" data-gallery-thumb data-gallery-index="' + index + '" data-gallery-src="' + escapeHTML(url) + '" role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '" aria-label="查看第 ' + (index + 1) + ' 张图片"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt=""></button>';
        }).join("") + '</div>'
      : "";
    var expanded = '<div class="project-gallery-expanded-grid" data-gallery-expanded aria-hidden="true">' + urls.map(function (url, index) {
      return '<button class="project-gallery-expanded-item" type="button" data-gallery-expanded-item data-gallery-index="' + index + '" aria-label="查看第 ' + (index + 1) + ' 张图片"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="项目图片 ' + String(index + 1).padStart(2, "0") + '"></button>';
    }).join("") + '</div>';

    return '<section class="project-gallery-section is-compact" data-project-gallery tabindex="0">' +
      '<div class="project-section-title project-gallery-title"><div><p class="eyebrow">GALLERY / 图片集</p><span class="project-gallery-summary">默认折叠，单张翻阅</span></div><div class="project-gallery-title-actions"><span data-gallery-total>' + String(total).padStart(2, "0") + '</span><button class="project-gallery-toggle" type="button" data-gallery-toggle aria-expanded="false"><span>展开全部</span><em>Expand</em></button></div></div>' +
      '<div class="project-gallery-browser">' +
        '<div class="project-gallery-stage" data-gallery-stage>' +
          '<figure class="project-gallery-main"><img data-gallery-main loading="eager" decoding="async" src="' + escapeHTML(firstURL) + '" alt="项目图片 01"></figure>' +
          navigation +
          '<div class="project-gallery-counter"><span data-gallery-current>01</span><i>/</i><span data-gallery-count>' + String(total).padStart(2, "0") + '</span></div>' +
        '</div>' +
        thumbnails +
      '</div>' +
      expanded +
    '</section>';
  }

  function projectMediaSectionsHTML(project) {
    var images = collectDisplayImages(project);
    var galleryHTML = projectGalleryHTML(images);
    var articleTitle = project.titleCN || "项目文章";
    var articleText = project.description || project.concept || "阅读项目的图文文章。";
    var articleHTML = '<section class="project-article-entry"><div><p class="eyebrow">ARTICLE / 图文文章</p><h3>' + escapeHTML(articleTitle) + '</h3><p>' + escapeHTML(articleText) + '</p></div><a class="button button-primary" href="#project/' + escapeHTML(project.id) + '"><span>阅读文章</span><em>Read Article</em></a></section>';

    return '<div class="project-media-stack">' + galleryHTML + articleHTML + '</div>';
  }

  function modalHTML(project) {
    var tags = project.tags.map(function (tag) {
      return '<span class="tag">' + escapeHTML(tag) + '</span>';
    }).join("");
    var number = projectNumber(project);
    var modelEntry = project.model3d ? '<button class="button button-dark" type="button" data-panel-target="modelPanel"><span>模型展示</span><em>3D Model</em></button>' : "";
    var panoramaEntry = project.panorama ? '<button class="button button-outline" type="button" data-panel-target="panoramaPanel"><span>入此空间</span><em>Enter Scene</em></button>' : "";
    var mediaActions = modelEntry || panoramaEntry
      ? '<div class="hero-actions project-special-actions">' + modelEntry + panoramaEntry + '</div>'
      : "";
    return '<div class="modal-layout">' +
      '<div class="modal-visual">' + visualHTML(project, "modal") + '</div>' +
      '<div class="modal-copy">' +
        '<div><span class="modal-archive-code">BY-' + number + ' / ' + escapeHTML(project.category) + '</span><h2 id="modalTitle">' + escapeHTML(project.titleCN) + '<span>' + escapeHTML(project.titleEN) + '</span></h2></div>' +
        '<div class="project-meta">' + metaItem("No.", "BY-" + number) + metaItem("Category", project.category) + metaItem("Year", project.year) + metaItem("Status", project.status) + metaItem("Location", project.location) + metaItem("Material", project.material) + metaItem("Scale", project.scale) + metaItem("Role", project.role) + '</div>' +
        '<div class="concept-panel"><strong>DESIGN PROPOSITION</strong><p>' + escapeHTML(project.concept || project.description) + '</p></div>' +
        '<div class="tags">' + tags + '</div>' +
        projectMediaSectionsHTML(project) +
        mediaActions +
        modalMediaPanels(project) +
      '</div></div>';
  }

  async function handleProjectArticleHashRoute() {
    var hash = String(window.location.hash || "");
    var researchMatch = hash.match(/^#research\/([^/]+)$/);
    if (researchMatch) {
      await openResearchArticle(researchMatch[1], true);
      return;
    }
    var projectMatch = hash.match(/^#project\/([^/]+)$/);
    if (projectMatch) {
      await openProjectArticle(projectMatch[1], true);
    }
  }

  async function openProjectArticle(id, fromHash) {
    var project = await fetchProjectById(id);
    if (!project || !isProjectVisible(project)) {
      return;
    }
    var overlay = qs("#projectArticleOverlay");
    var content = qs("#projectArticleContent");
    if (!overlay || !content) {
      return;
    }
    state.articleReturnHash = fromHash ? "" : window.location.hash;
    state.activeArticleId = id;
    state.activeResearchId = "";
    overlay.classList.remove("research-article-mode");
    content.innerHTML = projectArticleHTML(project);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("article-open");
    lockMobilePageScroll("projectArticle");
    closeProjectModal();
    bindArticleView(project);
    window.setTimeout(updateArticleReadingProgress, 120);
    var articleView = qs(".project-article-view");
    if (articleView) {
      articleView.scrollTop = 0;
      articleView.style.setProperty("--article-reading-progress", "0");
    }
    updateArticleReadingProgress();
    if (!fromHash) {
      history.replaceState(null, "", "#project/" + id);
    }
    var close = qs("#articleCloseButton");
    if (close) {
      close.focus();
    }
  }

  async function openResearchArticle(id, fromHash) {
    var article = await fetchResearchArticleById(id);
    if (!article || !isResearchArticleVisible(article)) {
      return;
    }
    var overlay = qs("#projectArticleOverlay");
    var content = qs("#projectArticleContent");
    if (!overlay || !content) {
      return;
    }
    state.researchReturnHash = fromHash ? "" : window.location.hash;
    state.activeResearchId = id;
    state.activeArticleId = "";
    content.innerHTML = researchArticleHTML(article);
    overlay.classList.add("is-open", "research-article-mode");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("article-open");
    lockMobilePageScroll("projectArticle");
    closeProjectModal();
    bindResearchArticleView(article);
    var articleView = qs(".project-article-view");
    if (articleView) {
      articleView.scrollTop = 0;
      articleView.style.setProperty("--article-reading-progress", "0");
    }
    updateArticleReadingProgress();
    if (!fromHash) {
      history.replaceState(null, "", "#research/" + id);
    }
    var close = qs("#articleCloseButton");
    if (close) { close.focus(); }
  }

  function researchArticleHTML(article) {
    var published = (state.researchArticles || []).filter(isResearchArticleVisible);
    var index = published.findIndex(function (item) { return item.id === article.id; });
    if (index < 0) { index = 0; }
    var prev = published[(index - 1 + published.length) % published.length] || article;
    var next = published[(index + 1) % published.length] || article;
    var tags = article.tags.map(function (tag) { return '<span>' + escapeHTML(tag) + '</span>'; }).join("");
    var cover = researchCoverHTML(article, "research-reading-cover");
    var navigation = published.length > 1
      ? '<nav class="article-nav research-article-nav"><button class="button button-outline" type="button" data-open-research="' + escapeHTML(prev.id) + '"><span>上一篇研究</span><em>' + escapeHTML(prev.titleCN) + '</em></button><button class="button button-dark" type="button" data-open-research="' + escapeHTML(next.id) + '"><span>下一篇研究</span><em>' + escapeHTML(next.titleCN) + '</em></button></nav>'
      : "";

    return '<article class="research-reading">' +
      '<aside class="research-reading-aside"><div class="research-reading-number">' + escapeHTML(article.number) + '</div><dl>' +
        '<div><dt>TOPIC</dt><dd>' + escapeHTML(article.topic) + '</dd></div>' +
        '<div><dt>DATE</dt><dd>' + escapeHTML(article.date) + '</dd></div>' +
        '<div><dt>AUTHOR</dt><dd>' + escapeHTML(article.author) + '</dd></div>' +
        (article.readTime ? '<div><dt>READ</dt><dd>' + escapeHTML(article.readTime) + '</dd></div>' : '') +
      '</dl><div class="research-reading-tags">' + tags + '</div></aside>' +
      '<div class="research-reading-main"><header class="research-reading-header"><p>RESEARCH NOTE / 独立研究档案</p><h1 id="researchArticleTitle">' + escapeHTML(article.titleCN) + '</h1>' +
        (article.titleEN ? '<h2>' + escapeHTML(article.titleEN) + '</h2>' : '') +
        (article.summary ? '<p class="research-reading-deck">' + escapeHTML(article.summary) + '</p>' : '') + cover +
      '</header><div class="wechat-article-content research-reading-content">' + sanitizeArticleBlocks(article.articleBlocks).map(articleBlockHTML).join("") + '</div>' + navigation + '</div>' +
    '</article>';
  }

  function bindResearchArticleView(article) {
    qsa("[data-open-research]").forEach(function (button) {
      button.addEventListener("click", function () {
        openResearchArticle(button.getAttribute("data-open-research"));
      });
    });
  }

  function closeProjectArticle() {
    var overlay = qs("#projectArticleOverlay");
    if (!overlay || !overlay.classList.contains("is-open")) {
      return;
    }
    overlay.classList.remove("is-open", "research-article-mode");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("article-open");
    unlockMobilePageScroll("projectArticle");
    state.activeArticleId = "";
    state.activeResearchId = "";
    var hash = window.location.hash || "";
    if (/^#project\//.test(hash) || /^#research\//.test(hash)) {
      var returnHash = /^#research\//.test(hash) ? state.researchReturnHash : state.articleReturnHash;
      history.replaceState(null, "", window.location.pathname + window.location.search + (returnHash && returnHash !== hash ? returnHash : ""));
    }
  }

  function articleCoverHTML(project) {
    var source = normalizeAssetReference(project.detailImage || project.articleCoverImage || project.coverImage || "");
    if (!source || isMockReference(source) || String(source).indexOf("abstract:") === 0) {
      return "";
    }
    var kind = assetKind(source);
    if (kind !== "image" && kind !== "gif") {
      return "";
    }
    var url = resolveAssetURL(source) || source;
    return '<figure class="wechat-article-cover"><img loading="eager" decoding="async" src="' + escapeHTML(url) + '" alt="' + escapeHTML(project.titleCN) + '" onerror="this.closest(\'figure\').remove()"></figure>';
  }

  function articleInlineMeta(project) {
    var values = [
      project.category,
      project.year,
      project.location,
      project.status
    ].filter(Boolean);
    return values.map(function (value) {
      return '<span>' + escapeHTML(value) + '</span>';
    }).join("");
  }

  function projectArticleHTML(project) {
    var number = projectNumber(project);
    var blocks = getArticleBlocks(project);
    var publishedProjects = state.projects.filter(isProjectVisible);
    if (!publishedProjects.length) {
      publishedProjects = state.projects.slice();
    }
    var index = publishedProjects.findIndex(function (item) { return item.id === project.id; });
    if (index < 0) {
      index = 0;
    }
    var prev = publishedProjects[(index - 1 + publishedProjects.length) % publishedProjects.length] || project;
    var next = publishedProjects[(index + 1) % publishedProjects.length] || project;
    var deck = project.concept || project.description || "";
    var navigation = publishedProjects.length > 1
      ? '<nav class="article-nav wechat-article-nav"><button class="button button-outline" type="button" data-open-article="' + escapeHTML(prev.id) + '"><span>上一篇</span><em>' + escapeHTML(prev.titleCN) + '</em></button><button class="button button-dark" type="button" data-open-article="' + escapeHTML(next.id) + '"><span>下一篇</span><em>' + escapeHTML(next.titleCN) + '</em></button></nav>'
      : "";

    return '<article class="wechat-article">' +
      '<header class="wechat-article-header">' +
        '<p class="wechat-article-kicker">BY-' + number + ' · PROJECT ARTICLE</p>' +
        '<h1 id="projectArticleTitle">' + escapeHTML(project.titleCN) + '</h1>' +
        (project.titleEN ? '<p class="wechat-article-subtitle">' + escapeHTML(project.titleEN) + '</p>' : '') +
        '<div class="wechat-article-meta">' + articleInlineMeta(project) + '</div>' +
        (deck ? '<p class="wechat-article-deck">' + escapeHTML(deck) + '</p>' : '') +
        articleCoverHTML(project) +
      '</header>' +
      '<div class="wechat-article-content">' +
        blocks.map(articleBlockHTML).join("") +
      '</div>' +
      navigation +
    '</article>';
  }

  function getArticleBlocks(project) {
    var allowed = {
      heading: true,
      paragraph: true,
      image: true,
      gallery: true,
      quote: true,
      divider: true
    };
    var blocks = normalizeArticleBlocks(project.articleBlocks).filter(function (block) {
      if (!allowed[block.type]) {
        return false;
      }
      if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
        return Boolean(String(block.text || "").trim());
      }
      if (block.type === "image") {
        var imageKind = assetKind(block.asset);
        return Boolean(block.asset) && (imageKind === "image" || imageKind === "gif");
      }
      if (block.type === "gallery") {
        block.assets = parseList(block.assets).filter(function (asset) {
          var kind = assetKind(asset);
          return kind === "image" || kind === "gif";
        });
        return block.assets.length > 0;
      }
      return true;
    });

    if (blocks.length) {
      return blocks;
    }

    var generated = [];
    var lead = String(project.concept || "").trim();
    var description = String(project.description || "").trim();
    if (description && description !== lead) {
      generated.push({ type: "heading", text: "项目内容" });
      generated.push({ type: "paragraph", text: description });
    }

    var cover = normalizeAssetReference(project.detailImage || project.articleCoverImage || project.coverImage || "");
    var images = collectDisplayImages(project).filter(function (image) {
      return image !== cover;
    });
    if (images.length) {
      generated.push({ type: "gallery", assets: images, caption: "" });
    }
    return normalizeArticleBlocks(generated);
  }

  function articleBlockHTML(block) {
    var type = block.type;
    if (type === "heading") {
      return splitArticleTextForBlocks(block.text).map(function (text) {
        return '<h2 class="article-block-heading wechat-heading">' + escapeHTML(text) + '</h2>';
      }).join("");
    }
    if (type === "paragraph") {
      return splitArticleTextForBlocks(block.text).map(function (text) {
        return '<p class="article-paragraph wechat-paragraph">' + escapeHTML(text) + '</p>';
      }).join("");
    }
    if (type === "quote") {
      return splitArticleTextForBlocks(block.text).map(function (text) {
        return '<blockquote class="article-quote wechat-quote">' + escapeHTML(text) + '</blockquote>';
      }).join("");
    }
    if (type === "divider") {
      return '<hr class="article-divider wechat-divider">';
    }
    if (type === "gallery") {
      var assets = parseList(block.assets).filter(function (asset) {
        var kind = assetKind(asset);
        return kind === "image" || kind === "gif";
      });
      if (!assets.length) {
        return "";
      }
      return '<section class="wechat-gallery">' + assets.map(function (asset, index) {
        var url = resolveAssetURL(asset) || asset;
        return '<figure><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="文章图片 ' + String(index + 1) + '" onerror="this.closest(\'figure\').remove()"></figure>';
      }).join("") + captionHTML(block.caption) + '</section>';
    }
    if (type === "image") {
      var kind = assetKind(block.asset);
      if (!block.asset || (kind !== "image" && kind !== "gif")) {
        return "";
      }
      var url = resolveAssetURL(block.asset) || block.asset;
      return '<figure class="wechat-article-image"><img loading="lazy" decoding="async" src="' + escapeHTML(url) + '" alt="' + escapeHTML(block.caption || "") + '" onerror="this.closest(\'figure\').remove()">' + captionHTML(block.caption) + '</figure>';
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
    return projectMediaSectionsHTML(project);
  }

  function assetChip(label, value) {
    return '<div class="asset-chip"><small>' + escapeHTML(label) + '</small><code>' + escapeHTML(value) + '</code></div>';
  }

  function modalMediaPanels(project) {
    var html = "";
    if (project.model3d) {
      var modelURL = resolveAssetURL(project.model3d) || project.model3d;
      var modelPoster = project.modelThumbnail ? (resolveAssetURL(project.modelThumbnail) || project.modelThumbnail) : "";
      var posterAttr = modelPoster ? ' poster="' + escapeHTML(modelPoster) + '"' : "";
      var fallbackThumb = modelPoster ? '<img class="viewer-thumb" src="' + escapeHTML(modelPoster) + '" alt="" loading="lazy" decoding="async">' : "";
      html += '<section class="media-panel" id="modelPanel">' +
        '<div class="model-viewer-shell">' +
          '<model-viewer class="locked-model-viewer" data-model-viewer src="' + escapeHTML(modelURL) + '"' + posterAttr +
            ' camera-controls disable-pan interaction-prompt="none" touch-action="pan-y"' +
            ' camera-orbit="0deg 65deg auto" min-camera-orbit="-180deg 32deg auto" max-camera-orbit="180deg 88deg auto"' +
            ' field-of-view="35deg" shadow-intensity="0.8" exposure="1.05" environment-image="neutral"' +
            ' alt="' + escapeHTML(project.titleCN + " 3D 模型") + '"></model-viewer>' +
          '<div class="model-viewer-fallback"><div class="viewer-stage">' + fallbackThumb +
            '<canvas width="760" height="420" data-model-canvas></canvas>' +
            '<div class="model-placeholder" data-model-placeholder><div><p class="eyebrow">3D MODEL</p><h3>模型展示</h3><p>模型组件未加载时显示此预览。</p><button class="button button-primary" type="button" data-load-model><span>载入预览</span><em>Load Preview</em></button></div></div>' +
          '</div></div>' +
        '<div class="viewer-caption"><p>可水平旋转；垂直视角已限制在模型上方，避免转到模型底部。</p></div>' +
      '</section>';
    }

    if (project.panorama) {
      var panoramaURL = resolveAssetURL(project.panorama) || project.panorama;
      var panoramaPoster = project.panoramaThumbnail ? (resolveAssetURL(project.panoramaThumbnail) || project.panoramaThumbnail) : "";
      html += '<section class="media-panel" id="panoramaPanel">' +
        '<div class="panorama-viewer-shell">' +
          '<div class="panorama-real-viewer" data-panorama-viewer data-panorama-src="' + escapeHTML(panoramaURL) + '" data-panorama-poster="' + escapeHTML(panoramaPoster) + '" aria-label="' + escapeHTML(project.titleCN + " 360° 全景") + '"></div>' +
          '<div class="panorama-loading" data-panorama-status><span></span><p>点击“入此空间”后加载 360° 全景。</p></div>' +
        '</div>' +
        '<div class="viewer-caption panorama-caption"><p>拖动旋转，滚轮或双指缩放。建议使用严格 2:1 的等距柱状全景图。</p><button class="button button-outline panorama-reload-button" type="button" data-reload-panorama><span>重新载入</span><em>Reload</em></button></div>' +
      '</section>';
    }
    return html;
  }

  function bindProjectGallery() {
    qsa("[data-project-gallery]").forEach(function (gallery) {
      if (gallery.dataset.galleryBound === "true") {
        return;
      }
      gallery.dataset.galleryBound = "true";

      var mainImage = qs("[data-gallery-main]", gallery);
      var currentLabel = qs("[data-gallery-current]", gallery);
      var countLabel = qs("[data-gallery-count]", gallery);
      var totalLabel = qs("[data-gallery-total]", gallery);
      var toggle = qs("[data-gallery-toggle]", gallery);
      var expanded = qs("[data-gallery-expanded]", gallery);
      var previous = qs("[data-gallery-prev]", gallery);
      var next = qs("[data-gallery-next]", gallery);
      var stage = qs("[data-gallery-stage]", gallery);
      var currentIndex = 0;
      var swipeStart = null;

      function thumbButtons() {
        return qsa("[data-gallery-thumb]", gallery).filter(function (button) {
          return button.isConnected;
        });
      }

      function expandedButtons() {
        return qsa("[data-gallery-expanded-item]", gallery).filter(function (button) {
          return button.isConnected;
        });
      }

      function sourceList() {
        return thumbButtons().map(function (button) {
          return button.getAttribute("data-gallery-src") || "";
        }).filter(Boolean);
      }

      function updateCount(total) {
        var value = String(total).padStart(2, "0");
        if (countLabel) { countLabel.textContent = value; }
        if (totalLabel) { totalLabel.textContent = value; }
      }

      function activate(index, options) {
        var sources = sourceList();
        if (!sources.length) {
          gallery.remove();
          return;
        }
        currentIndex = ((index % sources.length) + sources.length) % sources.length;
        if (mainImage) {
          mainImage.src = sources[currentIndex];
          mainImage.alt = "项目图片 " + String(currentIndex + 1).padStart(2, "0");
        }
        if (currentLabel) {
          currentLabel.textContent = String(currentIndex + 1).padStart(2, "0");
        }
        thumbButtons().forEach(function (button, buttonIndex) {
          var active = buttonIndex === currentIndex;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", active ? "true" : "false");
          if (active && options && options.scrollThumb) {
            button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          }
        });
        expandedButtons().forEach(function (button, buttonIndex) {
          button.classList.toggle("is-active", buttonIndex === currentIndex);
        });
        updateCount(sources.length);
      }

      function removeFailedSource(url) {
        thumbButtons().forEach(function (button) {
          if (button.getAttribute("data-gallery-src") === url) {
            button.remove();
          }
        });
        expandedButtons().forEach(function (button) {
          var image = qs("img", button);
          if (image && image.src === url) {
            button.remove();
          }
        });
        activate(Math.min(currentIndex, Math.max(sourceList().length - 1, 0)));
      }

      thumbButtons().forEach(function (button) {
        button.addEventListener("click", function () {
          var buttons = thumbButtons();
          activate(buttons.indexOf(button), { scrollThumb: true });
        });
        var image = qs("img", button);
        if (image) {
          image.addEventListener("error", function () {
            removeFailedSource(button.getAttribute("data-gallery-src") || image.src);
          }, { once: true });
        }
      });

      expandedButtons().forEach(function (button) {
        button.addEventListener("click", function () {
          var buttons = expandedButtons();
          activate(buttons.indexOf(button), { scrollThumb: true });
          gallery.classList.remove("is-expanded");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.querySelector("span").textContent = "展开全部";
            toggle.querySelector("em").textContent = "Expand";
          }
          if (expanded) {
            expanded.setAttribute("aria-hidden", "true");
          }
          if (stage) {
            stage.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
        var image = qs("img", button);
        if (image) {
          image.addEventListener("error", function () {
            button.remove();
          }, { once: true });
        }
      });

      if (mainImage) {
        mainImage.addEventListener("error", function () {
          removeFailedSource(mainImage.src);
        });
      }

      if (previous) {
        previous.addEventListener("click", function () {
          activate(currentIndex - 1, { scrollThumb: true });
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          activate(currentIndex + 1, { scrollThumb: true });
        });
      }

      if (stage && "PointerEvent" in window) {
        stage.addEventListener("pointerdown", function (event) {
          if (!event.isPrimary || event.button !== 0 || event.target.closest("button")) {
            return;
          }
          swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
          stage.classList.add("is-touching");
        }, { passive: true });

        stage.addEventListener("pointerup", function (event) {
          if (!swipeStart || swipeStart.id !== event.pointerId) {
            return;
          }
          var dx = event.clientX - swipeStart.x;
          var dy = event.clientY - swipeStart.y;
          stage.classList.remove("is-touching");
          swipeStart = null;
          if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.2) {
            return;
          }
          activate(currentIndex + (dx < 0 ? 1 : -1), { scrollThumb: true });
        }, { passive: true });

        stage.addEventListener("pointercancel", function () {
          swipeStart = null;
          stage.classList.remove("is-touching");
        }, { passive: true });
      }

      if (toggle && expanded) {
        toggle.addEventListener("click", function () {
          var open = !gallery.classList.contains("is-expanded");
          gallery.classList.toggle("is-expanded", open);
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          toggle.querySelector("span").textContent = open ? "收起图集" : "展开全部";
          toggle.querySelector("em").textContent = open ? "Collapse" : "Expand";
          expanded.setAttribute("aria-hidden", open ? "false" : "true");
        });
      }

      gallery.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          activate(currentIndex - 1, { scrollThumb: true });
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          activate(currentIndex + 1, { scrollThumb: true });
        }
      });

      activate(0);
    });
  }

  function bindModalMedia(project) {
    bindProjectGallery();
    qsa("[data-panel-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var targetId = button.getAttribute("data-panel-target");
        var target = qs("#" + targetId);
        if (!target) {
          return;
        }
        qsa(".media-panel").forEach(function (panel) {
          panel.classList.remove("is-visible");
        });
        target.classList.add("is-visible");
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (targetId === "panoramaPanel" && project.panorama) {
          loadPanoramaViewer(project.panorama, project.panoramaThumbnail);
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

    var reloadPanoramaButton = qs("[data-reload-panorama]");
    if (reloadPanoramaButton) {
      reloadPanoramaButton.addEventListener("click", function () {
        loadPanoramaViewer(project.panorama, project.panoramaThumbnail, true);
      });
    }
  }

  function loadModelViewer(modelPath) {
    var resolved = resolveAssetURL(modelPath) || modelPath || "";
    var viewer = qs("[data-model-viewer]");
    if (viewer) {
      if (resolved) {
        viewer.setAttribute("src", resolved);
      }
      viewer.setAttribute("camera-orbit", "0deg 65deg auto");
      viewer.setAttribute("min-camera-orbit", "-180deg 32deg auto");
      viewer.setAttribute("max-camera-orbit", "180deg 88deg auto");
      viewer.setAttribute("disable-pan", "");
      if (typeof viewer.jumpCameraToGoal === "function") {
        try {
          viewer.jumpCameraToGoal();
        } catch (error) {
          /* model-viewer may not be ready yet */
        }
      }
    }
    var canvas = qs("[data-model-canvas]");
    if (canvas) {
      drawMockModel(canvas, resolved);
    }
  }

  function destroyPanoramaViewer() {
    if (activePanoramaViewer && typeof activePanoramaViewer.destroy === "function") {
      try {
        activePanoramaViewer.destroy();
      } catch (error) {
        console.warn("Panorama destroy error:", error);
      }
    }
    activePanoramaViewer = null;
    var container = qs("[data-panorama-viewer]");
    if (container) {
      container.innerHTML = "";
    }
  }

  function loadPanoramaViewer(panoramaPath, posterPath, forceReload) {
    var container = qs("[data-panorama-viewer]");
    var status = qs("[data-panorama-status]");
    if (!container) {
      return;
    }

    var resolved = resolveAssetURL(panoramaPath) || panoramaPath || container.getAttribute("data-panorama-src") || "";
    var poster = resolveAssetURL(posterPath) || posterPath || container.getAttribute("data-panorama-poster") || "";

    function setStatus(message, tone) {
      if (!status) {
        return;
      }
      status.classList.remove("is-loading", "is-error", "is-warning", "is-hidden");
      if (tone) {
        status.classList.add(tone);
      }
      status.querySelector("p").textContent = message;
    }

    if (!resolved) {
      setStatus("未填写全景图路径。", "is-error");
      return;
    }

    if (window.location && window.location.protocol === "file:") {
      setStatus("当前是 file:/// 本地直接打开模式，浏览器会阻止真实全景加载。请使用 GitHub Pages 或 Live Server 预览。", "is-error");
      return;
    }

    if (!window.pannellum || typeof window.pannellum.viewer !== "function") {
      setStatus("全景查看器组件未加载，请检查网络或 Pannellum CDN。", "is-error");
      return;
    }

    if (activePanoramaViewer && !forceReload) {
      try {
        activePanoramaViewer.resize();
      } catch (error) {
        /* noop */
      }
      return;
    }

    destroyPanoramaViewer();
    setStatus("正在读取并校验全景图片…", "is-loading");

    var probe = new Image();
    probe.decoding = "async";
    probe.onload = function () {
      var ratio = probe.naturalHeight ? probe.naturalWidth / probe.naturalHeight : 0;
      var ratioOK = ratio >= 1.95 && ratio <= 2.05;

      if (!ratioOK) {
        setStatus("图片可以尝试加载，但比例为 " + ratio.toFixed(2) + ":1；标准 360° 全景应接近 2:1，显示可能变形。", "is-warning");
      } else {
        setStatus("正在初始化 360° 场景…", "is-loading");
      }

      try {
        activePanoramaViewer = window.pannellum.viewer(container, {
          type: "equirectangular",
          panorama: resolved,
          preview: poster || undefined,
          autoLoad: true,
          showControls: true,
          showFullscreenCtrl: true,
          compass: false,
          keyboardZoom: true,
          mouseZoom: true,
          draggable: true,
          hfov: 100,
          minHfov: 45,
          maxHfov: 120,
          pitch: 0,
          yaw: 0,
          autoRotate: 0,
          crossOrigin: "anonymous"
        });

        if (activePanoramaViewer && typeof activePanoramaViewer.on === "function") {
          activePanoramaViewer.on("load", function () {
            if (status) {
              status.classList.add("is-hidden");
            }
            window.setTimeout(function () {
              if (activePanoramaViewer && typeof activePanoramaViewer.resize === "function") {
                activePanoramaViewer.resize();
              }
            }, 80);
          });
          activePanoramaViewer.on("error", function (error) {
            setStatus("全景加载失败。请检查路径、文件名大小写、图片格式与 GitHub 路径。", "is-error");
            console.warn("Panorama load error:", error);
          });
        }
      } catch (error) {
        setStatus("全景查看器初始化失败：" + (error && error.message ? error.message : "未知错误"), "is-error");
        console.warn("Panorama init error:", error);
      }
    };

    probe.onerror = function () {
      setStatus("全景图片路径无法读取。请检查路径、文件名大小写，以及文件是否已上传到 GitHub。", "is-error");
    };

    try {
      probe.crossOrigin = "anonymous";
      probe.src = resolved;
    } catch (error) {
      setStatus("全景图片路径无效。", "is-error");
    }
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
    var backdrop = qs("#mobileNavBackdrop");
    if (!panel || !button) {
      return;
    }
    var open = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    document.body.classList.toggle("mobile-nav-open", open);
    if (backdrop) {
      backdrop.tabIndex = open ? 0 : -1;
    }
    if (open) {
      lockMobilePageScroll("mobileNav");
      var firstLink = qs("a", panel);
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, 80);
      }
    } else {
      unlockMobilePageScroll("mobileNav");
    }
  }

  function closeMobileNav() {
    var panel = qs("#mobileNavPanel");
    var button = qs("#mobileMenuButton");
    var backdrop = qs("#mobileNavBackdrop");
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (button) {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "打开导航");
    }
    if (backdrop) {
      backdrop.tabIndex = -1;
    }
    document.body.classList.remove("mobile-nav-open");
    unlockMobilePageScroll("mobileNav");
  }

  function bindAdminEvents() {
    state.adminSavedSections = readAdminSectionStatus();
    bindAdminDirtyTracking();
    var saveCurrentAdminPanelButton = qs("#saveCurrentAdminPanelButton");
    if (saveCurrentAdminPanelButton && saveCurrentAdminPanelButton.dataset.bound !== "true") {
      saveCurrentAdminPanelButton.dataset.bound = "true";
      saveCurrentAdminPanelButton.addEventListener("click", saveCurrentAdminPanel);
    }
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
        renderAdminSectionSaveState();
      });
    });

    var adminTabsToggle = qs("#adminTabsToggle");
    if (adminTabsToggle) {
      adminTabsToggle.addEventListener("click", function () {
        var consolePanel = qs("#adminConsole");
        if (!consolePanel) {
          return;
        }
        var collapsed = !consolePanel.classList.contains("admin-tabs-collapsed");
        consolePanel.classList.toggle("admin-tabs-collapsed", collapsed);
        adminTabsToggle.setAttribute("aria-pressed", collapsed ? "true" : "false");
        adminTabsToggle.textContent = collapsed ? "展开目录" : "收起目录";
      });
    }

    var publishToggle = qs("#togglePublishWorkflowButton");
    var publishWorkflow = qs("#adminPublishWorkflow");
    if (publishToggle && publishWorkflow) {
      publishToggle.addEventListener("click", function () {
        var open = publishWorkflow.classList.contains("is-collapsed");
        publishWorkflow.classList.toggle("is-collapsed", !open);
        publishWorkflow.classList.toggle("is-open", open);
        publishToggle.classList.toggle("is-active", open);
      });
    }

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
        if (typeof window !== "undefined" && window.confirm) {
          var ok = window.confirm("这是“设置 JSON”，只包含首页文案、联系方式、视觉路径等设置，不包含项目与导航数据。\n\n正式发布到 GitHub 时，请优先使用“导出完整站点数据 site-data.json”。\n\n仍然导出设置 JSON？");
          if (!ok) {
            return;
          }
        }
        exportJSON("site-settings-only.json", siteSettings);
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
    bindResearchEditorEvents();
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
    markAdminPanelSaved("backgrounds", "板块背景");
    showAdminStamp("板块背景已暂存");
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

  function allowedArticleBlockType(type) {
    return ["heading", "paragraph", "image", "gallery", "quote", "divider"].indexOf(type) !== -1;
  }

  function articleBlockHasContent(block) {
    if (!block || !allowedArticleBlockType(block.type)) {
      return false;
    }
    if (block.type === "divider") {
      return false;
    }
    if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
      return Boolean(String(block.text || "").trim());
    }
    if (block.type === "image") {
      var kind = assetKind(block.asset);
      return Boolean(block.asset) && (kind === "image" || kind === "gif");
    }
    if (block.type === "gallery") {
      return parseList(block.assets).some(function (asset) {
        var kind = assetKind(asset);
        return kind === "image" || kind === "gif";
      });
    }
    return false;
  }

  function readPendingArticleBlock() {
    var type = qs("#articleBlockType") ? qs("#articleBlockType").value : "paragraph";
    if (!allowedArticleBlockType(type)) {
      type = "paragraph";
    }
    var text = qs("#articleBlockText") ? qs("#articleBlockText").value : "";
    var assetText = qs("#articleBlockAsset") ? qs("#articleBlockAsset").value.trim() : "";
    var caption = qs("#articleBlockCaption") ? qs("#articleBlockCaption").value : "";
    var block = {
      type: type,
      text: text,
      asset: type === "gallery" ? "" : assetText,
      assets: type === "gallery" ? parseList(assetText) : [],
      poster: "",
      thumbnail: "",
      caption: caption,
      label: caption
    };
    return normalizeArticleBlocks([block])[0];
  }

  function clearArticleComposerInputs() {
    var text = qs("#articleBlockText");
    var asset = qs("#articleBlockAsset");
    var caption = qs("#articleBlockCaption");
    var preview = qs("#articlePathPreview");
    if (text) { text.value = ""; }
    if (asset) { asset.value = ""; }
    if (caption) { caption.value = ""; }
    if (preview) { preview.innerHTML = ""; }
  }

  function collectArticleBlocksFromEditor() {
    var list = qs("#articleBlockList");
    if (!list) {
      return [];
    }
    var result = [];
    qsa("[data-article-block]", list).forEach(function (node) {
      var typeField = qs('[data-article-field="type"]', node);
      var textField = qs('[data-article-field="text"]', node);
      var assetField = qs('[data-article-field="asset"]', node);
      var captionField = qs('[data-article-field="caption"]', node);
      var type = typeField && allowedArticleBlockType(typeField.value) ? typeField.value : "paragraph";
      var assetText = assetField ? assetField.value.trim() : "";
      var block = {
        type: type,
        text: textField ? textField.value : "",
        asset: type === "gallery" ? "" : assetText,
        assets: type === "gallery" ? parseList(assetText) : [],
        poster: "",
        thumbnail: "",
        caption: captionField ? captionField.value : "",
        label: captionField ? captionField.value : ""
      };
      expandArticleBlockForSave(block).forEach(function (expanded) {
        result.push(expanded);
      });
    });
    return normalizeArticleBlocks(result);
  }

  function syncArticleBlocksToProject(projectId, blocks) {
    var normalized = normalizeArticleBlocks(blocks);
    var sourceProject = projects.find(function (item) { return item.id === projectId; });
    if (sourceProject) {
      sourceProject.articleBlocks = clone(normalized);
    }
    var renderedProject = state.projects.find(function (item) { return item.id === projectId; });
    if (renderedProject) {
      renderedProject.articleBlocks = clone(normalized);
    }
    return normalized;
  }

  function getArticleEditorDraft(projectId) {
    if (!projectId) {
      return [];
    }
    if (!Object.prototype.hasOwnProperty.call(state.articleEditorDrafts, projectId)) {
      var project = projects.find(function (item) { return item.id === projectId; });
      state.articleEditorDrafts[projectId] = project ? sanitizeArticleBlocks(project.articleBlocks) : [];
    }
    return clone(state.articleEditorDrafts[projectId]);
  }

  function setArticleEditorDraft(projectId, blocks) {
    if (!projectId) {
      return [];
    }
    var normalized = sanitizeArticleBlocks(blocks);
    state.articleEditorDrafts[projectId] = clone(normalized);
    markAdminPanelDirty("article");
    return normalized;
  }

  function resetArticleEditorDraft(projectId) {
    if (!projectId) {
      return;
    }
    delete state.articleEditorDrafts[projectId];
  }


  function researchArticleById(id) {
    return researchArticles.find(function (item) { return item.id === id; }) || null;
  }

  function getResearchEditorDraft(id) {
    if (!id) { return []; }
    if (!Object.prototype.hasOwnProperty.call(state.researchEditorDrafts, id)) {
      var article = researchArticleById(id);
      state.researchEditorDrafts[id] = article ? sanitizeArticleBlocks(article.articleBlocks) : [];
    }
    return clone(state.researchEditorDrafts[id]);
  }

  function setResearchEditorDraft(id, blocks) {
    if (!id) { return []; }
    var normalized = sanitizeArticleBlocks(blocks);
    state.researchEditorDrafts[id] = clone(normalized);
    markAdminPanelDirty("research");
    return normalized;
  }

  function readResearchMetaForm() {
    var id = (qs("#researchArticleId") && qs("#researchArticleId").value) || state.activeResearchEditorId || "";
    return {
      id: id || ("r" + Date.now()),
      number: (qs("#researchArticleNumber") && qs("#researchArticleNumber").value.trim()) || nextResearchNumber(),
      titleCN: (qs("#researchArticleTitleCN") && qs("#researchArticleTitleCN").value.trim()) || "未命名研究",
      titleEN: (qs("#researchArticleTitleEN") && qs("#researchArticleTitleEN").value.trim()) || "",
      topic: (qs("#researchArticleTopic") && qs("#researchArticleTopic").value.trim()) || "Research Note",
      date: (qs("#researchArticleDate") && qs("#researchArticleDate").value.trim()) || "",
      author: (qs("#researchArticleAuthor") && qs("#researchArticleAuthor").value.trim()) || "SOVEN Research",
      readTime: (qs("#researchArticleReadTime") && qs("#researchArticleReadTime").value.trim()) || "",
      summary: (qs("#researchArticleSummary") && qs("#researchArticleSummary").value.trim()) || "",
      coverImage: (qs("#researchArticleCover") && qs("#researchArticleCover").value.trim()) || "",
      tags: parseTags((qs("#researchArticleTags") && qs("#researchArticleTags").value) || ""),
      featured: Boolean(qs("#researchArticleFeatured") && qs("#researchArticleFeatured").checked),
      visible: Boolean(qs("#researchArticleVisible") && qs("#researchArticleVisible").checked)
    };
  }

  function fillResearchMetaForm(article) {
    var current = article || null;
    var id = current ? current.id : ("r" + Date.now());
    state.activeResearchEditorId = id;
    var values = {
      researchArticleId: id,
      researchArticleNumber: current ? current.number : nextResearchNumber(),
      researchArticleTopic: current ? current.topic : "",
      researchArticleTitleCN: current ? current.titleCN : "",
      researchArticleTitleEN: current ? current.titleEN : "",
      researchArticleDate: current ? current.date : new Date().getFullYear().toString(),
      researchArticleAuthor: current ? current.author : "SOVEN Research",
      researchArticleReadTime: current ? current.readTime : "",
      researchArticleCover: current ? current.coverImage : "",
      researchArticleSummary: current ? current.summary : "",
      researchArticleTags: current ? current.tags.join(", ") : ""
    };
    Object.keys(values).forEach(function (key) {
      var input = qs("#" + key);
      if (input) { input.value = values[key]; }
    });
    var featured = qs("#researchArticleFeatured");
    var visible = qs("#researchArticleVisible");
    if (featured) { featured.checked = current ? current.featured : false; }
    if (visible) { visible.checked = current ? isResearchArticleVisible(current) : true; }
    state.researchEditorDrafts[id] = current ? sanitizeArticleBlocks(current.articleBlocks) : [];
    clearResearchComposer();
    renderResearchBlockList();
  }

  function renderResearchEditorControls() {
    var select = qs("#researchArticleSelect");
    if (!select) { return; }
    var currentId = state.activeResearchEditorId;
    select.innerHTML = '<option value="">＋ 新建研究文章</option>' + (state.researchArticles || []).map(function (article) {
      return '<option value="' + escapeHTML(article.id) + '">' + escapeHTML(article.number + " / " + article.titleCN) + (isResearchArticleVisible(article) ? "" : " / 已隐藏") + '</option>';
    }).join("");
    if (currentId && researchArticleById(currentId)) {
      select.value = currentId;
      fillResearchMetaForm(researchArticleById(currentId));
    } else if (state.researchArticles && state.researchArticles.length) {
      select.value = state.researchArticles[0].id;
      fillResearchMetaForm(researchArticleById(state.researchArticles[0].id));
    } else {
      select.value = "";
      fillResearchMetaForm(null);
    }
  }

  function researchBlockEditorHTML(block, index) {
    var types = ["heading", "paragraph", "image", "gallery", "quote", "divider"];
    var options = types.map(function (type) {
      return '<option value="' + type + '"' + (block.type === type ? " selected" : "") + '>' + type + '</option>';
    }).join("");
    var asset = block.type === "gallery" ? formatPathList(block.assets) : (block.asset || "");
    return '<div class="article-block-editor research-block-editor" data-research-block="' + index + '">' +
      '<div class="article-block-editor-head"><strong>' + String(index + 1).padStart(2, "0") + '</strong><div><button class="icon-button" type="button" data-research-up="' + index + '">↑</button><button class="icon-button" type="button" data-research-down="' + index + '">↓</button><button class="icon-button" type="button" data-research-delete="' + index + '">×</button></div></div>' +
      '<label>类型<select data-research-field="type">' + options + '</select></label>' +
      '<label>文字<textarea data-research-field="text" rows="4">' + escapeHTML(block.text || "") + '</textarea></label>' +
      '<label>图片路径<textarea data-research-field="asset" rows="3">' + escapeHTML(asset) + '</textarea></label>' +
      '<label>图片说明<input data-research-field="caption" value="' + escapeHTML(block.caption || "") + '"></label>' +
    '</div>';
  }

  function collectResearchBlocksFromEditor() {
    var list = qs("#researchBlockList");
    if (!list) { return []; }
    var result = [];
    qsa("[data-research-block]", list).forEach(function (node) {
      var type = (qs('[data-research-field="type"]', node) || {}).value || "paragraph";
      var text = (qs('[data-research-field="text"]', node) || {}).value || "";
      var assetText = ((qs('[data-research-field="asset"]', node) || {}).value || "").trim();
      var caption = (qs('[data-research-field="caption"]', node) || {}).value || "";
      var block = { type: type, text: text, asset: type === "gallery" ? "" : assetText, assets: type === "gallery" ? parseList(assetText) : [], caption: caption, label: caption, poster: "", thumbnail: "" };
      expandArticleBlockForSave(block).forEach(function (item) { result.push(item); });
    });
    return sanitizeArticleBlocks(result);
  }

  function renderResearchBlockList() {
    var list = qs("#researchBlockList");
    if (!list) { return; }
    var blocks = getResearchEditorDraft(state.activeResearchEditorId);
    list.innerHTML = blocks.length ? blocks.map(researchBlockEditorHTML).join("") : '<div class="article-empty-editor"><strong>当前没有研究正文块</strong><p>填写上方内容并点击“新增块”后，才会生成正文结构。</p></div>';
    qsa("[data-research-delete]", list).forEach(function (button) {
      button.addEventListener("click", function () { removeResearchBlock(Number(button.getAttribute("data-research-delete"))); });
    });
    qsa("[data-research-up]", list).forEach(function (button) {
      button.addEventListener("click", function () { moveResearchBlock(Number(button.getAttribute("data-research-up")), -1); });
    });
    qsa("[data-research-down]", list).forEach(function (button) {
      button.addEventListener("click", function () { moveResearchBlock(Number(button.getAttribute("data-research-down")), 1); });
    });
  }

  function readPendingResearchBlock() {
    var type = (qs("#researchBlockType") && qs("#researchBlockType").value) || "paragraph";
    var text = (qs("#researchBlockText") && qs("#researchBlockText").value) || "";
    var assetText = (qs("#researchBlockAsset") && qs("#researchBlockAsset").value.trim()) || "";
    var caption = (qs("#researchBlockCaption") && qs("#researchBlockCaption").value) || "";
    return { type: type, text: text, asset: type === "gallery" ? "" : assetText, assets: type === "gallery" ? parseList(assetText) : [], caption: caption, label: caption, poster: "", thumbnail: "" };
  }

  function clearResearchComposer() {
    ["researchBlockText", "researchBlockAsset", "researchBlockCaption"].forEach(function (id) {
      var input = qs("#" + id); if (input) { input.value = ""; }
    });
  }

  function addResearchBlock() {
    var block = readPendingResearchBlock();
    if (!isMeaningfulArticleBlock(block)) {
      showAdminStamp("请先填写研究正文内容");
      return;
    }
    var current = collectResearchBlocksFromEditor();
    if (!current.length) { current = getResearchEditorDraft(state.activeResearchEditorId); }
    var additions = block.type === "divider" ? [block] : expandArticleBlockForSave(block);
    setResearchEditorDraft(state.activeResearchEditorId, current.concat(additions));
    clearResearchComposer();
    renderResearchBlockList();
    showAdminStamp("研究正文块已新增，尚未保存");
  }

  function removeResearchBlock(index) {
    var blocks = collectResearchBlocksFromEditor();
    if (!blocks.length) { blocks = getResearchEditorDraft(state.activeResearchEditorId); }
    if (index < 0 || index >= blocks.length) { return; }
    blocks.splice(index, 1);
    setResearchEditorDraft(state.activeResearchEditorId, blocks);
    renderResearchBlockList();
  }

  function moveResearchBlock(index, direction) {
    var blocks = collectResearchBlocksFromEditor();
    if (!blocks.length) { blocks = getResearchEditorDraft(state.activeResearchEditorId); }
    var target = index + direction;
    if (index < 0 || target < 0 || index >= blocks.length || target >= blocks.length) { return; }
    var item = blocks.splice(index, 1)[0];
    blocks.splice(target, 0, item);
    setResearchEditorDraft(state.activeResearchEditorId, blocks);
    renderResearchBlockList();
  }

  async function saveResearchArticle() {
    var pending = readPendingResearchBlock();
    if (isMeaningfulArticleBlock(pending)) {
      if (window.alert) { window.alert("研究正文编辑器中还有尚未新增的内容，请先点击“新增块”。"); }
      showAdminStamp("请先新增研究正文块");
      return;
    }
    var meta = readResearchMetaForm();
    var blocks = collectResearchBlocksFromEditor();
    if (!blocks.length) { blocks = getResearchEditorDraft(meta.id); }
    var existingIndex = researchArticles.findIndex(function (item) { return item.id === meta.id; });
    var previous = existingIndex >= 0 ? researchArticles[existingIndex] : null;
    var next = normalizeResearchArticle(Object.assign({}, previous || {}, meta, { articleBlocks: blocks, order: previous ? previous.order : researchArticles.length }), existingIndex >= 0 ? existingIndex : researchArticles.length);
    if (next.featured) {
      researchArticles.forEach(function (item) { item.featured = false; });
    }
    if (existingIndex >= 0) { researchArticles[existingIndex] = next; }
    else { researchArticles.push(next); }
    researchArticles = normalizeResearchArticles(researchArticles);
    state.activeResearchEditorId = next.id;
    state.researchEditorDrafts[next.id] = clone(next.articleBlocks);
    writeStorage();
    await refreshData();
    renderResearch();
    renderResearchEditorControls();
    renderPathReport();
    markAdminPanelSaved("research", "研究文章");
    showAdminStamp("研究文章已暂存 · " + next.number);
  }

  function newResearchArticle() {
    state.activeResearchEditorId = "";
    fillResearchMetaForm(null);
    var select = qs("#researchArticleSelect");
    if (select) { select.value = ""; }
    markAdminPanelDirty("research");
    showAdminStamp("已建立新的研究文章草稿");
  }

  async function deleteResearchArticle() {
    var id = state.activeResearchEditorId;
    var existing = researchArticleById(id);
    if (!existing) {
      newResearchArticle();
      return;
    }
    if (window.confirm && !window.confirm("这是永久删除，不是隐藏。确定彻底删除研究文章“" + existing.titleCN + "”？")) { return; }
    researchArticles = researchArticles.filter(function (item) { return item.id !== id; });
    delete state.researchEditorDrafts[id];
    state.activeResearchEditorId = "";
    writeStorage();
    await refreshData();
    renderResearch();
    renderResearchEditorControls();
    markAdminPanelSaved("research", "研究文章");
    showAdminStamp("研究文章已删除并暂存");
  }

  function bindResearchEditorEvents() {
    var select = qs("#researchArticleSelect");
    if (select) {
      select.addEventListener("change", function () {
        var id = select.value;
        if (!id) { newResearchArticle(); return; }
        state.activeResearchEditorId = id;
        fillResearchMetaForm(researchArticleById(id));
        renderAdminSectionSaveState();
      });
    }
    var add = qs("#addResearchBlockButton"); if (add) { add.addEventListener("click", addResearchBlock); }
    var save = qs("#saveResearchArticleButton"); if (save) { save.addEventListener("click", saveResearchArticle); }
    var fresh = qs("#newResearchArticleButton"); if (fresh) { fresh.addEventListener("click", newResearchArticle); }
    var remove = qs("#deleteResearchArticleButton"); if (remove) { remove.addEventListener("click", deleteResearchArticle); }
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
        clearArticleComposerInputs();
        renderArticleEditorControls();
        renderAdminSectionSaveState();
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
    if (!select || !list) {
      return;
    }
    var current = state.activeArticleProjectId || select.value || (state.projects[0] && state.projects[0].id) || "";
    select.innerHTML = state.projects.map(function (project) {
      return '<option value="' + escapeHTML(project.id) + '">' + escapeHTML(project.titleCN) + ' / ' + escapeHTML(project.year) + '</option>';
    }).join("");
    state.activeArticleProjectId = state.projects.some(function (project) {
      return project.id === current;
    }) ? current : (state.projects[0] && state.projects[0].id) || "";
    select.value = state.activeArticleProjectId;
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

    var blocks = getArticleEditorDraft(project.id);
    list.innerHTML = '<h4>' + escapeHTML(project.titleCN) + ' / 图文文章</h4>' +
      (blocks.length
        ? blocks.map(function (block, index) {
            return articleBlockEditorHTML(block, index, project.id);
          }).join("")
        : '<div class="article-empty-editor"><strong>当前没有文章块</strong><p>点击上方“新增块”后，才会生成一个新的内容块。</p></div>');

    qsa("[data-article-delete]", list).forEach(function (button) {
      button.addEventListener("click", function () {
        removeArticleBlock(Number(button.getAttribute("data-article-delete")));
      });
    });

    qsa("[data-article-up]", list).forEach(function (button) {
      button.addEventListener("click", function () {
        moveArticleBlock(Number(button.getAttribute("data-article-up")), -1);
      });
    });

    qsa("[data-article-down]", list).forEach(function (button) {
      button.addEventListener("click", function () {
        moveArticleBlock(Number(button.getAttribute("data-article-down")), 1);
      });
    });
  }

  function articleBlockEditorHTML(block, index, projectId) {
    var allowedTypes = ["heading", "paragraph", "image", "gallery", "quote", "divider"];
    var currentType = allowedTypes.indexOf(block.type) !== -1 ? block.type : "paragraph";
    var typeOptions = allowedTypes.map(function (type) {
      return '<option value="' + type + '"' + (currentType === type ? " selected" : "") + '>' + type + '</option>';
    }).join("");
    var assetValue = currentType === "gallery" ? formatPathList(block.assets) : (block.asset || "");
    return '<div class="article-block-editor" data-article-block="' + index + '">' +
      '<div class="article-block-editor-head"><strong>' + String(index + 1).padStart(2, "0") + '</strong><div><button class="icon-button" type="button" data-article-up="' + index + '">↑</button><button class="icon-button" type="button" data-article-down="' + index + '">↓</button><button class="icon-button" type="button" data-article-delete="' + index + '">×</button></div></div>' +
      '<label>类型<select data-article-field="type">' + typeOptions + '</select></label>' +
      '<label>文字<textarea data-article-field="text" rows="3">' + escapeHTML(block.text) + '</textarea></label>' +
      '<label>图片路径<textarea data-article-field="asset" rows="3" placeholder="图集支持一行一个图片路径">' + escapeHTML(assetValue) + '</textarea></label>' +
      '<input type="hidden" data-article-field="poster" value="">' +
      '<label>图片说明<input data-article-field="caption" value="' + escapeHTML(block.caption || "") + '"></label>' +
    '</div>';
  }

  async function addArticleBlockFromControls() {
    var projectId = state.activeArticleProjectId;
    var project = projects.find(function (item) { return item.id === projectId; });
    if (!project) {
      showAdminStamp("请选择项目");
      return;
    }

    var block = readPendingArticleBlock();
    if (!articleBlockHasContent(block) && block.type !== "divider") {
      showAdminStamp("请先填写文章内容");
      return;
    }

    var existing = collectArticleBlocksFromEditor();
    if (!existing.length) {
      existing = getArticleEditorDraft(projectId);
    }

    var additions = block.type === "divider" ? [block] : expandArticleBlockForSave(block);
    var nextBlocks = setArticleEditorDraft(projectId, existing.concat(additions));

    clearArticleComposerInputs();
    renderArticleBlockList();
    showAdminStamp("已新增 " + additions.length + " 个内容块，尚未保存文章");
    return nextBlocks;
  }

  async function saveArticleBlocksFromEditor() {
    var projectId = state.activeArticleProjectId;
    var project = projects.find(function (item) { return item.id === projectId; });
    if (!project) {
      showAdminStamp("请选择项目");
      return;
    }

    var pending = readPendingArticleBlock();
    if (articleBlockHasContent(pending) || pending.type === "divider") {
      if (typeof window !== "undefined" && window.alert) {
        window.alert("上方编辑器中还有尚未生成的内容。请先点击“新增块”，再保存文章。");
      }
      showAdminStamp("请先新增内容块");
      return;
    }

    var blocks = collectArticleBlocksFromEditor();
    if (!blocks.length) {
      blocks = getArticleEditorDraft(projectId);
    }

    var normalized = sanitizeArticleBlocks(blocks);
    syncArticleBlocksToProject(projectId, normalized);
    writeStorage();
    resetArticleEditorDraft(projectId);
    await refreshData();

    renderArticleBlockList();
    renderDataSourceStatus();
    markAdminPanelSaved("article", "项目文章");

    if (state.activeArticleId === projectId) {
      var active = await fetchProjectById(projectId);
      var content = qs("#projectArticleContent");
      if (active && content) {
        content.innerHTML = projectArticleHTML(active);
        bindArticleView(active);
      }
    }

    showAdminStamp("文章已暂存 · " + normalized.length + " 个内容块");
  }

  function previewArticleAssetFromControls() {
    var type = qs("#articleBlockType") ? qs("#articleBlockType").value : "image";
    var asset = qs("#articleBlockAsset") ? qs("#articleBlockAsset").value.trim() : "";
    var caption = qs("#articleBlockCaption") ? qs("#articleBlockCaption").value.trim() : "";
    var container = qs("#articlePathPreview");
    if (!container) {
      return;
    }
    var refs = type === "gallery" ? parseList(asset) : parseList(asset).slice(0, 1);
    refs = refs.filter(function (ref) {
      var kind = assetKind(ref);
      return kind === "image" || kind === "gif";
    });
    container.innerHTML = refs.length
      ? refs.map(function (ref) { return pathPreviewHTML(ref, "gallery", caption || ref); }).join("")
      : '<div class="path-preview-card asset-preview-empty"><strong>EMPTY</strong><span>请先填写有效图片路径。</span></div>';
    showAdminStamp("文章图片预览已更新");
  }

  async function uploadInlineArticleAsset() {
    var input = qs("#articleInlineFile");
    var file = input && input.files && input.files[0];
    if (!file) {
      showAdminStamp("请选择图片");
      return;
    }
    if (!file.type || file.type.indexOf("image/") !== 0) {
      showAdminStamp("图文文章仅支持图片");
      return;
    }
    try {
      if (!state.assetDbReady) {
        showAdminStamp("IndexedDB 不可用");
        return;
      }
      var asset = await saveAssetToDB(file, {
        type: "articleImage",
        projectId: state.activeArticleProjectId,
        sectionId: "",
        mime: file.type || inferMimeFromName(file.name),
        size: file.size || 0
      });
      await createAssetObjectURL(asset.id);
      await refreshData();
      var container = qs("#articlePathPreview");
      if (container) {
        container.innerHTML = pathPreviewHTML(asset.id, "gallery", asset.name) +
          '<p class="asset-note">本机上传仅用于预览。正式发布请将图片上传到 GitHub 的 assets 目录并填写相对路径。</p>';
      }
      if (input) {
        input.value = "";
      }
      showAdminStamp("本地图片已导入");
    } catch (error) {
      showAdminStamp("本地预览失败");
    }
  }

  function removeArticleBlock(index) {
    var projectId = state.activeArticleProjectId;
    if (!projectId) {
      return;
    }
    var blocks = collectArticleBlocksFromEditor();
    if (!blocks.length) {
      blocks = getArticleEditorDraft(projectId);
    }
    if (index < 0 || index >= blocks.length) {
      return;
    }
    if (typeof window !== "undefined" && window.confirm && !window.confirm("从当前文章草稿中删除这个内容块？")) {
      return;
    }
    blocks.splice(index, 1);
    setArticleEditorDraft(projectId, blocks);
    renderArticleBlockList();
    showAdminStamp("内容块已从编辑草稿删除，尚未保存文章");
  }

  function moveArticleBlock(index, direction) {
    var projectId = state.activeArticleProjectId;
    if (!projectId) {
      return;
    }
    var blocks = collectArticleBlocksFromEditor();
    if (!blocks.length) {
      blocks = getArticleEditorDraft(projectId);
    }
    var nextIndex = index + direction;
    if (index < 0 || index >= blocks.length || nextIndex < 0 || nextIndex >= blocks.length) {
      return;
    }
    var item = blocks[index];
    blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, item);
    setArticleEditorDraft(projectId, blocks);
    renderArticleBlockList();
    showAdminStamp("顺序已调整，尚未保存文章");
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
    closeMobileNav();
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

  async function copyTextToClipboard(text, successMessage) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        var input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "readonly");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      showAdminStamp(successMessage || "已复制");
    } catch (error) {
      if (window.prompt) {
        window.prompt("请手动复制：", text);
      }
    }
  }


  function renderPublishCheckReport(report) {
    var box = qs("#publishCheckReport");
    if (!box) {
      return;
    }

    box.classList.remove("is-ok", "is-warn", "is-error");

    if (!report) {
      box.textContent = "发布检查失败：没有返回检查结果。";
      box.classList.add("is-error");
      return;
    }

    if (!report.jsonValid || report.siteData !== "ok") {
      var attempts = Array.isArray(report.attempts) && report.attempts.length
        ? "<br><small>详细路径已放入控制台；当前只显示前 2 条：</small><ul>" + report.attempts.slice(0, 2).map(function (item) { return "<li><code>" + escapeHTML(item) + "</code></li>"; }).join("") + "</ul>"
        : "";
      var localHint = isFileProtocolPreview()
        ? "<br><strong>本地预览提示：</strong>当前是 file:/// 打开，浏览器会拦截 JSON 读取。请用 VS Code Live Server / GitHub Pages，或点击“导入 JSON”。"
        : "";
      box.innerHTML = "<strong>检查失败</strong><br>site-data.json 无法读取或 JSON 格式错误。" + localHint + "<br><code>" + escapeHTML(report.error || "unknown error") + "</code>" + attempts;
      box.classList.add("is-error");
      return;
    }

    var missing = Array.isArray(report.missingAssets) ? report.missingAssets : [];
    var warnings = Array.isArray(report.warnings) ? report.warnings : [];
    var meta = "<br><small>读取路径：<code>" + escapeHTML(report.siteDataURL || "assets/data/site-data.json") + "</code></small><br><small>项目数量：" + (report.projectCount || 0) + "；素材路径：" + (report.checkedAssets || 0) + "</small>";

    if (!missing.length && !warnings.length) {
      box.innerHTML = "<strong>发布检查通过</strong>" + meta + "<br>site-data.json 可读取，结构有效，未发现缺失的 assets 路径。";
      box.classList.add("is-ok");
      return;
    }

    if (warnings.length && !missing.length) {
      box.innerHTML = "<strong>检查通过，但有结构提醒</strong>" + meta + "<ul>" + warnings.map(function (item) { return "<li>" + escapeHTML(item) + "</li>"; }).join("") + "</ul>";
      box.classList.add("is-warn");
      return;
    }

    var preview = missing.slice(0, 12).map(function (path) {
      return "<li><code>" + escapeHTML(path) + "</code></li>";
    }).join("");

    box.innerHTML = "<strong>发现缺失素材：" + missing.length + " 项</strong><br>请检查以下路径是否已经上传到 GitHub：<ul>" + preview + "</ul>" + (missing.length > 12 ? "<br>还有 " + (missing.length - 12) + " 项，请在控制台查看完整结果。" : "");
    box.classList.add("is-warn");
  }


  window.renderPublishCheckReport = renderPublishCheckReport;

  window.isAtelierFilePreview = isFileProtocolPreview;

  window.getAtelierDataStatus = function () {
    return {
      dataSource: state.dataSource,
      officialDataURL: state.officialDataURL || "",
      hasLocalDraft: !!state.hasLocalDraft,
      dataLoadError: state.dataLoadError || "",
      projectCount: Array.isArray(projects) ? projects.length : 0,
      renderedProjectCount: Array.isArray(state.projects) ? state.projects.length : 0,
      studioName: siteSettings && siteSettings.studioName ? siteSettings.studioName : ""
    };
  };

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
      var placements = formatProjectDisplaySections(project);
      var placementText = placements.length ? placements.join("、") : "不在任何板块显示";
      var visible = isProjectVisible(project);
      return '<div class="admin-list-item' + (visible ? '' : ' is-hidden-record') + '" data-admin-project="' + escapeHTML(project.id) + '"><div><strong>' + escapeHTML(project.titleCN) + '</strong><span>' + escapeHTML(project.category) + ' / ' + escapeHTML(project.year) + ' / ' + (visible ? "前台显示" : "已隐藏") + ' / 素材 ' + assetCount + '</span><small>板块：' + escapeHTML(placementText) + ' · 数据始终保留并参与 JSON 导出</small></div><div class="admin-item-actions"><button class="icon-button" type="button" title="编辑" data-edit-project="' + escapeHTML(project.id) + '">✎</button><button class="icon-button visibility-toggle-button" type="button" title="' + (visible ? '隐藏项目' : '显示项目') + '" aria-label="' + (visible ? '隐藏项目' : '显示项目') + '" data-toggle-project="' + escapeHTML(project.id) + '">' + (visible ? '◉' : '○') + '</button><button class="icon-button" type="button" title="永久删除" data-delete-project="' + escapeHTML(project.id) + '">×</button></div></div>';
    }).join("");

    qsa("[data-edit-project]", list).forEach(function (button) {
      button.addEventListener("click", function () {
        var project = state.projects.find(function (item) { return item.id === button.getAttribute("data-edit-project"); });
        fillProjectForm(project);
      });
    });

    qsa("[data-toggle-project]", list).forEach(function (button) {
      button.addEventListener("click", async function () {
        var changed = await togglePublishStatus(button.getAttribute("data-toggle-project"));
        await refreshData();
        renderAll();
        markAdminPanelSaved("projects", "项目案卷");
        showAdminStamp(changed && isProjectVisible(changed) ? "项目已恢复前台显示" : "项目已隐藏，数据仍保留");
      });
    });

    qsa("[data-delete-project]", list).forEach(function (button) {
      button.addEventListener("click", async function () {
        var project = state.projects.find(function (item) { return item.id === button.getAttribute("data-delete-project"); });
        if (!project) { return; }
        if (window.confirm && !window.confirm("这是永久删除，不是隐藏。确定彻底删除项目“" + project.titleCN + "”？")) {
          return;
        }
        await deleteProject(project.id);
        await refreshData();
        renderAll();
        markAdminPanelSaved("projects", "项目案卷");
        showAdminStamp("项目已永久删除");
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
    var selectedSections = project ? normalizeProjectDisplaySections(project.displaySections) : ["works"];
    qsa('input[name="displaySections"]', form).forEach(function (input) {
      input.checked = selectedSections.indexOf(input.value) !== -1;
    });
    if (form.elements.visible) {
      form.elements.visible.checked = project ? isProjectVisible(project) : true;
    }
  }

  async function handleProjectFormSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var visible = Boolean(form.elements.visible && form.elements.visible.checked);
    var selectedSections = readProjectDisplaySections(form);
    var data = {
      titleCN: form.elements.titleCN.value.trim(),
      titleEN: form.elements.titleEN.value.trim(),
      category: form.elements.category.value,
      year: form.elements.year.value.trim(),
      location: form.elements.location.value.trim(),
      status: form.elements.status.value.trim() || (visible ? "Published" : "Hidden"),
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
      displaySections: selectedSections,
      featured: selectedSections.indexOf("featured") !== -1,
      visible: visible
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
    markAdminPanelSaved("projects", "项目案卷");
    showAdminStamp(visible ? "案卷已暂存并显示" : "案卷已暂存并隐藏");
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
    var contact = normalizeContactContent(state.settings.contact, state.settings);
    form.elements.contactEmail.value = contact.email;
    form.elements.contactXiaohongshu.value = contact.xiaohongshu;
    form.elements.contactOfficialAccount.value = contact.officialAccount;
    form.elements.contactVx.value = contact.vx;
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
      contact: {
        email: form.elements.contactEmail.value.trim(),
        xiaohongshu: form.elements.contactXiaohongshu.value.trim(),
        officialAccount: form.elements.contactOfficialAccount.value.trim(),
        vx: form.elements.contactVx.value.trim()
      },
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
    markAdminPanelSaved("settings", "首页与联系");
    showAdminStamp("首页与联系已暂存");
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
    markAdminPanelSaved("assets", "素材路径");
    showAdminStamp("素材路径已暂存");
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
    parseList(project.gallery).forEach(function (url) { items.push({ type: "gallery", url: url }); });
    ["model3d", "modelThumbnail", "panorama", "panoramaThumbnail", "video", "videoPoster"].forEach(function (type) {
      if (project[type]) {
        items.push({ type: type, url: project[type] });
      }
    });
    normalizeArticleBlocks(project.articleBlocks).forEach(function (block) {
      if (block.type === "image" && block.asset) {
        items.push({ type: "articleImage", url: block.asset });
      }
      if (block.type === "gallery") {
        parseList(block.assets).forEach(function (url) {
          items.push({ type: "articleGallery", url: url });
        });
      }
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


  function detectImportJSONType(data) {
    if (Array.isArray(data)) {
      return "projects";
    }

    if (!data || typeof data !== "object") {
      return "unknown";
    }

    if (Array.isArray(data.projects) || data.siteSettings || data.navigation || data.methods || data.researchArticles || /^northern-atelier-site-data-v[12]$/.test(String(data.schema || ""))) {
      return "full";
    }

    if (isPlainSettingsData(data) || data.settings) {
      return "settings";
    }

    return "unknown";
  }

  function describeImportJSONType(type) {
    switch (type) {
      case "full":
        return "完整站点数据 site-data.json";
      case "settings":
        return "设置 JSON";
      case "projects":
        return "项目 JSON";
      default:
        return "未知 JSON";
    }
  }

  function askImportConfirmation(message) {
    if (typeof window === "undefined" || !window.confirm) {
      return true;
    }
    return window.confirm(message);
  }

  function notifyImportError(message) {
    if (typeof window !== "undefined" && window.alert) {
      window.alert(message);
    }
    showAdminStamp(message);
  }

  async function handleProjectsImport(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      var data = await readJSONFile(file);
      var type = detectImportJSONType(data);

      if (type === "projects") {
        projects = data.map(normalizeProject);
      } else if (type === "full" && Array.isArray(data.projects)) {
        if (!askImportConfirmation("检测到这是完整站点数据，不是单独项目 JSON。\n\n是否只导入其中的 projects 项目列表？")) {
          event.target.value = "";
          return;
        }
        projects = data.projects.map(normalizeProject);
      } else {
        notifyImportError("当前文件类型为：" + describeImportJSONType(type) + "。请导入项目 JSON，或使用“导入完整站点数据”。");
        event.target.value = "";
        return;
      }

      writeStorage();
      await refreshData();
      renderAll();
      showAdminStamp("项目数据已导入为本机草稿");
    } catch (error) {
      notifyImportError("项目 JSON 导入失败：" + (error && error.message ? error.message : "未知错误"));
    } finally {
      event.target.value = "";
    }
  }

  async function handleSettingsImport(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      var data = await readJSONFile(file);
      var type = detectImportJSONType(data);

      if (type === "settings") {
        siteSettings = normalizeSiteSettings(data);
      } else if (type === "full") {
        if (!askImportConfirmation("检测到这是完整站点数据。\n\n是否只导入其中的 siteSettings 设置部分？项目、导航和方法数据将保持当前状态。")) {
          event.target.value = "";
          return;
        }
        siteSettings = normalizeSiteSettings(data.siteSettings || data.settings || {});
      } else {
        notifyImportError("当前文件类型为：" + describeImportJSONType(type) + "。请导入设置 JSON，或使用“导入完整站点数据”。");
        event.target.value = "";
        return;
      }

      writeStorage();
      await refreshData();
      renderAll();
      showAdminStamp("设置数据已导入为本机草稿");
    } catch (error) {
      notifyImportError("设置 JSON 导入失败：" + (error && error.message ? error.message : "未知错误"));
    } finally {
      event.target.value = "";
    }
  }

  async function handleFullDataImport(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      var data = await readJSONFile(file);
      var type = detectImportJSONType(data);

      if (type === "full") {
        var normalized = normalizeSiteData(data);
        siteSettings = normalized.siteSettings;
        navigation = normalized.navigation;
        methods = normalized.methods;
        projects = normalized.projects;
        researchArticles = normalized.researchArticles;
        showAdminStamp("完整站点数据已导入为本机草稿");
      } else if (type === "settings") {
        if (!askImportConfirmation("检测到这是设置 JSON，不是完整 site-data.json。\n\n是否只导入设置，并保留当前项目、导航和方法数据？")) {
          event.target.value = "";
          return;
        }
        siteSettings = normalizeSiteSettings(data);
        showAdminStamp("设置 JSON 已合并为本机草稿");
      } else if (type === "projects") {
        if (!askImportConfirmation("检测到这是项目 JSON，不是完整 site-data.json。\n\n是否只导入项目列表，并保留当前站点设置？")) {
          event.target.value = "";
          return;
        }
        projects = data.map(normalizeProject);
        showAdminStamp("项目 JSON 已合并为本机草稿");
      } else {
        notifyImportError("无法识别 JSON 类型。请确认文件来自本站后台导出。");
        event.target.value = "";
        return;
      }

      writeStorage();
      await refreshData();
      renderAll();
    } catch (error) {
      notifyImportError("JSON 导入失败：" + (error && error.message ? error.message : "未知错误"));
    } finally {
      event.target.value = "";
    }
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
      strength: 0.34
    };

    var current = {
      x: 0,
      y: 0,
      lightX: 44,
      lightY: 48,
      strength: 0.34
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
      if (isMobileExperience()) {
        imageReadyTimer = window.setTimeout(markAssetsReady, 260);
        return;
      }

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
      target.strength = 0.34;
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
      target.strength = 0.34;

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
      hero.addEventListener("mousemove", handleMouseMove, { passive: true });
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

// V21_HOME_FX_RUNTIME
(function () {
  function applyV21HomeFxRuntime() {
    var spotlightSelectors = [
      ".hero-spotlight",
      ".hero-spotlight-core",
      ".hero-spotlight-glow",
      ".hero-light-orb",
      ".spotlight",
      ".spotlight-core",
      ".spotlight-glow",
      ".pointer-spotlight",
      ".light-spot"
    ];

    spotlightSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.dataset.v21HomeFxApplied) {
          el.style.willChange = "transform, opacity, filter";
          el.style.transformOrigin = "center center";
          el.dataset.v21HomeFxApplied = "1";
        }
      });
    });

    var sceneSelectors = [
      ".hero",
      ".hero-stage",
      ".hero-depth",
      ".hero-visual",
      ".hero-scene",
      ".hero-composite",
      ".hero-backdrop",
      ".hero-background"
    ];

    sceneSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.dataset.v21SceneFxApplied) {
          el.style.backfaceVisibility = "hidden";
          el.style.transformStyle = "preserve-3d";
          el.dataset.v21SceneFxApplied = "1";
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyV21HomeFxRuntime);
  } else {
    applyV21HomeFxRuntime();
  }
})();



// V22_PUBLISH_CHECK
window.runPublishCheck = async function () {
  function addUnique(list, value) {
    if (value && list.indexOf(value) === -1) {
      list.push(value);
    }
  }

  function withCheckBust(url) {
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "check=" + Date.now();
  }

  function siteDataCandidates() {
    var list = [];
    var siteData = "assets/data/site-data.json";
    addUnique(list, siteData);
    addUnique(list, "./" + siteData);

    try {
      addUnique(list, new URL(siteData, window.location.href).toString());
    } catch (error) {
      /* noop */
    }

    try {
      var basePath = window.location.pathname.replace(/\/[^\/]*$/, "/");
      addUnique(list, basePath + siteData);

      if (window.location.hostname && window.location.hostname.indexOf("github.io") !== -1) {
        var parts = window.location.pathname.split("/").filter(Boolean);
        if (parts.length) {
          addUnique(list, "/" + parts[0] + "/" + siteData);
        }
      }
    } catch (error) {
      /* noop */
    }

    return list;
  }

  async function readCandidate(url) {
    var response = await fetch(withCheckBust(url), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    var text = await response.text();
    try {
      return JSON.parse(text.replace(/^\uFEFF/, ""));
    } catch (error) {
      throw new Error("JSON 格式错误：" + (error && error.message ? error.message : "未知错误"));
    }
  }

  var report = {
    time: new Date().toISOString(),
    siteData: "checking",
    siteDataURL: "",
    attempts: [],
    missingAssets: [],
    warnings: [],
    jsonValid: false,
    projectCount: 0
  };

  var data = null;
  var candidates = siteDataCandidates();

  for (var i = 0; i < candidates.length; i += 1) {
    var candidate = candidates[i];
    try {
      data = await readCandidate(candidate);
      report.jsonValid = true;
      report.siteData = "ok";
      report.siteDataURL = candidate;
      break;
    } catch (error) {
      report.attempts.push(candidate + " -> " + (error && error.message ? error.message : String(error)));
    }
  }

  if (!data) {
    report.siteData = "failed";
    report.error = "site-data.json 读取失败：" + report.attempts.join("；");
  } else {
    report.schema = data && data.schema ? data.schema : "";
    report.exportedAt = data && data.exportedAt ? data.exportedAt : "";

    if (!data.siteSettings) {
      report.warnings.push("缺少 siteSettings。");
    }
    if (!Array.isArray(data.projects)) {
      report.warnings.push("projects 不是数组。");
    } else {
      report.projectCount = data.projects.length;
      if (!data.projects.length) {
        report.warnings.push("projects 数组为空，前台不会有正式项目卡片。");
      }
    }
    if (!Array.isArray(data.navigation)) {
      report.warnings.push("navigation 不是数组。");
    }
    if (!Array.isArray(data.methods)) {
      report.warnings.push("methods 不是数组。");
    }

    var paths = [];
    var seen = {};

    function collect(value) {
      if (!value) {
        return;
      }
      if (typeof value === "string") {
        var trimmed = value.trim();
        if (trimmed.indexOf("assets/") === 0 && !seen[trimmed]) {
          seen[trimmed] = true;
          paths.push(trimmed);
        }
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(collect);
        return;
      }
      if (typeof value === "object") {
        Object.keys(value).forEach(function (key) {
          collect(value[key]);
        });
      }
    }

    collect(data);
    report.checkedAssets = paths.length;

    var checks = await Promise.all(paths.map(async function (path) {
      try {
        var url = withCheckBust(path);
        var r = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (r.ok) {
          return null;
        }
        var retry = await fetch(url, { method: "GET", cache: "no-store" });
        return retry.ok ? null : path;
      } catch (error) {
        return path;
      }
    }));
    report.missingAssets = checks.filter(Boolean);
  }

  if (typeof console !== "undefined") {
    console.table(report);
    if (report.attempts && report.attempts.length) {
      console.warn("site-data attempts:", report.attempts);
    }
    if (report.warnings && report.warnings.length) {
      console.warn("site-data warnings:", report.warnings);
    }
    if (report.missingAssets && report.missingAssets.length) {
      console.warn("Missing assets:", report.missingAssets);
    }
  }

  if (typeof window.renderPublishCheckReport === "function") {
    window.renderPublishCheckReport(report);
  } else {
    var reportBox = document.querySelector("#publishCheckReport");
    if (reportBox) {
      reportBox.textContent = report.jsonValid
        ? "发布检查完成：项目 " + report.projectCount + " 个，缺失素材 " + report.missingAssets.length + " 项。"
        : "发布检查失败：" + (report.error || "site-data.json 读取失败。");
    }
  }

  return report;
};


document.addEventListener("DOMContentLoaded", function () {
  var runPublishCheckButton = document.querySelector("#runPublishCheckButton");
  if (runPublishCheckButton && !runPublishCheckButton.dataset.v23Bound) {
    runPublishCheckButton.dataset.v23Bound = "1";
    runPublishCheckButton.addEventListener("click", async function () {
      var reportBox = document.querySelector("#publishCheckReport");
      if (reportBox) {
        reportBox.classList.remove("is-ok", "is-warn", "is-error");
        reportBox.textContent = "正在检查 site-data.json 与 assets 路径，请稍候……";
      }
      await window.runPublishCheck();
    });
  }
});
