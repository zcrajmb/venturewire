import { Header } from '@/components/Header';
import { ArticleFeed } from '@/components/ArticleFeed';

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-2 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Latest VC Articles</h1>
          <p className="text-lg text-muted-foreground">
            Stay informed with AI-powered summaries from top venture capital firms
          </p>
        </div>

        <ArticleFeed apiEndpoint="/api/articles" showLoadMore={true} />
      </main>
    </>
  );
}
