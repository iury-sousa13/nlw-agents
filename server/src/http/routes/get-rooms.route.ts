import { count, eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { db } from '../../db/connection';
import { schema } from '../../db/schema';

export const getRoomsRoutes: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    const rooms = await db
      .select({
        id: schema.rooms.id,
        createdAt: schema.rooms.createdAt,
        name: schema.rooms.name,
        questionsCount: count(schema.questions.id),
      })
      .from(schema.rooms)
      .leftJoin(schema.questions, eq(schema.rooms.id, schema.questions.roomId))
      .groupBy(schema.rooms.id)
      .orderBy(schema.rooms.createdAt);

    return rooms;
  });
};
