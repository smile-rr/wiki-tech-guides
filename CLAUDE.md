# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this directory is

This is **not a code project** — it is a personal technical knowledge base / interview-prep collection. There is no build system, no package manifest, no tests, no dependencies. The repo is a flat directory of standalone HTML documents, SVG diagrams, a couple of Markdown/PDF reference files, and one plain-text knowledge map. Everything is in Chinese (zh-CN) except a few mixed bilingual files.

Most content is authored as long-form, self-contained HTML pages with inline CSS — each file is meant to be opened directly in a browser. No server, bundler, or framework is involved.

## Entry point and structure

- `index.html` — the hub / navigation page. It links to every other top-level HTML file and is the canonical map of the knowledge base. When adding or renaming a content page, update `index.html` so it remains the authoritative index.
- `knowledge_maps.txt` — ASCII overview of the knowledge taxonomy ("个人知识体系 · 2025-2026"). Useful for understanding how the topic areas relate; treat it as a higher-level table of contents than `index.html`.
- Top-level `*.html` — one document per topic (e.g. `foundations.html`, `hpc_complete.html`, `fullstack_complete.html`, `polyglot.html`, `ai_llm_complete.html`, `ai-knowledge-ref.html`, `llm_interview_kb.html`, `uiux.html`, `invest.html`, `career_kb.html`, `rag_pipeline_langchain.html`, `claude_qa_lifecycle.html`, `spring-ai-knowledge-map.html`, etc.). Each is independent — they only relate through cross-links and the index.
- `*.svg` — standalone architecture diagrams referenced by, or paired with, specific HTML notes (e.g. `claude_multiagent_architecture.svg`, `llm_chat_architecture.svg`, `cache_waterfall.svg`).
- `files/` — supplementary assets / older copies (small set, e.g. `hpc_complete.html`).
- `AI_LLM Learning Roadmap_ ..._files/` — Claude.ai page export assets; treat as read-only artifacts of a saved web page.

## Conventions to preserve when editing

- **Self-contained pages.** Each HTML file ships its own inline `<style>` block and uses no external JS/CSS/build step. Keep new pages the same way — do not introduce a bundler, framework, or shared stylesheet.
- **Design language.** Pages share a recognizable aesthetic: neutral warm-paper background (`--bg:#f7f6f4`), small base font (~13px), CSS custom properties (`--bg`, `--s`, `--bd`, `--tx`, ...), system font stack, and compact card/badge layouts. Match this when extending or creating sibling pages so the collection stays visually coherent.
- **Language.** Primary content language is Simplified Chinese. Preserve existing tone and terminology unless the user asks otherwise.
- **Flat layout.** Everything links by relative filename from the repo root (`href="foundations.html"`). Do not move files into subdirectories without updating `index.html` and every cross-link.
- **No tracking / no external runtime deps.** Pages should remain openable fully offline.

## Working in this repo

- "Run" = open the relevant `.html` file in a browser (`open index.html` on macOS). There are no commands to build, lint, or test.
- When asked to "update the knowledge base" or similar, start from `index.html` to discover which page owns the topic, then edit that page in place. Do not create a new top-level page when an existing one already covers the area.
- When adding a new top-level page, also: (1) add its row/link in `index.html`, (2) add it to the quick-nav strip at the top of `index.html` if it belongs to a major topic, and (3) consider whether `knowledge_maps.txt` should mention it.
