import Tanker from "../../models/tanker.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";
import FormTrack from "../../models/formTrack.js";
const buildFilter = (query) => {
  const { consumerNumber, mobileNumber, status, ownershipStatus, search } =
    query;

  const filter = {};

  if (consumerNumber)
    filter.consumerNumber = { $regex: consumerNumber, $options: "i" };
  if (status && status !== "All") {
    filter.status = status;
  }
  if (mobileNumber) filter.mobileNumber = mobileNumber;
  if (ownershipStatus && ownershipStatus !== "All")
    filter.ownershipStatus = ownershipStatus;

  if (search) {
    filter.$or = [
      { consumerNumber: { $regex: search, $options: "i" } },
      { nameOfApplicant: { $regex: search, $options: "i" } },
      { connectionNumber: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
};

export const getAllTankers = async (req, reply) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Tanker.countDocuments(filter);
    const tanker = await Tanker.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });

    return successResponse(
      reply,
      {
        tanker,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Tankers fetched successfully"
    );
  } catch (error) {
    return errorResponse(reply, "Failed to fetch tankers", 500, error);
  }
};

export const getTankerById = async (req, reply) => {
  try {
    const { id } = req.params;
    const record = await Tanker.findById(id);
    if (!record) {
      return errorResponse(reply, "Tanker not found", 404);
    }
    return successResponse(reply, record, "Tanker fetched successfully");
  } catch (error) {
    return errorResponse(reply, "Failed to fetch tanker", 500, error);
  }
};

export const getTankerByConsumerNumber = async (req, reply) => {
  try {
    const consumerNumber = req.user.consumerCode;
    const records = await Tanker.find({ consumerNumber });

    if (!records || records.length === 0) {
      return errorResponse(reply, "Tanker not found", 404);
    }

    return successResponse(reply, records, "Tanker fetched successfully");
  } catch (error) {
    return errorResponse(reply, "Failed to fetch tanker", 500, error);
  }
};

export const createTanker = async (req, reply) => {
  try {
    const consumerNumber = req.user.consumerCode;
    const newRecord = new Tanker({ ...req.body, consumerNumber });
    await newRecord.save();
    return successResponse(reply, newRecord, "Tanker created successfully");
  } catch (error) {
    return errorResponse(reply, "Failed to create tanker", 500, error);
  }
};

export const updateTanker = async (req, reply) => {
  try {
    const { id } = req.params;
    const updatedRecord = await Tanker.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecord) {
      return errorResponse(reply, "Tanker not found", 404);
    }
    return successResponse(reply, updatedRecord, "Tanker updated successfully");
  } catch (error) {
    return errorResponse(reply, "Failed to update tanker", 500, error);
  }
};

export const deleteTanker = async (req, reply) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Tanker.findByIdAndDelete(id);
    if (!deletedRecord) {
      return errorResponse(reply, "Tanker not found", 404);
    }
    return successResponse(reply, null, "Tanker deleted successfully");
  } catch (error) {
    return errorResponse(reply, "Failed to delete tanker", 500, error);
  }
};

export const forwardRevertTanker = async (req, reply) => {
  try {
    const tankerId = req.params.id;
    const { assign_to, status, comment, formName } = req.body;

    const currentTanker = await Tanker.findById(tankerId);
    if (!currentTanker) {
      return errorResponse(reply, "Tanker not found", 404);
    }

    let newAssignedTo;
    let oldUserId = currentTanker.assignedTo;
    let newUserId;

    if (status === "Forward") {
      newAssignedTo = assign_to;
      newUserId = assign_to;
    } else if (status === "Revert") {
      const lastTrackRecord = await FormTrack.findOne({
        form_id: tankerId,
      }).sort({ createdAt: -1 });

      if (!lastTrackRecord) {
        return errorResponse(
          reply,
          "No previous track record found to revert",
          404
        );
      }

      newAssignedTo = lastTrackRecord.old_user_id;
      newUserId = lastTrackRecord.old_user_id;

      if (!newAssignedTo) {
        return errorResponse(
          reply,
          "Unable to determine previous user for revert",
          400
        );
      }
    }

    const updatedTanker = await Tanker.findByIdAndUpdate(
      tankerId,
      { assignedTo: newAssignedTo },
      { new: true, runValidators: true }
    );

    const newRecord = new FormTrack({
      form_id: tankerId,
      formName,
      old_user_id: oldUserId,
      new_user_id: newUserId,
      assign_to: newAssignedTo,
      comment: comment || "",
      status,
      submitted_by: req.user._id,
    });
    await newRecord.save();

    return successResponse(
      reply,
      {
        tanker: updatedTanker,
        track: newRecord,
      },
      status === "Revert"
        ? "Tanker reverted successfully"
        : "Tanker forwarded successfully"
    );
  } catch (error) {
    return errorResponse(reply, "Failed to revert tanker", 500, error);
  }
};
