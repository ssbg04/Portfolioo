import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'socialLink',
  title: 'Social Link & Directory Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. GitHub, LinkedIn, Facebook, TikTok, Email, X (Twitter), YouTube, Discord'
    }),
    defineField({
      name: 'url',
      title: 'Target URL',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. https://github.com/ssbg04 or mailto:crischarlesgarcia345@gmail.com'
    }),
    defineField({
      name: 'icon',
      title: 'Icon Key / Reference',
      type: 'string',
      options: {
        list: [
          { title: 'GitHub', value: 'github' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Email / Mail', value: 'mail' },
          { title: 'X / Twitter', value: 'twitter' },
          { title: 'Messenger', value: 'messenger' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Discord', value: 'discord' },
          { title: 'Generic Web Link', value: 'link' }
        ]
      },
      initialValue: 'link',
      description: 'Select platform icon or type key'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1
    }),
    defineField({
      name: 'showInHero',
      title: 'Show in Hero Section',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'showInFooter',
      title: 'Show in Footer Section',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'showInLinksPage',
      title: 'Show in /links NFC Directory Page',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'platform',
      subtitle: 'url'
    }
  }
})
