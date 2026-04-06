const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habit Tracker API',
      version: '1.0.0',
      description: 'REST API for the Habit Tracker application',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Habit: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            frequency: { type: 'string', enum: ['daily', 'weekly'] },
            category: { type: 'string', enum: ['health', 'sport', 'productivity', 'learning', 'social', 'other'] },
            streak: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Completion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            habit_id: { type: 'integer' },
            completed_on: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
});
