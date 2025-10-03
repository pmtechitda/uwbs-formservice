// routes/notification-routes/notification.route.js
import notificationSchema from '../../schemas/notification.schema.js';
import * as controller from '../../controllers/notification-controller/index.js';

export default async function notificationRoutes(fastify, opts) {
  const { authRoute } = opts;
  fastify.get('/notifications/all',authRoute(notificationSchema.getAllNotificationSchema, 'Notifications'),controller.getAllNotification);
  fastify.post('/emit',authRoute(notificationSchema.emitNotification, 'Notifications'),controller.emitNotification);
}
