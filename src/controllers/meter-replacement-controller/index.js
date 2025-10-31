import MeterReplacement from '../../models/meterReplacement.js';
import { successResponse, errorResponse } from "../../utils/response.util.js";
import FormTrack from '../../models/formTrack.js';
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

export const forwardRevertMeterReplacement = async (req, reply) => {
  try {
    const meterReplacementId = req.params.id;
    const { assign_to, status, comment, formName } = req.body;

    // Get current meter replacement to know the current assignedTo
    const currentMeterReplacement = await MeterReplacement.findById(meterReplacementId);
    
    if (!currentMeterReplacement) {
      return errorResponse(reply, 'Meter Replacement not found', 404);
    }

    let newAssignedTo;
    let oldUserId = currentMeterReplacement.assignedTo; // This is the current owner
    let newUserId;

    if (status === "Forward") {
      // For Forward: assign to the new user provided in assign_to
      newAssignedTo = assign_to;
      newUserId = assign_to;
      
    } else if (status === "Revert") {
      // For Revert: fetch the last track record to get previous user
      const lastTrackRecord = await FormTrack.findOne({
        form_id: meterReplacementId
      }).sort({ createdAt: -1 });
      
      console.log("lastTrackRecord", lastTrackRecord);
      
      if (!lastTrackRecord) {
        return errorResponse(reply, 'No previous track record found to revert', 404);
      }

      // Revert to the old_user_id from the last record
      newAssignedTo = lastTrackRecord.old_user_id;
      newUserId = lastTrackRecord.old_user_id;
      
      if (!newAssignedTo) {
        return errorResponse(reply, 'Unable to determine previous user for revert', 400);
      }
    }

    // Update the assignedTo field in the MeterReplacement model
    const updatedMeterReplacement = await MeterReplacement.findByIdAndUpdate(
      meterReplacementId,
      { assignedTo: newAssignedTo },
      { new: true, runValidators: true }
    );

    // Create the tracking record
    const newRecord = new FormTrack({
      form_id: meterReplacementId,
      formName,
      old_user_id: oldUserId,              // ✅ Current owner (from MeterReplacement)
      new_user_id: newUserId,              // ✅ New owner (where it's going)
      assign_to: newAssignedTo,            // ✅ Same as new_user_id
      comment: comment || "",
      status,
      submitted_by: req.user._id           // ✅ Who performed the action
    });
    await newRecord.save();

    return successResponse(
      reply,
      {
        meterReplacement: updatedMeterReplacement,
        track: newRecord
      },
      status === "Revert" 
        ? 'Meter replacement reverted successfully' 
        : 'Meter replacement forwarded successfully'
    );
  } catch (error) {
    return errorResponse(reply, 'Failed to update meter replacement', 500, error);
  }
};

// export const forwardRevertMeterReplacement = async (req, reply) => {
//   try {
//     const meterReplacementId = req.params.id;
//     const { assign_to, status, comment, formName } = req.body;

//     // Get current meter replacement to know the current assignedTo
//     const currentMeterReplacement = await MeterReplacement.findById(meterReplacementId);
    
//     if (!currentMeterReplacement) {
//       return errorResponse(reply, 'Meter Replacement not found', 404);
//     }

//     let newAssignedTo;
//     let oldUserId = currentMeterReplacement.assignedTo;
//     let newUserId;

//     if (status === "Forward") {
//       // For Forward: assign to the new user provided in assign_to
//       newAssignedTo = assign_to;
//       newUserId = assign_to;
      
//     } else if (status === "Revert") {
//       // For Revert: fetch the last track record to get previous user
//       const lastTrackRecord = await FormTrack.findOne({
//         form_id: meterReplacementId
//       }).sort({ createdAt: -1 })
//       console.log("lastTrackRecord",lastTrackRecord);
//       if (!lastTrackRecord) {
//         return errorResponse(reply, 'No previous track record found to revert', 404);
//       }

//       // Revert to the old_user_id from the last record
//       newAssignedTo = lastTrackRecord.old_user_id;
//       newUserId = lastTrackRecord.old_user_id;
      
//       if (!newAssignedTo) {
//         return errorResponse(reply, 'Unable to determine previous user for revert', 400);
//       }
//     }

//     // Update the assignedTo field in the MeterReplacement model
//     const updatedMeterReplacement = await MeterReplacement.findByIdAndUpdate(
//       meterReplacementId,
//       { assignedTo: newAssignedTo },
//       { new: true, runValidators: true }
//     );

//     // Create the tracking record
//     const newRecord = new FormTrack({
//       form_id: meterReplacementId,
//       formName,
//       old_user_id: req.user._id,
//       new_user_id: newUserId,
//       assign_to: newAssignedTo,
//       comment: comment || "",
//       status,
//       submitted_by: req.user._id
//     });
//     await newRecord.save();

//     return successResponse(
//       reply,
//       {
//         meterReplacement: updatedMeterReplacement,
//         track: newRecord
//       },
//       status === "Revert" 
//         ? 'Meter replacement reverted successfully' 
//         : 'Meter replacement forwarded successfully'
//     );
//   } catch (error) {
//     return errorResponse(reply, 'Failed to update meter replacement', 500, error);
//   }
// };