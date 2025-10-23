import { Request, Response } from 'express';
import { swaggerDocument } from './swagger';

/**
 * Serves a custom Swagger UI HTML page with CDN-hosted assets
 * This approach works better with serverless platforms like Vercel
 */
export function serveSwaggerUI(req: Request, res: Response) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wishlist API - Swagger UI</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(swaggerDocument)};

      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

/**
 * Serves the OpenAPI specification as JSON
 */
export function serveSwaggerJSON(req: Request, res: Response) {
  res.json(swaggerDocument);
}
