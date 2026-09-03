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
      name: 'logoImage',
      title: 'Navbar Brand Logo / Avatar Icon',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Custom logo image displayed in the navbar and favicon fallback'
    }),
    defineField({
      name: 'contactHeading',
      title: 'Contact Section Headline',
      type: 'string',
      initialValue: "Let's create something amazing.",
      description: 'Main heading text for the contact form section'
    }),
    defineField({
      name: 'contactSubtitle',
      title: 'Contact Section Subtitle / Message',
      type: 'text',
      rows: 2,
      initialValue: "Whether you have a question, a project idea, or just want to say hi, my inbox is always open. I'll try my best to get back to you!",
      description: 'Introductory sentence displayed next to contact details'
    }),
    defineField({
      name: 'maintenanceMode',
      title: 'Enable Maintenance Mode',
      type: 'boolean',
      initialValue: false,
      description: 'When enabled, visitors will see the maintenance/under development page'
    }),
    defineField({
      name: 'maintenanceTitle',
      title: 'Maintenance Page Title',
      type: 'string',
      initialValue: 'Please come back later.',
      description: 'Headline on the maintenance page'
    }),
    defineField({
      name: 'maintenanceMessage',
      title: 'Maintenance Page Message',
      type: 'text',
      rows: 3,
      initialValue: 'The website is currently being refined and updated. You can still reach me directly through my channels below.',
      description: 'Body message on the maintenance page'
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
