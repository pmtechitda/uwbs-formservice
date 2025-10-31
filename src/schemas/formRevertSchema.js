const formRevertSchema = {
    tags: ["Forms Forward/Revert"],
    body: {
      type: "object",
      required: ["form_id", "formName", "assign_to"],
      properties: {
        form_id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
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
          default: "Revert",
        },
      },
      errorMessage: {
        required: {
          form_id: "Form ID is required",
          formName: "Form Name is required",
          assign_to: "Assign To is required"
        },
        properties: {
          form_id: "Invalid Form ID format (must be MongoDB ObjectId)",
          old_user_id: "Invalid Old User ID format (must be MongoDB ObjectId)",
          new_user_id: "Invalid New User ID format (must be MongoDB ObjectId)",
          assign_to: "Invalid Assign To format (must be MongoDB ObjectId)"
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
  }

export default formRevertSchema;