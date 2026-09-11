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
  // during the "Collecting page data" phase of the build.
  // Setting to 300000ms (5 minutes) allows the build to complete if
  // static generation is unavoidable, while preventing memory exhaustion
  staticPageGenerationTimeout: 300000,
  // Disable incremental static regeneration
  isrMemoryCacheSize: 0,
}

module.exports = nextConfig
