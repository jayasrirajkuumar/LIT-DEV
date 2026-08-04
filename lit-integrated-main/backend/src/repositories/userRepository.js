import { prisma } from "../database/prismaClient.js";

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    azureUserId: user.azureUserId,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt?.toISOString?.() ?? null,
    updatedAt: user.updatedAt?.toISOString?.() ?? null,
    lastLogin: user.lastLogin?.toISOString?.() ?? null,
  };
}

export const userRepository = {
  async findByAzureUserId(azureUserId) {
    return prisma.user.findUnique({ where: { azureUserId } });
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async createUser(data) {
    const user = await prisma.user.create({
      data: {
        azureUserId: data.azureUserId,
        email: data.email.toLowerCase(),
        displayName: data.displayName ?? null,
        phoneNumber: data.phoneNumber ?? null,
        profilePicture: data.profilePicture ?? null,
        lastLogin: data.lastLogin ?? new Date(),
      },
    });

    return toPublicUser(user);
  },

  async updateExistingUser(user, data) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: data.lastLogin ?? new Date(),
        displayName: data.displayName ?? user.displayName,
        profilePicture: data.profilePicture ?? user.profilePicture,
        email: data.email?.toLowerCase() ?? user.email,
      },
    });

    return toPublicUser(updated);
  },

  async updateProfile(userId, data) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber ?? null,
        profilePicture: data.profilePicture ?? null,
      },
    });

    return toPublicUser(updated);
  },

  async updateActiveStatus(userId, isActive) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return toPublicUser(updated);
  },

  toPublicUser,
};

export default userRepository;
