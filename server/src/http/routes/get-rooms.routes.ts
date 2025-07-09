import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection";
import { schema } from "../../db/schema";

export const getRoomsRoutes: FastifyPluginAsyncZod = async (app) => {
	app.get("/rooms", async () => {
		const rooms = await db
			.select({
				id: schema.rooms.id,
				name: schema.rooms.name,
			})
			.from(schema.rooms)
			.orderBy(schema.rooms.createdAt);

		return rooms;
	});
};
