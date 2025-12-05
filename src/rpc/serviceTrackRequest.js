import amqp from 'amqplib';
import mongoose from 'mongoose';
import FormTrack from '../models/formTrack.js';

const QUEUE = 'service.track.request';

function buildQuery(req = {}) {
  const { serviceFormId, serviceNumber } = req;
  const or = [];

  if (serviceFormId && mongoose.Types.ObjectId.isValid(serviceFormId)) {
    or.push({ form_id: new mongoose.Types.ObjectId(serviceFormId) });
  }

  if (serviceNumber) {
    const ref = String(serviceNumber).trim();
    if (mongoose.Types.ObjectId.isValid(ref)) {
      or.push({ form_id: new mongoose.Types.ObjectId(ref) });
    }
    or.push({ applicationNo: ref });
  }

  if (!or.length) return null;
  return { $or: or };
}

export default async function startServiceTrackConsumer() {
  if (!process.env.RABBITMQ_URI) {
    throw new Error('Missing RABBITMQ_URI for service track consumer');
  }

  const conn = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await conn.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  channel.prefetch(20);

  const reply = (payload, replyTo, corr) => {
    if (!replyTo || !corr) return;
    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(payload)), {
      correlationId: corr,
      contentType: 'application/json',
    });
  };

  channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;

      const corr = msg.properties?.correlationId;
      const replyTo = msg.properties?.replyTo;

      try {
        const req = JSON.parse(msg.content.toString() || '{}');
        const query = buildQuery(req);

        if (!query) {
          throw new Error('Missing serviceNumber/serviceFormId');
        }

        const track = await FormTrack.findOne(query).lean();
        if (!track) {
          reply({ ok: false, error: 'Service form track not found' }, replyTo, corr);
          channel.ack(msg);
          return;
        }

        reply({ ok: true, data: track }, replyTo, corr);
      } catch (err) {
        reply({ ok: false, error: err?.message || 'Service form track fetch failed' }, replyTo, corr);
      } finally {
        channel.ack(msg);
      }
    },
    { noAck: false },
  );

  process.on('SIGINT', async () => {
    try {
      await channel.close();
      await conn.close();
    } finally {
      process.exit(0);
    }
  });
}
