export class Wishlist {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly items: WishlistItem[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  addItem(item: WishlistItem): Wishlist {
    return new Wishlist(
      this.id,
      this.userId,
      this.name,
      this.description,
      [...this.items, item],
      this.createdAt,
      new Date()
    );
  }

  removeItem(itemId: string): Wishlist {
    return new Wishlist(
      this.id,
      this.userId,
      this.name,
      this.description,
      this.items.filter(item => item.id !== itemId),
      this.createdAt,
      new Date()
    );
  }

  update(name: string, description: string): Wishlist {
    return new Wishlist(
      this.id,
      this.userId,
      name,
      description,
      this.items,
      this.createdAt,
      new Date()
    );
  }
}

export class WishlistItem {
  constructor(
    public readonly id: string,
    public readonly wishlistId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly productUrl: string,
    public readonly price: number,
    public readonly priority: Priority,
    public readonly notes: string,
    public readonly addedAt: Date
  ) {}
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date
  ) {}
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export class WishlistId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Wishlist ID cannot be empty');
    }
  }
}

export class WishlistNotFoundException extends Error {
  constructor(id: string) {
    super(`Wishlist with id ${id} not found`);
    this.name = 'WishlistNotFoundException';
  }
}

export class UserNotFoundException extends Error {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundException';
  }
}
