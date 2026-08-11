/**
 * ============================================================================
 *  config.js —— 定价页面「单一数据源」（数据仓库）
 * ============================================================================
 *
 *  本文件是整个模板的核心。页面上所有可见内容（品牌、导航、套餐、对比表、
 *  常见问题、底部 CTA、页脚）都集中定义在这里。
 *
 *  设计原则（为什么这么设计）：
 *    - 「数据」与「视图」彻底解耦：你只需要修改本文件，无需改动 index.html、
 *      style.css 或 main.js，页面就会随之更新。
 *    - 统一出口：本文件在浏览器全局暴露一个对象 `PRICING_DATA`，main.js 读取它
 *      来动态渲染 DOM。由于没有任何构建工具/打包器，这里直接声明一个全局
 *      常量（const）即可被后续脚本引用。
 *
 *  ★ 多语言（本地化）约定 —— 本模板的核心扩展点：
 *    每一个「文本类字段」都可以是以下两种形式之一：
 *      1) 普通字符串：  name: '专业版'
 *      2) 本地化对象：  name: { 'zh-CN': '专业版', 'en': 'Pro' }
 *    main.js 中的 getLocalized() 助手会按「当前语言」自动取出对应文案；
 *    若某语言缺失，则回退到默认语言（'zh-CN'），再回退到对象的第一个值。
 *    这样你既能只写一种语言（保持简单），也能轻松扩展多语言。
 *    UI 框架类文案（月付/年付/最受欢迎等）统一放在下方的 i18n 字典里。
 *
 *  使用约定：
 *    - 修改任何字段后保存，刷新浏览器即可看到效果。
 *    - 数组类字段（如 plans、nav、faqs）的「顺序」很重要：套餐的展示顺序、
 *      对比表 values 的对应关系，都取决于数组顺序。
 *    - 所有字段均带 JSDoc 注释，标明 @type（数据类型）与 @example（示例值），
 *      初学者可据此安全地修改或扩展。
 */

/**
 * 全局定价数据对象。
 * 整个页面只依赖这唯一一个数据源；main.js 会读取它完成渲染。
 *
 * @type {{
 *   theme: string,
 *   language: string,
 *   i18n: Object,                       // UI 框架文案的多语言字典（见①-b）
 *   hero: Object,                       // 首屏文案（文本字段支持本地化对象）
 *   brand: { name: (string|Object), logo: string },
 *   nav: Array<{ label: (string|Object), href: string }>,
 *   navActions: { loginText: (string|Object), loginLink: string, trialText: (string|Object), trialLink: string },
 *   billing: { monthlyLabel: (string|Object), yearlyLabel: (string|Object), discountRate: number, savingText: (string|Object) },
 *   plans: Array<Object>,               // 套餐列表（见⑤，文本字段支持本地化对象）
 *   features: { categories: Array<Object> },  // 对比矩阵（见⑥）
 *   faqs: Array<{ question: (string|Object), answer: (string|Object), defaultOpen: boolean }>,
 *   cta: Object,                        // 底部 CTA（见⑧）
 *   footer: Object                      // 页脚（见⑨）
 * }}
 *
 * @example
 *   // 普通字符串写法（只做单语言时足够）：
 *   PRICING_DATA.brand.name;            // => "云协作 CloudFlow"
 *   // 本地化对象写法（多语言时）：
 *   PRICING_DATA.plans[1].name;         // => { 'zh-CN': "专业版", 'en": "Pro" }
 *   // main.js 会用 getLocalized() 取出当前语言对应的值
 */
const PRICING_DATA = {
  /* ------------------------------------------------------------------ */
  /* ① 扩展字段：主题（已支持一键切换）与默认语言                          */
  /* ------------------------------------------------------------------ */

  /**
   * 主题模式（初始 / 默认主题）。
   * 现已实现「运行时切换」：页面右上角有主题切换按钮，点击即在「亮色 / 暗色」
   * 间切换，并把用户选择记入 localStorage，下次访问自动沿用。
   * 本字段作为「初始默认值」——用户尚未手动切换时按它显示；
   * 设为 "auto" 则跟随系统配色（prefers-color-scheme: dark）。
   * @type {string}
   * @example "light" | "dark" | "auto"
   */
  theme: 'light',

  /**
   * 界面默认语言（初始值）。现已实现「运行时中英切换」：右上角有语言切换按钮，
   * 点击即在 'zh-CN' 与 'en' 间切换，并把选择记入 localStorage。
   * 本字段作为「初始默认值」，用户手动切换后会被 localStorage 覆盖。
   * 所有文本字段均支持「本地化对象」写法（见文件顶部说明），便于扩展更多语言。
   * @type {string}
   * @example "zh-CN" | "en"
   */
  language: 'zh-CN',

  /* ------------------------------------------------------------------ */
  /* ①-b UI 框架文案多语言字典（i18n）                                    */
  /* ------------------------------------------------------------------ */

  /**
   * UI 框架类文案的多语言字典。这些是「界面本身」的文案（而非业务数据），
   * 例如计费切换的「月付/年付」、套餐上的「最受欢迎」徽章、对比表首列的「功能」、
   * 区块标题等。它们与具体套餐数据无关，集中放在这里便于统一维护。
   *
   * 键（key）在 main.js 中通过 t(key) 读取；值为各语言对应文案。
   * 若某语言缺失该键，会回退到 'zh-CN'。
   *
   * @type {Object<string, Object<string, string>>}
   * @example
   *   i18n: {
   *     'zh-CN': { monthly: '按月付费', popular: '最受欢迎' },
   *     'en':    { monthly: 'Monthly',  popular: 'Most Popular' }
   *   }
   */
  i18n: {
    'zh-CN': {
      monthly: '按月付费',                                  // 计费切换：月付标签
      yearly: '按年付费',                                  // 计费切换：年付标签
      save: '省 {rate}%',                                  // 节省提示模板，{rate} 会被替换为整数百分比
      popular: '最受欢迎',                                  // 套餐卡片「最受欢迎」徽章
      featureCol: '功能',                                  // 对比表首列（功能名）表头
      compareTitle: '功能对比',                            // 「功能对比」区块标题
      compareSubtitle: '逐项查看各套餐的能力差异，找到最契合你的方案。',
      faqTitle: '常见问题',                                // 「常见问题」区块标题
    },
    en: {
      monthly: 'Monthly',
      yearly: 'Yearly',
      save: 'Save {rate}%',
      popular: 'Most Popular',
      featureCol: 'Features',
      compareTitle: 'Feature comparison',
      compareSubtitle: 'Compare capabilities across plans to find your best fit.',
      faqTitle: 'Frequently asked questions',
    },
  },

  /* ------------------------------------------------------------------ */
  /* ①-c 导航栏右侧操作按钮（登录 + 免费试用）                           */
  /* ------------------------------------------------------------------ */

  /**
   * 导航栏右上角的操作按钮。这是 SaaS 落地页常见的「主转化入口」组合：
   * 左侧为低调的「登录」文字链接，右侧为强调的「免费试用」实心按钮。
   * 两个文案与链接均可在此修改，不影响其它代码；若不需要可整体删去本块。
   * loginText / trialText 支持本地化对象（切换语言时自动变化）。
   * @type {{ loginText: (string|Object), loginLink: string, trialText: (string|Object), trialLink: string }}
   * @example {
   *   loginText: { 'zh-CN': "登录", 'en': "Sign in" }, loginLink: "#login",
   *   trialText: { 'zh-CN': "免费试用", 'en': "Free trial" }, trialLink: "#trial"
   * }
   */
  navActions: {
    /** 登录按钮文案（支持本地化对象） @type {(string|Object)} @example { 'zh-CN': "登录", 'en': "Sign in" } */
    loginText: { 'zh-CN': '登录', 'en': 'Sign in' },
    /** 登录按钮链接（可用真实登录页地址） @type {string} @example "#login" */
    loginLink: '#login',
    /** 免费试用按钮文案（支持本地化对象） @type {(string|Object)} @example { 'zh-CN': "免费试用", 'en': "Free trial" } */
    trialText: { 'zh-CN': '免费试用', 'en': 'Free trial' },
    /** 免费试用按钮链接（可用真实注册页地址） @type {string} @example "#trial" */
    trialLink: '#trial',
  },

  /* ------------------------------------------------------------------ */
  /* ①-d 首屏 Hero 文案（数据驱动，便于统一修改）                        */
  /* ------------------------------------------------------------------ */

  /**
   * 首屏标题区文案。之所以放在配置里，是为了贯彻「只改 config.js」的原则：
   * 大标题、副标题、营销小标签都集中在此，无需改动 main.js / index.html。
   * 各文本字段均支持本地化对象（切换语言时整段文案随之变化）。
   * @type {{ badge: (string|Object), title: (string|Object), subtitle: (string|Object), titleAccent: (string|Object) }}
   * @example {
   *   badge: "简单透明，按需扩展",
   *   title: "选择最适合团队的方案",
   *   titleAccent: "方案",            // 仅此词使用渐变色高亮
   *   subtitle: "从个人起步到企业级部署……"
   * }
   */
  hero: {
    /** 营销小标签（标题上方的胶囊徽章，带绿点） @type {(string|Object)} @example "简单透明，按需扩展" */
    badge: { 'zh-CN': '简单透明，按需扩展', 'en': 'Simple, transparent, scale as you go' },

    /** 主标题 @type {(string|Object)} @example "选择适合你的方案" */
    title: { 'zh-CN': '选择适合你的协作方案', 'en': 'Choose the right plan for your team' },

    /**
     * 主标题中需要做「渐变高亮」的关键词。
     * main.js 会在标题里找到该词（按当前语言）并包成渐变样式；留空则整体不高亮。
     * 注意：zh 与 en 的高亮词通常不同，因此也用本地化对象分别指定。
     * @type {(string|Object)}
     * @example { 'zh-CN': "协作", 'en': "team" }
     */
    titleAccent: { 'zh-CN': '协作', 'en': 'team' },

    /** 副标题（引导性说明文案） @type {(string|Object)} @example "从个人起步到企业级部署……" */
    subtitle: {
      'zh-CN': '从个人起步到企业级部署，灵活定价，按需扩展。所有套餐均支持随时升级，无隐藏费用。',
      'en': 'From solo starters to enterprise rollouts — flexible pricing that scales with you. Upgrade anytime, no hidden fees.',
    },
  },

  /* ------------------------------------------------------------------ */
  /* ② 品牌信息                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * 品牌信息对象。name 支持本地化对象（切换语言时品牌名随之变化）。
   * @type {{ name: (string|Object), logo: string }}
   * @example { name: { 'zh-CN': "云协作 CloudFlow", 'en': "CloudFlow" }, logo: "☁️" }
   */
  brand: {
    /** 品牌名称（支持本地化对象） @type {(string|Object)} @example "云协作 CloudFlow" */
    name: { 'zh-CN': '云协作 CloudFlow', 'en': 'CloudFlow' },

    /**
     * Logo 占位。这里用 Emoji 占位，零依赖、无需图片文件。
     * 若要换成文字 Logo，直接改成 "CF" 等短字符串即可；
     * 若要换成图片，请到 index.html 中把 logo 容器替换为 <img src="...">。
     * @type {string}
     * @example "☁️" 或 "CF"
     */
    logo: '☁️',
  },

  /* ------------------------------------------------------------------ */
  /* ③ 导航菜单                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * 顶部导航菜单数组。每项是一个锚点链接，href 指向页面内 section 的 id。
   * 顺序即为菜单从左到右的展示顺序。label 支持本地化对象（切换语言时菜单文案变化）。
   * @type {Array<{ label: (string|Object), href: string }>}
   * @example [ { label: "功能", href: "#compare" } ]
   */
  nav: [
    { label: { 'zh-CN': '功能', 'en': 'Features' }, href: '#compare' },
    { label: { 'zh-CN': '定价', 'en': 'Pricing' }, href: '#pricing' },
    { label: { 'zh-CN': '对比', 'en': 'Compare' }, href: '#compare' },
    { label: { 'zh-CN': '常见问题', 'en': 'FAQ' }, href: '#faq' },
  ],

  /* ------------------------------------------------------------------ */
  /* ④ 计费配置（月付 / 年付切换）                                       */
  /* ------------------------------------------------------------------ */

  /**
   * 计费方式配置。
   * discountRate 是关键：点击「年付」时，所有套餐价格会乘以它得到折后价。
   * monthlyLabel / yearlyLabel / savingText 为界面文案，支持本地化对象。
   * @type {{
   *   monthlyLabel: (string|Object),  // 月付标签文案
   *   yearlyLabel: (string|Object),   // 年付标签文案
   *   discountRate: number,           // 折扣系数：0.8 = 八折（年付价 = 月单价 × 0.8）
   *   savingText: (string|Object)     // 年付时展示的「省了多少」文案（含 {rate} 占位）
   * }}
   * @example {
   *   monthlyLabel: "按月付费", yearlyLabel: "按年付费",
   *   discountRate: 0.8, savingText: "省 {rate}%"
   * }
   */
  billing: {
    /** 月付标签（支持本地化对象） @type {(string|Object)} @example "按月付费" */
    monthlyLabel: { 'zh-CN': '按月付费', 'en': 'Monthly' },

    /** 年付标签（支持本地化对象） @type {(string|Object)} @example "按年付费" */
    yearlyLabel: { 'zh-CN': '按年付费', 'en': 'Yearly' },

    /**
     * 年付折扣系数。0.8 表示「打八折」，即年付的等效月单价 = price × 0.8。
     * 若想做「年付 7 折」，改为 0.7；想做「不打折只送时长」，可配合 savingText 调整。
     * @type {number}
     * @example 0.8
     */
    discountRate: 0.8,

    /**
     * 年付节省文案（含 {rate} 占位，main.js 会替换为整数百分比，如 20）。
     * 仅作提示展示，不参与价格计算。支持本地化对象。
     * @type {(string|Object)}
     * @example "省 {rate}%"
     */
    savingText: { 'zh-CN': '省 {rate}%', 'en': 'Save {rate}%' },
  },

  /* ------------------------------------------------------------------ */
  /* ⑤ 套餐列表                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * 套餐列表数组。每个套餐卡片的所有内容都来自这里。
   * ⚠️ 重要：features 对比矩阵（见下方 features.categories[].items[].values）
   *    的数组长度必须与本数组的「套餐数量」严格一致，且顺序一一对应。
   *
   * 文本字段（name/description/meta/features[]/ctaText/priceSuffix）均支持本地化对象。
   *
   * @type {Array<{
   *   id: string,            // 唯一标识，用于 DOM 的 data-id，便于调试与脚本定位
   *   name: (string|Object), // 套餐名称
   *   price: number,         // 月单价数值；免费套餐填 0
   *   currency: string,      // 货币符号，如 "¥" "$" "€"
   *   period: (string|Object),// 计费周期文案，如 "/月"
   *   description: (string|Object),// 一句亮点描述
   *   features: Array<(string|Object)>,// 卡片上展示的核心卖点（简短列表）
   *   meta: (string|Object), // 关键指标速览（如 "不限项目 · 20 成员"），显示在价格下方；留空则...
   *   ctaText: (string|Object),// 按钮文案
   *   ctaLink: string,       // 按钮链接（可用 "#" 占位，或真实注册/购买地址）
   *   popular: boolean,      // 是否为「最受欢迎」套餐（决定是否显示徽章与高亮）
   *   priceSuffix: (string|Object)// 价格特殊后缀，如免费版 "起"、企业版 "定制"；无则留空 ""
   * }>}
   *
   * @example
   *   {
   *     id: "pro", name: { 'zh-CN': "专业版", 'en': "Pro" }, price: 39, currency: "¥", period: "/月",
   *     description: "适合独立开发者与小团队", features: ["10 个项目", "API 调用 1万/月"],
   *     ctaText: "立即升级", ctaLink: "#", popular: false, priceSuffix: ""
   *   }
   */
  plans: [
    {
      id: 'free',
      name: { 'zh-CN': '免费版', 'en': 'Free' },
      price: 0,
      currency: '¥',
      period: { 'zh-CN': '/月', 'en': '/mo' },
      description: { 'zh-CN': '适合个人体验与小型项目起步，永久免费。', 'en': 'For personal use and small projects — free forever.' },
      meta: { 'zh-CN': '3 个项目 · 1 名成员 · 5 GB 存储', 'en': '3 projects · 1 member · 5 GB storage' },
      features: [
        { 'zh-CN': '1 名团队成员', 'en': '1 team member' },
        { 'zh-CN': '5 GB 文件存储', 'en': '5 GB file storage' },
        { 'zh-CN': '3 个项目', 'en': '3 projects' },
        { 'zh-CN': '基础任务看板', 'en': 'Basic task board' },
      ],
      ctaText: { 'zh-CN': '免费开始', 'en': 'Get started free' },
      ctaLink: '#',
      popular: false,
      priceSuffix: { 'zh-CN': '起', 'en': 'from' },
    },
    {
      id: 'pro',
      name: { 'zh-CN': '专业版', 'en': 'Pro' },
      price: 39,
      currency: '¥',
      period: { 'zh-CN': '/月', 'en': '/mo' },
      description: { 'zh-CN': '为独立开发者与自由职业者提供完整能力。', 'en': 'Full-featured plan for solo developers and freelancers.' },
      meta: { 'zh-CN': '20 个项目 · 5 名成员 · 50 GB 存储', 'en': '20 projects · 5 members · 50 GB storage' },
      features: [
        { 'zh-CN': '5 名团队成员', 'en': '5 team members' },
        { 'zh-CN': '50 GB 文件存储', 'en': '50 GB file storage' },
        { 'zh-CN': '20 个项目', 'en': '20 projects' },
        { 'zh-CN': '实时协作编辑', 'en': 'Real-time co-editing' },
        { 'zh-CN': 'API 调用 1万/月', 'en': '10k API calls/mo' },
      ],
      ctaText: { 'zh-CN': '立即升级', 'en': 'Upgrade now' },
      ctaLink: '#',
      popular: false,
      priceSuffix: '',
    },
    {
      id: 'team',
      name: { 'zh-CN': '团队版', 'en': 'Team' },
      price: 99,
      currency: '¥',
      period: { 'zh-CN': '/月', 'en': '/mo' },
      description: { 'zh-CN': '面向成长型团队，权限管理与协作一步到位。', 'en': 'For growing teams — permissions and collaboration, all set.' },
      meta: { 'zh-CN': '不限项目 · 20 名成员 · 500 GB 存储', 'en': 'Unlimited projects · 20 members · 500 GB storage' },
      features: [
        { 'zh-CN': '20 名团队成员', 'en': '20 team members' },
        { 'zh-CN': '500 GB 文件存储', 'en': '500 GB file storage' },
        { 'zh-CN': '不限项目数量', 'en': 'Unlimited projects' },
        { 'zh-CN': '自定义角色权限', 'en': 'Custom roles & permissions' },
        { 'zh-CN': '操作审计日志', 'en': 'Activity audit logs' },
        { 'zh-CN': 'API 调用 10万/月', 'en': '100k API calls/mo' },
      ],
      ctaText: { 'zh-CN': '开始 14 天试用', 'en': 'Start 14-day trial' },
      ctaLink: '#',
      popular: true, // ← 显示「最受欢迎」徽章并高亮
      priceSuffix: '',
    },
    {
      id: 'enterprise',
      name: { 'zh-CN': '企业版', 'en': 'Enterprise' },
      price: 299,
      currency: '¥',
      period: { 'zh-CN': '/月', 'en': '/mo' },
      description: { 'zh-CN': '为大型组织提供安全合规与专属服务。', 'en': 'Security, compliance, and dedicated service for large organizations.' },
      meta: { 'zh-CN': '不限项目 · 不限成员 · 不限存储', 'en': 'Unlimited projects · members · storage' },
      features: [
        { 'zh-CN': '不限团队成员', 'en': 'Unlimited members' },
        { 'zh-CN': '不限文件存储', 'en': 'Unlimited storage' },
        { 'zh-CN': '单点登录 SSO', 'en': 'SSO' },
        { 'zh-CN': '开放平台插件', 'en': 'Open-platform plugins' },
        { 'zh-CN': '专属客户成功经理', 'en': 'Dedicated success manager' },
        { 'zh-CN': '服务等级协议 SLA 99.9%', 'en': '99.9% SLA' },
      ],
      ctaText: { 'zh-CN': '联系销售', 'en': 'Contact sales' },
      ctaLink: '#',
      popular: false,
      priceSuffix: { 'zh-CN': '定制', 'en': 'Custom' },
    },
  ],

  /* ------------------------------------------------------------------ */
  /* ⑥ 功能对比矩阵（按类别分组）                                        */
  /* ------------------------------------------------------------------ */

  /**
   * 功能对比矩阵。按「类别」分组，便于在表格中分段展示。
   *
   * 结构说明：
   *   categories[].name  —— 类别名（如「核心功能」，支持本地化对象）
   *   categories[].items[] —— 该类别下的具体功能行
   *   items[].name        —— 功能名（行首，支持本地化对象）
   *   items[].values      —— 各套餐对应的值，**数组长度必须等于 plans 的数量**，
   *                          且顺序与 plans 数组一一对应。
   *                          取值约定："✓" 支持 / "✗" 不支持 / 其他为具体数值或文案
   *                          （"✗" "✓" 与纯数字语言无关；文字值如「不限」支持本地化对象）。
   *
   * @type {{
   *   categories: Array<{
   *     name: (string|Object),
   *     items: Array<{ name: (string|Object), values: Array<(string|Object)> }>
   *   }>
   * }}
   *
   * @example
   *   {
   *     categories: [{
   *       name: "核心功能",
   *       items: [{ name: "任务看板", values: ["✓", "✓", "✓", "✓"] }]
   *     }]
   *   }
   */
  features: {
    categories: [
      /* ---- 类别一：核心功能 ---- */
      {
        name: { 'zh-CN': '核心功能', 'en': 'Core' },
        items: [
          { name: { 'zh-CN': '任务看板', 'en': 'Task board' }, values: ['✓', '✓', '✓', '✓'] },
          { name: { 'zh-CN': '文件存储', 'en': 'File storage' }, values: ['5 GB', '50 GB', '500 GB', { 'zh-CN': '不限', 'en': 'Unlimited' }] },
          { name: { 'zh-CN': '团队成员', 'en': 'Team members' }, values: ['1', '5', '20', { 'zh-CN': '不限', 'en': 'Unlimited' }] },
          { name: { 'zh-CN': '项目数量', 'en': 'Projects' }, values: ['3', '20', { 'zh-CN': '不限', 'en': 'Unlimited' }, { 'zh-CN': '不限', 'en': 'Unlimited' }] },
        ],
      },
      /* ---- 类别二：协作与权限 ---- */
      {
        name: { 'zh-CN': '协作与权限', 'en': 'Collaboration & permissions' },
        items: [
          { name: { 'zh-CN': '实时协作编辑', 'en': 'Real-time co-editing' }, values: ['✗', '✓', '✓', '✓'] },
          { name: { 'zh-CN': '自定义角色权限', 'en': 'Custom roles' }, values: ['✗', '✗', '✓', '✓'] },
          { name: { 'zh-CN': '操作审计日志', 'en': 'Audit logs' }, values: ['✗', '✗', '✓', '✓'] },
          { name: { 'zh-CN': '单点登录 SSO', 'en': 'SSO' }, values: ['✗', '✗', '✗', '✓'] },
        ],
      },
      /* ---- 类别三：集成与扩展 ---- */
      {
        name: { 'zh-CN': '集成与扩展', 'en': 'Integrations & extensions' },
        items: [
          {
            name: { 'zh-CN': 'API 调用额度', 'en': 'API quota' },
            values: [
              { 'zh-CN': '1000/月', 'en': '1k/mo' },
              { 'zh-CN': '1万/月', 'en': '10k/mo' },
              { 'zh-CN': '10万/月', 'en': '100k/mo' },
              { 'zh-CN': '不限', 'en': 'Unlimited' },
            ],
          },
          { name: { 'zh-CN': 'Webhook 通知', 'en': 'Webhook notifications' }, values: ['✗', '✓', '✓', '✓'] },
          {
            name: { 'zh-CN': '第三方应用集成', 'en': '3rd-party integrations' },
            values: ['3', '10', { 'zh-CN': '不限', 'en': 'Unlimited' }, { 'zh-CN': '不限', 'en': 'Unlimited' }],
          },
          { name: { 'zh-CN': '开放平台插件', 'en': 'Open-platform plugins' }, values: ['✗', '✗', '✓', '✓'] },
        ],
      },
      /* ---- 类别四：支持服务 ---- */
      {
        name: { 'zh-CN': '支持服务', 'en': 'Support' },
        items: [
          { name: { 'zh-CN': '邮件支持', 'en': 'Email support' }, values: ['✓', '✓', '✓', '✓'] },
          { name: { 'zh-CN': '在线客服', 'en': 'Live chat' }, values: ['✗', '✓', '✓', '✓'] },
          { name: { 'zh-CN': '专属客户成功经理', 'en': 'Dedicated success manager' }, values: ['✗', '✗', '✗', '✓'] },
          { name: { 'zh-CN': '服务等级协议 SLA', 'en': 'SLA' }, values: ['✗', '✗', '99.5%', '99.9%'] },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ⑦ 常见问题 FAQ                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * 常见问题列表。手风琴（Accordion）效果由 main.js 控制。
   * question / answer 支持本地化对象；answer 支持 HTML 标签（如 <a>、<strong>），
   * 可写多段或带链接的说明。
   * @type {Array<{ question: (string|Object), answer: (string|Object), defaultOpen: boolean }>}
   * @example { question: "支持退款吗？", answer: "支持 30 天无理由退款。", defaultOpen: false }
   */
  faqs: [
    {
      question: { 'zh-CN': '可以随时升级或降级套餐吗？', 'en': 'Can I upgrade or downgrade anytime?' },
      answer: {
        'zh-CN':
          '可以。你可以在「账户设置 - 订阅管理」中随时变更套餐，<strong>升级立即生效</strong>，差额按剩余周期折算；降级将在下一个计费周期生效。',
        'en':
          'Yes. Change your plan anytime in Account Settings → Subscription. <strong>Upgrades take effect immediately</strong> (prorated); downgrades apply at the next billing cycle.',
      },
      defaultOpen: true, // 首条默认展开，引导用户阅读
    },
    {
      question: { 'zh-CN': '按年付费是如何计费的？', 'en': 'How does annual billing work?' },
      answer: {
        'zh-CN':
          '选择按年付费后，系统会按「月单价 × 折扣系数（' +
          '0.8）」计算等效月单价并一次性收取全年费用，相当于立省 20%。免费版与企业定制版不参与折扣计算。',
        'en':
          'With annual billing we charge the equivalent monthly price (monthly price × 0.8) once per year — that is 20% off. Free and custom Enterprise plans are excluded.',
      },
      defaultOpen: false,
    },
    {
      question: { 'zh-CN': '支持哪些支付方式？', 'en': 'What payment methods do you accept?' },
      answer: {
        'zh-CN': '我们支持微信支付、支付宝以及企业对公转账。企业版还可申请开具增值税专用发票。',
        'en': 'We support WeChat Pay, Alipay, and bank transfer. Enterprise plans can request VAT invoices.',
      },
      defaultOpen: false,
    },
    {
      question: { 'zh-CN': '免费版有时间限制吗？', 'en': 'Is there a time limit on the free plan?' },
      answer: {
        'zh-CN': '没有。免费版永久可用，适合个人与小型项目长期使用；当团队规模或存储需求增长时，再升级到付费套餐即可。',
        'en': 'No. The free plan is unlimited in time and great for personal or small projects. Upgrade whenever your team or storage needs grow.',
      },
      defaultOpen: false,
    },
    {
      question: { 'zh-CN': '数据安全如何保障？', 'en': 'How is my data secured?' },
      answer: {
        'zh-CN':
          '全链路 <strong>TLS 加密传输</strong> 与 <strong>静态加密存储</strong>，数据中心通过等保三级认证。企业版额外提供操作审计日志与单点登录（SSO）。',
        'en':
          'End-to-end <strong>TLS encryption in transit</strong> and <strong>encryption at rest</strong>, with a Tier-3 (等保三级) certified data center. Enterprise adds audit logs and SSO.',
      },
      defaultOpen: false,
    },
  ],

  /* ------------------------------------------------------------------ */
  /* ⑧ 底部 CTA 横幅                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * 页面底部的行动号召（Call To Action）横幅。
   * 可选 secondaryText / secondaryLink：配置后会出现第二个「描边」按钮（如「预约演示」）。
   * 文本字段支持本地化对象。
   * @type {{ title: (string|Object), description: (string|Object), buttonText: (string|Object), buttonLink: string, secondaryText: (string|Object), secondaryLink: string }}
   * @example {
   *   title: "准备好了吗？", description: "...",
   *   buttonText: "免费试用", buttonLink: "#",
   *   secondaryText: "预约演示", secondaryLink: "#"
   * }
   */
  cta: {
    title: { 'zh-CN': '准备好让团队协作更高效了吗？', 'en': 'Ready to make your team more productive?' },
    description: {
      'zh-CN': '立即创建免费账户，14 天内可体验团队版全部功能，无需绑定信用卡。',
      'en': 'Create a free account now — try every Team feature for 14 days, no credit card required.',
    },
    buttonText: { 'zh-CN': '免费开始使用', 'en': 'Get started free' },
    buttonLink: '#',
    secondaryText: { 'zh-CN': '预约产品演示', 'en': 'Book a demo' },
    secondaryLink: '#',
  },

  /* ------------------------------------------------------------------ */
  /* ⑨ 页脚                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * 页脚信息。采用「品牌简介 + 多链接列 + 社交图标 + 法律链接」的标准 SaaS 布局。
   *  - copyright：版权文案（底部条左侧）
   *  - tagline：品牌一句话简介（品牌区下方）
   *  - columns：链接分列，每列含标题与若干链接（产品 / 公司 / 支持……）
   *  - socials：社交图标（Emoji 占位，零依赖），显示在底部条右侧
   *  - links：最底部的法律/次要链接（可选）
   * 文本字段均支持本地化对象。
   * @type {{
   *   copyright: (string|Object),
   *   tagline: (string|Object),
   *   columns: Array<{ title: (string|Object), links: Array<{ label: (string|Object), href: string }> }>,
   *   socials: Array<{ icon: string, label: (string|Object), href: string }>,
   *   links: Array<{ label: (string|Object), href: string }>
   * }}
   * @example {
   *   copyright: "© 2026 云协作",
   *   tagline: "为现代团队打造的协作平台。",
   *   columns: [ { title: "产品", links: [ { label: "价格", href: "#pricing" } ] } ],
   *   socials: [ { icon: "💬", label: "微信", href: "#" } ],
   *   links: [ { label: "隐私政策", href: "#" } ]
   * }
   */
  footer: {
    copyright: { 'zh-CN': '© 2026 云协作 CloudFlow. 保留所有权利。', 'en': '© 2026 CloudFlow. All rights reserved.' },
    tagline: {
      'zh-CN': '为现代团队打造的协作与项目管理平台，让每一个项目都井然有序。',
      'en': 'A collaboration and project platform built for modern teams — keeping every project in order.',
    },
    columns: [
      {
        title: { 'zh-CN': '产品', 'en': 'Product' },
        links: [
          { label: { 'zh-CN': '功能概览', 'en': 'Features' }, href: '#compare' },
          { label: { 'zh-CN': '价格方案', 'en': 'Pricing' }, href: '#pricing' },
          { label: { 'zh-CN': '更新日志', 'en': 'Changelog' }, href: '#' },
          { label: { 'zh-CN': '集成中心', 'en': 'Integrations' }, href: '#' },
        ],
      },
      {
        title: { 'zh-CN': '公司', 'en': 'Company' },
        links: [
          { label: { 'zh-CN': '关于我们', 'en': 'About' }, href: '#' },
          { label: { 'zh-CN': '招贤纳士', 'en': 'Careers' }, href: '#' },
          { label: { 'zh-CN': '联系方式', 'en': 'Contact' }, href: '#' },
          { label: { 'zh-CN': '博客', 'en': 'Blog' }, href: '#' },
        ],
      },
      {
        title: { 'zh-CN': '支持', 'en': 'Support' },
        links: [
          { label: { 'zh-CN': '帮助中心', 'en': 'Help center' }, href: '#faq' },
          { label: { 'zh-CN': '开发者文档', 'en': 'Docs' }, href: '#' },
          { label: { 'zh-CN': '服务状态', 'en': 'Status' }, href: '#' },
          { label: { 'zh-CN': '隐私政策', 'en': 'Privacy' }, href: '#' },
        ],
      },
    ],
    socials: [
      { icon: '💬', label: { 'zh-CN': '微信', 'en': 'WeChat' }, href: '#' },
      { icon: '🌐', label: { 'zh-CN': '微博', 'en': 'Weibo' }, href: '#' },
      { icon: '✉️', label: { 'zh-CN': '邮箱', 'en': 'Email' }, href: '#' },
    ],
    links: [
      { label: { 'zh-CN': '服务条款', 'en': 'Terms' }, href: '#' },
      { label: { 'zh-CN': 'Cookie 设置', 'en': 'Cookie settings' }, href: '#' },
      { label: { 'zh-CN': '站点地图', 'en': 'Site Map' }, href: '#' },
    ],
  },
};

/**
 * 将本对象显式挂到 window，确保在任何加载顺序下都能被 main.js 访问。
 * （现代浏览器中顶层 const 已是全局可见，这里多写一行仅为兼容与可读性。）
 */
window.PRICING_DATA = PRICING_DATA;
