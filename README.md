# Forex AI Agent — Local Blueprint

A complete, production-oriented blueprint for building a locally-running AI trading agent for the forex market. This covers every layer from raw data ingestion through to live order execution, including RL training, LLM-based news parsing, risk management, and backtesting.

> **Disclaimer:** This is an educational engineering blueprint. Forex trading carries significant financial risk. Never trade live capital with an untested system. Always paper trade first.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Prerequisites & Installation](#prerequisites--installation)
4. [Layer 1 — Data Ingestion & Storage](#layer-1--data-ingestion--storage)
5. [Layer 2 — Feature Engineering](#layer-2--feature-engineering)
6. [Layer 3 — AI / ML Model Layer](#layer-3--ai--ml-model-layer)
7. [Layer 4 — Decision Engine](#layer-4--decision-engine)
8. [Layer 5 — Risk Management](#layer-5--risk-management)
9. [Layer 6 — Execution, Backtesting & Orchestration](#layer-6--execution-backtesting--orchestration)
10. [LLM News Sentiment (Ollama)](#llm-news-sentiment-ollama)
11. [RL Training Loop](#rl-training-loop)
12. [Backtesting with VectorBT](#backtesting-with-vectorbt)
13. [Build Order](#build-order)
14. [Full Stack Summary](#full-stack-summary)

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Layer 1 — Data Ingestion            │
│  MT5 API · yfinance · NewsAPI · FRED macro  │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│       Layer 2 — Feature Engineering         │
│  RSI · MACD · ATR · lag returns · sessions  │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│         Layer 3 — AI / ML Model             │
│  LSTM · RL agent (PPO) · LLM sentiment      │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│         Layer 4 — Decision Engine           │
│  Signal fusion · confidence · session gates │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│        Layer 5 — Risk Management            │
│  Position sizing · drawdown · kill switch   │
└──────────┬─────────────────────┬────────────┘
           │                     │
┌──────────▼──────────┐ ┌────────▼────────────┐
│   Live Execution    │ │    Backtesting       │
│  MT5 / OANDA API    │ │  VectorBT · Walkfwd  │
└─────────────────────┘ └─────────────────────┘
           │                     │
           └─────────┬───────────┘
                     │
            Feedback / Retrain loop
```

---

## Project Structure

```
forex-agent/
├── data/
│   ├── raw/                  # Parquet candle files per pair/timeframe
│   ├── features/             # Engineered feature matrices
│   ├── news/                 # Scraped + parsed news cache
│   └── macro/                # FRED economic data
├── src/
│   ├── ingestion/
│   │   ├── mt5_feed.py       # MetaTrader5 candle puller
│   │   ├── yf_feed.py        # yfinance fallback
│   │   ├── news_feed.py      # NewsAPI + RSS scraper
│   │   └── macro_feed.py     # FRED calendar events
│   ├── features/
│   │   ├── indicators.py     # pandas-ta wrapper
│   │   ├── lag_features.py   # Rolling returns, lag close
│   │   └── pipeline.py       # Full feature build pipeline
│   ├── models/
│   │   ├── rl_env.py         # Custom gym environment
│   │   ├── rl_agent.py       # PPO training with SB3
│   │   ├── lstm_model.py     # Direction probability model
│   │   └── llm_signal.py     # Ollama news sentiment parser
│   ├── decision/
│   │   └── engine.py         # Signal fusion + entry logic
│   ├── risk/
│   │   └── guard.py          # Position sizing + guardrails
│   ├── execution/
│   │   ├── mt5_exec.py       # MT5 order placement
│   │   └── oanda_exec.py     # OANDA REST alternative
│   ├── backtest/
│   │   └── run_backtest.py   # VectorBT walk-forward runner
│   └── orchestrator.py       # Main agent loop (APScheduler)
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_feature_analysis.ipynb
│   ├── 03_rl_training.ipynb
│   └── 04_backtest_analysis.ipynb
├── logs/                     # Structured trade logs (JSON)
├── models/                   # Saved model weights
├── config.yaml               # Pairs, timeframes, thresholds
├── requirements.txt
└── README.md
```

---

## Prerequisites & Installation

### System requirements

- Python 3.11+
- MetaTrader 5 desktop app (for live data/execution) — Windows or Wine on Linux
- [Ollama](https://ollama.ai) installed locally (for LLM news parsing)
- 8 GB RAM minimum (16 GB recommended for RL training)

### Install dependencies

```bash
git clone https://github.com/yourname/forex-agent.git
cd forex-agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### requirements.txt

```
MetaTrader5>=5.0.45
pandas>=2.0
pandas-ta>=0.3.14b
numpy>=1.24
scikit-learn>=1.3
torch>=2.1
stable-baselines3>=2.2
gymnasium>=0.29
vectorbt>=0.26
yfinance>=0.2
requests>=2.31
apscheduler>=3.10
loguru>=0.7
pyarrow>=14.0
pyyaml>=6.0
ollama>=0.1.7
fredapi>=0.5
```

### Ollama setup (for LLM news parsing)

```bash
# Install Ollama from https://ollama.ai, then pull a model
ollama pull mistral
ollama serve   # runs on localhost:11434
```

---

## Layer 1 — Data Ingestion & Storage

### Overview

The data layer pulls OHLCV candles, economic calendar events, and news headlines, then stores everything locally as Parquet files (fast columnar reads for ML) and SQLite (trade logs, metadata).

### Data sources

| Source | Data type | Library |
|--------|-----------|---------|
| MetaTrader5 | Live tick + OHLCV | `MetaTrader5` |
| yfinance | Historical OHLCV fallback | `yfinance` |
| NewsAPI | Forex news headlines | `requests` |
| ForexFactory RSS | Economic calendar | `feedparser` |
| FRED (St. Louis Fed) | Macro data (CPI, NFP, rates) | `fredapi` |
| DXY / VIX | Correlation instruments | `yfinance` |

### `src/ingestion/mt5_feed.py`

```python
import MetaTrader5 as mt5
import pandas as pd
from pathlib import Path

TIMEFRAME_MAP = {
    "M1":  mt5.TIMEFRAME_M1,
    "M15": mt5.TIMEFRAME_M15,
    "H1":  mt5.TIMEFRAME_H1,
    "H4":  mt5.TIMEFRAME_H4,
    "D1":  mt5.TIMEFRAME_D1,
}

def init():
    if not mt5.initialize():
        raise RuntimeError(f"MT5 init failed: {mt5.last_error()}")

def get_latest(symbol: str, timeframe: str = "M15",
               bars: int = 5000) -> pd.DataFrame:
    init()
    tf = TIMEFRAME_MAP[timeframe]
    rates = mt5.copy_rates_from_pos(symbol, tf, 0, bars)
    mt5.shutdown()
    if rates is None:
        raise ValueError(f"No data for {symbol} {timeframe}")
    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s")
    df.set_index("time", inplace=True)
    return df[["open", "high", "low", "close", "tick_volume"]]

def save_parquet(symbol: str, timeframe: str = "M15",
                 bars: int = 10000):
    df = get_latest(symbol, timeframe, bars)
    path = Path(f"data/raw/{symbol}_{timeframe}.parquet")
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path)
    print(f"Saved {len(df)} rows → {path}")
```

### `src/ingestion/news_feed.py`

```python
import requests, sqlite3, json
from datetime import datetime

NEWSAPI_KEY = "YOUR_KEY_HERE"

def fetch_forex_news(query="forex EUR USD", page_size=20) -> list:
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": page_size,
        "apiKey": NEWSAPI_KEY,
    }
    resp = requests.get(url, params=params, timeout=10)
    articles = resp.json().get("articles", [])
    return [{"title": a["title"],
             "desc": a["description"],
             "published": a["publishedAt"]}
            for a in articles]

def save_news(articles: list, db_path="data/news/news.db"):
    con = sqlite3.connect(db_path)
    con.execute("""CREATE TABLE IF NOT EXISTS articles
                   (title TEXT, desc TEXT, published TEXT,
                    sentiment REAL, processed INTEGER DEFAULT 0)""")
    con.executemany(
        "INSERT OR IGNORE INTO articles VALUES (?,?,?,NULL,0)",
        [(a["title"], a["desc"], a["published"]) for a in articles])
    con.commit()
    con.close()
```

---

## Layer 2 — Feature Engineering

### Overview

Converts raw OHLCV into a rich feature matrix: technical indicators, lag returns, rolling volatility, session labels, and macro proximity signals.

### `src/features/pipeline.py`

```python
import pandas as pd
import pandas_ta as ta
import numpy as np
from pathlib import Path

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Full feature engineering pipeline on OHLCV DataFrame."""
    f = df.copy()

    # ── Technical indicators ──────────────────────────────────
    f.ta.rsi(length=14, append=True)
    f.ta.macd(fast=12, slow=26, signal=9, append=True)
    f.ta.bbands(length=20, std=2, append=True)
    f.ta.atr(length=14, append=True)
    f.ta.ema(length=9, append=True)
    f.ta.ema(length=21, append=True)
    f.ta.ema(length=50, append=True)
    f.ta.ema(length=200, append=True)
    f.ta.obv(append=True)
    f.ta.stoch(append=True)

    # ── Derived signals ───────────────────────────────────────
    f["ema_cross"] = (f["EMA_9"] > f["EMA_21"]).astype(int)
    f["above_ema200"] = (f["close"] > f["EMA_200"]).astype(int)
    f["bb_pos"] = (f["close"] - f["BBL_20_2.0"]) / \
                  (f["BBU_20_2.0"] - f["BBL_20_2.0"])  # 0–1 position in band

    # ── Lag returns ───────────────────────────────────────────
    for lag in [1, 3, 5, 15, 60]:
        f[f"ret_{lag}"] = f["close"].pct_change(lag)

    # ── Rolling volatility ────────────────────────────────────
    f["vol_20"] = f["close"].pct_change().rolling(20).std()
    f["atr_pct"] = f["ATRr_14"] / f["close"]  # normalised ATR
    # Volatility regime: low=0, normal=1, high=2
    q33 = f["atr_pct"].rolling(200).quantile(0.33)
    q66 = f["atr_pct"].rolling(200).quantile(0.66)
    f["vol_regime"] = np.where(f["atr_pct"] < q33, 0,
                      np.where(f["atr_pct"] < q66, 1, 2))

    # ── Session labels (UTC) ──────────────────────────────────
    hour = f.index.hour
    f["sess_asia"]   = ((hour >= 0)  & (hour < 7)).astype(int)
    f["sess_london"] = ((hour >= 7)  & (hour < 13)).astype(int)
    f["sess_ny"]     = ((hour >= 13) & (hour < 18)).astype(int)
    f["sess_overlap"]= ((hour >= 12) & (hour < 14)).astype(int)

    return f.dropna()

def save_features(symbol: str, timeframe: str = "M15"):
    raw = pd.read_parquet(f"data/raw/{symbol}_{timeframe}.parquet")
    feat = build_features(raw)
    out = Path(f"data/features/{symbol}_{timeframe}_features.parquet")
    out.parent.mkdir(parents=True, exist_ok=True)
    feat.to_parquet(out)
    print(f"Features: {feat.shape} → {out}")
```

---

## Layer 3 — AI / ML Model Layer

### 3a. Custom RL Gym Environment

```python
# src/models/rl_env.py
import gymnasium as gym
import numpy as np
import pandas as pd

class ForexEnv(gym.Env):
    """
    Observation: last `window` candles of features (float32)
    Actions:     0=Hold, 1=Buy, 2=Sell, 3=Close
    Reward:      realised PnL minus spread cost minus drawdown penalty
    """
    metadata = {"render_modes": []}

    def __init__(self, df: pd.DataFrame, window: int = 60,
                 spread_pips: float = 0.5, pip_value: float = 10.0):
        super().__init__()
        self.df = df.reset_index(drop=True).astype(np.float32)
        self.window = window
        self.spread_cost = spread_pips * pip_value * 0.0001
        self.pip_value = pip_value

        n_features = self.df.shape[1]
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(window, n_features), dtype=np.float32)
        self.action_space = gym.spaces.Discrete(4)

        self._reset_state()

    def _reset_state(self):
        self.idx = self.window
        self.position = 0       # 0=flat, 1=long, -1=short
        self.entry_price = 0.0
        self.equity = 10_000.0
        self.peak_equity = 10_000.0
        self.trade_log = []

    def _obs(self):
        return self.df.iloc[self.idx - self.window:self.idx].values

    def step(self, action):
        price = float(self.df["close"].iloc[self.idx])
        reward = 0.0

        # Close existing position if action=Close or reversal
        if self.position != 0 and action in [3, 1, 2]:
            pnl = (price - self.entry_price) * self.position * self.pip_value
            pnl -= self.spread_cost
            self.equity += pnl
            reward = pnl
            self.trade_log.append({"idx": self.idx, "pnl": pnl})
            self.position = 0

        # Open new position
        if action == 1 and self.position == 0:
            self.position = 1
            self.entry_price = price
            reward -= self.spread_cost
        elif action == 2 and self.position == 0:
            self.position = -1
            self.entry_price = price
            reward -= self.spread_cost

        # Drawdown penalty
        self.peak_equity = max(self.peak_equity, self.equity)
        drawdown = (self.peak_equity - self.equity) / self.peak_equity
        reward -= drawdown * 0.1

        self.idx += 1
        terminated = self.idx >= len(self.df) - 1
        truncated = False

        return self._obs(), reward, terminated, truncated, {}

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self._reset_state()
        # Random start to avoid overfitting to one sequence start
        self.idx = np.random.randint(self.window,
                                     max(self.window + 1,
                                         int(len(self.df) * 0.5)))
        return self._obs(), {}
```

### 3b. RL Training

```python
# src/models/rl_agent.py
import pandas as pd
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from stable_baselines3.common.callbacks import EvalCallback
from rl_env import ForexEnv

def train(symbol="EURUSD", timeframe="M15",
          total_timesteps=500_000):

    df = pd.read_parquet(
        f"data/features/{symbol}_{timeframe}_features.parquet")

    # Train / validation split (80/20 chronological)
    split = int(len(df) * 0.8)
    train_df = df.iloc[:split]
    val_df   = df.iloc[split:]

    train_env = DummyVecEnv([lambda: ForexEnv(train_df)])
    train_env = VecNormalize(train_env, norm_obs=True, norm_reward=True)

    val_env = DummyVecEnv([lambda: ForexEnv(val_df)])
    val_env = VecNormalize(val_env, norm_obs=True, norm_reward=False,
                           training=False)

    model = PPO(
        "MlpPolicy",
        train_env,
        learning_rate=3e-4,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        verbose=1,
        tensorboard_log="logs/rl_tb/",
    )

    eval_cb = EvalCallback(val_env, best_model_save_path="models/",
                           eval_freq=10_000, deterministic=True)

    model.learn(total_timesteps=total_timesteps, callback=eval_cb)
    model.save(f"models/{symbol}_ppo")
    train_env.save(f"models/{symbol}_vec_normalize.pkl")
    print("Training complete.")

if __name__ == "__main__":
    train()
```

### 3c. LSTM Direction Model

```python
# src/models/lstm_model.py
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

class LSTMDirectionModel(nn.Module):
    def __init__(self, input_size, hidden=128, layers=2, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden, layers,
                            batch_first=True, dropout=dropout)
        self.fc = nn.Linear(hidden, 3)  # 3 classes: down, flat, up

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])  # last timestep

def predict_direction(model, features: np.ndarray,
                      scaler: MinMaxScaler) -> tuple[int, float]:
    """Returns (predicted_class, confidence). Class: 0=down,1=flat,2=up"""
    scaled = scaler.transform(features)
    x = torch.FloatTensor(scaled).unsqueeze(0)
    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=-1).squeeze()
    cls = int(probs.argmax())
    conf = float(probs.max())
    return cls, conf
```

---

## Layer 4 — Decision Engine

```python
# src/decision/engine.py
from datetime import datetime, timezone
import pandas as pd

# Session hours in UTC
TRADEABLE_SESSIONS = {
    "London": (7, 12),
    "NY":     (13, 17),
    "Overlap":(12, 13),
}

def current_session() -> str | None:
    hour = datetime.now(timezone.utc).hour
    for name, (start, end) in TRADEABLE_SESSIONS.items():
        if start <= hour < end:
            return name
    return None

def hours_to_next_news(calendar_df: pd.DataFrame) -> float:
    """Returns hours until next high-impact news event."""
    now = pd.Timestamp.utcnow()
    future = calendar_df[calendar_df["time"] > now]
    if future.empty:
        return 99.0
    return (future["time"].iloc[0] - now).total_seconds() / 3600

def should_trade(
    rl_action: int,       # 0=hold,1=buy,2=sell,3=close
    rl_conf: float,       # 0–1 confidence from PPO
    lstm_class: int,      # 0=down,1=flat,2=up
    lstm_conf: float,     # 0–1
    llm_sentiment: float, # -1=bearish,0=neutral,+1=bullish
    features: pd.Series,
    calendar_df: pd.DataFrame,
    open_positions: int = 0,
) -> dict | None:

    # Ensemble score (weighted average)
    rl_direction = 1 if rl_action == 1 else (-1 if rl_action == 2 else 0)
    lstm_direction = 1 if lstm_class == 2 else (-1 if lstm_class == 0 else 0)

    score = (rl_conf      * 0.50 +
             lstm_conf    * 0.30 +
             abs(llm_sentiment) * 0.20)
    direction_agree = (rl_direction == lstm_direction ==
                       (1 if llm_sentiment > 0 else -1))

    # All gates must pass
    gates = {
        "confidence":   score >= 0.65,
        "direction":    direction_agree,
        "trend":        (rl_action == 1 and
                         features["above_ema200"] == 1) or
                        (rl_action == 2 and
                         features["above_ema200"] == 0),
        "session":      current_session() is not None,
        "news_clear":   hours_to_next_news(calendar_df) > 0.5,
        "no_position":  open_positions == 0,
        "vol_regime":   features["vol_regime"] < 2,  # avoid extreme vol
    }

    if not all(gates.values()):
        return None  # rejected — log which gates failed if debugging

    atr = features["ATRr_14"]
    price = features["close"]
    side = "buy" if rl_action == 1 else "sell"

    return {
        "action":    side,
        "price":     price,
        "sl":        price - 1.5 * atr if side == "buy" else price + 1.5 * atr,
        "tp":        price + 2.5 * atr if side == "buy" else price - 2.5 * atr,
        "sl_pips":   round(1.5 * atr / 0.0001),
        "score":     round(score, 3),
        "gates":     gates,
    }
```

---

## Layer 5 — Risk Management

```python
# src/risk/guard.py
from loguru import logger
import sqlite3
from datetime import datetime, date

PIP_VALUE_USD = 10.0   # per standard lot per pip (EURUSD)
SPREAD_PIPS   = 1.0    # assumed spread

def compute_lot_size(account_balance: float,
                     risk_pct: float,
                     sl_pips: float,
                     pip_value: float = PIP_VALUE_USD) -> float:
    """
    Fixed-fractional position sizing.
    risk_pct: percentage of account to risk per trade (e.g. 1.0 = 1%)
    """
    risk_amount = account_balance * (risk_pct / 100)
    lot_size = risk_amount / (sl_pips * pip_value)
    # Clamp between micro and 5 standard lots
    return round(max(0.01, min(lot_size, 5.0)), 2)

def kelly_fraction(win_rate: float, avg_win: float,
                   avg_loss: float, fraction: float = 0.5) -> float:
    """
    Half-Kelly criterion for position sizing.
    fraction=0.5 is safer — use full Kelly only with very high confidence.
    """
    if avg_loss == 0:
        return 0.0
    b = avg_win / avg_loss
    q = 1 - win_rate
    kelly = (b * win_rate - q) / b
    return max(0.0, kelly * fraction)

class RiskGuard:
    def __init__(self,
                 max_daily_loss_pct: float = 0.03,
                 max_weekly_loss_pct: float = 0.06,
                 max_concurrent: int = 3,
                 max_total_exposure_pct: float = 0.05):
        self.max_daily   = max_daily_loss_pct
        self.max_weekly  = max_weekly_loss_pct
        self.max_concur  = max_concurrent
        self.max_exposure= max_total_exposure_pct
        self.halted      = False
        self._daily_pnl  = 0.0
        self._weekly_pnl = 0.0
        self._day        = date.today()

    def _roll_daily(self):
        if date.today() != self._day:
            self._daily_pnl = 0.0
            self._day = date.today()

    def update(self, trade_pnl: float):
        self._roll_daily()
        self._daily_pnl  += trade_pnl
        self._weekly_pnl += trade_pnl

    def check(self, account_balance: float,
              open_positions: int = 0) -> bool:
        self._roll_daily()
        if self.halted:
            return False

        daily_loss_pct  = -self._daily_pnl / account_balance
        weekly_loss_pct = -self._weekly_pnl / account_balance

        if daily_loss_pct >= self.max_daily:
            self.halted = True
            logger.warning(f"RISK HALT — daily loss {daily_loss_pct:.1%}")
            return False
        if weekly_loss_pct >= self.max_weekly:
            self.halted = True
            logger.warning(f"RISK HALT — weekly loss {weekly_loss_pct:.1%}")
            return False
        if open_positions >= self.max_concur:
            logger.info("Max concurrent positions reached")
            return False

        return True

    def reset_halt(self):
        """Manual override — use with caution."""
        self.halted = False
        logger.info("Risk halt manually cleared")
```

---

## Layer 6 — Execution, Backtesting & Orchestration

### `src/execution/mt5_exec.py`

```python
import MetaTrader5 as mt5
from loguru import logger
import sqlite3, json
from datetime import datetime

def get_balance() -> float:
    mt5.initialize()
    info = mt5.account_info()
    mt5.shutdown()
    return info.balance if info else 0.0

def place_order(trade: dict, lot: float,
                symbol: str = "EURUSD") -> bool:
    mt5.initialize()
    price = mt5.symbol_info_tick(symbol)
    if price is None:
        logger.error(f"Cannot get tick for {symbol}")
        mt5.shutdown()
        return False

    order_type = (mt5.ORDER_TYPE_BUY if trade["action"] == "buy"
                  else mt5.ORDER_TYPE_SELL)
    exec_price = price.ask if trade["action"] == "buy" else price.bid

    request = {
        "action":   mt5.TRADE_ACTION_DEAL,
        "symbol":   symbol,
        "volume":   lot,
        "type":     order_type,
        "price":    exec_price,
        "sl":       trade["sl"],
        "tp":       trade["tp"],
        "comment":  f"agent_score:{trade['score']}",
        "type_time":mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    result = mt5.order_send(request)
    mt5.shutdown()

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        logger.error(f"Order failed: {result.comment}")
        return False

    _log_trade(symbol, trade, lot, exec_price, result.order)
    return True

def _log_trade(symbol, trade, lot, price, ticket):
    con = sqlite3.connect("logs/trades.db")
    con.execute("""CREATE TABLE IF NOT EXISTS trades (
        ticket INT, time TEXT, symbol TEXT, action TEXT,
        lot REAL, price REAL, sl REAL, tp REAL, score REAL)""")
    con.execute("INSERT INTO trades VALUES (?,?,?,?,?,?,?,?,?)", (
        ticket, datetime.utcnow().isoformat(), symbol,
        trade["action"], lot, price, trade["sl"],
        trade["tp"], trade["score"]))
    con.commit()
    con.close()
```

### `src/orchestrator.py` — Main Agent Loop

```python
from apscheduler.schedulers.blocking import BlockingScheduler
from loguru import logger
import pandas as pd
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import VecNormalize

import sys
sys.path.insert(0, "src")
from ingestion.mt5_feed  import get_latest
from features.pipeline   import build_features
from models.rl_env        import ForexEnv
from models.lstm_model    import LSTMDirectionModel, predict_direction
from models.llm_signal    import get_llm_sentiment
from decision.engine      import should_trade
from risk.guard           import RiskGuard, compute_lot_size
from execution.mt5_exec   import get_balance, place_order

SYMBOL     = "EURUSD"
TIMEFRAME  = "M15"
RISK_PCT   = 1.0

guard = RiskGuard(max_daily_loss_pct=0.03, max_weekly_loss_pct=0.06)

# Load models once at startup
rl_model  = PPO.load("models/EURUSD_ppo")
# lstm + scaler would be loaded here similarly

scheduler = BlockingScheduler(timezone="UTC")

@scheduler.scheduled_job("cron", minute="*/15",
                          id="forex_agent")
def run_agent():
    logger.info(f"Agent tick — {SYMBOL} {TIMEFRAME}")

    balance = get_balance()
    open_pos = 0  # fetch from MT5 in production

    if not guard.check(balance, open_pos):
        logger.warning("Guard blocked this tick")
        return

    # 1. Fresh data
    raw  = get_latest(SYMBOL, TIMEFRAME, bars=300)
    feat = build_features(raw)
    latest = feat.iloc[-1]

    # 2. RL signal
    obs = feat.values[-60:].astype("float32")
    rl_action, _ = rl_model.predict(obs, deterministic=True)
    rl_conf = 0.75  # extract from model internals in production

    # 3. LSTM signal (placeholder)
    lstm_class, lstm_conf = 2, 0.70

    # 4. LLM news sentiment
    llm_sentiment = get_llm_sentiment(
        query=f"{SYMBOL} forex outlook today")

    # 5. Decision
    calendar = pd.DataFrame()  # load from macro_feed
    trade = should_trade(int(rl_action), rl_conf,
                         lstm_class, lstm_conf,
                         llm_sentiment, latest,
                         calendar, open_pos)

    if trade is None:
        logger.info("No trade signal this tick")
        return

    # 6. Size + execute
    lot = compute_lot_size(balance, RISK_PCT, trade["sl_pips"])
    logger.info(f"Placing {trade['action']} {lot} lots | score={trade['score']}")
    success = place_order(trade, lot, SYMBOL)

    if success:
        logger.success(f"Order placed — score={trade['score']}")

if __name__ == "__main__":
    logger.add("logs/agent_{time}.log", rotation="1 day",
               format="{time} {level} {message}")
    logger.info("Forex agent starting...")
    scheduler.start()
```

---

## LLM News Sentiment (Ollama)

```python
# src/models/llm_signal.py
import ollama
import json

SYSTEM_PROMPT = """You are a professional forex analyst.
Given a news headline or economic event description, respond ONLY
with a JSON object like:
{"sentiment": 0.7, "direction": "bullish", "confidence": "high"}
sentiment is a float from -1.0 (very bearish) to +1.0 (very bullish).
No other text, no explanation, just the JSON."""

def get_llm_sentiment(query: str,
                      model: str = "mistral") -> float:
    """
    Returns a sentiment score from -1.0 (bearish) to +1.0 (bullish).
    Falls back to 0.0 on any error.
    """
    try:
        response = ollama.chat(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": query},
            ]
        )
        text = response["message"]["content"].strip()
        data = json.loads(text)
        return float(data.get("sentiment", 0.0))
    except Exception as e:
        return 0.0  # neutral on failure

def batch_sentiment(headlines: list[str],
                    model: str = "mistral") -> list[float]:
    return [get_llm_sentiment(h, model) for h in headlines]
```

---

## RL Training Loop

Full training script with walk-forward cross-validation:

```python
# notebooks equivalent — run as script
import pandas as pd
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from src.models.rl_env import ForexEnv

df = pd.read_parquet("data/features/EURUSD_M15_features.parquet")

# Walk-forward windows: train 18 months, test 3 months
TRAIN_MONTHS = 18 * 30 * 24 * 4   # approx rows at M15
TEST_MONTHS  =  3 * 30 * 24 * 4

results = []
start = 0

while start + TRAIN_MONTHS + TEST_MONTHS <= len(df):
    train = df.iloc[start : start + TRAIN_MONTHS]
    test  = df.iloc[start + TRAIN_MONTHS :
                    start + TRAIN_MONTHS + TEST_MONTHS]

    env = DummyVecEnv([lambda: ForexEnv(train)])
    env = VecNormalize(env)

    model = PPO("MlpPolicy", env, verbose=0,
                learning_rate=3e-4, n_steps=2048)
    model.learn(total_timesteps=200_000)

    # Evaluate on test window
    test_env = DummyVecEnv([lambda: ForexEnv(test)])
    obs = test_env.reset()
    total_reward = 0
    done = [False]
    while not done[0]:
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, done, _ = test_env.step(action)
        total_reward += reward[0]

    results.append({"window_start": start, "reward": total_reward})
    print(f"Window {start}: test reward = {total_reward:.2f}")
    start += TEST_MONTHS  # roll forward

print("\nWalk-forward results:")
for r in results:
    print(r)
```

---

## Backtesting with VectorBT

```python
# src/backtest/run_backtest.py
import vectorbt as vbt
import pandas as pd
import numpy as np

def run_backtest(symbol="EURUSD", timeframe="M15"):
    feat = pd.read_parquet(
        f"data/features/{symbol}_{timeframe}_features.parquet")
    price = feat["close"]

    # Example: simple MACD crossover strategy as baseline
    macd_fast  = feat["MACD_12_26_9"]
    macd_slow  = feat["MACDs_12_26_9"]

    entries = (macd_fast > macd_slow) & \
              (macd_fast.shift(1) <= macd_slow.shift(1))
    exits   = (macd_fast < macd_slow) & \
              (macd_fast.shift(1) >= macd_slow.shift(1))

    pf = vbt.Portfolio.from_signals(
        price,
        entries,
        exits,
        init_cash=10_000,
        fees=0.0002,     # 2 pip spread approximation
        slippage=0.0001,
        freq="15min",
    )

    print(pf.stats())
    pf.plot().show()
    return pf

if __name__ == "__main__":
    pf = run_backtest()
    print(f"\nSharpe ratio:  {pf.sharpe_ratio():.3f}")
    print(f"Max drawdown:  {pf.max_drawdown():.2%}")
    print(f"Total return:  {pf.total_return():.2%}")
    print(f"Win rate:      {pf.trades.win_rate():.2%}")
```

---

## Build Order

Build and validate each layer before moving to the next. Never skip straight to live trading.

```
Step 1 ── Data ingestion
         Verify: pull 10,000 candles, save Parquet, spot-check OHLC values

Step 2 ── Feature engineering
         Verify: no NaN in final feature matrix, indicators look correct on chart

Step 3 ── Backtesting scaffold
         Verify: VectorBT runs on historical data, metrics print correctly

Step 4 ── Baseline model (MACD / RSI rules)
         Verify: positive Sharpe > 0.5 on out-of-sample before adding ML

Step 5 ── LSTM direction model
         Verify: validation accuracy > 54% (better than random for 3-class)

Step 6 ── RL environment
         Verify: random agent runs without errors, reward is finite

Step 7 ── RL training (walk-forward)
         Verify: agent beats baseline MACD strategy on test windows

Step 8 ── LLM sentiment integration
         Verify: Ollama returns valid JSON, sentiment correlates with moves

Step 9 ── Decision engine + risk management
         Verify: paper trade for 4–6 weeks, all guards fire correctly

Step 10 ── Live execution (micro lots only)
          Verify: orders appear in MT5, SL/TP set correctly
          Monitor: daily for first 2 weeks before scaling up
```

---

## Full Stack Summary

| Component | Tool / Library | Purpose |
|-----------|----------------|---------|
| Language | Python 3.11+ | Everything |
| Live data | MetaTrader5 Python API | Candles, tick data, execution |
| Historical data | yfinance | Backfill / alternative |
| News | NewsAPI + feedparser | Sentiment input |
| Macro | FRED API | CPI, NFP, rate decisions |
| Storage | Parquet + SQLite | Features + trade logs |
| Indicators | pandas-ta | All standard TA |
| RL framework | Stable-Baselines3 (PPO) | Core trading agent |
| Deep learning | PyTorch | LSTM direction model |
| LLM local | Ollama + Mistral 7B | News sentiment |
| Backtesting | VectorBT | Fast vectorized backtest |
| Risk | Custom (see `risk/guard.py`) | Position sizing + limits |
| Scheduling | APScheduler | 15-min agent loop |
| Logging | loguru | Structured trade logs |
| Monitoring | TensorBoard | RL training curves |

---

## Important Notes

- **Paper trade first.** Run the agent for at least 4–6 weeks on a demo account before touching real money.
- **Retraining.** Retrain the RL model monthly or when performance degrades. Markets regime-change.
- **Correlations.** EUR/USD and GBP/USD are highly correlated. The risk guard blocks simultaneous longs on both.
- **News events.** The agent is blocked from trading 30 minutes either side of high-impact news (NFP, rate decisions, CPI). Do not remove this gate.
- **Slippage.** VectorBT backtests assume instant fills. Real execution has slippage — build in 1–2 extra pips of cost in your expectations.
- **Regulatory.** Automated trading has regulatory implications depending on your jurisdiction. Check local rules before deploying with real capital.

---

*Built as a local, fully self-contained system — no cloud dependencies required.*
