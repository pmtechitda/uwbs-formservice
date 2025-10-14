const reconnectionSchema = {
  createReconnectionSchema: {
    tags: ["Reconnection"],
    body: {
      type: "object",
      required: ["consumer_id", "photo_id"],
      properties: {
        consumer_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        reason: {
          type: "string",
          minLength: 1,
        },
        photo_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        status: {
          type: "string",
          enum: ["Approve", "Pending", "Draft"],
          default: "Approve",
        },
      },
      errorMessage: {
        required: {
          consumer_id: "Consumer ID is required",
          photo_id: "Photo ID is required",
        },
        properties: {
          consumer_id: "Invalid consumer ID (must be ObjectId)",
          photo_id: "Invalid photo ID (must be ObjectId)",
        },
      },
    },
    response: {
      201: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              _id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
              consumer_id: { type: "string" },
              reason: { type: "string" },
              photo_id: { type: "string" },
              status: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  getReconnectionByIdSchema: {
    tags: ["Reconnection"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      },
      errorMessage: {
        required: { id: "Reconnection ID is required" },
        properties: { id: "Invalid ID format (must be ObjectId)" },
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
              _id: { type: "string" },
              consumer_id: { type: "string" },
              reason: { type: "string" },
              photo_id: { type: "string" },
              status: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  getAllReconnectionSchema: {
    tags: ["Reconnection"],
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        sortBy: {
          type: "string",
          enum: ["createdAt", "updatedAt"],
          default: "createdAt",
        },
        sortOrder: {
          type: "string",
          enum: ["asc", "desc"],
          default: "desc",
        },
        status: {
          type: "string",
          enum: ["Approve", "Pending", "Draft"],
        },
      },
      additionalProperties: false,
      errorMessage: {
        properties: {
          page: "Page must be a positive integer",
          limit: "Limit must be between 1 and 100",
          sortBy: "SortBy must be createdAt or updatedAt",
          sortOrder: "SortOrder must be asc or desc",
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
              reconnections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    consumer_id: { type: "string" },
                    reason: { type: "string" },
                    photo_id: { type: "string" },
                    status: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                  },
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

  updateReconnectionSchema: {
    tags: ["Reconnection"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      },
    },
    body: {
      type: "object",
      properties: {
        consumer_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        reason: { type: "string" },
        photo_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        status: {
          type: "string",
          enum: ["Approve", "Pending", "Draft"],
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
              _id: { type: "string" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  deleteReconnectionSchema: {
    tags: ["Reconnection"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      },
      errorMessage: {
        required: { id: "ID is required" },
        properties: {
          id: "Invalid ID format (must be MongoDB ObjectId)",
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  },
};

export default reconnectionSchema;
