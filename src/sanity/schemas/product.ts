import { defineField, defineType } from 'sanity'

export const productSchema = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'price', title: 'Price (GHS)', type: 'number', validation: r => r.required().positive() }),
    defineField({ name: 'compareAtPrice', title: 'Compare At Price (GHS)', type: 'number' }),
    defineField({ name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }], validation: r => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }], validation: r => r.min(1) }),
    defineField({ name: 'sizes', title: 'Sizes', type: 'array', of: [{ type: 'string' }], options: { list: ['XS', 'S', 'M', 'L', 'XL', 'One Size'] } }),
    defineField({ name: 'stock', title: 'Stock', type: 'number', initialValue: 0 }),
    defineField({ name: 'isNew', title: 'New Arrival', type: 'boolean', initialValue: false }),
    defineField({ name: 'isFeatured', title: 'Featured on Home', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', media: 'images.0', price: 'price' },
    prepare({ title, media, price }) {
      return { title, subtitle: `GH¢ ${price}`, media }
    },
  },
})
