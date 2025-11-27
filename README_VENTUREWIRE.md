# VentureWire - VC Content Aggregation Platform

A modern, AI-powered platform that aggregates venture capital articles from top firms and provides AI-generated summaries, making it easy for investors, founders, and operators to stay informed.

## 🎯 Features

- **Discover**: Browse articles from leading VC firms in one place
- **AI Summaries**: Get AI-powered summaries to quickly grasp key points  
- **Save Time**: Scan summaries before diving into full articles
- **Search**: Full-text search across all articles
- **Trending**: Discover trending articles from the past week/month
- **Clean UI**: Beautiful, minimal design with excellent user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS  
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI API (GPT-4)
- **Deployment**: Vercel
- **Content Scraping**: RSS feeds & web scraping

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or Supabase)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/zcrajmb/venturewire.git
cd venturewire

# Install dependencies
npm install

# Set up environment variables
cp .env.local .env.local

# Edit .env.local with your values
nano .env.local

# Run Prisma migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/venturewire

# AI
OPENAI_API_KEY=sk-...

# Cron Job Security
CRON_SECRET=your-secret-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout
│   ├── api/
│   │   ├── articles/         # Article endpoints
│   │   ├── firms/            # VC firm endpoints
│   │   ├── search/           # Search endpoint
│   │   ├── topics/           # Topics endpoint
│   │   └── articles/trending # Trending endpoint
│   └── globals.css
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── ArticleCard.tsx       # Article card component
│   ├── ArticleFeed.tsx       # Article list with pagination
│   └── SummaryBox.tsx        # AI summary display
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── utils.ts              # Utility functions
│   └── services/
│       ├── scraper.ts        # Content scraping
│       └── ai.ts             # AI summarization
└── types/
    └── index.ts              # TypeScript types
```

## 📊 Database Schema

### Articles
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  summary TEXT,
  fullContent TEXT,
  aiSummary TEXT,
  keyTakeaways TEXT[],
  imageUrl TEXT,
  publishedAt TIMESTAMP,
  readingTime INT,
  views INT DEFAULT 0,
  engagement INT DEFAULT 0,
  vcFirmId UUID REFERENCES vc_firms(id),
  ...
);
```

### VC Firms
```sql
CREATE TABLE vc_firms (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  blogUrl TEXT,
  rssUrl TEXT,
  logoUrl TEXT,
  ...
);
```

## 🔌 API Endpoints

### Articles
- `GET /api/articles` - List articles (paginated)
- `GET /api/articles/[id]` - Get single article
- `GET /api/articles/trending` - Get trending articles
- `GET /api/search?q=query` - Search articles

### VC Firms
- `GET /api/firms` - List all firms
- `GET /api/firms/[slug]/articles` - Get articles by firm

### Topics
- `GET /api/topics` - List all topics
- `GET /api/topics/[slug]/articles` - Get articles by topic

## 🤖 AI Summarization

The platform uses OpenAI's GPT-4 to generate:
- **Summaries**: 2-3 sentence overview of each article
- **Key Points**: 3-5 main takeaways
- **Categorization**: Auto-categorization by topic

## 📅 Scheduled Tasks (Cron)

The platform includes a cron endpoint for scraping articles:

**Endpoint**: `POST /api/cron/scrape`
**Frequency**: Every 6 hours (configured in Vercel)
**Function**: 
- Scrapes RSS feeds from top VC firms
- Stores new articles in database
- Generates AI summaries automatically

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Configure cron job in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/scrape",
    "schedule": "0 */6 * * *"
  }]
}
```

### Local Production Build

```bash
npm run build
npm start
```

## 📈 Performance Optimizations

- Next.js Image optimization
- Prisma query optimization with indexes
- Incremental Static Regeneration (ISR)
- Redis caching for article lists (optional)
- Loading skeletons for better UX

## 🔍 SEO

- Dynamic sitemap generation
- Open Graph meta tags
- JSON-LD structured data
- Mobile-responsive design

## 🛣️ Roadmap

### Phase 1 (MVP) ✅
- [x] Next.js setup + Database
- [x] Article scraping from 5 VC firms
- [x] AI summarization
- [x] Homepage & article detail pages
- [x] API endpoints

### Phase 2 (In Progress)
- [ ] User authentication
- [ ] Bookmarking system
- [ ] Email newsletter
- [ ] Advanced filtering
- [ ] Analytics

### Phase 3 (Future)
- [ ] Mobile app
- [ ] Social sharing
- [ ] Comment system
- [ ] Personalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Support

For issues and feature requests, please open an issue on GitHub.

---

Made with ❤️ by [@zcrajmb](https://github.com/zcrajmb)
