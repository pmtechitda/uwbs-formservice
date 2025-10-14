import MeterReplacement from '../../models/meterReplacement.js';
import { successResponse, errorResponse } from "../../utils/response.util.js";

/**
 * Build MongoDB filter for MeterReplacement listing
 */
const buildFilter = (query) => {
  const { consumer_id, status, search } = query;
  const filter = {};

  if (consumer_id) {
    filter.consumer_id = consumer_id;
  }

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (search) {
    // Search only in "reason" for now — can be extended
    filter.$or = [{ reason: { $regex: search, $options: 'i' } }];
  }

  return filter;
};

/**
 * Get all meter replacements with pagination
 */
export const getAllMeterReplacements = async (req, reply) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = buildFilter(req.query);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await MeterReplacement.countDocuments(filter);
    const meterReplacements = await MeterReplacement.find(filter)
      .populate('consumer_id', 'name email') // optional: show user info
      .populate('photo_id', 'name email') // optional
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

/**
 * Get single meter replacement by ID
 */
export const getMeterReplacementById = async (req, reply) => {
  try {
    const { id } = req.params;
    const record = await MeterReplacement.findById(id)
      .populate('consumer_id', 'name email')
      .populate('photo_id', 'name email');

    if (!record) {
      return errorResponse(reply, 'Meter replacement not found', 404);
    }

    return successResponse(reply, record, 'Meter replacement fetched successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to fetch meter replacement', 500, error);
  }
};

/**
 * Create new meter replacement
 */
export const createMeterReplacement = async (req, reply) => {
  try {
    const { consumer_id, reason, photo_id, status } = req.body;

    const newRecord = new MeterReplacement({
      consumer_id,
      reason,
      photo_id,
      status,
    });

    const savedRecord = await newRecord.save();

    return successResponse(reply, savedRecord, 'Meter replacement created successfully');
  } catch (error) {
    return errorResponse(reply, 'Failed to create meter replacement', 500, error);
  }
};

/**
 * Update meter replacement by ID
 */
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

/**
 * Delete meter replacement by ID
 */
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
