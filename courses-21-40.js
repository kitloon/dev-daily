/* Days 21–40. Contextual snippets use prepared React/FastAPI/PostgreSQL projects. */
(() => {
const R = (label,url) => ({label,url});
const pg = (page,label) => R('PostgreSQL · '+label,'https://www.postgresql.org/docs/current/'+page+'.html');
const react = (page,label) => R('React · '+label,'https://react.dev/'+page);
const mdn = (page,label) => R('MDN · '+label,'https://developer.mozilla.org/en-US/docs/'+page);
const fast = (page,label) => R('FastAPI · '+label,'https://fastapi.tiangolo.com/'+page+'/');
const lesson = (d,c,name,type,conceptId,problem,mechanism,code,explanation,usage,mistakes,takeaways,refs,language) => ({id:({frontend:'FE',backend:'BE',database:'DB'}[c])+'-'+String(d).padStart(3,'0'),category:c,name,type,conceptId,level:d<26?'Intermediate':d<31?'Intermediate':'Advanced',teaser:problem,problem,mechanism,code,language:language||({frontend:'tsx',backend:'python',database:'sql'}[c]),explanation,usage,mistakes,takeaways,refs});
const node = (label,title,detail,code) => ({label,title,detail,code});
const day = (number,title,subtitle,objectives,lessons,flow,summary,task,criteria,hint,solution,preview) => ({number,title,subtitle,minutes:'12',objectives,lessons,flow,summary,challenge:{duration:'15',task,criteria,hint,solution},preview});
const days=[];
days.push(day(21,'分类改名，为何要改十条商品？','用类型守住接口形状，用关联表守住资料的一致性。',['用 TypeScript 描述 Props 和响应','判断响应演进是否破坏旧客户端','消除重复分类资料'],[
lesson(21,'frontend','TypeScript 的 Props 与接口数据类型','静态类型系统','typed-product-contract','组件把接口金额当成数字，但 API 返回字符串，调用 toFixed 就会报错。类型约定应明确边界。',['定义 API 对象类型而非 any。','在 Props 中声明真正需要的字段。','让编译器检查调用，再在运行时验证外部输入。'],`type Product = { id: number; name: string; price: string };
type ProductCardProps = { product: Product };
export function ProductCard({product}: ProductCardProps) {
  return <p>{product.name} · RM{product.price}</p>;
}
// 已验证的响应才可传入 ProductCard。`,
'本例放在已有 React 与 TypeScript 项目，假定接口用十进制字符串表达金额，避免把货币契约偷偷改成浮点数。type 给对象字段规定名称与类型，Props 又把这份契约应用到组件入口；漏传 name 或把 id 写成字符串会在类型检查时被发现。类型检查发生在开发和构建阶段，浏览器收到的 JSON 仍是外部资料，写成 response.json() as Product 并不会检查任何内容。应先用运行时校验器或明确的字段检查验证响应，再把资料交给组件。把所有接口字段复制进每个组件会增加耦合，可用 Pick 表达组件所需的最小形状。可选字段必须考虑 undefined，不能为了消除报错而到处加非空断言。类型让修改更容易追踪，但不能替代权限检查、金额规则和真实 API 测试。',
'适合多人协作的商品卡片和详情接口；小型展示组件可接收更窄的 Pick<Product, "name" | "price">。',['用 as 把未知 JSON 强制声明为可信资料。','为了通过编译，把所有字段改成 any。'],['类型检查不验证网络资料。','Props 是组件入口契约。','金额类型必须与 API 一致。'],[R('TypeScript · Object Types','https://www.typescriptlang.org/docs/handbook/2/objects.html'),R('React · TypeScript','https://react.dev/learn/typescript')]),
lesson(21,'backend','接口契约兼容与响应字段演进','API 契约设计','compatible-response-evolution','移动端更新比服务端慢。删除 category_name 后，旧版 App 可能仍在读取它。',['列出正在使用的响应字段与消费者。','先新增结构，保留旧字段作为过渡。','观测旧版本使用情况，再安排版本迁移。'],`from pydantic import BaseModel
class CategoryOut(BaseModel):
    id: int
    name: str
class ProductOut(BaseModel):
    id: int
    category_name: str  # 兼容期保留
    category: CategoryOut
# 路由既有查询结果通过此模型序列化。`,
'示例使用已有 FastAPI 和 Pydantic 项目，只声明响应模型，不代表已经连接数据库。数据库内部可以先完成分类表拆分，接口却不必立刻删除 category_name：服务层可从关联分类生成旧字段，同时提供新的 category 对象。通常新增可忽略字段较容易兼容，改字段名称、类型、空值语义或分页结构则可能破坏客户端；严格拒绝未知字段的客户端连新增字段也可能失败，所以兼容性必须以真实消费者测试为准。response_model 能控制输出结构，却不会自动决定迁移策略。应记录弃用期限、支持的客户端版本和回退路径，给旧版本足够时间。不能为了保留旧格式再维护两份可独立修改的分类名称，否则一致性问题只是从数据库搬到接口。新旧字段都由同一份事实生成，才有可控的过渡。',
'适合已有手机 App 的 API 演进。仅内部一次性脚本可在确认全部消费者同步后统一改契约。',['以为新增字段永远不会影响严格客户端。','兼容旧字段时又单独储存一份可变分类名称。'],['数据库结构与 API 结构可不同。','兼容取决于消费者行为。','旧字段需要明确退出计划。'],[fast('tutorial/response-model','Response Model'),R('OpenAPI · Specification','https://spec.openapis.org/oas/latest.html')]),
lesson(21,'database','数据规范化与重复资料','关系模型与函数依赖','normalize-product-category','每条商品都保存分类电话和名称，分类改名要更新多行，还可能漏改。',['识别由 category_id 决定的分类字段。','分类只保存在 categories 一处。','商品通过外键关联，查询时 JOIN。'],`CREATE TABLE categories (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name text NOT NULL
);
-- 在练习库已有 products 上增加关联。
ALTER TABLE products ADD COLUMN category_id bigint
 REFERENCES categories(id);
SELECT p.id, p.name, c.name AS category_name
FROM products p LEFT JOIN categories c ON c.id=p.category_id;`,
'规范化首先要问某个字段依赖谁。商品名称由商品身份决定，分类名称由分类身份决定，把后者重复放进每一条商品，就会产生更新异常、插入异常和删除异常。示例新增关联只是结构片段；真实迁移还要把已有分类去重、回填外键、检查未匹配行，确认后才删除旧列。不能直接按大小写相近的名称合并，业务上可能是不同分类。外键保护引用存在，并不要求分类名称必须全局唯一；是否唯一是另一个业务规则。查询通过 JOIN 还原页面所需形状，API 可以继续提供平坦字段。订单成交时的商品名称和单价往往应保留历史快照，那是记录当时事实，不是盲目重复当前商品资料。规范化减少可变事实的多处维护，但会增加关联查询，需要结合索引和读模型设计。',
'适合分类、地址簿、供应商等会统一更新的资料；成交快照应按历史语义独立保留。',['按显示名称武断合并不同分类。','把订单历史单价也改成永远读取当前商品价。'],['先识别字段依赖的身份。','外键连接事实来源。','历史快照与重复可变资料不同。'],[pg('ddl-constraints','Constraints'),pg('tutorial-join','Joins')])
],[node('01 / MODEL','找到重复事实','两件商品的分类资料应由同一个分类身份决定。','product.category_id = 7'),node('02 / DATABASE','拆出分类实体','先回填并校验关联，再考虑移除旧列。','products → categories'),node('03 / API','兼容输出','新对象和旧字段均从同一分类生成。','{category_name, category:{id,name}}'),node('04 / FRONTEND','检查消费方式','编译时检查 Props，运行时验证响应。','unknown → validated Product')],
'规范化解决事实重复，接口兼容解决客户端升级不同步，TypeScript 让组件依赖更明确。三者保护不同边界。','将两件商品中的同名分类拆成一个 categories 样本，再写出兼容新旧字段的响应。',['分类只保留一份可修改名称。','两件商品使用同一 category_id。','旧 category_name 与新 category.name 相同。'],'先固定分类 id=7，再把两件商品连接过去。',`categories = [{id:7,name:"饮品"}]
products = [{id:1,category_id:7},{id:2,category_id:7}]
response = {id:1,category_name:"饮品",category:{id:7,name:"饮品"}}`,'明天：两个管理员同时改价，怎样防止覆盖？'));
days.push(day(22,'你的保存覆盖了谁的修改？','用判别联合展示状态，用版本条件拒绝过期资料。',['用联合类型排除矛盾状态','理解 If-Match 的前置条件','用一次条件 UPDATE 检查版本'],[
lesson(22,'frontend','用判别联合表达请求状态','TypeScript 状态建模','discriminated-request-state','loading、error、success 三个布尔值可以同时为真，页面不知道该显示哪种状态。',['为每个合法状态设置唯一 status。','成功分支携带结果，冲突分支保留草稿。','渲染时根据 status 缩窄类型。'],`type SaveState =
 | {status:"editing"; draft:string}
 | {status:"saving"; draft:string}
 | {status:"saved"; version:number}
 | {status:"conflict"; draft:string; serverPrice:string};
function notice(state: SaveState) {
 if (state.status === "conflict")
   return "服务器价格 " + state.serverPrice + "；草稿 " + state.draft;
 return state.status;
}`,
'判别联合把状态名与允许的数据绑定，成功状态不必再携带空错误，冲突状态必须带回可比较的草稿和服务器值。示例是既有编辑页的类型与展示函数，不负责发请求。开始保存时从 editing 进入 saving，保存成功进入 saved，收到前置条件失败则进入 conflict；每个转换都应明确，而不是任意拼出多个布尔值。TypeScript 会在按 status 分支后缩窄类型，避免在尚未成功时读取不存在的 version。冲突不是普通网络故障，直接自动重发旧稿会破坏并发保护，应先取最新版，让用户比较、合并或放弃草稿。保留草稿可减少重复输入，但离开页面、切换用户或收到更新也需要定义处理方式。联合类型只能约束程序内的合法形状，不会自动执行状态转换规则，也不能证明后端真正检查了版本。',
'适合编辑、上传与审批等有多种互斥结果的流程。简单开关不必使用复杂状态机。',['收到冲突后不提醒用户就用新版本强制重发。','多个布尔标志组合出 loading 与 success 同时成立。'],['状态名决定可用字段。','冲突需要保留草稿。','类型与转换逻辑要配合。'],[R('TypeScript · Narrowing','https://www.typescriptlang.org/docs/handbook/2/narrowing.html')]),
lesson(22,'backend','版本检查与 If-Match','HTTP 条件请求','if-match-precondition','管理员基于旧价格提交修改。接口若只按 ID 更新，会悄悄覆盖较新的保存。',['读取响应附带强 ETag。','更新请求带 If-Match 原样回传。','后端把匹配条件落实到原子写入。'],`# 已有商品服务中的流程片段；不实现完整 ETag 解析器。
# GET /products/1 → ETag: "product-1-v7"
# PATCH /products/1 → If-Match: "product-1-v7"
# service.update_if_version(id=1, expected=7, changes=body)
# 更新成功 → ETag: "product-1-v8"
# 已存在但版本不匹配 → 412 Precondition Failed
# 本接口要求该头；缺失 → 428 Precondition Required`,
'If-Match 表达只有表示仍与读取时一致才执行写入，使用强比较，所以弱 ETag 不能当作成功匹配。示例定义一个接口策略：缺少必需条件返回 428，存在资源但条件不满足返回 412；找不到资源的处理要按明确的 HTTP 与业务契约实现。ETag 必须代表被保护的整个资源版本，不能只给价格加标签却允许别的字段绕过版本更新。后端不能先 SELECT 判断版本，再无条件 UPDATE，因为两条语句之间仍可插入另一位管理员的写入。应把预期版本带进 SQL 的 WHERE，并由受影响行数决定结果。完整实现还要正确解析带引号的 ETag、通配符与列表语法，不能靠随意截字符串。前端隐藏保存按钮只是体验优化，真正的并发控制发生在服务器的条件写入上。',
'适合后台资料编辑和内容管理；库存扣减还需要检查库存与交易规则，不能只靠客户端版本。',['先查版本后无条件 UPDATE，留下竞态。','把 412 当作可透明重试的网络错误。'],['If-Match 使用强比较。','条件必须进入原子写入。','412 表示需要重新协调资料。'],[mdn('Web/HTTP/Reference/Headers/If-Match','If-Match'),R('RFC 6585 · 428','https://www.rfc-editor.org/rfc/rfc6585.html#section-3')],'text'),
lesson(22,'database','version 字段与条件 UPDATE','乐观并发控制','version-conditional-update','两次更新都读取 version=7，只有第一笔应成功，第二笔必须发现自己过期。',['为每次成功修改递增版本。','WHERE 同时匹配身份与预期版本。','用 RETURNING 判断是否更新到行。'],`ALTER TABLE products ADD COLUMN version integer NOT NULL DEFAULT 1;
-- :id / :expected / :price 是绑定参数的示意写法。
UPDATE products
SET price=:price, version=version+1
WHERE id=:id AND version=:expected
RETURNING id, price, version;`,
'版本字段是一枚变化计数器，表示某条资料在读取之后是否被修改。两个管理员同时拿到 version=7 时，第一个条件更新会把版本改成 8；第二个相同条件已找不到 version=7 的行，因此不会覆盖新值。数据库在写入时处理并发，不需要由前端推测谁先点保存。示例使用绑定参数占位的概念写法，实际占位符取决于数据库驱动；应在独立练习表上演示增加字段。没有 RETURNING 行可能是资源不存在，也可能是版本过期，服务层需根据授权后的读取区分，避免泄露不可见资源。任何会改变资源语义的写入口都要更新 version，否则绕过路径会让旧标签仍看似有效。乐观锁适合冲突较少的编辑，不保证多个相关表自动满足业务约束；跨表原子修改仍需事务，复杂一致性也可能需要其他锁策略。',
'适合资料编辑冲突检测；计数器高频更新或多行库存交易需另评估锁与事务设计。',['某个后台脚本改价却忘记递增 version。','把零行更新一律解释成资料不存在。'],['身份与版本共同限定写入。','RETURNING 空结果需要解释。','所有写入口必须维护版本。'],[pg('sql-update','UPDATE'),pg('transaction-iso','Transaction Isolation')])
],[node('01 / READ','读取版本 7','两位管理员各自持有同一份旧表示。','ETag: "product-1-v7"'),node('02 / FIRST SAVE','第一份草稿保存','条件成立，数据库把版本递增为 8。','WHERE version=7 → version=8'),node('03 / SECOND SAVE','旧版本被拒绝','相同条件返回零行；API 返回 412。','If-Match v7 ≠ v8'),node('04 / RECOVER','比较与合并','保留第二份草稿，读取最新版再决定。','state.status = "conflict"')],
'联合类型描述可解释的界面状态，HTTP 前置条件表达保存意图，数据库条件更新负责阻止覆盖。','从 version=7、price=10 开始，按顺序模拟 A 改为 11 与 B 改为 12，B 仍使用版本 7。',['A 保存后为 version=8。','B 不改变价格。','界面保留 B 的 12 元草稿。'],'每次成功更新后立刻修改版本，再执行下一次条件比较。',`A: WHERE version=7 → price=11, version=8
B: WHERE version=7 → 0 rows → 412
UI: {status:"conflict",draft:"12",serverPrice:"11"}`,'明天：最后一件商品如何避免卖出两次？'));
days.push(day(23,'最后一件商品能卖给两个人吗？','把冲突恢复、事务重试和行锁分清楚。',['为库存冲突提供可恢复体验','知道哪些失败可以有界重试','用行锁串行检查同一行库存'],[
lesson(23,'frontend','库存不足与冲突后的交互恢复','交易交互设计','stock-conflict-recovery','购物车显示有货，提交时却已被别人买走。清空购物车会让用户失去选择，盲目重试又没有帮助。',['在提交期间防止同一界面重复操作。','识别缺货冲突并刷新库存。','保留购物车，允许减量或移除商品。'],`type Checkout = {status:"ready"|"sending"|"stock-conflict";
 message:string};
async function submitCart() {
 const res = await fetch("/orders", {method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({productId:1,quantity:1})});
 if (res.status === 409) return {status:"stock-conflict",
   message:"库存已变化，请确认数量后重新提交。"} as Checkout;
 if (!res.ok) throw new Error("订单提交失败");
 return await res.json();
}`,
'示例位于已登录的购物车页面，省略现有的身份与 CSRF 请求封装，重点是识别业务冲突。页面展示的是某一时刻的库存快照，提交之前无法保证别人没有成交；因此按钮显示有货不是预留库存的承诺。收到约定的缺货错误后，应保持用户已选择的商品，重新读取可售数量，把焦点放到明确提示或数量输入，而不是自动重复下单。409 是接口可采用的业务冲突状态，客户端最好再检查稳定的错误代码，避免把所有 409 都解释成缺货。提交超时与缺货不同：超时可能已经创建订单，应通过订单查询或幂等键确认结果。禁用按钮只能减少本页双击，多个标签页、设备和脚本仍可提交。业务约束始终由服务端和数据库执行，前端负责让失败可理解、可恢复，并避免向用户保证尚未完成的成交。',
'适合抢购、预约名额和库存订单。需要保留原有幂等、认证与 CSRF 封装。',['超时后直接再创建一次订单。','缺货就清空全部购物车和用户输入。'],['显示库存是快照。','缺货与结果未知要分开。','保留选择并给出下一步。'],[mdn('Web/HTTP/Reference/Status/409','409 Conflict'),react('learn/choosing-the-state-structure','Choosing State Structure')]),
lesson(23,'backend','并发冲突、死锁与重试边界','事务错误处理','bounded-transaction-retry','两笔交易以相反顺序锁住两件商品，可能互相等待。无上限重试会把压力放大。',['以稳定顺序取得多行锁。','只对明确可重试的数据库错误重跑整笔事务。','设置上限并延迟，不重放外部副作用。'],`# 服务层流程；is_retryable_db_error 与 transaction 由驱动封装提供。
for attempt in range(3):
    try:
        with transaction() as tx:
            reserve_in_id_order(tx, sorted(product_ids))
            create_order_and_outbox(tx)
        break
    except DatabaseError as exc:
        if not is_retryable_db_error(exc) or attempt == 2:
            raise
        sleep_with_jitter(attempt)
# 40001 / 40P01 可按既定策略重试；缺货是业务结果。`,
'这段是已有同步数据库服务中的流程伪代码，函数名表示必须由项目实现的事务与驱动适配，不可直接复制成完整程序。PostgreSQL 的序列化失败和死锁受害事务通常可以在回滚后重试，但应重跑从读取到写入的整笔事务，不能只补最后一条 SQL，因为先前的判断已可能过期。重试次数、总耗时与退避必须有界，并记录错误类型；请求已超时或被取消时也应停止不再需要的工作。缺货、参数错误和权限不足不是瞬时数据库故障，不该靠重试解决。锁住多件商品时按稳定 ID 顺序可减少死锁，却不能保证系统绝无死锁。事务中不要发送邮件、扣外部款项或发布不可撤回消息，否则回滚重跑可能重复副作用；可在事务中写 outbox，再由幂等消费者处理。最终仍要向界面返回明确结果。',
'适合高并发交易服务。先根据数据库驱动识别 SQLSTATE，不能靠异常文字模糊匹配。',['捕获所有异常后无限重试。','事务里先发邮件，随后回滚并重发。'],['重试整笔事务。','业务失败不等于可重试故障。','稳定锁顺序能减少死锁。'],[pg('explicit-locking','Explicit Locking'),pg('mvcc-serialization-failure-handling','Serialization Failure Handling')],'python'),
lesson(23,'database','SELECT FOR UPDATE 行锁','悲观并发控制','row-lock-inventory','先查 stock=1 再单独扣减，两笔请求可能都判断可以成交。',['在同一事务读取并锁住库存行。','拿到锁后检查最新可售数量。','扣减和订单创建一起提交或回滚。'],`BEGIN;
SELECT stock FROM products WHERE id=1 FOR UPDATE;
-- 应用必须检查返回的 stock >= 1；不足则 ROLLBACK。
UPDATE products SET stock=stock-1 WHERE id=1 AND stock>=1
RETURNING stock;
-- 仅在实际更新到一行后创建订单；同一事务。
COMMIT;`,
'FOR UPDATE 给查询到的行加排他性的行级锁，其他试图修改或取得冲突行锁的事务会等待，直到当前事务结束。A 锁住最后一件库存时，B 不能同时依据该行完成扣减；A 提交后，B 再按所用隔离级别读取和检查结果，发现库存已不足就回滚。示例省略订单表和应用分支，因此注释中的库存检查不能忽略；条件 UPDATE 再次保留非负条件，是额外防线，也可用单条条件扣减实现较简单场景。普通 SELECT 不会因为 FOR UPDATE 自动全部阻塞，行锁也不锁住不存在的商品或任意新插入行。必须先确认查询返回行数、权限与有效库存，并设置合理等待或锁超时。持锁期间不要等待用户确认或调用慢速外部服务。行锁范围越大、事务越长，并发能力越差，所以应锁最少资料并尽快结束事务。',
'适合需要读取库存后进行多项一致性检查的订单；仅减一件可优先评估原子条件 UPDATE。',['拿到锁后立刻提交，再在事务外扣库存。','以为普通 SELECT 也一定被行锁阻塞。'],['行锁跟随事务生命周期。','等待之后仍须检查库存。','持锁时间应尽量短。'],[pg('explicit-locking','Row-Level Locks'),pg('sql-select','SELECT')])
],[node('01 / A','A 取得行锁','库存初始为 1，A 在事务中锁住这一行。','SELECT … FOR UPDATE'),node('02 / B','B 等待同一行','B 暂不能完成冲突的写入。','wait on product 1'),node('03 / COMMIT','A 扣减并提交','库存与订单一起提交；失败则一起回滚。','stock = 0; COMMIT'),node('04 / RECOVERY','B 处理缺货','重新检查后返回冲突，界面保留购物车。','409 OUT_OF_STOCK')],
'锁与事务保护库存，重试处理有限的瞬时冲突，界面恢复处理用户还能做什么。它们不能互相替代。','用两笔依次获得同一行锁的交易推演 stock=1；再让 A 回滚，比较 B 的结果。',['A 提交时只有一笔成交。','A 回滚时 B 可以扣减。','缺货不进入数据库错误重试。'],'分别写出锁持有者、提交库存和订单数量。',`A commit: stock 1→0; B checks 0→reject
A rollback: stock stays 1; B checks 1→0
At most one committed order consumes the last item.`,'明天：同一笔订单为何在两地显示不同日期？'));
days.push(day(24,'订单到底是哪一天创建的？','保存瞬间，显示时区，分开理解日期和本地时间。',['用 Intl 明确展示时区','定义带偏移的接口时间','理解 PostgreSQL 时间类型'],[
lesson(24,'frontend','Intl 日期展示与用户时区','国际化与日期时间 API','intl-user-timezone','UTC 晚上创建的订单，在吉隆坡已经是次日。直接截取字符串会显示错日期。',['把带偏移的字符串解析成同一瞬间。','用 Intl.DateTimeFormat 明确 locale 和 timeZone。','显示时区名称，日期筛选另定义边界。'],`const createdAt = "2026-11-02T23:30:00Z";
const format = new Intl.DateTimeFormat("zh-CN", {
 timeZone:"Asia/Kuala_Lumpur", year:"numeric", month:"2-digit",
 day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
});
const display = format.format(new Date(createdAt));
// 同一瞬间在该时区为 11 月 3 日 07:30。`,
'示例可在现代浏览器执行，createdAt 含 Z，明确表示 UTC 瞬间。Date 内部表示时间点，Intl.DateTimeFormat 负责把同一个时间点映射为指定时区的日历和时钟读数；改变 timeZone 不会修改订单真正的创建时刻。若省略 timeZone，结果使用运行环境默认时区，用户截图和自动测试就可能与开发者不同。不要手动加八小时再交给本地格式化，否则会重复偏移，也无法处理其他地区的夏令时。纯生日或账单月份属于日历资料，不应随便转换成某地午夜的 UTC 时间。显示今天订单时，需要先定义业务时区，再把当地一天的起止边界转换成查询瞬间范围，而不是比较 UTC 字符串日期。格式化前也要处理无效输入；本例不处理任意用户文字解析，因为浏览器对非标准日期格式的理解不可靠。',
'适合订单、日志和跨地区活动；生日使用明确的 date 语义。',['手动加八小时后又让 Intl 按吉隆坡格式化。','截取 ISO 的前十位当作所有用户的当天。'],['瞬间与显示时区不同。','优先使用 IANA 时区名称。','日期筛选要先确定业务时区。'],[mdn('Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat','Intl.DateTimeFormat')]),
lesson(24,'backend','带时区时间的接口约定','时间序列化契约','aware-api-timestamp','2026-11-02T08:00:00 没有偏移，客户端无法判断它是 UTC 还是当地时间。',['接口只接收带时区的瞬间。','服务端创建 aware datetime。','响应统一使用 ISO 8601 带 Z 或偏移。'],`from datetime import datetime, timezone
from pydantic import BaseModel, AwareDatetime
class OrderOut(BaseModel):
    id: int
    created_at: AwareDatetime
now = datetime.now(timezone.utc)
order = OrderOut(id=1, created_at=now)
print(order.model_dump_json())`,
'示例使用 Pydantic v2 的 AwareDatetime，在已经准备好的 Python 环境中验证时间具备时区信息，并输出 JSON。datetime.now(timezone.utc) 创建明确的 UTC 时间点，避免无时区的 naive datetime 与带时区值混用。接口应文档化字段是创建瞬间而非用户本地日期，接受的格式、精度以及输出策略；带 +08:00 的值可与 Z 表示同一时刻，不应只按字符串比较先后。验证带偏移不等于知道用户所在地区，因为固定偏移没有地区的历史夏令时规则。预约下周某地上午九点时，往往还需要保存 IANA 时区和当地排程规则。测试应使用固定时间而非当前时钟，覆盖跨日、偏移和非法值。本例没有启动 API 或校准服务器时钟；真正系统仍需统一时钟来源，并避免把客户端自己传的创建时间当成可信审计时间。',
'适合服务端生成的 created_at、updated_at；循环预约另需地区时区规则。',['把无偏移时间默认解释成用户当地时间。','比较 ISO 字符串而不先统一时间含义。'],['接口必须声明瞬间语义。','aware datetime 防止丢失偏移。','固定偏移不能替代地区规则。'],[R('Pydantic · Datetime','https://docs.pydantic.dev/latest/api/standard_library_types/#datetimes'),R('Python · datetime','https://docs.python.org/3/library/datetime.html')]),
lesson(24,'database','timestamp 与 timestamptz','数据库时间类型','timestamp-instant-storage','字段叫 created_at 却使用无时区类型，应用间对同一数值的解释可能不同。',['事件瞬间选 timestamptz。','无时区本地时钟资料选 timestamp 并保留语义。','查询显示按会话时区转换。'],`CREATE TEMP TABLE time_demo (created_at timestamptz);
INSERT INTO time_demo VALUES ('2026-11-02T23:30:00Z');
SELECT created_at AT TIME ZONE 'Asia/Kuala_Lumpur' AS local_time
FROM time_demo;
-- local_time 是 timestamp：2026-11-03 07:30:00`,
'PostgreSQL 的 timestamptz 表示一个时间点，输入带偏移时转换为统一时间基准，输出按会话 TimeZone 显示；它不会保存原始字符串中的时区名称。timestamp without time zone 则只保存年月日时分秒的本地时钟字段，不足以单独确定全球唯一瞬间。示例用临时表演示 UTC 时间在吉隆坡的本地读数，AT TIME ZONE 作用在 timestamptz 上返回该地区的无时区显示值。不要看到名称包含 timezone 就认为原始地区会被保留；需要保留预约地区时应另存时区标识。订单按某日汇总时应使用半开区间 start <= created_at < next_start，边界由业务时区计算，避免用 23:59:59 漏掉小数秒。数据库会话默认时区也应明确，测试中固定输入与显示环境，不能仅凭一张查询截图判断实际存错时间。',
'适合订单创建和审计事件；营业时间可用无时区字段配合地区规则。',['以为 timestamptz 保存了原来的 Asia/Kuala_Lumpur 名称。','用当天 23:59:59 作为包含所有精度的上界。'],['timestamptz 保存瞬间。','timestamp 保存本地日历读数。','原始地区需要独立字段。'],[pg('datatype-datetime','Date/Time Types'),pg('functions-datetime','Date/Time Functions')])
],[node('01 / API','声明时间点','创建字段含 Z 或偏移。','2026-11-02T23:30:00Z'),node('02 / STORE','保存相同瞬间','timestamptz 不保留原始地区名。','created_at timestamptz'),node('03 / DISPLAY','选择展示地区','Intl 在用户时区转换读数。','Asia/Kuala_Lumpur → 07:30'),node('04 / FILTER','明确一天边界','按业务时区计算半开区间后再查询。','start <= t AND t < next_start')],
'同一瞬间可能有不同当地日期。接口、存储与展示必须分别声明含义，不靠隐含默认时区。','把固定时间 2026-11-02T23:30:00Z 分别显示为 UTC 和吉隆坡时间，说明哪个日期属于哪一地区。',['UTC 是 11 月 2 日 23:30。','吉隆坡是 11 月 3 日 07:30。','原始时间点保持相同。'],'只改变 Intl 的 timeZone，不修改 Date 的毫秒值。',`const t = new Date("2026-11-02T23:30:00Z");
["UTC","Asia/Kuala_Lumpur"].map(timeZone =>
 new Intl.DateTimeFormat("zh-CN",{timeZone,dateStyle:"medium",timeStyle:"short"}).format(t));`,'明天：统计表单如何让键盘和读屏用户都能操作？'));
days.push(day(25,'统计数字怎样让人看懂并操作？','从可访问的筛选表单，到有单位的统计接口。',['为输入绑定标签与错误信息','用 OpenAPI 示例表达统计契约','正确分组并汇总订单'],[
lesson(25,'frontend','可访问表单：标签、焦点与键盘','HTML 可访问性交互','accessible-report-form','只有 placeholder 的日期输入在输入后失去说明，错误也没有被读屏关联。',['用 label 的 htmlFor 绑定输入 id。','错误通过 aria-describedby 连接。','提交失败时将焦点移到需修正的字段。'],`import {useRef,useState} from "react";
export function ReportFilter() {
 const input = useRef<HTMLInputElement>(null);
 const [error,setError] = useState("");
 return <form onSubmit={e=>{e.preventDefault();
   if(!input.current?.value){setError("请选择开始日期"); input.current?.focus();}}}>
  <label htmlFor="start">开始日期</label>
  <input id="start" type="date" ref={input}
   aria-invalid={!!error} aria-describedby={error?"start-error":undefined}/>
  {error&&<p id="start-error" role="alert">{error}</p>}
  <button type="submit">查看统计</button>
 </form>;
}`,
'示例是已有 React 页面中的最小表单，使用原生输入与按钮保留键盘行为。label 不只是视觉文字，点击它会聚焦对应输入，读屏也能得到稳定名称；placeholder 在输入后消失，不能代替标签。验证失败时 aria-invalid 表明状态，aria-describedby 指向具体修正说明，焦点移到第一个错误字段，用户就能立即处理。大型表单可先聚焦错误摘要并提供定位链接，避免逐个字段反复抢焦点。role=alert 用于重要动态错误，不能给每个普通提示都加，造成连续打断。错误需要文字而非只靠红色，并保留用户已填资料。自动检查可找出一些缺标签问题，却无法确认提示是否清楚、顺序是否合理；仍应手动只用 Tab、Shift+Tab 和 Enter 完成提交。可访问性是一组可验证的交互行为，不是增加几个 ARIA 属性就自动完成。',
'适合统计筛选、登录与编辑表单；优先原生元素，减少自己实现键盘规则。',['只有红框，没有明确错误文字。','用 div 代替按钮却不处理键盘与焦点。'],['标签必须和输入关联。','错误要可定位、可理解。','实际键盘检查不可省略。'],[R('W3C WAI · Forms','https://www.w3.org/WAI/tutorials/forms/'),R('W3C WAI · Notifications','https://www.w3.org/WAI/tutorials/forms/notifications/')]),
lesson(25,'backend','OpenAPI 文档与请求示例','API 文档与契约表达','openapi-report-example','统计字段 total 究竟是数量还是金额？示例若没有单位，调用者容易解释错误。',['用模型给字段明确名称与描述。','提供可复制但不含真实资料的请求示例。','区分文档示例、运行时验证和测试。'],`from fastapi import FastAPI
from pydantic import BaseModel, Field
app = FastAPI()
class OrderStats(BaseModel):
    order_count: int = Field(ge=0, description="订单数")
    revenue_myr: str = Field(description="已付款金额，MYR 十进制字符串")
@app.get("/reports/orders", response_model=OrderStats)
def report():
    return {"order_count": 2, "revenue_myr": "38.00"}`, 
'代码在已有 FastAPI 环境可形成一个固定样本接口，数据不是实际统计查询。响应模型与 Field 描述会进入 OpenAPI，读者能看到计数的非负约束，以及金额的币种和字符串表达。请求示例应包含筛选范围、时区和订单状态等业务口径；如果金额只统计已付款订单，应在名称或描述中说明，不能让调用者自行猜测。OpenAPI 是可供文档、客户端生成和测试使用的契约描述，不会自动保证实现真的按该口径汇总。response_model 可以验证输出形状，但一个数值格式正确的错误统计仍能通过。示例也不会自动成为完整测试，应另准备跨日、退款、零订单等资料验证查询。对于认证接口，文档中使用虚构 ID，避免复制生产 token、邮箱或实际订单。字段演进仍要照顾旧客户端，不能把修改文档当作兼容性已经解决。',
'适合前后端并行开发和统计口径确认；此样例返回静态资料，接库需另实现。',['文档写收入，却把未支付订单也计入。','把文档示例误当成自动执行的测试。'],['字段名应带语义与单位。','文档与运行时验证职责不同。','统计口径要另行验证。'],[fast('tutorial/schema-extra-example','Declare Request Example Data'),fast('tutorial/response-model','Response Model')]),
lesson(25,'database','GROUP BY、COUNT 与 SUM','SQL 聚合查询','aggregate-order-metrics','逐条订单返回前端再相加既浪费传输，也可能漏掉分页之外的订单。',['先用 WHERE 确定统计范围。','按分类字段 GROUP BY。','区分 COUNT(*)、COUNT(column) 与 SUM 空集合。'],`SELECT status,
 COUNT(*) AS order_count,
 COALESCE(SUM(total),0) AS amount_myr
FROM orders
WHERE created_at >= :start AND created_at < :end
GROUP BY status
ORDER BY status;
-- total 使用 numeric；:start/:end 是驱动绑定参数的示意。`,
'聚合查询把多行转换为每个分组的一行结果。WHERE 先筛选进入统计的订单，GROUP BY 决定每一组的身份，COUNT(*) 数行数，SUM(total) 累加非空金额。COUNT(total) 只数 total 非空的行，因此不能随意替代订单数量；SUM 在没有输入值时可能返回 NULL，可按业务口径用 COALESCE 转成零。示例按订单状态分别统计，金额是否应纳入收入还取决于支付、退款与币种规则，不能把所有组简单相加就称为收入。没有某状态的资料时 GROUP BY 不会凭空生成该状态行，若页面需要固定展示零值类别，应以状态维表 LEFT JOIN 补齐。跨订单项 JOIN 容易把订单金额重复多次，必须先明确聚合粒度。日期边界采用半开区间避免小数秒遗漏；执行前要准备独立练习表与固定样本，未真实查询生产资料。',
'适合订单数与金额报表；多币种、退款和关联明细需先规定聚合粒度。',['JOIN 订单项后重复累加整张订单金额。','把 COUNT(total) 当作永远等于 COUNT(*)。'],['先定义统计粒度。','COUNT 与 SUM 有不同空值规则。','缺少分组不等于自动返回零。'],[pg('queries-table-expressions','Table Expressions'),pg('functions-aggregate','Aggregate Functions')])
],[node('01 / FORM','可访问的筛选','标签说明日期口径，错误能通过键盘修正。','label + input + describedby'),node('02 / CONTRACT','约定范围和单位','接口文档明确状态、时区与 MYR。','order_count / revenue_myr'),node('03 / QUERY','按同一口径汇总','数据库先过滤，再按状态聚合。','WHERE … GROUP BY status'),node('04 / RESULT','说明零值与空集合','缺失状态补齐，页面展示单位。','0 orders · RM0.00')],
'表单让范围可操作，文档让口径可理解，聚合让数据库在正确粒度计算。','用三笔订单 paid/10、paid/20、pending/5 写出分组结果，并给日期输入补标签。',['paid 是 2 笔、30 元。','pending 是 1 笔、5 元。','label 与 input 使用相同 id。'],'先按状态分桶，再分别计数求和。',`paid: {order_count:2,amount_myr:"30.00"}
pending: {order_count:1,amount_myr:"5.00"}
<label htmlFor="start">开始日期</label><input id="start" type="date"/>`,'明天：密码怎样从表单安全地进入认证流程？'));
days.push(day(26,'登录表单背后保存的是什么？','让密码管理器可用，把密码哈希和数据库登录分开。',['使用正确的自动填充语义','理解密码验证而非密码解密','区分业务账户与数据库角色'],[
lesson(26,'frontend','登录表单与密码管理器兼容','身份输入与 HTML 表单','password-manager-login','登录框禁用粘贴和自动填充，让用户更难使用长而唯一的密码，却没有增加可靠防护。',['使用稳定的 name、label 和原生 input。','账户标记 username，现有密码标记 current-password。','允许粘贴，错误不透露账户是否存在。'],`export function LoginForm() {
 return <form method="post" action="/login">
  <label htmlFor="account">邮箱</label>
  <input id="account" name="username" type="email"
   autoComplete="username" required/>
  <label htmlFor="password">密码</label>
  <input id="password" name="password" type="password"
   autoComplete="current-password" required/>
  <button type="submit">登录</button>
 </form>;
}`,
'示例是登录表单结构，假定服务端已有兼容的表单路由、HTTPS 和适当 CSRF 防护，代码本身不完成认证。autocomplete 的 username 与 current-password 帮助浏览器及密码管理器理解字段用途；注册或改密码应使用 new-password，不能一律写成相同值。type=password 只遮住屏幕文字，不会加密网络传输，也不能阻止页面脚本读取输入。不要禁止粘贴、随机生成字段名或强行关闭自动填充，这些做法常让用户放弃密码管理器。提交期间可提示正在验证，失败后给出统一的凭证错误并允许重试，具体字段错误如邮箱格式仍可明确说明。密码不应进入日志、分析事件、URL 或持久前端状态。展示密码按钮若需要，必须能用键盘操作并有清楚名称。浏览器自动填充效果要在真实表单测试，静态 JSX 不能保证所有管理器行为一致。',
'适合标准账户密码登录；单点登录和 passkey 可有不同流程。',['用 type=password 就宣称传输已加密。','把密码写入 URL、日志或 localStorage。'],['自动填充是安全体验的一部分。','屏幕遮挡不等于传输保护。','密码只进入必要的认证链路。'],[mdn('Web/HTML/Reference/Attributes/autocomplete','autocomplete'),mdn('Web/HTML/Reference/Elements/input/password','Password input')]),
lesson(26,'backend','密码哈希与登录验证','密码认证与自适应哈希','argon2-password-verify','数据库若保存明文密码，一次泄露就暴露用户的原始凭证。普通快速 SHA-256 也不适合直接保护密码。',['注册时使用专门密码哈希算法。','保存带算法与参数的编码结果。','登录时调用库的 verify，绝不解密。'],`from pwdlib import PasswordHash
password_hash = PasswordHash.recommended()
# 需要先在独立环境准备 pwdlib[argon2]。
stored = password_hash.hash("sample-only-not-a-real-password")
valid = password_hash.verify("sample-only-not-a-real-password", stored)
# 正式系统存储 stored，不记录输入密码；另加限流与统一错误。`,
'示例使用 pwdlib 的推荐密码哈希配置，依赖包含 Argon2 支持；这里的固定文字仅是练习输入。密码哈希与可逆加密不同，登录不把结果解密回来，而是用库验证输入与已存编码是否匹配。专用算法通过盐与可调成本提高离线猜测代价，库通常负责生成盐并把参数写进编码字符串。不能用固定盐、手写比较或普通快速摘要替代专门方案。参数应按部署资源评估，过高会拖垮登录服务，过低则降低抵抗猜测能力；旧参数可在成功验证后按策略升级。账号不存在时也要避免明显的响应和时间差异，配合限流、统一失败消息以及必要的多因素认证。哈希并不保证弱密码永远猜不出来，更不防止钓鱼或登录后会话被盗。示例没有搭建注册接口，也未在任何真实账户上执行。',
'适合仍需账户密码的服务。成熟身份提供商可承担该职责，应用不要重复保存不必要密码。',['用 hashlib.sha256(password) 代替密码哈希库。','记录登录请求体方便调试。'],['密码哈希不可解密。','盐与成本交给成熟库。','哈希仍需限流等多层防护。'],[fast('tutorial/security/oauth2-jwt','Password Hashing'),R('pwdlib · Guide','https://frankie567.github.io/pwdlib/guide/')]),
lesson(26,'database','凭证存储与数据库角色入门','最小权限与账户建模','business-user-vs-db-role','应用有十万个用户，不代表应创建十万个 PostgreSQL 登录角色；两种身份有不同用途。',['业务 users 表保存账户和密码哈希。','应用用有限权限的数据库角色连接。','迁移角色与运行角色分开管理。'],`CREATE TABLE app_users (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 email text NOT NULL UNIQUE,
 password_hash text NOT NULL
);
-- 以下由数据库管理员在练习环境配置，角色须已存在。
GRANT SELECT, INSERT ON app_users TO app_runtime;
-- app_runtime 不应是表 owner、superuser 或迁移管理员。`,
'业务账户是产品中的身份，例如买家、客服和管理员；PostgreSQL 角色控制数据库连接、对象权限和角色成员关系。大多数 Web 应用由后端用少量运行角色连库，再根据已认证的业务用户执行授权，并非让每个买家直接登录数据库。users 表保存密码哈希而非明文，也不应出现在通用列表响应中。示例 GRANT 只是权限片段，不包括建角色、序列权限和所有业务操作，完整授权应按真实查询需要逐项确定。运行角色不应拥有建表、改权限或绕过安全策略的能力；迁移工作由另外的受控角色完成。业务 admin 不应自动映射为数据库 superuser，这会把产品权限扩大成基础设施控制。密码哈希属于敏感资料，备份、日志、调试导出都要限制访问；只在表里保存哈希并不能让整张用户表变成可公开资料。',
'适合采用后端统一接库的多用户应用；数据库直连产品需另设计独立身份方案。',['给每位业务管理员数据库 superuser。','把 password_hash 返回给前端做比较。'],['业务身份与数据库角色不同。','哈希仍属于敏感资料。','运行与迁移权限要分开。'],[pg('user-manag','Database Roles'),pg('ddl-priv','Privileges')])
],[node('01 / INPUT','接收凭证','原生表单允许密码管理器；传输必须走 HTTPS。','autocomplete="current-password"'),node('02 / REGISTER','生成哈希','注册时由专用算法生成含盐编码。','password_hash.hash(password)'),node('03 / STORE','有限权限保存','业务账户行由应用运行角色按需操作。','app_users.password_hash'),node('04 / LOGIN','验证后建立会话','verify 成功才进入认证会话流程。','verify(input, stored_hash)')],
'密码管理器改善输入，专用哈希保护存储，数据库角色约束应用连库权限；它们分别处理不同风险。','画出注册和登录两条路径，标明原始密码、编码哈希与业务 user_id 出现的位置。',['明文不落库、不进日志。','登录调用 verify 而非解密。','业务用户不直接变成数据库角色。'],'注册产生编码，登录只比较验证结果。',`注册：HTTPS 输入 → hash(password) → 保存 password_hash
登录：HTTPS 输入 → 查账户 → verify(input, stored) → 会话
数据库连接：app_runtime；业务身份：app_users.id`,'明天：刷新页面时，怎样知道仍然登录？'));
days.push(day(27,'刷新页面后，登录态从哪里恢复？','浏览器保存会话凭证，服务器决定它是否仍有效。',['分清认证未知与未登录','配置 Cookie 的保护属性','实现会话过期与撤销检查'],[
lesson(27,'frontend','登录态初始化与认证加载状态','认证状态建模','auth-bootstrap-state','刷新时先把 user 当作 null，会短暂显示登录页；更危险的是把尚未验证当作已授权。',['初始状态明确为 checking。','请求受保护的会话查询接口。','依据结果进入 authenticated 或 anonymous。'],`type Auth = {status:"checking"}|{status:"anonymous"}|
 {status:"authenticated"; user:{id:number}}|{status:"error"};
async function loadSession(): Promise<Auth> {
 const res=await fetch("/session",{credentials:"include",cache:"no-store"});
 if(res.status===401) return {status:"anonymous"};
 if(!res.ok) return {status:"error"};
 const user=await res.json(); // 正式项目需验证形状。
 return {status:"authenticated",user};
}`,
'认证初始化有三个基础事实：还没确认、已经确认登录、已经确认未登录。示例还把网络故障单独列出，避免服务器暂时不可达就误导用户以为被登出。现有 React 页面可在挂载时调用 loadSession，并在清理时取消或忽略过期结果；示例只展示请求函数，不包含完整 Effect。HttpOnly 会话 Cookie 无法被页面脚本读取，前端也不应尝试解析它决定身份，而是让服务器验证后返回最小用户资料。checking 阶段展示中性的加载界面，别提前渲染敏感资料。缓存认证结果有助减少请求，但必须考虑会话过期、撤销、用户切换与多标签页同步。任何本地 user 对象都只是展示依据，后端仍对每个受保护请求重新执行认证和授权。初始化成功不意味着下一分钟的操作一定成功，界面还要正确处理后续 401。',
'适合 Cookie 会话的单页应用；离线模式不能把本地缓存当成新的服务端授权。',['把网络错误一律当作未登录。','读取 localStorage 的 user 就跳过服务端认证。'],['未知身份应有独立状态。','前端不读取 HttpOnly 凭证。','每个受保护请求仍需验证。'],[react('learn/synchronizing-with-effects','Effects'),mdn('Web/API/Request/credentials','Request credentials')]),
lesson(27,'backend','Cookie Session 与安全属性','服务器会话认证','opaque-cookie-session','把 user_id 放进可随意修改的 Cookie，会让浏览器自己声称身份。应发出不可猜的会话凭证并在服务器验证。',['使用安全随机生成不透明会话 token。','服务器只保存 token 摘要与关联身份。','Cookie 设置 Secure、HttpOnly、SameSite 与路径约束。'],`import secrets, hashlib
from fastapi import Response
raw = secrets.token_urlsafe(32)
token_hash = hashlib.sha256(raw.encode()).hexdigest()
# 在既有事务中保存 token_hash、user_id、expires_at。
response = Response(status_code=204)
response.set_cookie("__Host-session",raw,secure=True,
 httponly=True,samesite="lax",path="/",max_age=3600)
# __Host- 前缀还要求不设置 Domain；仅用于 HTTPS 环境。`,
'示例只是登录成功后的发放片段，不是完整路由；raw 是高熵随机凭证，不能用顺序 ID 代替。服务器收到 Cookie 后计算同一摘要，查找会话并检查过期、撤销以及用户状态。随机会话 token 的摘要存储与用户密码哈希是两种场景，不能因此把 SHA-256 当作密码哈希方案。Secure 限制安全传输，HttpOnly 防止脚本直接读取该 Cookie，SameSite 提供跨站发送约束；这些都不能保证页面不存在 XSS，也不能替代完整 CSRF 设计。__Host- 前缀要求 Secure、Path=/ 且无 Domain，在普通本地 HTTP 不应期待照样工作，应另有明确开发配置。登录或权限提升后应轮换会话，退出要撤销服务器记录并清理 Cookie。Cookie 到期只是浏览器行为，服务端过期判断仍是最终依据。签名 Cookie 保存数据与此处不透明服务端 Session 是不同方案，不能混为一谈。',
'适合可撤销的浏览器登录；跨站嵌入需重新评估 SameSite 与 CSRF，而非简单放宽。',['只有 Cookie 过期，不检查数据库过期。','认为 HttpOnly 能阻止 XSS 代用户发请求。'],['凭证应高熵且不透明。','Cookie 属性各有作用边界。','服务器负责最终有效性。'],[mdn('Web/HTTP/Reference/Headers/Set-Cookie','Set-Cookie'),R('Python · secrets','https://docs.python.org/3/library/secrets.html')]),
lesson(27,'database','Session 表、过期与撤销','认证会话生命周期','session-expiry-revocation','只清掉当前浏览器 Cookie，已被复制的凭证可能仍能继续使用。服务器需要可检查的会话记录。',['会话关联业务 user_id 与 token 摘要。','每次认证检查 expires_at 与 revoked_at。','撤销使后续检查失败，清理任务只负责回收资料。'],`CREATE TABLE sessions (
 token_hash text PRIMARY KEY,
 user_id bigint NOT NULL REFERENCES app_users(id),
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz
);
SELECT user_id FROM sessions
WHERE token_hash=:hash AND revoked_at IS NULL
 AND expires_at > now();
-- 退出：UPDATE sessions SET revoked_at=now() WHERE token_hash=:hash;`,
'会话表让服务器能立即把某枚凭证标记为撤销，而不是等浏览器自行过期。token_hash 是高熵随机凭证的摘要，不是用户密码；user_id 指向业务账户，expires_at 与 revoked_at 分别表达到期和主动失效。认证查询必须同时检查这两类条件，定时删除旧记录只减少存储，不应成为有效性判断的前提。退出后仍在运行的请求可能已通过认证，系统要按敏感度定义是否需要操作时再次检查，因此立即失效通常指后续认证检查，不能宣称撤回所有已执行动作。若把会话状态缓存在其他服务，撤销传播与缓存期限也要纳入设计。表里不存原始 token 可以降低单纯数据库读取泄露后的直接冒用风险，但数据库写入权限和应用秘密仍需保护。支持退出全部设备时，可按 user_id 撤销所有会话，并记录操作而不泄露凭证内容。',
'适合要求主动退出、封禁和设备管理的服务；大量会话查询需索引和容量规划。',['把清理任务是否执行当作会话是否过期。','日志记录原始 session token。'],['退出要改变服务端状态。','认证查询必须检查时效。','已执行的副作用不能被撤销自动追回。'],[pg('ddl-constraints','Constraints'),pg('datatype-datetime','Date/Time Types')])
],[node('01 / BOOT','初始身份未知','前端进入 checking，查询会话接口。','GET /session'),node('02 / COOKIE','携带不透明凭证','浏览器按 Cookie 策略自动附带凭证。','__Host-session=…'),node('03 / VERIFY','检查服务端记录','检查摘要、过期、撤销与用户状态。','expires_at > now() AND revoked_at IS NULL'),node('04 / UI','显示确认后的状态','有效返回最小用户资料，无效则 401。','authenticated | anonymous')],
'页面初始化只是请求身份确认；认证依据在服务器，会话表决定撤销和过期，Cookie 只运送凭证。','给三条会话分别标记有效、已过期、已撤销，写出认证过滤条件和退出动作。',['已过期与已撤销均不能通过。','退出同时撤销记录和清 Cookie。','网络错误保持 error 而不是强行 anonymous。'],'先判 revoked_at，再判 expires_at，但两个条件最终都必须成立。',`valid = revoked_at is None and expires_at > now
logout = UPDATE sessions SET revoked_at=now() WHERE token_hash=:hash
UI: checking → authenticated / anonymous / error`,'明天：登录了，为什么仍不能读取别人的订单？'));
days.push(day(28,'登录身份不是访问通行证','界面说明权限，接口检查资源，RLS 提供额外数据库边界。',['区分认证与授权','结合业务角色与资源归属','理解 RLS 的执行角色与绕过风险'],[
lesson(28,'frontend','权限界面与禁用操作提示','授权体验与交互提示','permission-ui-hints','用户看见灰色删除按钮却不知道原因；隐藏按钮又容易让开发者误以为操作已安全。',['根据服务端能力字段展示操作。','禁用时说明缺少权限或不满足状态。','仍处理操作返回的 403 与权限变化。'],`type Order = {id:number; canCancel:boolean};
export function CancelAction({order}:{order:Order}) {
 return <div>
  <button disabled={!order.canCancel}
   aria-describedby={!order.canCancel?"cancel-reason":undefined}>
   取消订单
  </button>
  {!order.canCancel&&<p id="cancel-reason">仅订单本人可取消未出货订单。</p>}
 </div>;
}`, 
'示例把服务端计算的 canCancel 当作交互提示，让页面不必复制全部角色与订单状态规则。它不构成授权边界：用户可以修改浏览器脚本、直接调用接口，按钮禁用也不会阻止其他客户端。服务端返回能力之后，订单可能已经出货或用户权限被撤销，因此真正执行时仍需重新检查，并让前端处理 403、409 或约定的其他结果。禁用按钮通常不能获得键盘焦点，原因文字应直接出现在附近，不能只放在鼠标悬浮提示里。列表中的说明 id 必须按订单生成唯一值，示例仅展示一件订单。对完全不可见的功能可以隐藏，但若用户需要理解为何不能完成任务，明确理由更有帮助。敏感资源本身也不能因为隐藏卡片就继续留在页面数据或客户端缓存中，数据返回范围必须由服务器决定。',
'适合审批、取消订单和后台编辑。单卡片示例在列表中需使用唯一 describedby id。',['把隐藏按钮当成接口授权。','只用 hover tooltip 解释禁用原因。'],['能力字段帮助界面一致。','执行时服务端重新授权。','禁用原因必须可访问。'],[mdn('Web/HTML/Reference/Attributes/disabled','disabled'),R('OWASP · Authorization','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html')]),
lesson(28,'backend','RBAC 与资源归属检查','应用授权策略','rbac-resource-ownership','普通用户通过修改 URL 的订单 ID，试图读取另一个人的订单。确认已登录仍不足以允许读取。',['从已验证会话取得业务身份与角色。','对角色和目标资源归属执行策略。','拒绝或按约定隐藏不存在、不可见资源。'],`from fastapi import HTTPException
# actor 来自认证依赖；order 来自已存在的 repository。
def ensure_can_read(actor, order):
    allowed = actor.role == "support" or order.user_id == actor.id
    if not allowed:
        raise HTTPException(status_code=403, detail="Not permitted")
# GET /orders/{id} 每次调用；不能信任 body.user_id。
# support 范围仍需租户、用途与审计限制。`,
'认证回答你是谁，授权回答你能对这份资源做什么。RBAC 用业务角色决定一类能力，例如客服可读订单；归属检查则把能力限制到具体资源，例如买家只能读自己的订单。示例用 support 和 owner 表达最小规则，正式系统通常还要租户边界、订单状态和敏感字段限制，不能把所有客服都默认设成跨组织管理员。actor 必须来自可信会话，不能直接采用请求体或 URL 里的 user_id；资源 ID 是定位条件，不是访问凭证。先取资源再拒绝与在查询中限定可见范围各有取舍，需避免泄露资源是否存在，并对团队约定 403 或 404 的策略保持一致。写操作也必须重复授权，不能因为前面读过详情就跳过。授权应集中、可测试，并覆盖直接访问接口，界面权限提示只用于改善体验。',
'适合订单、文档与多租户资源。复杂策略要在稳定授权层统一实现。',['信任客户端传来的 role=admin。','只检查已登录，没有检查目标资源归属。'],['认证与授权是两步。','业务角色还需资源范围。','每个接口都要检查。'],[R('OWASP · Authorization','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'),fast('tutorial/dependencies','Dependencies')]),
lesson(28,'database','PostgreSQL Row-Level Security 入门','数据库行级安全策略','rls-runtime-role-boundary','漏写 WHERE user_id 的查询可能读到其他人的订单。RLS 可以给受约束角色增加行过滤，但配置和连接身份决定是否生效。',['启用表级 RLS 并定义行策略。','可信服务在事务内设置业务身份上下文。','使用非 owner、非 BYPASSRLS 的运行角色验证。'],`ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_orders ON orders TO app_runtime
 USING (user_id = NULLIF(current_setting('app.user_id',true),'')::bigint)
 WITH CHECK (user_id = NULLIF(current_setting('app.user_id',true),'')::bigint);
-- 已认证服务，在同一事务内参数化设置，不采信请求自报身份：
SELECT set_config('app.user_id', :authenticated_id, true);
SELECT id FROM orders;`,
'RLS 在正常 SQL 权限之上按行约束访问，USING 控制哪些既有行可见或可操作，WITH CHECK 约束写入后的行。示例假定 app_runtime 已有必要表权限，可信后端在事务内设置业务 user_id，并确保连接池归还后不残留身份。自定义设置不是不可伪造的认证系统，若不可信客户端可直接连库或任意执行 SQL，就不能靠它证明身份；应只允许受控服务设置。表 owner 通常绕过 RLS，superuser 与 BYPASSRLS 角色也绕过；FORCE ROW LEVEL SECURITY 可约束 owner 的通常访问，但不是把超级用户变成受限用户。必须用真实运行角色测试，而不是管理员控制台看到结果就宣称隔离成功。数据库 current_user 是连接角色，不等于业务用户。RLS 能补充应用归属检查，却不能替代接口认证、权限设计和最小数据库授权。',
'适合由可信后端管理数据库连接的多用户资源；直连 SQL 和超级角色需要不同信任模型。',['用 owner 或 superuser 测试后认为策略一定生效。','连接池上设置全局身份却忘记清除。'],['RLS 与业务授权互相补充。','数据库角色不等于业务用户。','绕过角色必须单独验证。'],[pg('ddl-rowsecurity','Row Security Policies'),pg('functions-admin','System Administration Functions')])
],[node('01 / AUTHN','确认身份','会话得到业务 user_id=7。','actor.id = 7'),node('02 / AUTHZ','判断资源权限','订单归属与角色范围都进入策略。','order.user_id == actor.id'),node('03 / DATABASE','用受限角色查询','事务局部身份配合 RLS，测试绕过角色。','app_runtime + own_orders'),node('04 / UI','解释允许或拒绝','权限提示对应服务端结果，不能替代检查。','canCancel / 403')],
'认证识别身份，授权限定动作与资源，RLS 在正确角色与上下文中进一步约束行。界面隐藏不提供安全保证。','设买家 7、订单归属 9、角色 buyer，推演界面、API 与 RLS；再换成 owner 数据库角色说明风险。',['买家直接 API 请求也被拒绝。','受限运行角色看不到他人订单。','数据库 owner 测试不能代表普通运行角色。'],'把业务 role 和数据库 current_user 写在两列。',`business actor={id:7,role:"buyer"}; order.user_id=9
API: reject; runtime RLS: row hidden
DB table owner: normally bypasses RLS; do not use as runtime identity`,'明天：浏览器自动带 Cookie，怎样防止跨站伪造请求？'));
days.push(day(29,'CORS 能阻止别人替你改价吗？','分清跨源读取与跨站伪造，记录可追踪且最少的审计事实。',['在写请求中传递 CSRF token','理解 CORS 与 CSRF 的不同职责','设计不泄露凭证的审计记录'],[
lesson(29,'frontend','Cookie 请求与 CSRF Token 传递','浏览器请求安全模式','csrf-header-cookie-request','浏览器会自动带 Cookie，恶意网页可能诱导提交写请求；应用需要证明请求来自合法交互流程。',['从受保护的初始化接口取得绑定会话的 token。','写请求在自定义头中回传 token。','继续使用 Cookie 凭证并正确处理过期。'],`// csrf 来自同源受保护初始化响应，保存在当前会话内存。
async function updatePrice(csrf:string, price:string) {
 return fetch("/products/1",{
  method:"PATCH",credentials:"include",
  headers:{"Content-Type":"application/json","X-CSRF-Token":csrf},
  body:JSON.stringify({price})
 });
}
// 服务端必须验证 token；仅发送请求头不构成防护。`,
'示例采用同步器 token 的思路：服务器把随机 token 绑定当前会话，前端从合法初始化响应获得，再在危险方法的请求头中回传。HttpOnly session Cookie 仍由浏览器携带，CSRF token 是另一个用途的值，不能把读取不到 Cookie 当作无法实施 CSRF 防护。token 不应放入 URL，也不要记录到日志；会话轮换或退出后应按服务端策略重新初始化。单纯加 X-CSRF-Token 头并没有安全效果，服务器必须验证其存在和匹配，且 GET 不应执行状态修改。自定义头通常触发跨源预检，但不能把预检或 CORS 当作完整 CSRF 策略。SameSite 可降低部分跨站发送风险，却有站点与源的区别和浏览器场景限制。页面若已有 XSS，攻击脚本可能取得 token 并以用户身份操作，因此该模式不替代防注入和权限校验。',
'适合 Cookie 认证的浏览器写请求；使用项目成熟 CSRF 中间件比手写协议更可靠。',['把 token 放 URL 导致历史和日志泄露。','请求带了 token 就省略服务端比较。'],['会话凭证与 CSRF token 用途不同。','服务端验证才形成防护。','GET 不承担写操作。'],[R('OWASP · CSRF Prevention','https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html'),mdn('Web/API/Fetch_API/Using_Fetch','Using Fetch')]),
lesson(29,'backend','CSRF 防护与 CORS 的不同职责','浏览器安全边界','csrf-vs-cors-responsibilities','服务端设置了允许源列表，仍不能断言所有恶意跨站写入都被阻止。',['CORS 决定浏览器脚本是否可读跨源响应。','CSRF 校验保护自动凭证下的写入意图。','结合 token、Origin 与 SameSite，逐项验证。'],`import hmac
from fastapi import HTTPException
# 登录验证后，在写操作入口执行；session.csrf 由服务端生成。
def validate_csrf(provided: str | None, expected: str):
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=403, detail="CSRF rejected")
# 另配置精确 CORS allow_origins，credentials 场景不使用 *。
# Origin/Referer 检查与 SameSite 作为按应用设计的补充。`,
'代码仅展示同步器 token 的比较片段，expected 来自已验证会话，不能从同一请求的任意字段重新相信客户端。CORS 是浏览器跨源读取协议，服务器仍可能收到某些简单跨源请求；命令行客户端也不受 CORS 约束。因此拒绝读取响应不等于阻止状态修改。CSRF 针对浏览器自动携带身份凭证时，服务器难以区分真实操作与被诱导操作的问题，常用成熟中间件验证 token，并按场景检查 Origin 或 Referer。源由协议、主机和端口组成，站点的判定不同，SameSite 与 same-origin 不能当成同义词。允许 Cookie 的跨源接口应精确列出受信源、方法和头，同时仍执行认证与业务授权。令牌缺失、会话到期和权限不足要按约定分清处理。示例不覆盖全部浏览器边缘场景，实际项目应采用经过审查的框架方案而不是只复制比较函数。',
'适合 Cookie 会话的写 API；仅由显式 Authorization 头认证的客户端需按自身威胁模型设计。',['把 CORS 当作非浏览器客户端的权限控制。','允许凭证时随意反射任何 Origin。'],['CORS 不是身份授权。','CSRF 保护写入意图。','站点与源不是同一概念。'],[fast('tutorial/cors','CORS'),R('OWASP · CSRF Prevention','https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html')]),
lesson(29,'database','审计日志、操作者与敏感信息最小化','数据变更追踪','audit-price-change','价格突然改变却找不到是谁修改的。记录整个请求又可能泄露密码和会话凭证。',['从认证上下文取得操作者身份。','保存必要的前后值、对象与请求关联 ID。','与业务写入放在事务中，并限制审计表权限。'],`CREATE TABLE price_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 actor_id bigint NOT NULL,
 product_id bigint NOT NULL,
 old_price numeric(10,2) NOT NULL,
 new_price numeric(10,2) NOT NULL,
 request_id text NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
-- 价格 UPDATE 和对应 audit INSERT 放进同一事务。`,
'审计记录回答谁、何时、对哪个对象做了什么，而不是完整复制请求。actor_id 必须来自认证上下文，不能由请求体随意指定；request_id 用于关联服务日志，前后金额用于解释实际变化。业务修改与审计插入放在同一数据库事务，可避免成功改价却缺少对应记录，但外部日志系统是否同时收到仍需另有可靠传递方案。不要把密码、Cookie、CSRF token、完整授权头或无关个人资料写进去。审计表有记录并不自动防篡改，拥有表管理权限的人可能改删，正式系统需结合最小权限、追加写策略、外部受控归档及访问监控。保留期限应按需求制定，过度保留敏感资料同样增加风险。若记录修改前值，要从同一并发控制范围内获得，不能在写入前很久读取后就当成真实旧值。示例只是表结构，尚未执行改价或审计。',
'适合价格、权限、订单状态等关键变更。调试日志与审计日志有不同用途及保留策略。',['把客户端自报 actor_id 当作操作者。','以为普通 audit 表天然不可修改。'],['记录最少但足够的事实。','操作者来自可信认证。','审计与业务应一致提交。'],[R('OWASP · Logging','https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'),pg('tutorial-transactions','Transactions')])
],[node('01 / INIT','取得 CSRF token','合法初始化把随机 token 与当前会话绑定。','session.csrf = random_token'),node('02 / WRITE','回传写入意图','前端带 Cookie 与自定义 CSRF 头。','PATCH + X-CSRF-Token'),node('03 / VERIFY','检查不同边界','认证、CSRF、业务授权分别执行。','session → csrf → canEdit'),node('04 / AUDIT','一致记录变更','价格与最小审计事实一起提交。','UPDATE price + INSERT audit')],
'CORS 管跨源读取，CSRF 校验保护自动凭证场景下的写请求，授权限定操作，审计记录实际发生的变更。','给一次 10→12 元的改价列出允许的审计字段，再说明 Cookie 有效但 CSRF token 缺失时应怎样处理。',['缺 token 的危险写入被拒绝。','actor 来自会话，不来自 body。','日志不含 Cookie、密码或 token。'],'把身份、意图和权限分成三个检查。',`if !session: 401
if !valid_csrf: 403
if !can_edit: 403
audit={actor_id:7,product_id:1,old_price:"10.00",new_price:"12.00",request_id:"demo-1"}`,'明天：退出后为何仍显示上一位用户的订单？'));
days.push(day(30,'退出了，缓存和限流还在吗？','把用户资料隔离和登录防滥用分别做完整。',['退出时隔离用户缓存','为登录接口设计有界限流','理解 Redis 原子计数与 TTL'],[
lesson(30,'frontend','退出登录与用户缓存隔离','客户端缓存生命周期','logout-user-cache-isolation','A 退出后 B 登录，页面短暂显示 A 的订单，说明缓存没有随身份边界重置。',['请求服务端撤销会话。','取消或忽略旧身份的在途请求。','清理私有缓存并让查询键包含身份范围。'],`// 已配置 TanStack Query 的事件处理片段。
async function finishLogout(queryClient, clearIdentity) {
 await queryClient.cancelQueries();
 queryClient.clear();
 clearIdentity();
}
// 应先完成 POST /logout（带现有 CSRF 处理）。
// 私有查询键示例：["orders", user.id, tenant.id]
// 网络失败时，不能宣称服务端已完成撤销。`,
'示例假定 TanStack Query 客户端已存在，展示退出确认后的客户端收尾；实际调用先经过现有认证与 CSRF 请求封装。服务端撤销会话决定凭证还能否使用，清缓存决定页面还会不会展示上一位用户的资料，这两个动作都需要。取消查询应与请求函数使用 AbortSignal 配合；有的请求已经完成或底层不能取消，还要用身份代次或组件生命周期避免旧结果重新写回。clear 会清掉整个 QueryClient 的缓存，若系统刻意保留公开资料，可改为经过测试的精确移除策略。私有 query key 至少包含业务用户和必要租户范围，不能只使用 orders。退出失败时可清本地敏感显示并提示服务器撤销未确认，不应假装远端凭证已无效。浏览器后退、持久化缓存和多标签页也要考虑；缓存隔离减少资料混显，但不会替代后端每次请求的授权。',
'适合允许切换账号、租户或共享设备的应用。持久缓存需同步清理存储副本。',['只把 user 设为 null，保留旧查询结果。','认为取消请求保证服务器未执行。'],['退出包含远端撤销与本地清理。','查询键表达身份范围。','在途旧结果也需隔离。'],[R('TanStack Query · QueryClient','https://tanstack.com/query/latest/docs/reference/QueryClient'),R('TanStack Query · Query Cancellation','https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation')]),
lesson(30,'backend','Rate Limiting 与 429 响应','请求资源控制','login-rate-limit-policy','攻击者不断试密码，单个进程内的计数器在多实例部署时无法形成统一限制。',['定义账号与来源等限流维度。','在共享原子存储判断额度。','超限返回 429 和可解释的重试时间。'],`# 已有登录服务的策略伪代码；trusted_ip 由可信代理配置取得。
key = make_rate_key(account_identifier, trusted_ip)
count, ttl = limiter.hit(key, window_seconds=60)
if count > 5:
    raise HTTPException(status_code=429, detail="Try later",
                        headers={"Retry-After": str(max(1, ttl))})
# 命中限额前后均避免透露账户是否存在。`,
'限流限制一定范围和时间内允许的请求数量，策略必须先明确按谁计数。只按 IP 会误伤共享网络，只按账户又可能被用来锁住别人；登录常需结合多个维度和风险信号，避免简单永久封禁。示例给出固定窗口的演示阈值，并非适合所有产品的安全参数。共享计数要在多实例之间一致，来源地址也只能采用可信反向代理提供的链路，不能信任任意 X-Forwarded-For。429 表示请求过多，Retry-After 可以提示等待秒数，客户端应停止立即重发。固定窗口边界附近可能允许两段额度连续到达，严格平滑需求需令牌桶等其他算法。还要决定限流存储故障时如何降级，不同接口不能一概开放或关闭。限流降低滥用频率，不会保证密码猜测绝不成功，也不代替多因素认证、凭证泄露检查与异常监控。',
'适合登录、验证码和高成本接口；阈值必须按业务和实际流量评估。',['把用户随意提供的转发 IP 当作可信来源。','429 后由前端立即无限重试。'],['先定义限流维度。','多实例需要共享原子判断。','429 应提供有界等待方式。'],[mdn('Web/HTTP/Reference/Status/429','429 Too Many Requests'),mdn('Web/HTTP/Reference/Headers/Retry-After','Retry-After')]),
lesson(30,'database','Redis 原子计数与 TTL','共享计数与过期机制','redis-rate-counter-ttl','先 INCR 再 EXPIRE 的两次请求之间进程崩溃，计数键可能永远不过期。',['INCR 原子增加单个计数。','把首次计数与过期设置放在短 Lua 脚本内。','读取 TTL 计算等待，定义故障与窗口规则。'],`# redis-py 客户端 r 已由项目配置；此处仅展示脚本调用。
script = """
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return {n, redis.call('TTL', KEYS[1])}
"""
count, ttl = r.eval(script, 1, "login:demo-account", 60)
# 生产键不直接暴露邮箱；此处未连接 Redis。`,
'Redis 的 INCR 对单个键是原子的，但把多个命令分成多个网络往返并不会自动组成一个不可分割操作。示例用短 Lua 脚本把增加计数、首次设置过期与读取 TTL 合成一次服务端执行，避免第一次计数后尚未设置过期就中断。该算法是以第一次请求开始计时的固定窗口，窗口内后续请求不刷新 TTL；如果每次都 EXPIRE，会变成另一种持续延长窗口的规则。脚本执行会阻塞 Redis 处理其他命令，所以只能做短小有界逻辑，不能搬进复杂循环。原子执行也不等于任意运行错误都会自动回滚已完成的写入，因此应验证输入并保持脚本简单。Redis 重启、持久化、故障转移和多地域一致性仍会影响限流语义。教学示例没有测延迟或连接真实存储，计数模型只说明为什么 TTL 与计数要一起设计。',
'适合共享固定窗口计数。复杂公平性或高可用要求需评估成熟限流组件。',['以为 INCR 与独立 EXPIRE 天生一起原子执行。','每次续期却仍称为首次请求固定窗口。'],['单命令原子不等于多命令原子。','TTL 决定窗口语义。','短脚本仍需故障设计。'],[R('Redis · INCR','https://redis.io/docs/latest/commands/incr/'),R('Redis · Lua Scripting','https://redis.io/docs/latest/develop/programmability/eval-intro/')],'python')
],[node('01 / LOGOUT','撤销会话与清理','退出接口先确认远端，再隔离本地资料。','revoke session → clear private cache'),node('02 / LOGIN','确定计数范围','登录请求按受信来源和账号规则分桶。','account + trusted_ip'),node('03 / REDIS','原子计数与过期','首次请求设置 TTL，后续只增加计数。','INCR + first EXPIRE'),node('04 / RESPONSE','允许或等待','超限返回 429，不立即重发。','Retry-After: remaining TTL')],
'用户缓存隔离处理资料边界，限流处理滥用频率。两者都要考虑在途工作与共享状态，不靠一个前端按钮完成。','模拟 60 秒窗口内第 1 至 6 次登录，阈值为 5；说明退出后应清掉哪些私有资料。',['第六次返回 429。','后续请求不延长首次窗口。','旧用户的订单缓存与在途结果不重新显示。'],'把计数与首次过期分开描述，再用原子步骤组合。',`hit #1: count=1, expire_at=t0+60
hit #5: allow
hit #6: 429; Retry-After=expire_at-now
logout: revoke session; cancel/ignore old requests; clear private cache`,'明天：页面变慢时，怎样把线索串起来？'));
days.push(day(31,'页面慢，到底慢在哪里？','把渲染、请求日志和查询统计当作不同证据。',['用 Profiler 定位重渲染','用 Request ID 关联服务日志','理解聚合查询统计的局限'],[
lesson(31,'frontend','React Profiler 与重渲染定位','渲染性能观测','profiler-render-evidence','输入一个搜索字，整个商品区都更新。应先确定哪些组件渲染，而不是立刻给所有地方加 memo。',['用 Profiler 包住待观察子树。','记录提交阶段与 actualDuration。','根据交互对比改动前后的渲染证据。'],`import {Profiler} from "react";
function onRender(id,phase,actualDuration,baseDuration) {
 console.table({id,phase,actualDuration,baseDuration});
}
export function ProfiledProducts({children}) {
 return <Profiler id="Products" onRender={onRender}>
  {children}
 </Profiler>;
}`,
'Profiler 观察 React 子树在一次提交中的渲染成本，actualDuration 是本次实际渲染用时，baseDuration 是不利用记忆化时成本的估计，不是后端响应时间。示例放进既有 React 项目，用同一组资料和同一个交互进行比较；这里没有运行或宣称任何毫秒改善。开发模式、Strict Mode、机器负载和观测本身都会影响结果，不能把一次控制台数字当作生产承诺。先定位频繁更新的组件，再检查状态是否提升过高、Props 是否每次创建新对象以及列表是否一次渲染过多。memo 或 useMemo 只有在依赖与成本适合时才有价值，错误使用还会增加复杂度。网络等待、布局绘制和长任务需要浏览器其他性能工具补充，Profiler 不覆盖整条链路。生产构建默认不启用该分析能力，若要在真实环境测量须明确采用支持 profiling 的构建并评估开销。',
'适合重渲染调查与优化前后比较；网络慢先看请求证据。',['把 actualDuration 当成整个页面的加载耗时。','没有测量就给每个组件加 memo。'],['先定位再优化。','渲染时间不等于网络时间。','比较要保持相同交互条件。'],[react('reference/react/Profiler','Profiler'),react('reference/react/memo','memo')]),
lesson(31,'backend','结构化日志与 Request ID','请求可观测性','structured-log-request-id','用户只说订单很慢，日志里同时有几十条请求，无法知道哪条 SQL 属于哪次操作。',['为请求生成或验证关联 ID。','用结构化字段记录阶段、状态与耗时。','响应带回 ID，日志避免凭证与个人资料。'],`import json, logging, uuid
logger = logging.getLogger("api")
# 已有请求处理中：只采纳经格式和长度检查的外来 ID。
request_id = str(uuid.uuid4())
logger.info(json.dumps({"event":"order.read",
 "request_id":request_id,"route":"/orders/{id}",
 "status":200,"duration_ms":42}))
# 42 是示例日志值，不是本课程测量结果。`,
'结构化日志把 event、request_id、status 和 duration_ms 作为可检索字段，减少人工从自由文字猜测关系。示例只是日志格式，不代表真实请求已耗时四十二毫秒；实际耗时应使用单调时钟测量并在请求结束记录。Request ID 用于把某次入口、服务调用与数据库操作连起来，不能作为身份凭证或授权依据。若接受客户端提供的 ID，需要限定字符、长度与信任边界，避免日志污染和高基数字段失控；也可以由可信网关生成。路由宜记录模板而非把所有资源 ID 塞入指标标签，错误日志可保留必要诊断但必须脱敏。跨服务系统可能还需 Trace ID 与跨度，而一个字符串不会自动形成完整分布式追踪。前端向客服提供请求 ID 能缩小调查范围，但服务端仍要分别测量排队、外部请求与查询阶段，才能判断真正瓶颈。',
'适合并发 API 排查；需配套日志收集、时钟测量与访问权限。',['把 Authorization、Cookie 或密码写进日志。','把请求 ID 当成可信用户身份。'],['日志字段需要稳定结构。','关联 ID 只用于定位。','测量与示例数值应分清。'],[R('Python · logging','https://docs.python.org/3/library/logging.html'),R('OWASP · Logging','https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html')]),
lesson(31,'database','慢查询与 pg_stat_statements','数据库工作负载观测','pg-stat-statements-workload','某查询平均不算最慢，却被调用十万次，累计占用了大量数据库时间。',['在授权的测试环境准备扩展配置。','按总时间、次数与平均时间分别观察。','再用具体查询与执行计划调查原因。'],`-- 前提：管理员已配置并启用 pg_stat_statements。
SELECT queryid, calls, total_exec_time, mean_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
-- 聚合统计不等于单次请求追踪，也不是墙钟端到端耗时。`,
'pg_stat_statements 按归一化的语句统计执行次数和累计执行成本，能帮助发现高频轻查询与低频重查询。它需要扩展和服务器预加载等配置，不能只复制 SELECT 就假定任何数据库都有该视图。total_exec_time 反映累计执行时间，mean_exec_time 是平均值；平均会隐藏长尾，统计窗口和重置时间也会改变解释。queryid 通常对应一类语句，并不是某次 HTTP 请求 ID，所以要用应用日志和必要的追踪补足关联。看到大量时间不能直接断言缺索引，应再检查执行计划、行数估计、锁等待、参数分布和查询次数。EXPLAIN ANALYZE 会实际执行语句，尤其写语句不能随意对真实资料运行。统计内容可能包含敏感查询形状，应限制可见权限。本例仅展示调查查询，没有启用扩展、重置统计或测量任何真实数据库。',
'适合数据库整体工作负载排查；单次锁等待需配合 pg_stat_activity 等证据。',['把平均值当作所有请求都相同。','在不了解副作用时运行写语句 EXPLAIN ANALYZE。'],['累计时间与平均时间都要看。','统计视图不是请求追踪。','查询计划需要进一步验证。'],[pg('pgstatstatements','pg_stat_statements'),pg('using-explain','Using EXPLAIN')])
],[node('01 / UI','重现具体交互','固定资料与操作，观察 React 提交。','Profiler actualDuration'),node('02 / REQUEST','找到对应请求','从响应或日志拿到请求关联 ID。','request_id = demo-31'),node('03 / SERVER','分解服务阶段','比较排队、业务处理和数据库阶段。','structured event + measured duration'),node('04 / DATABASE','检查负载证据','按次数与总成本定位，再调查计划和等待。','calls × mean_exec_time')],
'观测工具各覆盖一段边界。要让慢的判断有范围、有单位、有样本，不能把某个数字当作全链路答案。','给三类查询 calls/mean_ms 为 1000/2、5/100、100/8，算出累计时间并说明优先调查谁。',['累计分别为 2000、500、800 毫秒。','平均最慢与累计最高不是同一个。','不把样本计算称为实测性能。'],'先计算 calls × mean，再分别排序。',`A:1000×2=2000ms total; B:5×100=500ms; C:100×8=800ms
按累计影响先看 A；单次慢请求仍应调查 B 的尾部与上下文。`,'明天：async 为什么仍会阻塞所有请求？'));
days.push(day(32,'写了 async，就不会堵住了吗？','分开加载代码、等待 I/O 和管理数据库连接。',['按路由延迟加载组件','识别事件循环中的阻塞调用','为连接池设置容量和归还边界'],[
lesson(32,'frontend','Lazy Loading 与代码分割','模块加载与 React Suspense','lazy-route-code-splitting','用户只打开商品页，却下载了报表编辑器全部代码。按需加载可以减少初始代码需求。',['在模块顶层声明 lazy。','动态 import 指向有默认导出的组件。','用 Suspense 提供加载占位并处理失败。'],`import {lazy,Suspense} from "react";
const ReportPage=lazy(()=>import("./ReportPage"));
export function ReportsRoute() {
 return <Suspense fallback={<p>正在加载报表页面…</p>}>
   <ReportPage/>
 </Suspense>;
}
// ReportPage.tsx 必须 default export；路由外层另放 Error Boundary。`,
'这段放在支持动态 import 的既有 React 构建项目中，ReportPage 由独立模块默认导出。lazy 在组件真正需要渲染时请求模块，构建器通常据此分出代码块，Suspense 在模块尚未就绪时展示替代内容。它不表示所有接口资料都会自动由 Suspense 管理，也不消除模块内部的重计算。lazy 应在模块顶层声明，如果每次组件执行都重新创建，可能导致状态被重置。拆得越细不一定越快，频繁的小块请求和相互依赖可能形成瀑布，应按有意义的路由或重型功能切分，并用真实构建结果验证。动态模块下载失败需要 Error Boundary 和可恢复提示，发布时删除旧资源还可能影响仍开着旧页面的用户。示例没有生产构建或测量下载体积，只说明按需模块加载的机制。对于用户马上就要访问的页面，可按产品节奏预加载，而非让每次点击都从零等待。',
'适合报表、编辑器等少用而较重的页面；小组件不必处处切块。',['在组件内部反复调用 lazy 定义组件。','把代码块加载和普通 fetch 加载混为一谈。'],['按功能边界拆代码。','Suspense 需要有意义的占位。','失败和旧资源也要处理。'],[react('reference/react/lazy','lazy'),react('reference/react/Suspense','Suspense')]),
lesson(32,'backend','async I/O、阻塞调用与 CPU 工作','Python 并发执行模型','async-blocking-cpu-boundary','async def 中调用 time.sleep 或同步 HTTP 客户端，仍会堵住当前事件循环。',['await 只有等待可协作 I/O 时才让出执行。','短的阻塞 I/O 可移交受限线程。','CPU 密集工作使用合适的进程或后台任务。'],`import asyncio
from pathlib import Path
async def read_report_template():
    # pathlib.read_text 是同步 I/O；示例交给线程。
    return await asyncio.to_thread(
        Path("template.txt").read_text, encoding="utf-8")
# 网络请求优先使用真正异步客户端并设置超时。
# 大型 CPU 计算不要误以为加 async 就能并行。`,
'async 函数在事件循环里运行，只有遇到实际可等待的操作并挂起时，其他任务才有机会执行。给同步代码外面套 async 不会改变它的阻塞行为；time.sleep、同步网络请求或长循环仍会占住线程。示例依赖 Python 3.9 以上，把文件读取移给线程，文件必须已准备好，课程没有执行读盘。to_thread 适合阻塞 I/O，不代表所有 CPU 工作都能借线程提速；传统 CPython 的 GIL、扩展实现和运行构建都会影响 CPU 并行能力，应按环境选择进程池或持久任务服务。线程数量和待处理工作也需有界，否则只是把阻塞换成资源耗尽。取消等待不保证底层线程或外部副作用立即停止，所以超时、清理和幂等仍需单独设计。FastAPI 的同步路由有框架调度策略，不能据此把同步函数随意从 async 路由直接调用并期待自动转线程。',
'适合异步 Web 服务混用旧版 I/O 库的过渡；重型报表通常更适合有界后台任务。',['认为 async 关键字会自动把同步调用移到线程。','取消 await 就宣称底层工作必已停止。'],['协作式等待才释放事件循环。','线程工作仍要有界。','CPU 与 I/O 需要不同策略。'],[R('Python · asyncio.to_thread','https://docs.python.org/3/library/asyncio-task.html#asyncio.to_thread'),fast('async','Concurrency and async / await')]),
lesson(32,'database','Connection Pooling 连接池','数据库连接生命周期','bounded-connection-pool','每个请求建立新连接成本高；连接池无限扩张又会压垮数据库。',['进程启动时创建受限池。','请求短暂借用并通过上下文归还。','设置等待超时并考虑多实例总连接数。'],`from psycopg_pool import ConnectionPool
# 独立环境已有 psycopg_pool；conninfo 由安全配置提供。
with ConnectionPool(conninfo=conninfo,min_size=1,max_size=5,
                    timeout=3) as pool:
    with pool.connection() as conn:
        rows = conn.execute("SELECT id FROM products LIMIT 5").fetchall()
# Web 服务中池通常放在 lifespan，而非每个请求创建。`,
'连接池复用已建立的连接，但并不会让一条连接同时安全执行任意数量的独立事务。示例用同步 Psycopg 池演示借出与归还，真实异步路由应采用异步池或框架明确的同步执行策略，避免阻塞事件循环。池应属于进程生命周期，不能每个请求新建一个池；上下文在成功时提交、异常时回滚并归还可用连接，具体行为仍按驱动文档确认。max_size 是每个池的上限，多实例、多进程相乘后才是数据库可能承受的总连接数，还要为迁移和管理保留额度。池满后请求会等待，需设置有限等待、监控占用与超时，而不是无限排队。事务内不要等待外部慢请求或用户确认，否则连接长期被占住。若使用事务局部身份供 RLS，必须确保同一事务并在归还前清理会话状态。增加连接数可能增加数据库争用，不能当作通用加速按钮。',
'适合长期运行的 API 服务；无服务器环境和代理池有不同生命周期约束。',['每个请求创建独立连接池。','只算单实例 max_size，忽略全部进程总数。'],['池容量必须有界。','连接借用范围应短。','归还包含事务和身份清理。'],[R('Psycopg · Connection pools','https://www.psycopg.org/psycopg3/docs/advanced/pool.html'),fast('advanced/events','Lifespan Events')])
],[node('01 / MODULE','按需加载报表','只在进入功能时需要该代码模块。','lazy(import ReportPage)'),node('02 / LOOP','识别等待类型','可等待 I/O 与同步阻塞不能混淆。','await async_io ≠ sync_block()'),node('03 / POOL','借用受限连接','数据库阶段借用，结束后归还。','with pool.connection()'),node('04 / CAPACITY','计算整体上限','多进程总数加上管理保留共同受数据库约束。','instances × workers × max_size')],
'代码分割减少初始模块需求，异步 I/O 改善等待调度，连接池限制数据库资源。三者不等于保证响应时间。','部署有 2 个实例、每实例 3 个进程、每池最多 5 条连接，数据库允许 40 条并预留 8 条。计算是否超出额度。',['业务池最多 30 条。','加预留总计 38 条。','说明增加池上限不是无成本。'],'先乘实例、进程和池大小，再加管理预留。',`2 × 3 × 5 = 30 application connections
30 + 8 reserve = 38 <= 40
仍需测量数据库负载、池等待与请求上限。`,'明天：大量订单怎样只渲染和查询需要的一段？'));
days.push(day(33,'一万笔订单，不必全部进入页面','虚拟化减少 DOM，游标和 Keyset 减少翻页歧义。',['计算固定行高的可视窗口','定义与筛选绑定的分页游标','用复合排序键进行 Keyset 查询'],[
lesson(33,'frontend','列表虚拟化与可视区域渲染','长列表渲染技术','fixed-height-virtual-window','一万条资料已在内存，仍把一万个节点放进 DOM，会增加渲染和布局负担。',['根据 scrollTop 和行高算起始索引。','仅渲染可视区加少量 overscan。','用占位高度保持滚动位置和稳定 key。'],`const rowHeight=40, viewportHeight=240, overscan=2;
const first=Math.floor(scrollTop/rowHeight);
const start=Math.max(0,first-overscan);
const end=Math.min(items.length,
 Math.ceil((scrollTop+viewportHeight)/rowHeight)+overscan);
const visible=items.slice(start,end);
// 容器总高度 items.length*rowHeight。
// 可视行绝对定位到 (start+i)*rowHeight，key 使用 item.id。`,
'这是固定行高列表的核心计算片段，需要已有滚动容器、scrollTop 状态和定位样式，不是完整虚拟化组件。start 与 end 决定当前保留的行，overscan 在视区上下多留几行，降低快速滚动时的空白；总高度占位让滚动条仍代表整份资料。它只减少 DOM 数量，不会减少已下载资料，也不能替代服务端分页。真实行高变化、窗口缩放、键盘导航和读屏访问会让实现复杂，成熟虚拟化库通常更可靠。移出视区的行可能卸载，所以输入草稿和选择状态不能只存在行组件内部；稳定 ID 仍重要。浏览器查找和打印也可能只见到已渲染片段，需要提供适合的替代方式。不能仅凭节点数量下降就宣称页面快了多少毫秒，仍要用实际交互测量并验证可访问性。简单短列表优先保留普通列表，避免为小收益引入复杂滚动行为。',
'适合大量固定高度记录；动态高度应采用经过验证的虚拟化方案。',['虚拟化后仍以数组索引保存行内编辑身份。','以为少渲染 DOM 就已经少查数据库。'],['虚拟化控制 DOM 范围。','占位高度维持滚动几何。','行状态需按稳定身份保存。'],[R('TanStack Virtual · Introduction','https://tanstack.com/virtual/latest/docs/introduction'),react('learn/rendering-lists','Rendering Lists')]),
lesson(33,'backend','Cursor-Based Pagination API','分页契约与游标','cursor-page-contract','OFFSET 翻到下一页时新订单插入前面，用户可能再次看见上一页最后一条。',['选择稳定且唯一的排序元组。','游标编码上一页最后一条的位置和筛选范围。','限制 page size 并验证游标，不信任编码内容。'],`# 接口契约示例，不是完整签名游标实现。
# GET /orders?limit=2&after=<opaque-cursor>
response = {
 "items": [{"id":9,"created_at":"2026-11-02T10:00:00Z"}],
 "next_cursor": "opaque-position-bound-to-filter",
 "has_more": True,
}
# 游标内部位置：(created_at,id)，并绑定 tenant/filter/order 版本。
# base64 只编码，不加密，也不证明游标可信。`,
'游标代表排序中的位置，而不是第几页。按 created_at DESC、id DESC 排序时，下一页从上一页最后一条的元组之后继续查，避免把当前位置表达成会随插入而移动的行数。接口通常获取 limit+1 条判断 has_more，再返回最多 limit 条，并把最后一条的位置编码进 next_cursor。游标还应绑定租户、筛选和排序版本，不能把某筛选的游标直接应用到另一范围；需要防篡改时使用受控存储或签名，base64 本身没有安全性。即使游标有效，认证与资源权限仍要在每次查询执行。该方式不方便随机跳到第几十页，也不天然提供总数。资料在翻页间被修改排序字段或删除仍可能造成体验变化，严格快照浏览需要额外一致性设计。示例没有实现加密、签名或运行接口，只定义客户端应如何理解 opaque 游标。',
'适合按时间浏览订单和消息；需要随机页码跳转的报表可另选分页策略。',['解码游标得到租户后直接相信其权限。','把 base64 当作加密和防篡改。'],['游标表示稳定排序位置。','筛选范围必须绑定。','游标不是权限凭证。'],[pg('queries-limit','LIMIT and OFFSET'),R('Google AIP · Pagination','https://google.aip.dev/158')],'python'),
lesson(33,'database','Keyset Pagination 与索引配合','有序范围查询','keyset-composite-order','同秒创建的多笔订单若只用 created_at 翻页，会跳过或重复相同时间的记录。',['添加唯一 id 作为排序平局条件。','下一页用相同元组方向作范围比较。','为租户过滤和排序列建立合适索引。'],`CREATE INDEX orders_tenant_time_id
ON orders(tenant_id,created_at DESC,id DESC);
SELECT id,created_at FROM orders
WHERE tenant_id=:tenant
 AND (created_at,id) < (:last_time,:last_id)
ORDER BY created_at DESC,id DESC
LIMIT :page_size;
-- 排序列约定 NOT NULL；参数由驱动安全绑定。`,
'Keyset 根据上一页最后一个排序键限定下一段范围，示例以时间和唯一 ID 组成降序元组。同一时间内 ID 更小的行仍会被正确纳入，因此不丢失平局记录。索引先放等值过滤 tenant_id，再放排序列，可让数据库有机会沿目标范围读取，但具体计划仍由资料分布和优化器决定，课程不宣称一定扫描几行或固定耗时。元组比较需要与 ORDER BY 的方向一致，混合升降序或 NULL 会更复杂，所以练习先约定两列均非空且都降序。第一页没有位置条件，后续页才带范围。该方法避免较大 OFFSET 必须跳过前面大量行的模式，却不能提供跨多次请求的一致快照，排序字段被修改仍可能移动记录。索引会占空间并增加写入维护成本，不能为了每个排列都无节制建索引。必须用真实查询计划与正确性样本确认。',
'适合租户内按创建时间浏览的记录；复杂排序和空值要先写出完整比较规则。',['只用时间作游标，忽略同秒多行。','范围用 <，排序却换成升序。'],['排序需要唯一平局键。','比较方向与排序一致。','索引是否采用需看计划。'],[pg('indexes-multicolumn','Multicolumn Indexes'),pg('functions-comparisons','Row and Array Comparisons')])
],[node('01 / ORDER','确定唯一顺序','时间相同则按 ID 排序。','ORDER BY created_at DESC,id DESC'),node('02 / CURSOR','记住末尾元组','响应把最后一行位置放入受约束游标。','last = (time,id)'),node('03 / QUERY','继续读下一段','相同筛选与方向下执行范围比较。','(time,id) < (:time,:id)'),node('04 / VIEW','仅渲染视区','下载范围与 DOM 范围分别管理。','visible = items.slice(start,end)')],
'游标和 Keyset 定义稳定的读取位置，虚拟化控制已加载资料的渲染数量，不能互相当成替代方案。','给同一时间的订单 ID 9、8、7 和更早时间的 ID 6，按每页两条写出第二页条件与结果。',['第一页为 9、8。','第二页包含同时间 ID7 和更早 ID6。','游标同时保存时间与 ID8。'],'把二元组按字典顺序比较。',`cursor=(2026-11-02T10:00:00Z,8)
WHERE (created_at,id)<(:cursor_time,8)
ORDER BY created_at DESC,id DESC
page2 = [7,6]`,'明天：不同筛选为何会读到同一份缓存？'));
days.push(day(34,'改了价格，缓存为何还显示旧值？','浏览器查询键和服务端缓存键都要表达资料范围。',['让 Query Key 包含所有依赖','理解 Cache-Aside 的读取路径','设计 TTL 与写后失效'],[
lesson(34,'frontend','Query Key 与不同筛选条件的缓存','服务端状态缓存身份','query-key-filter-identity','页面切到点心分类，却短暂显示饮品缓存，原因可能是两个请求用了相同查询键。',['把请求依赖放进序列化查询键。','查询函数与键使用同一组参数。','写后失效正确范围，并隔离用户或租户。'],`import {useQuery} from "@tanstack/react-query";
function useProducts(tenantId:number,category:number,maxPrice:string) {
 return useQuery({
  queryKey:["products",tenantId,{category,maxPrice}],
  queryFn:({signal})=>fetch(
   "/products?category="+category+"&max_price="+encodeURIComponent(maxPrice),
   {signal}).then(r=>{if(!r.ok)throw Error("读取失败");return r.json();})
 });
}`, 
'示例使用已配置 QueryClientProvider 的 TanStack Query 项目，tenantId 来自可信登录上下文但仍由服务端验证。Query Key 是缓存身份，category 与 maxPrice 改变了响应，就必须进入键；键变动后库能区分旧数据和新范围。对象键会由库稳定哈希，但数组顺序具有意义，不能把不可序列化函数或随机值放进去。查询函数应使用与键一致、规范化后的参数，例如空字符串和缺省值是否等价要先约定。用户和租户的私有资料也要包含身份范围并在切换时清理，键名本身不构成访问授权。改价后可让相关 products 查询失效，但不能以为浏览器缓存刷新就同步清掉服务端 Redis。缓存可暂存旧值以改善交互，界面应按需要说明刷新中；会影响交易的最终价格仍由服务端下单时确认。课程没有启动查询或测量缓存命中率。',
'适合筛选、排序和分页资料；极简单本地计算无需 Query Key。',['查询函数读 category，键里却只有 products。','给私有查询遗漏用户或租户范围。'],['查询键就是缓存身份。','依赖变化应进入键。','浏览器与服务端缓存分别失效。'],[R('TanStack Query · Query Keys','https://tanstack.com/query/latest/docs/framework/react/guides/query-keys'),R('TanStack Query · Invalidation','https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation')]),
lesson(34,'backend','Redis Cache-Aside','旁路缓存读写模式','redis-cache-aside-path','每次商品详情都查库成本高，但缓存又可能在改价后变旧，需要清楚的读取和失效顺序。',['先查缓存，未命中才读数据库。','数据库结果写入带 TTL 的缓存。','数据库提交后失效相关键并处理竞态。'],`# 已有 Redis 客户端、repo 与 JSON 编解码工具的伪代码。
def get_product(tenant_id, product_id):
    key = f"product:v1:{tenant_id}:{product_id}"
    cached = cache.get(key)
    if cached is not None:
        return decode(cached)
    product = repo.read_authorized(tenant_id, product_id)
    cache.set(key, encode(product), ex=60)
    return product
# 写入：DB commit → invalidate key；TTL 是后备，不保证立刻一致。`,
'Cache-Aside 让应用自行负责缓存路径：命中就返回，未命中才查持久库并回填。示例中的 cache、repo、encode 和 decode 都是既有依赖的概念接口，不代表已连接 Redis；授权查询不能因为走缓存而被绕过。写操作通常先提交数据库，再删除受影响缓存，避免数据库回滚却已经让缓存表示未发生的变更。即使如此，仍有读请求在旧值读取后才回填的竞态，删除键不提供强一致保证，TTL 只是限制陈旧值通常存活的时间。严格价格一致性应在交易路径以数据库为准，或采用版本化值和经过验证的协调方案。热点键过期时可能出现大量请求同时查库，需要适当的单次回填协调和容量控制。缓存故障可按可用性目标回源，但不能让无限回源拖垮数据库；需要超时和降级策略。缓存只是可丢弃副本，不应成为唯一资料来源。',
'适合允许短暂陈旧的商品详情；支付、库存等强约束不能单靠缓存。',['把缓存当成唯一事实来源。','提交前更新缓存，事务失败却留下新值。'],['数据库是持久事实来源。','提交后失效仍存在竞态。','TTL 不等于强一致。'],[R('Redis · SET','https://redis.io/docs/latest/commands/set/'),R('Azure Architecture · Cache-Aside','https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside')]),
lesson(34,'database','缓存键、TTL 与失效策略','缓存一致性与数据范围','cache-key-ttl-invalidation','商品详情已刷新，分类列表却仍显示旧价，说明一个资料变化影响多个缓存表示。',['列出详情与列表的依赖关系。','键包含版本、租户和查询维度。','定义精确删除、版本轮换或短 TTL 的取舍。'],`-- 持久事实仍在 products；以下为缓存策略草案。
-- detail: product:v1:tenant7:42
-- list: products:v2:tenant7:category3:sort-price
-- price UPDATE commit 后：
-- 1. 删除详情键
-- 2. 删除已知受影响列表键，或轮换该租户列表版本
-- 3. TTL 为漏失效提供有限陈旧窗口；非原子跨库事务`,
'缓存键既定义命名空间，也决定资料是否被错误共享。仅使用 product:42 可能在多租户环境混合相同局部 ID，列表键还必须表达筛选、排序、分页与可见范围。TTL 从写入时开始还是访问时续期要明确，热门条目若无限续期又没有失效机制，旧价格可能持续存在。改价会影响详情、列表排序与统计，无法只删除一个键就断言全部表示一致。精确删除要求知道依赖键，版本轮换可批量逻辑失效但旧键仍占空间直到过期；短 TTL 更简单，却允许更久的陈旧。PostgreSQL 提交与 Redis 删除不是天然同一事务，进程中断可能留下未失效缓存，可按需求用 outbox 可靠传递失效事件。不能用 Redis 键名隐藏替代认证授权，也不应在键里放明文个人资料。示例只是策略说明，未运行跨库写入。',
'适合多表示、多租户的缓存设计；先明确可接受陈旧程度再选择复杂度。',['详情失效后就认为所有列表也刷新了。','缓存键直接包含敏感邮箱或完整 token。'],['键必须表达完整资料范围。','失效策略有一致性取舍。','跨存储步骤不天然原子。'],[R('Redis · EXPIRE','https://redis.io/docs/latest/commands/expire/'),R('Azure Architecture · Cache-Aside','https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside')],'text')
],[node('01 / KEY','表达查询身份','浏览器键含租户与筛选。','[products,tenant,{category,maxPrice}]'),node('02 / READ','未命中才回源','服务端键覆盖同一资料范围。','cache miss → DB → cache'),node('03 / WRITE','先提交事实','价格修改提交后再触发失效。','COMMIT → invalidate'),node('04 / STALE','处理遗漏和竞态','TTL、版本与可靠事件各有代价。','stale window ≠ strong consistency')],
'浏览器缓存和 Redis 都是数据库事实的副本。先定义身份、允许陈旧时间和写后影响，再写缓存代码。','给租户7、商品42、分类3列出详情和列表键，说明改价后要失效哪些表示。',['详情键含租户和商品身份。','列表键含筛选与排序。','明确 Redis 删除不与 PostgreSQL 提交自动原子。'],'从页面所有显示该价格的位置反推依赖。',`product:v1:tenant7:42
products:v2:tenant7:category3:sort-price
DB commit → delete detail + invalidate affected lists
若要求可靠失效，可事务写 outbox；交易价格仍以 DB 为准。`,'明天：订单已创建，通知却没有发出去怎么办？'));
days.push(day(35,'下单成功后，通知怎样可靠排队？','界面状态、进程任务和事务 Outbox 各负责一段。',['明确未读状态的事实来源','区分响应后任务与持久队列','理解 Outbox 与至少一次投递'],[
lesson(35,'frontend','通知中心与未读状态','异步通知交互','notification-unread-model','用户在一台设备读过通知，另一台仍显示未读。只在浏览器里减一无法形成一致状态。',['用通知稳定 ID 与 read_at 表示状态。','读取和标记已读由服务端持久保存。','乐观标记失败时恢复并重新同步。'],`type Notice={id:number;title:string;read_at:string|null};
function unreadCount(items:Notice[]) {
 return items.filter(n=>n.read_at===null).length;
}
function markLocalRead(items:Notice[],id:number,at:string) {
 return items.map(n=>n.id===id?{...n,read_at:at}:n);
}
// PATCH /notifications/{id}/read 成功后采用服务器 read_at。
// 分页列表的局部计数不等于全账户未读总数。`,
'通知是否已读是一份会跨设备同步的业务状态，应由服务器保存，而不是把红点当作仅前端的装饰。示例使用 read_at=null 表示未读，按稳定 ID 不可变更新数组；实际已读时间应采用服务器确认值，不能让客户端随便伪造审计时间。点击时可以乐观去掉未读标记，但请求失败要回滚或重新获取，重复标记应按业务设计成幂等。通知列表常有分页，当前页数出的未读数量不是全部未读总数，服务端可另提供总量口径。未读标识不能只靠颜色，文字或可访问名称也应表达状态。收到实时事件不保证从未断线，重新连接或页面恢复时仍需补取持久资料。通知创建成功、入队、推送到设备和用户读过是不同阶段，界面不能把其中一个状态冒充另一个。课程只演示本地资料变换，没有发送通知。',
'适合订单提醒和站内通知；全量未读统计应由正确范围的服务端结果提供。',['把已加载第一页的未读数当作账户总数。','收到 WebSocket 事件就认为用户已经阅读。'],['未读是持久业务状态。','局部列表与总数不同。','通知阶段不能混同。'],[react('learn/updating-arrays-in-state','Updating Arrays'),mdn('Web/Accessibility/ARIA/Reference/Attributes/aria-label','aria-label')]),
lesson(35,'backend','进程内后台任务与持久队列','响应后工作与可靠任务','background-vs-durable-queue','接口响应成功后，进程还没发送通知就崩溃，普通后台函数不会自动在重启后恢复。',['识别短小的尽力而为任务。','可靠工作持久入队并由 worker 执行。','消费者处理重复投递和确认时机。'],`from fastapi import FastAPI, BackgroundTasks
app=FastAPI()
def write_demo_log():
    print("demo response finished")
@app.post("/demo")
def demo(tasks:BackgroundTasks):
    tasks.add_task(write_demo_log)
    return {"accepted":True}
# 这是进程内任务，不是持久队列；关键通知另走 outbox/worker。`,
'FastAPI BackgroundTasks 可在响应发送后执行小任务，但任务属于当前进程，重启或崩溃时没有自动持久恢复保证。示例仅打印教学文字，不发送消息。适合可接受丢失的辅助工作，不应仅凭 accepted=true 就宣称关键通知可靠投递。持久队列把任务存放在可恢复存储，由独立 worker 取出执行，并定义成功确认、失败重试和死信处理。常见可靠队列提供至少一次处理机会，网络中断可能导致已完成工作再次被取出，所以通知消费者需要事件 ID 去重或业务幂等。直接先提交订单再调用队列仍有双写缺口，进程可能夹在中间崩溃；事务 Outbox 解决的是业务与待发事件共同保存，不是保证外部消费者刚好执行一次。选择工具之前先定义允许丢失、允许延迟以及重复影响，别把所有响应后的工作都当作同一可靠级别。',
'适合把响应后任务按可靠性分级；持久队列部署和运行属于额外基础设施。',['把 BackgroundTasks 当成自带崩溃恢复的任务队列。','队列返回确认就宣称用户已收到通知。'],['进程内任务可能丢失。','持久队列需要确认和重试。','重复执行必须可处理。'],[fast('tutorial/background-tasks','Background Tasks'),R('AWS · Transactional Outbox','https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html')]),
lesson(35,'database','Transactional Outbox','事务事件可靠交付模式','transactional-outbox-atomicity','订单写库成功而入队失败，或队列成功而订单回滚，都会让通知和事实不一致。',['同一数据库事务写订单与 outbox。','提交后发布者读取待发送事件。','发送后标记进度，消费者用事件 ID 幂等。'],`BEGIN;
INSERT INTO orders(id,user_id,total) VALUES (100,7,20);
INSERT INTO outbox(event_id,event_type,payload)
VALUES ('demo-event-100','order.created','{"order_id":100}');
COMMIT;
-- outbox 表及字段须先在独立练习库准备。
-- worker 发布成功后再记录 sent_at；崩溃可能造成重复发送。`,
'Outbox 把业务变化与待发送事件放在同一持久事务，只有两者都写成才提交。因此订单存在时，系统至少有一份可恢复的待处理通知事实，而不是靠进程内回调记住。示例依赖预先建立的订单与 outbox 表，固定 ID 只用于独立练习，重复执行会触发冲突。发布者在事务外与队列交互，成功后标记进度；若已经发送但尚未标记就崩溃，恢复后可能再次发布，所以它通常需要至少一次语义和消费者幂等，不能宣传端到端恰好一次。多个 worker 可用适当锁与领取机制协调，处理顺序也需要按业务定义。payload 应带必要身份和版本，不要复制密码、token 或过量个人资料。Outbox 增加存储、轮询和清理成本，监控积压与最老待发时间很重要。它保护本数据库事务内的事实一致，不能原子地回滚已经发出的外部消息。',
'适合订单、账务事件和关键通知；无需可靠性的轻任务可采用更简单方案。',['发送后再标记就以为不会重复。','业务表与 outbox 用两个独立事务写入。'],['业务与事件同事务。','发布与标记间仍可能重复。','消费者幂等是必要配套。'],[pg('tutorial-transactions','Transactions'),R('AWS · Transactional Outbox','https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html')])
],[node('01 / TRANSACTION','保存业务与事件','订单和 outbox 在一个事务。','INSERT order; INSERT outbox; COMMIT'),node('02 / PUBLISH','读取持久待办','发布者崩溃后能重新发现事件。','pending outbox event'),node('03 / CONSUME','幂等创建通知','相同 event_id 重投不会重复创建业务通知。','UNIQUE(event_id,recipient_id)'),node('04 / READ','用户标记已读','设备同步 read_at，不等同于已投递。','notification.read_at')],
'Outbox 关闭订单与待发事件的双写缺口，队列负责后续处理，通知中心保存阅读状态；仍需处理重复和积压。','推演 worker 在发出事件后、标记 sent_at 前崩溃。写出重启后的事件数量与去重办法。',['同一事件可能再次发布。','订单不需要重新创建。','消费者使用 event_id 与接收人唯一约束。'],'把持久 outbox 状态和外部发送结果分开画。',`DB: order exists; outbox.sent_at=NULL
Queue: event-100 may already exist
Restart: publish event-100 again
Consumer: UNIQUE(event_id,recipient_id) → one notification`,'明天：报表一直失败，应该重试多少次？'));
days.push(day(36,'报表失败后，还要一直重试吗？','轮询、任务重试和状态机都需要明确停止条件。',['轮询终态后停止','设计指数退避与死信边界','记录任务尝试次数和领取状态'],[
lesson(36,'frontend','长任务轮询、退避与停止条件','异步任务进度交互','bounded-job-polling','每秒查询一次已经失败的报表，既浪费请求，也让用户一直看见正在生成。',['区分排队、运行、成功和失败终态。','用递增间隔查询并设置总预算。','离开页面清理计时器与请求。'],`const terminal = new Set(["succeeded","failed","cancelled"]);
function nextPollDelay(pollIndex:number) {
 return Math.min(1000 * 2**pollIndex, 10000);
}
// 已有轮询控制器中：
// const job = await getJob(id, {signal});
// if (terminal.has(job.status) || pollIndex >= 8) stopPolling();
// else schedule(nextPollDelay(pollIndex));
// 组件清理时 clearTimeout(timer); controller.abort();`,
'示例提供可直接测试的退避计算与轮询控制约定，getJob、schedule 和 stopPolling 代表项目已有封装，不是浏览器内建 API。后台任务创建后返回 job_id，页面查询持久状态，只有排队和运行需要继续等待。成功、失败和取消是业务终态，应停止计时器并提供下载、重试或修正入口。轮询次数和总等待预算也必须有界，超过预算可提示稍后回来看，而不是擅自把服务器任务标记为失败。查询暂时失败与报表执行失败不同，网络错误可在预算内退避，但权限错误或资源已删除应结束。页面隐藏、离线或切换任务时，应暂停或清理，避免重复轮询和旧结果覆盖新任务。AbortController 只取消当前请求等待，不会自动取消远端报表，需要单独的已授权取消接口。退避上限改善请求节奏，不能保证服务器更快完成，也不是实际进度百分比。',
'适合导出、生成报告和媒体处理；需实时细粒度反馈时可结合 SSE。',['轮询预算耗尽就把服务端任务改成 failed。','页面离开后仍保留多个 timer。'],['终态应停止轮询。','查询失败与任务失败不同。','取消请求不等于取消任务。'],[mdn('Web/API/AbortController','AbortController'),mdn('Web/API/Window/setTimeout','setTimeout')],'typescript'),
lesson(36,'backend','有界重试与 Dead-Letter Queue','可靠任务失败治理','bounded-retry-dlq','报表因临时网络故障失败可以再试，但参数错误重复一百次也不会成功。',['将瞬时故障与永久失败分类。','限制尝试次数和总耗时，使用退避。','耗尽预算转入可调查的死信状态。'],`# worker 的策略函数；attempt 是本次已执行次数，从 1 开始。
def next_action(attempt, retryable, max_attempts=3):
    if not retryable or attempt >= max_attempts:
        return {"status":"dead_letter", "delay":None}
    return {"status":"retry_wait",
            "delay":min(2 ** (attempt-1), 30)}
# 生产加有界 jitter，保存原因并防止重复外部副作用。`,
'重试首先是错误分类问题，不是把异常包进 while True。临时超时、依赖短暂不可用可能值得再次执行；参数缺失、无权限和不可支持的文件格式通常需要修正后再处理。示例把 attempt 定义成本次已经执行的次数，最多三次包含第一次，避免把三次重试误读成总共三次。指数退避降低故障时的同步冲击，真实多 worker 还可加有界随机抖动，并限制总任务期限。执行成功但确认丢失可能再次投递，所以任务本身或外部操作仍要幂等。死信不是自动删除，而是保存事件、错误摘要和调查上下文，由有权限的人决定修正、重放或终止。重放要保留原始业务身份与新尝试记录，不能绕过授权或无上限再循环。示例纯计算不操作队列、不等待时钟，也不保证任意故障最终成功；可靠系统需要积压与死信告警。',
'适合持久队列任务；涉及扣款、消息发送时需明确幂等与人工处理边界。',['所有错误都进入无限重试。','把死信队列当作自动成功的最终步骤。'],['次数语义要先定义。','重试只处理适合的错误。','死信需要可调查可处置。'],[R('AWS SQS · Dead-letter queues','https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html'),R('AWS · Retry backoff','https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html')]),
lesson(36,'database','任务状态机、尝试次数与下次执行时间','持久任务协调','job-state-attempt-schedule','两个 worker 同时领取同一任务，或者进程崩溃后 running 永久不再变化，任务就会重复或卡死。',['定义允许的状态转换。','条件更新领取任务并增加尝试次数。','用租约到期和调度时间支持故障恢复。'],`UPDATE jobs
SET status='running', attempts=attempts+1,
    lease_until=now()+interval '2 minutes'
WHERE id=:id AND status IN ('queued','retry_wait')
 AND next_run_at<=now() AND attempts<max_attempts
RETURNING id,attempts;
-- 只有返回行的 worker 才拥有本次领取；完成时还需匹配领取令牌。`,
'任务状态不能任意互跳。queued 或到期的 retry_wait 才可领取，领取成功进入 running 并增加尝试次数；成功进入 succeeded，可重试失败重新安排 next_run_at，永久失败或预算耗尽进入死信。示例用一次条件 UPDATE 演示单行领取，真实批量 worker 可配合 SKIP LOCKED 和事务，不应先查再无条件标记。lease_until 让系统发现可能已失联的 worker，但到期不证明原 worker 已停止；需要领取令牌或 fencing 机制，防止旧 worker 晚到的结果覆盖新尝试。完成更新必须匹配本次领取身份，外部副作用仍需业务幂等。数据库 CHECK 可以限制状态值和次数非负，却不会自动证明所有跨状态转换合法。记录错误应保留可诊断摘要，避免存入 token 和大量敏感内容。课程未运行 worker，只说明持久协调数据为什么不可缺少。',
'适合数据库支持的任务队列；高吞吐方案仍需容量与锁争用测试。',['租约到期后允许旧 worker 无条件写成功。','先 SELECT 再无条件领取导致重复工作。'],['领取是条件状态转换。','租约过期不等于旧执行停止。','完成结果要绑定领取令牌。'],[pg('sql-update','UPDATE'),pg('sql-select','SELECT SKIP LOCKED')])
],[node('01 / QUEUE','领取到期任务','条件更新确保只有一次领取成功。','queued → running; attempts+1'),node('02 / EXECUTE','分类执行结果','成功、可重试故障与永久错误分开。','retryable? budget remaining?'),node('03 / SCHEDULE','安排或死信','记录下次时间，耗尽后进入调查队列。','retry_wait / dead_letter'),node('04 / POLL','终态停止查询','界面知道完成、失败或取消才停止。','terminal.has(job.status)')],
'浏览器轮询查询状态，worker 重试执行任务，数据库保存可恢复的状态。每一层都有自己的预算与停止条件。','最多执行三次，前两次临时失败、第三次仍失败，计算每次后的状态和延迟。',['第1次后等待1秒。','第2次后等待2秒。','第3次后进入死信，不再自动执行。'],'attempt 包含首次执行。',`attempt 1 → retry_wait, delay=1s
attempt 2 → retry_wait, delay=2s
attempt 3 → dead_letter
UI observes dead_letter/failed terminal → stop polling`,'明天：通知实时到达和排行榜排名怎样分别计算？'));
days.push(day(37,'实时事件和排名，是同一种状态吗？','SSE 传递变化，窗口函数计算每行与群体的关系。',['订阅并清理 EventSource','按 SSE 格式输出与清理连接','区别 rank、dense_rank 与 row_number'],[
lesson(37,'frontend','EventSource 接收实时通知','浏览器单向事件流','eventsource-notification-stream','页面每秒刷新通知列表会产生大量空查询。服务端有新事件时可以单向推送给浏览器。',['建立 EventSource 并监听命名事件。','解析后验证资料，按事件 ID 去重。','卸载时 close，重连后补取遗漏。'],`import {useEffect} from "react";
export function useNoticeEvents(onNotice) {
 useEffect(()=>{
  const source=new EventSource("/events",{withCredentials:true});
  source.addEventListener("notice",e=>{
   const raw=JSON.parse(e.data); // 正式实现还要校验 schema 与权限范围。
   onNotice(raw);
  });
  return ()=>source.close();
 },[onNotice]);
}`,
'EventSource 建立 HTTP 单向文本流，适合通知和进度，不提供浏览器到服务器的双向消息通道。示例在 React Effect 中创建连接，并在卸载或依赖变化时关闭；onNotice 应保持合理稳定，否则每次渲染都会重连。命名事件 notice 需要服务端输出 event: notice，普通 onmessage 不能代替所有事件监听。浏览器会按协议尝试重连，事件 id 可以协助恢复，但服务端必须实现历史补发，不能因设置 id 就宣称从不丢消息。JSON.parse 也可能失败，真实处理需捕获错误并验证字段，重复事件按稳定 ID 去重。原生 EventSource 不支持随意设置 Authorization 自定义头，Cookie 场景仍需认证、跨源与浏览器策略配置；不要把长期 token 放 URL。界面应提示连接状态，并在恢复后重新核对持久通知资料。这里没有开启连接，样例只解释订阅生命周期。',
'适合单向站内通知；需要双向低延迟交互可评估 WebSocket。',['以为 SSE 的自动重连必然自动补齐所有历史。','把长期认证 token 放进流 URL。'],['EventSource 是单向文本流。','连接需要生命周期清理。','恢复与去重由应用补齐。'],[mdn('Web/API/Server-sent_events/Using_server-sent_events','Using SSE'),mdn('Web/API/EventSource','EventSource')]),
lesson(37,'backend','SSE、断开连接与资源清理','HTTP 流式响应','sse-resource-lifecycle','客户端已经离开，服务器却保留订阅或数据库连接，长期运行后会耗尽资源。',['按 event、id、data 与空行编码消息。','流生成器保留协作等待和取消传播。','在 finally 中释放自己拥有的资源。'],`import asyncio, json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
app=FastAPI()
async def demo_events():
    try:
        for i in range(3):
            yield chr(10).join([f"id: {i}", "event: notice",
                "data: "+json.dumps({"id":i}), "", ""])
            await asyncio.sleep(1)
    finally:
        print("demo stream finished; release owned subscriptions here")
@app.get("/demo-events")
def stream():
    return StreamingResponse(demo_events(),media_type="text/event-stream")`,
'这是有限三条样本事件的演示路由，未接身份、事件总线或真实通知，不能直接作为生产订阅入口。SSE 每条事件由文本字段和空行分隔，data 内容可放 JSON；跨多行数据需要正确逐行编码，不能直接拼接任意不可信文字。StreamingResponse 输出生成器内容，await 保留取消检查机会，finally 在正常结束或取消清理时释放本函数拥有的订阅、游标和其他资源，不要吞掉取消异常后无限继续。实际断开检测、代理缓冲、心跳和超时取决于 ASGI 服务与部署链路，要做真实连接测试。长期流不宜全程占住数据库事务，应从持久事件记录或受控订阅读取并及时释放连接。id 和 Last-Event-ID 只是恢复协议的一部分，服务端需要验证权限并查出遗漏事件。HTTP 流已开始后不能再像普通 JSON 请求那样任意改响应状态码，错误事件与重连策略要事先定义。',
'适合低频实时通知；高连接量需评估代理、连接数和缓冲配置。',['在长连接整个生命周期持有数据库事务。','吞掉取消异常后继续向已断开的客户端发送。'],['空行是 SSE 消息边界。','资源清理跟随生成器生命周期。','补发和代理行为要实测。'],[fast('advanced/custom-response','StreamingResponse'),mdn('Web/API/Server-sent_events/Using_server-sent_events','SSE format')]),
lesson(37,'database','SQL Window Functions','SQL 窗口计算','ranking-window-ties','排行榜要保留每位用户一行，又显示相同分数并列名次，GROUP BY 无法直接表达所有需求。',['OVER 指定计算窗口。','rank 允许跳号，dense_rank 不跳号。','row_number 给每行独立序号并需稳定平局顺序。'],`SELECT user_id, score,
 RANK() OVER (ORDER BY score DESC) AS rank_with_gaps,
 DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank,
 ROW_NUMBER() OVER (ORDER BY score DESC,user_id) AS position
FROM leaderboard
ORDER BY score DESC,user_id;
-- leaderboard 是已准备的固定样本，不涉及 SSE 传输。`,
'窗口函数在保留原始行的同时，计算当前行相对一组行的位置。示例对分数降序排名，分数一百、一百、八十时，rank 得到一、一、三，dense_rank 得到一、一、二；row_number 则为每行给出一、二、三。并列定义必须只包含业务排名键，若把唯一 user_id 也加进 rank 的窗口排序，相同分数就不再并列。页面输出顺序又需要稳定，所以外层 ORDER BY 和 row_number 可加 user_id 作为平局条件。这些顺序用途相关却不同。PARTITION BY 可按赛区分别排名，WHERE 会先影响进入窗口的资料；若要先排名再筛某个名次，应使用子查询或 CTE。窗口函数不负责实时传递，SSE 只可能把重新计算后的排名结果送到页面。课程查询片段不等于对大型排行榜完成性能优化，仍需评估资料量和更新方式。',
'适合排行榜、分组累计和相邻行比较；排名定义先和业务确认。',['在 rank 排序中加入唯一 ID 却仍期待同分并列。','把窗口函数误认为会像 GROUP BY 一样折叠行。'],['窗口计算保留各行。','并列规则决定是否跳号。','输出稳定顺序是另一层要求。'],[pg('tutorial-window','Window Functions'),pg('functions-window','Window Functions Reference')])
],[node('01 / RANK','计算持久资料的排名','数据库按分数定义并列。','RANK() OVER (ORDER BY score DESC)'),node('02 / EVENT','编码变化事件','事件携带稳定 ID 与最小结果。','id: 7\nevent: notice\ndata: {...}'),node('03 / STREAM','按权限推送','服务端维护连接并处理取消清理。','text/event-stream + finally'),node('04 / RECONCILE','恢复后核对','浏览器去重并补取持久状态。','event id → dedupe → refetch')],
'窗口函数负责计算，SSE 负责传递，持久记录负责断线后核对。实时连接不是事实唯一来源。','给分数 100、100、80 写出三种排名，再写一个带 id、event、data 的 SSE 文本。',['rank 为 1、1、3。','dense_rank 为 1、1、2。','SSE 事件以空行结束。'],'不要把唯一 ID 加进需要并列的 rank 排序。',`rank: [1,1,3]; dense_rank: [1,1,2]; row_number: [1,2,3]
id: 7
event: notice
data: {"id":7,"text":"榜单已更新"}

`,'明天：双向聊天如何处理连接和消息重复？'));
days.push(day(38,'重新连接后，消息会乱序或重复吗？','连接状态只是一层，消息身份和持久顺序还需单独设计。',['展示 WebSocket 连接与恢复状态','验证认证、来源与每条消息','区分客户端去重 ID 与服务端序号'],[
lesson(38,'frontend','WebSocket 连接状态与重连提示','双向连接交互状态','websocket-client-connection-state','聊天界面显示已发送，但连接其实已断开；用户重连后又把同一条消息发了两次。',['维护 connecting、open、reconnecting、closed。','待发送消息拥有稳定 client_message_id。','收到服务端确认才标记已持久保存。'],`type Connection = "connecting"|"open"|"reconnecting"|"closed";
const socket=new WebSocket("wss://example.invalid/chat");
socket.addEventListener("open",()=>setConnection("open"));
socket.addEventListener("close",()=>setConnection("reconnecting"));
function sendDraft(text:string,clientId:string) {
 if(socket.readyState!==WebSocket.OPEN) return false;
 socket.send(JSON.stringify({type:"message",client_message_id:clientId,text}));
 return true; // 仅进入发送缓冲，不是持久确认。
}
// setConnection 来自组件；卸载时关闭连接并停止重连计时器。`,
'示例是浏览器连接处理片段，域名故意无效，未建立真实会话。WebSocket.OPEN 只表示当前可以发送，send 返回也只代表资料进入发送流程，不能证明服务器已保存或对方已经阅读。每条待发送消息应先生成稳定的 client_message_id，重连重发同一业务消息时沿用它，服务端才能去重。页面可分成待发送、待确认、已保存与失败等状态，断线期间保留草稿，并说明重试是否安全。自动重连需要退避、次数或总时间预算，用户主动退出与鉴权失效时应停止，避免无限创建连接。浏览器原生 WebSocket 不能像 fetch 那样任意加 Authorization 头，认证方案需服务端设计，不能把长期 token 随手放 URL。事件监听与计时器都应在组件清理时释放，旧连接回调还要避免修改新会话状态。消息的顺序应依据服务端持久序号，而非本地接收时间猜测。',
'适合聊天和协作功能；单向事件不必一定采用 WebSocket。',['send() 成功就显示对方已收到。','重发时生成新的 client_message_id。'],['连接成功不等于业务确认。','重试沿用消息身份。','重连必须有停止条件。'],[mdn('Web/API/WebSocket','WebSocket'),mdn('Web/API/WebSocket/send','WebSocket.send')],'typescript'),
lesson(38,'backend','WebSocket 认证、心跳与消息验证','持久连接安全与协议','websocket-auth-message-validation','握手通过后连接可能持续很久，用户被撤销权限或发送超大消息时仍需控制。',['握手验证会话和可信 Origin。','每条消息校验类型、大小与资源权限。','定义心跳、空闲超时和断线清理。'],`from pydantic import BaseModel, Field
class ChatMessage(BaseModel):
    type: str
    client_message_id: str = Field(min_length=1,max_length=80)
    text: str = Field(min_length=1,max_length=1000)
# 已认证 WebSocket 循环中的片段：
raw = await websocket.receive_text()
if len(raw.encode("utf-8")) > 4096:
    await websocket.close(code=1009)
else:
    message = ChatMessage.model_validate_json(raw)
# 还须限制 type、检查房间权限、处理验证异常并有界发送。`,
'片段使用已完成握手认证的 FastAPI WebSocket 和 Pydantic v2，不是完整服务器。认证要在接受连接前验证会话与来源，浏览器会自动携带某些 Cookie，因此不能只依赖普通 HTTP CORS 配置保护 WebSocket。连接存活期间角色、房间成员与会话状态可能变化，敏感消息处理仍需按策略重新授权。模型校验解决形状与长度，不会证明 text 内容可信；type 应限制为协议支持的固定值，异常要转换成约定错误或关闭，而非让循环崩溃泄露内部信息。应用级 heartbeat 消息与 WebSocket 协议 ping/pong 不同，浏览器脚本通常不能直接发送底层 ping 帧。服务端还应限制帧或消息大小、速率和发送缓冲，防止慢客户端无限积压。断开时释放房间订阅和连接登记，持久历史另外保存。心跳可发现失联，不保证消息已处理，更不替代消息确认与去重。',
'适合需要双向交互的持久连接；完整实现需服务器帧限制和连接容量测试。',['以为 HTTP CORS 中间件自动保护所有 WebSocket 来源。','只在握手授权，之后任意房间消息都接受。'],['握手与消息都要检查。','校验不等于授权。','心跳不等于持久确认。'],[fast('advanced/websockets','WebSockets'),R('OWASP · WebSocket Security','https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html')]),
lesson(38,'database','消息表、顺序编号与唯一约束','消息持久身份与顺序','message-sequence-deduplication','同一消息重发需要去重，聊天排序又需要服务端顺序，两者不是同一个字段。',['保存会话、发送人和客户端消息 ID。','按会话分配唯一服务器 seq。','用唯一约束拒绝同一发送人的重复业务消息。'],`CREATE TABLE messages (
 conversation_id bigint NOT NULL,
 seq bigint NOT NULL,
 sender_id bigint NOT NULL,
 client_message_id text NOT NULL,
 body text NOT NULL,
 PRIMARY KEY(conversation_id,seq),
 UNIQUE(conversation_id,sender_id,client_message_id)
);
-- seq 在事务中锁住 conversation 计数行后分配；不要 SELECT MAX(seq)+1。`,
'client_message_id 表示客户端认为同一笔发送动作的身份，seq 表示服务器在某会话中的持久顺序。重连后重发相同 client_message_id 应返回原消息确认，而不是再创建一条；唯一约束是最后防线，但应用还要检查相同 ID 是否带了不同内容，避免把键冲突误当成功。示例以会话和 seq 作主键，以会话、发送人和客户端 ID 组合去重，避免不同人碰巧使用相同局部 ID 被错误合并。seq 的分配必须并发安全，直接 MAX+1 会让两笔事务选到同一个值；可以锁住会话计数行再递增，并与消息插入一起提交。全局 identity 也能提供唯一标识，但不保证按某会话连续或与提交顺序完全相同。断线补取可查询 seq 大于已确认值，并处理缺口和保留期限。数据库约束不负责验证发送人是房间成员，服务端仍执行资源授权。',
'适合需要重发去重和历史补取的聊天；是否要求连续序号应先确认业务。',['用 MAX(seq)+1 在事务外分配序号。','把客户端时间戳当作可信全局消息顺序。'],['去重身份与顺序字段不同。','序号分配需并发安全。','唯一约束不替代房间授权。'],[pg('ddl-constraints','Unique Constraints'),pg('explicit-locking','Explicit Locking')])
],[node('01 / DRAFT','固定发送身份','一份草稿重发沿用 client_message_id。','client_message_id = c-17'),node('02 / VALIDATE','检查每条消息','会话、来源、长度和房间权限分层执行。','auth + schema + room access'),node('03 / COMMIT','分配顺序并去重','事务分配 seq，唯一约束守住重发。','UNIQUE(conversation,sender,client_id)'),node('04 / ACK','回传持久确认','界面按 seq 排序，重连后补取缺口。','ack {client_id,seq}')],
'WebSocket 提供双向通道，协议定义确认与恢复，数据库给消息持久身份和顺序。连接本身不保证恰好一次。','同一发送人重发 client_id=c17 两次，再发送 c18，初始 next_seq=5。写出持久消息数和确认结果。',['只保存两条业务消息。','两次 c17 都确认 seq5。','c18 确认 seq6。'],'先按客户端身份查重，再为新消息分配 seq。',`c17 → INSERT seq5 → ACK seq5
c17 retry → existing row → ACK seq5
c18 → INSERT seq6 → ACK seq6
Stored rows=2`,'明天：文件扩展名能证明上传文件安全吗？'));
days.push(day(39,'选择了 PDF，就一定是 PDF 吗？','客户端提示改善体验，服务器验证与隔离守住上传边界。',['选择文件并释放预览 URL','按字节上限检查上传内容','保存归属明确的文件元数据'],[
lesson(39,'frontend','文件选择、预览与客户端大小提示','浏览器 File 与对象 URL','file-select-preview-cleanup','上传大文件后才被拒绝浪费用户等待。页面可提前提示，但用户能绕过这些检查。',['从 FileList 读取所选文件。','用 size 给出即时提示并保留服务端检查。','预览对象 URL 在替换或卸载时撤销。'],`import {useEffect,useState} from "react";
function useImagePreview(file:File|null) {
 const [url,setUrl]=useState<string|null>(null);
 useEffect(()=>{
  if(!file){setUrl(null);return;}
  const next=URL.createObjectURL(file);setUrl(next);
  return ()=>URL.revokeObjectURL(next);
 },[file]);
 return url;
}
// input accept="image/png,image/jpeg" 只是选择提示；检查 file.size <= 2*1024*1024。`,
'浏览器 File 提供名称、大小和声明的类型，适合在网络上传前给用户即时反馈。示例只展示图片预览 hook，配合已有文件输入使用，URL.createObjectURL 为本地文件建立临时引用而非上传；替换文件或卸载时 revokeObjectURL 防止引用长期占用资源。accept 只是文件选择器提示，扩展名和 file.type 都不能证明内容真实或安全。大小上限也必须由服务器重复检查，攻击者可以不经过页面直接提交。预览应限制到允许的安全展示方式，别把任意 HTML 或 SVG 当作可信内容嵌入页面。用户取消选择、换文件或提交失败时，应清楚保留或清空当前选择状态，错误提示关联输入并可用键盘读取。不要把对象 URL 当作可分享的永久地址，它只在当前浏览器上下文有意义。课程没有打开本机文件或上传资料，实际图片尺寸、解码风险和浏览器行为仍需单独验证。',
'适合头像和文档选择前提示；不可信内容预览应按类型限制与隔离。',['accept 限制就省略后端验证。','每次换文件都新建对象 URL，却不释放旧引用。'],['客户端检查改善体验。','对象 URL 不是云端地址。','预览引用需要清理。'],[mdn('Web/API/URL/createObjectURL_static','createObjectURL'),mdn('Web/HTML/Reference/Attributes/accept','accept')]),
lesson(39,'backend','Multipart 上传与服务端文件验证','文件输入边界与隔离','multipart-server-validation','把恶意文件改名成 invoice.pdf，前端文件选择器仍可能接受，后端必须独立验证。',['限制请求体与实际读取字节数。','验证允许类型、内容特征并隔离待检查文件。','使用服务器生成的对象名，不信任原文件路径。'],`from fastapi import UploadFile, HTTPException
async def inspect_demo(file:UploadFile):
    size=0; first=b""
    try:
        while chunk:=await file.read(65536):
            size+=len(chunk)
            if size>2*1024*1024: raise HTTPException(413,"Too large")
            if not first: first=chunk[:8]
        if not first.startswith(b"%PDF-"):
            raise HTTPException(415,"Not a PDF signature")
        return {"bytes":size,"status":"needs_full_validation"}
    finally:
        await file.close()
# 此片段不保存文件，PDF 前缀检查绝不代表内容安全。`,
'示例在已有 FastAPI multipart 环境中分块读取 UploadFile，实际字节累计超过上限就拒绝，并在 finally 关闭临时资源。请求还未进入函数时，代理和框架可能已经接收或暂存内容，所以必须配合网关请求体限制、上传超时和并发额度，不能认为循环检查覆盖全部资源消耗。content_type 和原始 filename 都由上传方提供，不可信；检查 PDF 前缀只是筛掉明显不符文件，不能证明文件完整、无脚本或无恶意载荷。正式流程应采用允许类型策略、安全解析、必要的恶意内容检测与隔离区，检查成功后才允许下载或处理。文件名只作为经处理的展示信息，实际存储键由服务器生成，防止路径穿越与覆盖。鉴权、归属、配额和 CSRF 仍按上传入口设计执行。课程没有保存或扫描真实文件，返回 needs_full_validation 正是为了不把一个头部检查冒充安全认证。',
'适合小文档上传验证的核心片段；大文件通常采用对象存储直传与后置检查。',['信任 MIME 声明或扩展名。','匹配几个 magic bytes 就标记安全可发布。'],['实际字节数需要限制。','内容前缀不证明安全。','先隔离再发布。'],[fast('tutorial/request-files','Request Files'),R('OWASP · File Upload','https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html')]),
lesson(39,'database','文件元数据、归属与对象引用','文件资料模型','file-metadata-object-reference','把公开 URL 当作文件身份，存储迁移或权限变化后就难以控制访问与追踪归属。',['数据库保存稳定文件 ID 与 owner。','对象存储只保留受控 object_key 引用。','状态区分待上传、隔离、可用和失败。'],`CREATE TABLE files (
 id uuid PRIMARY KEY,
 owner_id bigint NOT NULL REFERENCES app_users(id),
 object_key text NOT NULL UNIQUE,
 original_name text NOT NULL,
 byte_size bigint CHECK(byte_size>=0),
 status text NOT NULL CHECK(status IN
 ('pending','quarantined','ready','failed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
-- 下载先按 owner/权限检查，再签发短期访问方式。`,
'文件的业务身份应是数据库 file_id，不是用户给出的文件名，也不是一个永久公开链接。object_key 指向存储系统中的对象，应用通过它完成读取、删除和核验；owner_id 用于资源归属检查，不能由客户端任意指定。元数据状态表达上传生命周期，pending 不代表对象已经存在，quarantined 不应直接公开，ready 也应只在必要验证完成后写入。byte_size 等字段最好由可信服务从实际对象检查获得，而不是完全采纳请求声明。数据库事务不能天然覆盖对象存储写入，可能出现有对象无记录或有记录无对象，需要过期清理与对账机制。original_name 只用于经转义的展示，避免当作磁盘路径和授权依据。删除记录时是否同时删对象属于明确的保留规则，不能盲目级联到外部存储。课程的 SQL 是独立练习模型，没有创建桶、对象或公开下载权限。',
'适合私有文档、附件与头像管理；需要校验状态转换和存储对账。',['有 file_id 就允许任何用户下载。','仅凭客户端说上传完成就把状态设为 ready。'],['文件身份独立于存储地址。','归属与状态都要检查。','数据库与对象需要对账。'],[pg('ddl-constraints','Constraints'),R('AWS S3 · Object keys','https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html')])
],[node('01 / SELECT','选择并提示','浏览器检查体积与展示预览，不能担保内容安全。','File.size + object URL'),node('02 / RECEIVE','独立验证','服务端限制实际字节并检查类型。','UploadFile chunks + limit'),node('03 / QUARANTINE','隔离待检查内容','对象暂不可公开，记录可信元数据。','status = quarantined'),node('04 / READY','审核后提供访问','验证成功、归属授权后才可下载。','authorize(file.owner_id)')],
'上传入口接收不可信内容。前端提示、服务器验证、隔离状态和资源归属共同决定文件何时可以被使用。','为 1.5MiB 的假 PDF 设计处理结果：扩展名 .pdf，但内容前缀是 HTML。写出元数据状态。',['客户端体积可通过。','后端内容不符应拒绝或标记 failed。','不能生成 ready 的公开下载链接。'],'把文件名、声明类型与实际内容分别列出。',`name=invoice.pdf; declared=application/pdf; bytes start with <html>
size check: pass; content check: reject
file.status=failed (or quarantine for investigation); no public access`,'明天：进度到 100% 就代表上传完成了吗？'));
days.push(day(40,'上传取消后，文件真的不存在了吗？','进度、签名权限、对象事实和软删除是不同层次。',['区分字节发送完与服务端确认','限制预签名 URL 的范围与有效期','设计软删除、恢复和唯一性'],[
lesson(40,'frontend','上传进度、取消与重试交互','文件传输状态交互','upload-progress-cancel-retry','进度条到 100% 后服务器仍在验证，用户点击取消也不能证明已经发出的对象不存在。',['按可计算字节展示传输进度。','等待响应和后置验证才宣告可用。','取消后查询状态，重试保留业务上传身份。'],`const xhr=new XMLHttpRequest();
xhr.upload.addEventListener("progress",event=>{
 if(event.lengthComputable) setProgress(Math.round(event.loaded/event.total*100));
});
xhr.addEventListener("load",()=>{
 if(xhr.status>=200&&xhr.status<300) setStatus("verifying");
 else setStatus("failed");
});
xhr.open("PUT",presignedUrl);
xhr.setRequestHeader("Content-Type",file.type);
xhr.send(file);
// 取消按钮调用 xhr.abort()，再与服务端核对对象状态。`,
'示例使用浏览器 XMLHttpRequest 的 upload 进度事件，file、presignedUrl 和状态函数来自已准备好的上传页面。普通 fetch 没有等价通用的上传进度回调，因此选用 XHR 展示此机制。lengthComputable 为真时才显示百分比，传输到一百只表示浏览器已发送完对应字节，不代表应用已经验证文件、写元数据或发布下载权限。PUT 成功后可进入 verifying，调用服务端完成确认流程，再由服务端核验对象大小、归属和检查结果。abort 停止当前客户端传输或等待，但已到达对象存储的数据可能已形成对象，后续仍需查询和清理。重试时区分重新上传同一业务文件与创建新文件，不要每次点按钮都无意产生孤儿对象。跨源上传还需要存储侧 CORS，监听 upload 事件也可能影响预检行为。课程没有执行上传，进度只是事件驱动的界面设计，不包含任何真实带宽测量。',
'适合直接上传对象存储的浏览器交互；分片上传有独立分片确认与终止协议。',['传输100%就显示文件已安全可用。','abort 后就断言服务器没有留下对象。'],['字节进度不是业务完成。','取消结果需要核对。','重试应保留业务身份。'],[mdn('Web/API/XMLHttpRequest/upload','XMLHttpRequest.upload'),mdn('Web/API/XMLHttpRequest/abort','XMLHttpRequest.abort')],'javascript'),
lesson(40,'backend','对象存储与 Presigned URL','受限临时访问授权','presigned-upload-capability','前端不能持有存储账号密钥。服务端可在授权后签发只针对某对象和方法的短期能力。',['先检查用户、配额和上传对象归属。','服务端生成随机对象键并短期签名。','完成后重新核验实际对象与元数据。'],`# s3 是已配置凭证的 boto3 S3 client；不向浏览器返回凭证。
key = f"quarantine/{actor.id}/{server_generated_file_id}"
url = s3.generate_presigned_url(
    "put_object", Params={"Bucket":private_bucket,"Key":key,
                          "ContentType":"application/pdf"},
    ExpiresIn=300, HttpMethod="PUT")
# URL 只交给已授权用户；不记录完整签名 URL。
# 完成通知到达后，服务端检查对象存在、大小、内容与归属。`,
'预签名 URL 是持有即可使用的临时能力，权限受签名主体、方法、对象键、签名参数和有效期共同限制。示例使用 boto3 已配置客户端，只展示生成方式，未读取凭证或访问 AWS。浏览器按签名要求上传并匹配 Content-Type，但该头不证明实际文件类型，大小限制也不能只靠前端声明；严格上传条件可根据方案使用策略、代理限制和后置检查。URL 在有效期内通常可以多次使用，同键 PUT 可能覆盖对象，不能宣称天然一次性。实际有效期还可能因临时凭证先到期或权限策略变化而缩短。对象键必须由服务端生成，不能让用户随意指定其他人的路径；签名之前已经要完成业务授权。完成接口不应相信客户端说成功，而应核对对象和必要扫描，再把状态改成 ready。泄露签名 URL 会泄露对应临时能力，因此日志与分享都需避免暴露完整链接。',
'适合减少 API 服务器承担大文件流量；一次性语义和严格条件需另行设计。',['把预签名 URL 当成天然一次性。','签给客户端自报的任意对象路径。'],['签名 URL 是临时能力。','短期不等于只能用一次。','完成后仍需可信核验。'],[R('AWS S3 · Presigned URLs','https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html'),R('Boto3 · generate_presigned_url','https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/generate_presigned_url.html')]),
lesson(40,'database','Soft Delete、保留期限与唯一性','资料生命周期与部分索引','soft-delete-retention-uniqueness','删除文档后想恢复，却发现同名文档已被新建。软删除既影响查询，也影响唯一规则与对象保留。',['deleted_at 标记业务不可见。','部分唯一索引只约束未删除行。','恢复检查冲突，保留到期后再物理清理。'],`ALTER TABLE files ADD COLUMN deleted_at timestamptz;
CREATE UNIQUE INDEX files_active_name
 ON files(owner_id,original_name) WHERE deleted_at IS NULL;
SELECT id,original_name FROM files
WHERE owner_id=:owner AND deleted_at IS NULL;
-- 恢复：UPDATE files SET deleted_at=NULL WHERE id=:id;
-- 若已有同名有效文件，唯一约束会拒绝；需明确改名或放弃恢复。`,
'软删除保留记录并标记 deleted_at，常规查询只返回未删除行，为恢复和短期误删处理留下空间。它不是权限控制的替代，下载接口仍要拒绝被删除文件，也不能因为文件行隐藏就认为原对象或已经签出的链接立即失效。部分唯一索引可以只对有效行约束 owner 与名称，这让删除后可新建同名文件，但恢复时可能冲突，必须提供改名或明确拒绝的交互，不能悄悄覆盖新文件。保留期限应从删除时间计算，到期后才安排永久删除对象和元数据，考虑备份、法律保留及关联资料。数据库事务不能原子删除外部对象，因此清理任务需要幂等、重试和对账。示例假定 files 已存在，实际增加唯一索引前先检查历史重复。软删除增加所有读取路径的过滤责任，后台、统计和搜索都要验证，不能只在列表接口补一个 WHERE 就认为生命周期已完整。',
'适合支持误删恢复的私有文档；必须明确保留期限和最终清理流程。',['恢复时无条件覆盖同名新文件。','认为 deleted_at 会自动撤销已签出的对象链接。'],['软删除影响所有读取路径。','部分唯一索引决定恢复冲突。','最终删除需要可靠对账。'],[pg('indexes-partial','Partial Indexes'),pg('ddl-constraints','Unique Constraints')])
],[node('01 / SIGN','授权后签临时能力','服务器生成私有隔离区对象键。','presigned PUT · expires=300s'),node('02 / TRANSFER','展示传输状态','100% 后仍等待核验；取消不证明无对象。','uploading → verifying'),node('03 / CONFIRM','核验并登记可用','检查实际对象、内容与归属。','pending → quarantined → ready'),node('04 / DELETE','定义删除与恢复','软删除隐藏访问，保留期后可靠清理。','deleted_at + partial UNIQUE')],
'上传是多阶段流程，预签名是短期授权，软删除是生命周期规则。任何单个状态都不能代替对象事实核验。','同一用户删除 report.pdf 后新建同名文件，再尝试恢复旧文件。写出恢复结果和保留期清理规则。',['部分唯一索引拒绝两个同名有效文件。','恢复提示改名或放弃，不覆盖新文件。','超过保留期才幂等清理对象并对账。'],'分别标明旧记录 deleted_at 与新记录的有效状态。',`old report.pdf: deleted_at set
new report.pdf: deleted_at NULL
restore old → active-name UNIQUE conflict
Offer rename or cancel; retention cleanup removes object + verifies DB state`,'明天：用测试验证加载、失败和数据库隔离。'));
window.COURSES.push(...days);
})();
