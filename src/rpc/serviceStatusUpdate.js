import amqp from 'amqplib'
import mongoose from 'mongoose'
import ServiceForm from '../models/serviceForm.js'
import FormTrack from '../models/formTrack.js'

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

async function recordTrack(doc, action = 'StatusChange', { actedBy, comment } = {}) {
  // mirror the tracking data used by the HTTP controllers
  const historyEntry = {
    status: doc.status,
    sub_status: doc.sub_status,
    assignedTo: doc.assignedTo,
    action,
    comment,
    updatedBy: actedBy,
    updatedAt: new Date(),
  }

  const applicationNo = doc.applicationNo || String(doc._id)
  const setPayload = {
    status: doc.status,
    sub_status: doc.sub_status,
    assignedTo: doc.assignedTo,
    action,
  }

  if (comment) setPayload.comment = comment
  if (actedBy) setPayload.actedBy = actedBy

  await FormTrack.findOneAndUpdate(
    { form_id: doc._id, applicationNo },
    {
      $setOnInsert: {
        form_id: doc._id,
        formName: 'ServiceForm',
        applicationNo,
      },
      $set: setPayload,
      $push: { statusHistory: historyEntry },
    },
    { new: true, upsert: true },
  )
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
        const incomingStatus = String(req.status || '').trim()

        if (!query) {
          reply(
            {
              ok: false,
              message: 'Please provide a service number or form id to update status.',
              error: 'Missing serviceNumber/serviceFormId',
            },
            replyTo,
            corr,
          )
          return
        }
        if (!incomingStatus) {
          reply(
            {
              ok: false,
              message: 'Status is required to update the service.',
              error: 'Missing status',
            },
            replyTo,
            corr,
          )
          return
        }
        if (incomingStatus.toLowerCase() === 'draft') {
          reply(
            {
              ok: true,
              message: 'Draft status from queue is ignored and not stored.',
            },
            replyTo,
            corr,
          )
          return
        }

        const update = buildUpdate(req)
        const doc = await ServiceForm.findOneAndUpdate(
          query,
          { $set: update },
          { new: true },
        ).lean()

        if (!doc) {
          reply(
            {
              ok: false,
              message: 'No service found for the provided reference.',
              error: 'Service form not found',
            },
            replyTo,
            corr,
          )
          return
        }

        const applicationNo = doc.applicationNo || String(doc._id)
        if (!doc.applicationNo) doc.applicationNo = applicationNo

        if (doc.status && doc.status !== 'Draft') {
          await recordTrack(doc, 'StatusChange', {
            actedBy: req.updatedBy || req.userId || doc.actedBy,
            comment: req.comment,
          })
        }

        reply(
          {
            ok: true,
            message: 'Service status updated successfully.',
            data: {
              id: doc._id,
              applicationNo,
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
          {
            ok: false,
            message: 'Unable to update the service status at the moment.',
            error: err?.message || 'Service status update failed',
          },
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
