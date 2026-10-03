import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'
import '../xyz.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Agency XYZ | AI answering agents, strategy & websites',
      },
      {
        name: 'description',
        content:
          'AI answering agents that pick up every call, AI strategy and training for your team, and websites that answer, book, and sell.',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..900,0..100,0..1&family=Work+Sans:wght@400;500;600;700;800;900&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="selection:bg-black selection:text-white">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
