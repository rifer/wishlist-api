#!/bin/bash

cd wishlist-api

# Create src/presentation/swagger.ts
cat > src/presentation/swagger.ts << 'EOFSWAGGER'
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
EOFSWAGGER

# Create src/presentation/graphql.ts
cat > src/presentation/graphql.ts << 'EOFGRAPHQL'
import { buildSchema } from 'graphql';
import { IWishlistRepository, IUserRepository } from '../domain/ports';
import {
  CreateWishlistUseCase,
  AddItemToWishlistUseCase,
  RemoveItemFromWishlistUseCase,
  GetWishlistsByUserUseCase,
  GetWishlistByIdUseCase,
  GetAllWishlistsUseCase
} from '../application/usecases';

export const graphqlSchema = buildSchema(`
  type Wishlist {
    id: String!
    userId: String!
    name: String!
    description: String!
    items: [WishlistItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type WishlistItem {
    id: String!
    wishlistId: String!
    productId: String!
    productName: String!
    productUrl: String!
    price: Float!
    priority: String!
    notes: String!
    addedAt: String!
  }

  type User {
    id: String!
    email: String!
    name: String!
    createdAt: String!
    wishlists: [Wishlist!]!
  }

  type Query {
    wishlists: [Wishlist!]!
    wishlist(id: String!): Wishlist
    users: [User!]!
    user(id: String!): User
    userWishlists(userId: String!): [Wishlist!]!
  }

  type Mutation {
    createWishlist(userId: String!, name: String!, description: String!): Wishlist!
    addItemToWishlist(
      wishlistId: String!
      productId: String!
      productName: String!
      productUrl: String!
      price: Float!
      priority: String!
      notes: String!
    ): Wishlist!
    removeItemFromWishlist(wishlistId: String!, itemId: String!): Wishlist!
  }
`);

export function createGraphQLResolvers(
  wishlistRepo: IWishlistRepository,
  userRepo: IUserRepository
) {
  const createWishlistUC = new CreateWishlistUseCase(wishlistRepo, userRepo);
  const addItemUC = new AddItemToWishlistUseCase(wishlistRepo);
  const removeItemUC = new RemoveItemFromWishlistUseCase(wishlistRepo);
  const getWishlistsByUserUC = new GetWishlistsByUserUseCase(wishlistRepo);
  const getWishlistByIdUC = new GetWishlistByIdUseCase(wishlistRepo);
  const getAllWishlistsUC = new GetAllWishlistsUseCase(wishlistRepo);

  return {
    wishlists: () => getAllWishlistsUC.execute(),
    wishlist: ({ id }: { id: string }) => getWishlistByIdUC.execute(id),
    users: () => userRepo.findAll(),
    user: async ({ id }: { id: string }) => {
      const user = await userRepo.findById(id);
      if (!user) return null;
      const wishlists = await wishlistRepo.findByUserId(id);
      return { ...user, wishlists };
    },
    userWishlists: ({ userId }: { userId: string }) => getWishlistsByUserUC.execute(userId),
    createWishlist: ({ userId, name, description }: any) =>
      createWishlistUC.execute(userId, name, description),
    addItemToWishlist: (args: any) =>
      addItemUC.execute(
        args.wishlistId,
        args.productId,
        args.productName,
        args.productUrl,
        args.price,
        args.priority,
        args.notes
      ),
    removeItemFromWishlist: ({ wishlistId, itemId }: any) =>
      removeItemUC.execute(wishlistId, itemId)
  };
}
EOFGRAPHQL

# Create src/presentation/routes.ts
cat > src/presentation/routes.ts << 'EOFROUTES'
import { Router, Request, Response } from 'express';
import { Priority } from '../domain/entities';
import {
  CreateWishlistUseCase,
  AddItemToWishlistUseCase,
  GetWishlistsByUserUseCase,
  RemoveItemFromWishlistUseCase,
  GetWishlistByIdUseCase,
  GetAllWishlistsUseCase,
  DeleteWishlistUseCase
} from '../application/usecases';
import { IWishlistRepository, IUserRepository } from '../domain/ports';

export function createRoutes(
  wishlistRepo: IWishlistRepository,
  userRepo: IUserRepository
): Router {
  const router = Router();

  const createWishlistUC = new CreateWishlistUseCase(wishlistRepo, userRepo);
  const addItemUC = new AddItemToWishlistUseCase(wishlistRepo);
  const getWishlistsByUserUC = new GetWishlistsByUserUseCase(wishlistRepo);
  const removeItemUC = new RemoveItemFromWishlistUseCase(wishlistRepo);
  const getWishlistByIdUC = new GetWishlistByIdUseCase(wishlistRepo);
  const getAllWishlistsUC = new GetAllWishlistsUseCase(wishlistRepo);
  const deleteWishlistUC = new DeleteWishlistUseCase(wishlistRepo);

  router.get('/wishlists', async (req: Request, res: Response) => {
    const wishlists = await getAllWishlistsUC.execute();
    res.json(wishlists);
  });

  router.get('/wishlists/:id', async (req: Request, res: Response) => {
    const wishlist = await getWishlistByIdUC.execute(req.params.id);
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });
    res.json(wishlist);
  });

  router.post('/wishlists', async (req: Request, res: Response) => {
    try {
      const wishlist = await createWishlistUC.execute(req.body.userId, req.body.name, req.body.description);
      res.status(201).json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.delete('/wishlists/:id', async (req: Request, res: Response) => {
    await deleteWishlistUC.execute(req.params.id);
    res.status(204).send();
  });

  router.post('/wishlists/:id/items', async (req: Request, res: Response) => {
    try {
      const wishlist = await addItemUC.execute(
        req.params.id, req.body.productId, req.body.productName,
        req.body.productUrl, req.body.price, req.body.priority, req.body.notes
      );
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.delete('/wishlists/:wishlistId/items/:itemId', async (req: Request, res: Response) => {
    try {
      const wishlist = await removeItemUC.execute(req.params.wishlistId, req.params.itemId);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.get('/users', async (req: Request, res: Response) => {
    const users = await userRepo.findAll();
    res.json(users);
  });

  router.get('/users/:id/wishlists', async (req: Request, res: Response) => {
    const wishlists = await getWishlistsByUserUC.execute(req.params.id);
    res.json(wishlists);
  });

  return router;
}
EOFROUTES

# Create src/index.ts
cat > src/index.ts << 'EOFINDEX'
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { graphqlHTTP } from 'express-graphql';
import { InMemoryWishlistRepository, InMemoryUserRepository } from './infrastructure/repositories';
import { createRoutes } from './presentation/routes';
import { swaggerDocument } from './presentation/swagger';
import { graphqlSchema, createGraphQLResolvers } from './presentation/graphql';

const app = express();

app.use(cors());
app.use(express.json());

const wishlistRepo = new InMemoryWishlistRepository();
const userRepo = new InMemoryUserRepository();

app.get('/', (req, res) => {
  res.json({
    message: 'Wishlist API - Hexagonal Architecture + DDD',
    endpoints: {
      swagger: '/api-docs',
      graphql: '/graphql',
      rest: '/api'
    }
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const apiRoutes = createRoutes(wishlistRepo, userRepo);
app.use('/api', apiRoutes);

const graphqlResolvers = createGraphQLResolvers(wishlistRepo, userRepo);
app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true
}));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`🔮 GraphQL: http://localhost:${PORT}/graphql`);
  });
}

export default app;
EOFINDEX

# Create README.md
cat > README.md << 'EOFREADME'
# Wishlist API

REST API with Hexagonal Architecture, DDD, and SOLID principles.

## Quick Start

```bash
npm install
npm run dev
```

## Endpoints

- Swagger: http://localhost:3000/api-docs
- GraphQL: http://localhost:3000/graphql
- REST API: http://localhost:3000/api

## Deploy to Vercel

```bash
vercel
```

## Architecture

- Domain Layer: Core business logic
- Application Layer: Use cases
- Infrastructure Layer: Repositories
- Presentation Layer: REST + GraphQL

Built with TypeScript, Express, GraphQL, and Swagger.
EOFREADME

echo "✅ All files created successfully!"
