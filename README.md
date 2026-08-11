# 通用 SaaS 价格对比页面模板

一套**纯前端、零外部依赖**的定价展示页面模板。所有内容由一份配置文件（`js/config.js`）驱动，你只需修改配置即可适配任意 SaaS 项目，无需改动结构代码。

---

## 一、特性

- **数据驱动**：页面文案、套餐、对比表、FAQ 全部来自 `config.js`，改数据即改页面。
- **零依赖**：纯 HTML + CSS + JS，不引入任何第三方库 / 框架 / CDN。
- **教科书级注释**：每个文件均带完整中文注释，适合初学者学习与二次开发。
- **移动优先响应式**：640px（平板）、1024px（桌面）两档断点，套餐卡片自动 1/2/4 列布局。
- **月付 / 年付切换**：一键切换计费方式，价格自动按折扣系数重算并展示「原价划线 + 节省提示」。
- **首屏营销标签 + 渐变标题**：可配置的 Hero 胶囊标签，以及标题关键词渐变高亮（均为数据驱动）。
- **套餐关键指标速览**：每张卡片价格下方展示「不限项目 · 20 成员 · 500 GB 存储」等一行速览（`plan.meta`）。
- **对比矩阵增强**：表头联动显示各套餐价格（随计费切换）、表头吸顶与首列吸左（移动端横向滚动时功能名与表头始终可见）。
- **多列页脚 + 社交图标**：标准 SaaS 页脚布局，含品牌简介、多个链接列与社交入口。
- **CTA 双按钮**：主按钮 + 可选次按钮（如「预约演示」），纯 CSS 装饰光斑提升视觉层次。
- **FAQ 手风琴**：平滑展开/收起，互斥折叠，`+` / `×` 图标反馈。
- **导航操作按钮**：右上角「登录」+「免费试用」实心按钮（数据驱动，可改文案/链接）。
- **主题一键切换（亮 / 暗）**：右上角按钮即时切换，选择记入 localStorage 自动沿用；暗色变量已完整定义。
- **双语（中 / 英）一键切换**：右上角按钮在中文/英文间切换，所有文案（套餐、对比、FAQ、页脚、区块标题）整体重渲染并记忆选择；框架文案集中于 `i18n` 字典，业务文案可用「本地化对象」写法。
- **移动端汉堡菜单**：< 640px 时顶部导航收起为汉堡图标，点击展开全宽下拉面板，操作按钮与切换键保留在栏内。

---

## 二、文件目录结构

```text
pricing-template/
├── index.html          # 页面骨架（仅作容器与脚本引用，不含具体数据）
├── css/
│   └── style.css       # 全部样式（CSS 变量管理主题 + 响应式）
├── js/
│   ├── config.js       # ⭐ 核心数据仓库（所有页面数据集中于此）
│   └── main.js         # 交互逻辑（渲染 / 计费切换 / FAQ 折叠）
└── README.md           # 本说明文档
```

| 文件 | 作用 |
| --- | --- |
| `index.html` | 仅保留语义化骨架容器（如 `#plans-container`）并引入 CSS 与两个 JS。 |
| `css/style.css` | 所有视觉样式；`:root` 内为可改的主题变量。 |
| `js/config.js` | **唯一数据源**。改这里即可改页面全部内容。 |
| `js/main.js` | 读取 `PRICING_DATA` 动态渲染 DOM，并绑定交互事件。 |

> **解耦关系**：`index.html` / `style.css` / `main.js` 都不含业务数据。新增套餐、修改价格、增删功能项——永远只改 `config.js`。

---

## 三、快速上手

1. 直接双击 `index.html` 即可在浏览器打开预览。
2. 或用本地静态服务器（推荐，避免个别浏览器对本地文件的限制）：

   ```bash
   # 任选其一，在项目根目录执行
   python -m http.server 8080
   # 或
   npx serve .
   ```

   然后访问 `http://localhost:8080`。

3. 修改 `js/config.js` 中的内容，保存后刷新浏览器即可看到变化。

---

## 四、`config.js` 字段逐条说明

`config.js` 暴露一个全局对象 `PRICING_DATA`，字段如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `theme` | `string` | 初始/默认主题：`light` / `dark` / `auto`（跟随系统）。页面右上角有切换按钮，用户手动选择会记入 localStorage。 |
| `language` | `string` | 界面**默认**语言（`zh-CN` / `en`）。页面右上角有切换按钮，用户手动选择会记入 localStorage 覆盖此值。 |
| `i18n` | `Object` | UI 框架文案的多语言字典（月付/年付/最受欢迎/功能/区块标题等）。键在 `main.js` 用 `t(key)` 读取；新增语言只需在此加一份。 |
| `navActions` | `{loginText, loginLink, trialText, trialLink}` | 导航栏右上角操作按钮（登录 + 免费试用）；`loginText`/`trialText` 支持本地化对象，不需要可整体删去本块。 |
| `hero.badge` | `(string\|Object)` | 首屏标题上方的营销小标签（胶囊徽章），支持本地化对象。 |
| `hero.title` | `(string\|Object)` | 首屏主标题，支持本地化对象。 |
| `hero.titleAccent` | `(string\|Object)` | 主标题中要做渐变高亮的关键词（按语言分别指定）；留空则不高亮。 |
| `hero.subtitle` | `(string\|Object)` | 首屏副标题，支持本地化对象。 |
| `brand.name` | `(string\|Object)` | 品牌名称，显示在导航栏，支持本地化对象。 |
| `brand.logo` | `string` | Logo 占位：可填 Emoji（如 `☁️`）或文字（如 `CF`）。 |
| `nav` | `Array<{label, href}>` | 顶部导航菜单，顺序即展示顺序，`href` 指向区块 id；`label` 支持本地化对象。 |
| `billing.monthlyLabel` | `(string\|Object)` | 月付标签文案，支持本地化对象。 |
| `billing.yearlyLabel` | `(string\|Object)` | 年付标签文案，支持本地化对象。 |
| `billing.discountRate` | `number` | 年付折扣系数，`0.8` = 八折。折后价 = `price × discountRate`。 |
| `billing.savingText` | `(string\|Object)` | 年付时展示的「省 X%」提示（含 `{rate}` 占位），支持本地化对象。 |
| `plans` | `Array` | 套餐列表，见下表（各文本字段均支持本地化对象）。 |
| `features.categories` | `Array` | 对比矩阵分组，每组含 `name` 与 `items`（`name`/`values` 支持本地化对象）。 |
| `faqs` | `Array<{question, answer, defaultOpen}>` | 常见问题；`question`/`answer` 支持本地化对象，`answer` 支持 HTML。 |
| `cta` | `{title, description, buttonText, buttonLink, secondaryText, secondaryLink}` | 底部行动号召横幅；后两个为可选次按钮，文本字段支持本地化对象。 |
| `footer.copyright` | `(string\|Object)` | 版权文案（底部条左侧），支持本地化对象。 |
| `footer.tagline` | `(string\|Object)` | 品牌一句话简介（品牌区下方），支持本地化对象。 |
| `footer.columns` | `Array<{title, links}>` | 页脚链接列，每列含标题与若干链接（标题/链接文案支持本地化对象）。 |
| `footer.socials` | `Array<{icon, label, href}>` | 社交图标（Emoji 占位），底部条右侧；`label` 支持本地化对象。 |
| `footer.links` | `Array<{label, href}>` | 最底部的法律/次要链接（可选），链接文案支持本地化对象。 |

> **★ 多语言写法（本地化对象）**：上表中类型为 `(string|Object)` 的字段，既可以直接写普通字符串（单语言时足够），也可以写成「本地化对象」来提供多语言：
>
> ```js
> // 单语言：直接写字符串
> name: '专业版'
> // 多语言：写成对象，键为语言代码
> name: { 'zh-CN': '专业版', 'en': 'Pro' }
> ```
>
> `main.js` 的 `getLocalized()` 助手会按「当前语言」自动取出对应文案；若某语言缺失，回退到默认语言 `zh-CN`，再回退到对象的第一个值。这样你**只做单语言时完全不用关心多语言**；需要时把字段改成对象、并在 `i18n` 里补框架文案即可。`✓` / `✗` 与纯数字与语言无关，无需本地化。

### `plans` 数组每一项

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识，用于 DOM 定位。 |
| `name` | `string` | 套餐名称。 |
| `price` | `number` | 月单价数值；免费填 `0`。 |
| `currency` | `string` | 货币符号，如 `¥`。 |
| `period` | `string` | 计费周期文案，如 `/月`。 |
| `description` | `string` | 一句亮点描述。 |
| `features` | `string[]` | 卡片上展示的核心卖点。 |
| `meta` | `string` | 关键指标速览（如 `不限项目 · 20 成员`）；显示在价格下方，留空 `''` 不显示。允许用 `<b>` 强调数字。 |
| `ctaText` | `string` | 按钮文案。 |
| `ctaLink` | `string` | 按钮链接（`#` 占位或真实地址）。 |
| `popular` | `boolean` | 是否「最受欢迎」（显示徽章 + 高亮）。 |
| `priceSuffix` | `string` | 价格后缀，如 `起` / `定制`；无则留空 `''`。 |

---

## 五、常见修改操作

### 1. 修改品牌与导航

```js
brand: { name: '你的产品', logo: '🚀' },
nav: [
  { label: '首页', href: '#top' },
  { label: '定价', href: '#pricing' },
],
```

### 2. 增删一个套餐

在 `plans` 数组中**追加 / 删除**一个对象即可：

```js
{
  id: 'starter',
  name: '入门版',
  price: 19,
  currency: '¥',
  period: '/月',
  description: '适合刚起步的个人开发者。',
  features: ['2 名成员', '20 GB 存储', '基础看板'],
  ctaText: '立即试用',
  ctaLink: '#',
  popular: false,
  priceSuffix: '',
},
```

> ⚠️ **联动提醒**：套餐数量改变后，对比矩阵 `features.categories[*].items[*].values` 数组长度也必须同步调整，使其始终**等于套餐数量且顺序对应**。

### 3. 增删一项对比功能

在 `features.categories` 的某个类别 `items` 里加一项，并**保证 `values` 长度 = 套餐数**：

```js
// 假设有 4 个套餐，values 必须 4 个，顺序对应 plans
{ name: '甘特图', values: ['✗', '✓', '✓', '✓'] },
```

- `✓` 表示支持（绿色）
- `✗` 表示不支持（灰色弱化）
- 其他字符串（如 `5 GB`、`不限`）原样展示

### 4. 调整年付折扣

```js
billing: {
  monthlyLabel: '按月付费',
  yearlyLabel: '按年付费',
  discountRate: 0.75,   // 改为 7.5 折
  savingText: '省 25%', // 提示文案同步改
},
```

### 5. 自定义首屏文案

```js
hero: {
  badge: '限时优惠 · 新用户立减',   // 标题上方营销小标签
  title: '选择适合你的协作方案',
  titleAccent: '协作',               // 仅该词以渐变色高亮
  subtitle: '从个人起步到企业级部署，灵活定价，按需扩展。',
},
```

### 6. 给卡片加「关键指标速览」

在 `plans` 每一项加 `meta`（价格为下方的速览行，可用 `<b>` 强调数字）：

```js
{
  // …其他字段…
  meta: '<b>不限项目</b> · 20 名成员 · 500 GB 存储',
}
```

### 7. 改造页脚（多列 + 社交）

`footer.columns` 是链接分列，`footer.socials` 是社交图标，`footer.links` 是最底部法律链接：

```js
footer: {
  copyright: '© 2026 你的公司',
  tagline: '一句话介绍你的产品。',
  columns: [
    { title: '产品', links: [{ label: '价格', href: '#pricing' }, /* … */] },
    { title: '公司', links: [{ label: '关于我们', href: '#' }] },
  ],
  socials: [{ icon: '💬', label: '微信', href: '#' }],
  links: [{ label: '隐私政策', href: '#' }],
},
```

### 8. 给 CTA 加第二个按钮

配置 `cta.secondaryText` / `cta.secondaryLink` 即出现描边次按钮（如「预约演示」）；留空则不显示。

### 9. 导航操作按钮（登录 / 免费试用）

`navActions` 控制右上角的「登录」文字链接与「免费试用」实心按钮，可直接改文案与链接：

```js
navActions: {
  loginText: '登录',
  loginLink: '#login',     // 换成真实登录页地址
  trialText: '免费试用',
  trialLink: '#trial',     // 换成真实注册页地址
},
```

不需要时，把整个 `navActions` 块删掉即可，页面会自动只剩导航与主题切换按钮。

### 10. 主题一键切换（亮 / 暗）

主题切换已内置：页面右上角圆形按钮即时在亮色/暗色间切换，选择记入浏览器 localStorage，下次访问自动沿用。

- 想改变**默认主题**：改 `config.theme`。设为 `'auto'` 可跟随系统配色（`prefers-color-scheme: dark`）。
- 想改变**暗色配色本身**：改 `style.css` 中 `[data-theme='dark']` 下的变量（如 `--color-bg`、`--color-surface`、`--header-bg`）。
- 想换**切换按钮图标**：改 `main.js` 中 `renderHeader()` 里 `.theme-toggle__icon` 的初始文案（☀️ / 🌙）。

### 11. 双语（中 / 英）一键切换

语言切换已内置：页面右上角按钮（显示「EN」/「中」）即时在中英间切换，选择记入 localStorage，下次访问自动沿用。

**框架文案**（月付/年付/最受欢迎/功能/区块标题等）集中在 `config.js` 的 `i18n` 字典：

```js
i18n: {
  'zh-CN': { monthly: '按月付费', popular: '最受欢迎', featureCol: '功能', /* … */ },
  'en':    { monthly: 'Monthly',  popular: 'Most Popular', featureCol: 'Features', /* … */ },
},
```

**业务文案**（套餐名、描述、卖点、对比项、FAQ、页脚等）用「本地化对象」写法即可，例如：

```js
plans: [
  {
    id: 'pro',
    name: { 'zh-CN': '专业版', 'en': 'Pro' },
    price: 39, currency: '¥', period: { 'zh-CN': '/月', 'en': '/mo' },
    description: { 'zh-CN': '为独立开发者…', 'en': 'For solo developers…' },
    features: [
      { 'zh-CN': '5 名团队成员', 'en': '5 team members' },
      { 'zh-CN': '50 GB 文件存储', 'en': '50 GB file storage' },
    ],
    ctaText: { 'zh-CN': '立即升级', 'en': 'Upgrade now' },
    priceSuffix: '',
    // …其他字段
  },
  // …其余套餐
],
```

> **想加第三种语言？** 在 `i18n` 里加一份字典，并把需要翻译的字段写成 `{ 'zh-CN':…, 'en':…, 'ja':… }` 形式即可，`getLocalized()` 会自动识别。

### 12. 移动端汉堡菜单

汉堡菜单**无需任何配置**，< 640px 时顶部导航自动收起为 ☰ 图标，点击展开全宽下拉面板。

- 想改触发断点：在 `style.css` 的 `@media (max-width: 639px)` 块中调整（注意同步修改基础样式里 `.plan-card` 等断点）。
- 想换图标：改 `main.js` 中 `renderHeader()` 里 `.nav-toggle__icon` 的初始字符（如 `☰` → `≡`）。
- 下拉面板样式在 `style.css` 的 `.header.is-nav-open .nav` 中，可改背景、间距、链接高度等。

---

## 六、通过 CSS 变量换肤

打开 `css/style.css`，修改 `:root` 中的变量即可整体换色，无需改动任何具体规则：

```css
:root {
  --color-primary: #16a34a;   /* 把主色从蓝改为绿 */
  --color-bg: #fdf6f0;        /* 页面背景改为暖色 */
  --radius-card: 20px;         /* 加大卡片圆角 */
}
```

暗色模式变量已写在 `[data-theme='dark']` 选择器下，由右上角切换按钮通过给 `<html>` 设置 `data-theme="dark"` 启用；其中 `--header-bg` 控制页头半透明背景，按需调整即可。

---

## 七、部署到现有项目

- **静态托管**：直接把整个目录上传到任意静态服务器（Nginx、GitHub Pages、Vercel、对象存储等）即可，无需构建步骤。
- **嵌入现有站点**：将 `css/style.css`、两个 JS 文件复制进你的项目，把 `index.html` 中的骨架区块（`<header id="site-header">`、各 `#*-container` 等）粘到目标页面对应位置，并保留对 CSS 与 JS 的引用。
- **与其他框架共存**：`PRICING_DATA` 是全局变量，`main.js` 在 `DOMContentLoaded` 时渲染。若放入 React/Vue 等框架页面，注意避免与框架的 DOM 管理冲突（建议作为独立路由/独立页面引入）。

---

## 八、扩展预留说明

- `language` 与 `i18n`：已实现中英一键切换（见「常见修改」第 11 条），新增第三种语言只需在 `i18n` 加一份并在各字段补本地化对象即可。
- `theme`：已实现一键切换（见「常见修改」第 10 条），无需再改。
- 对比矩阵 `values` 采用字符串数组，可平滑扩展为对象（如 `{ supported: true, tip: '...' }`）以支持更丰富的单元格渲染。
- 卡片与表格均为数据驱动渲染，新增字段只需在 `config.js` 与 `main.js` 对应的渲染函数里少量扩展即可。

---

© 模板示例数据归演示项目所有，可自由替换为你自己的产品信息。
