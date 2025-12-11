import ServiceForm from '../../models/serviceForm.js';
import { successResponse, errorResponse } from '../../utils/response.util.js';

const statusEnum = ["Approved", "Rejected", "Pending", "Draft", "Processing"];
const serviceTypeEnum = ["MeterReplacement", "Mutation", "Reconnection", "Tanker", "Disconnection", "Address Change", "Mobile Update", "Connection Change", "Meter Size Update"];

// GET /form-services/count
export const getFormCountByStatus = async (req, reply) => {
  try {
    const { type } = req.query || {};

    const match = { status: { $in: statusEnum } };
    if (type && type !== 'All' && serviceTypeEnum.includes(type)) {
      match.serviceType = type;
    }

    const rows = await ServiceForm.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = statusEnum.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    for (const row of rows) {
      if (statusCounts[row._id] !== undefined) {
        statusCounts[row._id] = row.count;
      }
    }

    const total = Object.values(statusCounts).reduce((sum, v) => sum + v, 0);

    return successResponse(reply, { statusCounts, total }, "Service form status counts fetched successfully");
  } catch (error) {
    return errorResponse(reply, "Failed to fetch form status counts", 500, error);
  }
};
