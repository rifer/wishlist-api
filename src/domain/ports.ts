import { Wishlist, User } from './entities';

export interface IWishlistRepository {
  findById(id: string): Promise<Wishlist | null>;
  findByUserId(userId: string): Promise<Wishlist[]>;
  findByUserIdAndName(userId: string, name: string): Promise<Wishlist | null>;
  save(wishlist: Wishlist): Promise<Wishlist>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Wishlist[]>;
  clearDefaultForUser(userId: string): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
}
