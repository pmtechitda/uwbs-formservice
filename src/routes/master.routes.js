import serviceForm from './serviceformroutes/index.js'
import serviceFormCount from './count-summary/index.js'

async function masterRoutes(fastify, opts) {
  const authRoute = (schema = {}, tag = 'Misc') => ({
    preHandler: [fastify.authenticate],
    schema: {
      ...schema,
      tags: schema?.tags || [tag],
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(serviceForm, { authRoute });


  await fastify.register(serviceFormCount, { authRoute });
}

export default masterRoutes;
