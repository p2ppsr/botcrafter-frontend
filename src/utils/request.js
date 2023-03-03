import { Authrite } from 'authrite-js'
import { toast } from 'react-toastify'

const client = new Authrite()

export default async (method, url, params) => {
  try {
    const response = await client.request(url, {
      method,
      body: JSON.stringify(params)
    })
    const parsedBody = JSON.parse(Buffer.from(response.body).toString('utf8'))
    if (parsedBody.status === 'error') {
      if (parsedBody.description !== 'Register a user account before taking this action!' || url.indexOf('/getOwnProfile') === -1) {
        console.error(parsedBody)
        toast.error(
          parsedBody.description ||
          parsedBody.message ||
          'Request failed!'
        )
      }
    }
    return parsedBody
  } catch (e) {
    console.error(e)
    toast.error(e.message)
  }
}
