import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) { }

  async addFavorite(userId: string, eventId: string, eventDateId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Check for existing favorite with exact same parameters
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_eventId_eventDateId: {
          userId,
          eventId,
          eventDateId: eventDateId ?? "", // Prisma usually needs handling for composite unique with nulls, but let's test. 
          // Actually, standard Prisma unique constraint with nullable fields requires generated field or findFirst. 
          // Wait, I defined @@unique([userId, eventId, eventDateId]).
          // But if eventDateId is optional (String?), checking unique might be tricky if it's null.
          // However, if I pass `eventDateId: eventDateId` and it's undefined, prisma might treat it as absent?
          // No, validation says it expects string or null.
        },
      },
    });

    // WORKAROUND: For nullable specific unique constraints, findFirst is safer if generated types are complex
    // But since I enabled the constraint, let's try findFirst to be safe and clear.
    const existingSafe = await this.prisma.favorite.findFirst({
      where: {
        userId,
        eventId,
        eventDateId: eventDateId || null
      }
    });

    if (existingSafe) {
      throw new ConflictException('El evento ya está en favoritos');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        eventId,
        eventDateId: eventDateId || null,
      },
      include: {
        event: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            location: true,
            dates: true,
          },
        },
        eventDate: true,
      },
    });
  }

  async removeFavorite(userId: string, favoriteId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    if (favorite.userId !== userId) {
      throw new NotFoundException('Favorito no encontrado');
    }

    await this.prisma.favorite.delete({
      where: { id: favoriteId },
    });

    return { message: 'Favorito eliminado exitosamente' };
  }

  async removeFavoriteByEvent(userId: string, eventId: string) {
    // This removes ALL favorites for this event by this user
    // Or should it?
    // Legacy behavior: remove unique [userId, eventId]. 
    // New behavior: Remove ALL instances? Or just general one?
    // Usually "toggle off" removes the specific one. 
    // But if called without dateId... 

    // Providing a "delete many" is safer to clear all favorites for this event
    const result = await this.prisma.favorite.deleteMany({
      where: {
        userId,
        eventId
      }
    });

    if (result.count === 0) {
      throw new NotFoundException('Favorito no encontrado');
    }

    return { message: 'Favorito eliminado exitosamente' };
  }

  async getFavorites(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          eventDate: true, // Include the specific date relation
          event: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
              location: true,
              dates: true,
              _count: {
                select: {
                  favorites: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({
        where: { userId },
      }),
    ]);

    const mappedFavorites = favorites.map(fav => {
      const event = fav.event;
      if (!event || !event.dates) return fav;

      // Logic: If favorite has a specific eventDateId, show THAT date.
      // Else, show upcoming future dates logic.

      let finalDates = event.dates;

      if (fav.eventDateId && fav.eventDate) {
        // If specific date is favorited, ONLY return that date in the list
        // This ensures the UI renders exactly that date card
        finalDates = [fav.eventDate];
      } else {
        // Fallback to "Upcoming" logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingDates = event.dates.filter(d => {
          const date = new Date(d.date);
          date.setHours(0, 0, 0, 0);
          return date.getTime() >= today.getTime();
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const allDates = event.dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        finalDates = upcomingDates.length > 0 ? upcomingDates : allDates;
      }

      return {
        ...fav,
        event: {
          ...event,
          dates: finalDates
        }
      };
    });

    return {
      data: mappedFavorites,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
