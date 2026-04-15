import type { CollectionConfig } from 'payload'
import { admin } from './access/admin'

export const RoomGeometry: CollectionConfig = {
  slug: 'room-geometry',
  admin: {
    useAsTitle: 'room_id',
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    {
      name: 'room_id',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Join key — Format: 16.11.00.018' },
    },
    {
      name: 'path_data',
      type: 'textarea',
      required: true,
      admin: { description: 'SVG d attribute string for the room polygon' },
    },
    {
      name: 'building',
      type: 'text',
      required: true,
      admin: { description: 'Building code — e.g. 1611' },
    },
    {
      name: 'floor',
      type: 'text',
      required: true,
      admin: { description: 'Floor identifier — e.g. 00, 01, U1' },
    },
  ],
}
