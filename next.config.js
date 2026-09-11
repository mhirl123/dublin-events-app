/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['ticketmaster.com', 'ticketmaster.ie', 'eventbrite.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
  // Disable static site generation to prevent out-of-memory errors
  // during the "Collecting page data" phase of the build
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig
