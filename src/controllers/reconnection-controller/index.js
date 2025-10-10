import Reconnection from '../../models/reconnection.js';
import { successResponse, errorResponse } from "../../utils/response.util.js";

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
