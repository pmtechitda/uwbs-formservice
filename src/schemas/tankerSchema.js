const tankerSchema = {
  createTankerSchema: {
    tags: ["Tanker Service"],
    body: {
      type: "object",
      required: [
        "consumerNumber",
        "nameOfApplicant",
        "connectionNumber",
        "mobileNumber",
        "permanentAddress",
        "identityFile",
        "officialId",
      ],
      properties: {
        consumerNumber: { type: "string", minLength: 1 },
        nameOfApplicant: { type: "string", minLength: 1 },
        fatherName: { type: "string" },
        connectionNumber: { type: "string", minLength: 1 },
        mobileNumber: {
          type: "string",
          pattern: "^[0-9]{10}$",
        },
        permanentAddress: { type: "string", minLength: 3 },
        relationType: {
          type: "string",
          enum: ["Owner", "Tenant", "Family", "Other"],
          default: "Owner",
        },
        mutationReason: { type: "string" },
        ownershipStatus: {
          type: "string",
          enum: ["Owned", "Rented", "Leased", "Other"],
          default: "Owned",
        },
        identityFile: { type: "string" },
        officialId: { type: "string" },
        photo: { type: "string" },
        signature: { type: "string" },
      },
      errorMessage: {
        required: {
          consumerNumber: "Consumer Number is required",
          nameOfApplicant: "Name of Applicant is required",
          connectionNumber: "Connection Number is required",
          mobileNumber: "Mobile Number is required",
          permanentAddress: "Permanent Address is required",
          identityFile: "Identity File is required",
          officialId: "Official Id is required",
        },
        properties: {
          mobileNumber: "Mobile number must be 10 digits",
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
              consumerNumber: { type: "string" },
              nameOfApplicant: { type: "string" },
              connectionNumber: { type: "string" },
              mobileNumber: { type: "string" },
              permanentAddress: { type: "string" },
              relationType: { type: "string" },
              mutationReason: { type: "string" },
              ownershipStatus: { type: "string" },
              identityFile: { type: "string" },
              officialId: { type: "string" },
              photo: { type: "string" },
              signature: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  getTankerByIdSchema: {
    tags: ["Tanker Service"],
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
              nameOfApplicant: { type: "string" },
              fatherName: { type: "string" },
              connectionNumber: { type: "string" },
              mobileNumber: { type: "string" },
              permanentAddress: { type: "string" },
              relationType: { type: "string" },
              mutationReason: { type: "string" },
              ownershipStatus: { type: "string" },
              identityFile: { type: "string" },
              officialId: { type: "string" },
              photo: { type: "string" },
              signature: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  getAllTankerSchema: {
    tags: ["Tanker Service"],
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
        consumerNumber: { type: "string" },
        mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
      },
      additionalProperties: true,
      errorMessage: {
        properties: {
          page: "Page must be positive integer",
          limit: "Limit must be between 1 and 100",
          sortBy: "SortBy must be either createdAt or updatedAt",
          sortOrder: "SortOrder must be either asc or desc",
          mobileNumber: "Mobile Number must be 10 digits",
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
              tanker: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    consumerNumber: { type: "string" },
                    nameOfApplicant: { type: "string" },
                    connectionNumber: { type: "string" },
                    mobileNumber: { type: "string" },
                    ownershipStatus: { type: "string" },
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

  updateTankerSchema: {
    tags: ["Tanker Service"],
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
        consumerNumber: { type: "string" },
        nameOfApplicant: { type: "string" },
        fatherName: { type: "string" },
        connectionNumber: { type: "string" },
        mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        permanentAddress: { type: "string" },
        relationType: {
          type: "string",
          enum: ["Owner", "Tenant", "Family", "Other"],
        },
        mutationReason: { type: "string" },
        ownershipStatus: {
          type: "string",
          enum: ["Owned", "Rented", "Leased", "Other"],
        },
        identityFile: { type: "string" },
        officialId: { type: "string" },
        photo: { type: "string" },
        signature: { type: "string" },
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

  deleteTankerSchema: {
    tags: ["Tanker Service"],
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

export default tankerSchema;
