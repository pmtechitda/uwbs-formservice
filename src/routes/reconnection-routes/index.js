// routes/meterReplacement.routes.js
import reconnection from '../../schemas/reconnectionSchema.js';
import * as controller from '../../controllers/reconnection-controller/index.js';

export default async function reconnectionRoutes(fastify, opts) {
  const { authRoute } = opts;

  fastify.get(
    '/reconnection',
    authRoute(reconnection.getAllReconnectionSchema, 'Reconnection'),
    controller.getAllReconnections
  );

  fastify.get(
    '/reconnection/:id',
    authRoute(reconnection.getReconnectionByIdSchema, 'Reconnection'),
    controller.getReconnectionById
  );

  fastify.post(
    '/reconnection',
    authRoute(reconnection.createReconnectionSchema, 'Reconnection'),
    controller.createReconnection
  );

  fastify.put(
    '/reconnection/:id',
    authRoute(reconnection.updateReconnectionSchema, 'Reconnection'),
    controller.updateReconnection
  );

  fastify.delete(
    '/reconnection/:id',
    authRoute(reconnection.deleteReconnectionSchema, 'Reconnection'),
    controller.deleteReconnection
  );
}
