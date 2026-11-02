(() => {
 const choice=(id,label,value,entries)=>({id,label,type:'select',value,options:entries.map(([value,label])=>({value,label}))});
 const number=(id,label,value,min,max,step=1)=>({id,label,type:'number',value,min,max,step});
 const text=(id,label,value)=>({id,label,type:'text',value,maxLength:100});
 const check=(id,label,value)=>({id,label,type:'checkbox',value});
 const panels=(fe,be,db)=>[
  {label:'FRONTEND',title:'页面中的决定',language:'jsx',code:fe},
  {label:'BACKEND',title:'接口中的边界',language:'python',code:be},
  {label:'DATABASE',title:'资料层的规则',language:'sql',code:db}
 ];
 const row=(label,value,state='neutral')=>({label,value:String(value),state});
 const result=(headline,explanation,metrics,codes,rows,trace,note='本地确定性教学模型；未执行真实 HTTP、SQL 或基础设施操作。')=>({headline,explanation,metrics:metrics.map(([label,value])=>({label,value:String(value)})),panels:panels(...codes),rows,trace,note});
 const spec=(name,title,subtitle,controls,evaluate,tests)=>({name,title,subtitle,teaserTitle:name+'实验',teaserBody:subtitle,controls,evaluate,tests});
 const products=[{id:1,name:'Coffee',price:12,category:1},{id:2,name:'Tea',price:8,category:1},{id:3,name:'Cake',price:10,category:2},{id:4,name:'Bread',price:6,category:null},{id:5,name:'Juice',price:9,category:1}];
 window.LAB_SPECS=Object.assign(window.LAB_SPECS||{}, {
  4:spec('商品卡片与详情 ID','改变 ID，观察定位过程与 404。','在五件本地商品中比较顺序查找和二分查找；二分是有序查找类比，不是真实 B-tree 实现。',[
   number('productId','商品 ID',2,1,9),choice('mode','查找模型','binary',[['binary','有序二分'],['scan','逐行检查']])
  ],v=>{
   const trace=[];let found=null,comparisons=0;
   if(v.mode==='scan'){for(const p of products){comparisons++;trace.push(`检查 ID ${p.id}`);if(p.id===v.productId){found=p;break;}}}
   else {let left=0,right=products.length-1;while(left<=right){const mid=Math.floor((left+right)/2),p=products[mid];comparisons++;trace.push(`范围 [${left},${right}] → 检查 ID ${p.id}`);if(p.id===v.productId){found=p;break;}if(p.id<v.productId) left=mid+1;else right=mid-1;}}
   return result(found?'200 · '+found.name:'404 · 商品不存在','组件显示接收到的商品对象；ID 不等于数组位置。计数只属于五条资料的查找模型。',[['比较次数',comparisons],['资源 ID',v.productId]],[
    found?`<ProductCard product={${JSON.stringify(found)}} />`:'<p role="status">找不到商品，请返回列表。</p>',`GET /products/${v.productId}\n# ${found?'返回找到的对象':'raise HTTPException(404)'}`,`SELECT id,name,price FROM products WHERE id = ${v.productId};\n-- 主键已有索引，真实计划由 PostgreSQL 决定。`
   ],products.map(p=>row('#'+p.id,p.name,p.id===v.productId?'ok':'neutral')),trace);
  },[{values:{productId:2,mode:'binary'},headlineIncludes:'200'},{values:{productId:9,mode:'scan'},headlineIncludes:'404'}]),
  5:spec('新增表单的验证边界','填写名称、价格与库存，修正具体字段。','保留原始字符串，按明确规则验证空白、两位小数金额与非负整数库存，不把空输入误当成零。',[
   text('name','名称','Coffee'),text('price','价格文本','12.50'),text('stock','库存文本','3')
  ],v=>{
   const errors=[];const clean=v.name.trim();
   if(clean.length<1||clean.length>80) errors.push(['名称','去空格后需要 1–80 字']);
   if(!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(v.price)) errors.push(['价格','需要非负金额，最多两位小数与八位整数']);
   if(!/^\d+$/.test(v.stock)||Number(v.stock)>2147483647) errors.push(['库存','需要 0–2147483647 的整数']);
   const payload={name:clean,price:v.price,stock:Number(v.stock)};
   return result(errors.length?'422 · 请修正输入':'有效 · 可以提交','这是本地规则验证器，不会发送请求。金额字符串保留十进制输入，库存验证通过后才转换成数值。',[['错误字段',errors.length],['规范化名称长度',clean.length]],[
    `onSubmit → preventDefault()\nerrors = ${JSON.stringify(errors)}\n// 错误时保留当前输入`,errors.length?'# 字段规则不满足：返回 422，不执行创建，也不调用 Repository。':'ProductIn(**'+JSON.stringify(payload)+')',"name text NOT NULL\nprice numeric(10,2) CHECK (price >= 0)\nstock integer CHECK (stock >= 0)"
   ],errors.length?errors.map(([a,b])=>row(a,b,'warn')):[row('请求体',JSON.stringify(payload),'ok')],['读取原始字符串','规范化名称','逐字段检查','只有通过后才允许提交']);
  },[{values:{name:'Tea',price:'8.50',stock:'3'},headlineIncludes:'有效'},{values:{name:' ',price:'-1',stock:'1.5'},headlineIncludes:'422'}]),
  6:spec('创建响应与新数组','用服务器 ID 加入新商品，检查旧数组有没有改变。','比较不可变追加与直接 push；ID 来自模拟创建响应，不能用列表长度猜测。',[
   text('name','新商品名','Milk'),number('serverId','服务器返回 ID',8,6,99),choice('mode','更新方式','immutable',[['immutable','建立新数组'],['mutate','直接修改旧数组']])
  ],v=>{
   const before=products.slice(0,2).map(p=>({...p}));const oldReference=before;
   const created={id:v.serverId,name:v.name.trim()||'未命名'};
   let after;if(v.mode==='immutable') after=[...before,created];else{before.push(created);after=before;}
   const unchanged=oldReference.length===2;
   return result(unchanged?'完成 · 旧数组保持不变':'问题 · 原数组被修改','演示只在 evaluate 内操作临时数组；不会污染其他实验。正式创建须等待持久化成功再使用返回对象。',[['旧引用当前长度',oldReference.length],['新列表长度',after.length],['同一数组引用',String(after===before)]],[
    v.mode==='immutable'?'setItems(prev => [...prev, created]);':'items.push(created); // 修改原数组',`# 模拟：201 Created\n${JSON.stringify(created)}\nLocation: /products/${v.serverId}`,`INSERT INTO products(name,price) VALUES ('示例',0)\nRETURNING id,name,price;\n-- 服务器 ID 示例为 ${v.serverId}，未实际写库。`
   ],after.map(p=>row('#'+p.id,p.name,p.id===v.serverId?'ok':'neutral')),['初始列表：2 项','模拟服务端返回正式身份',`执行 ${v.mode} 更新`,`旧数组${unchanged?'未变':'已改变'}`]);
  },[{values:{name:'Milk',serverId:8,mode:'immutable'},headlineIncludes:'保持不变'},{values:{name:'Milk',serverId:8,mode:'mutate'},headlineIncludes:'被修改'}]),
  7:spec('草稿、取消与部分更新','只修改草稿价格，决定保存还是取消。','以固定商品 Tea 为正式资料，明确比较省略 price、显式 null 与实际价格更新。',[
   text('price','草稿价格','9.50'),choice('field','请求字段','value',[['value','包含草稿价格'],['omit','省略价格字段'],['null','明确提交 null']]),choice('action','操作','save',[['save','保存'],['cancel','取消']])
  ],v=>{
   const saved={id:2,name:'Tea',price:'8.00'};const patch=v.field==='omit'?{}:{price:v.field==='null'?null:v.price};
   const invalid=v.field==='null'||(v.field==='value'&&!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(v.price));
   const after=v.action==='cancel'||invalid?{...saved}:{...saved,...patch};
   const headline=v.action==='cancel'?'已取消 · 正式价格不变':invalid?'422 · 更新值不合法':v.field==='omit'?'无变化 · 字段未提交':'已保存 · 只更新价格';
   return result(headline,'草稿不是正式商品。省略字段表示不修改；本契约不允许价格为 null。名称始终不属于此次变化。',[['正式价格',after.price],['名称',after.name],['提交字段数量',v.action==='cancel'?0:Object.keys(patch).length]],[
    `draft.price = ${JSON.stringify(v.price)}\nproduct = ${JSON.stringify(after)}`,v.action==='cancel'?'# 用户取消：不发送 PATCH 请求，正式商品保持原值。':`PATCH /products/2\n${JSON.stringify(patch)}\nmodel_dump(exclude_unset=True)`,v.action==='save'&&!invalid&&v.field==='value'?`UPDATE products SET price = ${Number(v.price)} WHERE id=2 RETURNING id,name,price;`:'-- 不执行 UPDATE；保留原资料。'
   ],[row('编辑前','Tea · 8.00'),row('草稿',v.price),row('最终',after.name+' · '+after.price,invalid?'warn':'ok')],['创建独立草稿',`操作：${v.action}`,`传入字段：${Object.keys(patch).join(',')||'无'}`,'正式对象只在成功保存后变化']);
  },[{values:{price:'9.50',field:'value',action:'save'},headlineIncludes:'已保存'},{values:{price:'9.50',field:'value',action:'cancel'},headlineIncludes:'已取消'},{values:{price:'9.50',field:'null',action:'save'},headlineIncludes:'422'}]),
  8:spec('分类删除与外键策略','改变关联数量和删除策略，观察保留下来的资料。','确认框只表达用户意图；RESTRICT、CASCADE 与 SET NULL 的结果由确定的关联规则计算。',[
   number('references','引用商品数量',2,0,5),choice('policy','外键策略','restrict',[['restrict','RESTRICT'],['cascade','CASCADE'],['null','SET NULL']]),check('confirmed','已确认删除',true)
  ],v=>{
   const blocked=v.confirmed&&v.references>0&&v.policy==='restrict';const deleted=v.confirmed&&!blocked;
   const remaining=deleted&&v.policy==='cascade'?0:v.references;
   const headline=!v.confirmed?'已取消 · 不删除':blocked?'409 · 仍有商品引用':'204 · 删除完成';
   const refs=Array.from({length:remaining},(_,i)=>row('商品 '+(i+1),deleted&&v.policy==='null'?'category_id = NULL':'category_id = 1',deleted?'warn':'neutral'));
   return result(headline,'SET NULL 仅在引用列允许 NULL 时有效，本模型假设该列可空。CASCADE 会实际移除引用商品，不只是解除关系。',[['分类剩余',deleted?0:1],['商品剩余',remaining],['删除商品数',v.references-remaining]],[
    deleted?'if (response.status===204) removeCategoryLocally();\n// 不调用 response.json()':'保留分类；显示取消或关联冲突提示',`DELETE /categories/1\n# ${headline}`,`FOREIGN KEY(category_id) REFERENCES categories(id)\nON DELETE ${v.policy==='null'?'SET NULL':v.policy.toUpperCase()};`
   ],[row('分类 1',deleted?'已删除':'保留',blocked?'warn':'neutral'),...refs],['先检查确认',`检测 ${v.references} 个引用`,`应用 ${v.policy} 策略`,'计算分类与商品剩余数量']);
  },[{values:{references:2,policy:'restrict',confirmed:true},headlineIncludes:'409'},{values:{references:2,policy:'cascade',confirmed:true},headlineIncludes:'204'},{values:{references:2,policy:'cascade',confirmed:false},headlineIncludes:'取消'}]),
  9:spec('JOIN 与分类筛选','切换 JOIN 类型，查看未分类商品是否保留。','对本地商品与分类执行真实数组关联和筛选；筛选结果及计数使用同一份派生资料。',[
   choice('join','关联方式','left',[['left','LEFT JOIN'],['inner','INNER JOIN']]),choice('category','页面分类','all',[['all','全部'],['1','Drinks'],['2','Food'],['none','未分类']])
  ],v=>{
   const categories={1:'Drinks',2:'Food'};
   const joined=products.filter(p=>v.join==='left'||categories[p.category]).map(p=>({...p,categoryName:categories[p.category]||null}));
   const shown=joined.filter(p=>v.category==='all'||(v.category==='none'?p.category===null:String(p.category)===v.category));
   return result(shown.length?`找到 ${shown.length} 件商品`:'空结果 · 此组合没有商品','LEFT 保留全部左表行，INNER 只保留匹配行。选择未分类可以直观看出关联方式是否已将它排除。',[['关联后行数',joined.length],['筛选后行数',shown.length]],[
    `const shown = joined.filter(matchesCategory);\n<p>{${shown.length}} 件商品</p>`,`ProductOut(category: CategoryOut | None)\n# 未分类输出 category=null`, `SELECT p.id,p.name,c.name FROM products p\n${v.join==='left'?'LEFT':'INNER'} JOIN categories c ON c.id=p.category_id;`
   ],shown.length?shown.map(p=>row(p.name,p.categoryName||'NULL · 未分类',p.categoryName?'ok':'warn')):[row('资料','成功读取，但没有匹配行','neutral')],['按 category_id 查找分类',v.join==='left'?'保留未匹配商品':'排除未匹配商品',`按页面分类 ${v.category} 筛选`,'从 shown.length 计算数量']);
  },[{values:{join:'left',category:'none'},headlineIncludes:'找到 1'},{values:{join:'inner',category:'none'},headlineIncludes:'空结果'}]),
  10:spec('输入值与 SQL 结构','输入搜索词，检查它是否进入 SQL 指令。','参数模式实际按字面子串筛选；拼接模式只识别固定教学攻击词的 OR 1=1 演示，不是通用 SQL 解释器。',[
   text('term','搜索词',"' OR 1=1 --"),choice('mode','构造方式','bind',[['bind','绑定参数'],['concat','直接拼接']])
  ],v=>{
   const attack=/['"]\s*OR\s+1\s*=\s*1/i.test(v.term);const unsafe=v.mode==='concat'&&v.term.includes("'");
   const shown=v.mode==='concat'&&attack?products:products.filter(p=>p.name.toLowerCase().includes(v.term.toLowerCase()));
   const sql=v.mode==='bind'?'SELECT id,name FROM products WHERE name ILIKE %s':`SELECT id,name FROM products WHERE name ILIKE '%${v.term}%'`;
   return result(unsafe?'风险 · 输入跨入 SQL 结构':'安全边界 · 输入保持为值','绑定模式将整个输入当作资料，即使包含引号也不扩展 SQL。拼接模式显示语句风险；不要将此模型当完整数据库执行器。',[['模拟返回行数',shown.length],['参数数量',v.mode==='bind'?1:0]],[
    `const q = ${JSON.stringify(v.term)};\nfetch('/api/products?q='+encodeURIComponent(q));`,v.mode==='bind'?`cur.execute(${JSON.stringify(sql)}, (${JSON.stringify('%'+v.term+'%')},))`:`# 错误做法：用户输入已混入语句\nsql = ${JSON.stringify(sql)}`,sql
   ],shown.length?shown.map(p=>row(p.name,'匹配','ok')):[row('结果','无字面匹配，成功空集合')],['读取输入原文',v.mode==='bind'?'构造固定 SQL + 独立参数':'直接拼接输入（危险）',attack&&v.mode==='concat'?'命中特定教学签名：模拟 OR 条件放宽':'按字面子串过滤','不会发出真实数据库查询']);
  },[{values:{term:"' OR 1=1 --",mode:'bind'},headlineIncludes:'安全边界'},{values:{term:"' OR 1=1 --",mode:'concat'},headlineIncludes:'风险'}]),
  11:spec('旧请求与新请求的竞态','调整两个请求的完成时间，决定谁能写入界面。','旧搜索词 c 在 0ms 发出，新搜索词 ca 在 100ms 发出。按完成时间真实排序事件，清理保护仅允许当前请求写入。',[
   number('oldDelay','旧请求耗时 ms',900,0,1500,50),number('newDelay','新请求耗时 ms',200,0,1500,50),check('guard','启用过期响应保护',true)
  ],v=>{
   const events=[{q:'c',finish:v.oldDelay,old:true},{q:'ca',finish:100+v.newDelay,old:false}].sort((a,b)=>a.finish-b.finish||Number(b.old)-Number(a.old));
   let shown='尚未返回';const trace=[];
   for(const event of events){const ignored=v.guard&&event.old&&event.finish>=100;if(!ignored)shown=event.q;trace.push(`${event.finish}ms：${event.q} 返回 → ${ignored?'已过期，跳过':'写入界面'}`);}
   const correct=shown==='ca';
   return result(correct?'正确 · 最终显示 ca':'竞态 · 旧 c 覆盖最新查询','100ms 之后旧 Effect 已清理；100ms 之前旧响应仍可短暂显示，但最新请求完成后应由 ca 接管。此处模拟 ignore 标记，不承诺服务端执行被取消。',[['最终显示',shown],['当前查询','ca'],['请求数量',2]],[
    v.guard?'return () => { ignore=true; controller.abort(); };\nif (!ignore) setItems(result);':'setItems(result); // 任意返回均写入',`# GET /products?q=c\n# GET /products?q=ca\n# 服务端完成顺序不保证与发送顺序相同`,'-- 每次查询自身独立执行\nSELECT id,name FROM public.products WHERE name ILIKE $1;'
   ],events.map(e=>row(e.q+' 完成',e.finish+'ms',e.old?'neutral':'ok')),trace);
  },[{values:{oldDelay:900,newDelay:200,guard:true},headlineIncludes:'正确'},{values:{oldDelay:900,newDelay:200,guard:false},headlineIncludes:'竞态'},{values:{oldDelay:0,newDelay:200,guard:false},headlineIncludes:'正确'}]),
  12:spec('分享 URL 与稳定排序','输入搜索与排序，生成能还原条件的链接。','解析页码、编码搜索文字、映射排序白名单，并按价格与 ID 对含空值样本排序。',[
   text('q','搜索文字',''),text('page','页码文本','1'),choice('sort','排序参数','price_asc',[['price_asc','价格升序'],['price_desc','价格降序'],['bad','未知排序（拒绝）']])
  ],v=>{
   const raw=Number(v.page),page=Number.isInteger(raw)&&raw>0?raw:1;const valid=v.sort!=='bad';
   const data=[...products,{id:6,name:'Draft',price:null}].filter(p=>p.name.toLowerCase().includes(v.q.toLowerCase()));
   data.sort((a,b)=>a.price===null?b.price===null?a.id-b.id:1:b.price===null?-1:(v.sort==='price_desc'?b.price-a.price:a.price-b.price)||a.id-b.id);
   const query=new URLSearchParams({q:v.q,page:String(page),sort:v.sort}).toString();
   return result(valid?'可分享 · 参数已规范化':'422 · 未知排序参数','页码演示只规范化，不做分页切片。空价格始终放最后；同价以 ID 排序；未知排序不会进入 SQL。',[['规范页码',page],['匹配数量',data.length]],[
    `history.pushState({},'', '/products?${query}');\n// React 中需由路由或 popstate 同步状态`,valid?`SORTS[${JSON.stringify(v.sort)}] # 固定映射`:'raise HTTPException(422,"Unsupported sort")',valid?`ORDER BY price ${v.sort==='price_desc'?'DESC':'ASC'} NULLS LAST, id ASC`:'-- 未知参数：拒绝构造 SQL'
   ],[row('URL','/products?'+query,'ok'),...data.map(p=>row('#'+p.id+' '+p.name,p.price===null?'NULL':p.price))],['读取外部 URL 值',`页码 ${v.page} → ${page}`,valid?'选择固定排序片段':'拒绝未知排序','URLSearchParams 编码搜索值']);
  },[{values:{q:'tea & cake',page:'-3',sort:'price_asc'},headlineIncludes:'可分享'},{values:{q:'',page:'1',sort:'bad'},headlineIncludes:'422'}]),
  13:spec('防抖输入时间线','调整输入间隔与等待值，计算真正发出的查询。','固定输入 coffee 六个字符；每次输入重设定时器。查询触发后仍需旧请求保护，本实验不模拟网络耗时。',[
   number('gap','字符间隔 ms',100,0,800,50),number('pause','第三字后额外停顿 ms',0,0,1000,50),number('wait','防抖等待 ms',300,50,1000,50)
  ],v=>{
   const word='coffee';const events=Array.from(word,(_,i)=>({time:i*v.gap+(i>=3?v.pause:0),q:word.slice(0,i+1)}));
   const fired=[];for(let i=0;i<events.length;i++){const at=events[i].time+v.wait;if(i===events.length-1||at<=events[i+1].time)fired.push({time:at,q:events[i].q});}
   return result(`防抖后 ${fired.length} 次 · 原本 6 次`,'本模型约定同一毫秒先处理已到期定时器，再处理新输入。输出是固定事件的计数，不是实测性能。',[['原始输入',events.length],['查询次数',fired.length],['减少次数',6-fired.length]],[
    `useDebounced(input, ${v.wait})\n// input 立即显示，query 延后更新`,'async with httpx.AsyncClient(timeout=5.0) as client:\n    ... # 外部调用另设超时', 'EXPLAIN SELECT id,name FROM products WHERE name ILIKE $1;\n-- 防抖减少次数，不改变单条 SQL 的计划。'
   ],events.map(e=>row(e.time+'ms 输入',e.q)),fired.map(e=>`${e.time}ms：查询 ${e.q}`));
  },[{values:{gap:100,pause:0,wait:300},headlineIncludes:'1 次'},{values:{gap:500,pause:0,wait:300},headlineIncludes:'6 次'},{values:{gap:100,pause:600,wait:300},headlineIncludes:'2 次'}]),
  14:spec('Reducer 的事件转换','选择保存结果，查看每个事件后的表单状态。','模拟 edit、submit、saved/failed、cancel 事件，保存中禁止继续编辑；纯 reducer 不执行网络和数据库操作。',[
   text('name','名称草稿',' Tea '),choice('response','模拟保存结果','success',[['success','成功'],['failure','失败']]),check('cancel','保存前取消',false)
  ],v=>{
   const initial={name:'',status:'idle',error:''};
   function reduce(s,a){if(a.type==='edit')return s.status==='saving'?s:{...s,name:a.value,error:''};if(a.type==='submit')return {...s,status:'saving',error:''};if(a.type==='failed')return {...s,status:'idle',error:a.message||'服务暂时失败'};if(a.type==='saved'||a.type==='cancel')return {...initial};return s;}
   const valid=!!v.name.trim();
   const events=[{type:'edit',value:v.name},...(v.cancel?[{type:'cancel'}]:!valid?[{type:'failed',message:'名称不能为空'}]:[{type:'submit'},{type:'edit',value:'不应进入的晚输入'},{type:v.response==='success'?'saved':'failed'}])];
   let state={...initial};const trace=[];for(const e of events){state=reduce(state,e);trace.push(`${e.type} → ${JSON.stringify(state)}`);}
   return result(v.cancel?'已取消 · 草稿重置':!valid?'422 · 名称不能为空':v.response==='success'?'保存成功 · 表单重置':'保存失败 · 输入保留','异步结果由外层处理后发送事件。失败保留原草稿；保存中晚到的 edit 被 reducer 规则忽略。名称是否有效属于独立验证。',[['最终状态',state.status],['保留输入',JSON.stringify(state.name)],['名称业务校验',valid?'通过':'不通过，应在提交前拦截']],[
    `reducer(state,action)\n// 最终 ${JSON.stringify(state)}`,`# 路由：HTTP 错误映射\n# Service：name.strip() → ${JSON.stringify(v.name.trim())}\n# Repository：执行参数化 INSERT`,`-- Repository 接收已验证的业务值\nINSERT INTO products(name,price) VALUES ($1,$2) RETURNING id;`
   ],[row('按钮',state.status==='saving'?'禁用':'可用'),row('错误',state.error||'无',state.error?'warn':'ok')],trace);
  },[{values:{name:'Tea',response:'success',cancel:false},headlineIncludes:'成功'},{values:{name:'Tea',response:'failure',cancel:false},headlineIncludes:'输入保留'},{values:{name:'Tea',response:'success',cancel:true},headlineIncludes:'已取消'}]),
  15:spec('N+1 与批量关联加载','改变商品数量和重复分类，计算示例查询次数。','模型假设每个分类首次懒访问查询一次，之后由 Session 身份映射复用；select-in 按每批四个唯一分类计算。',[
   number('count','商品数量',8,1,12),number('categories','不同分类上限',4,1,12),choice('strategy','加载方式','lazy',[['lazy','懒加载'],['selectin','select-in 批量预加载']])
  ],v=>{
   const items=Array.from({length:v.count},(_,i)=>({id:i+1,cat:i%v.categories+1}));const unique=[...new Set(items.map(p=>p.cat))];
   const queries=v.strategy==='lazy'?1+unique.length:1+Math.ceil(unique.length/4);
   const trace=['查询 1：商品列表'];if(v.strategy==='lazy')unique.forEach((id,i)=>trace.push(`查询 ${i+2}：分类 ${id}（同 Session 后续复用）`));else for(let i=0;i<unique.length;i+=4)trace.push(`批量查询分类 IN (${unique.slice(i,i+4).join(',')})`);
   return result(`${v.strategy==='lazy'?'懒加载':'批量预加载'} · ${queries} 条模型查询`,'四个键一批是本实验自定参数，不是 SQLAlchemy 默认批量阈值。真实 SQL 次数受关系类型、已加载对象和实现影响。',[['商品数',items.length],['不同分类',unique.length],['模型查询数',queries]],[
    '<CurrencyContext.Provider value="MYR">\n  <ProductList items={items}/>\n</CurrencyContext.Provider>',v.strategy==='lazy'?'for p in products:\n    print(p.category.name) # 可能触发查询':'select(Product).options(selectinload(Product.category))',v.strategy==='lazy'?'SELECT * FROM categories WHERE id = $1;':'SELECT * FROM categories WHERE id IN (...);'
   ],items.map(p=>row('商品 '+p.id,'分类 '+p.cat)),trace);
  },[{values:{count:8,categories:4,strategy:'lazy'},headlineIncludes:'5 条'},{values:{count:8,categories:4,strategy:'selectin'},headlineIncludes:'2 条'},{values:{count:8,categories:8,strategy:'selectin'},headlineIncludes:'3 条'}]),
  16:spec('给旧行增加 status 字段','选择默认值和非空要求，检查迁移能否通过。','固定两条已有商品记录。教学模型逐行补默认值再检查 NOT NULL；显示结构回退会失去的状态资料。',[
   choice('default','新列默认值','draft',[['draft','draft'],['published','published'],['none','没有默认值']]),check('notNull','要求 NOT NULL',true),choice('direction','迁移方向','upgrade',[['upgrade','升级新增列'],['downgrade','回退删除列']])
  ],v=>{
   const old=[{id:1,name:'Coffee'},{id:2,name:'Tea'}];const value=v.default==='none'?null:v.default;
   const fail=v.direction==='upgrade'&&v.notNull&&value===null;
   const after=v.direction==='downgrade'?old:fail?old:old.map(p=>({...p,status:value}));
   const headline=fail?'失败 · 旧行无法满足 NOT NULL':v.direction==='downgrade'?'回退 · 状态资料将丢失':'升级完成 · 旧行已处理';
   return result(headline,'这是资料转换与约束检查模型，不运行 Alembic 或数据库锁。回退起点假设两行已拥有状态；删除列不能无损恢复其值。',[['已有商品',old.length],['新列可用',!fail&&v.direction==='upgrade'?'是':'否']],[
    '<Route path="/products/:productId" element={<Detail/>}/>\n// 页面路由不执行数据库迁移','app.include_router(products_router, prefix="/v1")\n# 迁移文件需独立审查',v.direction==='downgrade'?'ALTER TABLE products DROP COLUMN status;':`ALTER TABLE products ADD COLUMN status text${value===null?'':" DEFAULT '"+value+"'"}${v.notNull?' NOT NULL':''};`
   ],after.map(p=>row(p.name,'status' in p?String(p.status):'无 status 列',fail?'warn':'neutral')),['读取已有两行资料',v.direction==='downgrade'?'丢弃 status 列及其值':`为旧行补 ${String(value)}`,fail?'检测到约束冲突，整次失败':'得到目标结构','真实迁移还需检查锁、备份和版本兼容']);
  },[{values:{default:'draft',notNull:true,direction:'upgrade'},headlineIncludes:'升级完成'},{values:{default:'none',notNull:true,direction:'upgrade'},headlineIncludes:'失败'},{values:{default:'draft',notNull:true,direction:'downgrade'},headlineIncludes:'将丢失'}]),
  17:spec('分类内排序与组合索引','更换索引列顺序，观察候选扫描范围。','固定十二行、三个分类；计算简化索引顺序中的检查数量，不模拟真实 B-tree 页面、规划器或磁盘延迟。',[
   number('category','目标分类',2,1,3),choice('index','索引排列','category_first',[['category_first','(category, price, id)'],['price_first','(price, category, id)']]),number('limit','返回上限',2,1,4)
  ],v=>{
   const data=Array.from({length:12},(_,i)=>({id:i+1,category:i%3+1,price:(i*7)%17+1}));
   const ordered=[...data].sort(v.index==='category_first'?(a,b)=>a.category-b.category||a.price-b.price||a.id-b.id:(a,b)=>a.price-b.price||a.category-b.category||a.id-b.id);
   const scan=v.index==='category_first'?ordered.filter(p=>p.category===v.category):ordered;
   let checked=0;const found=[];for(const p of scan){checked++;if(p.category===v.category) found.push(p);if(found.length===v.limit)break;}
   return result(v.index==='category_first'?'候选范围 · 已定位分类分组':'候选范围 · 从价格序列检查分类','分类前导模型直接定位分组后读取；价格前导模型从全局序列过滤至取足。计数不包含树定位成本，不代表 PostgreSQL 一定采用此计划。',[['模拟检查条目',checked],['返回行数',found.length],['总行数',12]],[
    `useQuery({queryKey:["products",{category:${v.category},limit:${v.limit}}],queryFn})`,'# Cache-Control 与前端缓存为独立层\n# 私人资料不能套 public 缓存',`CREATE INDEX demo ON products (${v.index==='category_first'?'category_id,price,id':'price,category_id,id'});\nSELECT * FROM products WHERE category_id=${v.category}\nORDER BY price,id LIMIT ${v.limit};`
   ],found.map(p=>row('#'+p.id,`分类 ${p.category} · 价格 ${p.price}`,'ok')),scan.slice(0,checked).map(p=>`检查 #${p.id}：分类 ${p.category}${p.category===v.category?'，命中':'，跳过'}`));
  },[{values:{category:2,index:'category_first',limit:2},headlineIncludes:'已定位分类'},{values:{category:2,index:'price_first',limit:2},headlineIncludes:'从价格序列'}]),
  18:spec('订单事务与失败回滚','让明细在不同阶段失败，比较事务和逐步提交。','在临时数组建立一张订单与两条明细。事务只在全部完成时替换正式状态，逐步提交会保留之前成功的步骤。',[
   choice('mode','写入方式','transaction',[['transaction','同一事务'],['steps','每步独立提交']]),choice('failAt','失败位置','second',[['none','不失败'],['first','第一条明细'],['second','第二条明细']])
  ],v=>{
   let committed={orders:[],items:[]};const work={orders:[{id:1}],items:[]};const trace=['创建订单头 #1'];if(v.mode==='steps') committed.orders=[{id:1}];let failed=false;
   for(let i=1;i<=2;i++){if(v.failAt===(i===1?'first':'second')){failed=true;trace.push(`明细 ${i} 失败`);break;}work.items.push({order_id:1,product_id:i,qty:1});trace.push(`明细 ${i} 成功`);if(v.mode==='steps')committed.items=work.items.map(x=>({...x}));}
   if(v.mode==='transaction'&&!failed)committed=work;
   trace.push(failed?(v.mode==='transaction'?'ROLLBACK：正式状态保持为空':'已提交步骤无法整体撤回'):'COMMIT：订单与明细完整保存');
   const incomplete=committed.orders.length===1&&committed.items.length!==2;
   return result(!failed?'成功 · 完整订单':incomplete?'失败 · 留下不完整订单':'失败 · 事务已回滚','本地数组快照模拟原子性，不模拟锁和隔离级别。数据库事务不能自动撤回外部邮件、支付或其他服务副作用。',[['已提交订单',committed.orders.length],['已提交明细',committed.items.length]],[
    failed?'mutation.isError → 保留输入；不要显示成功':'onSuccess: () => client.invalidateQueries({queryKey:["orders"]})',v.mode==='transaction'?'with psycopg.connect(dsn) as conn:\n    insert_order(conn)\n    insert_items(conn)':'insert_order(); commit()\ninsert_item_1(); commit()\ninsert_item_2(); commit()',`-- 正式模型结果\norders = ${JSON.stringify(committed.orders)}\norder_items = ${JSON.stringify(committed.items)}`
   ],[row('订单头',committed.orders.length?'存在':'无',incomplete?'warn':'ok'),row('明细完整性',committed.items.length+' / 2',incomplete?'warn':'ok')],trace);
  },[{values:{mode:'transaction',failAt:'second'},headlineIncludes:'已回滚'},{values:{mode:'steps',failAt:'second'},headlineIncludes:'不完整'},{values:{mode:'transaction',failAt:'none'},headlineIncludes:'成功'}]),
  19:spec('幂等创建的重放与冲突','重复一次逻辑操作，改变键与内容观察结果。','固定首次请求 key=k1、商品=Coffee；第二请求在本地唯一记录中查键并比较内容，避免把响应丢失误当未创建。',[
   choice('key','第二次使用的键','k1',[['k1','同一个键 k1'],['k2','新键 k2']]),choice('body','第二次商品','Coffee',[['Coffee','相同内容 Coffee'],['Tea','不同内容 Tea']]),choice('mode','服务端去重','on',[['on','唯一记录 + 指纹'],['off','没有去重']])
  ],v=>{
   const orders=[{id:1,product:'Coffee'}];const registry={k1:{fingerprint:'Coffee',id:1}};let status,id;
   if(v.mode==='on'&&registry[v.key]){if(registry[v.key].fingerprint!==v.body){status=409;id=null;}else{status=200;id=1;}}
   else{orders.push({id:2,product:v.body});status=201;id=2;}
   const headline=status===409?'409 · 同键不同内容冲突':status===200?'重放 · 返回原订单 #1':'201 · 创建新订单 #2';
   return result(headline,'本实验用固定商品名作为可读指纹；正式实现需规范化请求并使用适当哈希、事务、唯一约束及处理中状态。重放状态码由协议约定，示例用 200。',[['订单总数',orders.length],['第二次资源 ID',id===null?'无':id],['响应状态',status]],[
    '// 网络重试复用原键；主动新订单使用新键\n// 乐观 UI 不是创建成功证据',`scope=user7; key=${v.key}; fingerprint=${v.body}\n# ${status===409?'拒绝键复用':status===200?'返回持久记录结果':'执行一次新创建'}`,'PRIMARY KEY(user_id,key)\nINSERT ... ON CONFLICT DO NOTHING RETURNING ...;\n-- 冲突时读取已有记录并核对指纹，不覆盖。'
   ],orders.map(o=>row('订单 #'+o.id,o.product,'ok')),['首次 k1/Coffee 已提交，响应假设丢失',`第二次 ${v.key}/${v.body}`,v.mode==='off'?'无去重，每次重新创建':'原子键记录决定创建、重放或冲突',headline]);
  },[{values:{key:'k1',body:'Coffee',mode:'on'},headlineIncludes:'重放'},{values:{key:'k1',body:'Tea',mode:'on'},headlineIncludes:'409'},{values:{key:'k2',body:'Coffee',mode:'on'},headlineIncludes:'201'}]),
  20:spec('三值逻辑与错误分流','比较 NULL 条件，并把不同失败交给正确的层。','对四条本地 category_id 资料计算 true/false/unknown，WHERE 只保留 true；同时展示选定页面事件的处理边界。',[
   choice('predicate','查询条件','is_null',[['is_null','IS NULL'],['eq_null','= NULL（错误直觉）'],['ne2','<> 2'],['include_null','IS NULL OR <> 2']]),choice('event','页面事件','empty',[['empty','200 空数组'],['http','404 响应'],['render','子树渲染抛错'],['async','异步请求拒绝']])
  ],v=>{
   const data=[{id:1,category:1},{id:2,category:2},{id:3,category:null},{id:4,category:null}];
   const truths=data.map(p=>{let t;if(v.predicate==='is_null')t=p.category===null;if(v.predicate==='eq_null')t=null;if(v.predicate==='ne2')t=p.category===null?null:p.category!==2;if(v.predicate==='include_null')t=p.category===null||p.category!==2;return {...p,truth:t};});
   const passed=truths.filter(p=>p.truth===true);const handling={empty:['成功空状态','暂无商品，不显示请求失败'],http:['请求错误状态','检查 response.ok，展示 PRODUCT_NOT_FOUND'],render:['Error Boundary','子树切换备用界面'],async:['请求 catch','边界不会自动捕获普通异步拒绝']}[v.event];
   const sql={is_null:'category_id IS NULL',eq_null:'category_id = NULL',ne2:'category_id <> 2',include_null:'category_id IS NULL OR category_id <> 2'}[v.predicate];
   return result(`${passed.length} 行通过 · ${handling[0]}`,'NULL 是未知或缺失；普通比较产生 unknown，WHERE 会排除它。成功空数据、HTTP 失败和渲染异常的处理不能互相替代。',[['true 行数',passed.length],['unknown 行数',truths.filter(p=>p.truth===null).length],['页面处理',handling[0]]],[
    v.event==='render'?'<SectionBoundary><ProductPanel/></SectionBoundary>':`// ${handling[1]}`,v.event==='http'?'{"error":{"code":"PRODUCT_NOT_FOUND","message":"商品不存在","request_id":"demo-20"}}':'# 状态码、成功空资料与程序异常分别建模',`SELECT id FROM products WHERE ${sql};`
   ],truths.map(p=>row('#'+p.id+' category='+String(p.category),p.truth===null?'unknown':String(p.truth),p.truth===true?'ok':p.truth===null?'warn':'neutral')),['计算每行比较结果','WHERE 仅保留 true',`得到 ID：${passed.map(p=>p.id).join(',')||'无'}`,handling[1]]);
  },[{values:{predicate:'is_null',event:'empty'},headlineIncludes:'2 行通过'},{values:{predicate:'eq_null',event:'render'},headlineIncludes:'0 行通过'},{values:{predicate:'ne2',event:'http'},headlineIncludes:'1 行通过'},{values:{predicate:'include_null',event:'async'},headlineIncludes:'3 行通过'}])
 });
})();
