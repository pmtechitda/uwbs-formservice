import Reconnection from '../../models/reconnection.js';
import { successResponse, errorResponse } from "../../utils/response.util.js";
import FormTrack from '../../models/formTrack.js';

const buildFilter = (query) => {
  const { consumerNumber, mobileNumber, ownershipStatus, serviceType, search } = query;

  const filter = {};

  if (consumerNumber) filter.consumerNumber = { $regex: consumerNumber, $options: 'i' };
  if (mobileNumber) filter.mobileNumber = mobileNumber;
  if (ownershipStatus && ownershipStatus !== 'All') filter.ownershipStatus = ownershipStatus;
  if (serviceType && serviceType !== 'All') filter.serviceType = serviceType;
  if (search) {
    filter.$or = [
      { consumerNumber: { $regex: search, $options: 'i' } },
      { nameOfApplicant: { $regex: search, $options: 'i' } },
      { connectionNumber: { $regex: search, $options: 'i' } },
      { mobileNumber: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
};

export const getAllReconnections = async (req, reply) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Reconnection.countDocuments(filter);
    const reconnection = await Reconnection.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
    return successResponse(
      reply,
      {
        reconnection,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      'Reconnections fetched successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch reconnections', 500, error);
  }
};

export const getReconnectionById = async (req, reply) => {
  try {
    const { id } = req.params;
    const record = await Reconnection.findById(id);
    if (!record) {
      return errorResponse(reply, 'Reconnection not found', 404);
    }
    return successResponse(reply, record, 'Reconnection fetched successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch reconnection', 500, error);
  }
};

export const createReconnection = async (req, reply) => {
  try {
    const newRecord = new Reconnection(req.body);
    await newRecord.save();
    return successResponse(reply, newRecord, 'Reconnection created successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to create reconnection', 500, error);
  }
};

export const updateReconnection = async (req, reply) => {
  try {
    const { id } = req.params;
    const updatedRecord = await Reconnection.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecord) {
      return errorResponse(reply, 'Reconnection not found', 404);
    }
    return successResponse(reply, updatedRecord, 'Reconnection updated successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to update reconnection', 500, error);
  }
};

export const deleteReconnection = async (req, reply) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Reconnection.findByIdAndDelete(id);
    if (!deletedRecord) {
      return errorResponse(reply, 'Reconnection not found', 404);
    }
    return successResponse(reply, null, 'Reconnection deleted successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to delete reconnection', 500, error);
  }
};

export const forwardRevertReconnection = async (req, reply) => {
  try {
    const reconnectionId = req.params.id;
    const { assign_to, status, comment, formName } = req.body;

    const currentReconnection = await Reconnection.findById(reconnectionId);
    if (!currentReconnection) {
      return errorResponse(reply, 'Reconnection not found', 404);
    }

    let newAssignedTo;
    let oldUserId = currentReconnection.assignedTo;
    let newUserId;

    if (status === "Forward") {
      newAssignedTo = assign_to;
      newUserId = assign_to;
    } else if (status === "Revert") {
      const lastTrackRecord = await FormTrack.findOne({
        form_id: reconnectionId
      }).sort({ createdAt: -1 });

      if (!lastTrackRecord) {
        return errorResponse(reply, 'No previous track record found to revert', 404);
      }

      newAssignedTo = lastTrackRecord.old_user_id;
      newUserId = lastTrackRecord.old_user_id;

      if (!newAssignedTo) {
        return errorResponse(reply, 'Unable to determine previous user for revert', 400);
      }
    }

    const updatedReconnection = await Reconnection.findByIdAndUpdate(
      reconnectionId,
      { assignedTo: newAssignedTo },
      { new: true, runValidators: true }
    );

    const newRecord = new FormTrack({
      form_id: reconnectionId,
      formName,
      old_user_id: oldUserId,
      new_user_id: newUserId,
      assign_to: newAssignedTo,
      comment: comment || "",
      status,
      submitted_by: req.user._id
    });
    await newRecord.save();

    return successResponse(
      reply,
      {
        reconnection: updatedReconnection,
        track: newRecord
      },
      status === "Revert"
        ? 'Reconnection reverted successfully'
        : 'Reconnection forwarded successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to revert reconnection', 500, error);
  }
};
