import { defineField, defineType } from 'sanity'

export const subscriberSchema = defineType({
  name: 'subscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: r => r.required().email() }),
    defineField({ name: 'createdAt', title: 'Subscribed At', type: 'datetime' }),
  ],
})
