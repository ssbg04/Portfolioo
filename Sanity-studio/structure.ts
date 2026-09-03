import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Portfolio Content')
    .items([
      S.listItem()
        .title('Site Settings & Profile')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('4bd177d0-487c-4ade-8f8f-b9647d68a49e')
        ),
      S.divider(),
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('certification').title('Certifications & Badges'),
      S.documentTypeListItem('skill').title('Skills Matrix'),
      S.documentTypeListItem('experience').title('Work Experience'),
      S.documentTypeListItem('education').title('Education & Academics'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.documentTypeListItem('socialLink').title('Social Links & Directory'),
    ])
