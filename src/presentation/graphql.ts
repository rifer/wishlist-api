import { buildSchema } from 'graphql';
import { IWishlistRepository, IUserRepository } from '../domain/ports';
import {
  CreateWishlistUseCase,
  AddItemToWishlistUseCase,
  RemoveItemFromWishlistUseCase,
  GetWishlistsByUserUseCase,
  GetWishlistByIdUseCase,
  GetAllWishlistsUseCase,
  UpdateWishlistUseCase,
  DeleteWishlistUseCase,
  SetDefaultWishlistUseCase,
  MoveItemsUseCase
} from '../application/usecases';

export const graphqlSchema = buildSchema(`
  type Wishlist {
    id: String!
    userId: String!
    name: String!
    description: String!
    items: [WishlistItem!]!
    isDefault: Boolean!
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
    currency: String!
    thumbnail: String!
    addedAt: String!
  }

  type User {
    id: String!
    email: String!
    name: String!
    createdAt: String!
    wishlists: [Wishlist!]!
  }

  type MoveItemsResult {
    source: Wishlist!
    destination: Wishlist!
  }

  type Query {
    wishlists: [Wishlist!]!
    wishlist(id: String!): Wishlist
    users: [User!]!
    user(id: String!): User
    userWishlists(userId: String!): [Wishlist!]!
  }

  type Mutation {
    createWishlist(userId: String!, name: String!, description: String!, isDefault: Boolean): Wishlist!
    updateWishlist(id: String!, name: String!, description: String!, isDefault: Boolean): Wishlist!
    deleteWishlist(id: String!): Boolean!
    setDefaultWishlist(id: String!): Wishlist!
    addItemToWishlist(
      wishlistId: String!
      productId: String!
      productName: String!
      productUrl: String!
      price: Float!
      priority: String!
      notes: String!
      currency: String
      thumbnail: String
    ): Wishlist!
    removeItemFromWishlist(wishlistId: String!, itemId: String!): Wishlist!
    moveItems(sourceListId: String!, destinationListId: String!, itemIds: [String!]!): MoveItemsResult!
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
  const updateWishlistUC = new UpdateWishlistUseCase(wishlistRepo);
  const deleteWishlistUC = new DeleteWishlistUseCase(wishlistRepo);
  const setDefaultWishlistUC = new SetDefaultWishlistUseCase(wishlistRepo);
  const moveItemsUC = new MoveItemsUseCase(wishlistRepo);

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
    createWishlist: ({ userId, name, description, isDefault }: any) =>
      createWishlistUC.execute(userId, name, description, isDefault || false),
    updateWishlist: ({ id, name, description, isDefault }: any) =>
      updateWishlistUC.execute(id, name, description, isDefault),
    deleteWishlist: async ({ id }: { id: string }) => {
      await deleteWishlistUC.execute(id);
      return true;
    },
    setDefaultWishlist: ({ id }: { id: string }) =>
      setDefaultWishlistUC.execute(id),
    addItemToWishlist: (args: any) =>
      addItemUC.execute(
        args.wishlistId,
        args.productId,
        args.productName,
        args.productUrl,
        args.price,
        args.priority,
        args.notes,
        args.currency || 'EUR',
        args.thumbnail || ''
      ),
    removeItemFromWishlist: ({ wishlistId, itemId }: any) =>
      removeItemUC.execute(wishlistId, itemId),
    moveItems: ({ sourceListId, destinationListId, itemIds }: any) =>
      moveItemsUC.execute(sourceListId, destinationListId, itemIds)
  };
}
