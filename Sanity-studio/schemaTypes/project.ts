import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Project Category',
      type: 'string',
      options: {
        list: [
          { title: 'Web Application', value: 'Web Application' },
          { title: 'Mobile Application', value: 'Mobile Application' },
          { title: 'System / Record Management', value: 'System / Record Management' },
          { title: 'AI / Machine Learning', value: 'AI / Machine Learning' },
          { title: 'Full Stack', value: 'Full Stack' },
          { title: 'Open Source', value: 'Open Source' },
          { title: 'Tools & Utilities', value: 'Tools & Utilities' }
        ]
      }
    }),
    defineField({
      name: 'status',
      title: 'Project Status',
      type: 'string',
      options: {
        list: [
          { title: 'LIVE PRODUCTION', value: 'LIVE PRODUCTION' },
          { title: 'IN DEVELOPMENT', value: 'IN DEVELOPMENT' },
          { title: 'COMPLETED', value: 'COMPLETED' },
          { title: 'PROTOTYPE', value: 'PROTOTYPE' },
          { title: 'ARCHIVED', value: 'ARCHIVED' }
        ]
      },
      initialValue: 'LIVE PRODUCTION'
    }),
    defineField({
      name: 'summary',
      title: 'Card Summary',
      type: 'text',
      rows: 2,
      validation: Rule => Rule.required(),
      description: 'Short 1-2 sentence overview displayed on project cards'
    }),
    defineField({
      name: 'description',
      title: 'Detailed Description',
      type: 'text',
      rows: 5,
      validation: Rule => Rule.required(),
      description: 'Comprehensive overview for project showcase page'
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover / Banner Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'gallery',
      title: 'Project Screenshots / Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Additional preview screenshots for the project details page'
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies & Frameworks',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.required(),
      description: 'e.g. PHP, MySQL, React, JavaScript, Bootstrap, Tailwind, Node.js'
    }),
    defineField({
      name: 'repositoryUrl',
      title: 'Source Code / Repository URL',
      type: 'url',
      description: 'e.g. https://github.com/ssbg04/repo-name'
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live Demo / Production URL',
      type: 'url',
      description: 'e.g. https://my-app.vercel.app'
    }),
    defineField({
      name: 'featured',
      title: 'Featured (Show on Homepage)',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date / Year',
      type: 'string',
      initialValue: '2026',
      description: 'e.g. 2026 or 2026-05'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'coverImage'
    }
  }
})
