import { type Access } from 'payload'

export const admin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}
