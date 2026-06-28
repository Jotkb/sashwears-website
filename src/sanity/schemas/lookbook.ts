import { defineField, defineType } from 'sanity'

export const lookbookSchema = defineType({
  name: 'lookbook',
  title: 'Lookbook',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true }, validation: r => r.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({ name: 'layout', title: 'Grid Layout', type: 'string', options: { list: ['full', 'half', 'third'] }, initialValue: 'full' }),
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
    }),
  ],
})
