window.COURSES = [
  {
    number: 1,
    title: "商品资料怎样显示到页面上？",
    subtitle: "从一份数据，到一个接口，再到看得见的商品列表。",
    minutes: "12",
    objectives: ["用 React 显示一组商品", "认识 GET API 的职责", "用数据库保存与查询资料"],
    lessons: [
      {
        id: "FE-001", category: "frontend", name: "React 列表渲染", type: "UI Library 中的渲染技术", level: "Beginner",
        problem: "商品页面往往有几十张结构相同的卡片。如果逐个手写 HTML，增加商品时就要修改页面，还容易出现格式不一致。React 可以根据数组生成界面：每条商品资料对应一个列表项。资料与展示结构分开后，同一段组件代码就能显示不同数量的商品。",
        mechanism: ["把商品资料放进对象数组，每个对象具有稳定的 ID。", "用 map() 遍历数组，把每件商品转换成 JSX。", "React 使用 key 识别同级列表中的项目，资料变化后据此协调界面。"],
        code: `const products = [
  { id: 1, name: "Coffee" },
  { id: 2, name: "Tea" },
];

export default function App() {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          {product.name}
        </li>
      ))}
    </ul>
  );
}`,
        language: "jsx",
        explanation: "将组件放进已有 React 项目的 App.jsx。map() 决定显示哪些项目；key 用来识别项目，并不会自动显示在页面上。这里的资料来自本地数组，还没有发出网络请求。",
        usage: "适合商品卡片、订单记录、聊天消息等重复结构。两三个固定、结构不同的内容，不必强行放进数组。实际项目中，商品数组可以由父组件传入，或在请求接口后取得。",
        mistakes: ["把数组位置当作 key。列表插入、删除或排序后，组件状态可能跟错项目；应优先使用资料本身的稳定 ID。", "以为 key 可以代替页面内容。key 只给 React 使用，要显示 ID 仍需明确写在 JSX 中。"],
        takeaways: ["数组负责保存资料。", "map() 负责生成列表。", "key 应稳定且在同级项目中唯一。"],
        refs: [{ label: "React · Rendering Lists", url: "https://react.dev/learn/rendering-lists" }]
      },
      {
        id: "BE-001", category: "backend", name: "GET API 与路由", type: "HTTP 方法与 API 开发技术", level: "Beginner",
        problem: "商品资料不能永远写死在前端。价格更新、商品下架后，页面需要取得最新资料。GET API 提供读取资料的入口：前端请求 GET /products，后端返回商品 JSON。网页和手机 App 因而可以使用同一个接口。FastAPI 是帮助我们编写接口的 Web Framework。",
        mechanism: ["客户端向指定路径发出 GET 请求。", "FastAPI 根据 HTTP 方法和路径找到处理函数。", "函数读取资料并返回可序列化的数据，框架将其转换为 JSON 响应。"],
        code: `from fastapi import FastAPI

app = FastAPI()

products = [
    {"id": 1, "name": "Coffee", "price": 12},
    {"id": 2, "name": "Tea", "price": 8},
]

@app.get("/products")
def list_products():
    return {"items": products}`,
        language: "python",
        explanation: "使用 Python 3.10+，先运行 pip install \"fastapi[standard]\"。把代码存为 main.py，再运行 fastapi dev main.py。打开 http://127.0.0.1:8000/products 查看响应。@app.get() 将路径与处理函数连接起来。",
        usage: "适合读取商品、文章、订单状态。创建订单、扣款等操作应使用适当的写入接口，避免让 GET 执行这些动作。GET API 可以先用样本资料，再逐步接入真实存储。",
        mistakes: ["以为接口返回 JSON 就代表已查询数据库。本例的 products 只是内存数组，程序重启后会重新建立。", "用 GET 触发创建订单等写入动作，导致预取、重复访问等行为意外改变资料。"],
        takeaways: ["GET 用来读取资源。", "路由决定哪个函数处理请求。", "返回 JSON 不代表已读取数据库。"],
        refs: [{ label: "FastAPI · First Steps", url: "https://fastapi.tiangolo.com/tutorial/first-steps/" }]
      },
      {
        id: "DB-001", category: "database", name: "表、主键与基本查询", type: "关系型数据建模与 SQL", level: "Beginner",
        problem: "后端把商品放在内存数组里，重启后就无法保留运行期间的修改。数据库负责持久保存资料，并支持查询与约束。关系型数据库用表组织资料：每行是一件商品，每列是一个属性。主键用于唯一识别某行；商品名称可能重复，不适合直接当作身份。",
        mechanism: ["定义表结构和各字段的数据类型。", "插入商品资料，由数据库生成主键。", "通过 SELECT 选择字段，通过 ORDER BY 明确结果顺序。"],
        code: `CREATE TABLE products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0)
);

INSERT INTO products (name, price)
VALUES
  ('Coffee', 12),
  ('Tea', 8),
  ('Iced Coffee', 15),
  ('Cake', 10);

SELECT id, name, price
FROM products
ORDER BY id;`,
        language: "sql",
        explanation: "在已经准备好的 PostgreSQL 练习库执行一次。IDENTITY 自动生成 ID；NOT NULL 禁止空值；CHECK 拒绝负价格。numeric(10, 2) 代表最多 10 位有效数字、其中 2 位小数。后两天继续使用此表，不必再次创建。",
        usage: "适合商品、用户、订单等结构清晰的数据。临时计算结果不一定要落库，应根据持久保存和查询需求判断。ORDER BY 让读取顺序明确，不能依赖插入顺序。",
        mistakes: ["把所有资料检查交给前端。后台、脚本和其他接口也能写入，数据库仍要守住基本约束。", "反复执行 CREATE TABLE 导致表已存在错误；在独立练习库里按顺序执行，不要删除真实资料来重试。"],
        takeaways: ["表保存同一类资料。", "主键唯一识别每行。", "约束保护资料的基本有效性。"],
        refs: [{ label: "PostgreSQL · Creating a New Table", url: "https://www.postgresql.org/docs/current/tutorial-table.html" }, { label: "PostgreSQL · Sorting Rows", url: "https://www.postgresql.org/docs/current/queries-order.html" }]
      }
    ],
    flow: [
      { label: "01 / FRONTEND", title: "页面需要商品", detail: "用户进入商品列表，页面准备读取资料。", code: "打开商品列表" },
      { label: "02 / API", title: "接口接收请求", detail: "GET /products 把读取需求送到后端路由。", code: "GET /products" },
      { label: "03 / DATABASE", title: "数据库返回资料", detail: "正式接库后，后端通过 SQL 取得排序后的商品。", code: "SELECT id, name, price\nFROM products ORDER BY id;" },
      { label: "04 / RESULT", title: "React 显示列表", detail: "页面收到 JSON，用 map() 把每件商品变成列表项。", code: "items.map(product => <li>...</li>)" }
    ],
    summary: "前端负责展示，后端提供读取入口，数据库负责保存资料。这里的流程图解释正式应用的职责分工；三段课程代码分别演示概念，尚未联调，后端样例仍使用内存数据。",
    challenge: {
      duration: "15", task: "给 React 样例的每个商品增加 price，显示成 Coffee — RM12。",
      criteria: ["每件商品同时显示名称和价格。", "新增一个商品对象后，页面自动多出一行。", "无需复制 JSX，key 仍使用商品 ID。"],
      hint: "先修改数组中的对象，再在现有 li 里读取 product.price；不需要增加新的组件状态。",
      solution: `const products = [
  { id: 1, name: "Coffee", price: 12 },
  { id: 2, name: "Tea", price: 8 },
  { id: 3, name: "Cake", price: 10 },
];

// 用下面的表达式替换原列表内容：
products.map(product => (
  <li key={product.id}>
    {product.name} — RM{product.price}
  </li>
))`
    },
    preview: "明天：让用户输入关键词，找到想买的商品。"
  },
  {
    number: 2,
    title: "怎样实现商品搜索？",
    subtitle: "把一个搜索框，连接到清楚的筛选规则。",
    minutes: "13",
    objectives: ["理解输入值怎样驱动界面", "用参数表达搜索条件", "让数据库筛选符合条件的资料"],
    lessons: [
      {
        id: "FE-002", category: "frontend", name: "受控输入与列表筛选", type: "React 状态管理与交互模式", level: "Beginner",
        problem: "搜索框里的文字不断变化，页面需要知道当前关键词，才能显示符合条件的商品。受控输入让 React state 保存输入值：用户打字触发 onChange，更新 state，组件重新渲染，再计算符合条件的列表。输入内容与页面结果由同一份状态驱动。",
        mechanism: ["用 useState 保存当前输入文字。", "把 state 传给 input 的 value，在 onChange 中更新它。", "每次渲染根据关键词计算筛选结果，再用 map() 显示。"],
        code: `import { useState } from "react";

const products = [
  { id: 1, name: "Coffee" },
  { id: 2, name: "Tea" },
  { id: 3, name: "Iced Coffee" },
];

export default function App() {
  const [query, setQuery] = useState("");
  const keyword = query.trim().toLowerCase();
  const visible = products.filter(product =>
    product.name.toLowerCase().includes(keyword)
  );

  return (
    <>
      <label>
        搜索商品：
        <input value={query}
          onChange={event => setQuery(event.target.value)} />
      </label>
      <ul>
        {visible.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      {visible.length === 0 && <p>没有找到商品</p>}
    </>
  );
}`,
        language: "jsx",
        explanation: "在已有 React 项目中替换 App.jsx。query 是需要保存的状态；visible 能从 query 和 products 直接计算，不必另存一份 state，也不必为此增加 Effect。这里使用已加载数组，只演示本地搜索。",
        usage: "适合已经加载完成的小列表。资料量大，或前端没有完整资料时，应由后端搜索。清空关键词时 includes(\"\") 为真，样例自然恢复显示全部项目。",
        mistakes: ["以为前端筛选能搜索整张数据库表。它只能看到已经下载的资料。", "同时维护 query 和筛选结果两份状态，容易遗漏同步；可计算的值优先在渲染时推导。"],
        takeaways: ["state 保存输入值。", "筛选结果可以直接计算。", "前端搜索范围受已加载资料限制。"],
        refs: [{ label: "React · useState", url: "https://react.dev/reference/react/useState" }, { label: "React · You Might Not Need an Effect", url: "https://react.dev/learn/you-might-not-need-an-effect" }]
      },
      {
        id: "BE-002", category: "backend", name: "Query Parameters 与输入验证", type: "API 参数设计与验证技术", level: "Beginner",
        problem: "不同用户可能搜索不同关键词，不适合为每个关键词建立一条路由。Query Parameters 把筛选条件放在 URL 的问号后面，例如 /products?q=coffee。路径仍然表示商品集合，参数说明想从集合中找什么；后端也能给这些参数规定默认值和限制。",
        mechanism: ["客户端把关键词放入 q 查询参数。", "FastAPI 读取 q，检查是否符合声明的约束。", "处理函数规范化关键词，在样本资料中筛选，再返回结果。"],
        code: `from typing import Annotated
from fastapi import FastAPI, Query

app = FastAPI()
products = [
    {"id": 1, "name": "Coffee"},
    {"id": 2, "name": "Tea"},
    {"id": 3, "name": "Iced Coffee"},
]

@app.get("/products")
def list_products(
    q: Annotated[str, Query(max_length=50)] = "",
):
    keyword = q.strip().casefold()
    items = [product for product in products
             if keyword in product["name"].casefold()]
    return {"items": items}`,
        language: "python",
        explanation: "用此代码替换 main.py，启动方式与 Day 1 相同。访问 /products?q=coffee 会得到两种 Coffee；省略 q 则返回全部样本。max_length=50 限制字符串长度，超限时默认返回 422 验证错误。本例未连接数据库。",
        usage: "适合搜索、排序、分页等读取条件。密码、Token 等敏感信息不宜放进 URL，因为 URL 可能进入浏览记录与日志。验证查询参数只是入口检查，不能替代权限验证。",
        mistakes: ["只在前端验证输入。其他客户端能直接调用接口，后端必须独立验证。", "忘记为空参数规定行为，让客户端不知道省略关键词时会得到什么。"],
        takeaways: ["参数表达查询条件。", "默认值决定省略参数时的行为。", "后端验证不能依赖前端。"],
        refs: [{ label: "FastAPI · Query Parameters", url: "https://fastapi.tiangolo.com/tutorial/query-params/" }, { label: "FastAPI · String Validations", url: "https://fastapi.tiangolo.com/tutorial/query-params-str-validations/" }]
      },
      {
        id: "DB-002", category: "database", name: "WHERE 与 ILIKE 搜索", type: "SQL 查询技术", level: "Beginner",
        problem: "如果每次搜索都把整张商品表读进后端，再用 Python 筛选，会传输和处理很多不需要的资料。WHERE 让数据库按条件选择行。PostgreSQL 的 ILIKE 提供按当前区域设置进行的大小写不敏感模式匹配，适合演示基础商品名称搜索。",
        mechanism: ["FROM 指定要读取的商品表。", "WHERE 仅保留匹配名称模式且满足价格条件的行。", "SELECT 返回所需字段，ORDER BY 明确排列顺序。"],
        code: `-- 沿用 Day 1 的 products 表
SELECT id, name, price
FROM products
WHERE name ILIKE '%coffee%'
ORDER BY id;

-- 组合名称与价格条件
SELECT id, name, price
FROM products
WHERE name ILIKE '%coffee%'
  AND price <= 12
ORDER BY id;`,
        language: "sql",
        explanation: "% 表示任意长度的字符，因此 %coffee% 可以匹配 Coffee 和 Iced Coffee。第二条查询增加 AND price <= 12，只留下价格符合条件的商品。这两条 SQL 用固定练习值演示，不是程序中拼接用户输入的方式。",
        usage: "适合简单名称查询。相关性排名、纠错和大规模文本搜索需要另外评估全文搜索等方案；ILIKE 不等于完整搜索引擎。前端本地筛选与数据库搜索也不保证所有语言环境下的匹配规则完全相同。",
        mistakes: ["把用户输入直接拼接进 SQL。接入程序时应使用数据库驱动的参数绑定。", "% 和 _ 是模式字符；如果要搜索它们本身，需要按所用驱动和查询规则处理转义。"],
        takeaways: ["WHERE 决定哪些行符合条件。", "%coffee% 表示包含该模式。", "用户输入应通过参数绑定传入。"],
        refs: [{ label: "PostgreSQL · Pattern Matching", url: "https://www.postgresql.org/docs/current/functions-matching.html" }]
      }
    ],
    flow: [
      { label: "01 / FRONTEND", title: "输入关键词", detail: "输入框的 state 保存 coffee，页面形成搜索条件。", code: "query = 'coffee'" },
      { label: "02 / API", title: "验证查询参数", detail: "后端检查参数长度等约束，再组织查询。", code: "GET /products?q=coffee" },
      { label: "03 / DATABASE", title: "筛选匹配商品", detail: "正式接库时使用参数绑定，将名称模式作为数据传入。", code: "WHERE name ILIKE %(pattern)s\n-- pattern 的值：%coffee%" },
      { label: "04 / RESULT", title: "显示搜索结果", detail: "页面显示 Coffee 和 Iced Coffee，找不到时显示空结果提示。", code: "Coffee · Iced Coffee" }
    ],
    summary: "已经加载的小列表可以在前端直接筛选；搜索整个商品库则需经过接口与数据库。两者服务于不同资料范围。流程图展示正式接库方案，课程后端代码仍使用内存筛选，没有执行图中的 SQL。",
    challenge: {
      duration: "15", task: "给今天的后端样例增加商品价格和可选参数 max_price，让关键词与价格条件一起生效。",
      criteria: ["/products?q=coffee&max_price=12 只返回价格合适的 Coffee。", "省略 max_price 时不按价格排除商品。", "负价格参数会被后端拒绝。"],
      hint: "用 Annotated[int | None, Query(ge=0)] = None 声明可选上限；筛选时先检查它是否为 None，再比较商品价格。",
      solution: `from typing import Annotated
from fastapi import FastAPI, Query

app = FastAPI()
products = [
    {"id": 1, "name": "Coffee", "price": 12},
    {"id": 2, "name": "Tea", "price": 8},
    {"id": 3, "name": "Iced Coffee", "price": 15},
]

@app.get("/products")
def list_products(
    q: Annotated[str, Query(max_length=50)] = "",
    max_price: Annotated[int | None, Query(ge=0)] = None,
):
    keyword = q.strip().casefold()
    items = [p for p in products
             if keyword in p["name"].casefold()
             and (max_price is None or p["price"] <= max_price)]
    return {"items": items}`
    },
    preview: "明天：商品变多后，怎样每次只显示一部分？"
  },
  {
    number: 3,
    title: "为什么商品列表需要分页？",
    subtitle: "点一下下一页，看懂前端、API 与数据库怎样配合。",
    minutes: "14",
    objectives: ["让页码驱动当前显示内容", "设计有边界的分页接口", "理解 OFFSET 的计算与限制"],
    lessons: [
      {
        id: "FE-003", category: "frontend", name: "Pagination 分页交互", type: "UI 交互模式", level: "Beginner",
        problem: "一次显示大量商品，会让页面难以浏览。分页把列表分成多个部分，让用户明确知道当前位置，并能返回上一页。前端通常保存当前页码，再根据页码决定显示哪部分资料；按钮还需处理边界，避免出现第零页或超过最后一页。",
        mechanism: ["保存当前页码 page，并确定每页数量 pageSize。", "计算 start = (page - 1) × pageSize，取得当前页的数组片段。", "根据当前页与最后一页禁用边界按钮，点击时更新 page。"],
        code: `import { useState } from "react";

const products = ["Coffee", "Tea", "Iced Coffee", "Cake"];
const pageSize = 2;

export default function App() {
  const [page, setPage] = useState(1);
  const lastPage = Math.ceil(products.length / pageSize);
  const start = (page - 1) * pageSize;
  const visible = products.slice(start, start + pageSize);

  return (
    <>
      <p>{visible.join(" / ")}</p>
      <button disabled={page === 1}
        onClick={() => setPage(previous => previous - 1)}>
        上一页
      </button>
      <span> 第 {page} / {lastPage} 页 </span>
      <button disabled={page === lastPage}
        onClick={() => setPage(previous => previous + 1)}>
        下一页
      </button>
    </>
  );
}`,
        language: "jsx",
        explanation: "将组件放进已有 React 项目的 App.jsx。第一页起点是 0，第二页起点是 2。slice() 取得对应部分，不修改原数组。样例资料固定且非空；实际应用还要单独处理空列表以及筛选后当前页越界。",
        usage: "适合商品目录、后台表格等需要定位和返回的场景。连续浏览的内容流也可考虑 Infinite Scrolling。这里演示已加载资料的前端分页；大列表应配合后端分页，减少实际传输量。",
        mistakes: ["把 page 直接当成数组下标。页码从 1 开始，数组位置从 0 开始，必须计算起点。", "认为前端切片就减少了网络数据量。本例早已取得完整数组，接口分页才会改变每次下载量。"],
        takeaways: ["页码与数组起点不同。", "按钮需要处理边界。", "前端分页不自动减少网络资料量。"],
        refs: [{ label: "React · useState", url: "https://react.dev/reference/react/useState" }]
      },
      {
        id: "BE-003", category: "backend", name: "分页 API 与数量上限", type: "API 设计与输入验证技术", level: "Beginner",
        problem: "如果 /products 一次返回几十万条资料，响应体会很大，也会增加服务端与客户端负担。分页 API 让客户端指定第几页、每页多少条。后端负责验证参数、限制每页数量，并返回解释结果所需的元数据，而不是无条件接受客户端要求。",
        mechanism: ["验证 page 至少为 1，page_size 落在规定范围内。", "用页码和每页数量计算起点，按照明确顺序取得一页。", "返回 items、page、page_size 和 total，供前端显示页码及边界。"],
        code: `from typing import Annotated
from fastapi import FastAPI, Query

app = FastAPI()
products = [
    {"id": 1, "name": "Coffee"},
    {"id": 2, "name": "Tea"},
    {"id": 3, "name": "Iced Coffee"},
    {"id": 4, "name": "Cake"},
]

@app.get("/products")
def list_products(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 2,
):
    start = (page - 1) * page_size
    ordered = sorted(products, key=lambda item: item["id"])
    return {
        "items": ordered[start:start + page_size],
        "page": page,
        "page_size": page_size,
        "total": len(ordered),
    }`,
        language: "python",
        explanation: "替换 main.py，启动方式与 Day 1 相同。请求 /products?page=2&page_size=2 会返回 Iced Coffee 和 Cake。ge=1 禁止零和负数；le=100 限制单页数量。越过最后一页时，这个接口返回空数组。",
        usage: "适合需要跳页的列表。实时更新的数据流可评估游标分页；是否返回精确总数也应考虑查询成本。正式接入数据库后，要在数据库查询时分页，不应先读出全表再切片。本例仅演示接口约定。",
        mistakes: ["客户端要求多少条就返回多少条，没有服务端上限。", "搜索与分页组合时先分页再筛选，导致漏掉后面页面的匹配资料；应先筛选，再统计和分页。"],
        takeaways: ["分页参数必须验证。", "每页数量应有上限。", "响应要让前端知道分页状态。"],
        refs: [{ label: "FastAPI · Numeric Validations", url: "https://fastapi.tiangolo.com/tutorial/path-params-numeric-validations/" }]
      },
      {
        id: "DB-003", category: "database", name: "LIMIT、OFFSET 与稳定排序", type: "SQL 分页技术", level: "Beginner",
        problem: "后端只需要一页资料时，数据库也应只返回对应结果。LIMIT 控制最多返回多少行，OFFSET 指定跳过多少行。后端将页码转换成偏移量，再通过参数绑定执行查询。明确排序很重要，否则不同请求取得的结果顺序没有可靠约定。",
        mechanism: ["根据请求计算 offset = (page - 1) × page_size。", "用 ORDER BY 建立明确的排序；本例使用唯一的 id。", "跳过 OFFSET 指定的行，最多返回 LIMIT 指定的数量。"],
        code: `-- 沿用 Day 1 的表：每页两条，查询第二页
SELECT id, name, price
FROM products
ORDER BY id
LIMIT 2 OFFSET 2;

-- 如果按价格排序，用 id 处理价格相同的情况
SELECT id, name, price
FROM products
ORDER BY price, id
LIMIT 2 OFFSET 0;`,
        language: "sql",
        explanation: "每页两条时，第 1 页跳过 0 条，第 2 页跳过 2 条，第 3 页跳过 4 条。ORDER BY price, id 先按价格，再按唯一 ID 排序，避免相同价格的项目顺序不确定。程序中使用驱动参数绑定传入 limit 与 offset。",
        usage: "适合实现简单、需要页码导航的查询。较大的 OFFSET 仍需要处理被跳过的行，深页查询可能变慢。指定唯一排序也不保证跨请求的资料快照不变：翻页期间新增或删除资料，结果位置仍可能移动。",
        mistakes: ["只写 LIMIT，不写明确排序，误以为资料会一直按插入顺序返回。", "认为 OFFSET 能对任意深页都保持同样性能；资料量大时需实际测量并评估 Keyset Pagination。"],
        takeaways: ["LIMIT 限制结果数量。", "OFFSET 表示跳过数量。", "明确排序不能消除资料变化的影响。"],
        refs: [{ label: "PostgreSQL · LIMIT and OFFSET", url: "https://www.postgresql.org/docs/current/queries-limit.html" }]
      }
    ],
    flow: [
      { label: "01 / FRONTEND", title: "点击第 2 页", detail: "页码改变，页面准备请求每页两条的第二页资料。", code: "page = 2 · pageSize = 2" },
      { label: "02 / API", title: "计算查询范围", detail: "接口验证参数，并把页码转换成偏移量。", code: "GET /products?page=2&page_size=2\noffset = (2 - 1) × 2 = 2" },
      { label: "03 / DATABASE", title: "取出对应记录", detail: "排序后跳过两条，最多返回两条。", code: "ORDER BY id\nLIMIT 2 OFFSET 2" },
      { label: "04 / RESULT", title: "显示当前页", detail: "页面更新列表和按钮边界，显示 Iced Coffee、Cake。", code: "第 2 / 2 页 · 2 条商品" }
    ],
    summary: "前端负责交互，后端负责参数与规则，数据库负责排序和取数。互动演示用浏览器内的样本资料模拟这条链路，不会真的访问 API 或执行 SQL；课程中的后端和数据库样例也还未联调。",
    challenge: {
      duration: "20", task: "组合 Day 2 的搜索与 Day 3 的后端分页：搜索 Coffee，每页一条。",
      criteria: ["第一页返回 Coffee，第二页返回 Iced Coffee。", "total 是搜索结果总数，而不是全部商品数。", "顺序是先筛选，再排序、统计和分页。"],
      hint: "先建立 filtered 数组；total 使用 len(filtered)。不要在 products 切片之后才进行名称匹配。",
      solution: `# 沿用 Day 3 的 app、products 和导入，替换路由函数
@app.get("/products")
def list_products(
    q: Annotated[str, Query(max_length=50)] = "",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 1,
):
    keyword = q.strip().casefold()
    filtered = [p for p in products
                if keyword in p["name"].casefold()]
    ordered = sorted(filtered, key=lambda p: p["id"])
    start = (page - 1) * page_size
    return {
        "items": ordered[start:start + page_size],
        "page": page,
        "page_size": page_size,
        "total": len(ordered),
    }`
    },
    preview: "下一课：数据库索引——为什么有些查询很快，有些需要逐行检查？"
  }
];
