import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { createHandler } from 'graphql-http/lib/use/express';
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
