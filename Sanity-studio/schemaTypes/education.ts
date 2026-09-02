import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: [
    defineField({
      name: 'institution',
      title: 'School / Institution Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Laguna State Polytechnic University'
    }),
    defineField({
      name: 'degree',
      title: 'Degree / Certificate',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Bachelor of Science in Information Technology'
    }),
    defineField({
      name: 'fieldOfStudy',
      title: 'Major / Field of Study',
      type: 'string',
      description: 'e.g. Major in Software Development'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Year / Date',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. 2022'
    }),
    defineField({
      name: 'endDate',
      title: 'End Year / Date',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. 2026 or Present'
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. Laguna, Philippines'
    }),
    defineField({
      name: 'achievements',
      title: 'Key Highlights / Coursework / Honors',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of bullet points or academic highlights'
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
      title: 'degree',
      subtitle: 'institution'
    }
  }
})
