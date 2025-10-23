import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { InMemoryWishlistRepository, InMemoryUserRepository } from './infrastructure/repositories';
import { createRoutes } from './presentation/routes';
import { serveSwaggerUI, serveSwaggerJSON } from './presentation/swagger-ui';
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

// Swagger UI routes
app.get('/api-docs', serveSwaggerUI);
app.get('/api-docs.json', serveSwaggerJSON);

const apiRoutes = createRoutes(wishlistRepo, userRepo);
app.use('/api', apiRoutes);

const graphqlResolvers = createGraphQLResolvers(wishlistRepo, userRepo);
app.use('/graphql', createHandler({
  schema: graphqlSchema,
  rootValue: graphqlResolvers
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
