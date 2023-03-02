import PacketPay from '@packetpay/js'
import { toast } from 'react-toastify'

export default async (method, url, params) => {
  try {
    const response = await PacketPay(url, {
      method,
      body: JSON.stringify(params)
    })
    const parsedBody = JSON.parse(Buffer.from(response.body).toString('utf8'))
    if (parsedBody.status === 'error') {
      console.error(parsedBody)
      toast.error(
        parsedBody.description ||
        parsedBody.message ||
        'Request failed!'
      )
    }
    return parsedBody
  } catch (e) {
    console.error(e)
    toast.error(e.message)
  }
}
