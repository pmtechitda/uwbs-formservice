// routes/meterReplacement.routes.js
import mutation from '../../schemas/mutationSchema.js';
import * as controller from '../../controllers/mutation-controller/index.js';
export default async function mutationRoutes(fastify, opts) {
  const { authRoute } = opts;

  fastify.get(
    '/mutation',
    authRoute(mutation.getAllMutationSchema, 'Mutation'),
    controller.getAllMutations
  );

  fastify.get(
    '/mutation/:id',
    authRoute(mutation.getMutationByIdSchema, 'Mutation'),
    controller.getMutationById
  );

  fastify.get(
    '/mutation/consumerNo',
    authRoute(mutation.getMutationByConsumerNumberSchema, 'Mutation'),
    controller.getMutationByConsumerNumber
  );

  fastify.post(
    '/mutation',
    authRoute(mutation.createMutationSchema, 'Mutation'),
    controller.createMutation
  );

  fastify.put(
    '/mutation/:id',
    authRoute(mutation.updateMutationSchema, 'Mutation'),
    controller.updateMutation
  );

  fastify.delete(
    '/mutation/:id',
    authRoute(mutation.deleteMutationSchema, 'Mutation'),
    controller.deleteMutation
  );
  
  fastify.patch(
    '/mutation/forward-revert/:id',
    authRoute(mutation.forwardRevertMutationSchema, 'Mutation'),
    controller.forwardRevertMutation
  );
}
