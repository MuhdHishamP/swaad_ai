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
| 🧩 **Generative JSON UI (Flagged)** | Optional AI-rendered supplemental UI cards via validated JSON schema |
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
│   ├── api/chat/route.ts      # POST /api/chat - AI endpoint
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
│   ├── json-ui/
│   │   ├── registry.tsx        # Allowed JSON UI components
│   │   └── json-ui-renderer.tsx# Safe JSON UI renderer wrapper
│   └── layout/
│       └── header.tsx          # Glassmorphism nav
├── lib/
│   ├── ai/
│   │   ├── agent.ts            # LangGraph agent + memory
│   │   ├── prompts.ts          # System prompt
│   │   ├── rate-limiter.ts     # Token bucket
│   │   ├── json-ui-schema.ts   # JSON UI validation + guardrails
│   │   ├── ui-logging.ts       # JSON UI validation logs
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
MessageRenderer → FoodCard | MessageBubble | CartSummary | JsonUiRenderer
```

---

## 🧩 Generative JSON UI

`json_ui` is an additive block type for supplemental visuals (promo banners, short tips, compact summaries).  
It is **feature-flagged** and **server-validated** before rendering.

### Feature Flag

- `ENABLE_JSON_UI=false` by default
- Set `ENABLE_JSON_UI=true` in `.env.local` to enable

### Allowed Components (v1)

- `stack`
- `text`
- `badge`
- `image`
- `cta_button`

### Clickable Actions (v1)

`cta_button` supports the following action values:

- `open_menu`
  - default route: `/menu`
  - if label is a known category (`North Indian`, `South Indian`, `Street Food`):
    route to `/menu?category=<category>`
- `show_cart`
  - opens the global cart drawer in-place
- `checkout`
  - routes to `/checkout`

Unknown actions are ignored safely and logged as `action_ignored`.

### Safety Limits (Server Validation)

- Schema version must match expected version (`"1"`)
- Max depth: `5`
- Max nodes: `40`
- Max children per node: `10`
- Max payload size: `12,000` bytes
- Unknown components/props are rejected

### Where Validation Happens

- `src/lib/ai/json-ui-schema.ts` validates every candidate payload
- `src/lib/ai/agent.ts` only appends `json_ui` blocks when validation passes
- Rejections are logged through `src/lib/ai/ui-logging.ts`

### Scope Rules

- Use JSON UI only for **supplemental presentation**
- Keep core ordering operations on existing flow:
  - menu search/details via tools + `food_cards`
  - cart mutations via `cart_action`
  - cart totals/checkout prompts via existing cart blocks

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and **npm**
- **Google Gemini API Key** - [Get one free](https://aistudio.google.com/apikey)

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
| `ENABLE_JSON_UI` | No | Enables validated `json_ui` block rendering (`false` by default) |
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

Suggested verification for JSON UI changes:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

---

## 🚦 Rollout Checklist (`json_ui`)

1. Keep `ENABLE_JSON_UI=false` in shared/default environments.
2. Enable in local/dev only and verify:
   - Existing food recommendation cards unchanged
   - Cart add/remove/show-cart unchanged
   - Valid `json_ui` payload renders
   - Invalid payload safely falls back (no crash)
3. Monitor logs for validation rejections/acceptance rates.
4. Gradually enable in higher environments after stable behavior.

Manual QA scenarios for clickable actions:
1. Trigger welcome card and click `North Indian`/`South Indian`/`Street Food`:
   verify navigation to `/menu?category=...` and category filter preselected.
2. Trigger any card with `show_cart`:
   verify drawer opens from current page.
3. Trigger any card with `checkout`:
   verify navigation to `/checkout`.
4. Force an unknown action in payload:
   verify no crash and `action_ignored` log entry.

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
