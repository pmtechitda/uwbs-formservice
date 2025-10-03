import Fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectRPC } from "./utils/rpcClient.js";
import masterRoutes from "./routes/master.routes.js";
import authPlugin from "./plugins/auth.js";
import errorHandler from "./utils/errorHandler.js";
import ajvErrors from "ajv-errors";
import pointOfView from "point-of-view";
import ejs from "ejs";
import { startNotificationWorker } from "./worker/index.js";
dotenv.config();

const fastify = Fastify({ logger: true,
  ajv: {
        customOptions: {
          allErrors: true,
          strict: true,
        },
        plugins: [ajvErrors],
      },
});
global.fastify = fastify;
await fastify.register(fastifyIO, { cors: { origin: "*" } });

// Socket.IO connection
fastify.io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("login", ({ userId }) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room user:${userId}`);
  });
});

async function start() {
  try {
    await fastify.register(pointOfView, {
      engine: { ejs },
      root: new URL("./views", import.meta.url).pathname,
      layout: "layout.ejs",
      viewExt: "ejs",      
    });
    await fastify.register(authPlugin);
    await fastify.register(masterRoutes, { prefix: "/api" });
    await mongoose.connect(process.env.MONGO_URI);
    await connectRPC();
    await startNotificationWorker();
    errorHandler(fastify);

    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Notification Service Running On :${port}`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
