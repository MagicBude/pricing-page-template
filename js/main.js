/**
 * ============================================================================
 *  main.js —— 交互逻辑与动态渲染
 * ============================================================================
 *
 *  整体职责（这个文件到底做什么）：
 *    1. 读取 config.js 暴露的全局对象 PRICING_DATA；
 *    2. 把数据「渲染」成真正的 DOM（套餐卡片、对比表、FAQ、CTA、页脚）；
 *    3. 处理三类交互：计费方式切换（月付/年付）、主题切换（亮/暗）、语言切换（中/英）；
 *    4. 移动端汉堡菜单的展开/收起。
 *
 *  为什么全部由 JS 渲染、HTML 只留空容器？
 *    → 这是「数据驱动」的关键。index.html 不含任何具体文案，所有内容来自
 *      PRICING_DATA。你改数据文件即可改页面，无需碰 HTML/JS 结构代码。
 *
 *  代码约定：
 *    - 使用 ES6+ 语法（const/let、箭头函数、模板字符串、Array.map 等）；
 *    - 每个函数都有完整 JSDoc（@description / @param / @returns）；
 *    - 复杂逻辑（循环、映射、事件委托）都有「为什么这么写」的行内注释；
 *    - 纯前端、零依赖，兼容 Chrome / Firefox / Safari / Edge 等现代浏览器。
 */

/* ============================================================================
 *  0. 全局状态与常量
 * ========================================================================== */

/**
 * 默认语言。当某字段的本地化对象缺失当前语言、或用户未作选择时使用。
 * @type {string}
 */
const DEFAULT_LANG = 'zh-CN';

/**
 * 当前计费方式。'monthly' 表示月付，'yearly' 表示年付。
 * 全局唯一的状态源，所有价格展示都以它为基准重新计算。
 * @type {'monthly' | 'yearly'}
 */
let currentBilling = 'monthly';

/**
 * 当前主题。'light' 表示亮色，'dark' 表示暗色。主题相关的唯一状态源。
 * @type {'light' | 'dark'}
 */
let currentTheme = 'light';

/**
 * 当前界面语言。语言切换时更新，并驱动所有文本按 getLocalized() 重新取值。
 * @type {string}
 */
let currentLang = DEFAULT_LANG;

/* ============================================================================
 *  1. 工具函数
 * ========================================================================== */

/**
 * 格式化价格数值：整数直接显示，非整数保留一位小数。
 *
 * 为什么需要它：年付价 = price × discountRate（如 39 × 0.8 = 31.2），
 * 可能带小数；免费版价格 0 是整数。统一格式化可避免「31.2000000004」之类
 * 的浮点展示问题，也让价格显示更干净。
 *
 * @description 将数字格式化为「整数或一位小数」的字符串
 * @param {number} value 待格式化的数值（通常为 price 或 price × 折扣）
 * @returns {string} 格式化后的字符串，例如 39 → "39"、31.2 → "31.2"
 */
function formatPrice(value) {
  // Number.isInteger 判断是否为整数；是整数就不带小数点
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * 创建 DOM 元素的小助手。
 * 为什么封装：原生 document.createElement + 多次 setAttribute 较啰嗦；
 * 用一个函数集中处理「标签 + 属性 + 文本」，让渲染代码更可读、更不容易出错。
 *
 * @description 根据标签名、属性、文本快速创建一个元素节点
 * @param {string} tag 元素标签名，如 'div'、'button'、'span'
 * @param {Object<string, string>} [attributes] 属性键值对，如 { class: 'x', id: 'y' }
 * @param {string} [text] 元素文本内容（会作为纯文本插入，避免 XSS）
 * @returns {HTMLElement} 已配置好的 DOM 元素
 */
function createElement(tag, attributes = {}, text = '') {
  // 创建指定标签的元素
  const el = document.createElement(tag);
  // 遍历属性对象，逐一把键值设为元素属性
  for (const key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      el.setAttribute(key, attributes[key]);
    }
  }
  // 设置文本（使用 textContent 而非 innerHTML，防止把数据当 HTML 执行）
  if (text) {
    el.textContent = text;
  }
  return el;
}

/**
 * 本地化取值：把「可能带多语言的字段」解析为「当前语言下的纯字符串」。
 *
 * 这是本模板多语言能力的核心助手。约定：
 *   - 若 value 是普通字符串/数字，原样返回；
 *   - 若 value 是对象（如 { 'zh-CN': '专业版', 'en': 'Pro' }），
 *     则按 currentLang 返回对应值；缺失时回退到 DEFAULT_LANG；再缺失取第一个值。
 *   - 数组不做整体解析（由调用方对数组内每项分别调用本函数）。
 *
 * 为什么做这层封装：让渲染代码无需关心「该字段是单语言还是多语言」，
 * 统一写成 getLocalized(plan.name) 即可，配置侧想加语言就加、不想加就写字符串。
 *
 * @description 把单语言字符串或本地化对象解析为当前语言对应的字符串
 * @param {(string|number|Object|null)} value 配置中的字段值
 * @returns {string} 当前语言下的展示文本
 */
function getLocalized(value) {
  // 非对象（字符串/数字/null）直接返回；注意数组也走这里（数组不在此解析）
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  // 是本地化对象：优先取当前语言
  if (value[currentLang] != null) return value[currentLang];
  // 回退到默认语言
  if (value[DEFAULT_LANG] != null) return value[DEFAULT_LANG];
  // 再回退到对象的第一个值（兜底，避免空白）
  const first = Object.values(value)[0];
  return first != null ? first : '';
}

/**
 * 读取 UI 框架文案（来自 PRICING_DATA.i18n 字典）。
 *
 * 与 getLocalized 的区别：getLocalized 解析「数据字段里内嵌的多语言」，
 * 而 t() 直接取集中维护的「界面框架文案」（如月付/年付/最受欢迎）。
 *
 * @description 按 key 取出当前语言的 UI 框架文案，缺失则回退默认语言
 * @param {string} key i18n 字典的键，如 'monthly'、'popular'、'save'
 * @returns {string} 当前语言下的文案；若完全缺失则返回 key 本身（便于排查）
 */
function t(key) {
  const dict = PRICING_DATA.i18n && PRICING_DATA.i18n[currentLang];
  if (dict && dict[key] != null) return dict[key];
  // 回退到默认语言的字典
  const fallback = PRICING_DATA.i18n && PRICING_DATA.i18n[DEFAULT_LANG];
  return fallback && fallback[key] != null ? fallback[key] : key;
}

/**
 * 生成「年付节省」文案（如「省 20%」/「Save 20%」）。
 * savingText 模板里含 {rate} 占位符，这里替换为整数百分比：
 *   百分比 = (1 - 折扣系数) × 100，例如 discountRate=0.8 → 20。
 *
 * @description 把 i18n 的 save 模板填入实际百分比
 * @returns {string} 形如 "省 20%" 的提示文案
 */
function getSaveText() {
  const rate = PRICING_DATA.billing.discountRate;
  const percent = Math.round((1 - rate) * 100);
  // String.replace 仅替换第一个 {rate} 出现处，模板里只有一个，正好
  return getLocalized(PRICING_DATA.billing.savingText).replace('{rate}', String(percent));
}

/* ============================================================================
 *  2. 渲染：顶部导航 + 品牌
 * ========================================================================== */

/**
 * 渲染页头（品牌 Logo + 名称 + 导航菜单 + 右侧操作按钮 + 主题/语言切换 + 汉堡按钮）。
 * 结构：品牌在左；右侧容器（header__right）内依次放置「导航链接、操作按钮、
 * 主题切换、语言切换、汉堡按钮」。导航项通过循环配置数组生成，href 指向对应 section 的 id。
 *
 * 其中「语言切换按钮」显示「将要切换到的目标语言代码」作为提示；
 * 「汉堡按钮」仅在移动端可见，用于展开/收起导航。
 *
 * @description 根据 PRICING_DATA 生成页头与所有右上角控件
 * @returns {void}
 */
function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // 外层容器：负责整体宽度约束与水平布局
  const inner = createElement('div', { class: 'header__inner' });

  // 品牌区：Logo（Emoji/文字）+ 名称（name 可能是本地化对象，用 getLocalized 解析）
  const brand = createElement('a', { class: 'brand', href: '#top' });
  brand.appendChild(createElement('span', { class: 'brand__logo', 'aria-hidden': 'true' }, PRICING_DATA.brand.logo));
  brand.appendChild(createElement('span', { class: 'brand__name' }, getLocalized(PRICING_DATA.brand.name)));

  // 右侧容器：导航 + 操作按钮 + 两个切换 + 汉堡，整体靠右排列
  const right = createElement('div', { class: 'header__right' });

  // 导航区：由 nav 数组映射生成 <a> 链接；label 可能本地化
  const nav = createElement('nav', { class: 'nav', 'aria-label': '主导航' });
  PRICING_DATA.nav.forEach((item) => {
    const link = createElement('a', { class: 'nav__link', href: item.href }, getLocalized(item.label));
    // 移动端点击导航后自动收起下拉菜单（提升体验）
    link.addEventListener('click', () => {
      const h = document.getElementById('site-header');
      if (h) h.classList.remove('is-nav-open');
    });
    nav.appendChild(link);
  });
  right.appendChild(nav);

  // 操作按钮组：登录（文字）+ 免费试用（实心），从 navActions 读取（文案可能本地化）
  if (PRICING_DATA.navActions) {
    const actions = createElement('div', { class: 'nav__actions' });
    actions.appendChild(
      createElement('a', { class: 'nav__login', href: PRICING_DATA.navActions.loginLink }, getLocalized(PRICING_DATA.navActions.loginText))
    );
    actions.appendChild(
      createElement('a', { class: 'nav__trial', href: PRICING_DATA.navActions.trialLink }, getLocalized(PRICING_DATA.navActions.trialText))
    );
    right.appendChild(actions);
  }

  // 主题切换按钮：圆形图标按钮。图标初始用 ☀️，applyTheme() 会按当前主题纠正。
  const themeBtn = createElement('button', {
    class: 'theme-toggle',
    type: 'button',
    'aria-label': '切换主题',
  });
  themeBtn.appendChild(createElement('span', { class: 'theme-toggle__icon', 'aria-hidden': 'true' }, '☀️'));
  themeBtn.addEventListener('click', toggleTheme);
  right.appendChild(themeBtn);

  // 语言切换按钮：显示「目标语言代码」作为提示（当前中文 → 显示 EN，反之显示 中）。
  // 这样用户一眼能看出点下去会切到哪种语言。
  const langBtn = createElement('button', {
    class: 'lang-toggle',
    type: 'button',
    'aria-label': '切换语言',
  });
  langBtn.textContent = currentLang === 'zh-CN' ? 'EN' : '中';
  langBtn.addEventListener('click', toggleLanguage);
  right.appendChild(langBtn);

  // 汉堡按钮（移动端展开/收起导航）。桌面端由 CSS 隐藏。
  const navToggle = createElement('button', {
    class: 'nav-toggle',
    type: 'button',
    'aria-label': '打开菜单',
    'aria-expanded': 'false',
  });
  // 用两道横杠的「汉堡」图标（纯 CSS 文字即可，这里用符号避免额外元素）
  navToggle.appendChild(createElement('span', { class: 'nav-toggle__icon', 'aria-hidden': 'true' }, '☰'));
  navToggle.addEventListener('click', toggleNav);
  right.appendChild(navToggle);

  // 组装：品牌在左，右侧容器在右
  inner.appendChild(brand);
  inner.appendChild(right);
  header.appendChild(inner);
}

/* ============================================================================
 *  3. 渲染：Hero 标题区（数据驱动，含计费切换）
 * ========================================================================== */

/**
 * 渲染首屏标题区（大标题 + 副标题 + 计费切换开关）。
 * 计费切换开关的两种状态（月付/年付）来自 PRICING_DATA.billing（文案本地化）。
 *
 * @description 生成 Hero 区与计费切换控件
 * @returns {void}
 */
function renderHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // 读取首屏配置（集中管理，贯彻「只改 config.js」原则）；文本用 getLocalized 解析
  const heroData = PRICING_DATA.hero || {};

  // 营销小标签（胶囊徽章）：标题上方的一句吸引性文案，带绿色状态点
  if (heroData.badge) {
    hero.appendChild(createElement('span', { class: 'hero__badge' }, getLocalized(heroData.badge)));
  }

  // 主标题：若配置了 titleAccent，则把该关键词（按当前语言）包成「渐变高亮」span
  const titleEl = createElement('h1', { class: 'hero__title' });
  const title = getLocalized(heroData.title) || '选择适合你的方案';
  const accent = getLocalized(heroData.titleAccent) || '';
  if (accent && title.includes(accent)) {
    // 用原生 DOM 拆分拼接，避免使用 innerHTML（防止把配置文本当标签解析）
    const [before, after] = title.split(accent);
    if (before) titleEl.appendChild(document.createTextNode(before));
    titleEl.appendChild(createElement('span', { class: 'hero__title-accent' }, accent));
    if (after) titleEl.appendChild(document.createTextNode(after));
  } else {
    titleEl.textContent = title;
  }
  hero.appendChild(titleEl);

  // 副标题：引导性说明文案
  hero.appendChild(
    createElement('p', { class: 'hero__subtitle' }, getLocalized(heroData.subtitle) || '')
  );

  // 计费切换控件：由「月付按钮」「年付按钮 + 节省标签」组成
  const toggle = createElement('div', { class: 'billing-toggle', role: 'group', 'aria-label': '计费周期切换' });

  // 月付按钮（文案本地化）
  const monthlyBtn = createElement(
    'button',
    { class: 'billing-toggle__option is-active', type: 'button', 'data-billing': 'monthly' },
    getLocalized(PRICING_DATA.billing.monthlyLabel)
  );
  // 年付按钮（文案本地化，旁边展示「省 X%」提示，提示也随语言变化）
  const yearlyBtn = createElement(
    'button',
    { class: 'billing-toggle__option', type: 'button', 'data-billing': 'yearly' },
    getLocalized(PRICING_DATA.billing.yearlyLabel)
  );
  const saveBadge = createElement('span', { class: 'billing-toggle__save' }, getSaveText());
  yearlyBtn.appendChild(saveBadge);

  toggle.appendChild(monthlyBtn);
  toggle.appendChild(yearlyBtn);

  hero.appendChild(toggle);

  // 绑定点击事件：按钮数量固定为 2，直接绑定比事件委托更简单清晰
  monthlyBtn.addEventListener('click', () => setBilling('monthly'));
  yearlyBtn.addEventListener('click', () => setBilling('yearly'));
}

/* ============================================================================
 *  4. 渲染：套餐卡片
 * ========================================================================== */

/**
 * 渲染套餐卡片列表。每张卡片的内容完全来自 PRICING_DATA.plans[i]。
 * 卡片中价格部分会被「标记」，便于后续计费切换时只更新价格、不重绘整张卡片。
 * 文本字段（名/描述/卖点/按钮/后缀等）均经 getLocalized 解析。
 *
 * @description 根据 PRICING_DATA.plans 生成所有套餐卡片
 * @returns {void}
 */
function renderPlans() {
  const container = document.getElementById('plans-container');
  if (!container) return;

  // 用 forEach 把每个套餐对象转成 DOM 节点，再统一塞进容器
  PRICING_DATA.plans.forEach((plan) => {
    // 卡片根节点；popular 为 true 时加高亮类（CSS 负责视觉突出）
    const card = createElement('article', {
      class: 'plan-card' + (plan.popular ? ' plan-card--popular' : ''),
      'data-id': plan.id,
    });

    // 若是最受欢迎套餐：插入徽章（绝对定位在卡片顶部），徽章文案来自 i18n
    if (plan.popular) {
      card.appendChild(createElement('span', { class: 'plan-card__badge' }, t('popular')));
    }

    // 套餐名（本地化）
    card.appendChild(createElement('h3', { class: 'plan-card__name' }, getLocalized(plan.name)));
    // 一句话亮点描述（本地化）
    card.appendChild(createElement('p', { class: 'plan-card__desc' }, getLocalized(plan.description)));

    // 价格区：结构上预留「原价（划掉）」「折后价」「节省提示」「后缀」
    // 这些子节点后续由 updateBillingDisplay() 按计费方式刷新
    const priceBox = createElement('div', { class: 'plan-price' });

    // 原价（月付时常隐藏，年付时划掉展示）
    const original = createElement('span', { class: 'plan-price__original' });
    original.style.display = 'none'; // 初始月付，不显示原价

    // 当前展示价格（金额部分单独成节点，方便替换文本）
    const amount = createElement('span', { class: 'plan-price__amount' });
    // 价格后缀（如「起」「定制」，本地化）
    const suffix = createElement('span', { class: 'plan-price__suffix' }, getLocalized(plan.priceSuffix));

    // 节省提示（年付时显示「省 X%」，本地化）
    const save = createElement('span', { class: 'plan-price__save' });
    save.style.display = 'none';

    priceBox.appendChild(original);
    priceBox.appendChild(amount);
    priceBox.appendChild(suffix);
    priceBox.appendChild(save);
    card.appendChild(priceBox);

    // 关键指标速览：价格下方的一行小字（如「不限项目 · 20 成员」）。
    // meta 为可信的配置文本（允许 <b> 等简单标签），这里用 innerHTML 渲染。
    const metaText = getLocalized(plan.meta);
    if (metaText) {
      const meta = createElement('p', { class: 'plan-card__meta' });
      meta.innerHTML = metaText;
      card.appendChild(meta);
    }

    // 把价格计算所需的原始数据挂到卡片上，切换时直接读取，避免再查配置。
    // suffix 以「当前语言」形式存储，用于判断「定制」类套餐不打折（兼容中英文）。
    card.dataset.price = String(plan.price);
    card.dataset.currency = plan.currency;
    card.dataset.period = getLocalized(plan.period);
    card.dataset.suffix = getLocalized(plan.priceSuffix); // 用于判断「定制」类套餐不打折

    // 核心卖点列表（每项可能本地化，逐项 getLocalized）
    const featureList = createElement('ul', { class: 'plan-card__features' });
    plan.features.forEach((f) => {
      const li = createElement('li', { class: 'plan-card__feature' }, getLocalized(f));
      featureList.appendChild(li);
    });
    card.appendChild(featureList);

    // CTA 按钮（文案本地化）
    const cta = createElement('a', { class: 'plan-card__cta', href: plan.ctaLink }, getLocalized(plan.ctaText));
    card.appendChild(cta);

    container.appendChild(card);
  });

  // 所有卡片入 DOM 后，统一刷新价格（保证初始状态正确）
  updateBillingDisplay();
}

/* ============================================================================
 *  5. 核心算法：计费切换（价格重算）
 * ========================================================================== */

/**
 * 根据当前计费方式，刷新所有套餐卡片与对比表头的价格展示。
 *
 * 价格公式（年付）：
 *   折后价 = price × discountRate
 *   例如 专业版 price=39，discountRate=0.8 → 折后价 = 31.2
 * 展示规则：
 *   - 月付：只显示原价（¥39/月），隐藏原价划线与节省提示；
 *   - 年付：显示折后价（¥31.2/月），上方以划线展示原价（¥39/月），并显示「省 X%」。
 *   - 免费版（price=0）与「定制」类套餐不计算折扣，直接显示，隐藏节省提示。
 *
 * @description 按 currentBilling 重新计算每个套餐的价格展示
 * @returns {void}
 */
function updateBillingDisplay() {
  const isYearly = currentBilling === 'yearly';
  const rate = PRICING_DATA.billing.discountRate;

  // 遍历每张卡片，单独更新价格区（不重绘整卡，性能更好）
  document.querySelectorAll('.plan-card').forEach((card) => {
    // 从卡片上挂的数据还原为数字/字符串
    const price = parseFloat(card.dataset.price);
    const currency = card.dataset.currency;
    const period = card.dataset.period;
    const suffix = card.dataset.suffix || '';

    // 取到卡片内的价格子节点
    const amountEl = card.querySelector('.plan-price__amount');
    const originalEl = card.querySelector('.plan-price__original');
    const saveEl = card.querySelector('.plan-price__save');

    // 免费版（price=0）与「定制」类套餐（suffix 为中/英「定制」）不参与折扣计算：
    // 直接展示原价金额，隐藏原价划线提示与节省提示。
    if (price === 0 || suffix === '定制' || suffix === 'Custom') {
      amountEl.textContent = currency + formatPrice(price);
      originalEl.style.display = 'none';
      saveEl.style.display = 'none';
      return;
    }

    if (isYearly) {
      // 公式：折后价 = 原价 × 折扣系数
      const discounted = price * rate;
      amountEl.textContent = currency + formatPrice(discounted);
      // 原价划线展示（始终带计费周期文案）
      originalEl.textContent = currency + formatPrice(price) + period;
      originalEl.style.display = 'inline';
      // 节省提示（本地化）
      saveEl.textContent = getSaveText();
      saveEl.style.display = 'inline';
    } else {
      // 月付：恢复原价，隐藏划线与原价提示
      amountEl.textContent = currency + formatPrice(price);
      originalEl.style.display = 'none';
      saveEl.style.display = 'none';
    }
  });

  // 同步更新对比矩阵「表头」的价格（与卡片逻辑保持一致）：
  // 免费版与「定制」类套餐不参与折扣，仅展示原价。
  document.querySelectorAll('.compare-table__plan-price').forEach((el) => {
    const price = parseFloat(el.dataset.price);
    const currency = el.dataset.currency;
    const suffix = el.dataset.suffix || '';
    if (isYearly && price > 0 && suffix !== '定制' && suffix !== 'Custom') {
      el.textContent = currency + formatPrice(price * rate) + (suffix ? ' ' + suffix : '');
    } else {
      el.textContent = currency + formatPrice(price) + (suffix ? ' ' + suffix : '');
    }
  });
}

/**
 * 设置计费方式，并同步切换按钮的高亮状态。
 * 这是按钮点击的入口；切换后会调用 updateBillingDisplay 刷新价格。
 *
 * @description 切换月付/年付并更新界面
 * @param {'monthly' | 'yearly'} mode 目标计费方式
 * @returns {void}
 */
function setBilling(mode) {
  // 状态更新：唯一的状态源
  currentBilling = mode;

  // 更新两个切换按钮的激活样式（active 类控制视觉高亮）
  document.querySelectorAll('.billing-toggle__option').forEach((btn) => {
    const isActive = btn.dataset.billing === mode;
    // classList.toggle 第二参数为布尔：true 加类、false 移除类
    btn.classList.toggle('is-active', isActive);
  });

  // 价格随状态刷新
  updateBillingDisplay();
}

/* ============================================================================
 *  6. 渲染：功能对比矩阵
 * ========================================================================== */

/**
 * 渲染功能对比表。表头为套餐名（与 plans 顺序一致），表体按「类别」分组，
 * 每组内含若干功能行，行内 values 与套餐一一对应（values 项可能本地化）。
 *
 * 注意：移动端表格可能溢出，外层容器 .compare-scroll 提供横向滚动（见 CSS）。
 *
 * @description 根据 PRICING_DATA.features 生成对比矩阵表格
 * @returns {void}
 */
function renderCompareTable() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  // 表格元素
  const table = createElement('table', { class: 'compare-table' });

  // ---- 表头：第一列「功能」（文案本地化），其余为套餐名 ----
  const thead = createElement('thead');
  const headRow = createElement('tr');
  headRow.appendChild(createElement('th', { class: 'compare-table__feature-col' }, t('featureCol')));
  PRICING_DATA.plans.forEach((plan) => {
    // 最受欢迎的套餐在表头也加高亮类
    const th = createElement(
      'th',
      { class: 'compare-table__plan-col' + (plan.popular ? ' is-popular' : '') }
    );
    // 套餐名（本地化）
    th.appendChild(createElement('div', { class: 'compare-table__plan-name' }, getLocalized(plan.name)));
    // 表头价格：随计费切换联动更新（data-* 由 updateBillingDisplay 读取）
    const priceEl = createElement('div', {
      class: 'compare-table__plan-price',
      'data-price': String(plan.price),
      'data-currency': plan.currency,
      'data-period': getLocalized(plan.period),
      'data-suffix': getLocalized(plan.priceSuffix),
    });
    priceEl.textContent =
      plan.currency + formatPrice(plan.price) + (getLocalized(plan.priceSuffix) ? ' ' + getLocalized(plan.priceSuffix) : '');
    th.appendChild(priceEl);
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // ---- 表体：按类别分组 ----
  const tbody = createElement('tbody');

  PRICING_DATA.features.categories.forEach((category) => {
    // 每个类别先插入一行「类别标题」（跨所有列）
    const groupRow = createElement('tr', { class: 'compare-table__group' });
    // colspan = 1（功能列）+ 套餐数量，确保标题行横跨整表
    const groupCell = createElement(
      'td',
      { colspan: String(1 + PRICING_DATA.plans.length) },
      getLocalized(category.name) // 类别名（本地化）
    );
    groupRow.appendChild(groupCell);
    tbody.appendChild(groupRow);

    // 该类别下的每个功能行
    category.items.forEach((item) => {
      const row = createElement('tr', { class: 'compare-table__row' });

      // 行首：功能名（本地化）
      row.appendChild(createElement('td', { class: 'compare-table__feature' }, getLocalized(item.name)));

      // 各套餐对应的值；用索引与 plans 对齐（每项可能本地化，逐项 getLocalized）
      item.values.forEach((val, idx) => {
        const plan = PRICING_DATA.plans[idx];
        const td = createElement('td', {
          class: 'compare-table__value' + (plan && plan.popular ? ' is-popular' : ''),
        });
        // 把约定符号转为可读样式：✓ 支持（绿色）、✗ 不支持（灰色弱化）
        const text = getLocalized(val);
        if (text === '✓') {
          td.classList.add('is-yes');
          td.textContent = '✓';
          td.setAttribute('aria-label', '支持');
        } else if (text === '✗') {
          td.classList.add('is-no');
          td.textContent = '✗';
          td.setAttribute('aria-label', '不支持');
        } else {
          // 具体数值/文案（如 "5 GB"、"Unlimited"）原样展示
          td.textContent = text;
        }
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });
  });

  table.appendChild(tbody);

  // 用横向滚动容器包裹表格（移动端友好）
  const scroll = createElement('div', { class: 'compare-scroll' });
  scroll.appendChild(table);
  container.appendChild(scroll);
}

/* ============================================================================
 *  7. 渲染：FAQ 手风琴
 * ========================================================================== */

/**
 * 渲染常见问题列表，并实现「手风琴」折叠效果：
 *   - 点击某个问题 → 对应答案以 max-height 过渡平滑展开；
 *   - 同时自动收起其他已展开的问题（保证同一时刻通常只展开一个）。
 *
 * 为什么用 max-height 而不是 height: auto？
 *   → CSS 无法对 height: auto 做过渡动画；用足够大的 max-height 值配合
 *     transition 即可实现「展开/收起」的平滑动画，是纯 CSS 的经典做法。
 *
 * @description 根据 PRICING_DATA.faqs 生成 FAQ 并绑定折叠交互
 * @returns {void}
 */
function renderFaqs() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  PRICING_DATA.faqs.forEach((faq, index) => {
    // 每项是一个结构（用 div 自定义以便控制动画）
    const item = createElement('div', { class: 'faq-item' });
    // 用唯一 id 关联问题按钮与答案区，提升可访问性
    const answerId = 'faq-answer-' + index;

    // 问题按钮（始终可见，可点击）；question 可能本地化
    const questionBtn = createElement(
      'button',
      {
        class: 'faq-item__question',
        type: 'button',
        'aria-expanded': faq.defaultOpen ? 'true' : 'false',
        'aria-controls': answerId,
      },
      getLocalized(faq.question)
    );
    // 右侧指示图标：用「+」表示可展开，展开时 CSS 旋转 45° 变成「×」
    questionBtn.appendChild(createElement('span', { class: 'faq-item__icon', 'aria-hidden': 'true' }, '+'));

    // 答案容器：外层 wrapper 负责 max-height 过渡，内层放真实内容
    const answerWrap = createElement('div', { class: 'faq-item__answer', id: answerId });
    const answerInner = createElement('div', { class: 'faq-item__answer-inner' });
    // answer 允许 HTML（已在 config 中控制来源，这里用 innerHTML 渲染富文本）；answer 可能本地化
    answerInner.innerHTML = getLocalized(faq.answer);
    answerWrap.appendChild(answerInner);

    // 若默认展开：加 is-open 类（CSS 会把它 max-height 设为展开值）
    if (faq.defaultOpen) {
      item.classList.add('is-open');
    }

    // 点击问题：切换自身展开，并收起其他项（手风琴行为）
    questionBtn.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      // 先收起所有项（手风琴：同时只展开一个）
      document.querySelectorAll('.faq-item').forEach((other) => {
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.faq-item__question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // 若本次是要展开，则只展开当前项
      if (willOpen) {
        item.classList.add('is-open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });

    item.appendChild(questionBtn);
    item.appendChild(answerWrap);
    container.appendChild(item);
  });
}

/* ============================================================================
 *  8. 渲染：底部 CTA 横幅 + 页脚
 * ========================================================================== */

/**
 * 渲染底部 CTA 横幅（行动号召）与页脚（版权 + 链接）。
 * 文本字段均经 getLocalized 解析。
 *
 * @description 根据 PRICING_DATA.cta 与 PRICING_DATA.footer 生成 CTA 与页脚
 * @returns {void}
 */
function renderCtaAndFooter() {
  // ---- CTA 横幅 ----
  const ctaBox = document.getElementById('cta-banner');
  if (ctaBox) {
    ctaBox.appendChild(createElement('h2', { class: 'cta__title' }, getLocalized(PRICING_DATA.cta.title)));
    ctaBox.appendChild(createElement('p', { class: 'cta__desc' }, getLocalized(PRICING_DATA.cta.description)));

    // 按钮组（主按钮 + 可选次按钮，横向排列、可换行）
    const actions = createElement('div', { class: 'cta__actions' });
    actions.appendChild(
      createElement('a', { class: 'cta__button', href: PRICING_DATA.cta.buttonLink }, getLocalized(PRICING_DATA.cta.buttonText))
    );
    // 仅在配置了 secondaryText 时渲染第二个「描边」按钮（如「预约演示」）
    if (PRICING_DATA.cta.secondaryText) {
      actions.appendChild(
        createElement(
          'a',
          { class: 'cta__button cta__button--ghost', href: PRICING_DATA.cta.secondaryLink || '#' },
          getLocalized(PRICING_DATA.cta.secondaryText)
        )
      );
    }
    ctaBox.appendChild(actions);
  }

  // ---- 页脚（品牌简介 + 多链接列 + 社交图标 + 法律链接）----
  const footer = document.getElementById('site-footer');
  if (footer) {
    const inner = createElement('div', { class: 'footer__inner' });

    // 顶部：品牌区（Logo + 名称 + 一句话简介）+ 链接列
    const top = createElement('div', { class: 'footer__top' });

    // 品牌区
    const brandCol = createElement('div', { class: 'footer__brand' });
    const brand = createElement('a', { class: 'brand', href: '#top' });
    brand.appendChild(createElement('span', { class: 'brand__logo', 'aria-hidden': 'true' }, PRICING_DATA.brand.logo));
    brand.appendChild(createElement('span', { class: 'brand__name' }, getLocalized(PRICING_DATA.brand.name)));
    brandCol.appendChild(brand);
    const tagline = getLocalized(PRICING_DATA.footer.tagline);
    if (tagline) {
      brandCol.appendChild(createElement('p', { class: 'footer__tagline' }, tagline));
    }
    top.appendChild(brandCol);

    // 链接列：由 footer.columns 映射生成（产品 / 公司 / 支持……）；标题与链接文案本地化
    const cols = createElement('div', { class: 'footer__cols' });
    (PRICING_DATA.footer.columns || []).forEach((col) => {
      const colEl = createElement('div', { class: 'footer__col' });
      colEl.appendChild(createElement('h4', { class: 'footer__col-title' }, getLocalized(col.title)));
      (col.links || []).forEach((link) => {
        colEl.appendChild(createElement('a', { class: 'footer__link', href: link.href }, getLocalized(link.label)));
      });
      cols.appendChild(colEl);
    });
    top.appendChild(cols);
    inner.appendChild(top);

    // 底部条：版权（左）+ 社交图标（右）
    const bottom = createElement('div', { class: 'footer__bottom' });
    bottom.appendChild(createElement('span', { class: 'footer__copy' }, getLocalized(PRICING_DATA.footer.copyright)));

    // 社交图标：Emoji 占位，零依赖；label 可能本地化（用于 title/aria-label）
    const socials = createElement('div', { class: 'footer__socials' });
    (PRICING_DATA.footer.socials || []).forEach((s) => {
      socials.appendChild(
        createElement('a', { class: 'footer__social', href: s.href, title: getLocalized(s.label), 'aria-label': getLocalized(s.label) }, s.icon)
      );
    });
    bottom.appendChild(socials);
    inner.appendChild(bottom);

    // 法律链接（可选，最底部一行）；label 可能本地化
    const legal = PRICING_DATA.footer.links || [];
    if (legal.length) {
      const legalRow = createElement('div', { class: 'footer__legal' });
      legal.forEach((link) => {
        legalRow.appendChild(
          createElement('a', { class: 'footer__link footer__link--muted', href: link.href }, getLocalized(link.label))
        );
      });
      inner.appendChild(legalRow);
    }

    footer.appendChild(inner);
  }
}

/* ============================================================================
 *  8.5 主题切换（亮色 / 暗色 一键切换）
 * ========================================================================== */

/**
 * 应用指定主题到页面，并同步切换按钮的图标与无障碍标签。
 *
 * 原理：暗色样式全部由 style.css 中 `[data-theme='dark']` 这组 CSS 变量覆盖实现。
 * 因此「切换主题」本质只是给 <html> 元素设置 / 移除 data-theme 属性，
 * 浏览器会自动改用对应的变量值（颜色、背景、边框等随之变化）。
 *
 * @description 把主题写到 <html data-theme> 并刷新切换按钮
 * @param {'light' | 'dark'} theme 目标主题
 * @returns {void}
 */
function applyTheme(theme) {
  // 记录当前主题（状态源）
  currentTheme = theme;

  // 关键一步：给 <html> 设置 data-theme，触发 CSS 变量切换
  document.documentElement.setAttribute('data-theme', theme);

  // 同步切换按钮：暗色显示 🌙、亮色显示 ☀️，并改写无障碍标签说明「将切换到哪种模式」
  const icon = document.querySelector('.theme-toggle__icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.setAttribute('aria-label', theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式');
  }
}

/**
 * 初始化主题：决定页面首次展示用「亮色还是暗色」。
 *
 * 优先级（为什么这样排）：
 *   1. localStorage 中用户上次的手动选择（最尊重用户意愿）；
 *   2. 配置 PRICING_DATA.theme：若为 "auto" 则跟随系统配色，否则直接用该值；
 *   3. 兜底为亮色。
 *
 * @description 读取本地存储/配置，确定并应用初始主题
 * @returns {void}
 */
function initTheme() {
  // 尝试读取用户上次的手动选择（localStorage 在隐私模式等场景可能抛错，故包裹 try）
  let saved = null;
  try {
    saved = localStorage.getItem('pricing-theme');
  } catch (e) {
    saved = null;
  }

  let theme;
  if (saved === 'light' || saved === 'dark') {
    // 1) 用户曾手动切换过，沿用其选择
    theme = saved;
  } else if (PRICING_DATA.theme === 'auto') {
    // 2a) 配置为 auto：跟随系统配色偏好
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  } else {
    // 2b/3) 配置为具体值（light/dark），兜底亮色
    theme = PRICING_DATA.theme === 'dark' ? 'dark' : 'light';
  }

  applyTheme(theme);
}

/**
 * 主题切换按钮的点击事件处理：在亮/暗之间取反，并持久化选择。
 *
 * @description 切换主题并写入 localStorage
 * @returns {void}
 */
function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  // 记住用户选择，下次访问自动沿用（同样包裹 try 以兼容异常环境）
  try {
    localStorage.setItem('pricing-theme', next);
  } catch (e) {
    /* 忽略持久化失败，不影响本次切换 */
  }
}

/* ============================================================================
 *  8.6 语言切换（中 / 英 一键切换）
 * ========================================================================== */

/**
 * 初始化语言：决定页面首次展示用哪种语言。
 *
 * 优先级：
 *   1. localStorage 中用户上次的手动选择（最尊重用户意愿）；
 *   2. 配置 PRICING_DATA.language（默认 'zh-CN'）。
 *
 * @description 读取本地存储/配置，确定初始语言
 * @returns {void}
 */
function initLanguage() {
  let saved = null;
  try {
    saved = localStorage.getItem('pricing-lang');
  } catch (e) {
    saved = null;
  }
  // 仅接受我们实际提供的两种语言；其它一律回退到配置默认值
  currentLang = saved === 'zh-CN' || saved === 'en' ? saved : (PRICING_DATA.language || DEFAULT_LANG);
}

/**
 * 应用指定语言：写入 <html lang>、持久化、并整体重渲染（所有文本随之更新）。
 *
 * 为什么「整体重渲染」而不是逐个改文本？
 *   → 本模板所有内容都由 JS 生成，重渲染是幂等的（清掉旧节点再生成新节点），
 *     实现最简单、最不易出错；重渲染后会重新套用当前主题与计费状态，体验一致。
 *
 * @description 设置语言、持久化并重新渲染全部内容
 * @param {string} lang 目标语言代码（'zh-CN' | 'en'）
 * @returns {void}
 */
function applyLanguage(lang) {
  currentLang = lang;
  // 同步 <html lang> 属性（对屏幕阅读器与 SEO 有意义）
  document.documentElement.setAttribute('lang', lang);
  // 记住用户选择，下次访问自动沿用
  try {
    localStorage.setItem('pricing-lang', lang);
  } catch (e) {
    /* 忽略持久化失败 */
  }
  renderAll();
}

/**
 * 语言切换按钮的点击事件：在中/英之间取反。
 *
 * @description 切换界面语言并重渲染
 * @returns {void}
 */
function toggleLanguage() {
  applyLanguage(currentLang === 'zh-CN' ? 'en' : 'zh-CN');
}

/* ============================================================================
 *  8.7 移动端汉堡菜单
 * ========================================================================== */

/**
 * 汉堡按钮的点击事件：切换导航菜单的展开/收起（在 header 上加/去 is-nav-open 类）。
 * 实际的下拉面板样式由 CSS 在移动端针对 .header.is-nav-open .nav 实现。
 *
 * @description 展开或收起移动端导航
 * @returns {void}
 */
function toggleNav() {
  const header = document.getElementById('site-header');
  if (!header) return;
  // classList.toggle 返回切换后的状态（true=已展开）
  const open = header.classList.toggle('is-nav-open');
  const btn = header.querySelector('.nav-toggle');
  if (btn) {
    // 同步无障碍属性，告知屏幕阅读器当前展开状态
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }
}

/* ============================================================================
 *  8.8 区块标题（对比 / FAQ）随语言更新
 * ========================================================================== */

/**
 * 更新 index.html 中写死的区块标题与副标题（对比区、FAQ 区）。
 * 这些标题位于 HTML 骨架里（非 JS 生成），故单独在语言切换时刷新其文本，
 * 文案取自 i18n 字典，保证与整体语言一致。
 *
 * @description 把对比区/FAQ 区标题切换为当前语言
 * @returns {void}
 */
function updateSectionTitles() {
  const cmp = document.getElementById('compare-title');
  if (cmp) cmp.textContent = t('compareTitle');
  const cmps = document.getElementById('compare-subtitle');
  if (cmps) cmps.textContent = t('compareSubtitle');
  const faq = document.getElementById('faq-title');
  if (faq) faq.textContent = t('faqTitle');
}

/* ============================================================================
 *  9. 整体渲染（清空 + 重渲染，用于语言切换）
 * ========================================================================== */

/**
 * 清空所有骨架容器并重新渲染全部内容。用于语言切换场景。
 * 重渲染后重新套用当前计费状态（按钮高亮+价格）与主题图标，确保视觉一致；
 * 同时刷新对比/FAQ 区块标题。
 *
 * @description 清空容器并按当前状态重新生成整页
 * @returns {void}
 */
function renderAll() {
  // 需要清空的容器 id 列表（与 index.html 的骨架一一对应）
  const ids = ['site-header', 'hero', 'plans-container', 'compare-container', 'faq-container', 'cta-banner', 'site-footer'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = ''; // 清空旧节点，避免重复叠加
  });

  // 依次重新渲染各区块
  renderHeader();
  renderHero();
  renderPlans();          // 内部会调用 updateBillingDisplay 刷新价格
  renderCompareTable();
  renderFaqs();
  renderCtaAndFooter();

  // 重渲染后重新套用状态：计费按钮高亮 + 价格（setBilling 会再算一次价格）
  setBilling(currentBilling);
  // 重新套用主题图标（header 已重建，按钮图标需刷新）
  applyTheme(currentTheme);
  // 刷新对比/FAQ 区块标题语言
  updateSectionTitles();
}

/* ============================================================================
 *  10. 启动：DOM 就绪后统一渲染
 * ========================================================================== */

/**
 * 初始化入口。等 DOM 解析完成再渲染，确保能取到所有骨架容器。
 * 把初始化（语言/主题）与各渲染函数集中在此调用，逻辑一目了然。
 *
 * @description 页面入口：依次初始化并渲染各区块
 * @returns {void}
 */
function init() {
  initLanguage(); // 先定语言，后续所有 getLocalized 才能用正确的语言
  initTheme();    // 定主题（此时 header 尚未渲染，applyTheme 仅设 data-theme，图标在 renderAll 后纠正）
  renderAll();    // 清空并渲染全部内容，并统一套用计费/主题/区块标题
}

// DOMContentLoaded：HTML 解析完毕、但资源（图片等）未必加载完时触发，
// 足够我们进行 DOM 渲染；放在这里比直接执行更稳妥。
document.addEventListener('DOMContentLoaded', init);
