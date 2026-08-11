/**
 * ============================================================================
 *  main.js —— 交互逻辑与动态渲染
 * ============================================================================
 *
 *  整体职责（这个文件到底做什么）：
 *    1. 读取 config.js 暴露的全局对象 PRICING_DATA；
 *    2. 把数据「渲染」成真正的 DOM（套餐卡片、对比表、FAQ、CTA、页脚）；
 *    3. 处理两类交互：计费方式切换（月付/年付）、FAQ 手风琴折叠。
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
 *  0. 全局状态
 * ========================================================================== */

/**
 * 当前计费方式。'monthly' 表示月付，'yearly' 表示年付。
 * 全局唯一的状态源，所有价格展示都以它为基准重新计算。
 * @type {'monthly' | 'yearly'}
 */
let currentBilling = 'monthly';

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

/* ============================================================================
 *  2. 渲染：顶部导航 + 品牌
 * ========================================================================== */

/**
 * 渲染页头（品牌 Logo + 名称 + 导航菜单）。
 * 导航项通过循环配置数组生成，href 指向对应 section 的 id。
 *
 * @description 根据 PRICING_DATA.brand 与 PRICING_DATA.nav 生成页头
 * @returns {void}
 */
function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // 外层容器：负责整体宽度约束与水平布局
  const inner = createElement('div', { class: 'header__inner' });

  // 品牌区：Logo（Emoji/文字）+ 名称
  const brand = createElement('a', { class: 'brand', href: '#top' });
  brand.appendChild(createElement('span', { class: 'brand__logo', 'aria-hidden': 'true' }, PRICING_DATA.brand.logo));
  brand.appendChild(createElement('span', { class: 'brand__name' }, PRICING_DATA.brand.name));

  // 导航区：由 nav 数组映射生成 <a> 链接
  const nav = createElement('nav', { class: 'nav', 'aria-label': '主导航' });
  PRICING_DATA.nav.forEach((item) => {
    nav.appendChild(createElement('a', { class: 'nav__link', href: item.href }, item.label));
  });

  // 组装：品牌在左，导航在右
  inner.appendChild(brand);
  inner.appendChild(nav);
  header.appendChild(inner);
}

/* ============================================================================
 *  3. 渲染：Hero 标题区（静态文案，仍从数据驱动便于统一）
 * ========================================================================== */

/**
 * 渲染首屏标题区（大标题 + 副标题 + 计费切换开关）。
 * 计费切换开关的两种状态（月付/年付）来自 PRICING_DATA.billing。
 *
 * @description 生成 Hero 区与计费切换控件
 * @returns {void}
 */
function renderHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.appendChild(
    createElement('h1', { class: 'hero__title' }, '选择适合你的方案')
  );
  hero.appendChild(
    createElement(
      'p',
      { class: 'hero__subtitle' },
      '从个人起步到企业级部署，灵活定价，按需扩展。所有套餐均支持随时升级。'
    )
  );

  // 计费切换控件：由「月付按钮」「开关」「年付按钮 + 节省标签」组成
  const toggle = createElement('div', { class: 'billing-toggle', role: 'group', 'aria-label': '计费周期切换' });

  // 月付按钮
  const monthlyBtn = createElement(
    'button',
    { class: 'billing-toggle__option is-active', type: 'button', 'data-billing': 'monthly' },
    PRICING_DATA.billing.monthlyLabel
  );
  // 年付按钮（旁边展示「省 X%」提示）
  const yearlyBtn = createElement(
    'button',
    { class: 'billing-toggle__option', type: 'button', 'data-billing': 'yearly' },
    PRICING_DATA.billing.yearlyLabel
  );
  const saveBadge = createElement('span', { class: 'billing-toggle__save' }, PRICING_DATA.billing.savingText);
  yearlyBtn.appendChild(saveBadge);

  toggle.appendChild(monthlyBtn);
  toggle.appendChild(yearlyBtn);

  hero.appendChild(toggle);

  // 绑定点击事件：用「事件委托」思路——直接给两个按钮加监听
  // （按钮数量固定为 2，直接绑定比委托更简单清晰）
  monthlyBtn.addEventListener('click', () => setBilling('monthly'));
  yearlyBtn.addEventListener('click', () => setBilling('yearly'));
}

/* ============================================================================
 *  4. 渲染：套餐卡片
 * ========================================================================== */

/**
 * 渲染套餐卡片列表。每张卡片的内容完全来自 PRICING_DATA.plans[i]。
 * 卡片中价格部分会被「标记」，便于后续计费切换时只更新价格、不重绘整张卡片。
 *
 * @description 根据 PRICING_DATA.plans 生成所有套餐卡片
 * @returns {void}
 */
function renderPlans() {
  const container = document.getElementById('plans-container');
  if (!container) return;

  // 用 map 把每个套餐对象转成 DOM 节点，再统一塞进容器
  PRICING_DATA.plans.forEach((plan) => {
    // 卡片根节点；popular 为 true 时加高亮类（CSS 负责视觉突出）
    const card = createElement('article', {
      class: 'plan-card' + (plan.popular ? ' plan-card--popular' : ''),
      'data-id': plan.id,
    });

    // 若是最受欢迎套餐：插入徽章（绝对定位在卡片顶部）
    if (plan.popular) {
      card.appendChild(createElement('span', { class: 'plan-card__badge' }, '最受欢迎'));
    }

    // 套餐名
    card.appendChild(createElement('h3', { class: 'plan-card__name' }, plan.name));
    // 一句话亮点描述
    card.appendChild(createElement('p', { class: 'plan-card__desc' }, plan.description));

    // 价格区：结构上预留「原价（划掉）」「折后价」「节省提示」「后缀」
    // 这些子节点后续由 updateBillingDisplay() 按计费方式刷新
    const priceBox = createElement('div', { class: 'plan-price' });

    // 原价（月付时常隐藏，年付时划掉展示）
    const original = createElement('span', { class: 'plan-price__original' });
    original.style.display = 'none'; // 初始月付，不显示原价

    // 当前展示价格（金额部分单独成节点，方便替换文本）
    const amount = createElement('span', { class: 'plan-price__amount' });
    const suffix = createElement('span', { class: 'plan-price__suffix' }, plan.priceSuffix);

    // 节省提示（年付时显示「省 X%」）
    const save = createElement('span', { class: 'plan-price__save' });
    save.style.display = 'none';

    priceBox.appendChild(original);
    priceBox.appendChild(amount);
    priceBox.appendChild(suffix);
    priceBox.appendChild(save);
    card.appendChild(priceBox);

    // 把价格计算所需的原始数据挂到卡片上，切换时直接读取，避免再查配置
    card.dataset.price = String(plan.price);
    card.dataset.currency = plan.currency;
    card.dataset.period = plan.period;

    // 核心卖点列表
    const featureList = createElement('ul', { class: 'plan-card__features' });
    plan.features.forEach((f) => {
      const li = createElement('li', { class: 'plan-card__feature' }, f);
      featureList.appendChild(li);
    });
    card.appendChild(featureList);

    // CTA 按钮
    const cta = createElement('a', { class: 'plan-card__cta', href: plan.ctaLink }, plan.ctaText);
    card.appendChild(cta);

    // 初始先按当前计费方式刷新一次价格显示
    container.appendChild(card);
  });

  // 所有卡片入 DOM 后，统一刷新价格（保证初始状态正确）
  updateBillingDisplay();
}

/* ============================================================================
 *  5. 核心算法：计费切换（价格重算）
 * ========================================================================== */

/**
 * 根据当前计费方式，刷新所有套餐卡片的价格展示。
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

    // 取到卡片内的价格子节点
    const amountEl = card.querySelector('.plan-price__amount');
    const originalEl = card.querySelector('.plan-price__original');
    const saveEl = card.querySelector('.plan-price__save');

    // 免费版 / 0 元：不做折扣计算，直接展示，隐藏原价与节省提示
    if (price === 0) {
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
      // 节省提示
      saveEl.textContent = PRICING_DATA.billing.savingText;
      saveEl.style.display = 'inline';
    } else {
      // 月付：恢复原价，隐藏划线与原价提示
      amountEl.textContent = currency + formatPrice(price);
      originalEl.style.display = 'none';
      saveEl.style.display = 'none';
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
 * 每组内含若干功能行，行内 values 与套餐一一对应。
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

  // ---- 表头：第一列「功能」，其余为套餐名 ----
  const thead = createElement('thead');
  const headRow = createElement('tr');
  headRow.appendChild(createElement('th', { class: 'compare-table__feature-col' }, '功能'));
  PRICING_DATA.plans.forEach((plan) => {
    // 最受欢迎的套餐在表头也加高亮类
    const th = createElement(
      'th',
      { class: 'compare-table__plan-col' + (plan.popular ? ' is-popular' : '') },
      plan.name
    );
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
      category.name
    );
    groupRow.appendChild(groupCell);
    tbody.appendChild(groupRow);

    // 该类别下的每个功能行
    category.items.forEach((item) => {
      const row = createElement('tr', { class: 'compare-table__row' });

      // 行首：功能名
      row.appendChild(createElement('td', { class: 'compare-table__feature' }, item.name));

      // 各套餐对应的值；用索引与 plans 对齐
      item.values.forEach((val, idx) => {
        const plan = PRICING_DATA.plans[idx];
        const td = createElement('td', {
          class: 'compare-table__value' + (plan && plan.popular ? ' is-popular' : ''),
        });
        // 把约定符号转为可读样式：✓ 支持（绿色）、✗ 不支持（灰色弱化）
        if (val === '✓') {
          td.classList.add('is-yes');
          td.textContent = '✓';
          td.setAttribute('aria-label', '支持');
        } else if (val === '✗') {
          td.classList.add('is-no');
          td.textContent = '✗';
          td.setAttribute('aria-label', '不支持');
        } else {
          // 具体数值/文案（如 "5 GB"、"不限"）原样展示
          td.textContent = val;
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
    // 每项是一个 <details> 风格的结构（用 div 自定义以便控制动画）
    const item = createElement('div', { class: 'faq-item' });
    // 用唯一 id 关联问题按钮与答案区，提升可访问性
    const answerId = 'faq-answer-' + index;

    // 问题按钮（始终可见，可点击）
    const questionBtn = createElement(
      'button',
      {
        class: 'faq-item__question',
        type: 'button',
        'aria-expanded': faq.defaultOpen ? 'true' : 'false',
        'aria-controls': answerId,
      },
      faq.question
    );
    // 右侧指示箭头（CSS 旋转动画）
    questionBtn.appendChild(createElement('span', { class: 'faq-item__icon', 'aria-hidden': 'true' }, '⌄'));

    // 答案容器：外层 wrapper 负责 max-height 过渡，内层放真实内容
    const answerWrap = createElement('div', { class: 'faq-item__answer', id: answerId });
    const answerInner = createElement('div', { class: 'faq-item__answer-inner' });
    // answer 允许 HTML（已在 config 中控制来源，这里用 innerHTML 渲染富文本）
    answerInner.innerHTML = faq.answer;
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
 *
 * @description 根据 PRICING_DATA.cta 与 PRICING_DATA.footer 生成 CTA 与页脚
 * @returns {void}
 */
function renderCtaAndFooter() {
  // ---- CTA 横幅 ----
  const ctaBox = document.getElementById('cta-banner');
  if (ctaBox) {
    ctaBox.appendChild(createElement('h2', { class: 'cta__title' }, PRICING_DATA.cta.title));
    ctaBox.appendChild(createElement('p', { class: 'cta__desc' }, PRICING_DATA.cta.description));
    ctaBox.appendChild(
      createElement('a', { class: 'cta__button', href: PRICING_DATA.cta.buttonLink }, PRICING_DATA.cta.buttonText)
    );
  }

  // ---- 页脚 ----
  const footer = document.getElementById('site-footer');
  if (footer) {
    const inner = createElement('div', { class: 'footer__inner' });

    // 版权
    inner.appendChild(createElement('p', { class: 'footer__copy' }, PRICING_DATA.footer.copyright));

    // 链接组
    const links = createElement('div', { class: 'footer__links' });
    PRICING_DATA.footer.links.forEach((link) => {
      links.appendChild(createElement('a', { class: 'footer__link', href: link.href }, link.label));
    });

    inner.appendChild(links);
    footer.appendChild(inner);
  }
}

/* ============================================================================
 *  9. 启动：DOM 就绪后统一渲染
 * ========================================================================== */

/**
 * 初始化入口。等 DOM 解析完成再渲染，确保能取到所有骨架容器。
 * 把所有渲染函数集中在此调用，逻辑一目了然。
 *
 * @description 页面入口：依次调用各渲染函数
 * @returns {void}
 */
function init() {
  renderHeader();
  renderHero();
  renderPlans();
  renderCompareTable();
  renderFaqs();
  renderCtaAndFooter();
}

// DOMContentLoaded：HTML 解析完毕、但资源（图片等）未必加载完时触发，
// 足够我们进行 DOM 渲染；放在这里比直接执行更稳妥。
document.addEventListener('DOMContentLoaded', init);
