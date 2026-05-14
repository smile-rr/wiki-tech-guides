/* site.js — sidebar rendering, current-page highlight, search filter,
   mobile drawer, theme toggle.
   Single source of truth for the nav so every page stays in sync. */
(() => {
  // ── Single source of truth: navigation tree ─────────────────────────
  const NAV = [
    { label: 'Theory',      pip: 'theory',      items: [
      { href: 'foundations.html',          title: 'Foundations',                sub: 'AI / ML 基础体系' },
    ]},
    { label: 'Systems',     pip: 'systems',     items: [
      { href: 'hpc_complete.html',         title: 'High-Performance Systems',   sub: 'OS · 网络 · Linux 内核' },
    ]},
    { label: 'Engineering', pip: 'engineering', items: [
      { href: 'fullstack_complete.html',   title: 'Full-Stack',                 sub: 'Java · Spring · K8s · 大数据' },
      { href: 'polyglot.html',             title: 'Polyglot',                   sub: 'Go · React · TS · Python · Rust' },
    ]},
    { label: 'AI & LLM',    pip: 'ai',          items: [
      { href: 'ai_llm_complete.html',      title: 'AI · LLM · Multimodal',      sub: 'GPU · 训练 · 推理 · Agent · RAG' },
      { href: 'ai-knowledge-ref.html',     title: 'AI Reference Architecture',  sub: '企业 AI · MCP · Gateway' },
      { href: 'llm_interview_kb.html',     title: 'LLM Engineering',            sub: 'LangChain · LangGraph · 微调' },
      { href: 'rag_pipeline_langchain.html', title: 'RAG Pipeline',             sub: 'LangChain 完整参考' },
      { href: 'spring-ai-knowledge-map.html', title: 'Spring AI',               sub: '知识地图 2026' },
      { href: 'ai_learning_roadmap.html',  title: 'Learning Roadmap',           sub: '推荐学习路径' },
      { href: 'agentic-reading-list.html', title: 'Agentic Reading List',       sub: '论文与博客' },
      { href: 'ai_video_guide.html',       title: 'Video Guide',                sub: '2025 / 2026' },
    ]},
    { label: 'Topics',      pip: 'topics',      items: [
      { href: 'claude_qa_lifecycle.html',  title: 'Claude Q/A Lifecycle',       sub: '请求全链路' },
      { href: 'memory_compact_harness.html', title: 'Memory · Compact · Harness', sub: '会话与上下文' },
      { href: 'session_erd.html',          title: 'Session ERD',                sub: '会话数据模型' },
    ]},
    { label: 'Design',      pip: 'design',      items: [
      { href: 'uiux.html',                 title: 'UI / UX',                    sub: 'Figma · Vibe Design · 移动端' },
    ]},
    { label: 'Investing',   pip: 'invest',      items: [
      { href: 'invest.html',               title: 'Investing',                  sub: 'A股 · 港股 · 美股 · 量化' },
    ]},
    { label: 'Leadership',  pip: 'leadership',  items: [
      { href: 'career_kb.html',            title: 'Engineering Leadership',     sub: '角色 · 战略 · 组织' },
    ]},
  ];

  // ── Renderers ───────────────────────────────────────────────────────
  const currentFile = () => {
    const p = location.pathname.split('/').pop() || 'index.html';
    return p === '' ? 'index.html' : p;
  };

  const renderSidebar = () => {
    const host = document.getElementById('sidebar');
    if (!host) return;

    const here = currentFile();
    const sections = NAV.map(group => {
      const links = group.items.map(it => {
        const isCurrent = it.href === here;
        return `<a class="sidebar__link" href="${it.href}"${isCurrent ? ' aria-current="page"' : ''} data-title="${it.title.toLowerCase()} ${it.sub.toLowerCase()}">
          <span>${it.title}</span>
          ${it.sub ? `<span class="sub">${it.sub}</span>` : ''}
        </a>`;
      }).join('');
      return `<div class="sidebar__section">
        <div class="sidebar__heading" style="color: var(--pip-${group.pip})">
          <span class="pip"></span>${group.label}
        </div>
        ${links}
      </div>`;
    }).join('');

    host.innerHTML = `
      <a class="sidebar__brand" href="index.html" aria-label="wiki tech home">
        <span>wiki</span><span class="dot">·</span><span class="mark">tech</span>
        <span class="tag">Reference</span>
      </a>
      <div class="sidebar__search">
        <input type="search" id="navfilter" placeholder="Filter…" aria-label="Filter navigation" autocomplete="off">
      </div>
      <nav class="sidebar__nav" aria-label="primary">
        ${sections}
      </nav>
      <div class="sidebar__foot">
        <span class="sidebar__colophon">wiki.moments-plus.com</span>
        <button class="theme-toggle" data-theme-toggle type="button" aria-label="Toggle theme"></button>
      </div>
    `;

    // Scroll current item into view if off-screen
    const current = host.querySelector('[aria-current="page"]');
    if (current) {
      const navBox = host.querySelector('.sidebar__nav');
      const cTop = current.offsetTop;
      if (cTop > navBox.clientHeight - 40) navBox.scrollTop = cTop - 80;
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────
  const wireFilter = () => {
    const input = document.getElementById('navfilter');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll('.sidebar__link').forEach(a => {
        const hay = a.getAttribute('data-title') || '';
        a.hidden = q && !hay.includes(q);
      });
      // Hide section heads whose all links are hidden
      document.querySelectorAll('.sidebar__section').forEach(sec => {
        const anyVisible = [...sec.querySelectorAll('.sidebar__link')].some(a => !a.hidden);
        sec.style.display = anyVisible ? '' : 'none';
      });
    });
    // Cmd/Ctrl + K to focus filter
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.focus(); input.select();
      }
    });
  };

  // ── Mobile drawer ───────────────────────────────────────────────────
  const wireDrawer = () => {
    if (!document.getElementById('sidebar')) return;
    let btn = document.querySelector('.sidebar-toggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'sidebar-toggle';
      btn.setAttribute('aria-label', 'Open navigation');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      document.body.appendChild(btn);
    }
    let scrim = document.querySelector('.sidebar-scrim');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'sidebar-scrim';
      document.body.appendChild(scrim);
    }
    btn.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    scrim.addEventListener('click', () => document.body.classList.remove('nav-open'));
    document.querySelectorAll('.sidebar__link').forEach(a => {
      a.addEventListener('click', () => document.body.classList.remove('nav-open'));
    });
  };

  // ── Theme toggle ────────────────────────────────────────────────────
  const KEY = 'wiki-tech:theme';
  const ICONS = {
    light: '<svg class="theme-toggle__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.3 3.3l1.05 1.05M11.65 11.65l1.05 1.05M3.3 12.7l1.05-1.05M11.65 4.35l1.05-1.05"/></svg>',
    dark:  '<svg class="theme-toggle__icon" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 1.5a6.5 6.5 0 1 0 8 8 5.5 5.5 0 0 1-8-8z"/></svg>'
  };
  const currentTheme = () => {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const applyTheme = (t) => {
    if (t === 'auto') { document.documentElement.removeAttribute('data-theme'); localStorage.removeItem(KEY); }
    else { document.documentElement.setAttribute('data-theme', t); localStorage.setItem(KEY, t); }
    updateToggle();
  };
  const updateToggle = () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      const t = currentTheme();
      b.innerHTML = `${t === 'dark' ? ICONS.dark : ICONS.light}<span>${t === 'dark' ? 'Dark' : 'Light'}</span>`;
      b.setAttribute('aria-label', `Theme: ${t}. Click to toggle.`);
    });
  };
  const wireTheme = () => {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') document.documentElement.setAttribute('data-theme', stored);
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-theme-toggle]');
      if (!b) return;
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!localStorage.getItem(KEY)) updateToggle();
    });
  };

  // ── Bootstrap ───────────────────────────────────────────────────────
  const boot = () => {
    wireTheme();
    renderSidebar();
    wireFilter();
    wireDrawer();
    updateToggle();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
