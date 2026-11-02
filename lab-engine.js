/* Shared UI only: each learning day supplies its own pure, topic-specific model. */
(() => {
  'use strict';
  const state = new Map();
  let activeDay = 0;
  let helpers;
  const specFor = day => window.LAB_SPECS?.[day];
  const defaults = spec => Object.fromEntries(spec.controls.map(control => [control.id, control.value]));
  const escape = value => helpers.escape(value);
  const icon = name => helpers.icon(name);
  const root = () => document.getElementById('model-lab');
  const decimalPlaces = value => {
    const [mantissa, exponent='0'] = String(value).toLowerCase().split('e');
    return Math.max(0,(mantissa.split('.')[1]||'').length-Number(exponent));
  };

  function controlHtml(control, value) {
    const id = `model-control-${control.id}`;
    const label = `<label for="${escape(id)}">${escape(control.label)}${control.type === 'range' ? ` <output id="${escape(id)}-value">${escape(value)}</output>` : ''}</label>`;
    const attrs = `${control.min !== undefined ? ` min="${escape(control.min)}"` : ''}${control.max !== undefined ? ` max="${escape(control.max)}"` : ''}${control.step !== undefined ? ` step="${escape(control.step)}"` : ''}`;
    let field;
    if (control.type === 'select') field = `<select id="${escape(id)}" class="select-field" data-model-control="${escape(control.id)}">${control.options.map(option => `<option value="${escape(option.value)}" ${String(value) === String(option.value) ? 'selected' : ''}>${escape(option.label)}</option>`).join('')}</select>`;
    else if (control.type === 'checkbox') field = `<input id="${escape(id)}" type="checkbox" data-model-control="${escape(control.id)}" ${value ? 'checked' : ''}>`;
    else field = `<input id="${escape(id)}" type="${escape(control.type)}" data-model-control="${escape(control.id)}" value="${escape(value)}"${attrs}${control.type === 'text' ? ` maxlength="${Number(control.maxLength) || 120}"` : ''}${control.type === 'number' ? ' inputmode="decimal"' : ''}>`;
    return `<div class="model-control ${control.type === 'checkbox' ? 'model-checkbox' : ''}">${label}${field}${control.help ? `<small>${escape(control.help)}</small>` : ''}</div>`;
  }

  function evaluate(day) {
    const spec = specFor(day);
    try {
      const result = spec.evaluate({...state.get(day)});
      if (!result || !result.headline || !Array.isArray(result.panels)) throw new Error('Invalid model result');
      return result;
    } catch {
      return {headline:'当前输入无法完成演示',explanation:'请检查参数或重置实验，再试一次。',metrics:[],panels:[],trace:[],rows:[],note:'这是本地教学模型，不会发出真实请求或修改外部资料。'};
    }
  }

  function resultHtml(result) {
    const metrics = result.metrics || [];
    const trace = result.trace || [];
    const rows = result.rows || [];
    const bars = result.bars || [];
    return `<div class="model-outcome"><span class="small-caps">YOUR INPUT → A DIFFERENT OUTCOME</span><h2>${escape(result.headline)}</h2><p>${escape(result.explanation || '')}</p></div>${metrics.length ? `<div class="model-metrics">${metrics.map(metric => `<div><span>${escape(metric.label)}</span><strong>${escape(metric.value)}</strong></div>`).join('')}</div>` : ''}<div class="model-visuals">${trace.length ? `<section class="model-trace"><h2>过程拆开看</h2><ol>${trace.map((step,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span><p>${escape(step)}</p></li>`).join('')}</ol></section>` : ''}${rows.length ? `<section class="model-rows"><h2>状态与结果</h2><table class="data-table"><thead><tr><th scope="col">观察对象</th><th scope="col">计算结果</th></tr></thead><tbody>${rows.map(row => `<tr class="model-row-${['ok','warn','neutral'].includes(row.state) ? row.state : 'neutral'}"><th scope="row">${escape(row.label)}</th><td>${escape(row.value)}</td></tr>`).join('')}</tbody></table></section>` : ''}${bars.length ? `<section class="model-bars"><h2>变化对比</h2>${bars.map(bar=>{const value=Math.max(0,Math.min(100,Number(bar.value)||0));return `<div class="model-bar"><div><span>${escape(bar.label)}</span><strong>${escape(bar.display ?? `${value}%`)}</strong></div><div class="model-bar-track" role="meter" aria-label="${escape(bar.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" aria-valuetext="${escape(bar.display ?? `${value}%`)}"><i style="width:${value}%" class="${bar.tone==='warn'?'warn':''}"></i></div></div>`;}).join('')}</section>` : ''}</div><div class="model-panels">${result.panels.map(panel=>`<section class="lab-pane"><div class="pane-header"><h2>${escape(panel.title)}</h2><span>${escape(panel.label)}</span></div><div class="lab-code"><pre><code>${helpers.highlight(String(panel.code || ''))}</code></pre></div></section>`).join('')}</div><p class="lab-tip">${escape(result.note || '简化的浏览器教学模型；没有连接真实服务。')}</p>`;
  }

  function render(day, suppliedHelpers) {
    const spec = specFor(day);
    if (!spec) return '<div class="empty-state"><h2>这一天的实验暂时不可用</h2><p>可以先阅读对应课程。</p></div>';
    activeDay = day;
    helpers = suppliedHelpers;
    if (!state.has(day)) state.set(day,defaults(spec));
    const result = evaluate(day);
    return `<div id="model-lab" data-day="${day}"><div class="model-controls">${spec.controls.map(control=>controlHtml(control,state.get(day)[control.id])).join('')}<button class="button" data-action="model-reset">${icon('refresh')}重置实验</button></div><p class="scope-note model-scope">改变参数，观察下面的过程、结果和代码怎样变化。所有数值由当前教学模型计算。</p><div id="model-status" class="sr-only" role="status" aria-live="polite">${escape(result.headline)}</div><div id="model-results">${resultHtml(result)}</div></div>`;
  }

  function repaint() {
    const result = evaluate(activeDay);
    const target = document.getElementById('model-results');
    if (target) target.innerHTML = resultHtml(result);
    const status = document.getElementById('model-status');
    if (status) status.textContent = result.headline;
  }

  function update(target, commit = false) {
    if (!target?.dataset?.modelControl || root()?.dataset.day !== String(activeDay)) return false;
    const control = specFor(activeDay).controls.find(item=>item.id===target.dataset.modelControl);
    if (!control) return false;
    let value;
    if (control.type==='checkbox') value=target.checked;
    else if (control.type==='number'||control.type==='range') {
      value = target.value === '' ? state.get(activeDay)[control.id] : Number(target.value);
      if (!Number.isFinite(value)) return true;
      if (control.min!==undefined) value=Math.max(Number(control.min),value);
      if (control.max!==undefined) value=Math.min(Number(control.max),value);
      const step=control.step==='any'?null:Number(control.step??1);
      if(step!==null&&Number.isFinite(step)&&step>0){
        const base=Number(control.min??0);
        let steps=Math.round((value-base)/step);
        if(control.min!==undefined)steps=Math.max(0,steps);
        if(control.max!==undefined)steps=Math.min(Math.floor((Number(control.max)-base)/step+1e-9),steps);
        const aligned=Number((base+steps*step).toFixed(Math.min(12,Math.max(decimalPlaces(step),decimalPlaces(base)))));
        // Keep intermediate typing intact; commit a valid discrete parameter on blur/change.
        if(!commit&&Math.abs(aligned-value)>Math.max(1e-10,step*1e-8))return true;
        value=aligned;
        if(control.min!==undefined)value=Math.max(Number(control.min),value);
        if(control.max!==undefined)value=Math.min(Number(control.max),value);
      }
      if (commit) target.value=String(value);
    } else if (control.type==='select') {
      if (!control.options.some(option=>String(option.value)===target.value)) return true;
      value=target.value;
    } else value=target.value.slice(0,Number(control.maxLength)||120);
    state.get(activeDay)[control.id]=value;
    const output=document.getElementById(`model-control-${control.id}-value`);
    if(output)output.textContent=String(value);
    repaint();
    return true;
  }

  function click(action) {
    if(action!=='model-reset'||!root())return false;
    const target=root();
    const day=activeDay;
    state.set(day,defaults(specFor(day)));
    target.outerHTML=render(day,helpers);
    document.querySelector('[data-action="model-reset"]')?.focus({preventScroll:true});
    helpers.toast('实验已重置');
    return true;
  }
  window.ModelLabs=Object.freeze({render,input:target=>update(target,false),change:target=>update(target,true),click});
})();
