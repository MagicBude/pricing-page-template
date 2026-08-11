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
 *   hero: { badge: string, title: string, subtitle: string, titleAccent: string },
 *   brand: { name: string, logo: string },
 *   nav: Array<{ label: string, href: string }>,
 *   billing: { monthlyLabel: string, yearlyLabel: string, discountRate: number, savingText: string },
 *   plans: Array<{
 *     id: string, name: string, price: number, currency: string, period: string,
 *     description: string, features: string[], meta: string,
 *     ctaText: string, ctaLink: string, popular: boolean, priceSuffix: string
 *   }>,
 *   features: { categories: Array<{ name: string, items: Array<{ name: string, values: string[] }> }> },
 *   faqs: Array<{ question: string, answer: string, defaultOpen: boolean }>,
 *   cta: { title: string, description: string, buttonText: string, buttonLink: string, secondaryText: string, secondaryLink: string },
 *   footer: {
 *     copyright: string, tagline: string,
 *     columns: Array<{ title: string, links: Array<{ label: string, href: string }> }>,
 *     socials: Array<{ icon: string, label: string, href: string }>,
 *     links: Array<{ label: string, href: string }>
 *   }
 * }}
 *
 * @example
 *   // 在 main.js 中读取示例：
 *   PRICING_DATA.brand.name;          // => "云协作 CloudFlow"
 *   PRICING_DATA.plans.length;        // => 套餐数量
 *   PRICING_DATA.features.categories; // => 对比矩阵的分组数组
 */
const PRICING_DATA = {
  /* ------------------------------------------------------------------ */
  /* ① 扩展预留字段（当前版本不实现具体切换，但保留以便后续迭代）          */
  /* ------------------------------------------------------------------ */

  /**
   * 主题模式开关（预留）。
   * 当前版本仅提供「亮色 / 暗色」两套 CSS 变量定义在 style.css 中，
   * 并未实现运行时切换。后续若要做主题切换，可让 main.js 读取本字段，
   * 给 <html> 元素设置 data-theme="dark" 即可启用暗色变量。
   * @type {string}
   * @example "light" | "dark"
   */
  theme: 'light',

  /**
   * 界面语言（预留）。
   * 当前版本文案均为简体中文。若后续要做多语言，可在此声明语言代码，
   * 并在 config 中为每个字段提供多语言版本（或拆出 i18n 字典）。
   * @type {string}
   * @example "zh-CN" | "en-US"
   */
  language: 'zh-CN',

  /* ------------------------------------------------------------------ */
  /* ①-b 首屏 Hero 文案（数据驱动，便于统一修改）                        */
  /* ------------------------------------------------------------------ */

  /**
   * 首屏标题区文案。之所以放在配置里，是为了贯彻「只改 config.js」的原则：
   * 大标题、副标题、营销小标签都集中在此，无需改动 main.js / index.html。
   * @type {{ badge: string, title: string, subtitle: string, titleAccent: string }}
   * @example {
   *   badge: "简单透明，按需扩展",
   *   title: "选择最适合团队的方案",
   *   titleAccent: "方案",            // 仅此词使用渐变色高亮
   *   subtitle: "从个人起步到企业级部署……"
   * }
   */
  hero: {
    /** 营销小标签（标题上方的胶囊徽章，带绿点） @type {string} @example "简单透明，按需扩展" */
    badge: '简单透明，按需扩展',

    /** 主标题 @type {string} @example "选择适合你的方案" */
    title: '选择适合你的协作方案',

    /**
     * 主标题中需要做「渐变高亮」的关键词。
     * main.js 会在标题里找到该词并包成渐变样式；留空则整体不高亮。
     * @type {string}
     * @example "协作"
     */
    titleAccent: '协作',

    /** 副标题（引导性说明文案） @type {string} @example "从个人起步到企业级部署……" */
    subtitle: '从个人起步到企业级部署，灵活定价，按需扩展。所有套餐均支持随时升级，无隐藏费用。',
  },

  /* ------------------------------------------------------------------ */
  /* ② 品牌信息                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * 品牌信息对象。
   * @type {{
   *   name: string,  // 品牌名称，显示在导航栏
   *   logo: string   // Logo：可填「文字」（如 "CF"）或「Emoji 占位」（如 "☁️"）；
   *                  //   若需使用图片 Logo，可改为 <img> 标签（见 index.html 注释）
   * }}
   * @example { name: "云协作 CloudFlow", logo: "☁️" }
   */
  brand: {
    /** 品牌名称 @type {string} @example "云协作 CloudFlow" */
    name: '云协作 CloudFlow',

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
   * 顺序即为菜单从左到右的展示顺序。
   * @type {Array<{ label: string, href: string }>}
   * @example [ { label: "功能", href: "#features" } ]
   */
  nav: [
    { label: '功能', href: '#compare' },
    { label: '定价', href: '#pricing' },
    { label: '对比', href: '#compare' },
    { label: '常见问题', href: '#faq' },
  ],

  /* ------------------------------------------------------------------ */
  /* ④ 计费配置（月付 / 年付切换）                                       */
  /* ------------------------------------------------------------------ */

  /**
   * 计费方式配置。
   * discountRate 是关键：点击「年付」时，所有套餐价格会乘以它得到折后价。
   * @type {{
   *   monthlyLabel: string,  // 月付标签文案
   *   yearlyLabel: string,   // 年付标签文案
   *   discountRate: number,  // 折扣系数：0.8 = 八折（年付价 = 月单价 × 0.8）
   *   savingText: string     // 年付时展示的「省了多少」文案
   * }}
   * @example {
   *   monthlyLabel: "按月付费", yearlyLabel: "按年付费",
   *   discountRate: 0.8, savingText: "省 20%"
   * }
   */
  billing: {
    /** 月付标签 @type {string} @example "按月付费" */
    monthlyLabel: '按月付费',

    /** 年付标签 @type {string} @example "按年付费" */
    yearlyLabel: '按年付费',

    /**
     * 年付折扣系数。0.8 表示「打八折」，即年付的等效月单价 = price × 0.8。
     * 若想做「年付 7 折」，改为 0.7；想做「不打折只送时长」，可配合 savingText 调整。
     * @type {number}
     * @example 0.8
     */
    discountRate: 0.8,

    /** 年付节省文案（仅作提示展示，不参与计算） @type {string} @example "省 20%" */
    savingText: '省 20%',
  },

  /* ------------------------------------------------------------------ */
  /* ⑤ 套餐列表                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * 套餐列表数组。每个套餐卡片的所有内容都来自这里。
   * ⚠️ 重要：features 对比矩阵（见下方 features.categories[].items[].values）
   *    的数组长度必须与本数组的「套餐数量」严格一致，且顺序一一对应。
   *
   * @type {Array<{
   *   id: string,            // 唯一标识，用于 DOM 的 data-id，便于调试与脚本定位
   *   name: string,          // 套餐名称
   *   price: number,         // 月单价数值；免费套餐填 0
   *   currency: string,      // 货币符号，如 "¥" "$" "€"
   *   period: string,        // 计费周期文案，如 "/月"
   *   description: string,   // 一句亮点描述
   *   features: string[],    // 卡片上展示的核心卖点（简短列表）
   *   meta: string,          // 关键指标速览（如 "不限项目 · 20 成员"），显示在价格下方；留空则不显示
   *   ctaText: string,       // 按钮文案
   *   ctaLink: string,       // 按钮链接（可用 "#" 占位，或真实注册/购买地址）
   *   popular: boolean,      // 是否为「最受欢迎」套餐（决定是否显示徽章与高亮）
   *   priceSuffix: string    // 价格特殊后缀，如免费版 "起"、企业版 "定制"；无则留空 ""
   * }>}
   *
   * @example
   *   {
   *     id: "pro", name: "专业版", price: 39, currency: "¥", period: "/月",
   *     description: "适合独立开发者与小团队", features: ["10 个项目", "API 调用 1万/月"],
   *     ctaText: "立即升级", ctaLink: "#", popular: false, priceSuffix: ""
   *   }
   */
  plans: [
    {
      id: 'free',
      name: '免费版',
      price: 0,
      currency: '¥',
      period: '/月',
      description: '适合个人体验与小型项目起步，永久免费。',
      meta: '3 个项目 · 1 名成员 · 5 GB 存储',
      features: ['1 名团队成员', '5 GB 文件存储', '3 个项目', '基础任务看板'],
      ctaText: '免费开始',
      ctaLink: '#',
      popular: false,
      priceSuffix: '起',
    },
    {
      id: 'pro',
      name: '专业版',
      price: 39,
      currency: '¥',
      period: '/月',
      description: '为独立开发者与自由职业者提供完整能力。',
      meta: '20 个项目 · 5 名成员 · 50 GB 存储',
      features: ['5 名团队成员', '50 GB 文件存储', '20 个项目', '实时协作编辑', 'API 调用 1万/月'],
      ctaText: '立即升级',
      ctaLink: '#',
      popular: false,
      priceSuffix: '',
    },
    {
      id: 'team',
      name: '团队版',
      price: 99,
      currency: '¥',
      period: '/月',
      description: '面向成长型团队，权限管理与协作一步到位。',
      meta: '不限项目 · 20 名成员 · 500 GB 存储',
      features: [
        '20 名团队成员',
        '500 GB 文件存储',
        '不限项目数量',
        '自定义角色权限',
        '操作审计日志',
        'API 调用 10万/月',
      ],
      ctaText: '开始 14 天试用',
      ctaLink: '#',
      popular: true, // ← 显示「最受欢迎」徽章并高亮
      priceSuffix: '',
    },
    {
      id: 'enterprise',
      name: '企业版',
      price: 299,
      currency: '¥',
      period: '/月',
      description: '为大型组织提供安全合规与专属服务。',
      meta: '不限项目 · 不限成员 · 不限存储',
      features: [
        '不限团队成员',
        '不限文件存储',
        '单点登录 SSO',
        '开放平台插件',
        '专属客户成功经理',
        '服务等级协议 SLA 99.9%',
      ],
      ctaText: '联系销售',
      ctaLink: '#',
      popular: false,
      priceSuffix: '定制',
    },
  ],

  /* ------------------------------------------------------------------ */
  /* ⑥ 功能对比矩阵（按类别分组）                                        */
  /* ------------------------------------------------------------------ */

  /**
   * 功能对比矩阵。按「类别」分组，便于在表格中分段展示。
   *
   * 结构说明：
   *   categories[].name  —— 类别名（如「核心功能」）
   *   categories[].items[] —— 该类别下的具体功能行
   *   items[].name        —— 功能名（表格行首）
   *   items[].values      —— 各套餐对应的值，**数组长度必须等于 plans 的数量**，
   *                          且顺序与 plans 数组一一对应。
   *                          取值约定："✓" 支持 / "✗" 不支持 / 其他为具体数值或文案。
   *
   * @type {{
   *   categories: Array<{
   *     name: string,
   *     items: Array<{ name: string, values: string[] }>
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
        name: '核心功能',
        items: [
          { name: '任务看板', values: ['✓', '✓', '✓', '✓'] },
          { name: '文件存储', values: ['5 GB', '50 GB', '500 GB', '不限'] },
          { name: '团队成员', values: ['1', '5', '20', '不限'] },
          { name: '项目数量', values: ['3', '20', '不限', '不限'] },
        ],
      },
      /* ---- 类别二：协作与权限 ---- */
      {
        name: '协作与权限',
        items: [
          { name: '实时协作编辑', values: ['✗', '✓', '✓', '✓'] },
          { name: '自定义角色权限', values: ['✗', '✗', '✓', '✓'] },
          { name: '操作审计日志', values: ['✗', '✗', '✓', '✓'] },
          { name: '单点登录 SSO', values: ['✗', '✗', '✗', '✓'] },
        ],
      },
      /* ---- 类别三：集成与扩展 ---- */
      {
        name: '集成与扩展',
        items: [
          { name: 'API 调用额度', values: ['1000/月', '1万/月', '10万/月', '不限'] },
          { name: 'Webhook 通知', values: ['✗', '✓', '✓', '✓'] },
          { name: '第三方应用集成', values: ['3', '10', '不限', '不限'] },
          { name: '开放平台插件', values: ['✗', '✗', '✓', '✓'] },
        ],
      },
      /* ---- 类别四：支持服务 ---- */
      {
        name: '支持服务',
        items: [
          { name: '邮件支持', values: ['✓', '✓', '✓', '✓'] },
          { name: '在线客服', values: ['✗', '✓', '✓', '✓'] },
          { name: '专属客户成功经理', values: ['✗', '✗', '✗', '✓'] },
          { name: '服务等级协议 SLA', values: ['✗', '✗', '99.5%', '99.9%'] },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* ⑦ 常见问题 FAQ                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * 常见问题列表。手风琴（Accordion）效果由 main.js 控制。
   * answer 支持 HTML 标签（如 <a>、<strong>），可写多段或带链接的说明。
   * @type {Array<{ question: string, answer: string, defaultOpen: boolean }>}
   * @example { question: "支持退款吗？", answer: "支持 30 天无理由退款。", defaultOpen: false }
   */
  faqs: [
    {
      question: '可以随时升级或降级套餐吗？',
      answer:
        '可以。你可以在「账户设置 - 订阅管理」中随时变更套餐，<strong>升级立即生效</strong>，差额按剩余周期折算；降级将在下一个计费周期生效。',
      defaultOpen: true, // 首条默认展开，引导用户阅读
    },
    {
      question: '按年付费是如何计费的？',
      answer:
        '选择按年付费后，系统会按「月单价 × 折扣系数（' +
        '0.8）」计算等效月单价并一次性收取全年费用，相当于立省 20%。免费版与企业定制版不参与折扣计算。',
      defaultOpen: false,
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持微信支付、支付宝以及企业对公转账。企业版还可申请开具增值税专用发票。',
      defaultOpen: false,
    },
    {
      question: '免费版有时间限制吗？',
      answer:
        '没有。免费版永久可用，适合个人与小型项目长期使用；当团队规模或存储需求增长时，再升级到付费套餐即可。',
      defaultOpen: false,
    },
    {
      question: '数据安全如何保障？',
      answer:
        '全链路 <strong>TLS 加密传输</strong> 与 <strong>静态加密存储</strong>，数据中心通过等保三级认证。企业版额外提供操作审计日志与单点登录（SSO）。',
      defaultOpen: false,
    },
  ],

  /* ------------------------------------------------------------------ */
  /* ⑧ 底部 CTA 横幅                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * 页面底部的行动号召（Call To Action）横幅。
   * 可选 secondaryText / secondaryLink：配置后会出现第二个「描边」按钮（如「预约演示」）。
   * @type {{ title: string, description: string, buttonText: string, buttonLink: string, secondaryText: string, secondaryLink: string }}
   * @example {
   *   title: "准备好了吗？", description: "...",
   *   buttonText: "免费试用", buttonLink: "#",
   *   secondaryText: "预约演示", secondaryLink: "#"
   * }
   */
  cta: {
    title: '准备好让团队协作更高效了吗？',
    description: '立即创建免费账户，14 天内可体验团队版全部功能，无需绑定信用卡。',
    buttonText: '免费开始使用',
    buttonLink: '#',
    secondaryText: '预约产品演示',
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
   * @type {{
   *   copyright: string,
   *   tagline: string,
   *   columns: Array<{ title: string, links: Array<{ label: string, href: string }> }>,
   *   socials: Array<{ icon: string, label: string, href: string }>,
   *   links: Array<{ label: string, href: string }>
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
    copyright: '© 2026 云协作 CloudFlow. 保留所有权利。',
    tagline: '为现代团队打造的协作与项目管理平台，让每一个项目都井然有序。',
    columns: [
      {
        title: '产品',
        links: [
          { label: '功能概览', href: '#compare' },
          { label: '价格方案', href: '#pricing' },
          { label: '更新日志', href: '#' },
          { label: '集成中心', href: '#' },
        ],
      },
      {
        title: '公司',
        links: [
          { label: '关于我们', href: '#' },
          { label: '招贤纳士', href: '#' },
          { label: '联系方式', href: '#' },
          { label: '博客', href: '#' },
        ],
      },
      {
        title: '支持',
        links: [
          { label: '帮助中心', href: '#faq' },
          { label: '开发者文档', href: '#' },
          { label: '服务状态', href: '#' },
          { label: '隐私政策', href: '#' },
        ],
      },
    ],
    socials: [
      { icon: '💬', label: '微信', href: '#' },
      { icon: '🌐', label: '微博', href: '#' },
      { icon: '✉️', label: '邮箱', href: '#' },
    ],
    links: [
      { label: '服务条款', href: '#' },
      { label: 'Cookie 设置', href: '#' },
      { label: 'Site Map', href: '#' },
    ],
  },
};

/**
 * 将本对象显式挂到 window，确保在任何加载顺序下都能被 main.js 访问。
 * （现代浏览器中顶层 const 已是全局可见，这里多写一行仅为兼容与可读性。）
 */
window.PRICING_DATA = PRICING_DATA;
