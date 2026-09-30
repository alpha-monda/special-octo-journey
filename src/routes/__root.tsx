import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

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
        title: 'AI AGENCY XYZ | Your calls, answered.',
      },
      {
        name: 'description',
        content:
          'AI answering agents with human review, smart routing, and call intelligence for modern businesses.',
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
