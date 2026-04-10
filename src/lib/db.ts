import { getPayload } from 'payload'
import config from '@payload-config'
export default await getPayload({ config: await config })
