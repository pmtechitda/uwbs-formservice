// import amqp from "amqplib";

// export async function createChannel(url = process.env.RABBITMQ_URL) {
//   const conn = await amqp.connect(url);
//   const ch = await conn.createChannel();

//   // Exchanges
//   await ch.assertExchange("notifications", "topic", { durable: true });
//   await ch.assertExchange("notifications.retry", "topic", { durable: true });
//   await ch.assertExchange("notifications.failed", "fanout", { durable: true });

//   // Processing queue
//   await ch.assertQueue("notifications.processing", { durable: true });
//   await ch.bindQueue("notifications.processing", "notifications", "#");

//   // Retry queues with TTL
//   const retryDelays = [5000, 30000, 120000];  //5,3,120 seconds
//   for (let i = 0; i < retryDelays.length; i++) {
//     const q = `notifications.retry.${i + 1}`;
//     await ch.assertQueue(q, {
//       durable: true,
//       arguments: {
//         "x-dead-letter-exchange": "notifications",
//         "x-message-ttl": retryDelays[i]
//       }
//     });
//     await ch.bindQueue(q, "notifications.retry", "#");
//   }

//   // Failed queue
//   await ch.assertQueue("notifications.failed", { durable: true });
//   await ch.bindQueue("notifications.failed", "notifications.failed", "#");

//   return { conn, ch };
// }

import amqp from "amqplib";

export async function createChannel(url = process.env.RABBITMQ_URL) {
  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();

  // Prefetch to balance load
  ch.prefetch(10);

  // Exchanges
  await ch.assertExchange("notifications", "topic", { durable: true });
  await ch.assertExchange("notifications.retry", "topic", { durable: true });
  await ch.assertExchange("notifications.failed", "fanout", { durable: true });

  // Processing queue
  await ch.assertQueue("notifications.processing", { durable: true });
  await ch.bindQueue("notifications.processing", "notifications", "#");

  // Retry queues with TTL
  const retryDelays = [5000, 30000, 120000]; // 5s, 30s, 120s
  for (let i = 0; i < retryDelays.length; i++) {
    const q = `notifications.retry.${i + 1}`;
    await ch.assertQueue(q, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "notifications",
        "x-message-ttl": retryDelays[i],
      },
    });
    await ch.bindQueue(q, "notifications.retry", `retry.${i + 1}`);
  }

  // Failed queue
  await ch.assertQueue("notifications.failed", { durable: true });
  await ch.bindQueue("notifications.failed", "notifications.failed", "#");

  return { conn, ch };
}
