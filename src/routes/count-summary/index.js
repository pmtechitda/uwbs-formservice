// routes/meterReplacement.routes.js
import * as controller from '../../controllers/count-summary-controller/index.js';

export default async function meterReplacementRoutes(fastify, opts) {
  const { authRoute } = opts;

  // Schema for individual status counts (simple object with status: count)
  const statusCountsSchema = {
    type: "object",
    properties: {
      Pending: { type: "number" },
      Approved: { type: "number" },
      Rejected: { type: "number" },
      Draft: { type: "number" }
    },
    additionalProperties: false
  };

  // Schema for each form type (e.g., meterReplacement, mutation, etc.)
  const formTypeSchema = {
    type: "object",
    properties: {
      statusCounts: statusCountsSchema,
      total: { type: "number" }
    },
    required: ["statusCounts", "total"],
    additionalProperties: false
  };

  const getFormServicesCountSchema = {
    tags: ["application"],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              meterReplacement: formTypeSchema,
              mutation: formTypeSchema,
              reconnection: formTypeSchema,
              tanker: formTypeSchema,
              grandTotal: { type: "number" }
            },
            required: ["meterReplacement", "mutation", "reconnection", "tanker", "grandTotal"],
            additionalProperties: false
          }
        },
        required: ["success", "message", "data"],
        additionalProperties: false
      }
    }
  };
  
  fastify.get(
    '/form-services/count',
    authRoute(getFormServicesCountSchema, 'Form Service Count'),
    controller.getFormCountByStatus  // Updated controller name
  );
}