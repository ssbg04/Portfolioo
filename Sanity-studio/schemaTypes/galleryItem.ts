import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'galleryItem',
  title: 'Gallery Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Photo Title (Optional)',
      type: 'string',
      description: 'Short headline or caption for this photo'
    }),
    defineField({
      name: 'photo',
      title: 'Photo Asset',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Upload high-resolution photo file'
    }),
    defineField({
      name: 'photoUrl',
      title: 'Direct Photo URL (Fallback / Optional)',
      type: 'url',
      description: 'Direct image link if not uploading asset file directly'
    }),
    defineField({
      name: 'description',
      title: 'Description / Context (Optional)',
      type: 'text',
      rows: 3,
      description: 'Details, background context, or memory regarding this photo'
    }),
    defineField({
      name: 'category',
      title: 'Category (Optional)',
      type: 'string',
      options: {
        list: [
          { title: 'Projects & Demos', value: 'Projects' },
          { title: 'Academics & Campus', value: 'Academics' },
          { title: 'Certificates & Milestones', value: 'Certificates' },
          { title: 'Events & Hackathons', value: 'Events' },
          { title: 'Personal & Behind The Scenes', value: 'Personal' }
        ]
      },
      description: 'Filter category displayed in gallery header'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'photo'
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Photo',
        subtitle: subtitle || 'Uncategorized',
        media
      }
    }
  }
})
