import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/firms
 * List all VC firms
 */
export async function GET(request: NextRequest) {
  try {
    const firms = await prisma.vCFirm.findMany({
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
        firms: firms.map((firm: any) => ({
          ...firm,
          articleCount: firm._count.articles,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching firms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch firms' },
      { status: 500 }
    );
  }
}
