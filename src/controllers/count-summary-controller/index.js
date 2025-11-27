import MeterReplacement from "../../models/meterReplacement.js"; // Adjust paths as needed
import Mutation from "../../models/mutation.js";
import Reconnection from "../../models/reconnection.js";
import Tanker from "../../models/tanker.js";
import { successResponse, errorResponse } from "../../utils/response.util.js"; // Adjust path

export const getFormCountByStatus = async (req, reply) => {
  try {
    const statusEnum = ["Pending", "Approved", "Rejected",];

    // Common filter for all queries
    const matchFilter = {
      isDeleted: { $ne: true },
      status: { $in: statusEnum }
    };

    // Helper function to get status counts for a model
    const getStatusCounts = async (Model) => {
      const rows = await Model.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      // Initialize all statuses with 0
      const counts = {};
      for (const status of statusEnum) {
        counts[status] = 0;
      }

      // Populate with actual counts
      for (const r of rows) {
        if (counts[r._id] !== undefined) {
          counts[r._id] = r.count;
        }
      }

      return counts;
    };

    // Get counts for each model
    const [
      meterReplacementCounts,
      mutationCounts,
      reconnectionCounts,
      tankerCounts
    ] = await Promise.all([
      getStatusCounts(MeterReplacement),
      getStatusCounts(Mutation),
      getStatusCounts(Reconnection),
      getStatusCounts(Tanker)
    ]);

    // Get total counts for each model
    const [
      totalMeterReplacement,
      totalMutation,
      totalReconnection,
      totalTanker
    ] = await Promise.all([
      MeterReplacement.countDocuments(matchFilter),
      Mutation.countDocuments(matchFilter),
      Reconnection.countDocuments(matchFilter),
      Tanker.countDocuments(matchFilter)
    ]);

    // Calculate grand total
    const grandTotal = totalMeterReplacement + totalMutation + totalReconnection + totalTanker;

    

    const responseData = {
      meterReplacement: {
        statusCounts: meterReplacementCounts,
        total: totalMeterReplacement
      },
      mutation: {
        statusCounts: mutationCounts,
        total: totalMutation
      },
      reconnection: {
        statusCounts: reconnectionCounts,
        total: totalReconnection
      },
      tanker: {
        statusCounts: tankerCounts,
        total: totalTanker
      },
      grandTotal
    };

    return successResponse(
      reply,
      responseData,
      "Form status counts fetched successfully"
    );
  } catch (error) {
    return errorResponse(
      reply,
      "Failed to fetch form status counts",
      500,
      error
    );
  }
};