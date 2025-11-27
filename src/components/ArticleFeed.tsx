'use client';

import { useEffect, useState } from 'react';
import { ArticleCard } from './ArticleCard';

interface Article {
  id: string;
  title: string;
  aiSummary?: string;
  imageUrl?: string;
  publishedAt: Date;
  readingTime?: number;
  vCFirm?: {
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

interface ArticleFeedProps {
  initialArticles?: Article[];
  apiEndpoint: string;
  title?: string;
  showLoadMore?: boolean;
}

export function ArticleFeed({
  initialArticles = [],
  apiEndpoint,
  title,
  showLoadMore = true,
}: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}page=${page + 1}`
      );
      const data = await response.json();

      if (data.articles?.length) {
        setArticles((prev) => [...prev, ...data.articles]);
        setPage((prev) => prev + 1);

        if (data.pagination) {
          setHasMore(page + 1 < data.pagination.pages);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            id={article.id}
            title={article.title}
            aiSummary={article.aiSummary}
            imageUrl={article.imageUrl}
            publishedAt={new Date(article.publishedAt)}
            readingTime={article.readingTime}
            firm={
              article.vCFirm
                ? {
                    name: article.vCFirm.name,
                    slug: article.vCFirm.slug,
                    logoUrl: article.vCFirm.logoUrl || undefined,
                  }
                : undefined
            }
          />
        ))}
      </div>

      {showLoadMore && hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
