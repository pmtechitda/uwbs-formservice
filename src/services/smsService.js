import axios from 'axios'
import https from 'https'
import dotenv from 'dotenv'
dotenv.config()
import { getTemplateText } from '../utils/smsTemplate.js'

export const sendSMS = async ( phone, content,templateId ) => {
  try {
    const sender = 'UKITDA'
    const username = process.env.HMIMEDIA_SMS_API_USERNAME
    const password = process.env.HMIMEDIA_SMS_API_PASSWORD
    const eid = process.env.HMIMEDIA_SMS_API_ENTITY_ID

    if (!username || !password || !eid || !templateId) {
      throw new Error('Missing required SMS API environment variables.')
    }

    if (!phone || (Array.isArray(phone) && phone.length === 0)) {
      throw new Error('Missing recipient phone number(s).')
    }
    if (!content) {
      throw new Error('Missing Content.')
    }

    const _to = Array.isArray(phone) ? phone.join(',') : phone.toString()
    const message = encodeURIComponent(getTemplateText(templateId,content))
    const apiUrl = `https://itda.hmimedia.in/pushsms.php?username=${username}&api_password=${password}&sender=${sender}&to=${_to}&message=${message}&priority=11&e_id=${eid}&t_id=${templateId}`

    const agent = new https.Agent({ rejectUnauthorized: false })

    const { data } = await axios.get(apiUrl, { httpsAgent: agent })

    return data
  } catch (error) {
    console.error('SMS sending failed:', error)
    throw new Error('Failed to send SMS: ' + error.message)
  }
}
