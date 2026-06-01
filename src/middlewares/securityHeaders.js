/**
 * Cabeçalhos de segurança básicos sem dependência externa.
 *
 * A CSP é aplicada fora do Swagger para não quebrar a UI interativa gerada por
 * swagger-ui-express, que usa scripts inline.
 */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  if (!req.path.startsWith('/api-docs')) {
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "object-src 'none'",
        "script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        "font-src 'self' https://cdnjs.cloudflare.com data:",
        "img-src 'self' data: https:",
        "connect-src 'self'",
      ].join('; ')
    );
  }

  next();
}

module.exports = { securityHeaders };
