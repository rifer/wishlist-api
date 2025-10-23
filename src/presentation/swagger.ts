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
          isDefault: { type: 'boolean', default: false, description: 'Whether this is the default wishlist for the user (only one per user)' },
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
          currency: { type: 'string', default: 'EUR', description: 'ISO 4217 currency code' },
          thumbnail: { type: 'string', default: '', description: 'Base64 encoded image' },
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
        tags: ['Wishlists'],
        responses: {
          '200': {
            description: 'List of wishlists',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Wishlist' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a wishlist',
        tags: ['Wishlists'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'name', 'description'],
                properties: {
                  userId: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  isDefault: { type: 'boolean', default: false, description: 'Set as default wishlist (only one per user)' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Wishlist created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wishlist' }
              }
            }
          },
          '400': { description: 'Bad request - duplicate name or validation error' }
        }
      }
    },
    '/wishlists/{id}': {
      get: {
        summary: 'Get wishlist by ID',
        tags: ['Wishlists'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Wishlist found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wishlist' }
              }
            }
          },
          '404': { description: 'Wishlist not found' }
        }
      },
      put: {
        summary: 'Update a wishlist',
        tags: ['Wishlists'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  isDefault: { type: 'boolean', description: 'Set as default wishlist (optional, only one per user)' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Wishlist updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wishlist' }
              }
            }
          },
          '400': { description: 'Bad request - duplicate name or validation error' },
          '404': { description: 'Wishlist not found' }
        }
      },
      delete: {
        summary: 'Delete a wishlist',
        tags: ['Wishlists'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '204': { description: 'Wishlist deleted' }
        }
      }
    },
    '/wishlists/{id}/set-default': {
      post: {
        summary: 'Set wishlist as default',
        description: 'Set this wishlist as the default for the user. Automatically unsets any other default wishlist.',
        tags: ['Wishlists'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Wishlist ID to set as default' }
        ],
        responses: {
          '200': {
            description: 'Wishlist set as default',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wishlist' }
              }
            }
          },
          '400': { description: 'Bad request' },
          '404': { description: 'Wishlist not found' }
        }
      }
    },
    '/wishlists/{id}/items': {
      post: {
        summary: 'Add item to wishlist',
        tags: ['Wishlist Items'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'productName', 'productUrl', 'price', 'priority', 'notes'],
                properties: {
                  productId: { type: 'string' },
                  productName: { type: 'string' },
                  productUrl: { type: 'string' },
                  price: { type: 'number' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
                  notes: { type: 'string' },
                  currency: { type: 'string', default: 'EUR', description: 'ISO 4217 currency code (optional, defaults to EUR)' },
                  thumbnail: { type: 'string', default: '', description: 'Base64 encoded image (optional)' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Item added to wishlist',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wishlist' }
              }
            }
          },
          '400': { description: 'Bad request' },
          '404': { description: 'Wishlist not found' }
        }
      }
    },
    '/wishlists/{wishlistId}/items/{itemId}': {
      delete: {
        summary: 'Remove item from wishlist',
        tags: ['Wishlist Items'],
        parameters: [
          { name: 'wishlistId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Item removed from wishlist',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Wishlist' }
              }
            }
          },
          '400': { description: 'Bad request' },
          '404': { description: 'Wishlist not found' }
        }
      }
    },
    '/wishlists/move-items': {
      post: {
        summary: 'Move items from one wishlist to another',
        tags: ['Wishlist Items'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sourceListId', 'destinationListId', 'itemIds'],
                properties: {
                  sourceListId: { type: 'string', description: 'Source wishlist ID' },
                  destinationListId: { type: 'string', description: 'Destination wishlist ID' },
                  itemIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of item IDs to move'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Items moved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    source: { $ref: '#/components/schemas/Wishlist' },
                    destination: { $ref: '#/components/schemas/Wishlist' }
                  }
                }
              }
            }
          },
          '400': { description: 'Bad request - invalid item IDs or wishlist not found' },
          '404': { description: 'Wishlist or items not found' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      }
    },
    '/users/{id}/wishlists': {
      get: {
        summary: 'Get wishlists by user ID',
        tags: ['Users'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'User wishlists',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Wishlist' }
                }
              }
            }
          }
        }
      }
    }
  }
};
