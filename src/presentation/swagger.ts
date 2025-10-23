export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Wishlist API',
    version: '1.0.0',
    description: 'A REST API for managing wishlists using Hexagonal Architecture and DDD'
  },
  servers: [
    { url: '/api', description: 'Current server' }
  ],
  components: {
    schemas: {
      Wishlist: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/WishlistItem' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      WishlistItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          wishlistId: { type: 'string' },
          productId: { type: 'string' },
          productName: { type: 'string' },
          productUrl: { type: 'string' },
          price: { type: 'number' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          notes: { type: 'string' },
          addedAt: { type: 'string', format: 'date-time' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/wishlists': {
      get: {
        summary: 'Get all wishlists',
        responses: { '200': { description: 'List of wishlists' } }
      },
      post: {
        summary: 'Create a wishlist',
        responses: { '201': { description: 'Wishlist created' } }
      }
    },
    '/wishlists/{id}': {
      get: {
        summary: 'Get wishlist by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Wishlist found' } }
      }
    }
  }
};
