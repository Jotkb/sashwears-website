import { defineField, defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({ name: 'orderNumber', title: 'Order Number', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'productId', type: 'string', title: 'Product ID' },
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'size', type: 'string', title: 'Size' },
          { name: 'quantity', type: 'number', title: 'Quantity' },
          { name: 'price', type: 'number', title: 'Unit Price (GHS)' },
        ],
      }],
    }),
    defineField({ name: 'subtotal', title: 'Subtotal (GHS)', type: 'number' }),
    defineField({ name: 'shippingFee', title: 'Shipping Fee (GHS)', type: 'number' }),
    defineField({ name: 'total', title: 'Total (GHS)', type: 'number' }),
    defineField({ name: 'paymentRef', title: 'Paystack Reference', type: 'string' }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: { list: ['pending', 'success', 'failed'] },
      initialValue: 'pending',
    }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      fields: [
        { name: 'name', type: 'string', title: 'Name' },
        { name: 'phone', type: 'string', title: 'Phone' },
        { name: 'email', type: 'string', title: 'Email' },
        { name: 'address', type: 'string', title: 'Delivery Address' },
      ],
    }),
    defineField({ name: 'shippingZone', title: 'Shipping Zone', type: 'string' }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: { list: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
      initialValue: 'pending',
    }),
    defineField({ name: 'isPendingWhatsApp', title: 'WhatsApp Pending Order', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'orderNumber', subtitle: 'customer.name', status: 'paymentStatus' },
    prepare({ title, subtitle, status }) {
      return { title: `#${title}`, subtitle: `${subtitle} — ${status}` }
    },
  },
})
