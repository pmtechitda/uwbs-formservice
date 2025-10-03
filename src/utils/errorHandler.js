export default function (fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    // Handle AJV validation errors
    if (error.validation) {
      const messages = error.validation.map((err) => {
        const field =
          err.instancePath.replace('/', '') || err.params.missingProperty

        return {
          field,
          message: err.message || error.message,
        }
      })

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        messages,
      })
    }

    // Handle other errors
    reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || 'Internal Server Error',
      message: error.message,
    })
  })
}
