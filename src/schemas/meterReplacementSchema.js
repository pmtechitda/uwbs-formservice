const meterReplacementSchema = {
  createMeterReplacementSchema: {
    tags: ["Meter Replacement"],
    body: {
      type: "object",
      required: ["photo_id"],
      properties: {
        reason: { type: "string" },
        photo_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        status: {
          type: "string",
          enum: ["Approved", "Rejected", "Pending", "Draft"],
          default: "Draft",
        },
      },
      errorMessage: {
        required: {
          photo_id: "Photo ID is required",
        },
        properties: {
          photo_id: "Invalid Photo ID format (must be MongoDB ObjectId)",
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
              _id: { type: "string" },
              consumerNumber: { type: "string" },
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

  getMeterReplacementByIdSchema: {
    tags: ["Meter Replacement"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      },
      errorMessage: {
        required: { id: "ID is required" },
        properties: { id: "Invalid ID format (must be MongoDB ObjectId)" },
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
              consumerNumber: { type: "string" },
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

  getMeterReplacementByConsumerNumberSchema: {
    tags: ["Meter Replacement"],
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                consumerNumber: { type: "string" },
                reason: { type: "string" },
                photo_id: { type: "string" },
                status: { type: "string" },
                assignedTo: { type: "string", nullable: true }, // optional field
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },

  getAllMeterReplacementSchema: {
    tags: ["Meter Replacement"],
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
        sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
        status: {
          type: "string",
          enum: ["Approved", "Rejected", "Pending", "Draft"],
        },
      },
      additionalProperties: true,
      errorMessage: {
        properties: {
          page: "Page must be positive integer",
          limit: "Limit must be between 1 and 100",
          sortBy: "SortBy must be either createdAt or updatedAt",
          sortOrder: "SortOrder must be either asc or desc",
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
              meterReplacements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    consumerNumber: { type: "string" },
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

  updateMeterReplacementSchema: {
    tags: ["Meter Replacement"],
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
        reason: { type: "string" },
        photo_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        status: {
          type: "string",
          enum: ["Approved", "Rejected", "Pending", "Draft"],
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

  forwardRevertMeterReplacementSchema: {
    tags: ["Meter Replacement"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
      },
    },
    body: {
      type: "object",
      required: ["formName", "status"],
      properties: {
        formName: {
          type: "string",
          enum: [
            "reconnection",
            "disconnection",
            "mutation",
            "tanker",
            "meter_replacement",
          ],
        },
        old_user_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        new_user_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        comment: { type: "string", default: "" },
        assign_to: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        status: {
          type: "string",
          enum: ["Forward", "Revert"],
        },
      },
      errorMessage: {
        required: {
          formName: "Form Name is required",
          assign_to: "Assign To is required",
          status: "Status is required",
        },
        properties: {
          old_user_id: "Invalid Old User ID format (must be MongoDB ObjectId)",
          new_user_id: "Invalid New User ID format (must be MongoDB ObjectId)",
          assign_to: "Invalid Assign To format (must be MongoDB ObjectId)",
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
              meterReplacement: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  consumerNumber: { type: "string" },
                  reason: { type: "string" },
                  photo_id: { type: "string" },
                  assignedTo: { type: "string" },
                  status: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              track: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  form_id: { type: "string" },
                  formName: { type: "string" },
                  old_user_id: { type: "string" },
                  new_user_id: { type: "string" },
                  comment: { type: "string" },
                  submitted_by: { type: "string" },
                  assign_to: { type: "string" },
                  status: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },

  deleteMeterReplacementSchema: {
    tags: ["Meter Replacement"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      },
      errorMessage: {
        required: { id: "ID is required" },
        properties: { id: "Invalid ID format (must be MongoDB ObjectId)" },
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

export default meterReplacementSchema;
