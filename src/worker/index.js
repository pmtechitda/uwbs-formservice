// worker.js
import { createChannel } from "./rabbitmq.js";
import Notification from "../models/notification.js";
import { renderTemplate } from "../services/templateService.js";
import { transporter } from "../services/mailService.js";
import { sendSMS } from "../services/smsService.js";

const MAX_ATTEMPTS = { email: 5, sms: 3, push: 3, inapp: 1 };

const { ch } = await createChannel();
ch.prefetch(10);

export const startNotificationWorker = async () => {
  async function sendNotification(data) {
    if (data.type === "email") {
      data.loginUrl = process.env.LOGINURL;
      const html = await renderTemplate(data.templateName, data);
      await transporter.sendMail({
        from: `"No Reply" <${process.env.SMTP_USER}>`,
        to: data?.user?.email || data.payload.email,
        subject: data.subject || "Notification",
        html,
      });
    }
    if (data.type === "sms") {
      await sendSMS(data?.user?.mobile_number, "Signup", data.templateId);
    }
    // push & inapp can go here
  }

  ch.consume("notifications.processing", async (msg) => {
  const data = JSON.parse(msg.content.toString());
  const attempts = (msg.properties.headers["x-attempts"] || 0) + 1;

  try {
    const existing = await Notification.findById(data.notificationId);
    if (!existing) {
      data.userId = data?.user?._id;
      await Notification.create({ ...data, _id: data.notificationId });
    }

    await sendNotification(data);

    await Notification.findByIdAndUpdate(data.notificationId, {
      status: "sent",
      attempts,
    });
     if (!global.fastify?.io) {
          return errorResponse(reply, "Socket.IO not initialized", 500);
    }
    data?.user && global.fastify.io.to(`user:${data?.user?._id}`).emit("notification", payload); //

    ch.ack(msg);
  } catch (err) {
    const max = MAX_ATTEMPTS[data.type] || 3;

    if (attempts <= max) {
      if (attempts <= 3) {
        const retryRoutingKey = `retry.${attempts}`;

        ch.publish("notifications.retry", retryRoutingKey, msg.content, {
          persistent: true,
          headers: { "x-attempts": attempts },
        });

        await Notification.findByIdAndUpdate(data.notificationId, { attempts });
        console.log(`Retry ${attempts} for ${data.notificationId} via ${retryRoutingKey}`);
      } else {
        ch.publish("notifications.failed", "", msg.content, {
          persistent: true,
          headers: { "x-attempts": attempts },
        });

        await Notification.findByIdAndUpdate(data.notificationId, {
          status: "failed",
          attempts,
          error: err.message,
        });

        console.log(`Failed notification ${data.notificationId} (no more retry queues)`);
      }
    } else {
      ch.publish("notifications.failed", "", msg.content, {
        persistent: true,
        headers: { "x-attempts": attempts },
      });

      await Notification.findByIdAndUpdate(data.notificationId, {
        status: "failed",
        attempts,
        error: err.message,
      });

      console.log(`Failed notification ${data.notificationId}`);
    }

    ch.ack(msg);
  }
});
};
