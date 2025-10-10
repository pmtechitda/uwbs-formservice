import MeterReplacement from '../../models/meterReplacement.js';
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

export const getAllMeterReplacements = async (req, reply) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = buildFilter(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await MeterReplacement.countDocuments(filter);
    const meterReplacements = await MeterReplacement.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

    return successResponse(
      reply,
      {
        meterReplacements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      'Meter replacements fetched successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch meter replacements', 500, error);
  }
};

export const getMeterReplacementById = async (req, reply) => {
  try {
    const { id } = req.params;
    const record = await MeterReplacement.findById(id);
    if (!record) {
      return errorResponse(reply, 'Meter replacement not found', 404);
    }
    return successResponse(reply, record, 'Meter replacement fetched successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch meter replacement', 500, error);
  }
};

export const createMeterReplacement = async (req, reply) => {
  try {
    const newRecord = new MeterReplacement(req.body);
    await newRecord.save();
    return successResponse(reply, null, 'Meter replacement created successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to create meter replacement', 500, error);
  }
};

export const updateMeterReplacement = async (req, reply) => {
  try {
    const { id } = req.params;
    const updatedRecord = await MeterReplacement.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecord) {
      return errorResponse(reply, 'Meter replacement not found', 404);
    }
    return successResponse(reply, updatedRecord, 'Meter replacement updated successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to update meter replacement', 500, error);
  }
};

export const deleteMeterReplacement = async (req, reply) => {
  try {
    const { id } = req.params;
    const deletedRecord = await MeterReplacement.findByIdAndDelete(id);
    if (!deletedRecord) {
      return errorResponse(reply, 'Meter replacement not found', 404);
    }
    return successResponse(reply, null, 'Meter replacement deleted successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to delete meter replacement', 500, error);
  }
};
