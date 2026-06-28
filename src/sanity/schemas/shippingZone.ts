import { defineField, defineType } from 'sanity'

export const shippingZoneSchema = defineType({
  name: 'shippingZone',
  title: 'Shipping Zone',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Zone Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'flatRate', title: 'Flat Rate (GHS)', type: 'number', validation: r => r.required().min(0) }),
    defineField({ name: 'estimatedDays', title: 'Estimated Delivery Days', type: 'string' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', initialValue: 0 }),
  ],
})
