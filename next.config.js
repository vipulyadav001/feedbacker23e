/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/feedbacker',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
