window.CURRICULUM = [
  {
    "day": 1,
    "frontend": "React 列表渲染：map 与稳定 key",
    "backend": "GET API 与 FastAPI 路由",
    "database": "表、主键与基础 SELECT",
    "practice": "列表显示商品名称和价格"
  },
  {
    "day": 2,
    "frontend": "受控输入与本地搜索",
    "backend": "Query Parameters 与字符串验证",
    "database": "WHERE、ILIKE 与条件组合",
    "practice": "添加最高价格筛选"
  },
  {
    "day": 3,
    "frontend": "Pagination 与翻页边界",
    "backend": "分页参数、数量上限与响应元数据",
    "database": "LIMIT、OFFSET 与稳定排序",
    "practice": "合并搜索和分页"
  },
  {
    "day": 4,
    "frontend": "组件拆分与 Props",
    "backend": "Path Parameters 与 404 响应",
    "database": "B-tree 索引入门；主键自带索引",
    "practice": "拆出商品卡片并设计详情接口"
  },
  {
    "day": 5,
    "frontend": "表单提交与基础错误提示",
    "backend": "Pydantic 请求体模型",
    "database": "字段类型选择：金额、文本与整数",
    "practice": "设计新增商品表单和请求体"
  },
  {
    "day": 6,
    "frontend": "数组 State 的不可变更新",
    "backend": "POST、201 与创建资源",
    "database": "INSERT RETURNING 与默认值",
    "practice": "创建商品后把返回结果加入列表"
  },
  {
    "day": 7,
    "frontend": "编辑表单的草稿与取消",
    "backend": "PATCH 与部分字段更新",
    "database": "带条件 UPDATE 与 RETURNING",
    "practice": "编辑价格并保留未修改字段"
  },
  {
    "day": 8,
    "frontend": "删除确认、空列表与条件渲染",
    "backend": "DELETE 与 204 响应",
    "database": "外键与 RESTRICT / CASCADE 删除策略",
    "practice": "说明何时允许删除有关联的分类"
  },
  {
    "day": 9,
    "frontend": "状态提升与单一数据来源",
    "backend": "Response Model 与关联数据响应",
    "database": "INNER JOIN、LEFT JOIN 与分类关系",
    "practice": "为商品列表显示分类名称"
  },
  {
    "day": 10,
    "frontend": "fetch、HTTP 错误与加载状态",
    "backend": "用 Psycopg 接入 PostgreSQL；连接用后关闭",
    "database": "参数化 SQL 与注入风险",
    "practice": "把一条真实查询接到商品接口"
  },
  {
    "day": 11,
    "frontend": "Effect 依赖、清理与过期请求",
    "backend": "浏览器跨域与 CORS 开发配置",
    "database": "Schema 命名空间与表名限定",
    "practice": "分清跨域错误、请求错误与查表错误"
  },
  {
    "day": 12,
    "frontend": "URL 中保存搜索和页码",
    "backend": "排序参数与字段白名单",
    "database": "多字段排序与 NULLS FIRST / LAST",
    "practice": "设计可分享的筛选链接"
  },
  {
    "day": 13,
    "frontend": "Debouncing 搜索防抖",
    "backend": "HTTPX 外部请求与超时",
    "database": "EXPLAIN 的执行计划入门",
    "practice": "比较连续输入与防抖后的请求数"
  },
  {
    "day": 14,
    "frontend": "useReducer 管理复杂表单状态",
    "backend": "Service / Repository 职责边界",
    "database": "SQLAlchemy ORM 与表映射",
    "practice": "把新增商品逻辑分成清晰职责"
  },
  {
    "day": 15,
    "frontend": "Context 共享少量跨层状态",
    "backend": "Depends 依赖注入与资源生命周期",
    "database": "ORM 关联、N+1 与预加载",
    "practice": "识别列表读取中的重复查询"
  },
  {
    "day": 16,
    "frontend": "React Router 与详情页导航",
    "backend": "APIRouter 与 API 版本路径",
    "database": "Alembic 数据库迁移",
    "practice": "规划新增商品状态字段的迁移"
  },
  {
    "day": 17,
    "frontend": "TanStack Query 与 Server State",
    "backend": "HTTP Cache-Control 缓存策略",
    "database": "组合索引与列顺序",
    "practice": "为分类内排序查询选择索引"
  },
  {
    "day": 18,
    "frontend": "Mutation 与查询失效刷新",
    "backend": "数据库事务边界与异常回滚",
    "database": "ACID 与 COMMIT / ROLLBACK",
    "practice": "设计订单和订单项的原子创建"
  },
  {
    "day": 19,
    "frontend": "Optimistic UI 与失败回退",
    "backend": "Idempotency Key 防止重复创建",
    "database": "UNIQUE 与 INSERT ON CONFLICT",
    "practice": "分析重复点击创建订单的结果"
  },
  {
    "day": 20,
    "frontend": "Error Boundary 的作用与边界",
    "backend": "统一错误结构与状态码",
    "database": "NULL、三值逻辑与 IS NULL",
    "practice": "区分页面异常、接口失败与空数据"
  },
  {
    "day": 21,
    "frontend": "TypeScript 的 Props 与接口数据类型",
    "backend": "接口契约兼容与响应字段演进",
    "database": "数据规范化与重复资料",
    "practice": "把重复的分类信息拆成关联表"
  },
  {
    "day": 22,
    "frontend": "用判别联合表达请求状态",
    "backend": "版本检查与 If-Match 并发更新",
    "database": "version 字段与条件 UPDATE",
    "practice": "防止两个管理员覆盖彼此修改"
  },
  {
    "day": 23,
    "frontend": "库存不足与冲突后的交互恢复",
    "backend": "并发冲突、死锁与重试边界",
    "database": "SELECT FOR UPDATE 行锁",
    "practice": "推演两个人购买最后一件商品"
  },
  {
    "day": 24,
    "frontend": "Intl 日期展示与用户时区",
    "backend": "带时区时间的接口约定",
    "database": "timestamp 与 timestamptz",
    "practice": "统一保存和显示订单创建时间"
  },
  {
    "day": 25,
    "frontend": "可访问表单：标签、焦点与键盘",
    "backend": "OpenAPI 文档与请求示例",
    "database": "GROUP BY、COUNT 与 SUM",
    "practice": "给订单统计定义清晰的响应字段"
  },
  {
    "day": 26,
    "frontend": "登录表单与密码管理器兼容",
    "backend": "密码哈希与登录验证",
    "database": "凭证存储与数据库角色入门",
    "practice": "画出注册、哈希保存、登录验证流程"
  },
  {
    "day": 27,
    "frontend": "登录态初始化与认证加载状态",
    "backend": "Cookie Session 与安全属性",
    "database": "Session 表、过期与撤销",
    "practice": "设计退出后立即失效的 Session"
  },
  {
    "day": 28,
    "frontend": "权限界面与禁用操作提示",
    "backend": "RBAC 与资源归属检查",
    "database": "PostgreSQL Row-Level Security 入门",
    "practice": "检查用户能否读取别人的订单"
  },
  {
    "day": 29,
    "frontend": "Cookie 请求与 CSRF Token 传递",
    "backend": "CSRF 防护与 CORS 的不同职责",
    "database": "审计日志、操作者与敏感信息最小化",
    "practice": "记录一次价格修改的前后值"
  },
  {
    "day": 30,
    "frontend": "退出登录与用户缓存隔离",
    "backend": "Rate Limiting 与 429 响应",
    "database": "Redis 原子计数与 TTL",
    "practice": "设计登录接口的限流规则"
  },
  {
    "day": 31,
    "frontend": "React Profiler 与重渲染定位",
    "backend": "结构化日志与 Request ID",
    "database": "慢查询与 pg_stat_statements",
    "practice": "描述一次慢请求的排查路径"
  },
  {
    "day": 32,
    "frontend": "Lazy Loading 与代码分割",
    "backend": "async I/O、阻塞调用与 CPU 工作",
    "database": "Connection Pooling 连接池",
    "practice": "找出事件循环被阻塞的代码位置"
  },
  {
    "day": 33,
    "frontend": "列表虚拟化与可视区域渲染",
    "backend": "Cursor-Based Pagination API",
    "database": "Keyset Pagination 与索引配合",
    "practice": "为大量订单设计游标分页"
  },
  {
    "day": 34,
    "frontend": "Query Key 与不同筛选条件的缓存",
    "backend": "Redis Cache-Aside",
    "database": "缓存键、TTL 与失效策略",
    "practice": "设计商品改价后的缓存失效"
  },
  {
    "day": 35,
    "frontend": "通知中心与未读状态",
    "backend": "进程内后台任务与持久队列",
    "database": "Transactional Outbox",
    "practice": "画出下单成功后通知可靠入队的流程"
  },
  {
    "day": 36,
    "frontend": "长任务轮询、退避与停止条件",
    "backend": "有界重试与 Dead-Letter Queue",
    "database": "任务状态机、尝试次数与下次执行时间",
    "practice": "为失败的报表任务设置重试上限"
  },
  {
    "day": 37,
    "frontend": "EventSource 接收实时通知",
    "backend": "SSE、断开连接与资源清理",
    "database": "SQL Window Functions",
    "practice": "为排行榜增加排名列"
  },
  {
    "day": 38,
    "frontend": "WebSocket 连接状态与重连提示",
    "backend": "WebSocket 认证、心跳与消息验证",
    "database": "消息表、顺序编号与唯一约束",
    "practice": "设计聊天消息的顺序和去重字段"
  },
  {
    "day": 39,
    "frontend": "文件选择、预览与客户端大小提示",
    "backend": "Multipart 上传与服务端文件验证",
    "database": "文件元数据、归属与对象引用",
    "practice": "设计文档上传后的元数据记录"
  },
  {
    "day": 40,
    "frontend": "上传进度、取消与重试交互",
    "backend": "对象存储与 Presigned URL",
    "database": "Soft Delete、保留期限与唯一性",
    "practice": "设计文档删除与恢复规则"
  },
  {
    "day": 41,
    "frontend": "Vitest 与 React Testing Library",
    "backend": "pytest 与 FastAPI TestClient",
    "database": "集成测试数据库与数据隔离",
    "practice": "测试一个加载成功和一个失败场景"
  },
  {
    "day": 42,
    "frontend": "Playwright 关键用户流程测试",
    "backend": "Dependency Override 与外部服务 Mock",
    "database": "SQL 查询正确性的回归用例",
    "practice": "测试搜索、翻页和空结果"
  },
  {
    "day": 43,
    "frontend": "自动可访问性检查的能力与局限",
    "backend": "资源越权与权限边界测试",
    "database": "RLS 在不同数据库角色下的验证",
    "practice": "测试普通用户访问他人订单被拒绝"
  },
  {
    "day": 44,
    "frontend": "XSS 与不可信 HTML 渲染",
    "backend": "环境变量、Secret 与日志脱敏",
    "database": "数据库权限审查与运行、迁移角色分离",
    "practice": "检查页面、日志与响应中的泄露风险"
  },
  {
    "day": 45,
    "frontend": "Lockfile 与依赖更新风险",
    "backend": "Docker 镜像、容器与运行配置",
    "database": "pg_dump、恢复与恢复演练",
    "practice": "写出测试库备份后的恢复检查项"
  },
  {
    "day": 46,
    "frontend": "Vite 生产构建与静态资源缓存",
    "backend": "GitHub Actions 的 CI 流水线",
    "database": "在 CI 中验证迁移可执行",
    "practice": "排出检查、测试和构建的顺序"
  },
  {
    "day": 47,
    "frontend": "Bundle 分析与性能预算",
    "backend": "Health、Liveness 与 Readiness",
    "database": "数据库连接池耗尽与监控指标",
    "practice": "区分服务存活和能接收业务请求"
  },
  {
    "day": 48,
    "frontend": "前端错误上报与 Source Map",
    "backend": "OpenTelemetry 与请求链路",
    "database": "pg_stat_activity 与锁等待排查",
    "practice": "串起页面报错、接口追踪和 SQL 等待"
  },
  {
    "day": 49,
    "frontend": "离线提示与网络恢复后的同步",
    "backend": "Graceful Shutdown 与运行中请求",
    "database": "WAL 与 Point-in-Time Recovery 入门",
    "practice": "比较逻辑备份和时间点恢复的用途"
  },
  {
    "day": 50,
    "frontend": "Feature Flag 与渐进开放界面",
    "backend": "灰度发布、回退与配置开关",
    "database": "Expand-and-Contract 迁移",
    "practice": "设计字段改名时的新旧版本兼容"
  },
  {
    "day": 51,
    "frontend": "Chat UI 的消息角色与发送状态",
    "backend": "LLM API Adapter 与提供商隔离",
    "database": "会话、消息与用户的关系模型",
    "practice": "设计一次提问和回答的数据结构"
  },
  {
    "day": 52,
    "frontend": "Markdown、代码块与安全展示",
    "backend": "Structured Output 与 JSON Schema 验证",
    "database": "JSONB 与结构化字段取舍",
    "practice": "定义课程 JSON 的必要字段"
  },
  {
    "day": 53,
    "frontend": "用量、成本与失败提示",
    "backend": "Token 预算、调用超时与费用上限",
    "database": "用量明细、数值精度与成本汇总",
    "practice": "设计每日 AI 用量报表"
  },
  {
    "day": 54,
    "frontend": "引用来源与原文定位交互",
    "backend": "文档切分与入库处理流程",
    "database": "文档版本、Chunk 与来源元数据",
    "practice": "给每个知识片段补齐可追溯来源"
  },
  {
    "day": 55,
    "frontend": "语义搜索与筛选条件交互",
    "backend": "Embeddings 与向量化流程",
    "database": "pgvector 与精确相似度检索",
    "practice": "比较关键词搜索和语义搜索结果"
  },
  {
    "day": 56,
    "frontend": "有依据、无依据与不确定回答的展示",
    "backend": "RAG 上下文构建与 Prompt Injection 边界",
    "database": "PostgreSQL 全文搜索与 GIN 索引",
    "practice": "画出关键词和向量召回的组合流程"
  },
  {
    "day": 57,
    "frontend": "流式回答、停止生成与局部失败",
    "backend": "LLM 流式响应与取消传播",
    "database": "HNSW 近似检索与召回率取舍",
    "practice": "推演用户中途停止生成后的资源释放"
  },
  {
    "day": 58,
    "frontend": "AI 工具操作的确认与结果展示",
    "backend": "Tool Calling、参数验证与服务端授权",
    "database": "工具执行记录与结果追踪",
    "practice": "设计只读查订单工具的输入和权限"
  },
  {
    "day": 59,
    "frontend": "会话历史、恢复与历史搜索",
    "backend": "上下文窗口、截断与摘要记忆",
    "database": "数据保留、清理与关联删除",
    "practice": "规划会话删除时需要清理哪些资料"
  },
  {
    "day": 60,
    "frontend": "学习目录、今日课程与历史页面设计",
    "backend": "预生成课程、定时发送与分片重试",
    "database": "课程版本、概念去重与投递状态机",
    "practice": "画出自己的 60 天学习推送系统"
  }
];
