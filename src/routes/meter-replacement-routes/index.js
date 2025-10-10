// routes/meterReplacement.routes.js
import meterReplacementSchema from '../../schemas/meterReplacementSchema.js';
import * as controller from '../../controllers/meter-replacement-controller/index.js';

export default async function meterReplacementRoutes(fastify, opts) {
  const { authRoute } = opts;

  fastify.get(
    '/meter-replacements',
    authRoute(meterReplacementSchema.getAllMeterReplacementSchema, 'Meter Replacement'),
    controller.getAllMeterReplacements
  );

  fastify.get(
    '/meter-replacements/:id',
    authRoute(meterReplacementSchema.getMeterReplacementByIdSchema, 'Meter Replacement'),
    controller.getMeterReplacementById
  );

  fastify.post(
    '/meter-replacements',
    authRoute(meterReplacementSchema.createMeterReplacementSchema, 'Meter Replacement'),
    controller.createMeterReplacement
  );

  fastify.put(
    '/meter-replacements/:id',
    authRoute(meterReplacementSchema.updateMeterReplacementSchema, 'Meter Replacement'),
    controller.updateMeterReplacement
  );

  fastify.delete(
    '/meter-replacements/:id',
    authRoute(meterReplacementSchema.deleteMeterReplacementSchema, 'Meter Replacement'),
    controller.deleteMeterReplacement
  );
}
