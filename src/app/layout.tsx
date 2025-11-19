import './global.css'

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/icon.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>My App</title>
          <meta name="description" content="My App is a..." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        </head>
        <body>
          <div id="root">{children}</div>
        </body>
      </html>
    )
  }