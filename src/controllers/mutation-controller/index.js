import Mutation from '../../models/mutation.js';
import { successResponse, errorResponse } from "../../utils/response.util.js";
import FormTrack from '../../models/formTrack.js';

const buildFilter = (query) => {
  const { consumerNumber, mobileNumber, ownershipStatus, search } = query;

  const filter = {};

  if (consumerNumber) filter.consumerNumber = { $regex: consumerNumber, $options: 'i' };
  if (mobileNumber) filter.mobileNumber = mobileNumber;
  if (ownershipStatus && ownershipStatus !== 'All') filter.ownershipStatus = ownershipStatus;
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

export const getAllMutations = async (req, reply) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Mutation.countDocuments(filter);
    const mutation = await Mutation.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
    return successResponse(
      reply,
      {
        mutation,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      'Mutations fetched successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch mutations', 500, error);
  }
};

export const getMutationById = async (req, reply) => {
  try {
    const { id } = req.params;
    const record = await Mutation.findById(id);
    if (!record) {
      return errorResponse(reply, 'Mutation not found', 404);
    }
    return successResponse(reply, record, 'Mutation fetched successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch mutation', 500, error);
  }
};

export const createMutation = async (req, reply) => {
  try {
    const newRecord = new Mutation(req.body);
    await newRecord.save();
    return successResponse(reply, newRecord, 'Mutation created successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to create mutation', 500, error);
  }
};

export const updateMutation = async (req, reply) => {
  try {
    const { id } = req.params;
    const updatedRecord = await Mutation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecord) {
      return errorResponse(reply, 'Mutation not found', 404);
    }
    return successResponse(reply, updatedRecord, 'Mutation updated successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to update mutation', 500, error);
  }
};

export const deleteMutation = async (req, reply) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Mutation.findByIdAndDelete(id);
    if (!deletedRecord) {
      return errorResponse(reply, 'Mutation not found', 404);
    }
    return successResponse(reply, null, 'Mutation deleted successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to delete mutation', 500, error);
  }
};

export const forwardRevertMutation = async (req, reply) => {
  try {
    const mutationId = req.params.id;
    const { assign_to, status, comment, formName } = req.body;

    const currentMutation = await Mutation.findById(mutationId);
    if (!currentMutation) {
      return errorResponse(reply, 'Mutation not found', 404);
    }

    let newAssignedTo;
    let oldUserId = currentMutation.assignedTo;
    let newUserId;

    if (status === "Forward") {
      newAssignedTo = assign_to;
      newUserId = assign_to;
    } else if (status === "Revert") {
      const lastTrackRecord = await FormTrack.findOne({
        form_id: mutationId
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

    const updatedMutation = await Mutation.findByIdAndUpdate(
      mutationId,
      { assignedTo: newAssignedTo },
      { new: true, runValidators: true }
    );

    const newRecord = new FormTrack({
      form_id: mutationId,
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
        mutation: updatedMutation,
        track: newRecord
      },
      status === "Revert"
        ? 'Mutation reverted successfully'
        : 'Mutation forwarded successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to revert mutation', 500, error);
  }
};