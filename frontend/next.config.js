const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
  // For Render deploys: BACKEND_API_URL is injected via env (e.g., https://sidequest-backend.onrender.com)
  // For local dev: falls back to localhost:8080
  async rewrites() {
    let backendBase = (process.env.BACKEND_API_URL || 'http://localhost:8080').trim().replace(/\/+$/, '');
    // Render's fromService.host gives bare hostname without scheme; ensure https://
    if (backendBase && !backendBase.startsWith('http://') && !backendBase.startsWith('https://')) {
      backendBase = `https://${backendBase}`;
    }
    // Fix Render fromService.host that returns internal name without domain (e.g. sidequest-backend-gzia)
    // If hostname has no dot, append .onrender.com
    try {
      const urlForCheck = new URL(backendBase);
      if (urlForCheck.hostname && !urlForCheck.hostname.includes('.')) {
        backendBase = `${backendBase}.onrender.com`;
      }
    } catch {}
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
