import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'heroVideoUrl', title: 'Hero Video URL', type: 'url' }),
    defineField({ name: 'heroCopy', title: 'Hero Tagline', type: 'string', initialValue: 'New Season. Quiet Confidence.' }),
    defineField({ name: 'whatsappNumber', title: 'WhatsApp Number (with country code, no +)', type: 'string', initialValue: '233000000000' }),
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
    defineField({ name: 'tiktokUrl', title: 'TikTok URL', type: 'url' }),
    defineField({ name: 'contactEmail', title: 'Contact Email', type: 'string' }),
    defineField({ name: 'contactPhone', title: 'Contact Phone', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'text' }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
})
