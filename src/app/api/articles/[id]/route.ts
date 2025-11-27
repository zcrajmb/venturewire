import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/articles/[id]
 * Get single article with related articles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        vcFirm: true,
        topics: true,
        bookmarks: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment views
    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Fetch related articles (same topics or firm)
    const relatedArticles = await prisma.article.findMany({
      where: {
        id: { not: id },
        OR: [
          {
            vcFirmId: article.vcFirmId,
          },
          {
            topics: {
              some: {
                id: {
                  in: article.topics.map((t: any) => t.id),
                },
              },
            },
          },
        ],
      },
      include: {
        vcFirm: true,
        topics: true,
      },
      take: 5,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        article,
        relatedArticles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
