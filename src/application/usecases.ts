import { Wishlist, WishlistItem, Priority, WishlistNotFoundException, UserNotFoundException, DuplicateWishlistNameException, WishlistItemNotFoundException } from '../domain/entities';
import { IWishlistRepository, IUserRepository } from '../domain/ports';

export class CreateWishlistUseCase {
  constructor(
    private readonly wishlistRepo: IWishlistRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(userId: string, name: string, description: string, isDefault: boolean = false): Promise<Wishlist> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Check for duplicate name
    const existingWishlist = await this.wishlistRepo.findByUserIdAndName(userId, name);
    if (existingWishlist) {
      throw new DuplicateWishlistNameException(name, userId);
    }

    // If this wishlist is being set as default, clear the default status from other wishlists
    if (isDefault) {
      await this.wishlistRepo.clearDefaultForUser(userId);
    }

    const wishlist = new Wishlist(
      this.generateId(),
      userId,
      name,
      description,
      [],
      isDefault,
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
    notes: string,
    currency: string = 'EUR',
    thumbnail: string = ''
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
      currency,
      thumbnail,
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

  async execute(id: string, name: string, description: string, isDefault?: boolean): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findById(id);
    if (!wishlist) {
      throw new WishlistNotFoundException(id);
    }

    // Check for duplicate name (only if the name is changing)
    if (wishlist.name.toLowerCase() !== name.toLowerCase()) {
      const existingWishlist = await this.wishlistRepo.findByUserIdAndName(wishlist.userId, name);
      if (existingWishlist) {
        throw new DuplicateWishlistNameException(name, wishlist.userId);
      }
    }

    // Update basic fields
    let updatedWishlist = wishlist.update(name, description);

    // Handle isDefault if provided
    if (isDefault !== undefined && isDefault !== wishlist.isDefault) {
      if (isDefault) {
        // If setting as default, clear other defaults first
        await this.wishlistRepo.clearDefaultForUser(wishlist.userId);
      }
      updatedWishlist = updatedWishlist.setDefault(isDefault);
    }

    return await this.wishlistRepo.save(updatedWishlist);
  }
}

export class SetDefaultWishlistUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(id: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findById(id);
    if (!wishlist) {
      throw new WishlistNotFoundException(id);
    }

    // Clear default for all other wishlists of this user
    await this.wishlistRepo.clearDefaultForUser(wishlist.userId);

    // Set this wishlist as default
    const updatedWishlist = wishlist.setDefault(true);
    return await this.wishlistRepo.save(updatedWishlist);
  }
}

export class MoveItemsUseCase {
  constructor(private readonly wishlistRepo: IWishlistRepository) {}

  async execute(sourceListId: string, destinationListId: string, itemIds: string[]): Promise<{ source: Wishlist; destination: Wishlist }> {
    // Fetch both wishlists
    const sourceList = await this.wishlistRepo.findById(sourceListId);
    if (!sourceList) {
      throw new WishlistNotFoundException(sourceListId);
    }

    const destinationList = await this.wishlistRepo.findById(destinationListId);
    if (!destinationList) {
      throw new WishlistNotFoundException(destinationListId);
    }

    // Find items to move
    const itemsToMove: WishlistItem[] = [];
    const notFoundItems: string[] = [];

    for (const itemId of itemIds) {
      const item = sourceList.items.find(i => i.id === itemId);
      if (item) {
        itemsToMove.push(item);
      } else {
        notFoundItems.push(itemId);
      }
    }

    // If any items not found, throw error
    if (notFoundItems.length > 0) {
      throw new WishlistItemNotFoundException(notFoundItems.join(', '));
    }

    // Remove items from source list
    let updatedSourceList = sourceList;
    for (const item of itemsToMove) {
      updatedSourceList = updatedSourceList.removeItem(item.id);
    }

    // Add items to destination list (update wishlistId)
    let updatedDestinationList = destinationList;
    for (const item of itemsToMove) {
      const newItem = new WishlistItem(
        item.id,
        destinationListId,
        item.productId,
        item.productName,
        item.productUrl,
        item.price,
        item.priority,
        item.notes,
        item.currency,
        item.thumbnail,
        item.addedAt
      );
      updatedDestinationList = updatedDestinationList.addItem(newItem);
    }

    // Save both wishlists
    const savedSource = await this.wishlistRepo.save(updatedSourceList);
    const savedDestination = await this.wishlistRepo.save(updatedDestinationList);

    return {
      source: savedSource,
      destination: savedDestination
    };
  }
}
