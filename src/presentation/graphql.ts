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
