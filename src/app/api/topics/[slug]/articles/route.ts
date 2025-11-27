import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/topics/[slug]/articles
 * Get articles by specific topic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const skip = (page - 1) * limit;

    const topic = await prisma.topic.findUnique({
      where: { slug: params.slug },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          topics: {
            some: {
              id: topic.id,
            },
          },
        },
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
      prisma.article.count({
        where: {
          topics: {
            some: {
              id: topic.id,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        topic,
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
    console.error('Error fetching topic articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic articles' },
      { status: 500 }
    );
  }
}
