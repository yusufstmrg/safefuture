export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.status(200).json({
    ok: true,
    service: 'safe-future',
    environment: process.env.VERCEL_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
}
