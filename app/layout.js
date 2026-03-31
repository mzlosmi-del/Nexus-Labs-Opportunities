import './globals.css'

export const metadata = {
  title: 'Leads Tracker',
  description: 'Track your web dev leads',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
