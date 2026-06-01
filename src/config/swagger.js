const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger/OpenAPI setup.
 *
 * Usa JSDoc para gerar documentação a partir dos comentários nos controladores/rotas.
 */
function swaggerSetup(app) {
  const spec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'VerificaOeste-Parana API',
        version: '1.0.0',
      },
      servers: [{ url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { swaggerSetup };

