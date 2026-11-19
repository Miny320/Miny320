// Everything the README says about you lives in this file.
// Change the words here, then run "npm run build" to redraw the images.

export default {
  login: 'Miny320',
  name: 'Miny',
  role: 'Senior Full Stack Developer',

  // The two big lines at the top. The second line is set in the accent colour.
  headline: ['Small name.', 'Full stack.'],

  // Plain text under the top image. One entry is one paragraph.
  intro: [
    "Hi, I'm Miny. I build products end to end. That means the interface, the logic behind it, the data, and the automation around it.",
  ],

  // The six layers of the stack. The top image and the six tiles both use this list.
  // "art" picks the drawing on the plate: web, ai, commerce, automation, chain or play.
  // "link" is where a click on the tile goes. It should show proof of that layer.
  layers: [
    {
      art: 'web',
      title: 'Web products',
      text: 'Sites and web apps that feel fast and finished, from the first layout to the deploy.',
      tech: ['Next.js', 'React', 'TypeScript', 'Tailwind'],
      link: 'https://github.com/Miny320/guardian-care',
    },
    {
      art: 'ai',
      title: 'AI features',
      text: 'Chat over documents, search and extraction, with answers you can trace back to a source.',
      tech: ['RAG', 'AI SDK', 'pgvector', 'Postgres'],
      link: 'https://github.com/Miny320/citeline',
    },
    {
      art: 'commerce',
      title: 'Commerce',
      text: 'Shopify themes and checkout flows for private sales, deposits and size grids.',
      tech: ['Shopify', 'Liquid', 'Checkout UI', 'GraphQL'],
      link: 'https://github.com/Miny320/neve-private-sale',
    },
    {
      art: 'automation',
      title: 'Data and automation',
      text: 'Scrapers, price monitors and bots that collect the data and do the boring work.',
      tech: ['Node.js', 'Python', 'Puppeteer', 'Selenium'],
      link: 'https://github.com/Miny320?tab=repositories&q=scrap',
    },
    {
      art: 'chain',
      title: 'Web3',
      text: 'Token programs, launchpads and the TypeScript around them, on Solana and EVM chains.',
      tech: ['Solana', 'Raydium', 'Solidity', 'TypeScript'],
      link: 'https://github.com/Miny320?tab=repositories&q=contract',
    },
    {
      art: 'play',
      title: 'Games',
      text: 'Browser games that run from one HTML file, and mobile games built in Unity.',
      tech: ['HTML5', 'Unity', 'C#', 'Godot'],
      link: 'https://github.com/Miny320/claw-machine-demo',
    },
  ],

  // The featured project. It gets two cards: the story, and a drawing ("art": citeline).
  // "figure" is the caption under the drawing.
  featured: {
    repo: 'citeline',
    name: 'Citeline',
    kind: 'AI product',
    tagline: 'Chat with your documents, with citations you can actually check.',
    text: 'Upload a PDF, ask a question and get a streamed answer. Every claim shows the file, the page and the exact excerpt it came from.',
    tech: ['Next.js 16', 'React 19', 'AI SDK', 'Postgres + pgvector', 'Drizzle'],
    live: 'https://citeline-henna.vercel.app',
    art: 'citeline',
    figure: 'Every claim links to its source',
  },

  // The four smaller cards. "art" picks the drawing: energy, sizes, countdown or claw.
  projects: [
    {
      repo: 'guardian-care',
      name: 'Guardian Care',
      kind: 'Energy platform',
      text: 'Energy intelligence for solar households and the companies that install for them.',
      tech: ['React 19', 'Vite', 'TypeScript', 'Tailwind'],
      live: 'https://guardian-care-updated.vercel.app',
      art: 'energy',
    },
    {
      repo: 'neve-private-sale',
      name: 'Neve Atelier',
      kind: 'Shopify store',
      text: 'A private sale on Shopify. Register to see prices, pick sizes in one grid, pay a 30% deposit.',
      tech: ['Shopify', 'Liquid', 'Checkout UI extension'],
      art: 'sizes',
    },
    {
      repo: 'private-winter-sale',
      name: 'Private Winter Sale',
      kind: 'Landing page',
      text: 'A one-page landing page for a luxury sale, with a live countdown. No framework, no build step.',
      tech: ['HTML', 'CSS', 'JavaScript'],
      live: 'https://miny320.github.io/private-winter-sale/',
      art: 'countdown',
    },
    {
      repo: 'claw-machine-demo',
      name: 'Claw Machine',
      kind: 'Browser game',
      text: 'A claw machine reward game for the classroom. It runs from one HTML file, with seasonal themes.',
      tech: ['HTML5', 'One file', 'No install'],
      live: 'https://claw-machine-demo.vercel.app',
      art: 'claw',
    },
  ],

  // How many weeks the activity chart shows, and how many languages get their own colour.
  activity: {
    weeks: 26,
    languages: 5,
    recent: 4,
  },

  footer: {
    line: 'Thanks for stopping by.',
    note: 'Drawn by code. No third-party widgets.',
  },

  // Text links on the last line, after "All repositories".
  // Add your own here, for example { label: 'Email', href: 'mailto:you@example.com' }.
  links: [{ label: 'How this page is drawn', href: 'https://github.com/Miny320/Miny320/tree/main/scripts' }],
};
