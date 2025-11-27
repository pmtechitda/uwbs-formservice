import Fastify from "fastify";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectRPC } from "./utils/rpcClient.js";
import masterRoutes from "./routes/master.routes.js";
import authPlugin from "./plugins/auth.js";
import errorHandler from "./utils/errorHandler.js";
import ajvErrors from "ajv-errors";
dotenv.config();

import  swagger  from '@fastify/swagger';
import  swaggerUI from '@fastify/swagger-ui';
const fastify = Fastify({ logger: true,
  ajv: {
        customOptions: {
          allErrors: true,
          strict: true,
        },
        plugins: [ajvErrors],
      },
});

async function start() {
  try {
    await fastify.register(authPlugin);
     await fastify.register(swagger, {
          swagger: {
            info: { title: 'Form Service API', version: '1.0.0' },
            schemes: ['http', 'https'],
            securityDefinitions: {
              bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description:
                  "Paste only your JWT token here (UI will add 'Bearer ' automatically).",
              },
            },
            security: [{ bearerAuth: [] }],
          },
        });
    await fastify.register(swaggerUI, { routePrefix: '/docs', exposeRoute: true });
    
    await fastify.register(masterRoutes, { prefix: "/api" });
    await mongoose.connect(process.env.MONGO_URI);
    await connectRPC();
    errorHandler(fastify);

    const port = Number(process.env.PORT) || 3003;
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Form Service Running On :${port}`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
