import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial & Recommendation',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Person Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'role',
      title: 'Role / Designation',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Lead Engineer, Academic Advisor, Client'
    }),
    defineField({
      name: 'company',
      title: 'Company / Organization',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar / Photo',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'quote',
      title: 'Recommendation / Quote Text',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'relationship',
      title: 'Context / Project Association',
      type: 'string',
      description: 'e.g. Collaborated on TIS Management System'
    }),
    defineField({
      name: 'rating',
      title: 'Star Rating (1 - 5)',
      type: 'number',
      initialValue: 5,
      validation: Rule => Rule.min(1).max(5).integer(),
      description: 'Number of gold stars to display (1 to 5, default is 5)'
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
      title: 'name',
      subtitle: 'company',
      media: 'avatar'
    }
  }
})
