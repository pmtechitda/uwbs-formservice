import meterReplacement from './meter-replacement-routes/index.js'
import reconnection from './reconnection-routes/index.js'
import tanker from './tanker-routes/index.js'
import mutation from './mutation-routes/index.js'
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
  await fastify.register(mutation, { authRoute });
}

export default masterRoutes;
