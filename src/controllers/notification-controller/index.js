import Notification from "../../models/notification.js";
import { createChannel } from "../../worker/rabbitmq.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";

let channel;

// Initialize RabbitMQ channel
(async () => {
  const { ch } = await createChannel();
  channel = ch;
})();
const buildFilter = (query) => {
  const {
    status,
    assessment_id,
    head_id,
    plan_id,
    search,
    start_from,
    start_to,
  } = query;

  const filter = {};

  if (status && status !== 'All') filter.status = status;
  if (assessment_id) filter.assessment_id = assessment_id;
  if (head_id) filter.head_id = head_id;
  if (plan_id) filter.plan_id = plan_id;

  if (search) {
    filter.$or = [
      { type: { $regex: search, $options: 'i' } },
    ];
  }

  if (start_from || start_to) {
    filter.start_date = {};
    if (start_from) filter.start_date.$gte = new Date(start_from);
    if (start_to) filter.start_date.$lte = new Date(start_to);
  }

  return filter;
};
export const getAllNotification = async (req, reply) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Notification.countDocuments({...filter, userId: req.user._id });
    
    const notification = await Notification.find({...filter,userId:req.user._id})
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });
    return successResponse(
      reply,
      {
        notification,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Notification fetched successfully"
    );
  } catch (error) {
    return errorResponse(reply, "Failed to send notification", 500, error);
  }
};

// Emit real-time notification via Socket.IO
export const emitNotification = async (req, reply) => {
  try {
    const { userId, payload } = req.body;

    if (!global.fastify?.io) {
      return errorResponse(reply, "Socket.IO not initialized", 500);
    }

    global.fastify.io.to(`user:${userId}`).emit("notification", payload);
    return reply.send({ success: true });
  } catch (error) {
    return errorResponse(reply, "Failed to send notification", 500, error);
  }
};

