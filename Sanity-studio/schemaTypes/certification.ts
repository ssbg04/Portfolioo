import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'certification',
  title: 'Certification / Credential',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Certification Title',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Computer Hardware Basics, Introduction to Cybersecurity'
    }),
    defineField({
      name: 'code',
      title: 'Badge / Cert Code',
      type: 'string',
      description: 'e.g. 01, 02, NC2, or Cisco Cert ID'
    }),
    defineField({
      name: 'issuer',
      title: 'Issuing Organization',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Cisco, Cisco × OpenEDG, TESDA, Coursera'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Cybersecurity', value: 'Cybersecurity' },
          { title: 'Hardware & Systems', value: 'Hardware & Systems' },
          { title: 'Digital Literacy', value: 'Digital Literacy' },
          { title: 'Software Development', value: 'Software Development' },
          { title: 'Cloud & DevOps', value: 'Cloud & DevOps' },
          { title: 'Networking', value: 'Networking' },
          { title: 'Other', value: 'Other' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'badgeImage',
      title: 'Badge Image Upload',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Upload PNG or badge asset directly'
    }),
    defineField({
      name: 'badgeImageUrl',
      title: 'Badge Image External URL (Fallback)',
      type: 'url',
      description: 'Direct CDN/Credly image URL (e.g. https://images.credly.com/images/...)'
    }),
    defineField({
      name: 'badgeUrl',
      title: 'Verification / Public Badge URL',
      type: 'url',
      validation: Rule => Rule.required(),
      description: 'Public verification link (e.g. Credly badge URL)'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required(),
      description: 'Overview of competencies, exam scope, and skills covered'
    }),
    defineField({
      name: 'skills',
      title: 'Validated Competencies / Skills',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of skills demonstrated (e.g. Threat Modeling, Incident Response)'
    }),
    defineField({
      name: 'issueDate',
      title: 'Issue Date',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD'
      }
    }),
    defineField({
      name: 'expiryDate',
      title: 'Expiration Date (if applicable)',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD'
      }
    }),
    defineField({
      name: 'featured',
      title: 'Featured Credential',
      type: 'boolean',
      initialValue: true,
      description: 'Highlight on homepage credentials section'
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
      subtitle: 'issuer',
      media: 'badgeImage'
    }
  }
})
