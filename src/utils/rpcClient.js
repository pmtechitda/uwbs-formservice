import amqp from 'amqplib';
import { randomUUID } from 'crypto';

let channel, replyQueue
const correlationMap = new Map()

export async function connectRPC() {
  const conn = await amqp.connect(process.env.RABBITMQ_URI)
  channel = await conn.createChannel()
  replyQueue = (await channel.assertQueue('', { exclusive: true })).queue

  channel.consume(
    replyQueue,
    (msg) => {
      const correlationId = msg.properties.correlationId
      const resolve = correlationMap.get(correlationId)
      if (resolve) {
        resolve(JSON.parse(msg.content.toString()))
        correlationMap.delete(correlationId)
      }
    },
    { noAck: true }
  )
}

export async function verifyTokenRPC(token) {
  return new Promise((resolve, reject) => {
    const correlationId = randomUUID()
    correlationMap.set(correlationId, resolve)

    channel.sendToQueue(
      'verify.token.request',
      Buffer.from(JSON.stringify({ token })),
      {
        replyTo: replyQueue,
        correlationId,
      }
    )

    setTimeout(() => {
      if (correlationMap.has(correlationId)) {
        correlationMap.delete(correlationId)
        reject(new Error('Token verify timeout'))
      }
    }, 5000)
  })
}

export async function updateServiceStatusRPC(serviceFormId, status, sub_status) {
  return new Promise((resolve, reject) => {
    const correlationId = randomUUID()
    correlationMap.set(correlationId, resolve)
    channel.sendToQueue(
      'update.service.status.request',
      Buffer.from(JSON.stringify({ serviceFormId, status, sub_status })), 
      {
        replyTo: replyQueue,
        correlationId,
      }
    )
    setTimeout(() => {
      if (correlationMap.has(correlationId)) {
        correlationMap.delete(correlationId)
        reject(new Error('Update service status timeout'))
      }
    }, 5000)
  })
}
