import Tanker from '../../models/tanker.js';
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

export const getAllTankers = async (req, reply) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Tanker.countDocuments(filter);
    const tanker = await Tanker.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

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
      'Tankers fetched successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch tankers', 500, error);
  }
};

export const getTankerById = async (req, reply) => {
  try {
    const { id } = req.params;
    const record = await Tanker.findById(id);
    if (!record) {
      return errorResponse(reply, 'Tanker not found', 404);
    }
    return successResponse(reply, record, 'Tanker fetched successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch tanker', 500, error);
  }
};

export const createTanker = async (req, reply) => {
  try {
    const newRecord = new Tanker(req.body);
    await newRecord.save();
    return successResponse(reply, newRecord, 'Tanker created successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to create tanker', 500, error);
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
      return errorResponse(reply, 'Tanker not found', 404);
    }
    return successResponse(reply, updatedRecord, 'Tanker updated successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to update tanker', 500, error);
  }
};

export const deleteTanker = async (req, reply) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Tanker.findByIdAndDelete(id);
    if (!deletedRecord) {
      return errorResponse(reply, 'Tanker not found', 404);
    }
    return successResponse(reply, null, 'Tanker deleted successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to delete tanker', 500, error);
  }
};
