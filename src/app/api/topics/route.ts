import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/topics
 * List all topics
 */
export async function GET(request: NextRequest) {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        topics: topics.map((topic: any) => ({
          ...topic,
          articleCount: topic._count.articles,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
