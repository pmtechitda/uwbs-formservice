import amqp from 'amqplib'
import mongoose from 'mongoose'
import ServiceForm from '../models/serviceForm.js'

const QUEUE = 'service.status.update.request'

function isObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

function buildQuery(req = {}) {
  const { serviceFormId, serviceNumber } = req
  if (serviceFormId && isObjectId(serviceFormId)) {
    return { _id: new mongoose.Types.ObjectId(serviceFormId) }
  }
  if (serviceNumber) {
    if (isObjectId(serviceNumber)) {
      return { _id: new mongoose.Types.ObjectId(serviceNumber) }
    }
    return { applicationNo: String(serviceNumber) }
  }
  return null
}

function buildUpdate(req = {}) {
  const update = {}
  if (req.status) update.status = req.status
  if (req.sub_status) update.sub_status = req.sub_status
  if (typeof req.is_paid === 'boolean') update.is_paid = req.is_paid
  else update.is_paid = true // payment-service triggers this after a successful payment
  return update
}

export default async function startServiceStatusConsumer() {
  if (!process.env.RABBITMQ_URI) {
    throw new Error('Missing RABBITMQ_URI for service status consumer')
  }

  const conn = await amqp.connect(process.env.RABBITMQ_URI)
  const channel = await conn.createChannel()

  await channel.assertQueue(QUEUE, { durable: true })
  channel.prefetch(20)

  const reply = (payload, replyTo, corr) => {
    if (!replyTo || !corr) return
    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(payload)), {
      correlationId: corr,
      contentType: 'application/json',
    })
  }

  channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return

      const corr = msg.properties?.correlationId
      const replyTo = msg.properties?.replyTo

      try {
        const req = JSON.parse(msg.content.toString() || '{}')
        const query = buildQuery(req)

        if (!query) {
          throw new Error('Missing serviceNumber/serviceFormId')
        }
        if (!req.status) {
          throw new Error('Missing status')
        }

        const update = buildUpdate(req)
        const doc = await ServiceForm.findOneAndUpdate(
          query,
          { $set: update },
          { new: true },
        ).lean()

        if (!doc) {
          reply({ ok: false, error: 'Service form not found' }, replyTo, corr)
          channel.ack(msg)
          return
        }

        reply(
          {
            ok: true,
            data: {
              id: doc._id,
              status: doc.status,
              sub_status: doc.sub_status,
              is_paid: doc.is_paid,
            },
          },
          replyTo,
          corr,
        )
      } catch (err) {
        reply(
          { ok: false, error: err?.message || 'Service status update failed' },
          replyTo,
          corr,
        )
      } finally {
        channel.ack(msg)
      }
    },
    { noAck: false },
  )

  process.on('SIGINT', async () => {
    try {
      await channel.close()
      await conn.close()
    } finally {
      process.exit(0)
    }
  })
}
