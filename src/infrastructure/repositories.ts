import { Wishlist, WishlistItem, User, Priority } from '../domain/entities';
import { IWishlistRepository, IUserRepository } from '../domain/ports';

export class InMemoryWishlistRepository implements IWishlistRepository {
  private wishlists: Map<string, Wishlist> = new Map();

  constructor() {
    this.seedData();
  }

  async findById(id: string): Promise<Wishlist | null> {
    return this.wishlists.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values()).filter(w => w.userId === userId);
  }

  async save(wishlist: Wishlist): Promise<Wishlist> {
    this.wishlists.set(wishlist.id, wishlist);
    return wishlist;
  }

  async delete(id: string): Promise<void> {
    this.wishlists.delete(id);
  }

  async findAll(): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values());
  }

  private seedData(): void {
    const item1 = new WishlistItem(
      'item_1',
      'wl_1',
      'prod_1',
      'Mechanical Keyboard',
      'https://example.com/keyboard',
      150.00,
      Priority.HIGH,
      'Need for gaming setup',
      'EUR',
      '',
      new Date('2025-01-15')
    );

    const item2 = new WishlistItem(
      'item_2',
      'wl_1',
      'prod_2',
      'Ergonomic Mouse',
      'https://example.com/mouse',
      80.00,
      Priority.MEDIUM,
      'For better productivity',
      'EUR',
      '',
      new Date('2025-01-20')
    );

    const item3 = new WishlistItem(
      'item_3',
      'wl_2',
      'prod_3',
      'Running Shoes',
      'https://example.com/shoes',
      120.00,
      Priority.HIGH,
      'For marathon training',
      'USD',
      '',
      new Date('2025-02-01')
    );

    const item4 = new WishlistItem(
      'item_4',
      'wl_2',
      'prod_4',
      'Fitness Tracker',
      'https://example.com/tracker',
      200.00,
      Priority.MEDIUM,
      'Track my progress',
      'USD',
      '',
      new Date('2025-02-05')
    );

    const wishlist1 = new Wishlist(
      'wl_1',
      'user_1',
      'Tech Wishlist',
      'Gadgets and tech items I want',
      [item1, item2],
      new Date('2025-01-10'),
      new Date('2025-01-20')
    );

    const wishlist2 = new Wishlist(
      'wl_2',
      'user_1',
      'Fitness Goals',
      'Items for my fitness journey',
      [item3, item4],
      new Date('2025-02-01'),
      new Date('2025-02-05')
    );

    const wishlist3 = new Wishlist(
      'wl_3',
      'user_2',
      'Home Improvement',
      'Things for the house',
      [],
      new Date('2025-01-25'),
      new Date('2025-01-25')
    );

    this.wishlists.set(wishlist1.id, wishlist1);
    this.wishlists.set(wishlist2.id, wishlist2);
    this.wishlists.set(wishlist3.id, wishlist3);
  }
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedData();
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  private seedData(): void {
    const user1 = new User('user_1', 'john@example.com', 'John Doe', new Date('2024-12-01'));
    const user2 = new User('user_2', 'jane@example.com', 'Jane Smith', new Date('2024-12-15'));
    const user3 = new User('user_3', 'bob@example.com', 'Bob Wilson', new Date('2025-01-05'));

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
  }
}
