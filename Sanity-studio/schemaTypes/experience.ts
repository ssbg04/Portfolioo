import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'experience',
  title: 'Experience / Career History',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Company / Organization Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Talisay Integrated School'
    }),
    defineField({
      name: 'role',
      title: 'Role / Job Title',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Programmer, Full Stack Developer'
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-time', value: 'Full-time' },
          { title: 'Part-time', value: 'Part-time' },
          { title: 'Internship', value: 'Internship' },
          { title: 'Contract / Freelance', value: 'Contract' }
        ]
      }
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. Laguna, Philippines / Remote'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. 2025 or 2025-01'
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'Present',
      description: 'e.g. Present, 2026-05, etc.'
    }),
    defineField({
      name: 'isCurrent',
      title: 'Currently Working Here',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'description',
      title: 'Achievements & Responsibilities',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.required(),
      description: 'Bullet points detailing key contributions and systems engineered'
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. PHP, MySQL, JavaScript, HTML/CSS'
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
      title: 'role',
      subtitle: 'company'
    }
  }
})
