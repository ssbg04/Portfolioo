import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'skill',
  title: 'Skill & Technology',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Skill / Technology Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'e.g. PHP, Node.js, React, MySQL, Flutter, Docker, Git'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Frontend', value: 'Frontend' },
          { title: 'Backend', value: 'Backend' },
          { title: 'Mobile', value: 'Mobile' },
          { title: 'Database', value: 'Database' },
          { title: 'DevOps & Cloud', value: 'DevOps' },
          { title: 'Cybersecurity', value: 'Cybersecurity' },
          { title: 'AI/ML', value: 'AI/ML' },
          { title: 'Tools & Workflow', value: 'Tools' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'proficiency',
      title: 'Proficiency Percentage (0-100)',
      type: 'number',
      initialValue: 85,
      validation: Rule => Rule.min(0).max(100)
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name / SVG Reference',
      type: 'string',
      description: 'e.g. react, nodejs, mysql, php, flutter'
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
      subtitle: 'category'
    }
  }
})
