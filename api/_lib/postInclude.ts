// Shared Prisma include object for enriching Post responses
export const postInclude = {
  event: { select: { id: true, name: true } },
  collaborator: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
  assets: { include: { asset: true } },
} as const;
