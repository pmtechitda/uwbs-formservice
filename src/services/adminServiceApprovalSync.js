import { rpcRequest } from '../utils/rpcClient.js'

const QUEUE = 'service.form.approval.sync.request'
const SUPPORTED_SERVICE_TYPES = new Set([
  'Mutation',
  'Disconnection',
  'Reconnection',
  'Address Change',
  'Mobile Update',
  'Connection Change',
  'Meter Size Update',
])

function normalizeString(value) {
  if (value === null || value === undefined) return undefined
  const normalized = String(value).trim()
  return normalized || undefined
}

export function isAdminApprovalSyncEligible(form = {}) {
  return (
    normalizeString(form.status) === 'Approved' &&
    SUPPORTED_SERVICE_TYPES.has(normalizeString(form.serviceType))
  )
}

export function buildAdminApprovalSyncPayload(form = {}, { updatedBy } = {}) {
  return {
    serviceFormId: normalizeString(form._id),
    applicationNumber:
      normalizeString(form.applicationNumber) || normalizeString(form._id),
    consumerNumber: normalizeString(form.consumerNumber),
    serviceType: normalizeString(form.serviceType),
    status: normalizeString(form.status),
    updatedBy:
      normalizeString(updatedBy) ||
      normalizeString(form.updatedBy) ||
      normalizeString(form.actedBy) ||
      normalizeString(form.userId),
    new_name: normalizeString(form.new_name),
    new_fatherName: normalizeString(form.new_fatherName),
    new_mobileNumber: normalizeString(form.new_mobileNumber),
    new_address: normalizeString(form.new_address),
    new_connection_category: normalizeString(form.new_connection_category),
    new_sub_category:
      form.new_sub_category === null || form.new_sub_category === undefined
        ? undefined
        : String(form.new_sub_category),
    new_meter_size: normalizeString(form.new_meter_size),
  }
}

export async function syncApprovedFormToAdminService(form, { updatedBy } = {}) {
  if (!isAdminApprovalSyncEligible(form)) {
    return {
      ok: true,
      skipped: true,
      reason: 'not_applicable',
    }
  }

  const response = await rpcRequest(
    QUEUE,
    buildAdminApprovalSyncPayload(form, { updatedBy }),
    {
      timeoutMs: Math.max(
        1000,
        Number(process.env.ADMIN_FORM_SYNC_TIMEOUT_MS || 15000)
      ),
    }
  )

  if (!response?.ok) {
    const error = new Error(
      response?.message ||
        response?.error ||
        'Failed to sync approved service form to adminservice'
    )
    error.response = response
    throw error
  }

  return response
}
