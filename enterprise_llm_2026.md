# 🧠 2026 企业级 LLM 工程全景手册
> **Enterprise LLM Engineering Playbook 2026**  
> 覆盖：系统架构 · 生产化 · MLOps/LLMOps · 金融应用 · 面试准备  
> 更新日期：2026年4月 | 语言：中文（技术术语保留英文）

---

## 目录

1. [认知框架：2026年的范式转变](#1-认知框架2026年的范式转变)
2. [企业LLM系统六层架构](#2-企业llm系统六层架构)
3. [RAG 系统深度设计](#3-rag-系统深度设计)
4. [Agent 框架选型指南](#4-agent-框架选型指南)
5. [LLMOps & MLOps：CI/CD/CT 三位一体](#5-llmops--mlops-cicdct-三位一体)
6. [Prompt 工程与评估体系](#6-prompt-工程与评估体系)
7. [推理服务与成本优化](#7-推理服务与成本优化)
8. [可观测性与治理](#8-可观测性与治理)
9. [金融领域 LLM 系统专项](#9-金融领域-llm-系统专项)
10. [金融 AI 面试准备手册](#10-金融-ai-面试准备手册)
11. [工具栈速查表](#11-工具栈速查表)
12. [参考资料](#12-参考资料)

---

## 1. 认知框架：2026年的范式转变

### 核心命题

> **"构建ML模型不再是难点——可靠的生产运营才是。"**  
> — MLOps 2026 行业共识

### 三大转变

| 旧范式（2022-2023） | 新范式（2025-2026） |
|---|---|
| 单一模型部署 | 多组件编排系统（模型+检索+Agent+护栏） |
| 确定性输入输出 | 概率性、上下文依赖的生成输出 |
| 一次训练，静态部署 | CI/CD/CT 持续训练，动态演进 |
| 数据科学家主导 | ML工程师 + DevOps + 产品 跨职能团队 |
| 模型准确率为核心指标 | 幻觉率、Token成本、业务KPI 综合评估 |

### 行业数字

- Gartner：**85%** 的ML项目无法到达生产；进入生产的项目不到 **40%** 能维持12个月业务价值
- 2026年 MLOps 工程师需求同比增长 **>35%**
- 全球 MLOps 市场预计 2027 年突破 **130亿美元**
- 金融领域生成AI市场：2025年 $77.9亿 → 2034年 $1306.5亿（CAGR 36.8%）
- 银行业生成AI支出预计 2030 年达到 **857亿美元**（Juniper Research）

---

## 2. 企业LLM系统六层架构

```
┌─────────────────────────────────────────────────────────┐
│  Layer 6：监控 & 治理层  (Observability & Governance)     │
│  LangSmith / Langfuse / Evidently / Audit Logs / MCP    │
├─────────────────────────────────────────────────────────┤
│  Layer 5：推理 & 服务层  (Inference & Serving)            │
│  vLLM / TGI / Triton / Ray Serve / AI Gateway           │
├─────────────────────────────────────────────────────────┤
│  Layer 4：Prompt & 评估层  (Prompt Eng & Evaluation)     │
│  Prompt Registry / LLM-as-Judge / RAGAS / A/B Testing   │
├─────────────────────────────────────────────────────────┤
│  Layer 3：编排 & Agent层  (Orchestration & Agents)       │
│  LangGraph / LlamaIndex / CrewAI / AutoGen / MCP        │
├─────────────────────────────────────────────────────────┤
│  Layer 2：数据 & 检索层  (RAG & Vector Store)             │
│  LlamaIndex / Pinecone / pgvector / Weaviate / Chroma   │
├─────────────────────────────────────────────────────────┤
│  Layer 1：基础模型层  (Foundation Model)                  │
│  GPT-4o / Claude / Gemini + Fine-tuned Domain Models    │
└─────────────────────────────────────────────────────────┘
```

### 各层关键决策

#### Layer 1：基础模型选型矩阵

| 场景 | 推荐模型 | 理由 |
|---|---|---|
| 通用文本理解/生成 | GPT-4o / Claude Sonnet | 能力强，API稳定 |
| 金融文本分析 | BloombergGPT / FinBERT | 领域语料训练 |
| 成本敏感大批量 | Claude Haiku / GPT-4o-mini | Token成本低10x |
| 私有化部署 | Llama 3 / Mistral / Qwen2.5 | 开源可自托管 |
| 代码生成 | Claude + Code interpreter | 强推理+执行能力 |

#### Layer 2：向量数据库选型

| 产品 | 适用场景 | 特点 |
|---|---|---|
| **pgvector** | 已有PostgreSQL | 零新增基础设施，SQL原生 |
| **Pinecone** | 托管云服务 | 高性能，开箱即用 |
| **Weaviate** | 混合搜索（关键词+向量） | 支持BM25+向量混合 |
| **Chroma** | 本地开发/原型 | 轻量，内存/持久化都支持 |
| **Qdrant** | 高性能生产 | Rust实现，低延迟 |

---

## 3. RAG 系统深度设计

### 标准RAG管线

```
原始文档
    ↓
[预处理] OCR / HTML解析 / 格式标准化
    ↓
[分块策略] Chunking（固定长度 / 语义分块 / 层级分块）
    ↓
[向量化] Embedding模型（text-embedding-3-large / BGE）
    ↓
[存储] 向量数据库 + 元数据索引
    ↓
用户查询 → [查询向量化] → [语义检索] → [重排序 Reranking]
    ↓
[上下文组装] Retrieved Chunks + System Prompt + History
    ↓
[LLM生成] → [输出验证/护栏] → 最终响应
```

### 进阶RAG策略（2026年生产级）

#### 1. 混合检索（Hybrid Search）
```python
# 结合稀疏检索（BM25）和密集检索（向量）
results = hybrid_search(
    query=user_query,
    sparse_weight=0.3,   # 关键词匹配权重
    dense_weight=0.7,    # 语义相似度权重
    top_k=20
)
# 再用 Cross-Encoder 重排序
reranked = cross_encoder_rerank(results, query, top_n=5)
```

#### 2. 分层分块（Hierarchical Chunking）
- **小块检索，大块生成**：用小chunk做精确检索，返回父chunk提供完整上下文
- LlamaIndex的 `AutoMergingRetriever` 原生支持此模式

#### 3. 查询改写（Query Rewriting）
```python
# HyDE: 先生成假设答案，再用假设答案检索
hypothetical_answer = llm.generate(
    f"假设性回答这个问题：{user_query}"
)
retrieved = vector_store.search(hypothetical_answer)
```

#### 4. 多查询扩展（Multi-Query）
```python
# 将原始查询扩展为多个子查询，合并检索结果
sub_queries = llm.generate_multiple_queries(user_query, n=3)
all_results = [vector_store.search(q) for q in sub_queries]
merged = deduplicate_and_merge(all_results)
```

### RAG评估指标（RAGAS框架）

| 指标 | 含义 | 目标值 |
|---|---|---|
| **Faithfulness** | 答案是否基于检索内容 | > 0.85 |
| **Answer Relevancy** | 答案是否回答了问题 | > 0.80 |
| **Context Precision** | 检索内容是否相关 | > 0.75 |
| **Context Recall** | 是否检索到所有必要信息 | > 0.70 |

---

## 4. Agent 框架选型指南

### 2026年格局总结

> **一句话定律**：  
> - 检索是核心 → **LlamaIndex**  
> - 复杂有状态工作流 → **LangGraph**  
> - 已深度绑定 → 留在原生态  
> - 快速原型 → **CrewAI**  
> - 重工具集成，轻框架 → **MCP + 裸SDK**

### 主流框架对比

| 框架 | 核心哲学 | 最适场景 | 生产成熟度 |
|---|---|---|---|
| **LangGraph** | 显式状态图 | 复杂分支、Human-in-loop、可审计 | ⭐⭐⭐⭐⭐ |
| **LlamaIndex Workflows** | 数据驱动 | 文档密集、知识库、企业搜索 | ⭐⭐⭐⭐ |
| **CrewAI** | 角色协作 | 多角色协同、快速原型 | ⭐⭐⭐⭐ |
| **AutoGen 0.4** | 对话多Agent | 研究、调试、Azure生态 | ⭐⭐⭐⭐ |
| **OpenAI Agents SDK** | 轻量原生 | OpenAI单一供应商快速开发 | ⭐⭐⭐ |

### 黄金组合（生产推荐）

```
LlamaIndex（检索层）+ LangGraph（编排层）

LlamaIndex → 文档摄取、向量化、语义检索
LangGraph  → 决策逻辑、状态管理、工具调用、人工审核节点
```

### LangGraph 核心模式示例

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated

class FinancialAnalysisState(TypedDict):
    user_query: str
    retrieved_docs: list
    analysis_result: str
    requires_human_review: bool
    final_response: str

# 定义节点
def retrieve_documents(state):
    docs = vector_store.search(state["user_query"])
    return {"retrieved_docs": docs}

def analyze_financials(state):
    result = llm.invoke(build_analysis_prompt(state))
    requires_review = assess_confidence(result) < 0.8
    return {
        "analysis_result": result,
        "requires_human_review": requires_review
    }

def human_review_checkpoint(state):
    # LangGraph原生支持 pause-resume
    return state

def generate_response(state):
    return {"final_response": format_output(state)}

# 构建图
workflow = StateGraph(FinancialAnalysisState)
workflow.add_node("retrieve", retrieve_documents)
workflow.add_node("analyze", analyze_financials)
workflow.add_node("human_review", human_review_checkpoint)
workflow.add_node("respond", generate_response)

# 条件路由
workflow.add_conditional_edges(
    "analyze",
    lambda s: "human_review" if s["requires_human_review"] else "respond"
)

app = workflow.compile(interrupt_before=["human_review"])
```

### MCP（Model Context Protocol）的战略意义

Anthropic于2024年底发布的 **MCP** 已成为工具集成的行业标准：
- **统一接口**：一次集成，兼容所有支持MCP的客户端
- **替代意义**：大幅削弱LangChain/LlamaIndex"工具库"的价值主张
- **趋势**：行业正从"重框架"走向"轻SDK + MCP标准化工具层"

```
传统方式: LangChain Tool → 各自维护适配器
MCP方式:  MCP Server (标准协议) → 任何MCP客户端均可调用
```

---

## 5. LLMOps & MLOps：CI/CD/CT 三位一体

### 核心流程图

```
代码提交
    ↓
[CI] 单元测试 + 集成测试 + Prompt回归测试
    ↓
[CD] 自动部署到 Staging → Canary发布(5%) → 全量上线
    ↓
[监控] 延迟 / Token消耗 / 幻觉率 / 用户满意度
    ↓
[CT触发器] 数据漂移 / 性能下降 / 新标注数据可用
    ↓
[自动重训练] 验证 → 注册 → 替换生产模型
    ↓
（循环）
```

### CI：LLM专属测试策略

```python
# Prompt回归测试示例
import pytest
from langsmith import Client

class TestFinancialAnalysisPrompts:
    
    def test_earnings_summary_faithfulness(self):
        """验证财报摘要不产生幻觉"""
        result = run_pipeline(
            query="总结Q3营收情况",
            context=SAMPLE_EARNINGS_DOC
        )
        faithfulness_score = evaluate_faithfulness(result, SAMPLE_EARNINGS_DOC)
        assert faithfulness_score > 0.85, f"幻觉率过高: {faithfulness_score}"
    
    def test_risk_assessment_completeness(self):
        """验证风险评估覆盖必要维度"""
        result = run_pipeline(query="评估该股票的主要风险")
        required_dimensions = ["市场风险", "流动性风险", "操作风险"]
        for dim in required_dimensions:
            assert dim in result or check_semantic_coverage(result, dim)
    
    def test_pii_not_leaked(self):
        """验证PII数据不被泄露"""
        result = run_pipeline(query=QUERY_WITH_PII_CONTEXT)
        assert not contains_pii(result)
```

### CD：部署策略

| 策略 | 风险 | 适用场景 |
|---|---|---|
| **Blue/Green** | 低（快速切换） | 主要模型版本升级 |
| **Canary Release** | 极低（逐步放量） | 日常迭代，金融生产首选 |
| **Shadow Testing** | 零（不影响生产） | 新模型评估，上线前验证 |
| **A/B Testing** | 低 | Prompt优化，体验对比 |

```yaml
# GitHub Actions CI/CD 示例
name: LLM Pipeline CI/CD

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Prompt Regression Tests
        run: |
          python -m pytest tests/prompt_tests/ -v
          python scripts/evaluate_ragas.py --threshold 0.80
      
      - name: Check Hallucination Rate
        run: python scripts/check_hallucination.py --max-rate 0.05
  
  deploy-canary:
    needs: test
    steps:
      - name: Deploy to Canary (5% traffic)
        run: |
          kubectl set image deployment/llm-service \
            llm-container=$NEW_IMAGE
          kubectl patch svc llm-service -p \
            '{"spec":{"traffic":[{"weight":5,"tag":"canary"}]}}'
      
      - name: Monitor Canary for 30min
        run: python scripts/monitor_canary.py --duration 30m --alert-on-regression
```

### CT：持续训练触发器

```python
# 数据漂移检测 + 自动触发重训练
from evidently import Report
from evidently.metric_preset import DataDriftPreset

def check_drift_and_trigger(current_data, reference_data):
    report = Report(metrics=[DataDriftPreset()])
    report.run(reference_data=reference_data, current_data=current_data)
    
    drift_result = report.as_dict()
    drift_detected = drift_result["metrics"][0]["result"]["dataset_drift"]
    
    if drift_detected:
        trigger_retraining_pipeline(
            reason="data_drift_detected",
            severity="medium",
            notify_team=True
        )
```

### MLflow 模型注册最佳实践

```python
import mlflow

with mlflow.start_run(run_name="financial_rag_v2.1"):
    # 记录关键参数
    mlflow.log_params({
        "model_name": "gpt-4o",
        "chunk_size": 512,
        "chunk_overlap": 64,
        "embedding_model": "text-embedding-3-large",
        "reranker": "cross-encoder/ms-marco-MiniLM-L-12-v2",
        "top_k": 5
    })
    
    # 记录评估指标
    mlflow.log_metrics({
        "ragas_faithfulness": 0.91,
        "ragas_answer_relevancy": 0.87,
        "avg_latency_ms": 1250,
        "avg_token_cost_usd": 0.0023,
        "hallucination_rate": 0.032
    })
    
    # 注册模型
    mlflow.pyfunc.log_model(
        artifact_path="rag_pipeline",
        python_model=FinancialRAGPipeline(),
        registered_model_name="financial-analysis-rag"
    )

# 生产环境加载
model = mlflow.pyfunc.load_model("models:/financial-analysis-rag/Production")
```

---

## 6. Prompt 工程与评估体系

### Prompt版本控制规范

```
prompts/
├── system/
│   ├── financial_analyst_v1.2.txt    # 系统角色定义
│   ├── risk_assessor_v2.0.txt
│   └── compliance_checker_v1.0.txt
├── task/
│   ├── earnings_summary.txt           # 任务指令
│   ├── portfolio_analysis.txt
│   └── regulatory_filing_qa.txt
├── tests/
│   ├── test_earnings_summary.yaml     # 回归测试用例
│   └── test_risk_assessment.yaml
└── CHANGELOG.md                        # 变更记录
```

### 系统Prompt最佳实践（金融场景）

```
你是一位专业的金融分析师AI助手，专注于{domain}领域。

## 核心原则
1. 基于事实：所有分析必须引用提供的文档，不得凭空推断
2. 量化优先：尽量提供具体数字，避免模糊表述
3. 风险标注：主动识别并标注分析中的不确定性
4. 合规意识：不提供具体投资建议，仅提供信息分析

## 输出格式
- 关键发现：3-5条要点，每条不超过2句
- 数据支撑：引用具体财务数字，标注数据来源段落
- 风险提示：明确标注假设条件和局限性

## 如果信息不足
明确告知用户缺失信息，不得推断或编造数据。
```

### LLM-as-Judge 评估框架

```python
JUDGE_PROMPT = """
评估以下金融分析回答的质量，从1-5打分：

问题：{question}
参考文档：{context}
AI回答：{answer}

评估维度：
1. 事实准确性（1-5）：回答是否基于提供的文档？是否有幻觉？
2. 相关性（1-5）：回答是否直接回应了问题？
3. 完整性（1-5）：是否覆盖了所有关键信息？
4. 合规性（1-5）：是否违反金融合规要求？

只返回JSON格式：
{{"accuracy": X, "relevancy": X, "completeness": X, "compliance": X, "reasoning": "..."}}
"""

def evaluate_response(question, context, answer, judge_model="gpt-4o"):
    response = openai.chat.completions.create(
        model=judge_model,
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            question=question, context=context, answer=answer
        )}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
```

---

## 7. 推理服务与成本优化

### 推理架构选型

```
低延迟实时场景          高吞吐批量场景
      ↓                       ↓
   vLLM / TGI            Batch Inference
   (GPU直接服务)          (SageMaker Batch)
      ↓                       ↓
  p99 < 2s               成本降低70%
```

### Token成本控制策略

```python
class CostAwareLLMRouter:
    """
    智能路由：根据任务复杂度选择合适规模的模型
    """
    
    MODELS = {
        "simple": "claude-haiku-4-5",     # ~$0.0002/1K tokens
        "standard": "claude-sonnet-4-5",   # ~$0.003/1K tokens  
        "complex": "claude-opus-4-5",      # ~$0.015/1K tokens
    }
    
    def route(self, task_type: str, complexity_score: float) -> str:
        if task_type in ["classification", "extraction"] or complexity_score < 0.3:
            return self.MODELS["simple"]
        elif complexity_score < 0.7:
            return self.MODELS["standard"]
        else:
            return self.MODELS["complex"]

# 使用示例
router = CostAwareLLMRouter()
model = router.route(task_type="risk_analysis", complexity_score=0.8)
# → 使用 claude-opus 处理复杂风险分析
```

### 成本监控仪表盘指标

| 指标 | 说明 | 预警阈值 |
|---|---|---|
| Cost per request | 每次请求平均成本 | > $0.01 触发优化 |
| Token efficiency | 有效输出Token/总Token | < 0.6 检查Prompt |
| Cache hit rate | Prompt缓存命中率 | < 40% 考虑增加缓存 |
| P99 latency | 99分位延迟 | > 5s 触发告警 |
| Error rate | 请求失败率 | > 1% 立即处理 |

---

## 8. 可观测性与治理

### 四层可观测性体系

```
Level 1：基础设施层
    CPU/GPU使用率, 内存, 网络带宽, Pod健康

Level 2：应用性能层
    请求延迟(P50/P95/P99), 吞吐量, 错误率

Level 3：LLM专属层
    Token消耗, 成本, 上下文长度分布, 模型版本

Level 4：质量评估层
    幻觉率, 答案相关性, 用户满意度, 有害内容率
```

### Langfuse 集成示例（开源可自托管）

```python
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

langfuse = Langfuse(
    public_key="pk-...",
    secret_key="sk-...",
    host="https://your-langfuse-instance.com"  # 私有部署
)

@observe(name="financial_analysis_pipeline")
def analyze_financial_document(query: str, document: str) -> str:
    
    # 追踪检索步骤
    retrieved = retrieve_context(query)
    langfuse_context.update_current_observation(
        metadata={"retrieved_chunks": len(retrieved), "query": query}
    )
    
    # 追踪LLM调用
    response = llm.invoke(build_prompt(query, retrieved))
    
    # 记录评估结果
    langfuse_context.score_current_trace(
        name="faithfulness",
        value=evaluate_faithfulness(response, retrieved)
    )
    
    return response
```

### 治理框架：金融行业必备

```yaml
# 治理检查清单
governance_checklist:
  
  数据安全:
    - [ ] PII检测与脱敏（姓名、账号、身份证）
    - [ ] 数据加密存储（AES-256）
    - [ ] 访问控制（RBAC）
    - [ ] 审计日志（不可篡改）
  
  模型合规:
    - [ ] 幻觉率监控 < 5%
    - [ ] 偏见检测（性别、地域、种族）
    - [ ] 有害内容过滤
    - [ ] 模型版本追踪与回滚
  
  业务合规:
    - [ ] 非投资建议免责声明
    - [ ] 信息来源引用
    - [ ] 人工审核节点（高风险决策）
    - [ ] 用户知情权（AI交互标识）
  
  运营合规:
    - [ ] 灾备与故障恢复
    - [ ] SLA监控（99.9%可用性）
    - [ ] 成本上限告警
    - [ ] 合规报告自动生成
```

---

## 9. 金融领域 LLM 系统专项

### 完整金融分析系统架构

```
                    用户请求
                       ↓
              ┌─── AI Gateway ───┐
              │ 鉴权 | 限流 | 路由 │
              └──────────────────┘
                       ↓
         ┌─────────────────────────────┐
         │      LangGraph Orchestrator  │
         │                             │
         │  ┌──────┐    ┌───────────┐  │
         │  │查询   │    │ 意图识别   │  │
         │  │改写   │ →  │ 任务分类   │  │
         │  └──────┘    └───────────┘  │
         │                    ↓        │
         │         ┌──────────────┐    │
         │         │   Agent路由   │    │
         │         └──────────────┘    │
         │        /    |    |    \     │
         └───────/─────|────|─────\───┘
                ↓      ↓   ↓      ↓
          财报分析  风险评估 监管合规  市场情报
          Agent    Agent  Agent   Agent
              \      |    |      /
               ↓     ↓   ↓     ↓
          ┌──────────────────────┐
          │   LlamaIndex RAG层   │
          │  向量检索 | 重排序     │
          └──────────────────────┘
                      ↓
          ┌──────────────────────┐
          │     知识库            │
          │  财报 | SEC文件        │
          │  研报 | 监管规则        │
          │  实时行情数据          │
          └──────────────────────┘
                      ↓
          ┌──────────────────────┐
          │   Human-in-Loop      │
          │   高风险决策人工审核   │
          └──────────────────────┘
                      ↓
                   最终响应
```

### 核心用例技术实现

#### 用例1：财报智能分析（Earnings Analysis）

```python
class EarningsAnalysisAgent:
    """
    对接10-K, 10-Q, 财报PDF，提供结构化分析
    """
    
    SYSTEM_PROMPT = """
    你是专业财务分析师。基于提供的财报文件：
    1. 提取核心财务指标（营收、利润率、EPS、FCF）
    2. 与上期和行业均值对比
    3. 识别关键风险因素
    4. 所有结论必须引用文档中的具体数字
    不得进行任何推断或使用文档外的数据。
    """
    
    def analyze(self, filing_path: str, query: str) -> dict:
        # 1. 文档处理
        documents = self.loader.load(filing_path)
        chunks = self.splitter.split(documents, 
                                      chunk_size=512, 
                                      overlap=64)
        
        # 2. 向量索引
        index = VectorStoreIndex.from_documents(chunks)
        
        # 3. 结构化查询
        query_engine = index.as_query_engine(
            similarity_top_k=8,
            response_mode="tree_summarize"
        )
        
        response = query_engine.query(query)
        
        # 4. 结构化输出
        return {
            "analysis": response.response,
            "source_nodes": [n.node.text for n in response.source_nodes],
            "confidence": self._compute_confidence(response)
        }
```

#### 用例2：多Agent风险评估（Multi-Agent Risk Assessment）

```python
# 角色化多Agent架构（参考 FinCon/TradingAgents 模式）

risk_assessment_crew = Crew(
    agents=[
        Agent(
            role="市场风险分析师",
            goal="评估价格波动、流动性、Beta系数",
            backstory="10年量化风险管理经验",
            tools=[market_data_tool, volatility_calculator]
        ),
        Agent(
            role="信用风险分析师", 
            goal="评估违约概率、债务结构、评级变化",
            tools=[credit_rating_tool, financial_ratio_calculator]
        ),
        Agent(
            role="监管合规分析师",
            goal="识别监管风险、合规要求",
            tools=[regulatory_database_tool, filing_search_tool]
        ),
        Agent(
            role="风险综合报告员",
            goal="综合三位分析师意见，生成最终风险评级",
            tools=[report_formatter]
        )
    ],
    tasks=[...],
    process=Process.hierarchical,  # 层次化流程
    manager_llm=ChatAnthropic(model="claude-opus-4-5")
)
```

#### 用例3：实时监管合规检查

```python
class ComplianceGuardrail:
    """
    LLM输出合规护栏 - 金融监管必备
    """
    
    PROHIBITED_PATTERNS = [
        r"保证.*收益|承诺.*回报",          # 投资收益保证
        r"一定.*涨|必然.*跌",              # 确定性价格预测
        r"\d{6,}.*身份证|账号.*\d{16,}",  # PII泄露
    ]
    
    REQUIRED_DISCLAIMERS = {
        "investment_advice": "以上内容仅供参考，不构成投资建议",
        "ai_generated": "本分析由AI生成，请结合专业判断使用"
    }
    
    def check(self, response: str, context: dict) -> ComplianceResult:
        violations = []
        
        # 1. 检查禁用模式
        for pattern in self.PROHIBITED_PATTERNS:
            if re.search(pattern, response):
                violations.append(f"违规内容: {pattern}")
        
        # 2. PII检测
        pii_detected = self.pii_detector.scan(response)
        if pii_detected:
            violations.append(f"PII泄露风险: {pii_detected}")
        
        # 3. 幻觉检测
        hallucination_score = self.fact_checker.check(
            response, context.get("source_docs", [])
        )
        
        return ComplianceResult(
            passed=len(violations) == 0,
            violations=violations,
            hallucination_score=hallucination_score,
            requires_disclaimer=self._check_disclaimer_needed(response)
        )
```

### 金融专用模型资源

| 模型/框架 | 类型 | 链接 |
|---|---|---|
| **BloombergGPT** | 专有金融大模型 | Bloomberg Research |
| **FinBERT** | 金融情感分析 | HuggingFace: ProsusAI/finbert |
| **FinGPT** | 开源金融LLM | github.com/AI4Finance-Foundation/FinGPT |
| **MarketSenseAI** | 股票分析Agent | arxiv.org/abs/2502.00415 |
| **RAGAS** | RAG评估框架 | github.com/explodinggradients/ragas |

---

## 10. 金融 AI 面试准备手册

### 🎯 高频考题分类

#### A. 系统设计题（最重要）

**Q1: 设计一个企业级财报分析系统**
```
参考答案框架：
1. 需求拆解：用户类型（分析师/交易员/风控）、数据源（SEC/Bloomberg/内部）
2. 架构分层：数据层 → RAG层 → Agent层 → 服务层 → 监控层
3. 关键设计决策：
   - 为何选RAG而非Fine-tuning？（实时性、可审计、成本）
   - 分块策略：财报按段落+层级分块，保留表格结构
   - 检索策略：混合检索（BM25+向量）+ Cross-encoder重排序
4. 合规考量：审计日志、PII保护、免责声明
5. 成本估算：Token消耗 × 模型定价 × QPS
```

**Q2: 如何处理LLM幻觉问题？特别是在金融场景**
```
分层回答：
1. 架构层：RAG确保答案有据可查
2. Prompt层：明确要求引用来源，不确定时拒绝回答
3. 输出层：事实核查模块对比检索文档
4. 监控层：RAGAS Faithfulness指标持续监控
5. 流程层：高风险决策引入人工审核节点
```

**Q3: RAG vs Fine-tuning 如何选择？**
```
RAG更适合：
✓ 知识频繁更新（财报、市场数据）
✓ 需要引用来源（合规要求）
✓ 私有数据无法外发
✓ 快速上线

Fine-tuning更适合：
✓ 特定输出格式/风格（金融报告模板）
✓ 领域专有术语和推理模式
✓ 推理时延要求极低
✓ 大量高质量标注数据可用
```

#### B. 技术深度题

**Q4: 解释LangGraph的状态图设计，为何适合金融工作流？**
```
要点：
- 显式状态：每个节点读写类型化状态字典，完整历史可追溯
- 条件路由：基于状态值的条件边，支持复杂业务逻辑
- Human-in-loop：原生支持暂停-恢复，适合高风险决策审核
- 时间旅行调试：可回放任意步骤，监管审计友好
- 可持久化：状态存储支持跨会话连续性

金融场景优势：每笔分析决策均可追溯，满足合规要求
```

**Q5: 如何设计LLM的CI/CD管线？**
```
关键环节：
1. 触发：代码/Prompt/数据变更 → Git push
2. 测试：
   - 单元测试（Prompt格式验证）
   - 集成测试（端到端RAG评估）
   - Regression测试（RAGAS指标对比基线）
   - 安全测试（PII泄露、有害内容）
3. 部署：
   - Shadow测试（不影响生产）
   - Canary发布（5% → 20% → 100%）
   - 自动回滚（指标下降触发）
4. 监控：
   - 实时幻觉率、延迟、成本
   - 数据漂移检测（Evidently）
   - 用户反馈收集
```

**Q6: 向量数据库选型考量？**
```
维度：
- 规模：文档量级（百万 vs 十亿）
- 延迟：P99要求（<100ms需Qdrant/Pinecone）
- 成本：自托管(pgvector) vs 托管(Pinecone)
- 功能：混合搜索、元数据过滤、多租户
- 合规：私有化部署要求（金融行业常见）

金融推荐：
- 中小规模 + 已有PG：pgvector
- 高性能 + 预算充足：Pinecone
- 混合搜索 + 自托管：Weaviate
```

#### C. 金融领域专项

**Q7: 如何用LLM处理SEC 10-K/10-Q文件？**
```
技术路径：
1. 解析：pdfplumber/unstructured提取文本，保留表格结构
2. 分块：按段落分块（MD&A、Risk Factors、Financial Statements单独处理）
3. 元数据：公司名、报告期、章节类型作为过滤维度
4. 检索：问题类型路由（数字问题 → 财务表格；定性问题 → MD&A）
5. 验证：数字提取后做交叉验证（利润表 vs 现金流量表）

难点：超长文档（>100页）→ 层级摘要策略
```

**Q8: 如何评估金融LLM的输出质量？**
```
多维评估体系：
1. 自动化：RAGAS（Faithfulness/Relevancy/Precision/Recall）
2. 领域：FinanceBench基准测试
3. 合规：PII检测通过率、免责声明覆盖率
4. 业务：分析师采纳率、决策准确率（需标注数据）
5. 成本：每次分析Token消耗趋势
```

### 🛠️ 技术栈备考清单

```
核心框架：
□ LangGraph（状态图API、条件路由、Human-in-loop）
□ LlamaIndex（文档加载、RAG管线、查询引擎）
□ RAGAS（RAG评估框架）

MLOps工具：
□ MLflow（实验追踪、模型注册）
□ Langfuse / LangSmith（LLM可观测性）
□ Evidently AI（数据漂移检测）

金融领域：
□ FinBERT原理（BERT金融微调）
□ BloombergGPT架构
□ SEC EDGAR API使用
□ 常见财务指标计算（P/E, ROE, FCF, EV/EBITDA）

系统设计：
□ RAG完整流程（分块→向量化→检索→重排→生成）
□ Multi-Agent协调模式（层次化、角色化、辩论式）
□ LLM成本估算方法
□ Canary发布 + 自动回滚设计
```

---

## 11. 工具栈速查表

### 完整工具生态图

| 类别 | 开源/自托管 | 托管云服务 | 备注 |
|---|---|---|---|
| **基础模型** | Llama 3, Mistral, Qwen | GPT-4o, Claude, Gemini | 金融可考虑Llama私有部署 |
| **向量数据库** | pgvector, Chroma, Qdrant | Pinecone, Weaviate Cloud | 中国合规推荐自托管 |
| **RAG框架** | LlamaIndex, Haystack | LlamaCloud | LlamaIndex首选 |
| **Agent编排** | LangGraph, CrewAI, AutoGen | LangGraph Cloud | LangGraph生产首选 |
| **实验追踪** | MLflow, W&B OSS | W&B, Comet | MLflow最通用 |
| **LLM可观测** | Langfuse (自托管) | LangSmith, Arize | Langfuse适合合规要求 |
| **数据漂移** | Evidently AI | WhyLabs | Evidently开源成熟 |
| **推理服务** | vLLM, TGI, Triton | SageMaker, Vertex AI | vLLM性能最优 |
| **管线编排** | Airflow, Prefect, Kubeflow | Vertex Pipelines | Airflow最成熟 |
| **CI/CD** | GitHub Actions, GitLab CI | — | GitHub Actions主流 |
| **容器/编排** | Kubernetes, Docker | EKS, GKE, AKS | K8s生产标准 |

### 金融场景推荐最小可行栈

```
阶段1 - MVP（2-4周）：
LlamaIndex + pgvector + GPT-4o API + Langfuse + FastAPI

阶段2 - 生产化（2-3月）：
+ LangGraph（Agent编排）
+ MLflow（模型注册）
+ GitHub Actions CI/CD
+ Evidently（漂移检测）
+ K8s部署 + Canary发布

阶段3 - 企业级（3-6月）：
+ 私有模型（Llama/Qwen微调）
+ 完整合规审计体系
+ 多租户隔离
+ 成本优化路由
+ 自动化重训练CT
```

---

## 12. 参考资料

### 官方文档
- LangGraph文档：https://langchain-ai.github.io/langgraph/
- LlamaIndex文档：https://docs.llamaindex.ai/
- MLflow文档：https://mlflow.org/docs/latest/
- Langfuse文档：https://langfuse.com/docs
- RAGAS文档：https://docs.ragas.io/

### 深度文章（2026年）
- MLOps 2026最佳实践：https://www.kernshell.com/best-practices-for-scalable-machine-learning-deployment/
- LLMOps企业生产指南：https://calmops.com/architecture/llmops-architecture-managing-llm-production-2026/
- MLOps/LLMOps完整路线图：https://medium.com/@sanjeebmeister/the-complete-mlops-llmops-roadmap-for-2026
- Agent框架格局2026：https://fordelstudios.com/research/state-of-ai-agent-frameworks-2026
- LangGraph vs LlamaIndex 2026：https://blog.premai.io/langchain-vs-llamaindex-2026-complete-production-rag-comparison/
- MLOps最佳实践8条：https://www.azilen.com/blog/mlops-best-practices/
- MCP取代传统框架趋势：https://www.mindstudio.ai/blog/llm-frameworks-replaced-by-agent-sdks

### 金融AI专项
- 金融RAG银行架构：https://www.indium.tech/blog/rag-architecture-llm-gen-ai-banking-insurance/
- 金融LLM-RAG论文（arXiv）：https://arxiv.org/abs/2504.06279
- 金融多Agent系统分类（2026）：https://arxiv.org/html/2603.27539v1
- LLM投资管理Agent综述（ACM）：https://dl.acm.org/doi/10.1145/3768292.3770387
- SEC文件LLM分析：https://intuitionlabs.ai/pdfs/llms-for-financial-document-analysis-sec-filings-decks.pdf
- BizTech金融LLM IT指南：https://biztechmagazine.com/article/2025/09/llms-ai-agents-and-reasoning-finance-overview-it-leaders-perfcon

### 工具与平台
- LangGraph官网：https://www.langchain.com/langgraph
- LlamaIndex官网：https://www.llamaindex.ai/
- Langfuse（开源LLM可观测）：https://github.com/langfuse/langfuse
- Evidently AI（数据漂移）：https://github.com/evidentlyai/evidently
- RAGAS（RAG评估）：https://github.com/explodinggradients/ragas
- vLLM（高性能推理）：https://github.com/vllm-project/vllm
- FinGPT（开源金融LLM）：https://github.com/AI4Finance-Foundation/FinGPT

### 学术与研究
- BloombergGPT论文：https://arxiv.org/abs/2303.17564
- FinBERT（HuggingFace）：https://huggingface.co/ProsusAI/finbert
- MarketSenseAI 2.0：https://arxiv.org/abs/2502.00415
- InvestorBench基准：https://arxiv.org/abs/2412.18174

---

*本文档持续更新，建议配合各框架官方Changelog同步跟进。*  
*最后更新：2026年4月 | 作者：Radon's LLM Knowledge Base*
