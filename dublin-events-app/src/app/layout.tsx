'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

// Note: metadata doesn't work in client components, this is a workaround
export const metadata: Metadata = {
  title: 'Dublin Events - Find Events in Dublin',
  description: 'Discover all events happening in Dublin - concerts, theater, comedy, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#fafbfc] to-[#f3f4f6]">
        {/* Header with Gradient */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f97316] shadow-glow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
                <span className="text-4xl">🎉</span>
                <div className="text-white">
                  <h1 className="text-2xl font-bold tracking-tight">Dublin Events</h1>
                  <p className="text-sm opacity-90">Discover the buzz</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="bg-white/20 hover:bg-white/30 border-2 border-white text-white px-4 py-2 rounded-full font-semibold transition-all text-sm">
                  📊 Dashboard
                </Link>
                <button className="bg-white/20 hover:bg-white/30 border-2 border-white text-white px-6 py-2 rounded-full font-semibold transition-all">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4">About</h3>
                <p className="text-gray-400 text-sm">Your guide to everything happening in Dublin</p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/" className="hover:text-white transition">Browse Events</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                  <li><a href="#" className="hover:text-white transition">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Follow</h3>
                <p className="text-gray-400 text-sm">Stay updated with Dublin Events</p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8">
              <p className="text-sm text-gray-400">
                © 2026 Dublin Events. Aggregating events from Dublin venues and ticketing platforms.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
