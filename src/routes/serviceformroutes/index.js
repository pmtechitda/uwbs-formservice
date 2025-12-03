// routes/serviceForm.routes.js
import serviceFormSchema from '../../schemas/serviceFormSchema.js';
import * as controller from '../../controllers/serviceForm-controller/index.js';

export default async function serviceFormRoutes(fastify, opts) {
  const { authRoute } = opts;

  fastify.get(
    '/serviceforms',
    authRoute(serviceFormSchema.getAllServiceFormsSchema, 'ServiceForm'),
    controller.getAllServiceForms
  );

  fastify.get(
    '/serviceforms/:id',
    authRoute(serviceFormSchema.getServiceFormByIdSchema, 'ServiceForm'),
    controller.getServiceFormById
  );

  fastify.get(
    '/serviceforms/:id/track',
    authRoute(serviceFormSchema.getServiceFormTrackSchema, 'ServiceForm'),
    controller.getServiceFormTrack
  );

  fastify.get(
    '/serviceforms/consumerNo',
    authRoute(serviceFormSchema.getServiceFormByConsumerNumberSchema, 'ServiceForm'),
    controller.getServiceFormByConsumerNumber
  );

  fastify.post(
    '/serviceforms',
    authRoute(serviceFormSchema.createServiceFormSchema, 'ServiceForm'),
    controller.createServiceForm
  );

  fastify.put(
    '/serviceforms/:id',
    authRoute(serviceFormSchema.updateServiceFormSchema, 'ServiceForm'),
    controller.updateServiceForm
  );

  fastify.patch(
    '/serviceforms/:id',
    authRoute(serviceFormSchema.patchServiceFormSchema, 'ServiceForm'),
    controller.patchServiceForm
  );

  fastify.delete(
    '/serviceforms/:id',
    authRoute(serviceFormSchema.deleteServiceFormSchema, 'ServiceForm'),
    controller.deleteServiceForm
  );

  fastify.post(
    '/serviceforms/bulk-delete',
    authRoute(serviceFormSchema.bulkDeleteServiceFormSchema, 'ServiceForm'),
    controller.bulkDeleteServiceForms
  );

}
