# 🔍 Semantic Search Application with Pinecone

A high-performance semantic search engine built with **Next.js**, **Xenova Transformers**, and **Pinecone** vector database. Generate embeddings server-side and perform intelligent similarity searches on text data.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?logo=tailwind-css)

---

## ✨ Features

- **🚀 Server-Side Embeddings** — Generate embeddings using Xenova/Transformers with Bun runtime
- **💾 Pinecone Integration** — Store and retrieve embeddings from Pinecone vector database
- **⚡ High Performance** — Model warmup, embedding caching, batch processing
- **🎨 Modern UI** — Built with React 19, Tailwind CSS, and shadcn/ui components
- **📊 Semantic Search** — Find contextually similar text across large datasets
- **🔐 Environment-Based Configuration** — Easy setup with `.env.local`
- **🌐 Responsive Design** — Works on desktop and mobile devices

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Bun | 1.3.11+ |
| **Framework** | Next.js | 16.1.3 |
| **UI Library** | React | 19 |
| **Language** | TypeScript | 5.7 |
| **Styles** | Tailwind CSS | 4 |
| **ML Library** | Xenova/Transformers | 2.17.2 |
| **Vector DB** | Pinecone | 7.1.0 |
| **ORM** | Prisma | 6.11.1 |
| **Form Handling** | React Hook Form + Zod | - |

---

## 🚀 Quick Start

### Prerequisites

- **Bun** 1.3.0+ ([Install](https://bun.sh))
- **Node.js** 18+ (or use Bun)
- **Git**
- **Pinecone Account** with API key and index

### 1. Clone Repository

```bash
git clone https://github.com/hiba-essid/sentence-transformer.git
cd sentence-transformer
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment

Create `.env.local` with your Pinecone credentials:

```env
# Pinecone Configuration
NEXT_PUBLIC_PINECONE_API_KEY=pcsk_your_api_key_here
NEXT_PUBLIC_PINECONE_INDEX=your-index-name

# Database
DATABASE_URL=file:./prisma/dev.db

# Model Configuration
NEXT_PUBLIC_MODEL_TYPE=Xenova/multi-qa-MiniLM-L6-cos-v1
```

### 4. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 API Routes

### Generate & Store Embeddings

**Endpoint:** `POST /api/pinecone/upsert`

**Request:**
```bash
curl -X POST http://localhost:3000/api/pinecone/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Your first document", "Your second document"],
    "metadata": { "source": "my-app", "category": "docs" }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully stored 2 embeddings in Pinecone",
  "vectorIds": ["1234567890-0", "1234567890-1"],
  "embeddings": [
    { "id": "1234567890-0", "dimensions": 384, "text": "Your first document" }
  ]
}
```

### Query Embeddings

**Endpoint:** `POST /api/pinecone/query`

**Request:**
```bash
curl -X POST http://localhost:3000/api/pinecone/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are you looking for?",
    "topK": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "What are you looking for?",
  "results": [
    {
      "id": "1234567890-0",
      "score": 0.92,
      "text": "Your first document",
      "metadata": { "source": "my-app" }
    }
  ]
}
```

### Warmup Model

**Endpoint:** `GET /api/model/warmup`

Pre-loads the embedding model (run once after server starts):

```bash
curl http://localhost:3000/api/model/warmup
```

---

## ⚡ Performance Optimization

### Model Warmup (5-60 seconds, one-time)

When the server starts, the ML model needs to be initialized. Call the warmup endpoint:

```bash
curl http://localhost:3000/api/model/warmup
```

### Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| **First request (cold start)** | ~45-60s | Model downloads (~350MB) and initializes |
| **Regular embedding (1-5 texts)** | ~200-400ms | Model cached in memory |
| **Batch embedding (100 texts)** | ~800-1200ms | Efficient batch processing |
| **Query single result** | ~150-300ms | Cached model reused |
| **Cached embedding** | ~5-10ms | In-memory cache hit |

### Built-in Optimizations

✅ **Model Caching** — Model persists in memory after first initialization  
✅ **Embedding Cache** — Identical texts return results from cache (1-hour TTL)  
✅ **Batch Processing** — Handle multiple embeddings efficiently  
✅ **Performance Logging** — Server logs show timing for each operation

---

## 📦 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PINECONE_API_KEY` | ✅ | Pinecone API key for authentication |
| `NEXT_PUBLIC_PINECONE_INDEX` | ✅ | Pinecone index name |
| `DATABASE_URL` | ❌ | Prisma database URL (SQLite for dev) |
| `NEXT_PUBLIC_MODEL_TYPE` | ❌ | HuggingFace model ID (default: Xenova/multi-qa-MiniLM-L6-cos-v1) |

---

## 🗂️ Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── pinecone/
│   │   │   │   ├── upsert/route.ts      # Store embeddings
│   │   │   │   └── query/route.ts       # Search embeddings
│   │   │   ├── model/
│   │   │   │   ├── route.ts             # Check model status
│   │   │   │   └── warmup/route.ts      # Pre-load model
│   │   │   └── embeddings/route.ts      # Legacy endpoint (disabled)
│   │   ├── page.tsx                     # Main UI component
│   │   └── layout.tsx                   # Root layout
│   ├── lib/
│   │   ├── embeddings.ts                # Client-side ML functions
│   │   ├── pinecone.ts                  # Pinecone client & helpers
│   │   ├── model-warmup.ts              # Model preload logic
│   │   └── embedding-cache.ts           # In-memory embedding cache
│   ├── components/                      # React components (shadcn/ui)
│   ├── hooks/                           # Custom React hooks
│   └── styles/                          # Global styles
├── prisma/
│   ├── schema.prisma                    # Database schema
│   └── dev.db                           # SQLite database (dev)
├── public/                              # Static assets
├── .env.local                           # Environment variables (local)
├── next.config.ts                       # Next.js configuration
├── tailwind.config.ts                   # Tailwind CSS config
├── tsconfig.json                        # TypeScript config
├── package.json                         # Dependencies
├── vercel.json                          # Vercel deployment config
└── README.md                            # This file
```

---

## 🚢 Deployment

### Deploy on Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import this repository
4. Add environment variables:
   - `NEXT_PUBLIC_PINECONE_API_KEY`
   - `NEXT_PUBLIC_PINECONE_INDEX`
5. Click "Deploy"

**Live URL:** `https://your-project.vercel.app`

### Alternative Platforms

- **Azure App Service** — Full control, pay-as-you-go
- **Railway** — Simple deployment, free tier available
- **AWS Lambda + API Gateway** — Serverless option

---

## 🧪 Development Workflow

### Start Dev Server with Webpack

```bash
bun run dev
```

The app uses Webpack instead of Turbopack for better compatibility with Xenova/Transformers.

### Build for Production

```bash
bun run build
```

This creates an optimized `.next/standalone` build.

### Run Production Build Locally

```bash
NODE_ENV=production bun .next/standalone/server.js
```

### Database Migrations

```bash
# Push schema to database
bun run db:push

# Create migration
bun run db:migrate

# Generate Prisma client
bun run db:generate

# Reset database
bun run db:reset
```

---

## 🔄 How It Works

### 1. **Embedding Generation Flow**

```
User Input → Server-Side Generation → Pinecone upserted → Success Response
```

- Text sent to `/api/pinecone/upsert`
- Xenova loads model (or reuses cached instance)
- Embeddings generated as 384-dimensional vectors
- Vectors stored in Pinecone with metadata
- Client notified with vector IDs

### 2. **Semantic Search Flow**

```
Query → Generate Query Embedding → Search Pinecone → Return Similar Results
```

- User enters search query
- Query sent to `/api/pinecone/query`
- Query embedding generated server-side
- Pinecone returns top-K most similar vectors
- Results displayed with similarity scores

### 3. **Performance Optimization**

```
Cold Start (60s) → Model Warmup → Subsequent Requests (200ms)
```

- First request: Download + initialize model (~350MB WASM)
- Subsequent requests: Reuse cached model + in-memory embeddings
- Cache expires after 1 hour

---

## 🛠️ Troubleshooting

### Issue: Slow First Request

**Solution:** Call `/api/model/warmup` after server starts to pre-load the model.

### Issue: Pinecone Connection Error

**Solution:** Verify credentials in `.env.local`:
- API key is correct and active
- Index name matches Pinecone dashboard
- Environment has correct API key scope

### Issue: Build Fails with Sharp Module Error

**Solution:** Reinstall sharp for your platform:
```bash
bun add sharp --save
```

### Issue: Port 3000 Already in Use

**Solution:** Kill the process or use a different port:
```bash
bun run dev -- -p 3001
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Pinecone Docs](https://docs.pinecone.io)
- [Xenova/Transformers](https://xenova.github.io/transformers.js/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 📄 Performance Monitoring

Check server logs for embedding generation times:

```
[Model Warmup] Model loaded successfully in 45000ms
[Embeddings] Generated 5 embeddings in 350ms
[Query] Generated in 200ms
```

Monitor Pinecone usage in the [Pinecone Dashboard](https://app.pinecone.io)

---

## 📝 License

MIT License - Feel free to use this project for commercial or personal use.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 💬 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing [GitHub Issues](https://github.com/hiba-essid/sentence-transformer/issues)
3. Create a new issue with details and error logs

---

**Built with ❤️ using Next.js, Pinecone, and Xenova Transformers**

Made by [Hiba Essid](https://github.com/hiba-essid)
