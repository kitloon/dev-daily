window.COURSES.push(...[
  {
    "number": 4,
    "title": "同一张商品卡片，怎样重复使用？",
    "subtitle": "把展示拆成组件，用商品 ID 连接详情与数据库。",
    "minutes": "12",
    "objectives": [
      "组件拆分与 Props",
      "Path Parameters 与 404",
      "B-tree 与主键索引"
    ],
    "lessons": [
      {
        "id": "FE-004",
        "category": "frontend",
        "name": "组件拆分与 Props",
        "type": "React 组件组合",
        "level": "Beginner",
        "teaser": "列表和推荐区都需要商品卡片。",
        "problem": "列表和推荐区都需要商品卡片。复制 JSX 会让一次改价格式变成多处修改，组件让这一份展示规则可以复用。",
        "mechanism": [
          "从重复结构提取 ProductCard。",
          "父组件传入 product 对象。",
          "卡片只读取 Props，不直接改写商品。"
        ],
        "code": "function ProductCard({ product }) {\n  return <article><h2>{product.name}</h2>\n    <p>RM {product.price.toFixed(2)}</p></article>;\n}\nexport default function Products({ items }) {\n  return items.map(p => <ProductCard key={p.id} product={p} />);\n}",
        "language": "jsx",
        "explanation": "在已有 React 项目中把这段放进商品页面，items 是父层已经取得的数组，price 在本例中是数字。组件拆分先看是否有清楚的职责与重复结构，不必把每一个标签都变成文件。ProductCard 的 Props 是它与调用者的接口：父层决定传哪件商品，卡片决定怎么显示。Props 在一次渲染中是只读快照，价格变化时应由拥有资料的父层传入新对象，再由 React 更新输出。不要在卡片里偷偷修改 product.price，否则父层不知道状态已改变，其他区域也可能显示旧值。key 放在 map 直接产生的组件上，且不会成为普通 Prop；需要 ID 时仍从 product.id 读取。",
        "usage": "适合列表、推荐区和收藏页共享同一种展示；交互差异很大时应拆出明确的小组件。",
        "mistakes": [
          "在子组件修改 Props，破坏资料流。",
          "把 key 写到 ProductCard 内部的 article，列表层仍缺少稳定 key。"
        ],
        "takeaways": [
          "组件封装展示职责",
          "Props 由父层传入",
          "更新资料要交给拥有者"
        ],
        "refs": [
          {
            "label": "组件拆分与 Props · 官方文档",
            "url": "https://react.dev/learn/passing-props-to-a-component"
          }
        ],
        "conceptId": "component-props"
      },
      {
        "id": "BE-004",
        "category": "backend",
        "name": "Path Parameters 与 404",
        "type": "FastAPI 路由与 HTTP 语义",
        "level": "Beginner",
        "teaser": "点击某张卡片后，后端要知道请求的是哪一件商品。",
        "problem": "点击某张卡片后，后端要知道请求的是哪一件商品。路径参数表达资源身份，查不到时应明确返回 404。",
        "mechanism": [
          "路径占位符捕获 product_id。",
          "整数注解验证输入格式。",
          "查找失败抛出 HTTPException。"
        ],
        "code": "from fastapi import FastAPI, HTTPException\napp = FastAPI()\nproducts = {1: {\"id\": 1, \"name\": \"Coffee\"}}\n@app.get(\"/products/{product_id}\")\ndef detail(product_id: int):\n    item = products.get(product_id)\n    if item is None:\n        raise HTTPException(404, \"Product not found\")\n    return item",
        "language": "python",
        "explanation": "这段是可放入 main.py 的内存示例，需先准备 FastAPI 环境；尚未读取数据库。/products/1 的 1 是某个资源的身份，和 /products?q=coffee 这种筛选集合的查询参数不同。FastAPI 根据 int 注解解析路径，/products/abc 会在进入函数前产生验证错误，合法整数 9 却可能因为没有对应资料而得到 404。这两种失败说明的问题不同，前端不能都解释成网络故障。抛出 HTTPException 会结束当前处理，不需要再返回一个错误对象。若未来接数据库，应先按 ID 查询，再在结果为空时保留同样的错误约定。路径顺序也要留意：固定的 /products/popular 应在宽泛参数路由之前定义。",
        "usage": "适合商品、订单和文章详情。ID 的格式验证不能取代之后的权限检查。",
        "mistakes": [
          "查不到却返回 200 和空对象，使调用者无法区分失败。",
          "以为路径是整数就保证资料存在。"
        ],
        "takeaways": [
          "路径表达资源身份",
          "格式错误不同于不存在",
          "404 需要真实查找结果"
        ],
        "refs": [
          {
            "label": "Path Parameters 与 404 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/path-params/"
          }
        ],
        "conceptId": "path-id-not-found"
      },
      {
        "id": "DB-004",
        "category": "database",
        "name": "B-tree 与主键索引",
        "type": "PostgreSQL 索引结构",
        "level": "Beginner",
        "teaser": "商品表变大后，按 ID 找一行不应该总是逐行检查。",
        "problem": "商品表变大后，按 ID 找一行不应该总是逐行检查。索引保存可快速定位的键与行位置，同时也有写入成本。",
        "mechanism": [
          "PRIMARY KEY 自动建立唯一 B-tree 索引。",
          "相等或范围条件可利用有序键。",
          "规划器根据成本选择索引扫描或顺序扫描。"
        ],
        "code": "-- 已有 products(id PRIMARY KEY, name, price)\nSELECT id, name, price\nFROM products WHERE id = 42;\n\n-- 查看主键已建立的索引，避免重复创建\nSELECT indexname, indexdef FROM pg_indexes\nWHERE schemaname = 'public' AND tablename = 'products';",
        "language": "sql",
        "explanation": "在 PostgreSQL 练习表上阅读这条查询；ID 为 42 的资料未必存在。B-tree 可理解为分层的有序路标，查找时逐层缩小范围，而不是把整个索引当成普通数组遍历。PRIMARY KEY 约束不仅禁止重复和空值，也自动建立支持该约束的唯一索引，因此通常不必再为 id 创建第二个相同索引。索引没有承诺每条查询都会使用它：小表、返回大部分行或统计信息不同，都可能让顺序扫描成本更低。索引还占空间，新增和改动键值时必须维护。这里不展示假造的毫秒比较；可以先确认已有索引，再在后续课程通过 EXPLAIN 认识实际计划。",
        "usage": "适合选择性较高的 ID 查询及有序范围读取；索引应依据查询模式建立。",
        "mistakes": [
          "给主键重复建同样的索引，增加维护成本。",
          "认为有索引就一定更快或一定被采用。"
        ],
        "takeaways": [
          "主键通常已有索引",
          "B-tree 支持有序查找",
          "规划器比较执行成本"
        ],
        "refs": [
          {
            "label": "B-tree 与主键索引 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/indexes-types.html"
          }
        ],
        "conceptId": "btree-primary-key"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "提取卡片",
        "detail": "父层把同一份商品资料交给可复用展示组件。",
        "code": "<ProductCard product={item} />"
      },
      {
        "label": "02",
        "title": "选择资源",
        "detail": "详情路由读取路径中的 ID，验证它是整数。",
        "code": "GET /products/42"
      },
      {
        "label": "03",
        "title": "按主键查找",
        "detail": "数据库可通过主键索引定位，是否采用由规划器决定。",
        "code": "WHERE id = 42"
      },
      {
        "label": "04",
        "title": "处理不存在",
        "detail": "查不到返回 404，页面显示找不到商品。",
        "code": "item is None → 404"
      }
    ],
    "summary": "组件组织展示，路径参数标识资源，主键索引支持数据库定位。这三种身份要指向同一件商品。",
    "challenge": {
      "duration": "15",
      "task": "用本地 Coffee/Tea 两条资料拆出 ProductCard，并写出 ID 2 与 ID 99 的详情响应。",
      "criteria": [
        "卡片通过 Props 接收商品",
        "ID 2 返回 Tea",
        "ID 99 返回 404"
      ],
      "hint": "先把卡片写成只读函数；详情查找不要用数组位置当 ID。",
      "solution": "const ProductCard = ({product}) => <h2>{product.name}</h2>;\n// GET /products/2 → 200 {id:2,name:\"Tea\"}\n// GET /products/99 → 404 {detail:\"Product not found\"}"
    },
    "preview": "明天把用户填写的资料变成经过验证的请求体。"
  },
  {
    "number": 5,
    "title": "表单内容，怎样成为可靠的商品资料？",
    "subtitle": "前端提示帮助填写，后端验证与数据库类型共同守住边界。",
    "minutes": "12",
    "objectives": [
      "表单提交与错误提示",
      "Pydantic 请求体",
      "金额、文本与整数"
    ],
    "lessons": [
      {
        "id": "FE-005",
        "category": "frontend",
        "name": "表单提交与错误提示",
        "type": "React 事件与表单交互",
        "level": "Beginner",
        "teaser": "新增商品时，空名称和负价格应尽早提示。",
        "problem": "新增商品时，空名称和负价格应尽早提示。浏览器提示帮助用户，但不能成为后端唯一的验证。",
        "mechanism": [
          "输入值由 State 控制。",
          "提交时阻止默认页面刷新。",
          "校验失败保留输入并展示文字错误。"
        ],
        "code": "import { useState } from \"react\";\nexport default function Form() {\n const [name, setName] = useState(\"\");\n const [error, setError] = useState(\"\");\n function submit(e) {\n  e.preventDefault();\n  setError(name.trim() ? \"\" : \"请输入商品名称\");\n }\n return <form onSubmit={submit}>\n  <label>名称<input value={name} onChange={e=>setName(e.target.value)}/></label>\n  <p role=\"alert\">{error}</p><button>检查</button>\n </form>;\n}",
        "language": "jsx",
        "explanation": "代码放进已有 React 页面，用一个名称字段演示提交周期；价格字段可以按同样模式加入，但应保存原始字符串，避免用户输入到一半时被数值转换打断。onSubmit 挂在 form 上，让按 Enter 和点击按钮走同一条验证路径。preventDefault 阻止浏览器默认导航，不代表已经向服务器保存。先 trim 再检查，可以拒绝全部为空格的名称；显示错误时保留输入，用户只需修正问题。role=\"alert\" 提示辅助技术关注错误，也应让错误文字靠近对应字段。正式保存仍需处理后端返回的字段错误，因为请求能绕过浏览器。成功前不要清空表单，否则网络失败会让用户重新输入整份资料。",
        "usage": "适合基础新增表单；多字段时用字段级错误对象，避免一个笼统提示遮蔽具体问题。",
        "mistakes": [
          "只处理按钮 onClick，按 Enter 绕过逻辑。",
          "失败就清空输入，增加纠错成本。"
        ],
        "takeaways": [
          "提交入口使用 onSubmit",
          "失败保留用户输入",
          "客户端校验改善体验"
        ],
        "refs": [
          {
            "label": "表单提交与错误提示 · 官方文档",
            "url": "https://react.dev/reference/react-dom/components/form"
          }
        ],
        "conceptId": "form-submit-errors"
      },
      {
        "id": "BE-005",
        "category": "backend",
        "name": "Pydantic 请求体",
        "type": "Python 数据验证模型",
        "level": "Beginner",
        "teaser": "前端可以被绕过。",
        "problem": "前端可以被绕过。后端要在业务逻辑执行前验证 JSON 字段，拒绝不符合约定的商品资料。",
        "mechanism": [
          "用 BaseModel 声明字段。",
          "用 Field 限定长度、范围和精度。",
          "FastAPI 解析请求体后才调用函数。"
        ],
        "code": "from decimal import Decimal\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel, Field\napp = FastAPI()\nclass ProductIn(BaseModel):\n    name: str = Field(min_length=1, max_length=80)\n    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)\n@app.post(\"/products/validate\")\ndef validate_product(body: ProductIn):\n    return body",
        "language": "python",
        "explanation": "这是 Pydantic 2 与 FastAPI 的上下文片段，Decimal 来自 Python 标准库。请求体模型把字段规则集中到一个地方，让运行时检查与接口文档共享定义。price 采用 Decimal，避免把钱的十进制规则隐含为二进制浮点计算；客户端最好传 \"12.50\" 这样的字符串，响应的十进制表示也要在契约中说清楚。Field 的最小长度不会自动去掉空格，因此 name=\"   \" 仍可能通过，业务若要求实际名称需额外规范化。Pydantic 默认可能进行合理类型转换，严格类型需求应明确配置而非猜测。通过模型只证明结构和约束合格，不证明商品真实存在，也不证明调用者有新增权限；这些检查仍属于后端业务。",
        "usage": "适合新增和编辑输入的共享契约。数据库约束仍要独立存在，防止其他写入路径破坏资料。",
        "mistakes": [
          "把结构验证当成权限验证。",
          "以为 min_length=1 会拒绝全空格名称。"
        ],
        "takeaways": [
          "模型描述请求契约",
          "金额精度要明确",
          "验证成功不等于业务合法"
        ],
        "refs": [
          {
            "label": "Pydantic 请求体 · 官方文档",
            "url": "https://docs.pydantic.dev/latest/concepts/fields/"
          }
        ],
        "conceptId": "pydantic-body-model"
      },
      {
        "id": "DB-005",
        "category": "database",
        "name": "金额、文本与整数",
        "type": "PostgreSQL 字段类型",
        "level": "Beginner",
        "teaser": "同样写着 12.50，价格、库存和名称需要不同的数据规则。",
        "problem": "同样写着 12.50，价格、库存和名称需要不同的数据规则。选对类型可避免后续排序与计算出错。",
        "mechanism": [
          "金额使用精确 numeric。",
          "数量使用整数与非负约束。",
          "文本通过 NOT NULL 和长度规则约束。"
        ],
        "code": "CREATE TABLE product_drafts (\n id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),\n price numeric(10,2) NOT NULL CHECK (price >= 0),\n stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0)\n);",
        "language": "sql",
        "explanation": "在独立 PostgreSQL 练习库阅读或创建 product_drafts，不要覆盖已有业务表。numeric(10,2) 最多允许十位十进制数字，其中两位位于小数点后，适合这里的商品金额。它会按声明的小数位处理输入，因此若产品要求拒绝过多小数，应在入口额外检查，而不是假定数据库一定报错。库存是可数件数，integer 能表达没有小数的数量，再通过 CHECK 排除负数。text 不是毫无限制：本例明确要求去掉两端空格后长度为一到八十。NOT NULL 排除缺失值，但不会排除空字符串。类型和约束是持久层共同规则，不负责展示币种、千位分隔或本地化价格格式，这些属于应用输出。",
        "usage": "适合金额和库存的基础建模；涉及多币种时另存币种字段并定义不同精度规则。",
        "mistakes": [
          "用浮点类型存需要精确比较的金额。",
          "把 NOT NULL 误解为禁止空字符串。"
        ],
        "takeaways": [
          "类型影响计算语义",
          "非空和非空白不同",
          "显示格式不等于存储类型"
        ],
        "refs": [
          {
            "label": "金额、文本与整数 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/datatype-numeric.html"
          }
        ],
        "conceptId": "column-money-text-integer"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "收集输入",
        "detail": "表单暂存字符串，不急着把每次输入写进数据库。",
        "code": "name=\"Coffee\", price=\"12.50\""
      },
      {
        "label": "02",
        "title": "提交检查",
        "detail": "客户端显示字段错误，服务端再次验证请求模型。",
        "code": "ProductIn(name, price)"
      },
      {
        "label": "03",
        "title": "选择存储类型",
        "detail": "金额使用 numeric，库存使用 integer。",
        "code": "price numeric(10,2)"
      },
      {
        "label": "04",
        "title": "保留纠错机会",
        "detail": "验证失败返回字段问题，表单保留用户输入。",
        "code": "422 → 修改 price"
      }
    ],
    "summary": "前端提示用于纠错，后端模型用于请求契约，数据库类型与约束用于持久资料。三层可以共享规则，但职责不同。",
    "challenge": {
      "duration": "15",
      "task": "为名称、价格、库存写出三条有效输入与三条无效输入，补全一个本地表单的提交检查。",
      "criteria": [
        "空白名称得到提示",
        "负价格和小数库存被拒绝",
        "失败后输入仍保留"
      ],
      "hint": "库存用 Number.isInteger 检查；不要把空字符串 Number 后当成零。",
      "solution": "const valid = name.trim().length > 0 && price !== \"\" &&\n Number(price) >= 0 && stock !== \"\" &&\n Number.isInteger(Number(stock)) && Number(stock) >= 0;"
    },
    "preview": "明天用服务器返回的商品建立列表的新状态。"
  },
  {
    "number": 6,
    "title": "创建成功后，列表怎样立即显示新商品？",
    "subtitle": "从 POST 的响应取得真实 ID，再不可变地更新页面。",
    "minutes": "12",
    "objectives": [
      "数组 State 的不可变更新",
      "POST 与 201 Created",
      "INSERT RETURNING 与默认值"
    ],
    "lessons": [
      {
        "id": "FE-006",
        "category": "frontend",
        "name": "数组 State 的不可变更新",
        "type": "React 状态更新",
        "level": "Beginner",
        "teaser": "点击新增后直接 push 到原数组，页面可能没有按预期重绘。",
        "problem": "点击新增后直接 push 到原数组，页面可能没有按预期重绘。State 需要用新数组表达变化。",
        "mechanism": [
          "等待后端返回完整 created 对象。",
          "使用函数式更新读取最新列表。",
          "通过展开运算构造新数组。"
        ],
        "code": "import { useState } from \"react\";\nexport default function Demo() {\n const [items, setItems] = useState([{id:1,name:\"Coffee\"}]);\n function append(created) {\n  setItems(previous => [...previous, created]);\n }\n return <><button onClick={()=>append({id:2,name:\"Tea\"})}>演示一次新增</button>\n {items.map(p=><p key={p.id}>{p.name}</p>)}</>;\n}",
        "language": "jsx",
        "explanation": "这段是本地一次新增演示，重复按按钮会产生重复 ID，正式接口应提供每个新资源的唯一 ID，并在等待期间防止重复提交。关键不在展开语法本身，而在保持旧状态不变：React 可以据新引用安排更新，旧渲染仍拥有自己的快照。setItems(previous => ...) 的函数式形式会接到 React 应用该更新时的前一个列表，因此多次排队的更新不会因为闭包里的旧 items 而互相覆盖。服务端返回的 created 通常还含有默认字段、正式 ID 和规范化后的值，应优先使用它，而非自己猜测下一个 ID。若列表本来有筛选或排序，简单追加未必属于当前视图；此时按条件重新计算，或在未来交给查询缓存刷新。",
        "usage": "适合本地数组状态或规模较小的创建列表；远程分页列表需要考虑筛选和总数量。",
        "mistakes": [
          "items.push 后继续传原引用。",
          "用 items.length + 1 猜服务端 ID。"
        ],
        "takeaways": [
          "不要修改旧数组",
          "函数式更新避免旧快照",
          "采用服务器生成的身份"
        ],
        "refs": [
          {
            "label": "数组 State 的不可变更新 · 官方文档",
            "url": "https://react.dev/learn/updating-arrays-in-state"
          }
        ],
        "conceptId": "immutable-array-create"
      },
      {
        "id": "BE-006",
        "category": "backend",
        "name": "POST 与 201 Created",
        "type": "HTTP 资源创建",
        "level": "Beginner",
        "teaser": "创建商品既要保存资料，也要告诉调用者新资源的身份。",
        "problem": "创建商品既要保存资料，也要告诉调用者新资源的身份。200、201 和返回的内容应与实际动作一致。",
        "mechanism": [
          "POST 接收新增请求。",
          "创建完成后返回正式资源。",
          "以 201 表达创建成功并提供 Location。"
        ],
        "code": "from fastapi import FastAPI, Response\nfrom pydantic import BaseModel\napp = FastAPI()\nclass ProductIn(BaseModel):\n    name: str\nstore = {}\n@app.post(\"/products\", status_code=201)\ndef create(body: ProductIn, response: Response):\n    product_id = max(store, default=0) + 1\n    item = {\"id\": product_id, **body.model_dump()}\n    store[product_id] = item\n    response.headers[\"Location\"] = f\"/products/{product_id}\"\n    return item",
        "language": "python",
        "explanation": "示例使用内存字典演示响应语义，单进程 ID 算法只适合课堂，不适合并发与多个 worker；正式项目交给数据库生成身份。路由声明 status_code=201 后，FastAPI 会以创建状态返回 JSON。Location 告诉客户端新资源的地址，列表则可从响应体取得完整对象立即显示。只有保存步骤成功才可以发送创建成功响应；如果只是把任务排队且资源尚未完成，应另定义接受处理的语义。POST 默认不保证幂等，客户端超时再试可能创建两件商品，禁用按钮只能减少误点，不能解决网络重试。以后会学习 Idempotency Key。这里没有发出真实请求，练习重点是区分请求数据、新资源与成功响应之间的关系。",
        "usage": "适合新建商品、文章等资源；创建后需要返回身份和默认字段的场景尤其有用。",
        "mistakes": [
          "保存尚未成功就返回 201。",
          "把示例内存计数算法搬进并发生产服务。"
        ],
        "takeaways": [
          "201 表达资源已创建",
          "返回正式资源身份",
          "POST 重试可能重复创建"
        ],
        "refs": [
          {
            "label": "POST 与 201 Created · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/response-status-code/"
          }
        ],
        "conceptId": "post-created-resource"
      },
      {
        "id": "DB-006",
        "category": "database",
        "name": "INSERT RETURNING 与默认值",
        "type": "PostgreSQL 写入语句",
        "level": "Beginner",
        "teaser": "新增后再用最大 ID 查刚写入的商品，在并发时可能取到别人创建的资料。",
        "problem": "新增后再用最大 ID 查刚写入的商品，在并发时可能取到别人创建的资料。RETURNING 能直接取得本条写入结果。",
        "mechanism": [
          "省略使用默认值的字段。",
          "数据库执行 INSERT 并生成 ID。",
          "RETURNING 取得实际写入的字段。"
        ],
        "code": "-- products 已有 IDENTITY 主键\nINSERT INTO products (name, price)\nVALUES ('Tea', 8.50)\nRETURNING id, name, price;\n\n-- 正式 Python 调用使用参数，不拼接输入\n-- cur.execute(sql, (name, price))",
        "language": "sql",
        "explanation": "代码以第一天的 products 表为前提，IDENTITY 是数据库定义的默认生成机制。INSERT 没有指定 id，因此数据库为新行分配身份，RETURNING 从这条语句实际影响的行取值。它可以同时取得默认时间、触发器调整后的字段或其他需要返回客户端的结果，避免第二次查询和错误的 MAX(id) 推断。生成的 ID 不保证连续：事务回滚或其他会话写入都会留下空隙，因此不能拿 ID 缺口当作资料丢失的证据。RETURNING 有结果也不等于外层事务已经提交，后端仍应在事务成功结束后发送 201。应用传入的名称和价格需使用驱动参数绑定，本例固定字面量只是为说明 SQL 结构。",
        "usage": "适合新增后立即更新页面，也适合取得数据库负责的默认字段。",
        "mistakes": [
          "SELECT MAX(id) 查新增结果，引入并发竞态。",
          "以为返回 ID 就说明事务已提交。"
        ],
        "takeaways": [
          "RETURNING 关联本次写入",
          "默认值由数据库生成",
          "序列 ID 可以有空隙"
        ],
        "refs": [
          {
            "label": "INSERT RETURNING 与默认值 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/dml-returning.html"
          }
        ],
        "conceptId": "insert-returning-defaults"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "提交新增",
        "detail": "前端把名称和价格作为请求体发送。",
        "code": "POST /products"
      },
      {
        "label": "02",
        "title": "数据库分配身份",
        "detail": "INSERT 返回本次新行，不猜测最大 ID。",
        "code": "INSERT ... RETURNING id, name, price"
      },
      {
        "label": "03",
        "title": "确认创建完成",
        "detail": "事务完成后返回 201 与资源地址。",
        "code": "201 Location: /products/5"
      },
      {
        "label": "04",
        "title": "追加新对象",
        "detail": "列表基于最新旧状态构造新数组。",
        "code": "setItems(prev => [...prev, created])"
      }
    ],
    "summary": "创建链路应以数据库返回的真实对象为准。界面不可变更新解决状态表达，不能代替服务端持久化和并发保证。",
    "challenge": {
      "duration": "15",
      "task": "准备现有商品 ID 1、2 和服务器返回的 ID 8，把新商品加入列表并确保原数组不变。",
      "criteria": [
        "新列表有三项",
        "原列表仍是两项",
        "新增商品使用 ID 8"
      ],
      "hint": "用函数返回新数组，比较旧数组长度与对象身份。",
      "solution": "const before = [{id:1,name:\"Coffee\"},{id:2,name:\"Tea\"}];\nconst created = {id:8,name:\"Cake\"};\nconst after = [...before, created];\nconsole.assert(before.length===2 && after.length===3);"
    },
    "preview": "明天把可取消的编辑草稿与正式资料分开。"
  },
  {
    "number": 7,
    "title": "编辑中的价格，为什么不能直接覆盖原商品？",
    "subtitle": "保留草稿与正式值的边界，用 PATCH 只写改变的字段。",
    "minutes": "12",
    "objectives": [
      "编辑草稿与取消",
      "PATCH 部分更新",
      "条件 UPDATE 与 RETURNING"
    ],
    "lessons": [
      {
        "id": "FE-007",
        "category": "frontend",
        "name": "编辑草稿与取消",
        "type": "React 表单状态",
        "level": "Beginner",
        "teaser": "用户改了价格又点击取消，列表不应已经悄悄变价。",
        "problem": "用户改了价格又点击取消，列表不应已经悄悄变价。编辑草稿必须与正式对象分离。",
        "mechanism": [
          "进入编辑时复制需要的字段。",
          "输入只修改草稿。",
          "保存成功后替换正式值，取消则丢弃草稿。"
        ],
        "code": "import { useState } from \"react\";\nexport default function PriceEditor({ product, onSave }) {\n const [draft, setDraft] = useState(String(product.price));\n return <form onSubmit={e=>{e.preventDefault(); onSave({price:draft});}}>\n <input aria-label=\"价格\" value={draft} onChange={e=>setDraft(e.target.value)}/>\n <button>保存</button><button type=\"button\"\n onClick={()=>setDraft(String(product.price))}>取消</button>\n </form>;\n}\n// 切换商品时 <PriceEditor key={product.id} ... />",
        "language": "jsx",
        "explanation": "在已有 React 项目中使用组件，onSave 由父层提供并负责真实验证和保存。draft 保留字符串形式，让输入框能暂时处于空白或未完成的小数状态；正式 product 不会随着每次键入改变。取消只把草稿恢复为当前已保存价格，不需要调用接口。useState 的初始值只在组件首次建立时采用，如果同一个组件位置换成另一件商品，旧草稿会继续存在；调用者使用 key={product.id} 可以明确重建该商品的编辑状态。保存是异步时还需要等待状态和错误提示，成功后再更新父层正式对象。若编辑期间后台价格也变化，本例不会自动合并，应设计冲突提示，不能把重置草稿当成并发保护。",
        "usage": "适合可取消编辑、弹窗表单和多字段修改。切换身份时要明确保留还是重建草稿。",
        "mistakes": [
          "草稿直接引用并改写 product。",
          "商品 ID 换了却继续显示上一件的草稿。"
        ],
        "takeaways": [
          "草稿独立于正式值",
          "取消不写入服务器",
          "状态初始化不是自动同步"
        ],
        "refs": [
          {
            "label": "编辑草稿与取消 · 官方文档",
            "url": "https://react.dev/learn/preserving-and-resetting-state"
          }
        ],
        "conceptId": "edit-draft-cancel"
      },
      {
        "id": "BE-007",
        "category": "backend",
        "name": "PATCH 部分更新",
        "type": "HTTP 与 Pydantic 更新契约",
        "level": "Beginner",
        "teaser": "只改价格时不应把商品名称变成默认值。",
        "problem": "只改价格时不应把商品名称变成默认值。PATCH 需要区分没有提交字段与明确提交空值。",
        "mechanism": [
          "更新模型允许字段被省略。",
          "model_dump(exclude_unset=True) 只提取传入字段。",
          "校验可空规则后合并实际变化。"
        ],
        "code": "from decimal import Decimal\nfrom pydantic import BaseModel, Field\nclass ProductPatch(BaseModel):\n    name: str | None = Field(default=None, min_length=1)\n    price: Decimal | None = Field(default=None, ge=0)\ndef changes(body: ProductPatch):\n    patch = body.model_dump(exclude_unset=True)\n    if any(v is None for v in patch.values()):\n        raise ValueError(\"name and price cannot be null\")\n    return patch\n# 路由将 ValueError 转为约定的 422；之后按白名单写入。",
        "language": "python",
        "explanation": "片段使用 Pydantic 2，展示更新解析函数而非完整数据库路由。body={} 会得到空变化，body={\"price\":\"9.50\"} 只产生 price，而 body={\"price\":null} 是明确传入空值，本例选择拒绝。exclude_unset 依据模型记录的输入字段，不是简单移除值为 None 的字段；若业务允许把备注清空，不能用 exclude_none 抹掉用户意图。更新模型不应直接复用新增模型，因为必填要求不同。得到 patch 后仍需做字段白名单和业务校验，再写入数据库，不能把用户提供的任意键拼成 SQL 列名。本文用 ValueError 便于独立展示，完整路由应把它映射成明确的客户端错误，避免变成 500。",
        "usage": "适合部分字段编辑；如果需要完整替换，应明确采用不同契约。",
        "mistakes": [
          "用默认值覆盖未提交字段。",
          "把未提供和显式 null 当成一回事。"
        ],
        "takeaways": [
          "只更新实际提交字段",
          "null 是独立的输入意图",
          "写入字段仍需白名单"
        ],
        "refs": [
          {
            "label": "PATCH 部分更新 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/body-updates/"
          }
        ],
        "conceptId": "patch-exclude-unset"
      },
      {
        "id": "DB-007",
        "category": "database",
        "name": "条件 UPDATE 与 RETURNING",
        "type": "PostgreSQL 定位更新",
        "level": "Beginner",
        "teaser": "改一件商品价格时漏掉 WHERE，会更新整张表。",
        "problem": "改一件商品价格时漏掉 WHERE，会更新整张表。更新语句必须明确范围并确认实际影响行数。",
        "mechanism": [
          "WHERE 按主键缩小目标。",
          "SET 只列出要改变的字段。",
          "RETURNING 返回更新后的实际行。"
        ],
        "code": "UPDATE products\nSET price = 9.50\nWHERE id = 2\nRETURNING id, name, price;\n\n-- 正式驱动代码使用 price 和 id 两个绑定参数\n-- 结果为空时由服务端转成 404。",
        "language": "sql",
        "explanation": "这条 SQL 基于已有 products 表，只修改 ID 2 的价格，name 因为没有出现在 SET 中而保持原值。RETURNING 返回更新后的一行，可直接作为 PATCH 响应，不必重新猜测写入结果。若 WHERE 没有匹配，语句本身仍可正常完成，但返回零行；后端必须解释为目标不存在，而不是声称更新成功。主键保证最多定位一行，业务更新不应依赖不唯一的名称。实践中应先在独立练习资料上检查相同条件的 SELECT，再执行 UPDATE，并确认事务提交的边界。这个简单条件不会防止两位管理员同时修改导致最后写入覆盖前者，稍后的 version 条件更新课程才处理那个问题，不能把 RETURNING 视为冲突保护。",
        "usage": "适合按唯一身份修改个别字段。批量更新应额外明确预计行数和恢复方案。",
        "mistakes": [
          "遗漏 WHERE 造成全表更新。",
          "返回零行仍通知用户保存成功。"
        ],
        "takeaways": [
          "SET 决定修改字段",
          "WHERE 决定修改对象",
          "零行要有业务解释"
        ],
        "refs": [
          {
            "label": "条件 UPDATE 与 RETURNING · 官方文档",
            "url": "https://www.postgresql.org/docs/current/sql-update.html"
          }
        ],
        "conceptId": "conditional-update-returning"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "复制编辑草稿",
        "detail": "输入只影响 draft，列表仍保留正式价格。",
        "code": "draft = \"9.50\""
      },
      {
        "label": "02",
        "title": "提取提交字段",
        "detail": "PATCH 只包含价格，名称没有出现在变化中。",
        "code": "{\"price\":\"9.50\"}"
      },
      {
        "label": "03",
        "title": "定位更新",
        "detail": "SQL 以主键限定目标，返回实际结果。",
        "code": "UPDATE ... WHERE id = 2 RETURNING *"
      },
      {
        "label": "04",
        "title": "保存或取消",
        "detail": "成功替换正式对象，取消直接丢弃草稿。",
        "code": "Cancel → product.price 不变"
      }
    ],
    "summary": "草稿控制交互，PATCH 表达变化，WHERE 控制写入范围。任何一层都不应把未修改字段当成默认空值覆盖。",
    "challenge": {
      "duration": "15",
      "task": "用商品 {id:2,name:\"Tea\",price:\"8.00\"} 演示改价至 9.50，再分别执行取消和保存。",
      "criteria": [
        "取消后正式值仍为 8.00",
        "保存仅改变 price",
        "商品名称保持 Tea"
      ],
      "hint": "用两个对象分别保存正式值和 draft；只合并 patch 中的键。",
      "solution": "const saved = {id:2,name:\"Tea\",price:\"8.00\"};\nconst patch = {price:\"9.50\"};\nconst afterSave = {...saved,...patch};\nconst afterCancel = {...saved};"
    },
    "preview": "明天处理删除动作以及关联资料的保护。"
  },
  {
    "number": 8,
    "title": "删除一项资料，会影响哪些关联记录？",
    "subtitle": "确认交互只是第一步，真正的删除规则由后端和外键约束执行。",
    "minutes": "12",
    "objectives": [
      "删除确认与空列表",
      "DELETE 与 204",
      "外键删除策略"
    ],
    "lessons": [
      {
        "id": "FE-008",
        "category": "frontend",
        "name": "删除确认与空列表",
        "type": "React 条件渲染",
        "level": "Beginner",
        "teaser": "删除最后一件商品后，页面不应留下一块无解释的空白。",
        "problem": "删除最后一件商品后，页面不应留下一块无解释的空白。危险操作也需要清楚指出对象。",
        "mechanism": [
          "保存等待确认的商品身份。",
          "确认后才调用删除函数。",
          "列表为空时显示清楚的空状态。"
        ],
        "code": "function ProductList({ items, remove }) {\n if (items.length === 0) return <p>暂无商品，请先新增。</p>;\n return <ul>{items.map(p=><li key={p.id}>{p.name}\n  <button onClick={()=>{\n   if (window.confirm(`删除 ${p.name}？`)) remove(p.id);\n  }}>删除</button>\n </li>)}</ul>;\n}",
        "language": "jsx",
        "explanation": "这是已有 React 项目的本地交互片段，remove 由父层实现；浏览器 confirm 用于展示最小确认逻辑，正式产品可换成支持焦点管理的对话框。提示中应包含对象名称，让用户知道确认的是哪一项，但请求仍应使用稳定 ID，不能拿名称定位删除。确认不是权限检查，只是降低误操作；后端必须重新判断当前用户能否删除、对象是否仍存在以及是否有关联限制。删除期间可禁用对应按钮并保留列表，成功后用 filter 创建新数组；失败时保留资料并解释原因。items.length 为零是成功读到空集合，与加载失败是两种状态，应分别呈现。即使最后一项被删除，页面也应给出下一步，例如新增商品或调整筛选条件。",
        "usage": "适合低频、不可轻易撤销的删除动作；批量删除需额外展示数量和影响范围。",
        "mistakes": [
          "用户取消仍调用删除接口。",
          "把空列表误显示为请求失败。"
        ],
        "takeaways": [
          "确认需要明确对象",
          "删除成功再更新列表",
          "空集合有独立界面"
        ],
        "refs": [
          {
            "label": "删除确认与空列表 · 官方文档",
            "url": "https://react.dev/learn/conditional-rendering"
          }
        ],
        "conceptId": "delete-empty-ui"
      },
      {
        "id": "BE-008",
        "category": "backend",
        "name": "DELETE 与 204",
        "type": "HTTP 删除响应语义",
        "level": "Beginner",
        "teaser": "删除成功后不一定要返回资源 JSON。",
        "problem": "删除成功后不一定要返回资源 JSON。204 表示已成功处理且响应没有内容，前端不应继续解析 JSON。",
        "mechanism": [
          "DELETE 以路径 ID 指向资源。",
          "查找和关联检查完成后执行删除。",
          "返回空 Response(status_code=204)。"
        ],
        "code": "from fastapi import FastAPI, HTTPException, Response\napp = FastAPI()\nstore = {1: {\"name\":\"Coffee\"}}\n@app.delete(\"/products/{product_id}\", status_code=204)\ndef delete_product(product_id: int):\n    if product_id not in store:\n        raise HTTPException(404, \"Product not found\")\n    del store[product_id]\n    return Response(status_code=204)",
        "language": "python",
        "explanation": "示例仍使用内存字典，只演示路由和响应，不包含真实权限或外键处理。204 的重点是没有消息内容，前端 fetch 成功后直接更新状态，不要无条件 await response.json()，否则会因为空响应解析失败而把成功误显示成错误。重复删除同一 ID，本例第一次返回 204，之后返回 404；这并不违反 DELETE 的幂等含义，因为幂等关注多次请求后的资源状态，而非每次状态码必须相同。接数据库后若因外键 RESTRICT 而不能删除，应映射为清楚的冲突错误，不能暴露原始 SQL 异常。删除操作不应通过 GET 实现，也不能因为按钮被隐藏就省略服务端权限检查。",
        "usage": "适合成功后无需返回数据的删除。需要返回归档结果时可另定义有响应体的成功契约。",
        "mistakes": [
          "给 204 附带 JSON 正文。",
          "把 DELETE 幂等误解为每次都要同样状态码。"
        ],
        "takeaways": [
          "204 没有响应内容",
          "前端不要强行解析 JSON",
          "幂等关注最终资源状态"
        ],
        "refs": [
          {
            "label": "DELETE 与 204 · 官方文档",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE"
          }
        ],
        "conceptId": "delete-no-content"
      },
      {
        "id": "DB-008",
        "category": "database",
        "name": "外键删除策略",
        "type": "关系完整性约束",
        "level": "Beginner",
        "teaser": "删除分类时仍有商品引用它，数据库需要明确允许、禁止还是连带删除，不能留下悬空引用。",
        "problem": "删除分类时仍有商品引用它，数据库需要明确允许、禁止还是连带删除，不能留下悬空引用。",
        "mechanism": [
          "外键把子表引用绑定到父表。",
          "RESTRICT 拒绝存在引用的删除。",
          "CASCADE 自动删除引用行，需符合业务意图。"
        ],
        "code": "CREATE TABLE categories (id integer PRIMARY KEY, name text NOT NULL);\nCREATE TABLE catalog_items (\n id integer PRIMARY KEY,\n category_id integer NOT NULL\n   REFERENCES categories(id) ON DELETE RESTRICT\n);\n-- 有 catalog_items 引用时，下面语句会失败\nDELETE FROM categories WHERE id = 1;",
        "language": "sql",
        "explanation": "在独立 PostgreSQL 练习库使用新的表名；示例只定义结构，没有预置行，因此要先插入分类与商品才能观察限制。外键确保子表的 category_id 指向存在的父表记录，RESTRICT 会阻止删除仍被引用的分类。CASCADE 则在删除父行时自动删除相关子行，适合确实随父对象消失的附属记录，例如纯粹依附订单的临时明细，但分类通常不应让整批商品消失。也可以设计 SET NULL，不过字段必须允许 NULL，界面要能显示未分类。外键不会自动帮所有引用列建立查询索引，数据量增大时需考虑引用查找成本。具体选择应先讨论资料生命周期，而不是为了让删除接口返回成功就改成 CASCADE。",
        "usage": "适合分类、订单和明细等关联建模。保护历史交易时通常应采用归档或禁止删除。",
        "mistakes": [
          "为消除报错把 RESTRICT 改成 CASCADE，意外删除业务资料。",
          "SET NULL 却把引用字段设为 NOT NULL。"
        ],
        "takeaways": [
          "外键保护引用完整性",
          "删除策略体现生命周期",
          "CASCADE 影响需要先评估"
        ],
        "refs": [
          {
            "label": "外键删除策略 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK"
          }
        ],
        "conceptId": "foreign-key-delete-policy"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "明确删除对象",
        "detail": "确认框展示分类名称与影响提示。",
        "code": "删除 Drinks？"
      },
      {
        "label": "02",
        "title": "检查引用",
        "detail": "后端判断该分类仍被多少商品引用。",
        "code": "SELECT count(*) ... category_id = 1"
      },
      {
        "label": "03",
        "title": "执行约束策略",
        "detail": "RESTRICT 阻止有引用删除，CASCADE 则会连带删除。",
        "code": "ON DELETE RESTRICT"
      },
      {
        "label": "04",
        "title": "呈现结果",
        "detail": "成功接受 204；冲突保留资料并说明原因。",
        "code": "204 → 不解析 JSON"
      }
    ],
    "summary": "确认框帮助用户决策，外键保护资料完整性。分类与商品的生命周期决定删除策略，不能只为了消除错误选择连带删除。",
    "challenge": {
      "duration": "15",
      "task": "用分类 Drinks 和两件关联商品写出 RESTRICT 与 CASCADE 两种策略的结果，并实现最后一项删除后的空提示。",
      "criteria": [
        "RESTRICT 保留分类与两件商品",
        "CASCADE 删除分类及引用商品",
        "取消确认不改变任何资料"
      ],
      "hint": "先数关联数量，再根据策略决定，不要把隐藏按钮当权限。",
      "solution": "// RESTRICT: 1 category + 2 products → 拒绝，资料不变\n// CASCADE: 1 category + 2 products → 全部删除\nconst message = items.length ? \"商品列表\" : \"暂无商品，请先新增。\";"
    },
    "preview": "明天用关联查询显示分类名称，并保持状态只有一份。"
  },
  {
    "number": 9,
    "title": "商品和分类，怎样保持一致？",
    "subtitle": "父层管理选择，响应模型控制字段，JOIN 组合关联资料。",
    "minutes": "12",
    "objectives": [
      "状态提升与单一来源",
      "Response Model 与关联响应",
      "INNER JOIN 与 LEFT JOIN"
    ],
    "lessons": [
      {
        "id": "FE-009",
        "category": "frontend",
        "name": "状态提升与单一来源",
        "type": "React 状态设计",
        "level": "Beginner",
        "teaser": "筛选器与列表各自保存分类选择，会出现筛选按钮显示 Drinks、列表却仍显示全部商品的矛盾。",
        "problem": "筛选器与列表各自保存分类选择，会出现筛选按钮显示 Drinks、列表却仍显示全部商品的矛盾。",
        "mechanism": [
          "把共同状态放到最近共同父组件。",
          "筛选器接收值和改变回调。",
          "列表从同一状态计算显示结果。"
        ],
        "code": "import { useState } from \"react\";\nfunction Filter({value,onChange}) {\n return <select value={value} onChange={e=>onChange(e.target.value)}>\n <option value=\"all\">全部</option><option value=\"1\">Drinks</option></select>;\n}\nexport default function Catalog({items}) {\n const [category,setCategory] = useState(\"all\");\n const shown = items.filter(p=>category===\"all\" || String(p.category_id)===category);\n return <><Filter value={category} onChange={setCategory}/>\n {shown.map(p=><p key={p.id}>{p.name}</p>)}</>;\n}",
        "language": "jsx",
        "explanation": "片段放入已有 React 页面，items 为商品数组，每行有稳定 ID 和 category_id。分类选择属于筛选器与列表共同使用的状态，因此放进 Catalog，由子组件通过回调请求改变。shown 是从 items 和 category 计算出的结果，不必再保存成第二份 State；否则其中一份更新而另一份未同步，就会形成互相矛盾的界面。select 的 value 是字符串，所以示例显式转换 category_id 后比较，避免数字一与字符串一无法严格相等。状态提升不表示所有状态都必须放到应用最顶层：输入框的临时展开状态若只被一个组件使用，就留在本地。资料流从父到子、操作意图通过回调返回，使更新路径更容易追踪与测试。",
        "usage": "适合筛选器、数量统计和列表共享选择；只服务单组件的临时状态不必提升。",
        "mistakes": [
          "把计算结果也复制成 State，制造同步问题。",
          "把所有局部状态都放到应用根部。"
        ],
        "takeaways": [
          "共同使用的状态由共同父层拥有",
          "派生资料直接计算",
          "回调表达修改意图"
        ],
        "refs": [
          {
            "label": "状态提升与单一来源 · 官方文档",
            "url": "https://react.dev/learn/sharing-state-between-components"
          }
        ],
        "conceptId": "lift-filter-state"
      },
      {
        "id": "BE-009",
        "category": "backend",
        "name": "Response Model 与关联响应",
        "type": "FastAPI 输出契约",
        "level": "Beginner",
        "teaser": "数据库返回了内部字段，不能因此全部暴露给客户端。",
        "problem": "数据库返回了内部字段，不能因此全部暴露给客户端。响应模型定义商品与分类如何稳定地输出。",
        "mechanism": [
          "声明独立的输出模型。",
          "把数据库结果映射到响应字段。",
          "FastAPI 验证并过滤返回内容。"
        ],
        "code": "from fastapi import FastAPI\nfrom pydantic import BaseModel\napp = FastAPI()\nclass CategoryOut(BaseModel):\n    id: int\n    name: str\nclass ProductOut(BaseModel):\n    id: int\n    name: str\n    category: CategoryOut | None\n@app.get(\"/products\", response_model=list[ProductOut])\ndef list_products():\n    return [{\"id\":1,\"name\":\"Coffee\",\"category\":{\"id\":2,\"name\":\"Drinks\"},\"internal_cost\":3}]",
        "language": "python",
        "explanation": "在已有 FastAPI 环境中运行此内存示例，返回列表包含 internal_cost，但它没有出现在 ProductOut，因此不会按此模型输出。响应模型不仅为文档提供结构，也检查应用返回值能否满足契约；返回值不合格通常是服务端程序问题，不应归责为用户输入错误。category 显式允许 None，表示没有分类，而不是让每个客户端猜测字段是否存在。数据库 JOIN 产生的平面列通常需要映射成嵌套字典；response_model 不会自动替应用完成关联查询，也不会自动减少查询次数。输入模型和输出模型应分开，避免未来新增内部成本或权限字段时不小心暴露。仍需谨慎选择返回字段，不能只依赖最终过滤来弥补随意的数据读取。",
        "usage": "适合有多个客户端的公开契约、关联对象与敏感字段隔离。",
        "mistakes": [
          "直接返回 ORM 对象就以为所有关联已加载。",
          "把响应模型验证错误当作客户端 422。"
        ],
        "takeaways": [
          "输出契约独立于存储结构",
          "响应字段需要明确映射",
          "模型不会自动查询关联"
        ],
        "refs": [
          {
            "label": "Response Model 与关联响应 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/response-model/"
          }
        ],
        "conceptId": "response-model-relations"
      },
      {
        "id": "DB-009",
        "category": "database",
        "name": "INNER JOIN 与 LEFT JOIN",
        "type": "PostgreSQL 关联查询",
        "level": "Beginner",
        "teaser": "商品表保存分类 ID，界面却需要分类名称。",
        "problem": "商品表保存分类 ID，界面却需要分类名称。关联查询能合并资料，但 JOIN 类型决定未分类商品是否保留。",
        "mechanism": [
          "ON 描述商品与分类的对应关系。",
          "INNER JOIN 只保留匹配双方。",
          "LEFT JOIN 保留左表并以 NULL 表示缺少右表。"
        ],
        "code": "SELECT p.id, p.name, c.name AS category_name\nFROM products AS p\nLEFT JOIN categories AS c ON c.id = p.category_id\nORDER BY p.id;\n-- 前提：products 已增加可空 category_id 外键\n-- 改成 INNER JOIN 会排除 category_id 为 NULL 的商品。",
        "language": "sql",
        "explanation": "片段需要预先准备 categories 表并给 products 增加可空 category_id；它不是直接可接在前三天旧结构上的迁移命令。LEFT JOIN 先保留所有商品，再尝试匹配分类；匹配不到时 category_name 为 NULL。INNER JOIN 则只保留满足 ON 的组合，未分类商品会消失。外键只能保证非空引用有效，允许 NULL 时仍有无分类情形。要保留未分类商品，应谨慎添加右表筛选：WHERE c.name = 'Drinks' 会排除 NULL 行，使结果不再保留全部左表；若只是限制匹配条件，可考虑放在 ON 中并确认业务意图。关联键不唯一还可能把一行扩成多行，本例使用分类主键确保一件商品最多匹配一个分类。",
        "usage": "适合商品带分类、订单带客户等读取。是否保留缺少关联的主记录必须先决定。",
        "mistakes": [
          "用 INNER JOIN 后误以为未分类商品被删除。",
          "LEFT JOIN 后在 WHERE 过滤右表，意外排除 NULL 行。"
        ],
        "takeaways": [
          "ON 定义匹配关系",
          "LEFT JOIN 保留左侧",
          "关联键唯一性影响行数"
        ],
        "refs": [
          {
            "label": "INNER JOIN 与 LEFT JOIN · 官方文档",
            "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html"
          }
        ],
        "conceptId": "join-category-relations"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "共享筛选状态",
        "detail": "父组件持有分类选择，控件和列表读取同一个值。",
        "code": "category = \"all\""
      },
      {
        "label": "02",
        "title": "合并分类资料",
        "detail": "LEFT JOIN 保留未分类商品并取得分类名称。",
        "code": "p LEFT JOIN c ON c.id = p.category_id"
      },
      {
        "label": "03",
        "title": "整理输出契约",
        "detail": "接口把查询列映射成明确可空的分类对象。",
        "code": "category: CategoryOut | None"
      },
      {
        "label": "04",
        "title": "显示一致结果",
        "detail": "组件依据同一筛选计算列表和数量。",
        "code": "shown.length"
      }
    ],
    "summary": "状态提升解决界面内部一致性，响应模型解决输出契约，JOIN 决定关联资料如何进入结果；不要把这三个问题混为同一种自动同步。",
    "challenge": {
      "duration": "15",
      "task": "给 Coffee 分类 Drinks，给 Cake 分类 NULL，比较 INNER/LEFT JOIN，并让分类筛选与数量来自同一份状态。",
      "criteria": [
        "LEFT JOIN 返回两件商品",
        "INNER JOIN 只返回 Coffee",
        "数量根据当前筛选计算"
      ],
      "hint": "先写出关联结果，再对同一结果做 filter 与 length。",
      "solution": "// LEFT: Coffee/Drinks, Cake/null；INNER: Coffee/Drinks\nconst shown = items.filter(p=>category===\"all\" || p.category_id===Number(category));\nconst count = shown.length;"
    },
    "preview": "明天把 SQL 查询真正接入接口，并区分 HTTP 与网络失败。"
  },
  {
    "number": 10,
    "title": "页面请求，怎样安全地读到数据库？",
    "subtitle": "把加载、HTTP 失败与参数化查询串起来，不让用户输入成为 SQL。",
    "minutes": "12",
    "objectives": [
      "fetch 与请求状态",
      "Psycopg 连接生命周期",
      "参数化 SQL"
    ],
    "lessons": [
      {
        "id": "FE-010",
        "category": "frontend",
        "name": "fetch 与请求状态",
        "type": "浏览器 HTTP API",
        "level": "Beginner",
        "teaser": "fetch 遇到 404 不会自动抛异常。",
        "problem": "fetch 遇到 404 不会自动抛异常。若只写 catch，页面可能把错误正文当成商品列表。",
        "mechanism": [
          "先显示 loading。",
          "检查 response.ok 后解析正文。",
          "区分成功空数据与 error，并在 finally 结束加载。"
        ],
        "code": "async function loadProducts(setState) {\n setState({status:\"loading\"});\n try {\n  const res = await fetch(\"/api/products\");\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  const data = await res.json();\n  setState({status:\"success\", items:data.items});\n } catch (error) {\n  setState({status:\"error\", message:error.message});\n }\n}",
        "language": "jsx",
        "explanation": "此函数由已有 React 组件的用户操作或 Effect 调用，setState 是该组件的状态设置函数；同源 /api 路径需已有开发代理或后端路由。fetch 的 Promise 在网络故障等情形才拒绝，HTTP 400、404、500 仍会得到 Response，所以必须主动检查 ok。检查后再解析 JSON，可避免把失败正文误当正常数据；即使状态成功，空正文或错误格式也可能让解析失败，需要同一条错误路径处理。这里用 status 区分 loading、success、error，不需要多个可能互相矛盾的布尔值。成功且 items 为空时显示空列表，不应当作网络错误。生产界面可以保留上次资料并标明正在刷新，但不要默默保留旧资料而声称当前请求成功；过期请求控制会在明天补上。",
        "usage": "适合手动读取小型 API；多个页面共享缓存时可考虑专门的 Server State 工具。",
        "mistakes": [
          "只写 catch，遗漏 HTTP 非成功状态。",
          "加载失败后用空数组伪装成成功空结果。"
        ],
        "takeaways": [
          "fetch 不自动拒绝 HTTP 错误",
          "解析 JSON 也可能失败",
          "空数据与请求失败不同"
        ],
        "refs": [
          {
            "label": "fetch 与请求状态 · 官方文档",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
          }
        ],
        "conceptId": "fetch-http-loading"
      },
      {
        "id": "BE-010",
        "category": "backend",
        "name": "Psycopg 连接生命周期",
        "type": "Python PostgreSQL 驱动",
        "level": "Beginner",
        "teaser": "接口不能一直返回内存样本。",
        "problem": "接口不能一直返回内存样本。读取数据库时必须正确关闭连接和游标，否则请求越多资源占用越多。",
        "mechanism": [
          "从服务端环境取得连接串。",
          "通过上下文管理器打开连接和游标。",
          "读取结果后退出上下文释放资源。"
        ],
        "code": "import os\nimport psycopg\nfrom psycopg.rows import dict_row\nfrom fastapi import FastAPI\napp = FastAPI()\n@app.get(\"/api/products\")\ndef list_products():\n    with psycopg.connect(os.environ[\"DATABASE_URL\"], row_factory=dict_row) as conn:\n        with conn.cursor() as cur:\n            cur.execute(\"SELECT id, name, price FROM public.products ORDER BY id\")\n            return {\"items\": cur.fetchall()}",
        "language": "python",
        "explanation": "示例需已有 Psycopg 3、FastAPI、PostgreSQL 练习库和服务端 DATABASE_URL，本文没有建立连接或执行 SQL。with 管理器保证正常返回和抛出异常时都执行收尾；Psycopg 连接上下文正常结束会提交事务，异常离开会回滚，然后关闭连接。dict_row 让每行成为按列名索引的字典，便于响应映射。数据库调用是同步阻塞，因此路由使用普通 def，让 FastAPI 按同步路径处理，不要直接搬进 async def 阻塞事件循环。每个请求新连一次适合解释生命周期，实际高并发项目常使用连接池，但取出的连接也必须归还。连接串只保存在服务器环境，不得放进前端包、请求响应或日志中。",
        "usage": "适合学习真实读取边界。连接池和事务策略需随应用规模进一步设计。",
        "mistakes": [
          "忘记关闭异常路径上的连接。",
          "把连接串传到浏览器或提交到代码库。"
        ],
        "takeaways": [
          "连接和游标都有生命周期",
          "同步驱动配合适当路由",
          "环境配置只留在服务端"
        ],
        "refs": [
          {
            "label": "Psycopg 连接生命周期 · 官方文档",
            "url": "https://www.psycopg.org/psycopg3/docs/basic/usage.html"
          }
        ],
        "conceptId": "psycopg-connection-context"
      },
      {
        "id": "DB-010",
        "category": "database",
        "name": "参数化 SQL",
        "type": "SQL 安全与驱动绑定",
        "level": "Beginner",
        "teaser": "搜索词可能包含引号甚至 SQL 片段。",
        "problem": "搜索词可能包含引号甚至 SQL 片段。把它直接拼进语句，会让资料内容变成数据库指令。",
        "mechanism": [
          "SQL 结构与值分开传递。",
          "Psycopg 用 %s 占位符绑定值。",
          "列名等标识符由白名单或专门组合工具处理。"
        ],
        "code": "def find_products(conn, term):\n    with conn.cursor() as cur:\n        cur.execute(\n            \"SELECT id, name FROM products WHERE name ILIKE %s ORDER BY id\",\n            (f\"%{term}%\",),\n        )\n        return cur.fetchall()\n# term = \"Coffee' OR 1=1 --\" 仍是一个搜索值",
        "language": "python",
        "explanation": "这是使用 Psycopg 3 的 Python 片段，conn 是已打开的练习库连接，所以语言标为 Python。参数绑定的重点是让数据库把输入当作值处理；不是先替换引号，再自己拼出一条看起来安全的 SQL。占位符 %s 不要加单引号，参数元组只有一个元素时仍需尾随逗号。f-string 只用于构造模式值 \"%词%\"，没有把用户内容插入 SQL 结构。绑定不会自动把 ILIKE 的百分号与下划线变成普通字符：若产品要求字面搜索，还需单独设计模式转义规则。排序列名不能通过同一个值占位符替换，应由白名单选择固定 SQL 或使用驱动的 Identifier。参数化保护语法边界，仍不能取代权限检查与查询数量上限。",
        "usage": "适合所有包含外部输入的 SQL；即使输入来自内部接口，也应保持绑定习惯。",
        "mistakes": [
          "写成 WHERE name = '%s'，让占位符失效。",
          "以为绑定值也能绑定表名或任意排序表达式。"
        ],
        "takeaways": [
          "值与 SQL 结构分离",
          "单参数元组需要逗号",
          "标识符另行处理"
        ],
        "refs": [
          {
            "label": "参数化 SQL · 官方文档",
            "url": "https://www.psycopg.org/psycopg3/docs/basic/params.html"
          }
        ],
        "conceptId": "parameterized-sql"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "开始读取",
        "detail": "页面进入加载状态，向商品接口发送请求。",
        "code": "fetch(\"/api/products\")"
      },
      {
        "label": "02",
        "title": "借用数据库资源",
        "detail": "服务端在受控生命周期中打开连接与游标。",
        "code": "with psycopg.connect(...) as conn"
      },
      {
        "label": "03",
        "title": "绑定输入",
        "detail": "用户搜索词作为参数值传递，不进入 SQL 结构。",
        "code": "WHERE name ILIKE %s"
      },
      {
        "label": "04",
        "title": "解释响应",
        "detail": "页面检查 HTTP 状态，再显示资料或错误。",
        "code": "if (!res.ok) throw ..."
      }
    ],
    "summary": "真实读取需要完整的错误与资源边界：HTTP 状态、连接关闭、输入绑定缺一不可。本页代码为环境已准备后的参考，交互实验仅模拟。",
    "challenge": {
      "duration": "15",
      "task": "为搜索词 Coffee' OR 1=1 -- 写出正确参数化调用，列出 HTTP 404 与断网各进入哪条分支。",
      "criteria": [
        "SQL 结构不包含原始输入",
        "搜索值单独放参数元组",
        "404 通过 ok 检查，断网通过 catch"
      ],
      "hint": "不要尝试删掉引号，直接把搜索词完整当值传给驱动。",
      "solution": "sql = \"SELECT id FROM products WHERE name ILIKE %s\"\nparams = (\"%Coffee' OR 1=1 --%\",)\n# HTTP 404: Response → !ok → throw → catch\n# 断网: fetch rejects → catch"
    },
    "preview": "明天防止旧请求覆盖新结果，并定位跨域与命名空间问题。"
  },
  {
    "number": 11,
    "title": "为什么后发请求，反而被旧结果盖住？",
    "subtitle": "Effect 清理控制界面更新；CORS 与数据库 Schema 分别处理自己的边界。",
    "minutes": "12",
    "objectives": [
      "Effect 依赖与过期请求",
      "CORS 开发配置",
      "Schema 命名空间"
    ],
    "lessons": [
      {
        "id": "FE-011",
        "category": "frontend",
        "name": "Effect 依赖与过期请求",
        "type": "React 副作用生命周期",
        "level": "Beginner",
        "teaser": "用户快速切换查询词，较慢的旧请求可能最后返回。",
        "problem": "用户快速切换查询词，较慢的旧请求可能最后返回。界面应显示最新选择，而不是最后到达的任意响应。",
        "mechanism": [
          "依赖变化重新执行 Effect。",
          "清理函数标记旧请求失效并取消浏览器等待。",
          "只允许当前 Effect 更新状态。"
        ],
        "code": "import {useEffect,useState} from \"react\";\nfunction useProducts(q) {\n const [items,setItems] = useState([]);\n useEffect(()=>{\n  let ignore = false; const controller = new AbortController();\n  fetch(`/api/products?q=${encodeURIComponent(q)}`, {signal:controller.signal})\n   .then(r=>{if(!r.ok) throw new Error(`HTTP ${r.status}`);return r.json();})\n   .then(data=>{if(!ignore) setItems(data.items);})\n   .catch(e=>{if(!ignore && e.name!==\"AbortError\") console.error(e);});\n  return ()=>{ignore=true;controller.abort();};\n },[q]);\n return items;\n}",
        "language": "jsx",
        "explanation": "这个自定义 Hook 放进已有 React 应用，错误这里只写入控制台以突出时序，正式界面应有独立错误状态。依赖数组包含 q，意味着查询词变化后旧 Effect 先清理、新 Effect 再建立。ignore 是这一轮 Effect 的局部标记，即使旧请求已经完成网络部分，也不会再把结果写到当前界面；AbortController 另外尝试中止 fetch 等待，减少无用工作。取消浏览器请求不保证服务器已经停止执行，也不能当作撤销数据库写入的方法。开发环境 Strict Mode 可能额外执行一次建立和清理，用于暴露缺失收尾的代码，不能靠移除依赖来掩盖。Effect 使用的响应式变量应列入依赖，否则闭包会继续读取旧值。",
        "usage": "适合依赖输入变化的手写请求；复杂缓存交给查询库后仍要理解过期结果的边界。",
        "mistakes": [
          "只靠到达顺序决定最新结果。",
          "为了避免重复执行删掉 q 依赖。"
        ],
        "takeaways": [
          "每轮 Effect 有独立快照",
          "清理阻止旧结果更新",
          "取消不等于服务端回滚"
        ],
        "refs": [
          {
            "label": "Effect 依赖与过期请求 · 官方文档",
            "url": "https://react.dev/reference/react/useEffect"
          }
        ],
        "conceptId": "effect-stale-request"
      },
      {
        "id": "BE-011",
        "category": "backend",
        "name": "CORS 开发配置",
        "type": "浏览器跨源访问策略",
        "level": "Beginner",
        "teaser": "前端运行在 5173，后端运行在 8000，虽然同一台电脑也属于不同源。",
        "problem": "前端运行在 5173，后端运行在 8000，虽然同一台电脑也属于不同源。浏览器可能阻止页面读取响应。",
        "mechanism": [
          "源由协议、主机与端口组成。",
          "配置精确允许的开发源。",
          "根据需要允许方法、请求头与凭证。"
        ],
        "code": "from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\napp = FastAPI()\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"http://localhost:5173\"],\n    allow_credentials=False,\n    allow_methods=[\"GET\", \"POST\", \"PATCH\", \"DELETE\"],\n    allow_headers=[\"Content-Type\"],\n)",
        "language": "python",
        "explanation": "在已有 FastAPI 项目中添加中间件，端口要与实际开发环境一致。http://localhost:5173 和 http://127.0.0.1:5173 不是同一个源，HTTP 与 HTTPS 也不同。某些请求会先发送 OPTIONS 预检，确认服务端允许该方法和请求头后浏览器才继续；浏览器控制台出现 CORS 错误不代表数据库查表失败，也不代表服务端一定没有收到请求。此示例不携带 Cookie，若以后使用凭证需同时配置精确允许源和浏览器 credentials，并重新审查安全策略。CORS 限制的是浏览器页面读取跨源响应，不是认证，也不会阻止脚本或其他客户端直接访问接口。不要为快速消错永久开放所有来源，更不要把请求错误统一改成跨域问题。",
        "usage": "适合分端口本地开发和明确分域的 Web 客户端；生产源应由配置精确管理。",
        "mistakes": [
          "把 localhost 与 127.0.0.1 当成同一个源。",
          "把 CORS 当作接口权限保护。"
        ],
        "takeaways": [
          "源包含端口",
          "预检是浏览器协议步骤",
          "CORS 不等于认证授权"
        ],
        "refs": [
          {
            "label": "CORS 开发配置 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/cors/"
          }
        ],
        "conceptId": "cors-development-origin"
      },
      {
        "id": "DB-011",
        "category": "database",
        "name": "Schema 命名空间",
        "type": "PostgreSQL 名称解析",
        "level": "Beginner",
        "teaser": "数据库里明明有 products，接口却提示找不到表。",
        "problem": "数据库里明明有 products，接口却提示找不到表。可能连接到了正确数据库，却使用了不同 Schema。",
        "mechanism": [
          "Schema 将同名表分到命名空间。",
          "限定名 public.products 明确目标。",
          "未限定名称按 search_path 依次查找。"
        ],
        "code": "SELECT current_database(), current_schema();\nSHOW search_path;\n\nSELECT id, name\nFROM public.products\nORDER BY id;\n\n-- shop.products 可以与 public.products 同时存在。",
        "language": "sql",
        "explanation": "在 PostgreSQL 练习连接中先运行只读检查，确认当前数据库和 search_path。数据库是连接目标，Schema 是该数据库内部的命名空间，二者不是同一个层级。写 public.products 可以避免名称解析依赖当前会话设置，但 public 也不是所有项目的必选位置；正式应用可能使用 app.products，需与迁移定义一致。未限定表名时，PostgreSQL 按 search_path 查找第一个匹配对象，因此同名表可能让查询读到意外资料。把不受信任用户可创建对象的 Schema 放进路径还有安全风险，需要谨慎管理 CREATE 权限。表不存在时应先检查环境、Schema 与迁移状态，不应直接新建一张空表或删除其他表来让错误消失。",
        "usage": "适合多模块命名、迁移定位与环境排查；表名限定不能解决连接到错误数据库的问题。",
        "mistakes": [
          "看到表不存在就直接创建重复空表。",
          "以为 search_path 是跨数据库搜索。"
        ],
        "takeaways": [
          "数据库和 Schema 不同",
          "限定名消除歧义",
          "先核对连接与迁移"
        ],
        "refs": [
          {
            "label": "Schema 命名空间 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/ddl-schemas.html"
          }
        ],
        "conceptId": "schema-search-path"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "新查询取代旧查询",
        "detail": "输入变化触发新 Effect，上一轮先清理。",
        "code": "q: \"c\" → \"ca\""
      },
      {
        "label": "02",
        "title": "标记旧响应失效",
        "detail": "旧请求即使后到也不能更新当前界面。",
        "code": "ignore = true; abort()"
      },
      {
        "label": "03",
        "title": "独立检查跨源",
        "detail": "浏览器核对源、预检与允许请求头。",
        "code": "Origin: http://localhost:5173"
      },
      {
        "label": "04",
        "title": "独立检查表位置",
        "detail": "数据库错误通过限定名和连接信息定位。",
        "code": "SELECT ... FROM public.products"
      }
    ],
    "summary": "过期响应、浏览器跨源和数据库查表属于三个不同边界。按发生层定位，避免用一个配置改动掩盖另一层错误。",
    "challenge": {
      "duration": "15",
      "task": "给两个搜索请求安排到达时间：旧词 c 在 900ms 返回，新词 ca 在 200ms 返回，推演有无清理标记的最终界面。",
      "criteria": [
        "无保护最终错误显示 c",
        "有保护保持 ca",
        "能说明 abort 不保证服务器停止"
      ],
      "hint": "按完成时间排序事件，但只有当前查询的响应可以改变列表。",
      "solution": "// 200ms: request ca 完成 → 显示 ca\n// 900ms: request c 完成 → ignore=true，跳过\n// Schema/CORS 应另查，不改变此时序规则。"
    },
    "preview": "明天把查询状态写进 URL，并给排序建立白名单。"
  },
  {
    "number": 12,
    "title": "复制一个链接，能否还原当前筛选？",
    "subtitle": "URL 保存可分享状态；排序字段需要明确白名单和空值顺序。",
    "minutes": "12",
    "objectives": [
      "URL 中的搜索与页码",
      "排序字段白名单",
      "多字段排序与空值"
    ],
    "lessons": [
      {
        "id": "FE-012",
        "category": "frontend",
        "name": "URL 中的搜索与页码",
        "type": "浏览器 History 与 URL API",
        "level": "Beginner",
        "teaser": "搜索和页码只在组件内，刷新或分享链接就会丢失。",
        "problem": "搜索和页码只在组件内，刷新或分享链接就会丢失。URL 可以表达可恢复的页面查询状态。",
        "mechanism": [
          "通过 URLSearchParams 解析状态。",
          "对页码做正整数规范化。",
          "更新 History 时保留编码与其他参数。"
        ],
        "code": "const url = new URL(window.location.href);\nconst params = url.searchParams;\nconst q = params.get(\"q\") ?? \"\";\nconst raw = Number(params.get(\"page\") ?? \"1\");\nconst page = Number.isInteger(raw) && raw > 0 ? raw : 1;\nfunction shareSearch(nextQ) {\n const next = new URL(window.location.href);\n next.searchParams.set(\"q\", nextQ);\n next.searchParams.set(\"page\", \"1\");\n window.history.pushState({}, \"\", next);\n}\n// React 项目需通过路由状态或 popstate 同步重新渲染。",
        "language": "javascript",
        "explanation": "片段在浏览器执行，URL 与 History 是原生 API，不会自动触发 React 重新渲染，因此已有路由项目应优先使用路由提供的搜索参数接口。URLSearchParams 负责特殊字符编码，不要手动用字符串把 &、? 或中文拼进去。页码来自外部输入，必须处理零、负数、小数和无法转换的值，后端也需要重新验证。改变搜索条件时把 page 重置为一，避免新条件只有两页而仍停在第十页。pushState 增加历史项，适合用户明确提交查询；每次键入都新增历史会让返回键难用，连续编辑可考虑 replaceState。浏览器前进后退产生 popstate，页面需要读取新的 URL，否则地址变化而列表不动。",
        "usage": "适合搜索、排序和分页等可分享状态；密码、令牌和敏感输入不应进入 URL。",
        "mistakes": [
          "更新地址后以为 React 会自动重绘。",
          "搜索条件改变却保留旧页码。"
        ],
        "takeaways": [
          "URL 是可恢复状态",
          "输入参数需要规范化",
          "历史行为也属于交互"
        ],
        "refs": [
          {
            "label": "URL 中的搜索与页码 · 官方文档",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams"
          }
        ],
        "conceptId": "url-query-page"
      },
      {
        "id": "BE-012",
        "category": "backend",
        "name": "排序字段白名单",
        "type": "API 输入与 SQL 结构",
        "level": "Beginner",
        "teaser": "客户端传 sort=price 不表示后端可以把任意字符串接到 ORDER BY。",
        "problem": "客户端传 sort=price 不表示后端可以把任意字符串接到 ORDER BY。排序是 SQL 结构，必须限制合法选项。",
        "mechanism": [
          "把公开参数映射到固定 SQL 片段。",
          "拒绝未知排序名。",
          "每种排序添加稳定唯一尾项。"
        ],
        "code": "from fastapi import HTTPException\nSORTS = {\n \"price_asc\": \"price ASC, id ASC\",\n \"price_desc\": \"price DESC, id ASC\",\n \"name\": \"name ASC, id ASC\",\n}\ndef order_clause(sort: str):\n    if sort not in SORTS:\n        raise HTTPException(422, \"Unsupported sort\")\n    return SORTS[sort]\n# 只有此固定白名单返回值可以组合进查询结构。",
        "language": "python",
        "explanation": "此函数可由已有商品列表路由调用，返回的是服务端写死的 SQL 片段，而不是经过简单替换的用户输入。普通绑定参数用于值，不能把 ORDER BY %s 的值变成列名，所以排序需要白名单或安全的标识符组合。公开参数可以采用 price_asc 这种业务名称，不必暴露真实表结构。价格相同的行通过 id 再排序，分页时顺序更稳定；方向变化也要明确唯一尾项的方向。未知参数应清楚拒绝，或采用文档约定的默认行为，不能默默拼接。白名单只控制语法，还需限制能公开排序的字段，避免让客户端依据不该暴露的内部成本排序推断资料。后端不应相信前端下拉框，因为调用者可以直接修改 URL。",
        "usage": "适合列表可选排序、报表字段与其他会影响 SQL 结构的参数。",
        "mistakes": [
          "把 sort 原样拼到 SQL。",
          "以为下拉框选项能限制所有 API 调用者。"
        ],
        "takeaways": [
          "排序选项由服务器定义",
          "列名不能当普通值绑定",
          "稳定尾项支持分页"
        ],
        "refs": [
          {
            "label": "排序字段白名单 · 官方文档",
            "url": "https://www.psycopg.org/psycopg3/docs/api/sql.html"
          }
        ],
        "conceptId": "sort-field-whitelist"
      },
      {
        "id": "DB-012",
        "category": "database",
        "name": "多字段排序与空值",
        "type": "PostgreSQL ORDER BY",
        "level": "Beginner",
        "teaser": "同价格商品顺序飘动，或没有价格的草稿排在最前面，都会让列表难理解。",
        "problem": "同价格商品顺序飘动，或没有价格的草稿排在最前面，都会让列表难理解。排序必须定义并列和缺失值。",
        "mechanism": [
          "第一字段决定主要顺序。",
          "后续字段处理相同值。",
          "NULLS FIRST/LAST 明确空值位置。"
        ],
        "code": "SELECT id, name, price\nFROM product_previews\nORDER BY price ASC NULLS LAST, id ASC;\n-- product_previews 是练习视图，price 可为 NULL\n-- 原 products.price NOT NULL，不能直接插入 NULL 来模拟。",
        "language": "sql",
        "explanation": "这段假设已准备 price 可空的 product_previews 练习视图；前面正式商品表的 price 有 NOT NULL，不应为演示随意移除约束。多字段排序按从左到右比较，只有 price 相同才比较 id，因此唯一 ID 可让并列价格也具有确定顺序。NULL 代表未知或不适用，不是零元，NULLS LAST 可以让未定价草稿留在末尾。PostgreSQL 默认升序把 NULL 放后，降序则相反，因此显式声明能避免切换方向时产生意外。ORDER BY 不会改变资料本身，也不保证不同快照下分页绝不漏行：有人在两次请求之间改价，OFFSET 页边界仍可能移动。稳定排序解决并列的不确定性，并发分页则还有别的问题。",
        "usage": "适合价格、日期和可空字段的列表。选择空值位置应符合业务而非依赖默认。",
        "mistakes": [
          "把 NULL 当成数值零比较。",
          "只按不唯一价格排序就声称分页完全稳定。"
        ],
        "takeaways": [
          "排序按字段逐级比较",
          "NULL 位置可显式规定",
          "唯一尾项处理并列"
        ],
        "refs": [
          {
            "label": "多字段排序与空值 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/queries-order.html"
          }
        ],
        "conceptId": "multi-order-nulls"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "生成分享链接",
        "detail": "搜索、页码和排序进入 URL，特殊字符交给 API 编码。",
        "code": "?q=tea&page=1&sort=price_asc"
      },
      {
        "label": "02",
        "title": "规范化参数",
        "detail": "后端验证页码，排序名查固定映射。",
        "code": "price_asc → 固定 SQL"
      },
      {
        "label": "03",
        "title": "定义数据库顺序",
        "detail": "主排序、空值位置和唯一尾项一起声明。",
        "code": "price ASC NULLS LAST, id ASC"
      },
      {
        "label": "04",
        "title": "恢复页面",
        "detail": "刷新或返回后从 URL 重新得到查询条件。",
        "code": "URL → query state → list"
      }
    ],
    "summary": "可分享查询不只是把字符串放入地址栏，还包含参数验证、历史导航和确定的排序规则。",
    "challenge": {
      "duration": "15",
      "task": "为搜索词 tea & cake、页码 3 和价格升序生成 URL，再改搜索词并重置页码。",
      "criteria": [
        "特殊字符正确编码",
        "新搜索页码变为 1",
        "排序由白名单生成"
      ],
      "hint": "用 URLSearchParams，不要手写 & 拼接查询值。",
      "solution": "const p = new URLSearchParams({q:\"tea & cake\",page:\"3\",sort:\"price_asc\"});\np.set(\"q\",\"coffee\"); p.set(\"page\",\"1\");\n// q=coffee&page=1&sort=price_asc"
    },
    "preview": "明天减少连续输入产生的无用请求，并认识查询计划。"
  },
  {
    "number": 13,
    "title": "连续输入六个字，需要发六次请求吗？",
    "subtitle": "用防抖减少触发；外部服务要有超时；SQL 计划解释执行选择。",
    "minutes": "12",
    "objectives": [
      "搜索防抖",
      "HTTPX 请求与超时",
      "EXPLAIN 执行计划"
    ],
    "lessons": [
      {
        "id": "FE-013",
        "category": "frontend",
        "name": "搜索防抖",
        "type": "React 定时器与 Effect",
        "level": "Beginner",
        "teaser": "用户输入 coffee 的每个字母都触发搜索，会制造大量很快失去价值的请求。",
        "problem": "用户输入 coffee 的每个字母都触发搜索，会制造大量很快失去价值的请求。防抖等待输入短暂停顿再提交。",
        "mechanism": [
          "输入值立即更新供界面显示。",
          "定时器到期才更新查询值。",
          "每次输入与卸载时清除旧定时器。"
        ],
        "code": "import {useEffect,useState} from \"react\";\nfunction useDebounced(value, delay=300) {\n const [result,setResult] = useState(value);\n useEffect(()=>{\n  const timer=setTimeout(()=>setResult(value),delay);\n  return ()=>clearTimeout(timer);\n },[value,delay]);\n return result;\n}\n// const query = useDebounced(input, 300);\n// 用 query 请求，用 input 绑定输入框。",
        "language": "jsx",
        "explanation": "Hook 需要已有 React 项目，setTimeout 和 clearTimeout 来自浏览器。输入框仍立即显示每次键入，只把发请求所依据的 query 延后，避免界面出现打字迟钝。若用户在三百毫秒内继续输入，清理函数撤销旧定时器并重新计时；停顿足够长后才产生一次查询。防抖与节流不同：防抖等待安静间隔，节流限制持续事件的最高频率。它也不是正确性保护，已经发出去的旧请求仍可能晚到，必须保留上一课的清理或过期结果检查。三百毫秒是产品选择，不是通用最佳值，应按用户任务与反馈调整。此实验计算固定时间线的请求数，不把模拟间隔称为真实网络性能。",
        "usage": "适合搜索建议和较重筛选，不适合延迟支付确认或必须立即响应的操作。",
        "mistakes": [
          "把防抖值绑定输入框，造成输入滞后。",
          "以为减少请求数量就解决过期响应覆盖。"
        ],
        "takeaways": [
          "输入与查询值分开",
          "清理旧定时器",
          "防抖不代替请求时序保护"
        ],
        "refs": [
          {
            "label": "搜索防抖 · 官方文档",
            "url": "https://react.dev/reference/react/useEffect"
          }
        ],
        "conceptId": "debounce-search"
      },
      {
        "id": "BE-013",
        "category": "backend",
        "name": "HTTPX 请求与超时",
        "type": "Python 外部 HTTP 客户端",
        "level": "Beginner",
        "teaser": "商品接口依赖外部汇率或库存服务时，对方缓慢可能耗尽本服务资源。",
        "problem": "商品接口依赖外部汇率或库存服务时，对方缓慢可能耗尽本服务资源。必须明确等待边界和错误处理。",
        "mechanism": [
          "使用客户端上下文管理连接。",
          "设置连接与读取等阶段超时。",
          "检查 HTTP 状态并映射可理解的错误。"
        ],
        "code": "import httpx\nfrom fastapi import HTTPException\nasync def fetch_rates():\n    try:\n        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=1.0)) as client:\n            res = await client.get(\"https://example.com/rates\")\n            res.raise_for_status()\n            return res.json()\n    except httpx.TimeoutException:\n        raise HTTPException(504, \"Rates service timed out\")\n    except httpx.HTTPStatusError:\n        raise HTTPException(502, \"Rates service failed\")",
        "language": "python",
        "explanation": "片段需要 HTTPX 与已有异步 FastAPI 路由，example.com 是占位地址，不能当成可用汇率 API。AsyncClient 的上下文释放连接资源，await 允许等待 I/O 时交还事件循环。HTTPX 的超时区分连接、读取、写入与连接池等待；这里除连接一秒外默认五秒，不能把它理解成整个业务必定在五秒内结束，因为读取超时通常针对等待数据块等阶段。raise_for_status 将非成功 HTTP 响应转成可处理异常，超时则属于另一条分支。自动重试必须另外评估方法是否可安全重复，不能对支付类写入盲目重试。不要把外部响应的原始错误、凭证或内部地址直接回传客户端；其他网络和格式错误也应按应用契约处理。",
        "usage": "适合读取外部依赖；高频应用可共享受控客户端以复用连接，同时在应用结束时关闭。",
        "mistakes": [
          "认为 timeout=5 是所有阶段加起来的严格总时限。",
          "对非幂等外部写入自动无限重试。"
        ],
        "takeaways": [
          "外部调用需要等待边界",
          "HTTP 错误与超时不同",
          "重试要看副作用"
        ],
        "refs": [
          {
            "label": "HTTPX 请求与超时 · 官方文档",
            "url": "https://www.python-httpx.org/advanced/timeouts/"
          }
        ],
        "conceptId": "httpx-timeout"
      },
      {
        "id": "DB-013",
        "category": "database",
        "name": "EXPLAIN 执行计划",
        "type": "PostgreSQL 查询分析",
        "level": "Beginner",
        "teaser": "看到慢查询就加索引容易浪费空间。",
        "problem": "看到慢查询就加索引容易浪费空间。先看规划器打算扫描什么、返回多少行，再决定优化方向。",
        "mechanism": [
          "EXPLAIN 展示估计执行计划。",
          "阅读扫描节点、条件与估计行数。",
          "ANALYZE 会真正执行，需要明确安全范围。"
        ],
        "code": "EXPLAIN\nSELECT id, name, price\nFROM products\nWHERE price < 20\nORDER BY price, id;\n\n-- 在独立练习库才考虑：\n-- EXPLAIN (ANALYZE, BUFFERS) SELECT ...;",
        "language": "sql",
        "explanation": "在 PostgreSQL 已准备的练习表上执行只读 EXPLAIN，不要把别人的计划数字当作本机测量。Seq Scan 表示逐行检查，Index Scan 表示借助索引定位，Sort 表示还需要排序步骤；节点的 cost 是规划器的相对成本单位，不是毫秒。rows 是估计行数，取决于统计信息与条件选择性，表很小或返回大部分资料时顺序扫描可能合理。普通 EXPLAIN 不运行查询，而 EXPLAIN ANALYZE 会真实执行并报告实际时间与行数，对写入语句同样会产生副作用，不能随意用于生产修改。先确认参数、数据量、索引与统计信息，再比较估计和实际差异。防抖减少接口调用次数，但每条 SQL 是否高效仍需单独检查。",
        "usage": "适合定位扫描、排序与估计偏差；先保持查询结果正确，再讨论性能。",
        "mistakes": [
          "把 cost 当成实际毫秒。",
          "用 ANALYZE 执行修改语句却以为只是预览。"
        ],
        "takeaways": [
          "先读计划再优化",
          "估计不等于实测",
          "ANALYZE 会执行语句"
        ],
        "refs": [
          {
            "label": "EXPLAIN 执行计划 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/using-explain.html"
          }
        ],
        "conceptId": "explain-plan-intro"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "输入事件到来",
        "detail": "记录每次输入时间，输入框立即更新。",
        "code": "0ms:c, 100ms:co, 200ms:cof"
      },
      {
        "label": "02",
        "title": "等待安静间隔",
        "detail": "新事件清除旧定时器，只保留最后一次等待。",
        "code": "clearTimeout(previous)"
      },
      {
        "label": "03",
        "title": "保护外部调用",
        "detail": "若接口依赖外部服务，明确超时与错误映射。",
        "code": "HTTPX connect=1s, read=5s"
      },
      {
        "label": "04",
        "title": "检查 SQL 计划",
        "detail": "请求变少后仍需确认每次查询的执行路径。",
        "code": "EXPLAIN SELECT ..."
      }
    ],
    "summary": "防抖控制触发频率，超时控制依赖等待，EXPLAIN 解释数据库计划。它们改善不同问题，不能互相替代。",
    "challenge": {
      "duration": "15",
      "task": "用输入时间 0、100、200、700ms 比较 300ms 防抖和每字请求，写出实际触发时间。",
      "criteria": [
        "无防抖共 4 次",
        "防抖共 2 次",
        "触发在 500ms 与 1000ms"
      ],
      "hint": "相邻输入间隔达到等待值时，前一个定时器已经有机会触发。",
      "solution": "// 0→100→200 连续重置，200+300=500ms 触发\n// 700ms 再输入，700+300=1000ms 触发\n// 合计 2 次；已发请求仍需过期保护。"
    },
    "preview": "明天用 reducer 与分层结构整理复杂新增逻辑。"
  },
  {
    "number": 14,
    "title": "表单、业务和数据库，应该各管什么？",
    "subtitle": "用 reducer 描述界面事件，用 Service 与 Repository 分开规则和存储。",
    "minutes": "12",
    "objectives": [
      "useReducer 管理表单",
      "Service 与 Repository",
      "SQLAlchemy 表映射"
    ],
    "lessons": [
      {
        "id": "FE-014",
        "category": "frontend",
        "name": "useReducer 管理表单",
        "type": "React 状态机式更新",
        "level": "Intermediate",
        "teaser": "表单同时有字段、提交中和错误，多处分散 setState 容易让成功与失败状态互相矛盾。",
        "problem": "表单同时有字段、提交中和错误，多处分散 setState 容易让成功与失败状态互相矛盾。reducer 用事件集中描述转换。",
        "mechanism": [
          "定义初始状态和事件名称。",
          "纯 reducer 根据旧状态返回新状态。",
          "异步请求在外层执行，再 dispatch 结果。"
        ],
        "code": "import {useReducer} from \"react\";\nconst initial={name:\"\",status:\"idle\",error:\"\"};\nfunction reducer(state,action) {\n switch(action.type) {\n  case \"edit\": return {...state,name:action.value,error:\"\"};\n  case \"submit\": return {...state,status:\"saving\",error:\"\"};\n  case \"failed\": return {...state,status:\"idle\",error:action.message};\n  case \"saved\": return initial;\n  default: return state;\n }\n}\n// const [state,dispatch]=useReducer(reducer,initial);",
        "language": "jsx",
        "explanation": "在已有 React 页面中引入 reducer，注释中的 useReducer 要写在组件或自定义 Hook 顶层，不能直接放在模块顶层执行。reducer 是纯函数，不发请求、不读 DOM，也不直接修改传入 state，因此相同旧状态和事件会得到可预测的新状态。异步保存由提交处理函数完成：先 dispatch submit，再根据结果发 saved 或 failed。status=\"saving\" 可统一控制按钮禁用与等待文案，避免一边显示成功一边仍处于加载。表单简单时 useState 更直观，只有事件和关联更新变多才值得集中管理。示例没有防止所有非法转换，正式需求若禁止保存中编辑，应在交互或 reducer 规则里明确处理，不能指望事件命名自动保证状态机正确。",
        "usage": "适合多字段、多阶段和撤销等关联交互；简单两个输入不一定需要 reducer。",
        "mistakes": [
          "在 reducer 内发 fetch 或修改原对象。",
          "把 Hook 放到组件外直接执行。"
        ],
        "takeaways": [
          "事件描述发生了什么",
          "reducer 保持纯净",
          "副作用留在外层"
        ],
        "refs": [
          {
            "label": "useReducer 管理表单 · 官方文档",
            "url": "https://react.dev/learn/extracting-state-logic-into-a-reducer"
          }
        ],
        "conceptId": "form-reducer-events"
      },
      {
        "id": "BE-014",
        "category": "backend",
        "name": "Service 与 Repository",
        "type": "后端职责分层",
        "level": "Intermediate",
        "teaser": "同一条新增规则同时写在路由和脚本里，会很快出现不一致。",
        "problem": "同一条新增规则同时写在路由和脚本里，会很快出现不一致。把业务规则与保存细节分开，才能复用并独立验证。",
        "mechanism": [
          "路由负责 HTTP 输入输出。",
          "Service 执行业务约束与流程。",
          "Repository 执行查询和持久化。"
        ],
        "code": "class ProductService:\n    def __init__(self, repo):\n        self.repo = repo\n    def create(self, name, price):\n        clean = name.strip()\n        if not clean:\n            raise ValueError(\"Name is required\")\n        return self.repo.insert(name=clean, price=price)\n\n# 路由：验证请求 → service.create(...) → 响应模型\n# Repository：参数化 INSERT RETURNING；不产生 HTTPException。",
        "language": "python",
        "explanation": "这是普通 Python 的结构片段，repo 由调用者提供，必须实现 insert 方法；示例没有实际连接数据库。Service 关注商品业务，例如规范化名称和检查售价策略，Repository 只知道如何按接口保存与读取。路由把业务错误映射到 HTTP 状态，因此命令行任务可以复用 Service 而无需依赖 Web 框架。分层不是每个函数都必须套三层类；若逻辑只有一条读取，过度抽象反而增加跳转。事务边界尤其要先约定：创建订单涉及多次 Repository 调用时，应由外层工作单元包住，不要每次 insert 自行提交，否则中途失败无法整体回滚。依赖通过构造函数传入，还能在本地测试中使用内存 Repository，清楚区分模拟与真实存储。",
        "usage": "适合业务逐渐复杂或同一规则由 API 与任务复用的项目。",
        "mistakes": [
          "Repository 自行决定所有事务提交，使跨步骤业务失去原子性。",
          "把 HTTPException 带进纯业务服务。"
        ],
        "takeaways": [
          "路由处理协议",
          "Service 处理规则",
          "Repository 处理存储"
        ],
        "refs": [
          {
            "label": "Service 与 Repository · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/bigger-applications/"
          }
        ],
        "conceptId": "service-repository-boundary"
      },
      {
        "id": "DB-014",
        "category": "database",
        "name": "SQLAlchemy 表映射",
        "type": "Python ORM 与关系模型",
        "level": "Intermediate",
        "teaser": "手动把每行字典转对象会重复。",
        "problem": "手动把每行字典转对象会重复。ORM 映射让 Python 类对应表，但不能让数据库规则和查询成本消失。",
        "mechanism": [
          "DeclarativeBase 声明映射基类。",
          "Mapped 与 mapped_column 描述字段。",
          "Session 执行 select 并管理对象状态。"
        ],
        "code": "from sqlalchemy import String, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\nclass Base(DeclarativeBase): pass\nclass Product(Base):\n    __tablename__ = \"products\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    name: Mapped[str] = mapped_column(String(80))\n# session 是外层已创建的 SQLAlchemy Session\n# items = session.scalars(select(Product).order_by(Product.id)).all()",
        "language": "python",
        "explanation": "片段采用 SQLAlchemy 2.x 的映射写法，只映射演示需要的 id 和 name；已有 products 表可包含其他有默认值的字段，但写入时必须满足真实表约束。Base 是映射注册的基类，不是数据库连接，Session 也不是永久全局字典；它负责当前工作单元中的对象与数据库交互。select(Product) 产生查询描述，真正执行发生在 session.scalars 等调用时。ORM 帮助对象转换，仍会生成 SQL，因此要继续理解 WHERE、JOIN、索引和事务。定义 Python 模型不会自动把已有数据库升级到新结构，生产结构变更应通过明确迁移。代码只展示读取上下文，不调用 create_all 或连接真实服务，也不意味着表已建立。",
        "usage": "适合关系数据的对象化操作；报表或复杂查询仍可能直接使用 SQL/Core 表达式。",
        "mistakes": [
          "以为修改 Python 字段就自动完成数据库迁移。",
          "把同一个 Session 作为所有请求共享的全局对象。"
        ],
        "takeaways": [
          "映射连接类与表",
          "执行时才访问数据库",
          "ORM 不消除 SQL 成本"
        ],
        "refs": [
          {
            "label": "SQLAlchemy 表映射 · 官方文档",
            "url": "https://docs.sqlalchemy.org/en/20/orm/quickstart.html"
          }
        ],
        "conceptId": "sqlalchemy-table-mapping"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "界面发出事件",
        "detail": "reducer 将 submit 变为 saving 状态。",
        "code": "dispatch({type:\"submit\"})"
      },
      {
        "label": "02",
        "title": "路由解释协议",
        "detail": "输入模型验证请求，把业务异常映射为 HTTP。",
        "code": "HTTP → ProductIn"
      },
      {
        "label": "03",
        "title": "服务执行规则",
        "detail": "Service 规范化名称并调用存储接口。",
        "code": "service.create(name, price)"
      },
      {
        "label": "04",
        "title": "存储映射资料",
        "detail": "Repository 使用 Session 写入，外层控制事务。",
        "code": "Session → mapped Product"
      }
    ],
    "summary": "前端 reducer 管状态转换，后端分层管职责，ORM 管对象映射。清楚的边界比类和文件的数量更重要。",
    "challenge": {
      "duration": "15",
      "task": "把“去掉名称两端空格、发送 422、INSERT 商品、禁用保存按钮”四项任务分给合适层。",
      "criteria": [
        "业务规范化属于 Service",
        "HTTP 状态属于路由",
        "SQL 属于 Repository，按钮属于前端"
      ],
      "hint": "先问任务是否依赖 HTTP 或数据库细节，再决定归属。",
      "solution": "// Frontend: saving 时禁用按钮\n// Router: 将输入/业务失败映射为 422\n// Service: name.strip() 与业务验证\n// Repository: INSERT RETURNING；外层控制 commit"
    },
    "preview": "明天通过依赖注入管理资源，并识别 N+1 查询。"
  },
  {
    "number": 15,
    "title": "列表只有十行，为什么发了十一条 SQL？",
    "subtitle": "Context 传少量共享值，Depends 管请求资源，预加载控制关联查询。",
    "minutes": "12",
    "objectives": [
      "Context 共享跨层状态",
      "Depends 与资源生命周期",
      "ORM 关联与 N+1"
    ],
    "lessons": [
      {
        "id": "FE-015",
        "category": "frontend",
        "name": "Context 共享跨层状态",
        "type": "React Context API",
        "level": "Intermediate",
        "teaser": "主题或当前币种需要穿过很多层组件，逐层传递会让无关中间组件承担参数转送。",
        "problem": "主题或当前币种需要穿过很多层组件，逐层传递会让无关中间组件承担参数转送。Context 可以提供明确共享范围。",
        "mechanism": [
          "创建带默认值的 Context。",
          "在合适父层提供实际值。",
          "消费组件通过 useContext 读取最近 Provider。"
        ],
        "code": "import {createContext,useContext} from \"react\";\nconst CurrencyContext=createContext(\"MYR\");\nfunction Price({amount}) {\n const currency=useContext(CurrencyContext);\n return <span>{new Intl.NumberFormat(\"zh-CN\",{style:\"currency\",currency}).format(amount)}</span>;\n}\nexport default function Demo() {\n return <CurrencyContext.Provider value=\"MYR\">\n  <Price amount={12.5}/>\n </CurrencyContext.Provider>;\n}",
        "language": "jsx",
        "explanation": "在已有 React 项目中使用这个演示，Provider 写法适用于常见 React 版本。Context 传递的是值的读取渠道，不会自己保存或更新状态；需要切换币种时仍应由父层 useState 拥有值，再通过 Provider 提供。消费组件读取最近的 Provider，因此不同页面区域可以有不同范围。默认值只在找不到 Provider 时使用，不是 Provider 值更新失败后的备用方案。这里格式化 MYR 只是显示币种，不执行汇率换算，更不能把数字十二点五自动当成等值外币。Context 的值变化会影响消费者，若把频繁变化的大对象全塞进去可能扩大重渲染范围。适合主题、币种等少量跨层状态，商品列表的服务端缓存有不同生命周期，不应顺手全部搬入。",
        "usage": "适合主题、语言和小范围共享配置；不要为消除一两次 Props 传递引入全局状态。",
        "mistakes": [
          "以为 Context 自动提供状态管理或汇率换算。",
          "每次渲染构造巨大共享对象导致不必要更新。"
        ],
        "takeaways": [
          "Context 提供读取渠道",
          "共享范围由 Provider 决定",
          "高频大数据需谨慎"
        ],
        "refs": [
          {
            "label": "Context 共享跨层状态 · 官方文档",
            "url": "https://react.dev/learn/passing-data-deeply-with-context"
          }
        ],
        "conceptId": "context-small-shared-state"
      },
      {
        "id": "BE-015",
        "category": "backend",
        "name": "Depends 与资源生命周期",
        "type": "FastAPI 依赖注入",
        "level": "Intermediate",
        "teaser": "每个路由都手写连接打开关闭，容易漏掉异常路径。",
        "problem": "每个路由都手写连接打开关闭，容易漏掉异常路径。依赖函数能统一资源建立、注入与收尾。",
        "mechanism": [
          "依赖进入时创建 Session。",
          "yield 把资源提供给路由。",
          "离开依赖时关闭，不吞掉异常。"
        ],
        "code": "from typing import Annotated\nfrom fastapi import Depends\nfrom sqlalchemy.orm import Session\nfrom sqlalchemy import select\n# engine 与 Product 由项目数据库模块提供\ndef get_session():\n    with Session(engine) as session:\n        yield session\n\n# @app.get(\"/products\")\ndef list_products(session: Annotated[Session, Depends(get_session)]):\n    return session.scalars(select(Product).order_by(Product.id)).all()",
        "language": "python",
        "explanation": "片段需要项目已有 engine、Product 与 app，注释掉的装饰器在集成到路由模块时启用。Depends 声明当前函数需要什么资源，FastAPI 在请求流程中调用依赖并传入 Session；yield 后的清理由框架安排。Session 上下文负责关闭资源，但此示例只读取，不暗示所有写入都会自动提交。写入应明确事务边界，并在异常时让异常继续传播，避免吞掉错误后返回成功。带 yield 依赖的精确清理时点在 FastAPI 不同版本与 scope 选择中有差异，流式响应与后台任务尤其要对照当前版本；不要把请求 Session 交给独立后台任务长期使用。依赖注入也方便测试时替换为本地资源，但替换测试不能证明真实数据库可用。",
        "usage": "适合数据库 Session、请求上下文和权限依赖；不同生命周期资源应分别管理。",
        "mistakes": [
          "在依赖中捕获异常后不重新抛出。",
          "把请求 Session 交给请求结束后的后台任务。"
        ],
        "takeaways": [
          "依赖声明资源需求",
          "yield 配合确定收尾",
          "关闭不等于自动提交"
        ],
        "refs": [
          {
            "label": "Depends 与资源生命周期 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/"
          }
        ],
        "conceptId": "depends-session-lifecycle"
      },
      {
        "id": "DB-015",
        "category": "database",
        "name": "ORM 关联与 N+1",
        "type": "SQLAlchemy 关联加载策略",
        "level": "Intermediate",
        "teaser": "读取十件商品后逐件访问分类，可能额外触发十次查询。",
        "problem": "读取十件商品后逐件访问分类，可能额外触发十次查询。对象访问看起来简单，却隐藏了数据库往返。",
        "mechanism": [
          "懒加载在访问关联时查询。",
          "N+1 指主查询后又出现重复关联查询。",
          "selectinload 批量预加载所需关联。"
        ],
        "code": "from sqlalchemy import select\nfrom sqlalchemy.orm import selectinload\n# Product.category 已通过 relationship 映射\nstmt = (select(Product)\n        .options(selectinload(Product.category))\n        .order_by(Product.id))\nproducts = session.scalars(stmt).all()\nfor p in products:\n    print(p.name, p.category.name if p.category else \"未分类\")",
        "language": "python",
        "explanation": "片段采用 SQLAlchemy 2.x，需要已配置 relationship 的 Product.category 和有效 Session。普通懒加载在访问 p.category 时才查询，如果多个对象指向不同、尚未加载的分类，就容易出现一条商品查询加多条分类查询。实际次数受 Session 身份映射与重复关联影响，并不保证每次都严格 N+1。selectinload 先读商品，再以批量 IN 查询预取分类，减少逐行往返；资料很多时可能分批，所以也不能承诺永远只有两条 SQL。joinedload 是另一种策略，但集合关联会扩张行数并需要处理去重。选择应依据关系基数、返回规模和实际 SQL 观察，不要把所有关联一律预加载。关闭 Session 后才序列化未加载关系，还可能触发访问失败。",
        "usage": "适合列表响应需要关联字段的情况；只返回商品名称时无需加载完整分类对象。",
        "mistakes": [
          "看到 ORM 对象就以为关联资料已在内存。",
          "把 selectinload 说成任何规模都固定两条查询。"
        ],
        "takeaways": [
          "属性访问可能触发 SQL",
          "预加载需按读取需求选择",
          "查询次数依赖数据与策略"
        ],
        "refs": [
          {
            "label": "ORM 关联与 N+1 · 官方文档",
            "url": "https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html"
          }
        ],
        "conceptId": "orm-n-plus-one"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "提供共享显示配置",
        "detail": "Context 提供币种，不承担数据库缓存。",
        "code": "CurrencyContext → MYR"
      },
      {
        "label": "02",
        "title": "为请求注入资源",
        "detail": "Depends 建立本次读取使用的 Session。",
        "code": "yield session"
      },
      {
        "label": "03",
        "title": "批量读取关联",
        "detail": "商品列表需要分类时显式选择预加载。",
        "code": "selectinload(Product.category)"
      },
      {
        "label": "04",
        "title": "完成并释放",
        "detail": "序列化所需资料后结束资源生命周期。",
        "code": "Session.close()"
      }
    ],
    "summary": "共享 UI 配置、请求资源和关联加载有不同生命周期。先明确读取范围，再控制资源与查询次数。",
    "challenge": {
      "duration": "15",
      "task": "准备 5 件商品分别引用 5 个不同分类，画出懒加载与批量预加载的查询序列，并说明共享分类时次数为何可能减少。",
      "criteria": [
        "示例懒加载最多 1+5 次",
        "小数据 select-in 示例为 2 次",
        "明确不是所有数据固定此次数"
      ],
      "hint": "只对尚未存在于 Session 中的关联计算额外懒加载。",
      "solution": "// 假设分类均不同且未加载\n// lazy: SELECT products + 5 × SELECT category WHERE id=?\n// select-in: SELECT products + SELECT categories WHERE id IN (...)\n// 重复分类可被 Session 身份映射复用。"
    },
    "preview": "明天增加详情路由，并用迁移记录结构变化。"
  },
  {
    "number": 16,
    "title": "详情网址和数据库结构，怎样一起演进？",
    "subtitle": "浏览器路由处理页面，APIRouter 组织接口，Alembic 记录结构版本。",
    "minutes": "12",
    "objectives": [
      "React Router 详情导航",
      "APIRouter 与版本路径",
      "Alembic 数据库迁移"
    ],
    "lessons": [
      {
        "id": "FE-016",
        "category": "frontend",
        "name": "React Router 详情导航",
        "type": "客户端路由",
        "level": "Intermediate",
        "teaser": "用户从列表进入详情后，应能复制网址、刷新和返回。",
        "problem": "用户从列表进入详情后，应能复制网址、刷新和返回。仅用布尔值切换画面无法表达当前商品身份。",
        "mechanism": [
          "BrowserRouter 观察地址导航。",
          "Route 用动态片段匹配商品 ID。",
          "Link 进行站内导航，详情组件读取参数。"
        ],
        "code": "import {BrowserRouter,Routes,Route,Link,useParams} from \"react-router\";\nfunction Detail() {\n const {productId}=useParams();\n return <h1>商品 {productId}</h1>;\n}\nexport default function App() {\n return <BrowserRouter><Link to=\"/products/2\">Tea</Link>\n <Routes><Route path=\"/products/:productId\" element={<Detail/>}/>\n <Route path=\"*\" element={<p>找不到页面</p>}/></Routes>\n </BrowserRouter>;\n}",
        "language": "jsx",
        "explanation": "示例采用 React Router 的声明式模式及 react-router 包导入，需项目预先安装兼容版本；旧版 react-router-dom 项目应按自身版本导入，不要混用示例。动态参数 productId 是字符串，只代表 URL 内容，详情读取前仍需验证与编码。Link 提供站内导航语义，让浏览器支持打开新页等常见操作，优于给普通 div 加点击。客户端路由只决定显示什么组件，服务器详情接口仍负责资料与权限。BrowserRouter 刷新深层路径时，静态托管需将页面路径回退到入口 HTML，否则直接打开 /products/2 可能由服务器返回 404。通配 Route 的找不到页面也不同于商品接口查不到某个 ID，两个层次应有各自提示。",
        "usage": "适合可分享详情、嵌套页面与浏览历史导航；简单页内展开不必都改成路由。",
        "mistakes": [
          "把路由参数当成可信数字或授权证据。",
          "本地点击正常就以为刷新深层网址一定正常。"
        ],
        "takeaways": [
          "URL 表达当前资源",
          "Link 具有导航语义",
          "部署需处理入口回退"
        ],
        "refs": [
          {
            "label": "React Router 详情导航 · 官方文档",
            "url": "https://reactrouter.com/start/declarative/routing"
          }
        ],
        "conceptId": "router-detail-navigation"
      },
      {
        "id": "BE-016",
        "category": "backend",
        "name": "APIRouter 与版本路径",
        "type": "FastAPI 模块化路由",
        "level": "Intermediate",
        "teaser": "所有商品、订单接口挤在一个文件里难维护。",
        "problem": "所有商品、订单接口挤在一个文件里难维护。APIRouter 将模块组织与对外路径组合分开。",
        "mechanism": [
          "模块用 APIRouter 声明局部路由。",
          "主应用 include_router 组合前缀。",
          "版本前缀用于契约演进而非复制所有逻辑。"
        ],
        "code": "from fastapi import APIRouter, FastAPI\nproducts = APIRouter(prefix=\"/products\", tags=[\"products\"])\n@products.get(\"/{product_id}\")\ndef detail(product_id: int):\n    return {\"id\":product_id,\"status\":\"draft\"}\napp = FastAPI()\napp.include_router(products, prefix=\"/v1\")\n# 最终路径 /v1/products/{product_id}；示例响应不查数据库。",
        "language": "python",
        "explanation": "这是单文件可读的组织示例，实际项目可把 products router 放进独立模块，再由入口组合。局部路径、router 前缀和 include_router 前缀会拼成最终 URL，先画清楚组合，避免出现 /v1/v1/products 之类重复。tags 主要服务于 OpenAPI 文档分组，不改变访问权限。版本前缀帮助表达不兼容契约，例如字段含义变化，但并不要求每次新增可选字段都创建一个新版本，也不应复制整套 Service 与 Repository。多个版本可以共享业务逻辑，在路由边界做输入输出适配。示例直接返回 ID 和状态只是演示模块，不是真实详情；接入存储后仍需 404、响应模型和权限检查。目录结构的目标是让职责容易定位，而不是增加抽象数量。",
        "usage": "适合多个业务模块、共享依赖与明确版本接口。对外版本策略应由兼容需求决定。",
        "mistakes": [
          "以为 tags 自动实施权限隔离。",
          "版本前缀在模块和入口重复添加。"
        ],
        "takeaways": [
          "Router 组织相关接口",
          "最终路径由前缀组合",
          "版本用于契约兼容"
        ],
        "refs": [
          {
            "label": "APIRouter 与版本路径 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/bigger-applications/"
          }
        ],
        "conceptId": "api-router-version-path"
      },
      {
        "id": "DB-016",
        "category": "database",
        "name": "Alembic 数据库迁移",
        "type": "SQLAlchemy 结构版本管理",
        "level": "Intermediate",
        "teaser": "给商品增加 status 字段时，修改 ORM 类不会改变已有数据库。",
        "problem": "给商品增加 status 字段时，修改 ORM 类不会改变已有数据库。迁移脚本让结构变化可审查、可追踪。",
        "mechanism": [
          "新 revision 记录相邻版本。",
          "upgrade 定义前进变化，downgrade 明确回退影响。",
          "在练习库检查现有数据与新旧代码兼容。"
        ],
        "code": "from alembic import op\nimport sqlalchemy as sa\n# 放进 alembic revision 生成的文件，保留其 revision 标识\ndef upgrade():\n    op.add_column(\"products\", sa.Column(\n        \"status\", sa.String(20), nullable=False, server_default=\"draft\"))\ndef downgrade():\n    op.drop_column(\"products\", \"status\")\n# downgrade 会丢弃状态资料，不可把它视为无损撤销。",
        "language": "python",
        "explanation": "片段需已经初始化 Alembic、配置 SQLAlchemy metadata 与独立练习数据库；revision 和 down_revision 由项目生成文件提供。新增非空字段要考虑现有行，本例给 server_default=\"draft\"，让旧资料也拥有值。默认值会继续作用于以后省略字段的写入，是否长期保留需按产品约定决定。自动生成的迁移只是差异草稿，可能无法理解重命名与资料转换，必须人工审查。downgrade 删除列会丢失该列资料，因此能回退结构不等于能恢复业务数据。大型表的锁、重写成本和滚动发布兼容也需要单独评估。先检查 alembic current 与目标环境，再在可恢复练习库运行升级验证，不能把改模型文件当成迁移已经执行。",
        "usage": "适合团队协作和结构版本追踪；真实发布仍需环境确认、备份及兼容方案。",
        "mistakes": [
          "不审查自动生成脚本就直接运行。",
          "认为 downgrade 总是无损。"
        ],
        "takeaways": [
          "模型声明不同于迁移执行",
          "旧行需要补值策略",
          "结构回退可能丢数据"
        ],
        "refs": [
          {
            "label": "Alembic 数据库迁移 · 官方文档",
            "url": "https://alembic.sqlalchemy.org/en/latest/tutorial.html"
          }
        ],
        "conceptId": "alembic-schema-migration"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "页面定位商品",
        "detail": "浏览器动态路由得到 productId 字符串。",
        "code": "/products/2 → useParams()"
      },
      {
        "label": "02",
        "title": "API 组合路径",
        "detail": "产品模块挂到 v1 前缀，契约路径清楚可查。",
        "code": "/v1 + /products + /{id}"
      },
      {
        "label": "03",
        "title": "准备结构版本",
        "detail": "新增 status 时为已有行定义默认值。",
        "code": "ADD status DEFAULT draft NOT NULL"
      },
      {
        "label": "04",
        "title": "检查兼容边界",
        "detail": "新旧代码都能读取升级后的结构，再开放界面字段。",
        "code": "revision → review → test DB"
      }
    ],
    "summary": "页面路由、API 版本和数据库迁移管理不同形式的演进。链接可用不代表接口存在，模型有字段也不代表数据库已升级。",
    "challenge": {
      "duration": "15",
      "task": "为已有 Coffee 和 Tea 规划 status 新字段：写出迁移前后资料，并说明删除列回退会丢什么。",
      "criteria": [
        "两行旧商品都得到 draft",
        "旧版本读取不依赖新字段",
        "明确回退会丢失状态资料"
      ],
      "hint": "把结构变化和数据内容分别写出来，勿把 downgrade 当备份。",
      "solution": "// before: {id:1,name:\"Coffee\"}, {id:2,name:\"Tea\"}\n// after: 每行新增 status:\"draft\"\n// old SELECT id,name 仍可读；drop status 后原有状态无法靠结构恢复。"
    },
    "preview": "明天比较浏览器查询缓存、HTTP 缓存和组合索引。"
  },
  {
    "number": 17,
    "title": "同一份商品资料，为什么会有不同的缓存？",
    "subtitle": "区分 Server State、HTTP 新鲜度和数据库访问路径。",
    "minutes": "12",
    "objectives": [
      "TanStack Query 与 Server State",
      "HTTP Cache-Control",
      "组合索引与列顺序"
    ],
    "lessons": [
      {
        "id": "FE-017",
        "category": "frontend",
        "name": "TanStack Query 与 Server State",
        "type": "远程状态缓存库",
        "level": "Intermediate",
        "teaser": "详情离开再回来时，不一定需要重新显示完整加载画面。",
        "problem": "详情离开再回来时，不一定需要重新显示完整加载画面。远程资料有自己的新鲜度、错误和刷新生命周期。",
        "mechanism": [
          "QueryClientProvider 提供共享客户端。",
          "queryKey 标识资料身份与参数。",
          "useQuery 管理缓存、等待和后台刷新。"
        ],
        "code": "import {QueryClient,QueryClientProvider,useQuery} from \"@tanstack/react-query\";\nconst client=new QueryClient();\nfunction Products() {\n const query=useQuery({queryKey:[\"products\"], staleTime:30000,\n  queryFn:async()=>{const r=await fetch(\"/api/products\");\n   if(!r.ok) throw new Error(`HTTP ${r.status}`);return r.json();}});\n if(query.isPending) return <p>加载中</p>;\n if(query.isError) return <p>读取失败</p>;\n return <p>{query.data.items.length} 件商品</p>;\n}\nexport default function App(){return <QueryClientProvider client={client}><Products/></QueryClientProvider>;}",
        "language": "jsx",
        "explanation": "示例采用 TanStack Query v5，需已有 React 项目及对应依赖。QueryClient 在组件外建立，避免每次渲染都丢失缓存；服务端渲染项目则需要隔离每个请求的客户端，不能直接共享用户资料。queryKey 是缓存身份，查询有分类或搜索参数时必须一起加入，否则不同条件会误用同一份结果。staleTime 三十秒表示这段时间认为缓存仍新鲜，并不是每三十秒自动轮询，也不是服务器承诺资料不会变化。后台刷新时 data 可以继续存在，isFetching 与首次 isPending 应区分。表单输入仍属于本地 UI State，不必全部搬进查询库。缓存改善读取体验，不能成为权限、交易一致性或资料永久保存的保证。",
        "usage": "适合跨页面远程资料复用、刷新与错误管理；短暂输入和弹窗状态仍保留本地。",
        "mistakes": [
          "遗漏筛选条件导致缓存身份混用。",
          "把 staleTime 当作定时器或真实数据有效期。"
        ],
        "takeaways": [
          "Query Key 决定缓存身份",
          "新鲜度不等于轮询",
          "UI State 与 Server State 分开"
        ],
        "refs": [
          {
            "label": "TanStack Query 与 Server State · 官方文档",
            "url": "https://tanstack.com/query/latest/docs/framework/react/guides/caching"
          }
        ],
        "conceptId": "query-server-state"
      },
      {
        "id": "BE-017",
        "category": "backend",
        "name": "HTTP Cache-Control",
        "type": "HTTP 响应缓存策略",
        "level": "Intermediate",
        "teaser": "API 返回后浏览器或代理是否能复用响应，应由明确缓存头控制，不能只靠前端库的缓存设置。",
        "problem": "API 返回后浏览器或代理是否能复用响应，应由明确缓存头控制，不能只靠前端库的缓存设置。",
        "mechanism": [
          "public/private 决定共享缓存资格。",
          "max-age 表达新鲜秒数。",
          "no-cache 要求复用前验证，no-store 禁止存储。"
        ],
        "code": "from fastapi import FastAPI, Response\napp=FastAPI()\n@app.get(\"/public/categories\")\ndef categories(response: Response):\n    response.headers[\"Cache-Control\"]=\"public, max-age=60\"\n    return {\"items\":[{\"id\":1,\"name\":\"Drinks\"}]}\n# 个性化敏感响应可用 Cache-Control: no-store\n# no-cache 允许存储，但复用前必须验证。",
        "language": "python",
        "explanation": "此例只对公开且相同的分类资料设置共享缓存，不能直接套用到登录用户订单。max-age 六十秒表示响应在协议规则下可被认为新鲜，期间服务器资料更新不会自动通知所有缓存。private 允许用户自己的缓存存储，但阻止共享代理按通常规则复用；no-store 更适合不应保存的敏感内容。no-cache 名称容易误导，它不等于禁止存储，而是复用前需要向服务端验证，通常配合 ETag 或 Last-Modified。前端 TanStack Query 的内存缓存是另一层，设置 HTTP 头不会自动清掉它，反过来也一样。退出登录或用户切换要额外处理应用缓存隔离。本文仅提供响应头示例，没有测量任何 CDN 命中率或实际请求节省。",
        "usage": "适合公开低频变化资料和敏感响应的明确策略；动态权限资料要谨慎使用共享缓存。",
        "mistakes": [
          "把 no-cache 解释成完全不存储。",
          "把用户订单标成 public 导致共享泄漏。"
        ],
        "takeaways": [
          "HTTP 缓存独立于前端库",
          "public 只用于可共享内容",
          "no-cache 与 no-store 不同"
        ],
        "refs": [
          {
            "label": "HTTP Cache-Control · 官方文档",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control"
          }
        ],
        "conceptId": "http-cache-control"
      },
      {
        "id": "DB-017",
        "category": "database",
        "name": "组合索引与列顺序",
        "type": "PostgreSQL 多列 B-tree",
        "level": "Intermediate",
        "teaser": "常见查询先限定分类，再按价格取前几件。",
        "problem": "常见查询先限定分类，再按价格取前几件。两个独立索引不一定能像一个合适组合索引那样支持这个顺序。",
        "mechanism": [
          "按主要相等条件安排前导列。",
          "后续列配合范围与排序。",
          "对具体查询用 EXPLAIN 验证实际选择。"
        ],
        "code": "CREATE INDEX products_category_price_id_idx\nON products (category_id, price, id);\n\nSELECT id, name, price FROM products\nWHERE category_id = 2\nORDER BY price ASC, id ASC\nLIMIT 10;\n-- 前提：已有 category_id；只在练习库创建候选索引。",
        "language": "sql",
        "explanation": "组合索引可以理解为先按分类排组，再在组内按价格与 ID 排序。本例固定 category_id=2，因此该分类范围内的键顺序与 ORDER BY 一致，可能减少额外扫描与排序。不是字段越多越好，索引仍占空间、增加写入维护成本，而且规划器可以选择不同路径。也不要背成“没有最左列条件就绝对不能使用”：PostgreSQL 可在某些分布与版本下采用跳跃扫描等优化，但前导列相等条件通常更容易有效缩小扫描范围。若查询完全不筛分类而要全站最低价，这个列顺序未必最合适。真实选择依赖数据分布、排序方向、返回数量与统计信息；练习只比较排列后的候选范围，不能声称测出实际数据库延迟。",
        "usage": "适合稳定高频的筛选加排序模式；应依据真实查询组合设计少量索引。",
        "mistakes": [
          "认为任意列顺序效果相同。",
          "把最左前缀经验说成绝对无法使用的规则。"
        ],
        "takeaways": [
          "列顺序对应查询形状",
          "相等前导列缩小范围",
          "以实际计划验证候选索引"
        ],
        "refs": [
          {
            "label": "组合索引与列顺序 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/indexes-multicolumn.html"
          }
        ],
        "conceptId": "composite-index-order"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "标识远程资料",
        "detail": "查询键包含分类与排序，避免缓存混用。",
        "code": "[\"products\", {category:2,sort:\"price\"}]"
      },
      {
        "label": "02",
        "title": "判断应用缓存新鲜度",
        "detail": "前端可复用缓存，但仍保留刷新能力。",
        "code": "staleTime: 30000"
      },
      {
        "label": "03",
        "title": "声明 HTTP 复用规则",
        "detail": "公开分类与私人订单采用不同缓存头。",
        "code": "public,max-age=60 / no-store"
      },
      {
        "label": "04",
        "title": "支持数据库读取",
        "detail": "分类内排序使用匹配查询的候选组合索引。",
        "code": "(category_id,price,id)"
      }
    ],
    "summary": "前端缓存、HTTP 缓存和索引是三个不同层。它们各自有身份、生命周期与成本，不能用一个开关解决全部性能问题。",
    "challenge": {
      "duration": "15",
      "task": "为“分类 2 内按价格前十件”选择候选索引，并给公开分类与私人订单各写一条缓存策略。",
      "criteria": [
        "候选索引前导列是 category_id",
        "公开分类可短期共享缓存",
        "私人订单不使用 public"
      ],
      "hint": "先固定筛选条件，再看组内排序；敏感响应优先考虑 no-store。",
      "solution": "CREATE INDEX demo_idx ON products(category_id,price,id);\n-- /public/categories: public, max-age=60\n-- /my/orders: no-store\n// queryKey: [\"products\",{category:2,sort:\"price_asc\"}]"
    },
    "preview": "明天用事务保证订单和订单项一起成功，并刷新查询。"
  },
  {
    "number": 18,
    "title": "订单建好了，订单项失败了，怎么办？",
    "subtitle": "Mutation 管写入交互，事务让多条 SQL 成为一个完整业务结果。",
    "minutes": "12",
    "objectives": [
      "Mutation 与失效刷新",
      "事务边界与回滚",
      "ACID 与 COMMIT/ROLLBACK"
    ],
    "lessons": [
      {
        "id": "FE-018",
        "category": "frontend",
        "name": "Mutation 与失效刷新",
        "type": "TanStack Query 写入管理",
        "level": "Intermediate",
        "teaser": "创建订单成功后，旧订单列表缓存不会自动知道新增了资料。",
        "problem": "创建订单成功后，旧订单列表缓存不会自动知道新增了资料。写入成功需要有明确的刷新策略。",
        "mechanism": [
          "useMutation 管理写入等待与错误。",
          "成功后按 Query Key 标记相关查询失效。",
          "活跃查询重新获取，界面采用服务器结果。"
        ],
        "code": "import {useMutation,useQueryClient} from \"@tanstack/react-query\";\nfunction useCreateOrder() {\n const client=useQueryClient();\n return useMutation({\n  mutationFn:async body=>{\n   const r=await fetch(\"/orders\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(body)});\n   if(!r.ok) throw new Error(`HTTP ${r.status}`);return r.json();},\n  onSuccess:()=>client.invalidateQueries({queryKey:[\"orders\"]})\n });\n}",
        "language": "jsx",
        "explanation": "片段使用 TanStack Query v5，外层需要 QueryClientProvider，mutation.mutate(body) 由已有表单调用。Mutation 跟踪 isPending 与错误，但不会自动让所有可能相关的查询更新。invalidateQueries 将匹配订单前缀的查询标记为过期，通常重新抓取活跃查询；未挂载查询不会因此都立即发请求。返回刷新 Promise 可以让成功处理等待相应刷新完成，界面也可选择显示已创建但列表仍在刷新的状态。失效范围不能太小，否则其他筛选列表仍旧；也不必每次清空全部应用缓存。创建失败不应显示成功或把表单输入丢掉。即使刷新失败，创建也可能已经成功，因此重试按钮要区分重新读取与再次创建，避免因为显示问题重复下单。",
        "usage": "适合新增、修改后同步列表；高频细粒度更新可根据服务器返回值直接更新特定缓存。",
        "mistakes": [
          "以为 mutation 成功会自动更新所有查询。",
          "列表刷新失败时重新创建订单。"
        ],
        "takeaways": [
          "写入与读取缓存分开",
          "失效需要明确匹配范围",
          "刷新失败不代表写入失败"
        ],
        "refs": [
          {
            "label": "Mutation 与失效刷新 · 官方文档",
            "url": "https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations"
          }
        ],
        "conceptId": "mutation-query-invalidation"
      },
      {
        "id": "BE-018",
        "category": "backend",
        "name": "事务边界与回滚",
        "type": "Psycopg 业务原子性",
        "level": "Intermediate",
        "teaser": "创建订单头成功、写入明细失败，如果每一步独立提交，就会留下不完整订单。",
        "problem": "创建订单头成功、写入明细失败，如果每一步独立提交，就会留下不完整订单。一个业务动作应有一个明确事务边界。",
        "mechanism": [
          "外层打开一个事务连接。",
          "所有订单相关语句共用同一事务。",
          "任何步骤异常向外传播，整体回滚。"
        ],
        "code": "import psycopg\ndef create_order(dsn, product_id, quantity):\n    with psycopg.connect(dsn) as conn:\n        with conn.cursor() as cur:\n            cur.execute(\"INSERT INTO orders DEFAULT VALUES RETURNING id\")\n            order_id=cur.fetchone()[0]\n            cur.execute(\n                \"INSERT INTO order_items(order_id,product_id,quantity) VALUES (%s,%s,%s)\",\n                (order_id,product_id,quantity))\n        return {\"id\":order_id}\n# 退出连接上下文正常则提交，异常则回滚并关闭。",
        "language": "python",
        "explanation": "代码需要已准备 orders 与 order_items 练习表及约束，dsn 由服务端配置提供；这里没有执行真实写入。Psycopg 的连接上下文把两条语句放在同一事务里，正常离开时提交，异常离开时回滚。Python 在 return 真正返回调用者之前仍会退出 with，所以提交失败也会向上抛出，路由不能提前发送成功。Repository 不应在中间自行 commit，错误也不要被捕获后吞掉，否则外层可能误认为所有步骤成功。数据库事务只覆盖该连接中的数据库工作，不能自动撤回已发邮件或已完成外部扣款；跨系统副作用需要另外设计。长事务会占用资源并延长锁持有，尽量不要把缓慢外部请求放进持锁事务。",
        "usage": "适合订单头与明细、多表写入和余额转移；外部服务不属于同一数据库原子边界。",
        "mistakes": [
          "每插入一行就提交一次。",
          "捕获数据库异常后仍返回创建成功。"
        ],
        "takeaways": [
          "事务边界围绕业务动作",
          "异常需触发回滚",
          "数据库事务不覆盖外部副作用"
        ],
        "refs": [
          {
            "label": "事务边界与回滚 · 官方文档",
            "url": "https://www.psycopg.org/psycopg3/docs/basic/transactions.html"
          }
        ],
        "conceptId": "transaction-service-boundary"
      },
      {
        "id": "DB-018",
        "category": "database",
        "name": "ACID 与 COMMIT/ROLLBACK",
        "type": "关系数据库事务",
        "level": "Intermediate",
        "teaser": "多条 SQL 需要一起生效，也要在失败时保持有效状态。",
        "problem": "多条 SQL 需要一起生效，也要在失败时保持有效状态。ACID 是理解这些保证及其限制的起点。",
        "mechanism": [
          "BEGIN 建立事务范围。",
          "COMMIT 提交，ROLLBACK 放弃未提交变化。",
          "约束与隔离级别共同影响可观察行为。"
        ],
        "code": "BEGIN;\nINSERT INTO orders(id) VALUES (100);\nINSERT INTO order_items(order_id,product_id,quantity)\nVALUES (100, 1, 2);\nCOMMIT;\n-- 若第二条失败，应 ROLLBACK，不保留半个订单。\n-- 表结构、固定 ID 仅为独立练习示意，重复运行会冲突。",
        "language": "sql",
        "explanation": "事务的原子性表示这一组修改全部提交或全部不提交；一致性需要约束与业务规则共同定义，数据库不能自动理解“订单必须合理”这种未表达的要求。隔离性描述并发事务之间的可见性，默认隔离级别不等于所有业务都像单线程顺序执行，后面仍需学习锁和版本条件。持久性表示按配置完成提交后，在约定故障模型下保留结果，不替代备份和恢复演练。SQL 中第二条语句失败后，PostgreSQL 的当前事务通常进入失败状态，需要回滚才可继续，而非直接执行另一条语句装作无事。这里固定 ID 便于读懂关系，正式表应使用数据库生成身份，并让驱动管理事务边界，避免手写事务命令与自动模式互相冲突。",
        "usage": "适合将一组数据库操作视为一个业务结果；ACID 仍需要正确建模与合适隔离。",
        "mistakes": [
          "认为 ACID 自动防止所有并发覆盖。",
          "把事务成功当作已经具备备份恢复能力。"
        ],
        "takeaways": [
          "原子性避免部分写入",
          "一致性依赖明确规则",
          "隔离级别有具体保证"
        ],
        "refs": [
          {
            "label": "ACID 与 COMMIT/ROLLBACK · 官方文档",
            "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html"
          }
        ],
        "conceptId": "acid-commit-rollback"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "提交订单意图",
        "detail": "Mutation 标记保存中，避免界面重复发起。",
        "code": "mutation.mutate(order)"
      },
      {
        "label": "02",
        "title": "写入同一事务",
        "detail": "订单头与明细共用连接，不在中间提交。",
        "code": "BEGIN → INSERT order → INSERT items"
      },
      {
        "label": "03",
        "title": "整体决定结果",
        "detail": "明细失败则回滚，成功才提交资源。",
        "code": "failure → ROLLBACK"
      },
      {
        "label": "04",
        "title": "刷新相关读取",
        "detail": "创建确认后使订单查询失效，重新读取。",
        "code": "invalidateQueries([\"orders\"])"
      }
    ],
    "summary": "事务保证数据库内的组合写入，Mutation 与失效控制页面看到的结果。写入成功和随后列表刷新成功应分别解释。",
    "challenge": {
      "duration": "15",
      "task": "用内存对象模拟订单头成功、明细失败，比较整体事务与逐步提交的最终资料，再写刷新策略。",
      "criteria": [
        "事务失败后两张表都不增加",
        "逐步提交可能留下空订单",
        "创建成功后刷新而不是重复创建"
      ],
      "hint": "先在草稿快照执行所有修改，只有全部成功才替换正式快照。",
      "solution": "const draft={orders:[...db.orders],items:[...db.items]};\n// 执行两步；若明细抛错，丢弃 draft。\n// 全部完成：db=draft；刷新 [\"orders\"]。"
    },
    "preview": "明天处理乐观界面与网络重试造成的重复创建。"
  },
  {
    "number": 19,
    "title": "按钮已显示成功，服务器却失败了？",
    "subtitle": "乐观更新要能回退，幂等创建要在服务端记录并发安全的结果。",
    "minutes": "12",
    "objectives": [
      "Optimistic UI 与失败回退",
      "Idempotency Key",
      "UNIQUE 与 ON CONFLICT"
    ],
    "lessons": [
      {
        "id": "FE-019",
        "category": "frontend",
        "name": "Optimistic UI 与失败回退",
        "type": "TanStack Query 乐观状态",
        "level": "Intermediate",
        "teaser": "点赞或轻量改名可先显示结果减少等待，但服务器拒绝后必须能恢复。",
        "problem": "点赞或轻量改名可先显示结果减少等待，但服务器拒绝后必须能恢复。乐观成功只是临时界面预测。",
        "mechanism": [
          "先取消可能覆盖预测的查询。",
          "保存旧缓存快照并写入预测值。",
          "失败回退，结束后刷新服务器结果。"
        ],
        "code": "import {useMutation,useQueryClient} from \"@tanstack/react-query\";\nfunction useRename(rename) {\n const client=useQueryClient();\n return useMutation({mutationFn:rename,\n  onMutate:async next=>{\n   await client.cancelQueries({queryKey:[\"product\",next.id]});\n   const previous=client.getQueryData([\"product\",next.id]);\n   client.setQueryData([\"product\",next.id],old=>({...old,name:next.name}));\n   return {previous};},\n  onError:(_e,next,ctx)=>client.setQueryData([\"product\",next.id],ctx.previous),\n  onSettled:(_data,_e,next)=>client.invalidateQueries({queryKey:[\"product\",next.id]})\n });\n}",
        "language": "jsx",
        "explanation": "示例为 TanStack Query v5，外层已有 Provider，rename 是调用者提供的真实写入函数，并假设该详情缓存已存在且同一商品一次只允许一个待完成修改。onMutate 在请求前保存快照，cancelQueries 减少旧读取覆盖预测，setQueryData 立即显示新名称；失败时再恢复快照，结束后统一验证服务器状态。取消读取不能撤销已经提交的写入。若同时允许多个乐观修改，简单恢复整份旧快照可能覆盖较新的成功修改，因此本例明确限制并发；复杂情况应按操作记录回滚或直接重新读取。高风险操作如扣款与最终库存不适合用临时显示冒充已确认成功。界面应标示等待中，让用户知道此刻是预测而不是持久化承诺。",
        "usage": "适合可轻易修正、失败率低的轻量交互；财务与不可逆操作应等待确认。",
        "mistakes": [
          "不保存快照，失败只能留下错误预测。",
          "多个并发修改共用粗糙回退，覆盖新结果。"
        ],
        "takeaways": [
          "乐观结果需要等待标记",
          "失败要有回退路径",
          "并发乐观操作需额外设计"
        ],
        "refs": [
          {
            "label": "Optimistic UI 与失败回退 · 官方文档",
            "url": "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates"
          }
        ],
        "conceptId": "optimistic-rollback"
      },
      {
        "id": "BE-019",
        "category": "backend",
        "name": "Idempotency Key",
        "type": "API 重试去重协议",
        "level": "Intermediate",
        "teaser": "创建订单已经提交，但响应途中断开。",
        "problem": "创建订单已经提交，但响应途中断开。客户端重试时需要复用原结果，而不是再创建第二笔订单。",
        "mechanism": [
          "客户端为一次逻辑操作生成稳定键。",
          "服务端按用户、键和请求指纹记录结果。",
          "原子占位与唯一约束处理并发重试。"
        ],
        "code": "def create_once(user_id, key, body, repo):\n    fingerprint = canonical_hash(body)\n    with repo.transaction():\n        # 新键只给占位拥有者；已有处理中键必须等待或抛冲突。\n        record = repo.claim_or_load(user_id, key, fingerprint)\n        if record.fingerprint != fingerprint:\n            raise Conflict(\"Key reused with different body\")\n        if record.completed:\n            return record.response\n        order = repo.create_order(body)\n        repo.complete(record, status=201, response=order)\n        return order\n# canonical_hash/Conflict/repo 是应用需实现的契约，不是库内置 API。",
        "language": "python",
        "explanation": "这段是标注依赖的流程伪代码，repo 必须真正以数据库唯一约束和事务实现原子占位，不能把先查再写当成并发安全。幂等键代表同一次业务意图，网络超时后应复用原键；用户主动新建另一订单则要新键。服务端以用户或租户作为作用域，并保存规范化请求指纹，避免同一个键被不同内容误用。并发请求碰到处理中记录时，应按约定等待或返回可重试状态，而不是双双继续创建。记录应有保留期限和结果大小限制，过期后重试可能不再去重，因此客户端必须理解契约。这里只覆盖数据库订单；若还调用外部支付，需对接提供方自己的幂等能力或工作流，不能宣称本地事务保证跨系统恰好一次。",
        "usage": "适合订单与其他不能因安全重试而重复创建的写入。必须明确作用域、有效期和并发策略。",
        "mistakes": [
          "仅在进程内用字典去重。",
          "同一键换请求体仍返回旧结果且没有冲突提示。"
        ],
        "takeaways": [
          "键绑定一次逻辑意图",
          "去重要原子持久记录",
          "跨系统不能轻率承诺恰好一次"
        ],
        "refs": [
          {
            "label": "Idempotency Key · 官方文档",
            "url": "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2"
          },
          {
            "label": "Stripe · 幂等请求协议实例（不是本课依赖）",
            "url": "https://docs.stripe.com/api/idempotent_requests"
          }
        ],
        "conceptId": "idempotency-key-create"
      },
      {
        "id": "DB-019",
        "category": "database",
        "name": "UNIQUE 与 ON CONFLICT",
        "type": "PostgreSQL 约束与原子冲突处理",
        "level": "Intermediate",
        "teaser": "先 SELECT 判断不存在再 INSERT，在并发下两次检查都可能通过。",
        "problem": "先 SELECT 判断不存在再 INSERT，在并发下两次检查都可能通过。数据库唯一约束才是最终竞争裁判。",
        "mechanism": [
          "声明业务唯一键。",
          "INSERT 时由约束检测冲突。",
          "ON CONFLICT 选择忽略或更新，并检查实际返回行。"
        ],
        "code": "CREATE TABLE request_keys (\n user_id integer NOT NULL,\n key text NOT NULL,\n request_hash text NOT NULL,\n PRIMARY KEY (user_id, key)\n);\nINSERT INTO request_keys(user_id,key,request_hash)\nVALUES (7,'order-demo-1','hash-A')\nON CONFLICT (user_id,key) DO NOTHING\nRETURNING user_id,key;",
        "language": "sql",
        "explanation": "这个独立练习表只演示幂等占位所需的唯一作用域，完整实现还要有处理中状态、结果和保留期限。PRIMARY KEY(user_id,key) 让不同用户可使用相同键，但同一用户不能重复占位。ON CONFLICT DO NOTHING 在竞争失败时不新增记录，也不会凭空返回已存在行；RETURNING 返回空结果时，调用者必须走明确的已有记录读取和指纹比较路径。不要把所有冲突都改成 DO UPDATE 覆盖，因为那可能修改原始请求并丢失去重证据。唯一约束解决重复键写入，不能单独保证订单业务已经完成，记录与业务资源需在适当事务或状态机中关联。并发可见性仍受隔离级别影响，不能将这里两条语句简单视为无需等待的完整算法。",
        "usage": "适合业务编号、用户邮箱与请求键去重；先定义什么范围内才算同一身份。",
        "mistakes": [
          "用 SELECT 不存在当作并发保证。",
          "DO NOTHING 后以为空 RETURNING 含原有资料。"
        ],
        "takeaways": [
          "唯一约束处理竞争",
          "冲突不一定是异常",
          "返回零行需继续解释"
        ],
        "refs": [
          {
            "label": "UNIQUE 与 ON CONFLICT · 官方文档",
            "url": "https://www.postgresql.org/docs/current/sql-insert.html"
          }
        ],
        "conceptId": "unique-on-conflict"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "标记预测状态",
        "detail": "页面可以先显示等待中的新值，并保存旧快照。",
        "code": "pending + previous snapshot"
      },
      {
        "label": "02",
        "title": "复用一次操作键",
        "detail": "响应丢失后的重试继续使用原键和内容。",
        "code": "Idempotency-Key: order-demo-1"
      },
      {
        "label": "03",
        "title": "由唯一约束裁决",
        "detail": "同用户同键只能成功占位一次，冲突需比较指纹。",
        "code": "UNIQUE(user_id,key)"
      },
      {
        "label": "04",
        "title": "确认或恢复",
        "detail": "真实成功替换预测，失败恢复；重试返回原结果。",
        "code": "saved / rollback / replay"
      }
    ],
    "summary": "乐观 UI 缩短感知等待，幂等协议防止逻辑重复，唯一约束处理并发竞争。每一层都需要清楚的失败与恢复路径。",
    "challenge": {
      "duration": "15",
      "task": "模拟用户两次提交：同键同内容、同键不同内容、不同键同内容，分别写出创建数量与响应。",
      "criteria": [
        "同键同内容只建一笔",
        "同键不同内容冲突",
        "不同键可创建第二笔"
      ],
      "hint": "把键和请求指纹一起记录；内容相同不代表同一业务意图。",
      "solution": "// k1+bodyA → 201 order#1\n// k1+bodyA → replay order#1\n// k1+bodyB → 409 conflict\n// k2+bodyA → 201 order#2"
    },
    "preview": "明天把渲染崩溃、HTTP 失败与数据库空值分开处理。"
  },
  {
    "number": 20,
    "title": "页面空白、接口失败、没有资料，是同一种问题吗？",
    "subtitle": "为不同失败建立正确边界，不用一个通用 catch 掩盖全部情况。",
    "minutes": "12",
    "objectives": [
      "Error Boundary 的作用与边界",
      "统一错误结构与状态码",
      "NULL 与三值逻辑"
    ],
    "lessons": [
      {
        "id": "FE-020",
        "category": "frontend",
        "name": "Error Boundary 的作用与边界",
        "type": "React 渲染异常恢复",
        "level": "Intermediate",
        "teaser": "子组件渲染异常可能让整个区域消失。",
        "problem": "子组件渲染异常可能让整个区域消失。Error Boundary 可以显示备用界面，但不会捕获所有异步和事件错误。",
        "mechanism": [
          "边界包住可能失败的子树。",
          "getDerivedStateFromError 切换备用界面。",
          "事件与异步请求仍由各自错误处理。"
        ],
        "code": "import {Component} from \"react\";\nclass SectionBoundary extends Component {\n state={failed:false};\n static getDerivedStateFromError(){return {failed:true};}\n componentDidCatch(error,info){\n  console.error(\"Render failed\",error.message,info.componentStack);\n }\n render(){return this.state.failed ? <p>此区域暂时无法显示。</p> : this.props.children;}\n}\n// <SectionBoundary><ProductPanel/></SectionBoundary>",
        "language": "jsx",
        "explanation": "代码在已有 React 项目中定义类组件边界，通常页面内容仍采用函数组件。边界能捕获其子树在渲染等阶段抛出的错误，并把该区域换成备用界面；它不能捕获自己备用界面的错误，因此边界也有层级范围。按钮事件抛错、普通异步回调拒绝和服务器渲染错误不应指望由它统一处理，fetch 的 HTTP 失败仍需显式检查并进入请求状态。边界放得太高会让整页一起消失，放在有独立恢复意义的区域更实用。日志示例只展示消息与组件栈，真实上报需要避免敏感资料。提供重试还要同时重置边界状态和导致错误的资料，否则只会反复崩溃；不能把“有备用文案”当成问题已经修好。",
        "usage": "适合保护独立面板、路由内容和第三方渲染区域；接口失败保留专门请求错误界面。",
        "mistakes": [
          "以为边界会捕获按钮事件和所有 Promise 错误。",
          "重置 failed 却不修正同一份错误资料。"
        ],
        "takeaways": [
          "边界针对子树渲染错误",
          "异步失败另行处理",
          "恢复需要处理错误来源"
        ],
        "refs": [
          {
            "label": "Error Boundary 的作用与边界 · 官方文档",
            "url": "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary"
          }
        ],
        "conceptId": "error-boundary-scope"
      },
      {
        "id": "BE-020",
        "category": "backend",
        "name": "统一错误结构与状态码",
        "type": "API 错误契约",
        "level": "Intermediate",
        "teaser": "每个接口返回不同形状的错误，前端很难决定提示、重试或定位方式。",
        "problem": "每个接口返回不同形状的错误，前端很难决定提示、重试或定位方式。统一结构应保留正确状态与可读错误码。",
        "mechanism": [
          "状态码表达失败类别。",
          "稳定 code 支持程序判断。",
          "message 与 request_id 支持用户提示和排查。"
        ],
        "code": "from fastapi import FastAPI, Request\nfrom fastapi.responses import JSONResponse\napp=FastAPI()\nclass MissingProduct(Exception): pass\n@app.exception_handler(MissingProduct)\nasync def missing_handler(request: Request, exc: MissingProduct):\n    return JSONResponse(status_code=404, content={\n      \"error\":{\"code\":\"PRODUCT_NOT_FOUND\",\n      \"message\":\"商品不存在\",\n      \"request_id\":getattr(request.state,\"request_id\",None)}})\n# request_id 通常由中间件产生；此处未实现。",
        "language": "python",
        "explanation": "示例只映射一种应用异常，已有路由需要在真实查找失败时抛出 MissingProduct；请求 ID 由外层中间件提供，这里缺失时显式为 null。统一错误不是把所有失败变成 HTTP 200 再塞 success=false，而是保留 404、409、422、500 等有意义的类别。code 稳定供程序判断，message 可以本地化，request_id 让用户与服务端日志对得上。输入验证错误也要纳入契约设计，但应保留字段路径等纠错信息，不能只剩“失败”。未知异常应返回一般化 500 并在服务端记录细节，不把 SQL、堆栈或凭证暴露给客户端。重试规则要结合操作语义和是否已提交，不能只看到 500 就无限重复创建。此片段不会自动覆盖 FastAPI 所有内置错误。",
        "usage": "适合多个接口与客户端协作的系统。错误结构应有示例和兼容规则。",
        "mistakes": [
          "所有异常都返回 200 或一律 500。",
          "把原始数据库异常直接展示给用户。"
        ],
        "takeaways": [
          "HTTP 状态仍有意义",
          "稳定 code 用于程序判断",
          "排查信息与敏感细节分开"
        ],
        "refs": [
          {
            "label": "统一错误结构与状态码 · 官方文档",
            "url": "https://fastapi.tiangolo.com/tutorial/handling-errors/"
          }
        ],
        "conceptId": "api-error-envelope"
      },
      {
        "id": "DB-020",
        "category": "database",
        "name": "NULL 与三值逻辑",
        "type": "PostgreSQL 条件语义",
        "level": "Intermediate",
        "teaser": "查找未分类商品时写 category_id = NULL 会得不到预期结果。",
        "problem": "查找未分类商品时写 category_id = NULL 会得不到预期结果。NULL 代表未知，比较结果不只有真和假。",
        "mechanism": [
          "普通比较遇到 NULL 通常得到 unknown。",
          "WHERE 只保留 true，排除 false 与 unknown。",
          "用 IS NULL 或 IS NOT NULL 明确检查缺失。"
        ],
        "code": "SELECT id, name FROM products\nWHERE category_id IS NULL;\n\n-- 需要“未分类或不是分类 2”时：\nSELECT id, name FROM products\nWHERE category_id IS NULL OR category_id <> 2;\n-- category_id <> 2 单独使用不会包含 NULL。",
        "language": "sql",
        "explanation": "片段以前面已增加可空 category_id 的练习表为前提。NULL 不等于零、空字符串或某个特殊 ID，而是缺少已知值；因此 NULL = NULL 也不会得到普通 true。SQL 的条件可能是 true、false、unknown，WHERE 只留下 true，所以 category_id <> 2 也会排除未分类商品，而不是自然把它们视为不是二。需要包含缺失时应明确 OR category_id IS NULL，或者按语义采用 IS DISTINCT FROM。NOT IN 子查询里若含 NULL，结果还可能出现难察觉的 unknown，不能简单套用普通集合直觉。展示层可以把 NULL 显示为“未分类”，但保存时仍要保留缺失语义，不应为了文案把数据库写成字符串。清楚定义空值，才能区分成功空结果和程序错误。",
        "usage": "适合可选关联、尚未填写字段和缺失资料筛选；每个可空字段都应有明确含义。",
        "mistakes": [
          "使用 = NULL 判断缺失。",
          "认为 <> 条件自动包含 NULL。"
        ],
        "takeaways": [
          "NULL 表示未知或缺失",
          "WHERE 只保留 true",
          "检查缺失使用 IS NULL"
        ],
        "refs": [
          {
            "label": "NULL 与三值逻辑 · 官方文档",
            "url": "https://www.postgresql.org/docs/current/functions-comparison.html"
          }
        ],
        "conceptId": "null-three-valued-logic"
      }
    ],
    "flow": [
      {
        "label": "01",
        "title": "先判定是否收到响应",
        "detail": "网络失败与 HTTP 非成功是不同状态。",
        "code": "network error / HTTP 404"
      },
      {
        "label": "02",
        "title": "按契约解释失败",
        "detail": "接口返回稳定 code 和可公开提示，保留状态码。",
        "code": "error.code = PRODUCT_NOT_FOUND"
      },
      {
        "label": "03",
        "title": "分辨成功空资料",
        "detail": "SQL 空值与零结果按业务解释，不冒充异常。",
        "code": "category_id IS NULL"
      },
      {
        "label": "04",
        "title": "隔离渲染崩溃",
        "detail": "只有渲染子树异常进入边界备用界面。",
        "code": "<SectionBoundary>...</SectionBoundary>"
      }
    ],
    "summary": "渲染错误、接口失败、数据库空值与成功空列表应分别建模。正确的边界让用户知道发生什么，也让开发者找得到真正问题。",
    "challenge": {
      "duration": "15",
      "task": "对“子组件 render 抛错、GET 返回 404、成功 items=[]、category_id 为 NULL”四种情况各指定处理层和提示。",
      "criteria": [
        "渲染错误进入边界",
        "404 进入请求错误状态",
        "空数组和 NULL 不自动当异常"
      ],
      "hint": "先看是否执行成功，再看资料含义；NULL 要用 IS NULL 查询。",
      "solution": "// render throw → 边界备用区域\n// HTTP 404 → 请求错误：商品不存在\n// 200 items=[] → 成功空状态：暂无商品\n// category_id NULL → 显示未分类；WHERE category_id IS NULL"
    },
    "preview": "接下来用 TypeScript 和兼容契约，让这些状态更难被误用。"
  }
]);
