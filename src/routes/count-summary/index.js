// routes/meterReplacement.routes.js
import * as controller from '../../controllers/count-summary-controller/index.js';

export default async function meterReplacementRoutes(fastify, opts) {
  const { authRoute } = opts;

  const statusCountsSchema = {
    type: "object",
    properties: {
      Pending: { type: "number" },
      Approved: { type: "number" },
      Rejected: { type: "number" },
      Draft: { type: "number" },
      Processing: { type: "number" },
    },
    additionalProperties: false,
    required: ["Pending", "Approved", "Rejected", "Draft", "Processing"],
  };

  const getFormServicesCountSchema = {
    tags: ["application"],
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["All", "MeterReplacement", "Mutation", "Reconnection", "Tanker"],
          default: "All",
        },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              statusCounts: statusCountsSchema,
              total: { type: "number" },
            },
            required: ["statusCounts", "total"],
            additionalProperties: false,
          },
        },
        required: ["success", "message", "data"],
        additionalProperties: false,
      },
    },
  };
  
  fastify.get(
    '/form-services/count',
    authRoute(getFormServicesCountSchema, 'Form Service Count'),
    controller.getFormCountByStatus  // Updated controller name
  );
}
