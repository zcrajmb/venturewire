import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/articles/trending
 * Get trending articles based on views and engagement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const trendingArticles = await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: sinceDate,
        },
      },
      include: {
        vcFirm: true,
        topics: true,
      },
      orderBy: [
        {
          views: 'desc',
        },
        {
          engagement: 'desc',
        },
        {
          publishedAt: 'desc',
        },
      ],
      take: limit,
    });

    return NextResponse.json(
      {
        articles: trendingArticles,
        period: {
          days,
          since: sinceDate.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending articles' },
      { status: 500 }
    );
  }
}
