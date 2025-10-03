// routes/master.routes.js
import notification from './notification-routes/notification.route.js';

async function masterRoutes(fastify, opts) {
  const authRoute = (schema = {}, tag = 'Misc') => ({
    preHandler: [fastify.authenticate],
    schema: {
      ...schema,
      tags: schema?.tags || [tag],
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(notification, { authRoute });
}

export default masterRoutes;
