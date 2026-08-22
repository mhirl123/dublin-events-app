/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ticketmaster.com', 'ticketmaster.ie', 'eventbrite.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
}

module.exports = nextConfig
