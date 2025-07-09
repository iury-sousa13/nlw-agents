import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { getRoomsRoutes } from "./http/routes/get-rooms.routes";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
	origin: "http://localhost:5173",
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/health", async () => {
	return "OK";
});

app.register(getRoomsRoutes);

app
	.listen({ port: env.PORT })
	.then(() => console.log("🚀 http server running!"));
