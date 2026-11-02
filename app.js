(() => {
  'use strict';
  const courses = window.COURSES || [];
  const curriculum = window.CURRICULUM || [];
  const main = document.getElementById('main');
  const categories = {
    frontend: { label: 'Frontend', cn: '前端', icon: 'layout', number: '01' },
    backend: { label: 'Backend', cn: '后端', icon: 'server', number: '02' },
    database: { label: 'Database', cn: '数据库', icon: 'database', number: '03' }
  };
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    book: '<path d="M4 3h7a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H4Zm16 0h-3a3 3 0 0 0-3 3v15a4 4 0 0 1 4-2h2Z"/>',
    lab: '<path d="M9 3h6m-5 0v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M7 15h10"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01m7-11h3m-3 11h3"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
    coffee: '<path d="M5 8h12v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Zm12 1h2a3 3 0 1 1-2 6M8 2v3m5-3v3"/>',
    refresh: '<path d="M20 8A8 8 0 1 0 20 16M20 3v5h-5"/>'
  };
  const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const pad = number => String(number).padStart(2, '0');
  const lessonList = courses.flatMap(day => day.lessons);
  const allowedIds = new Set(lessonList.map(lesson => lesson.id));
  const storageKey = 'devdaily.prototype.v1';
  const learning = window.LearningState;
  let storageAvailable = true;
  let lastCheckedDate = learning.dateKey();
  let rawProgress = {};
  try {
    rawProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
    localStorage.setItem('devdaily.storage-probe', '1');
    localStorage.removeItem('devdaily.storage-probe');
  } catch { storageAvailable = false; }
  let progress = learning.reconcile(rawProgress, courses, lastCheckedDate);
  if (JSON.stringify(rawProgress) !== JSON.stringify(progress)) persist();
  let selectedDay = progress.currentDay;
  let savedFilter = 'all';
  let flowStep = 0;
  let toastTimer;
  const catalog = { search: '', stage: 'all', available: false };
  const lab = { page: 1, size: 2, query: '' };
  const products = [
    { id: 1, name: 'Coffee', price: 12 }, { id: 2, name: 'Tea', price: 8 },
    { id: 3, name: 'Iced Coffee', price: 15 }, { id: 4, name: 'Cake', price: 10 },
    { id: 5, name: 'Latte', price: 16 }, { id: 6, name: 'Green Tea', price: 9 },
    { id: 7, name: 'Mocha', price: 18 }, { id: 8, name: 'Cookie', price: 6 }
  ];
  const stageTitles = ['商品列表与增删改查', '状态管理与数据一致性', '正确性、登录与权限', '性能、异步与实时功能', '测试、交付与运行维护', 'AI 应用与学习系统'];

  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
    catch { storageAvailable = false; }
  }
  function syncProgress() {
    lastCheckedDate = learning.dateKey();
    const next = learning.reconcile(progress, courses, lastCheckedDate);
    if (JSON.stringify(next) !== JSON.stringify(progress)) {
      progress = next;
      persist();
    }
  }
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 2500);
  }
  function currentRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const view = parts[0] || 'today';
    // The today entrance always resumes the actual learning day, including old #/today/1 bookmarks.
    return { view, day: view === 'today' ? progress.currentDay : Number(parts[1]) || progress.currentDay, category: parts[2] || 'frontend' };
  }
  function overviewUrl(number) { return number === progress.currentDay ? '#/today' : `#/review/${number}`; }
  function daySwitcher(number, context) {
    const index = courses.findIndex(day=>day.number===number);
    const previous = courses[index-1], next = courses[index+1];
    const href = day => context==='lab' ? `#/lab/${day.number}` : overviewUrl(day.number);
    const label = context==='lab' ? '选择实验学习日' : '选择课程学习日';
    return `<div class="day-selector day-switcher" aria-label="${label}">${previous ? `<a class="day-step" href="${href(previous)}" aria-label="查看上一学习日">${icon('back')}</a>` : `<button class="day-step" disabled aria-label="已经是第一天">${icon('back')}</button>`}<select class="day-jump" aria-label="${label}" data-day-context="${context}">${courses.map(day=>`<option value="${day.number}" ${day.number===number?'selected':''}>Day ${pad(day.number)} · ${escape(day.title)}</option>`).join('')}</select>${next ? `<a class="day-step" href="${href(next)}" aria-label="查看下一学习日">${icon('arrow')}</a>` : `<button class="day-step" disabled aria-label="已经是最后一天">${icon('arrow')}</button>`}</div>`;
  }
  function codeFilename(lesson) {
    return ({jsx:'App.jsx',tsx:'App.tsx',javascript:'example.js',typescript:'example.ts',python:'main.py',sql:'query.sql',bash:'terminal.sh',yaml:'workflow.yml',json:'example.json',text:'流程示意'})[lesson.language] || lesson.language || '示例';
  }
  function levelLabel(level) { return ({Beginner:'基础',Intermediate:'进阶',Advanced:'深入'})[level] || level; }
  function nav(view) {
    document.getElementById('main-nav').innerHTML = [
      ['today', 'home', '今日学习', ''], ['catalog', 'book', '课程目录', '60'],
      ['lab', 'lab', '互动实验', pad(selectedDay)], ['saved', 'bookmark', '我的收藏', String(progress.saved.length)]
    ].map(([route, glyph, label, count]) => `<a href="${route === 'lab' ? `#/lab/${selectedDay}` : '#/'+route}" class="nav-item ${view === route || (route === 'today' && ['day','review'].includes(view)) ? 'active' : ''}" ${view === route || (route === 'today' && ['day','review'].includes(view)) ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</a>`).join('');
  }
  function safeUrl(url) {
    try { const value = new URL(url); return value.protocol === 'https:' ? escape(value.href) : '#'; }
    catch { return '#'; }
  }
  function highlight(source) {
    const pattern = /(\/\/[^\n]*|#[^\n]*|--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|function|return|export|default|import|from|def|if|in|for|async|await|SELECT|FROM|WHERE|ORDER|BY|LIMIT|OFFSET|CREATE|TABLE|INSERT|INTO|VALUES|AND|NOT|NULL|PRIMARY|KEY|CHECK|AS|ALWAYS|GENERATED|IDENTITY)\b|\b\d+(?:\.\d+)?\b)/g;
    let html = '', cursor = 0;
    for (const match of source.matchAll(pattern)) {
      html += escape(source.slice(cursor, match.index));
      const token = match[0];
      const kind = /^(\/\/|#|--)/.test(token) ? 'comment' : /^["']/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : 'key';
      html += `<span class="syn-${kind}">${escape(token)}</span>`;
      cursor = match.index + token.length;
    }
    return html + escape(source.slice(cursor));
  }
  function card(day, lesson) {
    const category = categories[lesson.category];
    const complete = progress.completed.includes(lesson.id);
    const briefs = {
      'FE-001': '把一份商品数组，变成清楚、有序的页面。', 'BE-001': '认识页面与资料之间的那个入口。', 'DB-001': '让资料有结构，也能被持久保存。',
      'FE-002': '输入改变，页面就显示你想找的商品。', 'BE-002': '让搜索条件成为接口的一部分。', 'DB-002': '让数据库找到真正符合条件的资料。',
      'FE-003': '一页显示几条？边界由谁来处理？', 'BE-003': '定义清晰、有上限的分页规则。', 'DB-003': '从有序资料中，取出需要的那一页。'
    };
    return `<a href="#/day/${day.number}/${lesson.category}" class="lesson-card"><div class="card-top"><span class="category-mark ${lesson.category}">${icon(category.icon)}</span><span class="card-number">${category.number} / ${category.label.toUpperCase()}</span></div><h3>${escape(lesson.name)}</h3><p>${escape(briefs[lesson.id] || lesson.teaser || lesson.problem.slice(0,45)+'…')}</p><div class="card-bottom"><span>${escape(levelLabel(lesson.level))} · 约 ${Math.max(3,Math.round(Number(day.minutes)/3))} 分钟</span><strong>${complete ? '已学完' : '开始学习'} ${icon(complete ? 'check' : 'arrow')}</strong></div></a>`;
  }
  function sketch() {
    return '<svg viewBox="0 0 90 90" fill="none" aria-hidden="true"><rect x="9" y="12" width="63" height="46" rx="5" stroke="#688360" stroke-width="1.5"/><path d="M9 24h63M19 32h17m-17 7h32m-32 7h24" stroke="#688360" stroke-width="1.5"/><rect x="44" y="42" width="36" height="35" rx="4" fill="#eaf0e4" stroke="#688360" stroke-width="1.5"/><path d="M51 51h22m-22 7h22m-22 7h13" stroke="#688360" stroke-width="1.5"/><circle cx="67" cy="72" r="10" fill="#244b3b"/><path d="m64 68 5 4-5 4" stroke="#ddeecc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function flow(day) {
    return `<div class="route-panel"><div class="route-panel-head"><div><h2>${day.number <= 3 ? '一条请求，四个站点。' : '把今天的机制，一步步连起来。'}</h2><p>点击每一步，看懂前后端怎样配合。</p></div><span class="pill">FOLLOW THE DATA</span></div><div class="flow-nodes">${day.flow.map((node, i) => `<button class="flow-node" data-flow="${i}" aria-pressed="${i === flowStep}"><span>${escape(node.label)}</span><strong>${escape(node.title)}</strong></button>`).join('')}</div><div id="flow-detail" class="flow-detail" aria-live="polite"><p>${escape(day.flow[flowStep].detail)}</p><code>${escape(day.flow[flowStep].code)}</code></div><p class="flow-summary">${escape(day.summary)}</p><p class="scope-note">流程与代码用于教学说明，不代表执行了真实服务。</p></div>`;
  }
  function practice(day) {
    const challenge = day.challenge;
    return `<div class="practice"><div class="eyebrow">SMALL STEPS, REAL UNDERSTANDING</div><h2>动手练一下 <span class="pill">${escape(challenge.duration)} MIN</span></h2><p>${escape(challenge.task)}</p><ol>${challenge.criteria.map(item => `<li>${escape(item)}</li>`).join('')}</ol><details><summary>需要一点提示？</summary><p>${escape(challenge.hint)}</p></details><details><summary>我试过了，查看参考答案</summary><pre>${escape(challenge.solution)}</pre></details></div>`;
  }
  function labInfo(number) {
    return window.LAB_SPECS?.[number] || {
      1: {name:'列表渲染',title:'改一份数据，看见列表更新。',subtitle:'添加或移除商品，观察数组、稳定 ID 和页面怎样一起变化。',teaserTitle:'数组加一项，页面多一行。',teaserBody:'亲手修改商品资料，理解 map 与 key 的作用。'},
      2: {name:'商品搜索',title:'输入一个词，看懂搜索全过程。',subtitle:'从输入状态，到 GET 参数，再到数据库筛选，观察每一层怎样表达相同的搜索。',teaserTitle:'敲下关键词，看见筛选发生。',teaserBody:'搜索 Coffee，同步观察输入、请求参数和匹配资料。'},
      3: {name:'商品分页',title:'翻一页，连接三个世界。',subtitle:'改变页码或每页数量，观察页面、API 参数、SQL 和返回资料怎样一起变化。',teaserTitle:'翻一页，看见背后的变化。',teaserBody:'修改页码，观察 API、SQL 和资料怎样一起变化。'}
    }[number] || {name:'互动实验',title:`Day ${pad(number)} 实验准备中`,subtitle:'这一天的互动实验会与当天课程一起制作。',teaserTitle:'对应的互动实验正在准备。',teaserBody:'每个实验都会对应当天的知识点。'};
  }
  function studyStatus(day) {
    const done = day.lessons.filter(lesson=>progress.completed.includes(lesson.id)).length;
    const isToday = day.number === progress.currentDay;
    let message;
    if (!isToday) message = `${day.number < progress.currentDay ? '正在回看' : '正在预览'} Day ${pad(day.number)}；今日学习仍是 Day ${pad(progress.currentDay)}。`;
    else if (done === day.lessons.length) message = courses.some(item=>item.number===day.number+1) ? `Day ${pad(day.number)} 三课已完成。今天可以复习，明天自动进入 Day ${pad(day.number+1)}。` : `${courses.length} 天学习计划已完成。可以回看课程，或到收藏夹复习。`;
    else message = `继续 Day ${pad(day.number)} · 已完成 ${done} / ${day.lessons.length} 课。未完成会保留在这一天，学完后隔天继续。`;
    return `<div class="study-status ${isToday && done===day.lessons.length?'day-done':''}">${icon(isToday && done===day.lessons.length?'check':'info')}<p>${escape(message)}<small>以马来西亚日期为准 · ${escape(lastCheckedDate)}</small></p>${!isToday?'<a class="text-link" href="#/today">返回今日学习 '+icon('arrow')+'</a>':''}</div>`;
  }
  function today(day) {
    const done = day.lessons.filter(lesson => progress.completed.includes(lesson.id)).length;
    const headline = day.number === 1 ? '从一张商品列表，<br>看懂整个数据旅程。' : day.number === 2 ? '从一次搜索，<br>理解筛选怎样发生。' : day.number === 3 ? '从一次翻页，<br>看见三层一起工作。' : escape(day.title);
    return `<div class="eyebrow">A LITTLE EVERY DAY. A LITTLE MORE CONNECTED.</div><div class="page-heading"><div><h1>${headline}</h1><p class="lede">${escape(day.subtitle)}<br>今天的三个知识点，约 ${escape(day.minutes)} 分钟，一步步读懂。</p></div><div class="heading-stats"><div class="progress-circle" style="--progress:${done / 3 * 100}%"><strong>${done}<small> / 3</small></strong></div><span>今日已完成</span></div></div><div class="day-strip"><span class="day-strip-label"><strong>DAY ${pad(day.number)} / 60</strong>${escape(day.title)}</span>${daySwitcher(day.number,'overview')}</div>${studyStatus(day)}<div class="section-heading"><h2>今天，连接这三个知识点。</h2><span class="text-link">FRONT → BACK → DATA</span></div><div class="lesson-grid">${day.lessons.map(lesson => card(day, lesson)).join('')}</div><div class="section-heading"><h2>把概念连起来</h2><p>不只知道是什么，也知道怎样合作。</p></div>${flow(day)}<div class="bottom-grid"><div class="lab-teaser"><div class="lab-sketch">${sketch()}</div><div><span class="small-caps">DAY ${pad(day.number)} / INTERACTIVE LAB</span><h3>${escape(labInfo(day.number).teaserTitle)}</h3><p>${escape(labInfo(day.number).teaserBody)}</p><a class="text-link" href="#/lab/${day.number}">打开 Day ${pad(day.number)} 实验 ${icon('arrow')}</a></div></div><div class="week-note"><span class="small-caps">YOUR NEXT SMALL STEP</span><h3>学完之后，自己做一次。</h3><p>${escape(day.challenge.task)}</p><a href="#/day/${day.number}/frontend" class="text-link">从前端课开始 ${icon('arrow')}</a></div></div>`;
  }
  function lessonPage(day, lesson) {
    const cat = categories[lesson.category];
    const saved = progress.saved.includes(lesson.id), completed = progress.completed.includes(lesson.id);
    const i = lessonList.findIndex(item => item.id === lesson.id);
    const nextLesson = lessonList[i + 1];
    const nextDay = nextLesson ? courses.find(item => item.lessons.includes(nextLesson)) : null;
    return `<a class="back-link" href="${overviewUrl(day.number)}">${icon('back')} 返回 Day ${pad(day.number)} 概览</a><div class="lesson-heading"><div class="eyebrow">DAY ${pad(day.number)} / ${cat.label.toUpperCase()}</div><div class="lesson-heading-top"><h1>${escape(lesson.name)}</h1><button class="button bookmark-button" data-action="save" data-id="${lesson.id}" aria-pressed="${saved}" aria-label="${saved ? '取消收藏' : '收藏'}${escape(lesson.name)}">${icon('bookmark')}<span class="button-label">${saved ? '已收藏' : '收藏'}</span></button></div><div class="metadata"><span>${escape(lesson.type)}</span><span>${escape(lesson.level)}</span><span>约 ${Math.max(3,Math.round(Number(day.minutes)/3))} 分钟</span></div></div><nav class="category-tabs" aria-label="今日三课">${day.lessons.map(item => `<a href="#/day/${day.number}/${item.category}" class="category-tab ${item.id === lesson.id ? 'selected' : ''}" ${item.id === lesson.id ? 'aria-current="page"' : ''}>${icon(categories[item.category].icon)}${categories[item.category].label}${progress.completed.includes(item.id) ? icon('check') : ''}</a>`).join('')}<a class="category-tab lab-course-link" href="#/lab/${day.number}">${icon('lab')}Day ${pad(day.number)} 实验</a></nav>${studyStatus(day)}<div class="reading-layout"><article class="article"><section id="problem"><h2><span class="section-index">01</span>它解决什么问题？</h2><p>${escape(lesson.problem)}</p></section><section id="mechanism"><h2><span class="section-index">02</span>它怎样工作？</h2><ol>${lesson.mechanism.map(item => `<li>${escape(item)}</li>`).join('')}</ol></section><section id="example"><h2><span class="section-index">03</span>看一段实际代码</h2><div class="code-block"><div class="code-bar"><div class="code-bar-left"><span class="code-dots"><i></i><i></i><i></i></span><span>${codeFilename(lesson)}</span></div><button class="copy-button" data-copy="${lesson.id}">${icon('copy')} 复制代码</button></div><pre><code>${highlight(lesson.code)}</code></pre></div><p>${escape(lesson.explanation)}</p></section><section id="usage"><h2><span class="section-index">04</span>什么时候用？</h2><p>${escape(lesson.usage)}</p></section><section id="mistakes"><h2><span class="section-index">05</span>先避开这几个坑</h2><div class="warning"><ul>${lesson.mistakes.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div></section><section id="takeaways"><h2><span class="section-index">06</span>带走三个重点</h2><ul>${lesson.takeaways.map(item => `<li>${escape(item)}</li>`).join('')}</ul></section><section id="refs"><h2><span class="section-index">↗</span>去官方文档多看一点</h2><div class="references">${lesson.refs.map(ref => `<a href="${safeUrl(ref.url)}" target="_blank" rel="noopener noreferrer">${escape(ref.label)} ↗</a>`).join('')}</div></section>${practice(day)}<div class="lesson-actions"><button class="button primary complete-button" aria-pressed="${completed}" data-action="complete" data-id="${lesson.id}">${icon('check')}${completed ? '已学完 · 点击撤销' : '完成这一课'}</button>${nextLesson && nextDay.number === day.number ? `<a class="button" href="#/day/${nextDay.number}/${nextLesson.category}">下一课：${escape(nextLesson.name)} ${icon('arrow')}</a>` : nextLesson ? `<a class="button" href="#/today">返回今日学习 ${icon('arrow')}</a>` : '<a class="button" href="#/catalog">返回课程目录 '+icon('arrow')+'</a>'}</div><p class="next-note">${escape(day.preview)}</p></article><aside class="aside-notes" aria-label="本课目录"><div class="aside-label">IN THIS LESSON</div><nav class="toc">${[['problem','解决什么问题'],['mechanism','怎样工作'],['example','实际代码'],['usage','什么时候用'],['mistakes','常见误区'],['takeaways','三个重点'],['refs','官方参考']].map(([id, text]) => `<a href="#/day/${day.number}/${lesson.category}" data-scroll="${id}">${text}</a>`).join('')}</nav><div class="takeaway-card"><h3>理解，比记住更重要。</h3><ul>${lesson.takeaways.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div><p class="scope-note">${lesson.id}<br>代码是教学示例，环境准备另计。学习记录只保存在此浏览器。</p></aside></div>`;
  }
  function catalogRows() {
    const query = catalog.search.trim().toLocaleLowerCase();
    const rows = curriculum.filter(row => (!catalog.available || courses.some(day=>day.number===row.day)) && (catalog.stage === 'all' || Math.ceil(row.day / 10) === Number(catalog.stage)) && (!query || [row.day, row.frontend, row.backend, row.database].join(' ').toLocaleLowerCase().includes(query)));
    return { count: rows.length, html: rows.length ? rows.map(row => `<div class="catalog-row"><div class="catalog-day"><small>DAY</small>${pad(row.day)}</div><div class="catalog-topics">${Object.entries(categories).map(([key, category]) => `<div class="catalog-topic ${key}"><span>${category.label.toUpperCase()}</span>${escape(row[key])}</div>`).join('')}</div><div class="catalog-status-badge">${courses.some(day=>day.number===row.day) ? `<a href="${overviewUrl(row.day)}">可以开始 ${icon('arrow')}</a>` : '正文待制作'}</div></div>`).join('') : `<div class="empty-state">${icon('search')}<h2>没有找到这个主题</h2><p>试试 React、API、索引，或清除筛选条件。</p><button class="button" data-action="reset-catalog">清除筛选</button></div>` };
  }
  function catalogPage() {
    const rows = catalogRows();
    return `<div class="eyebrow">A MAP, NOT A RACE.</div><div class="page-heading"><div><h1>把零散知识，连成一条路。</h1><p class="lede">60 天，180 个主题。从一张商品列表，走到自己的 AI 学习系统。<br>${courses.length === curriculum.length ? '60 天完整课程、流程图和每日互动实验已就绪。' : `已有 ${courses.length} 天完整课程，其余课程正在补充。`}</p></div></div><div class="catalog-tools"><label class="search-field">${icon('search')}<span class="sr-only">搜索课程主题</span><input id="catalog-search" type="search" placeholder="搜索主题，例如 React、索引、RAG…" value="${escape(catalog.search)}"></label><select id="catalog-stage" class="select-field" aria-label="筛选学习阶段"><option value="all">全部学习阶段</option>${stageTitles.map((title,i) => `<option value="${i+1}" ${catalog.stage === String(i+1) ? 'selected' : ''}>${pad(i*10+1)}–${pad(i*10+10)} · ${title}</option>`).join('')}</select></div><div class="catalog-status"><span id="catalog-count" role="status" aria-live="polite">找到 ${rows.count} 天课程 · 共 60 天规划</span>${courses.length < curriculum.length ? `<label><input id="available-only" type="checkbox" ${catalog.available ? 'checked' : ''}>只看可阅读的 ${courses.length} 天</label>` : '<span>180 个知识点 · 60 个每日实验</span>'}</div><div class="catalog-list" id="catalog-list">${rows.html}</div>`;
  }
  function updateCatalog() {
    const rows = catalogRows();
    document.getElementById('catalog-list').innerHTML = rows.html;
    document.getElementById('catalog-count').textContent = `找到 ${rows.count} 天课程 · 共 60 天规划`;
  }
  function savedPage() {
    const all = courses.flatMap(day => day.lessons.filter(lesson => progress.saved.includes(lesson.id)).map(lesson => ({day, lesson})));
    const items = savedFilter === 'all' ? all : all.filter(item => item.lesson.category === savedFilter);
    const filters = [['all', '全部', 'book'], ...Object.entries(categories).map(([key, category]) => [key, category.cn, category.icon])];
    const filterHtml = `<div class="saved-filters" role="group" aria-label="按技术类别筛选收藏">${filters.map(([key,label,glyph])=>`<button class="category-tab ${savedFilter === key ? 'selected' : ''}" data-saved-filter="${key}" aria-pressed="${savedFilter === key}">${icon(glyph)}${label}<span class="filter-count">${key === 'all' ? all.length : all.filter(item=>item.lesson.category===key).length}</span></button>`).join('')}</div>`;
    return `<div class="eyebrow">KEEP WHAT CLICKED.</div><div class="page-heading"><div><h1>留住想再看一遍的知识。</h1><p class="lede">${all.length ? `已收藏 ${all.length} 个知识点。按前端、后端或数据库，找到想复习的内容。` : '课程里的黄色书签，会把知识点放到这里。'}</p></div></div>${filterHtml}<div class="saved-results" aria-live="polite">${items.length ? `<div class="lesson-grid">${items.map(({day,lesson})=>`<div class="saved-entry">${card(day,lesson)}<div class="saved-meta"><span>DAY ${pad(day.number)} · ${categories[lesson.category].cn}</span><button class="button bookmark-button" data-action="save" data-id="${lesson.id}" aria-pressed="true" aria-label="取消收藏${escape(lesson.name)}">${icon('bookmark')}<span class="button-label">取消收藏</span></button></div></div>`).join('')}</div>` : `<div class="empty-state">${icon('bookmark')}<h2>${all.length ? `还没有${categories[savedFilter]?.cn || ''}收藏` : '给值得重读的内容，留个位置。'}</h2><p>${all.length ? '切换其他分类，或在课程中点亮书签。' : '先从今天开始。遇到想复习的知识点，点一下收藏。'}</p><a class="button primary" href="#/today">返回今日学习 ${icon('arrow')}</a></div>`}</div><p class="scope-note">收藏与学习进度保存在当前浏览器；更换设备或清除浏览器资料后不会自动同步。</p>`;
  }
  function labState() {
    const keyword = lab.query.trim().toLocaleLowerCase();
    const filtered = products.filter(item => item.name.toLocaleLowerCase().includes(keyword));
    const pages = Math.ceil(filtered.length / lab.size);
    lab.page = Math.max(1, Math.min(lab.page, pages || 1));
    const offset = (lab.page - 1) * lab.size;
    return { filtered, pages, offset, items: filtered.slice(offset, offset + lab.size) };
  }
  function labResults() {
    const state = labState();
    const query = lab.query.trim();
    const url = `/products?page=${lab.page}&page_size=${lab.size}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
    const escapedPattern = query.replace(/[\\%_]/g, '\\$&');
    const parameters = [`%${escapedPattern}%`, lab.size, state.offset];
    const sql = `SELECT id, name, price\nFROM products\nWHERE name ILIKE $1\nORDER BY id\nLIMIT $2 OFFSET $3;\n\n-- 参数：${JSON.stringify(parameters)}`;
    return `<div class="lab-layout"><section class="lab-pane"><div class="pane-header"><h2>${icon('layout')} 页面看到的商品</h2><span>01 / FRONTEND</span></div><div class="product-grid">${state.items.length ? state.items.map(item=>`<div class="product-tile"><div class="product-tile-top">${icon('coffee')}<small>#${pad(item.id)}</small></div><h3>${escape(item.name)}</h3><p>RM ${item.price.toFixed(2)}</p></div>`).join('') : '<p class="scope-note">没有找到商品。试试 Coffee 或 Tea。</p>'}</div><div class="pagination"><button class="button" data-action="lab-prev" ${lab.page === 1 ? 'disabled' : ''}>${icon('back')} 上一页</button><span role="status" aria-live="polite">${state.pages ? `第 ${lab.page} / ${state.pages} 页 · ${state.filtered.length} 件商品` : '0 件商品 · 无匹配结果'}</span><button class="button" data-action="lab-next" ${lab.page >= state.pages ? 'disabled' : ''}>下一页 ${icon('arrow')}</button></div><div class="lab-equation">OFFSET = (page − 1) × page_size<br>　　　= (${lab.page} − 1) × ${lab.size} = <strong>${state.offset}</strong></div></section><section class="lab-pane"><div class="pane-header"><h2>${icon('server')} 背后发生了什么</h2><span>02 → 03 / API → SQL</span></div><div class="lab-code"><h3>HTTP REQUEST / 请求参数</h3><pre><code>GET ${escape(url)}</code></pre></div><div class="lab-code"><h3>DATABASE QUERY / 查询示意</h3><pre><code>${highlight(sql)}</code></pre></div><div class="lab-code"><h3>JSON RESPONSE / 响应摘要</h3><pre><code>${escape(JSON.stringify({items:state.items.map(item=>({id:item.id,name:item.name})),page:lab.page,page_size:lab.size,total:state.filtered.length}, null, 2))}</code></pre></div></section></div><section class="database-panel"><div class="pane-header"><h2>${icon('database')} 数据库怎样取出这一页？</h2><div class="legend"><span><i class="skip"></i>OFFSET 跳过</span><span><i></i>LIMIT 返回</span><span><i class="later"></i>后续页</span></div></div><p class="database-caption">先按名称筛选，再按 id 排序，最后跳过 ${state.offset} 条，最多返回 ${lab.size} 条。</p><div class="data-table-wrap"><table class="data-table"><thead><tr><th scope="col">ID</th><th scope="col">NAME</th><th scope="col">PRICE</th><th scope="col">本次查询</th></tr></thead><tbody>${state.filtered.length ? state.filtered.map((item,i)=>`<tr class="${i < state.offset ? 'row-skipped' : i < state.offset + lab.size ? 'row-current' : ''}"><td>${pad(item.id)}</td><td>${escape(item.name)}</td><td>RM ${item.price.toFixed(2)}</td><td class="row-label">${i < state.offset ? '已跳过' : i < state.offset + lab.size ? '本页返回' : '后续页'}</td></tr>`).join('') : '<tr><td colspan="4">没有符合筛选条件的资料。</td></tr>'}</tbody></table></div></section><p class="lab-tip">试着搜索「Coffee」，把每页数量设为 1，再翻到第二页。你会看到：先筛选，再计算分页，最后返回结果。此处用英语样本演示；没有运行真实 SQL。</p>`;
  }
  function labPage(day) {
    const info = labInfo(day.number);
    const activity = day.number === 3 ? `<div class="lab-controls"><div class="control-group"><label for="lab-search">搜索商品名称</label><div class="search-field">${icon('search')}<input type="search" id="lab-search" value="${escape(lab.query)}" placeholder="试试 Coffee、Tea…" maxlength="50"></div></div><div class="control-select"><label for="lab-size">每页数量 / page_size</label><select id="lab-size" class="select-field">${[1,2,3,4,6].map(size=>`<option value="${size}" ${size===lab.size?'selected':''}>${size} 件</option>`).join('')}</select></div><button class="button" data-action="lab-reset">${icon('refresh')} 重置实验</button></div><div id="lab-results">${labResults()}</div>` : day.number <= 2 ? window.LabActivities.render(day.number, {escape, highlight, icon, toast}) : window.ModelLabs.render(day.number, {escape, highlight, icon, toast});
    return `<div class="eyebrow">DAY ${pad(day.number)} / LEARN IT. THEN TRY IT.</div><div class="page-heading"><div><h1>${escape(info.title)}</h1><p class="lede">${escape(info.subtitle)}</p></div><a class="button subtle" href="${overviewUrl(day.number)}">返回 Day ${pad(day.number)} 学习 ${icon('arrow')}</a></div><div class="lab-day-context"><span>正在体验 <strong>Day ${pad(day.number)} · ${escape(info.name)}</strong></span>${daySwitcher(day.number,'lab')}</div><div class="lab-intro">${icon('info')}浏览器教学模拟 · 不连接真实 API 或数据库 · 实验与所查看的学习日对应</div>${activity}`;
  }
  function render(options = {}) {
    syncProgress();
    const route = currentRoute();
    let html;
    if (!courses.length) { main.innerHTML = '<h1>课程暂时没有载入</h1><p>请刷新页面，或检查 courses.js 是否与网页放在同一目录。</p>'; return; }
    const day = courses.find(item => item.number === route.day);
    const lesson = day?.lessons.find(item => item.category === route.category);
    if (['today','review'].includes(route.view) && day) { selectedDay = day.number; flowStep = 0; html = today(day); }
    else if (route.view === 'day' && lesson) { selectedDay = day.number; html = lessonPage(day, lesson); }
    else if (route.view === 'catalog') html = catalogPage();
    else if (route.view === 'lab' && day) { selectedDay = day.number; html = labPage(day); }
    else if (route.view === 'saved') html = savedPage();
    else html = `<div class="empty-state"><h1>这堂课还没准备好</h1><p>请从课程目录选择有效的学习日。</p><a class="button primary" href="#/catalog">返回课程目录</a></div>`;
    main.innerHTML = `${storageAvailable ? '' : '<div class="storage-note">当前浏览器无法保存进度。你仍可正常学习，本次标记只在页面关闭前有效。</div>'}${html}`;
    nav(route.view);
    const labels = {today:`今日学习 / Day ${pad(progress.currentDay)}`,review:`查看课程 / Day ${pad(route.day)}`,day:`Day ${pad(route.day)} / ${categories[route.category]?.cn || '课程'}`,catalog:'课程目录',lab:`Day ${pad(route.day)} 互动实验`,saved:'我的收藏'};
    document.getElementById('breadcrumb').textContent = `学习空间 / ${labels[route.view] || '课程'}`;
    document.title = `${route.view === 'day' && lesson ? lesson.name : labels[route.view] || '学习空间'} — Dev Daily`;
    if (options.focusSelector) {
      const target = main.querySelector(options.focusSelector) || main.querySelector('[data-saved-filter="'+savedFilter+'"]') || main;
      target.focus({preventScroll:true});
    }
  }

  document.addEventListener('click', async event => {
    if (event.target.closest('.skip-link')) {
      event.preventDefault(); main.focus(); main.scrollIntoView({block:'start'}); return;
    }
    const scrollLink = event.target.closest('[data-scroll]');
    if (scrollLink) {
      event.preventDefault();
      const section = document.getElementById(scrollLink.dataset.scroll);
      section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      if (section) { section.tabIndex=-1; section.focus({preventScroll:true}); }
      return;
    }
    const node = event.target.closest('[data-flow]');
    if (node) {
      flowStep = Number(node.dataset.flow);
      const day = courses.find(item=>item.number===selectedDay);
      document.querySelectorAll('[data-flow]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.flow)===flowStep)));
      document.getElementById('flow-detail').innerHTML = `<p>${escape(day.flow[flowStep].detail)}</p><code>${escape(day.flow[flowStep].code)}</code>`;
      return;
    }
    const copy = event.target.closest('[data-copy]');
    if (copy) {
      const lesson = lessonList.find(item=>item.id===copy.dataset.copy);
      try { await navigator.clipboard.writeText(lesson.code); toast('代码已复制'); }
      catch { toast('浏览器暂不允许复制，请在代码块中手动选取。'); }
      return;
    }
    const filter = event.target.closest('[data-saved-filter]');
    if (filter && ['all',...Object.keys(categories)].includes(filter.dataset.savedFilter)) {
      savedFilter = filter.dataset.savedFilter;
      render({focusSelector:`[data-saved-filter="${savedFilter}"]`}); return;
    }
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (window.LabActivities.click(action,button) || window.ModelLabs?.click(action,button)) return;
    if (action === 'save' || action === 'complete') {
      const field = action === 'save' ? 'saved' : 'completed';
      const id = button.dataset.id;
      if (!allowedIds.has(id)) return;
      const wasActive = progress[field].includes(id);
      progress[field] = wasActive ? progress[field].filter(value=>value!==id) : [...progress[field],id];
      syncProgress(); persist(); render({focusSelector:`[data-action="${action}"][data-id="${id}"]`});
      const completedDay = courses.find(item=>item.lessons.some(lesson=>lesson.id===id));
      const dayDone = completedDay && learning.dayComplete(progress,completedDay);
      const hasNextDay = courses.some(item=>item.number===completedDay?.number+1);
      toast(action==='save' ? (wasActive?'已取消收藏':'已加入我的收藏') : (wasActive?'已撤销完成标记':dayDone && completedDay.number === progress.currentDay ? hasNextDay ? '今天的三课已完成，明天继续下一天。' : `${courses.length} 天学习计划已完成，继续保持复习。`:'这一课，学会了。继续向前一步。'));
    }
    if (action === 'lab-prev' || action === 'lab-next') {
      lab.page += action === 'lab-prev' ? -1 : 1;
      document.getElementById('lab-results').innerHTML=labResults();
      const same = document.querySelector(`[data-action="${action}"]`);
      (same?.disabled ? document.querySelector(`[data-action="${action==='lab-prev'?'lab-next':'lab-prev'}"]`) : same)?.focus({preventScroll:true});
    }
    if (action === 'lab-reset') {
      lab.page=1;lab.size=2;lab.query='';
      document.getElementById('lab-search').value='';document.getElementById('lab-size').value='2';
      document.getElementById('lab-results').innerHTML=labResults();toast('实验已重置');
    }
    if (action === 'reset-catalog') {
      catalog.search='';catalog.stage='all';catalog.available=false;
      render();document.getElementById('catalog-search')?.focus();
    }
  });
  document.addEventListener('input', event => {
    if (window.LabActivities.input(event.target) || window.ModelLabs?.input(event.target)) return;
    if (event.target.id === 'catalog-search') { catalog.search=event.target.value;updateCatalog(); }
    if (event.target.id === 'lab-search') { lab.query=event.target.value;lab.page=1;document.getElementById('lab-results').innerHTML=labResults(); }
  });
  document.addEventListener('change', event => {
    if (window.LabActivities.change(event.target) || window.ModelLabs?.change(event.target)) return;
    if (event.target.matches('[data-day-context]')) {
      const number = Number(event.target.value);
      if (courses.some(day=>day.number===number)) location.hash = event.target.dataset.dayContext === 'lab' ? `#/lab/${number}` : overviewUrl(number);
      return;
    }
    if (event.target.id === 'catalog-stage') {catalog.stage=event.target.value;updateCatalog();}
    if (event.target.id === 'available-only') {catalog.available=event.target.checked;updateCatalog();}
    if (event.target.id === 'lab-size') {lab.size=Number(event.target.value);lab.page=1;document.getElementById('lab-results').innerHTML=labResults();}
  });
  document.addEventListener('focusout',event=>{
    if(event.target.matches?.('[data-model-control][type="number"]'))window.ModelLabs?.change(event.target);
  });
  window.addEventListener('hashchange',()=>{ render();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true}); });
  function resumeWhenDateChanges() {
    if (learning.dateKey() !== lastCheckedDate) render();
  }
  window.addEventListener('focus',resumeWhenDateChanges);
  window.addEventListener('pageshow',resumeWhenDateChanges);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState === 'visible') resumeWhenDateChanges();});
  window.addEventListener('storage',event=>{
    if(event.key !== storageKey) return;
    try { progress=learning.reconcile(JSON.parse(event.newValue || '{}'),courses,learning.dateKey());render(); } catch {}
  });
  setInterval(()=>{if(document.visibilityState === 'visible')resumeWhenDateChanges();},60000);
  render();
})();
