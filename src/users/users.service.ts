import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadService } from './upload.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) { }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            events: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            events: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUserId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      isFollowing,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { username, email, password, birthDate, ...profileData } = updateProfileDto;

    // 1. Update User entity if needed
    if (username || email || password) {
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) {
        const bcrypt = await import('bcrypt');
        updateData.password = await bcrypt.hash(password, 10);
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // 2. Prepare Profile data
    const finalProfileData: any = { ...profileData };
    if (birthDate) {
      finalProfileData.birthDate = new Date(birthDate);
    }

    // 3. Update Profile entity
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: finalProfileData,
    });

    return profile;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const imageUrl = await this.uploadService.uploadImage(file);

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { avatar: imageUrl },
    });

    return { avatar: profile.avatar };
  }

  async uploadCoverImage(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const imageUrl = await this.uploadService.uploadImage(file);

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { coverImage: imageUrl },
    });

    return { coverImage: profile.coverImage };
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Ya sigues a este usuario');
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { message: 'Usuario seguido exitosamente', follow };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('No sigues a este usuario');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'Dejaste de seguir al usuario' };
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            include: {
              profile: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      data: followers.map((f) => {
        const { password, ...user } = f.follower;
        return user;
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            include: {
              profile: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      data: following.map((f) => {
        const { password, ...user } = f.following;
        return user;
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
