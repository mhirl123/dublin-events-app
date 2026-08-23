import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all unique genres and their event counts
    const genresData = await prisma.event.groupBy({
      by: ['genre'],
      where: { isActive: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    const genres = genresData
      .filter(g => g.genre !== null)
      .map(g => ({
        name: g.genre,
        count: g._count.id,
      }))

    return NextResponse.json({
      genres,
      total: genres.length,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Genres API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
