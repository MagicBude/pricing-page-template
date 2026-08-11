# 通用 SaaS 价格对比页面模板

一套**纯前端、零外部依赖**的定价展示页面模板。所有内容由一份配置文件（`js/config.js`）驱动，你只需修改配置即可适配任意 SaaS 项目，无需改动结构代码。

---

## 一、特性

- **数据驱动**：页面文案、套餐、对比表、FAQ 全部来自 `config.js`，改数据即改页面。
- **零依赖**：纯 HTML + CSS + JS，不引入任何第三方库 / 框架 / CDN。
- **教科书级注释**：每个文件均带完整中文注释，适合初学者学习与二次开发。
- **移动优先响应式**：640px（平板）、1024px（桌面）两档断点，套餐卡片自动 1/2/4 列布局。
- **月付 / 年付切换**：一键切换计费方式，价格自动按折扣系数重算并展示「原价划线 + 节省提示」。
- **FAQ 手风琴**：平滑展开/收起，互斥折叠。
- **主题可换肤**：`style.css` 中集中管理 CSS 变量，改一处即可整体换色；暗色模式变量已预留。
- **扩展预留**：`config.js` 中含 `theme`、`language` 字段，方便后续做主题切换与多语言。

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
| `theme` | `string` | 主题模式预留（`light`/`dark`），当前未实现切换。 |
| `language` | `string` | 界面语言预留（`zh-CN` 等），方便后续多语言。 |
| `brand.name` | `string` | 品牌名称，显示在导航栏。 |
| `brand.logo` | `string` | Logo 占位：可填 Emoji（如 `☁️`）或文字（如 `CF`）。 |
| `nav` | `Array<{label, href}>` | 顶部导航菜单，顺序即展示顺序，`href` 指向区块 id。 |
| `billing.monthlyLabel` | `string` | 月付标签文案。 |
| `billing.yearlyLabel` | `string` | 年付标签文案。 |
| `billing.discountRate` | `number` | 年付折扣系数，`0.8` = 八折。折后价 = `price × discountRate`。 |
| `billing.savingText` | `string` | 年付时展示的「省 X%」提示。 |
| `plans` | `Array` | 套餐列表，见下表。 |
| `features.categories` | `Array` | 对比矩阵分组，每组含 `name` 与 `items`。 |
| `faqs` | `Array<{question, answer, defaultOpen}>` | 常见问题；`answer` 支持 HTML。 |
| `cta` | `{title, description, buttonText, buttonLink}` | 底部行动号召横幅。 |
| `footer.copyright` | `string` | 版权文案。 |
| `footer.links` | `Array<{label, href}>` | 页脚链接。 |

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

暗色模式变量已写在 `[data-theme='dark']` 选择器下。后续若要做切换按钮，只需在 `main.js` 中给 `<html>` 设置 `data-theme="dark"` 即可启用。

---

## 七、部署到现有项目

- **静态托管**：直接把整个目录上传到任意静态服务器（Nginx、GitHub Pages、Vercel、对象存储等）即可，无需构建步骤。
- **嵌入现有站点**：将 `css/style.css`、两个 JS 文件复制进你的项目，把 `index.html` 中的骨架区块（`<header id="site-header">`、各 `#*-container` 等）粘到目标页面对应位置，并保留对 CSS 与 JS 的引用。
- **与其他框架共存**：`PRICING_DATA` 是全局变量，`main.js` 在 `DOMContentLoaded` 时渲染。若放入 React/Vue 等框架页面，注意避免与框架的 DOM 管理冲突（建议作为独立路由/独立页面引入）。

---

## 八、扩展预留说明

- `theme` / `language`：当前仅占位，未实现切换 UI。后续可结合 `data-theme` 与多语言字典迭代。
- 对比矩阵 `values` 采用字符串数组，可平滑扩展为对象（如 `{ supported: true, tip: '...' }`）以支持更丰富的单元格渲染。
- 卡片与表格均为数据驱动渲染，新增字段只需在 `config.js` 与 `main.js` 对应的渲染函数里少量扩展即可。

---

© 模板示例数据归演示项目所有，可自由替换为你自己的产品信息。
