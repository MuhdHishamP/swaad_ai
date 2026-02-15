# 🍛 Swaad AI - Taste Powered by Intelligence

An AI-powered food ordering system built with **Next.js 16**, **TypeScript**, **LangChain**, and **Google Gemini 2.5 Flash**. Chat naturally with an AI assistant to discover, explore, and order from 100+ dishes across Indian cuisines.

---

## 🎬 Demo Video

<a href="https://www.loom.com/share/457eaa8421614be69aaf57262f4cc495" target="_blank">
  <img src="https://cdn.loom.com/sessions/thumbnails/457eaa8421614be69aaf57262f4cc495-with-play.gif" alt="Watch the demo" />
</a>

👉 **<a href="https://www.loom.com/share/457eaa8421614be69aaf57262f4cc495" target="_blank">Watch the full walkthrough on Loom</a>**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat Ordering** | Natural language food discovery via Gemini 2.5 Flash |
| 🍽️ **Dynamic Food Cards** | Rich cards with images, badges, nutrition info |
| 🛒 **Persistent Cart** | Zustand + localStorage, survives page refreshes |
| 📋 **Menu Browse** | Searchable grid with category & dietary filters |
| 🎨 **Dark Mode UI** | Premium glassmorphism design with amber/spice palette |
| ⚡ **Rate Limiting** | Token bucket limiter (per-session + global) |
| 🐳 **Docker Ready** | Multi-stage build, ~150MB production image |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/chat/route.ts      # POST /api/chat — AI endpoint
│   ├── menu/page.tsx           # Browse menu with filters
│   ├── layout.tsx              # Root layout + CartDrawer
│   ├── page.tsx                # Chat interface
│   └── globals.css             # Design system
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx  # Main chat UI
│   │   ├── chat-input.tsx      # Auto-expanding textarea
│   │   ├── food-card.tsx       # Food item card
│   │   ├── food-card-grid.tsx  # Responsive card grid
│   │   ├── message-bubble.tsx  # User/assistant bubbles
│   │   ├── message-renderer.tsx# Block → component router
│   │   ├── cart-summary.tsx    # Inline cart view
│   │   └── typing-indicator.tsx
│   ├── cart/
│   │   └── cart-drawer.tsx     # Slide-in cart panel
│   └── layout/
│       └── header.tsx          # Glassmorphism nav
├── lib/
│   ├── ai/
│   │   ├── agent.ts            # LangGraph agent + memory
│   │   ├── prompts.ts          # System prompt
│   │   ├── rate-limiter.ts     # Token bucket
│   │   └── tools.ts            # 6 LangChain tools
│   ├── food-data.ts            # JSON data service
│   └── utils.ts                # Helpers
├── stores/
│   ├── cart-store.ts           # Cart state (persisted)
│   └── chat-store.ts           # Chat state
├── types/
│   └── index.ts                # All TypeScript types
└── data/
    └── Foods.json              # 100 food items
```

### Data Flow

```
User Message → Chat Store → POST /api/chat → LangChain Agent
                                                  ↓
                                            Gemini 2.5 Flash
                                                  ↓
                                            Tool Calls (search, details, cart)
                                                  ↓
                                            Structured Response Blocks
                                                  ↓
Chat Store ← MessageBlock[] ← API Response ← Block Builder
    ↓
MessageRenderer → FoodCard | MessageBubble | CartSummary
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and **npm**
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/apikey)

### Local Development

```bash
# 1. Clone and install
git clone <repo-url> && cd restaurant_assignment
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add: GOOGLE_API_KEY=your_key_here

# 3. Start dev server
npm run dev
# Open http://localhost:3000
```

### Docker

```bash
# Build and run
echo "GOOGLE_API_KEY=your_key_here" > .env.local
docker compose up --build

# Open http://localhost:3000
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | ✅ | Google Gemini API key |
| `GOOGLE_GEMINI_MODEL` | No | Gemini model name (default: `gemini-2.5-flash`) |
| `NODE_ENV` | No | Default: `development` |
| `NEXT_PUBLIC_APP_URL` | No | Default: `http://localhost:3000` |

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| AI | LangChain + Google Gemini 2.5 Flash |
| State | Zustand 5 + localStorage persistence |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Validation | Zod 4 |
| Container | Docker (multi-stage Alpine) |

---

## 📄 License

MIT
