# 🤖 Aura Forex Agentic Trading Terminal

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Local First](https://img.shields.io/badge/Local-First-green.svg)](https://)
[![Ollama](https://img.shields.io/badge/LLM-Ollama-purple.svg)](https://ollama.ai)

&gt; **A fully autonomous, local-first AI trading system for Forex and equities.**
&gt; 
&gt; Built with agentic architecture, running entirely on your hardware. No cloud dependencies. No API keys to third-party AI services. Complete privacy and control.

---

## 🏗️ Architecture

┌─────────────────────────────────────────────────────────────────────────┐
│                           AURA CORE PLATFORM                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         EVENT BUS (Redis Streams)                │   │
│  │                    ━━ Persistent, ordered, pub/sub ━━            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                    │
│         ┌──────────────────────────┼──────────────────────────┐        │
│         │                          │                          │        │
│    ┌────┴────┐               ┌────┴────┐               ┌────┴────┐    │
│    │ INGEST  │               │ REASON  │               │  ACT    │    │
│    │ LAYER   │◄─────────────►│  LAYER  │◄─────────────►│ LAYER   │    │
│    │         │   market      │         │   signals     │         │    │
│    │         │   data        │         │   decisions   │         │    │
│    └────┬────┘               └────┬────┘               └────┬────┘    │
│         │                          │                          │        │
│         └──────────────────────────┼──────────────────────────┘        │
│                                    │                                    │
│                           ┌────────┴────────┐                          │
│                           │  STATE MANAGER  │                          │
│                           │  (PostgreSQL +  │                          │
│                           │   Redis Cache)  │                          │
│                           └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         OBSERVABILITY STACK                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Prometheus │  │   Grafana   │  │    Jaeger   │  │    Alert    │    │
│  │   Metrics   │  │ Dashboards  │  │   Tracing   │  │   Manager   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

### Agent Ecosystem

| Agent | Responsibility | Model |
|-------|---------------|-------|
| **Market Data Agent** | Real-time ingestion, technical indicators, pattern detection | Local embeddings + classical algorithms |
| **Strategy Agent** | Signal generation, regime detection, alpha research | Llama 3.1/3.2 8B-70B |
| **Risk Agent** | Position sizing, drawdown protection, correlation monitoring | Rule-based + LLM reasoning |
| **Execution Agent** | Order management, slippage optimization, exchange abstraction | Deterministic |
| **Memory Agent** | Long-term learning, strategy performance, market regime storage | Vector DB + LLM summarization |

---

## 🚀 Quick Start

### Prerequisites

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 3060 (12GB) | RTX 4090 (24GB) |
| **RAM** | 32GB | 64-128GB |
| **Storage** | 500GB SSD | 2TB NVMe |
| **OS** | Linux/Ubuntu 22.04 | Linux/Ubuntu 22.04 |

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/WAMAEDougl/-Aura-Forex-Agentic-Trading-Terminal.git
cd -Aura-Forex-Agentic-Trading-Terminal

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

2. Install Local LLM Infrastructure
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull required models
ollama pull llama3.1:8b        # General reasoning & analysis
ollama pull qwen2.5-coder:14b  # Strategy code generation
ollama pull nomic-embed-text   # Market context embeddings
ollama pull llama3.1:70b       # Complex multi-agent decisions (if VRAM permits)

# Verify installation
ollama list

3. Configure Data Infrastructure
# Start infrastructure stack
docker-compose -f deployment/docker-compose.yml up -d

# This starts:
# - TimescaleDB (market data)
# - Redis (real-time cache)
# - ChromaDB (vector memory)
# - Grafana (monitoring)

4. Configure Environment

cp config/example.env config/.env

# Edit config/.env with your settings:
# - Database connections
# - Exchange API keys (paper trading first!)
# - Risk limits
# - Model selections

5. Run Data Ingestion

# Start historical data download
python -m data.ingestion --symbols EURUSD,GBPUSD,USDJPY --timeframe 1h --years 5

# Start real-time feed
python -m data.ingestion.live --symbols EURUSD,GBPUSD,USDJPY

6. Launch Agent System

# Start all agents (paper trading mode)
python -m aura --mode paper --config config/paper_trading.yaml

# Or start individual components
python -m aura.agents.data_agent
python -m aura.agents.strategy_agent
python -m aura.agents.risk_agent
python -m aura.agents.execution_agent

📁 Project Structure

aura-trading/
├── agents/                      # Agent implementations
│   ├── base_agent.py           # Abstract base class
│   ├── data_agent/             # Market data ingestion & processing
│   ├── strategy_agent/         # Signal generation & alpha research
│   ├── risk_agent/             # Risk management & position sizing
│   ├── execution_agent/        # Order execution & broker interface
│   └── memory_agent/           # Long-term learning & context
├── models/                      # ML models
│   ├── local_llm/              # Ollama/vLLM integration
│   ├── time_series/            # Custom forecasting (Time-MoE, Lag-Llama)
│   └── embeddings/             # Market context embeddings
├── data/                        # Data infrastructure
│   ├── ingestion/              # ETL pipelines
│   ├── storage/                # Database connectors
│   └── preprocessing/          # Feature engineering
├── strategies/                  # Trading strategies
│   ├── backtesting/            # VectorBT/Backtrader integration
│   ├── live/                   # Live strategy wrappers
│   └── registry.yaml           # Strategy configuration
├── risk/                        # Risk management
│   ├── position_sizing.py      # Kelly, VaR, volatility-adjusted
│   ├── circuit_breakers.py     # Kill switches & limits
│   └── limits.yaml             # Risk parameter configs
├── execution/                   # Broker integration
│   ├── brokers/                # Exchange APIs (OANDA, Interactive Brokers, etc.)
│   └── order_management.py     # OMS with smart order routing
├── memory/                      # Agent memory & learning
│   ├── vector_store.py         # ChromaDB/LanceDB interface
│   ├── episodic_memory.py      # Trade history & outcomes
│   └── semantic_memory.py      # Market regime knowledge
├── config/                      # Configuration files
│   ├── paper_trading.yaml
│   ├── live_trading.yaml
│   └── example.env
├── deployment/                  # Infrastructure
│   ├── docker-compose.yml
│   └── monitoring/             # Grafana dashboards
├── tests/                       # Test suite
├── notebooks/                   # Research & analysis
└── docs/                        # Documentation

🧠 Agent Communication Protocol

class TradingSignal(BaseModel):
    agent_id: str                    # Originating agent
    timestamp: datetime              # Signal generation time
    symbol: str                      # Trading instrument
    signal_type: Literal["BUY", "SELL", "HOLD", "CLOSE"]
    confidence: float               # 0.0 - 1.0
    reasoning: str                  # LLM-generated explanation
    strategy: str                   # Strategy identifier
    metadata: dict                  # Indicators, context, regime
    suggested_size: float           # Position size (0-1 portfolio)
    max_hold_time: timedelta        # Maximum holding period
    stop_loss: Optional[float]      # Suggested stop level
    take_profit: Optional[float]    # Suggested target level

class RiskAssessment(BaseModel):
    signal_id: str
    approved: bool
    adjusted_size: float            # Risk-adjusted position
    rejection_reason: Optional[str]
    var_contribution: float         # Value at Risk

    ⚙️ Core Dependencies
    # Data & Processing
pandas>=2.0.0
polars>=0.20.0
numpy>=1.24.0
yfinance>=0.2.28
ccxt>=4.2.0

# AI/ML (Local)
torch>=2.1.0
transformers>=4.36.0
sentence-transformers>=2.2.0
llama-cpp-python>=0.2.0
ollama>=0.1.0

# Agent Framework
pydantic-ai>=0.0.12
langchain>=0.1.0
langchain-community>=0.0.10

# Trading
vectorbt>=0.26.0
backtrader>=1.9.78
pyportfolioopt>=1.5.0

# Infrastructure
redis>=5.0.0
influxdb-client>=1.38.0
chromadb>=0.4.0
fastapi>=0.109.0
uvicorn>=0.27.0

# Utilities
pydantic>=2.5.0
python-dotenv>=1.0.0
loguru>=0.7.0
typer>=0.9.0
rich>=13.7.0

🛡️ Safety & Risk Management
Hardcoded Safety Rules (Non-LLM)
# Maximum limits (override any agent decision)
MAX_POSITION_SIZE = 0.02        # 2% per trade
MAX_DAILY_DRAWDOWN = 0.05       # 5% daily stop
MAX_TOTAL_EXPOSURE = 0.50       # 50% capital max
MAX_CORRELATION_PAIR = 0.80     # Correlation threshold
VOLATILITY_ADJUSTMENT = True    # ATR-based sizing

Circuit Breakers
Daily Loss Limit: Auto-liquidate all positions if daily P&L < -5%
Volatility Spike: Pause trading if VIX/ATR exceeds 3σ
Correlation Breakdown: Reduce size if cross-asset correlation > 0.9
Model Degradation: Fallback to simple rules if LLM confidence < 0.6
Dead Man's Switch: Auto-liquidate if heartbeat signal lost for > 60s
📊 Monitoring & Observability
Access dashboards at http://localhost:3000 (Grafana):
Real-time P&L: Equity curve, drawdown, returns
Agent Performance: Signal accuracy per agent, latency
Risk Metrics: VaR, expected shortfall, position heatmap
System Health: GPU utilization, memory, API latency
LLM Metrics: Token throughput, response times, error rates
🎯 Development Roadmap
Phase 1: Foundation ✅
[x] Local LLM integration (Ollama)
[x] Data pipeline (historical + real-time)
[x] Basic backtesting framework
[x] Docker infrastructure
Phase 2: Single Agent 🔄
[ ] Market Data Agent (complete)
[ ] Strategy Agent (momentum + mean reversion)
[ ] Risk Agent (basic rules)
[ ] Paper trading only
[ ] 3 months backtest validation
Phase 3: Multi-Agent System ⏳
[ ] Agent communication protocol
[ ] Consensus mechanism for trades
[ ] Specialized strategy agents (trend, arb, sentiment)
[ ] Memory agent with vector DB
[ ] 6 months paper trading
Phase 4: Production Hardening ⏳
[ ] Advanced risk management
[ ] Live trading (micro accounts)
[ ] Comprehensive audit logging
[ ] Failover systems
[ ] Performance optimization
🤝 Contributing
This is an experimental project. Contributions welcome:
Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open Pull Request
Areas needing help:
Additional broker integrations
Strategy agent implementations
Risk model improvements
GPU optimization for local LLMs
Forex-specific data sources
⚠️ Disclaimer
TRADING INVOLVES SUBSTANTIAL RISK OF LOSS.
This system is experimental and not financial advice
Always start with paper trading for minimum 6 months
Past performance does not guarantee future results
Local LLMs can hallucinate - all signals require validation
Never risk capital you cannot afford to lose
Regulatory compliance is your responsibility
📜 License
MIT License - See LICENSE file.
🙏 Acknowledgments
Ollama - Local LLM serving
Meta Llama - Foundation models
VectorBT - Backtesting engine
LangChain - Agent framework patterns

Built with ❤️ for privacy-first, autonomous trading.

---

## 🚀 One-Line Setup Script (Bonus)

If you want to include a setup script, create `setup.sh`:

```bash
#!/bin/bash
# setup.sh - Initial environment setup

echo "🚀 Setting up Aura Trading Terminal..."

# Check Python version
python3 --version | grep -E "3\.(10|11|12)" || { echo "Python 3.10+ required"; exit 1; }

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install Ollama if not present
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Pull models
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# Setup infrastructure
docker-compose -f deployment/docker-compose.yml up -d

echo "✅ Setup complete! Run: python -m aura --mode paper"
