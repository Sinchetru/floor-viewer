import type { CollectionConfig } from 'payload'
import { admin } from './access/admin'

export const RoomData: CollectionConfig = {
  slug: 'room-data',
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
    { name: 'room_id', type: 'text', required: true, unique: true },
    { name: 'room_number', type: 'text' },
    { name: 'room_type', type: 'text' },
    { name: 'room_type_code', type: 'text' },
    { name: 'area_sqm', type: 'number' },
    { name: 'din277_code', type: 'text' },
    { name: 'din277_name', type: 'text' },
    {
      name: 'cost_center',
      type: 'text',
      admin: { description: 'Kostenstelle — used for visibility scoping' },
    },
    { name: 'cost_center_name', type: 'text' },
    { name: 'special_use', type: 'text' },
    { name: 'owner', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'room_note', type: 'text' },
    { name: 'usage_note', type: 'text' },
    { name: 'usage_from', type: 'date' },
    { name: 'usage_to', type: 'date' },
  ],
}
