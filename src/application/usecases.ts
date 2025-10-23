import { Wishlist, WishlistItem, Priority, WishlistNotFoundException, UserNotFoundException } from '../domain/entities';
import { IWishlistRepository, IUserRepository } from '../domain/ports';

export class CreateWishlistUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(userId: string, name: string, description: string): Promise<Wishlist> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const wishlist = new Wishlist(
      this.generateId(),
      userId,
      name,
      description,
      [],
      new Date(),
      new Date()
    );

    return await this.wishlistRepo.save(wishlist);
  }

  private generateId(): string {
    return `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class AddItemToWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(
    wishlistId: string,
    productId: string,
    productName: string,
    productUrl: string,
    price: number,
    priority: Priority,
    notes: string
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findById(wishlistId);
    if (!wishlist) {
      throw new WishlistNotFoundException(wishlistId);
    }

    const item = new WishlistItem(
      this.generateId(),
      wishlistId,
      productId,
      productName,
      productUrl,
      price,
      priority,
      notes,
      new Date()
    );

    const updatedWishlist = wishlist.addItem(item);
    return await this.wishlistRepo.save(updatedWishlist);
  }

  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class GetWishlistsByUserUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(userId: string): Promise<Wishlist[]> {
    return await this.wishlistRepo.findByUserId(userId);
  }
}

export class RemoveItemFromWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(wishlistId: string, itemId: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findById(wishlistId);
    if (!wishlist) {
      throw new WishlistNotFoundException(wishlistId);
    }

    const updatedWishlist = wishlist.removeItem(itemId);
    return await this.wishlistRepo.save(updatedWishlist);
  }
}

export class GetWishlistByIdUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(id: string): Promise<Wishlist | null> {
    return await this.wishlistRepo.findById(id);
  }
}

export class GetAllWishlistsUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(): Promise<Wishlist[]> {
    return await this.wishlistRepo.findAll();
  }
}

export class DeleteWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(id: string): Promise<void> {
    await this.wishlistRepo.delete(id);
  }
}

export class UpdateWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(id: string, name: string, description: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findById(id);
    if (!wishlist) {
      throw new WishlistNotFoundException(id);
    }

    const updatedWishlist = wishlist.update(name, description);
    return await this.wishlistRepo.save(updatedWishlist);
  }
}
