const templateSchemas = {
  createTemplate: {
    tags: ['Template'],
    body: {
      type: 'object',
      required: ['name', 'type', 'content'],
      properties: {
        name: { type: 'string', minLength: 3, maxLength: 100 },
        type: { type: 'string', enum: ['email', 'sms', 'push', 'inapp'] },
        content: { type: 'string', minLength: 5 },
        variables: {
          type: 'array',
          items: { type: 'string' },
          default: [],
        },
      },
      errorMessage: {
        required: {
          name: 'Template name is required',
          type: 'Template type is required',
          content: 'Template content is required',
        },
        properties: {
          name: 'Name must be a string between 3 and 100 characters',
          type: 'Type must be one of: email, sms, push, inapp',
          content: 'Content must be a valid string',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          content: { type: 'string' },
          variables: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },

  updateTemplate: {
    tags: ['Template'],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 3, maxLength: 100 },
        type: { type: 'string', enum: ['email', 'sms', 'push', 'inapp'] },
        content: { type: 'string', minLength: 5 },
        variables: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
  },

  getTemplateById: {
    tags: ['Template'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
  },

  deleteTemplate: {
    tags: ['Template'],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
  },

  listTemplates: {
    tags: ['Template'],
    querystring: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['email', 'sms', 'push', 'inapp'] },
        search: { type: 'string' },
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
    },
  },
};

export default templateSchemas;
