import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Professional Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'valueProposition',
      title: 'Value Proposition / Hero Headline',
      type: 'text',
      validation: Rule => Rule.required(),
      description: 'Short introduction displayed on the hero section'
    }),
    defineField({
      name: 'isAvailable',
      title: 'Available for New Projects / Roles',
      type: 'boolean',
      initialValue: true,
      description: 'Controls the live pulsating status indicator'
    }),
    defineField({
      name: 'availabilityStatus',
      title: 'Availability Status Text',
      type: 'string',
      initialValue: 'Available for new projects',
      description: 'e.g. Available for new projects, Open to Engineering Roles'
    }),
    defineField({
      name: 'biography',
      title: 'Biography Paragraphs',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
      description: 'Paragraphs for the About section.'
    }),
    defineField({
      name: 'heroImage',
      title: 'Profile Picture / Hero Image (Day / Primary)',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'heroImageNight',
      title: 'Profile Picture (Night / Dark Mode Optional)',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Optional image to show when dark mode is enabled'
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. Laguna, Philippines'
    }),
    defineField({
      name: 'resumeAsset',
      title: 'Resume / CV Document Upload (PDF)',
      type: 'file',
      description: 'Upload your latest CV or Resume directly as a PDF file'
    }),
    defineField({
      name: 'resumeFile',
      title: 'Resume File Link (or Static Fallback URL)',
      type: 'string',
      initialValue: '/CV-Cris-Charles-Garcia.pdf',
      description: 'URL or path to fallback resume (e.g. /CV-Cris-Charles-Garcia.pdf or Google Drive link)'
    }),
    defineField({
      name: 'seoTitle',
      title: 'Default SEO Title Override',
      type: 'string',
      description: 'Custom browser tab title prefix'
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO Meta Description',
      type: 'text',
      description: 'Meta description for search engines and social shares'
    })
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'title',
      media: 'heroImage'
    }
  }
})
