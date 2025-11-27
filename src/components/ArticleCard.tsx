'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  id: string;
  title: string;
  aiSummary?: string;
  imageUrl?: string;
  publishedAt: Date;
  readingTime?: number;
  firm?: {
    name: string;
    slug: string;
    logoUrl?: string;
  };
  className?: string;
}

export function ArticleCard({
  id,
  title,
  aiSummary,
  imageUrl,
  publishedAt,
  readingTime,
  firm,
  className,
}: ArticleCardProps) {
  return (
    <Link href={`/article/${id}`}>
      <div
        className={cn(
          'group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg cursor-pointer',
          className
        )}
      >
        {/* Image */}
        {imageUrl && (
          <div className="relative aspect-video overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Firm info */}
          {firm && (
            <div className="flex items-center gap-2">
              {firm.logoUrl && (
                <Image
                  src={firm.logoUrl}
                  alt={firm.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span className="text-xs font-medium text-muted-foreground">
                {firm.name}
              </span>
              {readingTime && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {readingTime} min read
                  </span>
                </>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Summary */}
          {aiSummary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {aiSummary}
            </p>
          )}

          {/* Date */}
          <p className="mt-auto text-xs text-muted-foreground">
            {timeAgo(publishedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
