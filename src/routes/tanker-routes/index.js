// routes/meterReplacement.routes.js
import tankerSchema from '../../schemas/tankerSchema.js';
import * as controller from '../../controllers/tanker/index.js';

export default async function TankerRoutes(fastify, opts) {
  const { authRoute } = opts;

  fastify.get(
    '/tanker',
    authRoute(tankerSchema.getAllTankerSchema, 'Tanker'),
    controller.getAllTankers
  );

  fastify.get(
    '/tanker/:id',
    authRoute(tankerSchema.getTankerByIdSchema, 'Tanker'),
    controller.getTankerById
  );

  fastify.post(
    '/tanker',
    authRoute(tankerSchema.createTankerSchema, 'Tanker'),
    controller.createTanker
  );

  fastify.put(
    '/tanker/:id',
    authRoute(tankerSchema.updateTankerSchema, 'Tanker'),
    controller.updateTanker
  );

  fastify.delete(
    '/tanker/:id',
    authRoute(tankerSchema.deleteTankerSchema, 'Tanker'),
    controller.deleteTanker
  );
}
