import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/search?q=query
 * Search articles by title, summary, and AI summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          OR: [
            {
              title: {
                search: query.split(' ').join(' | '),
                mode: 'insensitive',
              },
            },
            {
              summary: {
                search: query.split(' ').join(' | '),
                mode: 'insensitive',
              },
            },
            {
              aiSummary: {
                search: query.split(' ').join(' | '),
                mode: 'insensitive',
              },
            },
          ],
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
          OR: [
            {
              title: {
                search: query.split(' ').join(' | '),
                mode: 'insensitive',
              },
            },
            {
              summary: {
                search: query.split(' ').join(' | '),
                mode: 'insensitive',
              },
            },
            {
              aiSummary: {
                search: query.split(' ').join(' | '),
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
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
        query,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching articles:', error);
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    );
  }
}
