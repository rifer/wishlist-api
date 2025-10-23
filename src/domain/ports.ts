import { Wishlist, User } from './entities';

export interface IWishlistRepository {
  findById(id: string): Promise<Wishlist | null>;
  findByUserId(userId: string): Promise<Wishlist[]>;
  save(wishlist: Wishlist): Promise<Wishlist>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Wishlist[]>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
}
