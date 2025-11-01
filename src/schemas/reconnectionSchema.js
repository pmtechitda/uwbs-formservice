const reconnectionSchema = {
  createReconnectionSchema: {
    tags: ["Reconnection/Disconnection Service"],
    body: {
      type: "object",
      required: [
        "nameOfApplicant",
        "connectionNumber",
        "mobileNumber",
        "permanentAddress",
        "identityFile",
        "officialId",
        
      ],
      properties: {
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
        serviceType: {
          type: "string",
          enum: ["Reconnection", "Disconnection"],
          default: null,
        },
        identityFile: { type: "string" },
        officialId: { type: "string" },
        photo: { type: "string" },
        signature: { type: "string" },
      },
      errorMessage: {
        required: {
          nameOfApplicant: "Name of Applicant is required",
          connectionNumber: "Connection Number is required",
          mobileNumber: "Mobile Number is required",
          permanentAddress: "Permanent Address is required",
          serviceType: "Service Type is required",
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
              serviceType: { type: "string" },
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

  getReconnectionByIdSchema: {
    tags: ["Reconnection/Disconnection Service"],
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
              serviceType: { type: "string" },
              identityFile: { type: "string" },
              officialId: { type: "string" },
              photo: { type: "string" },
              signature: { type: "string" },
              previousAmount: { type: "string" },
              charges: { type: "string" },
              totalAmount: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  getReconnectionByConsumerNumberSchema: {
    tags: ["Reconnection/Disconnection Service"],
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
                nameOfApplicant: { type: "string" },
                fatherName: { type: "string" },
                connectionNumber: { type: "string" },
                mobileNumber: { type: "string" },
                permanentAddress: { type: "string" },
                relationType: { type: "string" },
                mutationReason: { type: "string" },
                ownershipStatus: { type: "string" },
                serviceType: { type: "string" },
                identityFile: { type: "string" },
                officialId: { type: "string" },
                photo: { type: "string" },
                signature: { type: "string" },
                previousAmount: { type: "string" },
                charges: { type: "string" },
                totalAmount: { type: "string" },
                assignedTo: { type: "string" },
                submittedBy: { type: "string" },
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

  getAllReconnectionSchema: {
    tags: ["Reconnection/Disconnection Service"],
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
        status: { type: "string", enum: ["Approved", "Rejected", "Pending", "Draft"] },
        consumerNumber: { type: "string" },
        mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        serviceType:{type:"string", enum:["Reconnection", "Disconnection","All"]}
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
              reconnection: {
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
                    serviceType: { type: "string" },
                    previousAmount: { type: "string" },
                    charges: { type: "string" },
                    totalAmount: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    assignedTo: { type: "string" },
                    submittedBy: { type: "string" },
                    status: { type: "string" },
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
    tags: ["Reconnection/Disconnection Service"],
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
        serviceType: {
          type: "string",
          enum: ["Reconnection", "Disconnection"],
          default: null,
        },
        identityFile: { type: "string" },
        officialId: { type: "string" },
        photo: { type: "string" },
        signature: { type: "string" },
        previousAmount: { type: "string" },
        charges: { type: "string" },
        totalAmount: { type: "string" },
        assignedTo: { type: "string" },
        submittedBy: { type: "string" },
        status: { type: "string" },
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
              previousAmount: { type: "string" },
              charges: { type: "string" },
              totalAmount: { type: "string" },
              updatedAt: { type: "string", format: "date-time" },
              assignedTo: { type: "string" },
              submittedBy: { type: "string" },
              status: { type: "string" },
            },
          },
        },
      },
    },
  },

  deleteReconnectionSchema: {
    tags: ["Reconnection/Disconnection Service"],
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
  
  forwardRevertReconnectionSchema: {
    tags: ["Reconnection/Disconnection Service"],
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
            "meter_replacement"
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
          status: "Status is required"
        },
        properties: {
          old_user_id: "Invalid Old User ID format (must be MongoDB ObjectId)",
          new_user_id: "Invalid New User ID format (must be MongoDB ObjectId)",
          assign_to: "Invalid Assign To format (must be MongoDB ObjectId)"
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
              reconnection: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  consumerNumber: { type: "string" },
                  nameOfApplicant: { type: "string" },
                  connectionNumber: { type: "string" },
                  mobileNumber: { type: "string" },
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
};

export default reconnectionSchema;
