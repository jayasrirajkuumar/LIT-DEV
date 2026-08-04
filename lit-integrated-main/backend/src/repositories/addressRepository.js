import { prisma } from "../database/prismaClient.js";

export function toPublicAddress(address) {
  return {
    id: address.id,
    userId: address.userId,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    addressType: address.addressType,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

export const addressRepository = {
  async findAllByUserId(userId) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return addresses.map(toPublicAddress);
  },

  async findByIdForUser(id, userId) {
    return prisma.address.findFirst({
      where: { id, userId },
    });
  },

  async create(userId, data) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const addressCount = await tx.address.count({ where: { userId } });
      const shouldBeDefault = data.isDefault || addressCount === 0;

      if (shouldBeDefault && !data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const created = await tx.address.create({
        data: {
          userId,
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 ?? null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          addressType: data.addressType,
          isDefault: shouldBeDefault,
        },
      });

      return toPublicAddress(created);
    });
  },

  async update(id, userId, data) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return null;
      }

      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const updated = await tx.address.update({
        where: { id },
        data: {
          fullName: data.fullName ?? existing.fullName,
          phone: data.phone ?? existing.phone,
          addressLine1: data.addressLine1 ?? existing.addressLine1,
          addressLine2:
            data.addressLine2 !== undefined ? data.addressLine2 : existing.addressLine2,
          city: data.city ?? existing.city,
          state: data.state ?? existing.state,
          postalCode: data.postalCode ?? existing.postalCode,
          country: data.country ?? existing.country,
          addressType: data.addressType ?? existing.addressType,
          isDefault: data.isDefault ?? existing.isDefault,
        },
      });

      return toPublicAddress(updated);
    });
  },

  async delete(id, userId) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return null;
      }

      await tx.address.delete({ where: { id } });

      if (existing.isDefault) {
        const nextDefault = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        if (nextDefault) {
          await tx.address.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }

      return toPublicAddress(existing);
    });
  },

  toPublicAddress,
};

export default addressRepository;
