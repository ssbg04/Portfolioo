<!-- ✅ COMPLETED in UI Polish Pass (Sept 2026):
- Browser frame / chrome dots removed from project screenshots → simple rounded-2xl containers
- Mobile navigation: moved settings into hamburger menu, full-screen glassmorphism drawer from under navbar
- Desktop navigation: left sidebar active indicator upgraded (left border accent + blue dot glow)
- Mobile nav drawer: glassmorphism treatment (backdrop-blur:20px) replaces flat Material design
- Footer: 3-column layout (copyright | spotify | socials), social icons no longer clipped by BackToTop
- Section headers: removed bottom border dividers for minimalist feel (About, Skills)
- Missing CSS utilities defined: .text-glow, .glow-effect, .bg-gradient-mesh, .reveal-fade-left/right, .animate-drawer-slide
- Dark mode aurora ambient gradient added to body
- iOS safe area (pb-safe) added to mobile nav drawer and footer
- Tap targets (44px min) added to all interactive mobile elements
- All pages: consistent responsive padding (about, projects, certifications, contact, gallery)
- Sidebar uses glass-nav (glassmorphism) instead of flat bg-background-custom
- AGENT.md updated to reflect all of the above as canonical patterns
-->

<!-- # PENDING TASKS

- testimonial section stars add in sanity studio
- accessibility dropdown background color in light mode it has transparent
- add a photo gallery in gallery page → uploads from sanity title(optional), photo upload/url, description (optional), category(optional) → hover overlay blur + show title + show description + click show full image in a modal → add filter by category → responsive grid layout → animation on scroll-in
- optimize the low end mobile color theme → dark mode, light mode → colors, background, buttons, text, links, icons
- chat bot → turn into FAB → keyword-matching search assistant → label as Portfolio Assistant (not AI)
- footer Spotify → spinning disk animation when playing
- link page → linktree style, no header/footer, optimize for low-end mobile
-->

<!-- - fix certifications page title and numbering it should be 3, tech stack is 2
- redesign certificate cards: large picture, badge/cert code, issuing org, title → click opens modal with full info
- in about section bento cell 2 make the image optimize load
- link page cv url /CV-Cris-Charles-Garcia.pdf → available work chip fetch from sanity
- certifications page: remove "03 // Credentials & Badges" prefix from title
- background shapes in landscape the right side shapes collides
-->

<!-- - Lite mode default the toggle is disabled
- hide the magnifier lens settings if detected mobile
- limit portfolio assistant pre selections
-->

<!-- - fix the lite mode only hero section loads when i reload that enabled lite mode
- make the UI in mobile same as on pc but when lagging notify to turn on the lite mode
-->

<!-- - Project dedicated page: redesign layout, remove background border design, spread all the information, make it responsive
- Gallery page → add next/previous, zoom in/zoom out
- fix the gallery page modal view the description is not readable
- in the certificates if the picture is portrait make the modal scrollable and responsive
-->


<!-- - fix certifications page title and numbering it should be 3, tech stack is 2
- redesign the card of certificates large picture, badge/cert code, issuing org, and title only -> hover and when click show all the information of the certificate in a modal -> dont make verify button only on credly or other platform 
- in about page it has certifications section -> remove it because it is already in certifications page -->

<!-- - in about section bento cell 2 make the image optimize load [About.tsx#L99-103](textBlock;file:///f%3A/WebDevelopment/Portfolio/src/components/About.tsx#L99-103)
- link page cv url /CV-Cris-Charles-Garcia.pdf -> available work chip fetch from sanity same from home page
- in cards of certificate/badges can be previewed if the picture is a certificate not a badge so make it large and can be previewed
- certifications page title remove the ```03 // Credentials & Badges

Certifications & Badges
Verified digital credentials from Cisco and industry partners. Each badge represents completed coursework, assessments, and demonstrated competency
<!-- - background shapes in landscape the right side shapes collides
- in portrait make the different approach of parallex and layout of the shapes -->
<!-- - Lite mode default the toggle is disabled
- hide the magnifier lens settings if detected mobile
- limit portfolio assistant pre selections, add feature that shows their ip and location when prompts like a using AI chatbot or if they try to prompt in the portfolio assistant like its a AI -->

<!-- - fix the lite mode only hero section loads when i reload that enabled lite mode
- make the UI in mobile same as on pc but when lagging notify to turn on the lite mode -->

<!-- - remove title description per sections
- in project section remove the screenshot picture frame like its a browser in localhost, just make it simple
- do not use emoji 
- certifications section -> all categories use simple word and short for title category
- only fetch spotify widget when modal is open, fix recent play its pausing
- in tech stack technology add icon fontawesome and update the sanity io -->

<!-- # TECHNOLOGIES & TOOLS
- make the per categories simple and easy to read, remove some uneccessary components, remove the per skills has its box

# CONTACT SECTION
- fix the "Let's create something amazing." is under lapping to paragraph element
- in ultra fast mode the form still has label animation, fix the label to be static and dont move or animate, always show the label above the input field -->

<!-- Project Section
- make the inpect overview update to open dedicated show case page, use basic words for all buttons, 

Project Dedicated page
- redesign the layout, remove the background border design, spread all the information, make it responsive, organize the contents -->


<!-- - Swap the placement of section Projects and Techstack
- in landscape view or the desktop view make the navigation to left side bar, do not add hamburger bar has doesnt minimize or maximize
- Redesign the Techstack, use one section for all the techstack, do not add sub section or sub boxes for all categories, just make it simple -->

<!-- Technologies & tools section
- make it 12 limit
- remove duplication of showing x of n technologies -->

<!-- - link page fix the layout in landscape and mobile view
- remove the link in navigation bar
- gallery page -> add next/previous, zoom in/zoom out, and image display change to image grid in web in modal view
- in mobile view -> move the settings button inside the hamburger menu
- in mobile view -> hamburger menu render from under the navigation bar to the bottom occupy the full screen
- after all of these git commit -->

<!-- - projects page -> fix the title too much space consume
- fix the gallery page modal view the description is not readable
- in the certificates if the picture is portrait and it has many information the picture is not visible, make the modal scrollable and responsive -->

<!-- - fix that on mobile view in all of the pages in navigation it has huge space at top, keep the home page layout
- fix that in landscape or desktop view that the active color indicator jumps to home to where you click a tab, and fix that the navigation bar zooming out in landscape view -->