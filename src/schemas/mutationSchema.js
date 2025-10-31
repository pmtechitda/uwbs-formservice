const mutationSchemas = {
    createMutationSchema: {
      tags: ["Mutation Service"],
      body: {
        type: "object",
        required: [
          "nameOfApplicant",
          "connectionNumber",
          "mobileNumber",
          "permanentAddress",
          "ownershipFile",
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
          mutationReason: { type: "string" },
          ownershipStatus: {
            type: "string",
            enum: ["Owner", "Tenant"],
            default: "Owner",
          },
          ownershipFile: { type: "string" },
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
            ownershipFile: "Ownership File is required",
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
                mutationReason: { type: "string" },
                ownershipStatus: { type: "string" },
                ownershipFile: { type: "string" },
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
  
    getMutationByIdSchema: {
      tags: ["Mutation Service"],
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
                mutationReason: { type: "string" },
                ownershipStatus: { type: "string" },
                ownershipFile: { type: "string" },
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
  
    getMutationByConsumerNumberSchema: {
      tags: ["Mutation Service"],
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
                  mutationReason: { type: "string" },
                  ownershipStatus: { type: "string" },
                  ownershipFile: { type: "string" },
                  identityFile: { type: "string" },
                  officialId: { type: "string" },
                  photo: { type: "string" },
                  signature: { type: "string" },
                  assignedTo: { type: "string" },
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

    getAllMutationSchema: {
      tags: ["Mutation Service"],
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
          ownershipStatus:{type:"string", enum:["Owner", "Tenant","All"]}
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
                mutation: {
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
                      ownershipFile: { type: "string" },
                      identityFile: { type: "string" },
                      officialId: { type: "string" },
                      photo: { type: "string" },
                      signature: { type: "string" },
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
  
    updateMutationSchema: {
      tags: ["Mutation Service"],
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
          mutationReason: { type: "string" },
          ownershipStatus: {
            type: "string",
            enum: ["Owner", "Tenant"],
          },
          identityFile: { type: "string" },
          officialId: { type: "string" },
          photo: { type: "string" },
          signature: { type: "string" },
          ownershipFile: { type: "string" },
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
                ownershipFile: { type: "string" },
                identityFile: { type: "string" },
                officialId: { type: "string" },
                photo: { type: "string" },
                signature: { type: "string" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  
    deleteMutationSchema: {
      tags: ["Mutation Service"],
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
  
    forwardRevertMutationSchema: {
      tags: ["Mutation Service"],
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
                mutation: {
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
  
  export default mutationSchemas;
  