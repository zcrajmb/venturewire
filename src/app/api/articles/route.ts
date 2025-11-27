import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/articles
 * Fetch paginated articles with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const vcFirmId = searchParams.get('firmId');
    const topicSlug = searchParams.get('topic');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (vcFirmId) where.vcFirmId = vcFirmId;
    if (category) where.category = category;
    if (topicSlug) {
      where.topics = {
        some: {
          slug: topicSlug,
        },
      };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          vcFirm: true,
          topics: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json(
      {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
