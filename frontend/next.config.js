/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For Render deploys: BACKEND_API_URL is injected via env (e.g., https://sidequest-backend.onrender.com)
  // For local dev: falls back to localhost:8080
  async rewrites() {
    let backendBase = (process.env.BACKEND_API_URL || 'http://localhost:8080').trim().replace(/\/+$/, '');
    // Render's fromService.host gives bare hostname without scheme; ensure https://
    if (backendBase && !backendBase.startsWith('http://') && !backendBase.startsWith('https://')) {
      backendBase = `https://${backendBase}`;
    }
    if (!backendBase) backendBase = 'http://localhost:8080';
    const dest = backendBase.endsWith('/api/v1') ? `${backendBase}/:path*` : `${backendBase}/api/v1/:path*`;
    return [
      {
        source: '/api/v1/:path*',
        destination: dest,
      },
    ];
  },
};

module.exports = nextConfig;
