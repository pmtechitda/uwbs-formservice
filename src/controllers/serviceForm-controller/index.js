// controllers/serviceForm-controller/index.js
import mongoose from 'mongoose';
import ServiceForm from '../../models/serviceForm.js';
import FormTrack from '../../models/formTrack.js';

const { Types } = mongoose;
const isValidObjectId = (id) => Types.ObjectId.isValid(id);
const withApplicationNo = (doc) => {
  if (!doc) return doc;
  const raw = doc.toObject ? doc.toObject() : doc;
  const applicationNo = raw.applicationNo || String(raw._id || raw.form_id || '');
  return { ...raw, applicationNo };
};

// Append a status history entry and keep latest snapshot for tracking UI
const recordTrack = async (formDoc, action = 'Update', userId, comment) => {
  const historyEntry = {
    status: formDoc.status,
    sub_status: formDoc.sub_status,
    assignedTo: formDoc.assignedTo,
    action,
    comment,
    updatedBy: userId,
    updatedAt: new Date(),
  };

  const applicationNo = formDoc.applicationNo || String(formDoc._id);

  await FormTrack.findOneAndUpdate(
    { form_id: formDoc._id, applicationNo },
    {
      $setOnInsert: {
        form_id: formDoc._id,
        formName: 'ServiceForm',
        applicationNo,
      },
      $set: {
        status: formDoc.status,
        sub_status: formDoc.sub_status,
        assignedTo: formDoc.assignedTo,
        action,
        comment,
        actedBy: userId,
      },
      $push: { statusHistory: historyEntry },
    },
    { new: true, upsert: true }
  );
};



// GET /serviceforms
export const getAllServiceForms = async (request, reply) => {
  try {
    request.log?.info?.('Fetching service forms list');
    const {
      page = 1,
      limit = 10,
      q,
      status,
      serviceType,
      consumerNumber,
      mobileNumber,
      applicationNo,
      assignedTo,
      submittedBy,
      department_id,
      division_id,
      collection_center_id,
      area_type,
      is_paid,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = request.query || {};

    const pageNum = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const filter = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { applicationNo: regex },
        { consumerNumber: regex },
        { current_name: regex },
        { new_name: regex },
      ];
    }
    if (applicationNo) filter.applicationNo = applicationNo;

    const statusProvided = typeof status !== 'undefined' && status !== null && status !== '';
    if (statusProvided && status !== 'All') {
      filter.status = status;
    } else {
      // For status "All" or not provided, exclude Draft entries
      filter.status = { $ne: 'Draft' };
    }
    if (typeof serviceType !== 'undefined' && serviceType !== 'All') filter.serviceType = serviceType;
    if (consumerNumber) filter.consumerNumber = consumerNumber;
    if (mobileNumber) filter.$or = (filter.$or || []).concat([
      { current_mobileNumber: mobileNumber },
      { new_mobileNumber: mobileNumber },
    ]);
    if (assignedTo) filter.assignedTo = assignedTo;
    if (submittedBy) filter.submittedBy = submittedBy;
    if (department_id && isValidObjectId(department_id)) filter.department_id = new Types.ObjectId(department_id);
    if (division_id && isValidObjectId(division_id)) filter.division_id = new Types.ObjectId(division_id);
    if (collection_center_id && isValidObjectId(collection_center_id)) filter.collection_center_id = new Types.ObjectId(collection_center_id);
    if (area_type) filter.area_type = area_type;
    if (typeof is_paid !== 'undefined' && is_paid !== 'All') {
      if (is_paid === 'true' || is_paid === '1') filter.is_paid = true;
      else if (is_paid === 'false' || is_paid === '0') filter.is_paid = false;
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      ServiceForm.find(filter).sort(sort).skip((pageNum - 1) * perPage).limit(perPage).lean(),
      ServiceForm.countDocuments(filter),
    ]);
    const serviceForms = items.map(withApplicationNo);

    return reply.code(200).send({
      success: true,
      message: 'Service forms fetched',
      data: {
        serviceForms,
        pagination: {
          total,
          page: pageNum,
          limit: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      },
    });
  } catch (err) {
    request.log?.error?.(err);
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// GET /serviceforms/:id
export const getServiceFormById = async (request, reply) => {
  try {
    const { id } = request.params;
    request.log?.info?.({ id }, 'Fetching service form by id');
    if (!isValidObjectId(id)) {
      return reply.code(400).send({ success: false, message: 'Invalid id' });
    }

    const [doc, track] = await Promise.all([
      ServiceForm.findById(id).lean(),
      FormTrack.findOne({ form_id: id }).lean(),
    ]);
    if (!doc) return reply.code(404).send({ success: false, message: 'Not found' });
    const docWithApp = withApplicationNo(doc);
    const trackWithApp = withApplicationNo(track);

    return reply.code(200).send({
      success: true,
      message: 'Service form fetched',
      data: { ...docWithApp, track: trackWithApp },
    });
  } catch (err) {
    request.log?.error?.(err);
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// GET /serviceforms/consumerNo?consumerNumber=...
export const getServiceFormByConsumerNumber = async (request, reply) => {
  try {
    const { consumerNumber } = request.query;
    request.log?.info?.({ consumerNumber }, 'Fetching service forms by consumerNumber');
    if (!consumerNumber) {
      return reply.code(400).send({ success: false, message: 'consumerNumber is required' });
    }

    const docs = await ServiceForm.find({ consumerNumber }).sort({ createdAt: -1 }).lean();
    const formIds = docs.map((doc) => doc?._id).filter(Boolean);
    const tracks = formIds.length
      ? await FormTrack.find({ form_id: { $in: formIds } }).lean()
      : [];
    const trackMap = new Map(tracks.map((t) => [String(t.form_id), withApplicationNo(t)]));
    const dataWithTrack = docs.map((doc) => ({
      ...withApplicationNo(doc),
      track: trackMap.get(String(doc._id)) || null,
    }));

    return reply.code(200).send({ success: true, message: 'Service forms fetched', data: dataWithTrack });
  } catch (err) {
    request.log?.error?.(err);
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// POST /serviceforms
export const createServiceForm = async (request, reply) => {
  try {
    request.log?.info?.('Creating new service form');
    const payload = { ...request.body };

    if (payload.current_mobileNumber) payload.current_mobileNumber = String(payload.current_mobileNumber).replace(/\D/g, '');
    if (payload.new_mobileNumber) payload.new_mobileNumber = String(payload.new_mobileNumber).replace(/\D/g, '');

    if (payload.department_id && isValidObjectId(payload.department_id)) payload.department_id = new Types.ObjectId(payload.department_id);
    if (payload.division_id && isValidObjectId(payload.division_id)) payload.division_id = new Types.ObjectId(payload.division_id);
    if (payload.collection_center_id && isValidObjectId(payload.collection_center_id)) payload.collection_center_id = new Types.ObjectId(payload.collection_center_id);
    if (payload.consumer_id && isValidObjectId(payload.consumer_id)) payload.consumer_id = new Types.ObjectId(payload.consumer_id);

    //update submittedBy and submittedType from auth info if available
    if (request.user) {
      payload.submittedBy = request.user.id;
    }

    // Generate unique applicationNo UWBS(M)YYMM(7 digit unique number timestam) M depand on this  enum: ["MeterReplacement", "Mutation", "Reconnection", "Tanker"],
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `UWBS${payload.serviceType.charAt(0)}-${year}${month}`;
    const lastForm = await ServiceForm
        .findOne({ applicationNo: { $regex: `^${prefix}` } })
        .sort({ applicationNo: -1 })
        .lean();
    let uniqueNumber = 1;
    if (lastForm) {
        const lastNumber = parseInt(lastForm.applicationNo.slice(-7), 10);
        if (!isNaN(lastNumber)) {
            uniqueNumber = lastNumber + 1;
        }
    }
    payload.applicationNo = `${prefix}${String(uniqueNumber).padStart(7, '0')}`;
    

    const doc = new ServiceForm(payload);
    const saved = await doc.save();

    await recordTrack(saved, 'Created', request.user?.id);

    return reply.code(201).send({ success: true, message: 'Created', data: withApplicationNo(saved) });
  } catch (err) {
    request.log?.error?.(err);
    if (err.name === 'ValidationError') {
      return reply.code(400).send({ success: false, message: err.message, errors: err.errors });
    }
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// PUT /serviceforms/:id  (replace)
export const updateServiceForm = async (request, reply) => {
  try {
    const { id } = request.params;
    request.log?.info?.({ id }, 'Updating service form');
    if (!isValidObjectId(id)) return reply.code(400).send({ success: false, message: 'Invalid id' });

    const payload = { ...request.body };
    // Support `assignTo` alias from clients and persist as assignedTo
    if (typeof payload.assignTo !== 'undefined' && typeof payload.assignedTo === 'undefined') {
      payload.assignedTo = payload.assignTo;
    }
    if (payload.current_mobileNumber) payload.current_mobileNumber = String(payload.current_mobileNumber).replace(/\D/g, '');
    if (payload.new_mobileNumber) payload.new_mobileNumber = String(payload.new_mobileNumber).replace(/\D/g, '');
    if (payload.department_id && isValidObjectId(payload.department_id)) payload.department_id = new Types.ObjectId(payload.department_id);
    if (payload.division_id && isValidObjectId(payload.division_id)) payload.division_id = new Types.ObjectId(payload.division_id);
    if (payload.collection_center_id && isValidObjectId(payload.collection_center_id)) payload.collection_center_id = new Types.ObjectId(payload.collection_center_id);
    if (payload.consumer_id && isValidObjectId(payload.consumer_id)) payload.consumer_id = new Types.ObjectId(payload.consumer_id);

    const updated = await ServiceForm.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) return reply.code(404).send({ success: false, message: 'Not found' });

    await recordTrack(updated, 'Update', request.user?.id);

    return reply.code(200).send({ success: true, message: 'Updated', data: withApplicationNo(updated) });
  } catch (err) {
    request.log?.error?.(err);
    if (err.name === 'ValidationError') return reply.code(400).send({ success: false, message: err.message, errors: err.errors });
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// PATCH /serviceforms/:id  (partial update)
export const patchServiceForm = async (request, reply) => {
  try {
    const { id } = request.params;
    request.log?.info?.({ id }, 'Patching service form');
    if (!isValidObjectId(id)) return reply.code(400).send({ success: false, message: 'Invalid id' });

    const payload = { ...request.body };
    // Support `assignTo` alias from clients and persist as assignedTo
    if (typeof payload.assignTo !== 'undefined' && typeof payload.assignedTo === 'undefined') {
      payload.assignedTo = payload.assignTo;
    }
    if (payload.current_mobileNumber) payload.current_mobileNumber = String(payload.current_mobileNumber).replace(/\D/g, '');
    if (payload.new_mobileNumber) payload.new_mobileNumber = String(payload.new_mobileNumber).replace(/\D/g, '');
    if (payload.department_id && isValidObjectId(payload.department_id)) payload.department_id = new Types.ObjectId(payload.department_id);
    if (payload.division_id && isValidObjectId(payload.division_id)) payload.division_id = new Types.ObjectId(payload.division_id);
    if (payload.collection_center_id && isValidObjectId(payload.collection_center_id)) payload.collection_center_id = new Types.ObjectId(payload.collection_center_id);
    if (payload.consumer_id && isValidObjectId(payload.consumer_id)) payload.consumer_id = new Types.ObjectId(payload.consumer_id);

    const updated = await ServiceForm.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
    if (!updated) return reply.code(404).send({ success: false, message: 'Not found' });

    await recordTrack(updated, 'Update', request.user?.id);

    return reply.code(200).send({ success: true, message: 'Patched', data: withApplicationNo(updated) });
  } catch (err) {
    request.log?.error?.(err);
    if (err.name === 'ValidationError') return reply.code(400).send({ success: false, message: err.message, errors: err.errors });
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// GET /serviceforms/:id/track
export const getServiceFormTrack = async (request, reply) => {
  try {
    const { id } = request.params;
    request.log?.info?.({ id }, 'Fetching service form track');
    if (!isValidObjectId(id)) return reply.code(400).send({ success: false, message: 'Invalid id' });

    const track = await FormTrack.findOne({ form_id: id }).lean();
    if (!track) return reply.code(404).send({ success: false, message: 'No tracking info found' });

    return reply.code(200).send({ success: true, message: 'Tracking fetched', data: withApplicationNo(track) });
  } catch (err) {
    request.log?.error?.(err);
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// DELETE /serviceforms/:id
export const deleteServiceForm = async (request, reply) => {
  try {
    const { id } = request.params;
    request.log?.info?.({ id }, 'Deleting service form');
    if (!isValidObjectId(id)) return reply.code(400).send({ success: false, message: 'Invalid id' });

    const deleted = await ServiceForm.findByIdAndDelete(id);
    if (!deleted) return reply.code(404).send({ success: false, message: 'Not found' });

    const deletedWithAppNo = withApplicationNo(deleted);
    return reply.code(200).send({
      success: true,
      message: 'Deleted',
      data: { applicationNo: deletedWithAppNo.applicationNo },
    });
  } catch (err) {
    request.log?.error?.(err);
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};

// POST /serviceforms/bulk-delete  { ids: [...] }
export const bulkDeleteServiceForms = async (request, reply) => {
  try {
    const { ids } = request.body || {};
    request.log?.info?.({ idsCount: Array.isArray(ids) ? ids.length : 0 }, 'Bulk deleting service forms');
    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.code(400).send({ success: false, message: 'ids array required' });
    }

    const validIds = ids.filter(isValidObjectId).map((i) => new Types.ObjectId(i));
    if (validIds.length === 0) {
      return reply.code(400).send({ success: false, message: 'No valid ids provided' });
    }

    const formsToDelete = await ServiceForm.find({ _id: { $in: validIds } }, 'applicationNo').lean();
    const applicationNos = formsToDelete.map((doc) => withApplicationNo(doc).applicationNo);
    const result = await ServiceForm.deleteMany({ _id: { $in: validIds } });

    return reply.code(200).send({
      success: true,
      message: 'Bulk delete completed',
      deletedCount: result.deletedCount,
      applicationNos,
    });
  } catch (err) {
    request.log?.error?.(err);
    return reply.code(500).send({ success: false, message: 'Server error' });
  }
};


export default {
  getAllServiceForms,
  getServiceFormById,
  getServiceFormByConsumerNumber,
  createServiceForm,
  updateServiceForm,
  patchServiceForm,
  getServiceFormTrack,
  deleteServiceForm,
  bulkDeleteServiceForms,
};
