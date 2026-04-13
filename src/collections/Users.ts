import type { CollectionConfig, FieldAccess } from 'payload'
import { admin } from './access/admin'

const adminOnly: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Only admins can access the Payload admin panel (boolean-only, cannot use Access type here)
    admin: ({ req: { user } }) => user?.role === 'admin',
    // Unauthenticated: nothing. Admin: all users. Others: own record only.
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Public self-registration allowed. Role + KST locked via field-level access below.
    create: () => true,
    // Admin updates anyone. Users can update their own record (e.g. password/email).
    // Role and KST changes are blocked at field level.
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: admin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'FM User', value: 'fm_user' },
        { label: 'Power User', value: 'power_user' },
        { label: 'User', value: 'user' },
      ],
      // Only admin can set or change the role. Self-registering users get defaultValue 'user'.
      access: {
        create: adminOnly,
        update: adminOnly,
      },
    },
    {
      name: 'KST',
      type: 'text',
      required: false,
      admin: {
        condition: (data) => data.role === 'user' || data.role === 'power_user',
        description: 'Kostenstelle — nur für User und Power User',
      },
      // Only admin can assign or change KST. FM users and admins have no KST.
      access: {
        create: adminOnly,
        update: adminOnly,
      },
    },
  ],
}
