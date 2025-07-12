import { fastifyCors } from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { fastify } from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from './env';
import { createQuestionsRoutes } from './http/routes/create-question.route';
import { createRoomRoutes } from './http/routes/create-room.route';
import { getRoomQuestionsRoutes } from './http/routes/get-room-questions.route';
import { getRoomsRoutes } from './http/routes/get-rooms.route';
import { uploadAudioRoutes } from './http/routes/upload-audio.route';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: 'http://localhost:5173',
});

app.register(fastifyMultipart);

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return 'Ok';
});

app.register(getRoomsRoutes);
app.register(createRoomRoutes);
app.register(getRoomQuestionsRoutes);
app.register(createQuestionsRoutes);
app.register(uploadAudioRoutes);

app
  .listen({ port: env.PORT })
  // biome-ignore lint/suspicious/noConsole: <explanation> ignore console
  .then(() => console.log('🚀 http server running!'));
