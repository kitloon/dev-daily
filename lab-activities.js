(() => {
  'use strict';

  let helpers;
  let activeDay = 0;
  const firstProducts = () => [
    { id: 1, name: 'Coffee', price: 12 },
    { id: 2, name: 'Tea', price: 8 }
  ];
  const catalog = [
    { id: 1, name: 'Coffee', price: 12 },
    { id: 2, name: 'Tea', price: 8 },
    { id: 3, name: 'Iced Coffee', price: 15 },
    { id: 4, name: 'Cake', price: 10 }
  ];
  const list = { products: firstProducts(), nextId: 3, name: '', price: '16' };
  const search = { query: '' };

  const escape = value => helpers.escape(value);
  const icon = name => helpers.icon(name);
  const highlighted = value => helpers.highlight(value);
  const money = value => value.toFixed(2);
  const root = () => document.getElementById('activity-root');
  const active = day => activeDay === day && root()?.dataset.day === String(day);

  function announce(message) {
    const status = document.getElementById('activity-status');
    if (status) status.textContent = message;
  }

  function setError(message, inputId) {
    const messageNode = document.getElementById('activity-error');
    if (messageNode) {
      messageNode.textContent = message;
      messageNode.hidden = !message;
    }
    for (const id of ['activity-product-name', 'activity-product-price']) {
      const field = document.getElementById(id);
      if (field) {
        if (message && id === inputId) field.setAttribute('aria-invalid', 'true');
        else field.removeAttribute('aria-invalid');
      }
    }
    if (message && inputId) document.getElementById(inputId)?.focus();
  }

  function productTile(product, allowDelete) {
    return `<div class="product-tile" role="listitem"><div class="product-tile-top">${icon('coffee')}<small>${allowDelete ? `key = ${product.id}` : `#${product.id}`}</small></div><h3>${escape(product.name)}</h3><p>RM ${money(product.price)}</p>${allowDelete ? `<button type="button" class="button subtle" style="min-height:44px;margin-top:12px;width:100%" data-action="activity-delete" data-id="${product.id}" aria-label="删除商品 ${escape(product.name)}">删除</button>` : ''}</div>`;
  }

  function listResults() {
    const mapCode = `products.map(product => (\n  <li key={product.id}>\n    {product.name} — RM{product.price}\n  </li>\n))`;
    return `<div class="lab-layout"><section class="lab-pane"><div class="pane-header"><h2>${icon('layout')} 页面显示的商品</h2><span>${list.products.length} / 8 ITEMS</span></div><div class="product-grid" role="list" aria-label="根据数组渲染的商品">${list.products.length ? list.products.map(product => productTile(product, true)).join('') : '<p class="scope-note">数组现在是空的。添加一件商品，列表就会重新出现。</p>'}</div><div class="lab-equation">一件商品 → 一个列表项<br>列表数量跟随数组变化，key 使用商品自身的稳定 ID。</div></section><section class="lab-pane"><div class="pane-header"><h2>${icon('server')} 数组怎样变成列表？</h2><span>ARRAY → MAP → LIST</span></div><div class="lab-code"><h3>DATA ARRAY / 当前资料</h3><pre><code>${highlighted(JSON.stringify(list.products, null, 2))}</code></pre></div><div class="lab-code"><h3>RENDERING / 相同的 map 表达式</h3><pre><code>${highlighted(mapCode)}</code></pre></div></section></div><section class="database-panel"><div class="pane-header"><h2>${icon('layout')} 数组位置会变，商品身份不变。</h2><span>INDEX ≠ ID</span></div><p class="database-caption">试着删除第一件商品：后面的商品位置会前移，ID 和 key 仍保留原值。新商品使用递增 ID；删除不会让 ID 重新编号。</p><div class="data-table-wrap"><table class="data-table"><thead><tr><th scope="col">数组位置</th><th scope="col">商品 ID</th><th scope="col">NAME</th><th scope="col">React key</th></tr></thead><tbody>${list.products.length ? list.products.map((product, index) => `<tr><td>${index}</td><td>${product.id}</td><td>${escape(product.name)}</td><td>${product.id}</td></tr>`).join('') : '<tr><td colspan="4">空数组没有需要渲染的列表项。</td></tr>'}</tbody></table></div></section><p class="lab-tip">本实验在浏览器中模拟数组与界面同步，没有运行 React 或访问后端。React 代码展示对应写法；刷新页面会重新开始实验，课程学习进度不受影响。</p>`;
  }

  function searchState() {
    const query = search.query.trim();
    const keyword = query.toLowerCase();
    return { query, items: catalog.filter(product => product.name.toLowerCase().includes(keyword)) };
  }

  function searchResults() {
    const state = searchState();
    const pattern = `%${state.query.replace(/[\\%_]/g, '\\$&')}%`;
    const sql = `SELECT id, name, price\nFROM products\nWHERE name ILIKE $1\nORDER BY id;\n\n-- 绑定参数：${JSON.stringify([pattern])}`;
    const stateCode = `query = ${JSON.stringify(search.query)}\n有效关键词 = ${JSON.stringify(state.query)}\n匹配数量 = ${state.items.length}`;
    const ids = new Set(state.items.map(product => product.id));
    return `<div class="lab-layout"><section class="lab-pane"><div class="pane-header"><h2>${icon('layout')} 匹配的商品</h2><span>${state.items.length} / ${catalog.length} MATCHES</span></div><div class="product-grid" role="list" aria-label="搜索结果">${state.items.length ? state.items.map(product => productTile(product, false)).join('') : '<p class="scope-note">没有找到商品。试试 Coffee、Tea，或清空关键词。</p>'}</div><div class="lab-equation">输入文字 → 更新 query → 重新筛选<br>先去掉首尾空格，再进行不区分大小写的英文名称匹配。</div></section><section class="lab-pane"><div class="pane-header"><h2>${icon('server')} 搜索条件怎样传下去？</h2><span>STATE → API → SQL</span></div><div class="lab-code"><h3>INPUT STATE / 当前输入</h3><pre><code>${escape(stateCode)}</code></pre></div><div class="lab-code"><h3>HTTP REQUEST / 请求示意</h3><pre><code>GET /products?q=${escape(encodeURIComponent(state.query))}</code></pre></div><div class="lab-code"><h3>DATABASE QUERY / 参数化查询示意</h3><pre><code>${highlighted(sql)}</code></pre></div></section></div><section class="database-panel"><div class="pane-header"><h2>${icon('database')} 全部资料与匹配结果</h2><span>FILTER FIRST</span></div><p class="database-caption">输入 Coffee 或 coffee，观察同样的两个匹配结果。搜索 % 或 _ 时把它们当作普通字符，SQL 参数中也会转义通配符。</p><div class="data-table-wrap"><table class="data-table"><thead><tr><th scope="col">ID</th><th scope="col">NAME</th><th scope="col">PRICE</th><th scope="col">匹配结果</th></tr></thead><tbody>${catalog.map(product => `<tr class="${ids.has(product.id) ? 'row-current' : ''}"><td>${product.id}</td><td>${escape(product.name)}</td><td>RM ${money(product.price)}</td><td>${ids.has(product.id) ? '匹配 · 返回' : '不匹配'}</td></tr>`).join('')}</tbody></table></div></section><p class="lab-tip">这里只模拟英语样本的搜索，未发出真实 GET 请求，也未执行 SQL。参数绑定把输入作为资料传递；对 %、_ 与反斜杠的转义，则保证本实验的名称包含搜索与 SQL 模式示意一致。</p>`;
  }

  function repaint(message) {
    const results = document.getElementById('activity-results');
    if (!results) return;
    results.innerHTML = activeDay === 1 ? listResults() : searchResults();
    const addButton = document.querySelector('[data-action="activity-add"]');
    if (addButton) addButton.disabled = list.products.length >= 8;
    if (message) announce(message);
  }

  function render(day, suppliedHelpers) {
    if (day !== 1 && day !== 2) {
      activeDay = 0;
      return '';
    }
    helpers = suppliedHelpers;
    activeDay = day;
    if (day === 1) {
      return `<div id="activity-root" data-day="1"><div class="lab-controls"><div class="control-group"><label for="activity-product-name">商品名称 / name</label><div class="search-field"><input id="activity-product-name" type="text" maxlength="50" value="${escape(list.name)}" placeholder="例如 Latte" aria-describedby="activity-error"></div></div><div class="control-group"><label for="activity-product-price">价格 / RM</label><div class="search-field"><input id="activity-product-price" type="number" min="0" max="999999.99" step="0.01" inputmode="decimal" value="${escape(list.price)}" aria-describedby="activity-error"></div></div><button type="button" class="button primary" style="min-height:44px" data-action="activity-add" ${list.products.length >= 8 ? 'disabled' : ''}>添加商品</button><button type="button" class="button" style="min-height:44px" data-action="activity-reset-list">${icon('refresh')} 重置实验</button></div><p class="scope-note" style="margin:0 0 16px">最多添加到 8 件商品。删除某件商品后，它的 ID 不会分配给下一件新商品。</p><p id="activity-error" class="storage-note" role="alert" hidden></p><div id="activity-status" class="sr-only" role="status" aria-live="polite">当前显示 ${list.products.length} 件商品。</div><div id="activity-results">${listResults()}</div></div>`;
    }
    return `<div id="activity-root" data-day="2"><div class="lab-controls"><div class="control-group"><label for="activity-query">搜索商品名称 / query</label><div class="search-field">${icon('search')}<input id="activity-query" type="search" maxlength="50" value="${escape(search.query)}" placeholder="试试 Coffee、Tea…" aria-describedby="activity-query-help"></div></div><button type="button" class="button" style="min-height:44px" data-action="activity-reset-search">${icon('refresh')} 重置实验</button></div><p id="activity-query-help" class="scope-note" style="margin:0 0 16px">最多输入 50 个字符。清空关键词恢复全部商品；本实验只展示搜索，不进行分页。</p><div id="activity-status" class="sr-only" role="status" aria-live="polite">找到 ${searchState().items.length} 件商品。</div><div id="activity-results">${searchResults()}</div></div>`;
  }

  function click(action, button) {
    if (action === 'activity-add' && active(1)) {
      if (list.products.length >= 8) {
        announce('最多展示 8 件商品。请先删除一件，再继续添加。');
        return true;
      }
      const nameInput = document.getElementById('activity-product-name');
      const priceInput = document.getElementById('activity-product-price');
      const name = nameInput.value.trim();
      const rawPrice = priceInput.value.trim();
      const price = Number(rawPrice);
      if (!name || name.length > 50) {
        setError('请填写 1–50 个字符的商品名称。', 'activity-product-name');
        return true;
      }
      if (!rawPrice || !Number.isFinite(price) || price < 0 || price > 999999.99 || Math.abs(price - Math.round(price * 100) / 100) > 1e-9) {
        setError('请输入 0–999999.99 的价格，最多两位小数。', 'activity-product-price');
        return true;
      }
      list.products = [...list.products, { id: list.nextId++, name, price }];
      list.name = '';
      list.price = rawPrice;
      nameInput.value = '';
      setError('');
      repaint(`已添加 ${name}。当前显示 ${list.products.length} 件商品。`);
      nameInput.focus();
      helpers.toast(`已添加 ${name}`);
      return true;
    }
    if (action === 'activity-delete' && active(1)) {
      const id = Number(button?.dataset.id);
      const product = list.products.find(item => item.id === id);
      if (!product) return true;
      const index = list.products.indexOf(product);
      list.products = list.products.filter(item => item.id !== id);
      setError('');
      repaint(`已删除 ${product.name}。其他商品保留原有 ID。`);
      const buttons = document.querySelectorAll('[data-action="activity-delete"]');
      const nextButton = buttons[Math.min(index, buttons.length - 1)];
      if (nextButton) nextButton.focus({ preventScroll: true });
      else document.getElementById('activity-product-name')?.focus({ preventScroll: true });
      return true;
    }
    if (action === 'activity-reset-list' && active(1)) {
      list.products = firstProducts();
      list.nextId = 3;
      list.name = '';
      list.price = '16';
      document.getElementById('activity-product-name').value = '';
      document.getElementById('activity-product-price').value = '16';
      setError('');
      repaint('商品实验已重置，显示 Coffee 和 Tea。');
      helpers.toast('实验已重置');
      return true;
    }
    if (action === 'activity-reset-search' && active(2)) {
      search.query = '';
      document.getElementById('activity-query').value = '';
      repaint('搜索已清空，显示全部 4 件商品。');
      helpers.toast('实验已重置');
      return true;
    }
    return false;
  }

  function input(target) {
    if (active(1) && target.id === 'activity-product-name') {
      list.name = target.value.slice(0, 50);
      if (target.value !== list.name) target.value = list.name;
      setError('');
      return true;
    }
    if (active(1) && target.id === 'activity-product-price') {
      list.price = target.value;
      setError('');
      return true;
    }
    if (active(2) && target.id === 'activity-query') {
      search.query = target.value.slice(0, 50);
      if (target.value !== search.query) target.value = search.query;
      repaint(`找到 ${searchState().items.length} 件商品。`);
      return true;
    }
    return false;
  }

  window.LabActivities = { render, click, input, change: input };
})();
