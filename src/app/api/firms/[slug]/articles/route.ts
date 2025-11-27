import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/firms/[slug]/articles
 * Get articles by specific VC firm
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

    const firm = await prisma.vcFirm.findUnique({
      where: { slug: params.slug },
    });

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          vcFirmId: firm.id,
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
          vcFirmId: firm.id,
        },
      }),
    ]);

    return NextResponse.json(
      {
        firm,
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
    console.error('Error fetching firm articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch firm articles' },
      { status: 500 }
    );
  }
}
