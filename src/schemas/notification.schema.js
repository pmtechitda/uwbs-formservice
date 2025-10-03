const notificationSchema = {
 getAllNotificationSchema :{
  tags: ["Notification"],
  querystring: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      sortBy: { type: "string", enum: ["createdAt", "updatedAt"], default: "createdAt" },
      sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
      userId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      type: { type: "string", enum: ["email", "sms", "push"] }, // extend as needed
      status: { type: "string", enum: ["pending", "sent", "failed"] },
    },
    additionalProperties: true, // allow extra query filters if buildFilter() supports
    errorMessage: {
      properties: {
        page: "Page must be a positive number",
        limit: "Limit must be between 1 and 100",
        sortBy: "SortBy must be either createdAt or updatedAt",
        sortOrder: "SortOrder must be either asc or desc",
        userId: "User Id must be a valid MongoDB ObjectId",
        type: "Type must be one of: email, sms, push",
        status: "Status must be one of: pending, sent, failed",
      },
    },
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
            notification: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                  userId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                  type: { type: "string", enum: ["email", "sms", "push"] },
                  templateId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                  payload: { type: "object" },
                  status: { type: "string", enum: ["pending", "sent", "failed"] },
                  attempts: { type: "integer", minimum: 0 },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                  __v: { type: "integer" },
                },
                required: ["_id", "userId", "type", "payload", "status", "createdAt"],
              },
            },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
},

  emitNotification: {
    tags: ['Notification'],
    body: {
      type: 'object',
      required: ['userId', 'payload'],
      properties: {
        userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        payload: { type: 'object' },
      },
      errorMessage: {
        required: {
          userId: 'User Id is required',
          payload: 'Payload is required',
        },
        properties: {
          userId: 'User Id must be a string with max length 20',
          payload: 'Payload must be an object',
        },
      },
    },
  },
};

export default notificationSchema;
