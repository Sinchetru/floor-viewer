import type { CollectionConfig } from 'payload'
import { admin } from './access/admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    admin: ({ req: { user } }) => user?.role === 'admin',
    read: () => true,
    update: admin,
    create: () => true,
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
    },
    {
      name: 'KST',
      type: 'text',
      required: true,
    },
  ],
}
