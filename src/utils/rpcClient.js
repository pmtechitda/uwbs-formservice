import amqp from 'amqplib';
import { randomUUID } from 'crypto';

let channel, replyQueue
const correlationMap = new Map()

function ensureRpcReady() {
  if (!channel || !replyQueue) {
    throw new Error('RPC channel not initialized')
  }
}

export async function connectRPC() {
  const conn = await amqp.connect(process.env.RABBITMQ_URI)
  channel = await conn.createChannel()
  replyQueue = (await channel.assertQueue('', { exclusive: true })).queue

  channel.consume(
    replyQueue,
    (msg) => {
      if (!msg) return
      const correlationId = msg.properties.correlationId
      const pending = correlationMap.get(correlationId)
      if (pending) {
        clearTimeout(pending.timeout)
        correlationMap.delete(correlationId)
        try {
          pending.resolve(JSON.parse(msg.content.toString()))
        } catch (err) {
          pending.reject(err)
        }
      }
    },
    { noAck: true }
  )
}

export async function rpcRequest(queue, payload = {}, { timeoutMs = 5000 } = {}) {
  ensureRpcReady()

  return new Promise((resolve, reject) => {
    const correlationId = randomUUID()
    const timeout = setTimeout(() => {
      if (correlationMap.has(correlationId)) {
        correlationMap.delete(correlationId)
        reject(new Error(`${queue} timeout`))
      }
    }, timeoutMs)

    correlationMap.set(correlationId, { resolve, reject, timeout })

    try {
      channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(payload)),
        {
          replyTo: replyQueue,
          correlationId,
          contentType: 'application/json',
        }
      )
    } catch (err) {
      clearTimeout(timeout)
      correlationMap.delete(correlationId)
      reject(err)
    }
  })
}

export async function verifyTokenRPC(token) {
  return rpcRequest('verify.token.request', { token }, { timeoutMs: 5000 })
}

