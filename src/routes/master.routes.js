import meterReplacement from './meter-replacement-routes/index.js'
import reconnection from './reconnection-routes/index.js'
import tanker from './tanker-routes/index.js'
async function masterRoutes(fastify, opts) {
  const authRoute = (schema = {}, tag = 'Misc') => ({
    preHandler: [fastify.authenticate],
    schema: {
      ...schema,
      tags: schema?.tags || [tag],
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(meterReplacement, { authRoute });
  await fastify.register(reconnection, { authRoute });
  await fastify.register(tanker, { authRoute });
}

export default masterRoutes;
