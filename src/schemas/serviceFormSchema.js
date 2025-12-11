// schemas/serviceFormSchema.js
const serviceFormSchemas = {
  // Create
  createServiceFormSchema: {
    tags: ["ServiceForm"],
    body: {
      type: "object",
      required: [
        "serviceType",
        "consumerNumber",
        "current_name",
        "current_mobileNumber",
        "department_id",
        "departmentName",
        "division_id",
        "division_name",
        "area_type",
      ],
      properties: {
        serviceType: {
          type: "string",
          enum: ["MeterReplacement", "Mutation", "Reconnection", "Tanker", "Disconnection", "Address Change", "Mobile Update", "Connection Change", "Meter Size Update"],
        },
        department_id: { type: "string" },
        departmentName: { type: "string", minLength: 1 },
        division_id: { type: "string"  },
        division_name: { type: "string", minLength: 1 },
        collection_center_id: { type: "string"  },
        collection_center_name: { type: "string", minLength: 1 },
        area_type: { type: "string", enum: ["Urban", "Rural"] },
        consumer_id: { type: "string"  },
        consumerNumber: { type: "string", minLength: 1 },

        current_name: { type: "string", minLength: 1 },
        current_fatherName: { type: "string" },
        current_mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        current_address: { type: "string" },
        current_district: { type: "string" },
        current_area: { type: "string" },
        current_muncapilty_type: { type: "string" },
        current_munciplaty: { type: "string" },
        current_ward: { type: "string" },
        current_block: { type: "string" },
        current_grampanchayt: { type: "string" },
        current_village: { type: "string" },

        new_name: { type: "string" },
        new_fatherName: { type: "string" },
        new_mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        new_address: { type: "string" },
        new_district: { type: "string" },
        new_area: { type: "string" },
        new_muncapilty_type: { type: "string" },
        new_munciplaty: { type: "string" },
        new_ward: { type: "string" },
        new_block: { type: "string" },
        new_grampanchayt: { type: "string" },
        new_village: { type: "string" },

        reason: { type: "string" },
        disconnection_date: { type: "string", format: "date-time" },
        reconnection_date: { type: "string", format: "date-time" },

        meter_number: { type: "string" },
        meter_size: { type: "string" },
        meter_location: { type: "string" },
        old_meter_size: { type: "string" },
        new_meter_size: { type: "string" },

        tanker_date: { type: "string", format: "date-time" },
        tanker_time: { type: "string" },
        tanker_quantity: { type: "string" },

        old_connection_category: { type: "string" },
        new_connection_category: { type: "string" },

        documents: {
          type: "object",
          properties: {
            idProof: { type: "string" },
            selfPhoto: { type: "string" },
            registryDocument: { type: "string" },
            stampPaper: { type: "string" },
          },
          additionalProperties: false,
        },

        is_paid: { type: "boolean", default: false },
        previousAmount: { type: "string" },
        charges: { type: "string" },
        otherCharges: { type: "string" },
        totalAmount: { type: "string" },

        assignedTo: { type: "string" },
        submittedBy: { type: "string" },
        submittedType: {
          type: "string",
          enum: ["Consumer", "RO", "CSC", "Apuni Sarkar"],
        },

        status: {
          type: "string",
          enum: ["Approved", "Rejected", "Pending", "Draft", "Processing"],
          default: "Draft",
        },
        sub_status: {
          type: "string",
            enum: [
            "Draft",
            "Application Received",
            "Under Verification",
            "RO Forward to JE",
            "JE Revert to RO",
            "Under Inspection",
            "Approved",
            "Rejected",
            "Pending Payment",
            "AE Forward to EE",
            "EE Forward to SE",
          ],
        },
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          serviceType: "Service type is required",
          consumerNumber: "Consumer number is required",
          current_name: "Current name is required",
          current_mobileNumber: "Current mobile number is required",
          department_id: "Department is required",
          departmentName: "Department name is required",
          division_id: "Division is required",
          division_name: "Division name is required",
          collection_center_id: "Collection center is required",
          collection_center_name: "Collection center name is required",
          area_type: "Area type is required",
        },
        properties: {
          current_mobileNumber: "Current mobile number must be 10 digits",
          new_mobileNumber: "New mobile number must be 10 digits",
          consumer_id: "Invalid consumer_id (must be MongoDB ObjectId)",
          department_id: "Invalid department_id (must be MongoDB ObjectId)",
          division_id: "Invalid division_id (must be MongoDB ObjectId)",
          collection_center_id: "Invalid collection_center_id (must be MongoDB ObjectId)",
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
              _id: { type: "string"  },
               applicationNumber: { type: "string" },
              serviceType: { type: "string" },
              consumerNumber: { type: "string" },
              current_name: { type: "string" },
              current_mobileNumber: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },

  // Get by ID
  getServiceFormByIdSchema: {
    tags: ["ServiceForm"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string"  },
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
               applicationNumber: { type: "string" },
              serviceType: { type: "string" },
              consumerNumber: { type: "string" },
              consumer_id: { type: "string" },
              current_name: { type: "string" },
              current_fatherName: { type: "string" },
              current_mobileNumber: { type: "string" },
              new_name: { type: "string" },
              new_fatherName: { type: "string" },
              new_mobileNumber: { type: "string" },
              reason: { type: "string" },
              documents: {
                type: "object",
                properties: {
                  idProof: { type: "string" },
                  selfPhoto: { type: "string" },
                  registryDocument: { type: "string" },
                  stampPaper: { type: "string" },
                },
              },
              is_paid: { type: "boolean" },
              previousAmount: { type: "string" },
              charges: { type: "string" },
              otherCharges: { type: "string" },
              totalAmount: { type: "string" },
              assignedTo: { type: "string" },
              submittedBy: { type: "string" },
              submittedType: { type: "string" },
              status: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              track: {
                anyOf: [
                  {
                    type: "object",
                    properties: {  applicationNumber: { type: "string" } },
                    additionalProperties: true,
                  },
                  { type: "null" },
                ],
              },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },

  // Get tracking info
  getServiceFormTrackSchema: {
    tags: ["ServiceForm"],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string"  },
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
               applicationNumber: { type: "string" },
              form_id: { type: "string" },
              status: { type: "string" },
              sub_status: { type: "string" },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },

  // Get by consumerNumber (query param)
  getServiceFormByConsumerNumberSchema: {
    tags: ["ServiceForm"],
    querystring: {
      type: "object",
      required: ["consumerNumber"],
      properties: {
        consumerNumber: { type: "string", minLength: 1 },
      },
      errorMessage: {
        required: { consumerNumber: "consumerNumber is required" },
      },
    },
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
                   applicationNumber: { type: "string" },
                  serviceType: { type: "string" },
                  consumerNumber: { type: "string" },
                  current_name: { type: "string" },
                current_mobileNumber: { type: "string" },
                assignedTo: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                track: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {  applicationNumber: { type: "string" } },
                      additionalProperties: true,
                    },
                    { type: "null" },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },

  // List (with filtering, pagination, sorting)
  getAllServiceFormsSchema: {
    tags: ["ServiceForm"],
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

        status: { type: "string", enum: ["All", "Approved", "Rejected", "Pending", "Draft", "Processing"] },
        serviceType: { type: "string", enum: ["All", "MeterReplacement", "Mutation", "Reconnection", "Tanker", "Disconnection", "Address Change", "Mobile Update", "Connection Change", "Meter Size Update"] },
         applicationNumber: { type: "string" },
        q: { type: "string" },
        consumerNumber: { type: "string" },
        mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        assignedTo: { type: "string" },
        submittedBy: { type: "string" },
        is_paid: { type: "string", enum: ["true", "false", "All"] },
        department_id: { type: "string"  },
        division_id: { type: "string"  },
        collection_center_id: { type: "string"  },
        area_type: { type: "string", enum: ["Urban", "Rural"] },
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
              serviceForms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                     applicationNumber: { type: "string" },
                    serviceType: { type: "string" },
                    consumerNumber: { type: "string" },
                    current_name: { type: "string" },
                    current_mobileNumber: { type: "string" },
                    assignedTo: { type: "string" },
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

  // Update (PUT - full replace)
  updateServiceFormSchema: {
    tags: ["ServiceForm"],
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string"  } },
      errorMessage: {
        required: { id: "ID is required" },
        properties: { id: "Invalid ID format (must be MongoDB ObjectId)" },
      },
    },
    body: {
      type: "object",
      properties: {
        serviceType: {
          type: "string",
          enum: ["MeterReplacement", "Mutation", "Reconnection", "Tanker", "Disconnection", "Address Change", "Mobile Update", "Connection Change", "Meter Size Update"],
        },
        department_id: { type: "string"  },
        departmentName: { type: "string" },
        division_id: { type: "string"  },
        division_name: { type: "string" },
        collection_center_id: { type: "string"  },
        collection_center_name: { type: "string" },
        area_type: { type: "string", enum: ["Urban", "Rural"] },
        consumer_id: { type: "string"  },
        consumerNumber: { type: "string" },

        current_name: { type: "string" },
        current_fatherName: { type: "string" },
        current_mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        current_address: { type: "string" },
        current_district: { type: "string" },
        current_area: { type: "string" },
        current_muncapilty_type: { type: "string" },
        current_munciplaty: { type: "string" },
        current_ward: { type: "string" },
        current_block: { type: "string" },
        current_grampanchayt: { type: "string" },
        current_village: { type: "string" },

        new_name: { type: "string" },
        new_fatherName: { type: "string" },
        new_mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        new_address: { type: "string" },
        new_district: { type: "string" },
        new_area: { type: "string" },
        new_muncapilty_type: { type: "string" },
        new_munciplaty: { type: "string" },
        new_ward: { type: "string" },
        new_block: { type: "string" },
        new_grampanchayt: { type: "string" },
        new_village: { type: "string" },

        reason: { type: "string" },
        disconnection_date: { type: "string", format: "date-time" },
        reconnection_date: { type: "string", format: "date-time" },

        meter_number: { type: "string" },
        meter_size: { type: "string" },
        meter_location: { type: "string" },
        old_meter_size: { type: "string" },
        new_meter_size: { type: "string" },

        tanker_date: { type: "string", format: "date-time" },
        tanker_time: { type: "string" },
        tanker_quantity: { type: "string" },

        old_connection_category: { type: "string" },
        new_connection_category: { type: "string" },

        documents: {
          type: "object",
          properties: {
            idProof: { type: "string" },
            selfPhoto: { type: "string" },
            registryDocument: { type: "string" },
            stampPaper: { type: "string" },
          },
          additionalProperties: false,
        },

        is_paid: { type: "boolean" },
        previousAmount: { type: "string" },
        charges: { type: "string" },
        otherCharges: { type: "string" },
        totalAmount: { type: "string" },

        assignedTo: { type: "string" },
        submittedBy: { type: "string" },
        submittedType: { type: "string", enum: ["Consumer", "RO", "CSC", "Apuni Sarkar"] },

        status: { type: "string", enum: ["Approved", "Rejected", "Pending", "Draft", "Processing"] },
        sub_status: {
          type: "string",
          enum: [
            "Draft",
            "Application Received",
            "Under Verification",
            "RO Forward to JE",
            "JE Revert to RO",
            "Under Inspection",
            "Approved",
            "Rejected",
            "Pending Payment",
            "AE Forward to EE",
            "EE Forward to SE",
          ],
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
               applicationNumber: { type: "string" },
              updatedAt: { type: "string", format: "date-time" },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },

  // Patch (partial update)
  patchServiceFormSchema: {
    tags: ["ServiceForm"],
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string"  } },
    },
    body: {
      type: "object",
      properties: {
        department_id: { type: "string"  },
        departmentName: { type: "string" },
        division_id: { type: "string"  },
        division_name: { type: "string" },
        collection_center_id: { type: "string"  },
        collection_center_name: { type: "string" },
        area_type: { type: "string", enum: ["Urban", "Rural"] },
        current_name: { type: "string" },
        current_fatherName: { type: "string" },
        current_mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        current_address: { type: "string" },
        current_district: { type: "string" },
        current_area: { type: "string" },
        current_muncapilty_type: { type: "string" },
        current_munciplaty: { type: "string" },
        current_ward: { type: "string" },
        current_block: { type: "string" },
        current_grampanchayt: { type: "string" },
        current_village: { type: "string" },
        new_name: { type: "string" },
        new_fatherName: { type: "string" },
        new_mobileNumber: { type: "string", pattern: "^[0-9]{10}$" },
        new_address: { type: "string" },
        new_district: { type: "string" },
        new_area: { type: "string" },
        new_muncapilty_type: { type: "string" },
        new_munciplaty: { type: "string" },
        new_ward: { type: "string" },
        new_block: { type: "string" },
        new_grampanchayt: { type: "string" },
        new_village: { type: "string" },
        reason: { type: "string" },
        disconnection_date: { type: "string", format: "date-time" },
        reconnection_date: { type: "string", format: "date-time" },
        meter_number: { type: "string" },
        meter_size: { type: "string" },
        meter_location: { type: "string" },
        old_meter_size: { type: "string" },
        new_meter_size: { type: "string" },
        tanker_date: { type: "string", format: "date-time" },
        tanker_time: { type: "string" },
        tanker_quantity: { type: "string" },
        old_connection_category: { type: "string" },
        new_connection_category: { type: "string" },
        documents: {
          type: "object",
          properties: {
            idProof: { type: "string" },
            selfPhoto: { type: "string" },
            registryDocument: { type: "string" },
            stampPaper: { type: "string" },
          },
        },
        is_paid: { type: "boolean" },
        previousAmount: { type: "string" },
        charges: { type: "string" },
        otherCharges: { type: "string" },
        totalAmount: { type: "string" },
        assignedTo: { type: "string" },
        submittedBy: { type: "string" },
        submittedType: { type: "string", enum: ["Consumer", "RO", "CSC", "Apuni Sarkar"] },
        status: { type: "string", enum: ["Approved", "Rejected", "Pending", "Draft", "Processing"] },
        sub_status: {
          type: "string",
          enum: [
            "Draft",
            "Application Received",
            "Under Verification",
            "RO Forward to JE",
            "JE Revert to RO",
            "Under Inspection",
            "Approved",
            "Rejected",
            "Pending Payment",
            "AE Forward to EE",
            "EE Forward to SE",
          ],
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
               applicationNumber: { type: "string" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  // Delete
  deleteServiceFormSchema: {
    tags: ["ServiceForm"],
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string"  } },
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
            properties: {  applicationNumber: { type: "string" } },
            additionalProperties: false,
          },
        },
      },
    },
  },

  // Bulk delete
  bulkDeleteServiceFormSchema: {
    tags: ["ServiceForm"],
    body: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: {
          type: "array",
          items: { type: "string"  },
          minItems: 1,
        },
      },
      errorMessage: { required: { ids: "ids array is required" } },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          deletedCount: { type: "integer" },
           applicationNumbers: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

export default serviceFormSchemas;
