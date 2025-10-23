import { Router, Request, Response } from 'express';
import { Priority } from '../domain/entities';
import {
  CreateWishlistUseCase,
  AddItemToWishlistUseCase,
  GetWishlistsByUserUseCase,
  RemoveItemFromWishlistUseCase,
  GetWishlistByIdUseCase,
  GetAllWishlistsUseCase,
  DeleteWishlistUseCase,
  UpdateWishlistUseCase,
  MoveItemsUseCase
} from '../application/usecases';
import { IWishlistRepository, IUserRepository } from '../domain/ports';

export function createRoutes(
  wishlistRepo: IWishlistRepository,
  userRepo: IUserRepository
): Router {
  const router = Router();

  const createWishlistUC = new CreateWishlistUseCase(wishlistRepo, userRepo);
  const addItemUC = new AddItemToWishlistUseCase(wishlistRepo);
  const getWishlistsByUserUC = new GetWishlistsByUserUseCase(wishlistRepo);
  const removeItemUC = new RemoveItemFromWishlistUseCase(wishlistRepo);
  const getWishlistByIdUC = new GetWishlistByIdUseCase(wishlistRepo);
  const getAllWishlistsUC = new GetAllWishlistsUseCase(wishlistRepo);
  const deleteWishlistUC = new DeleteWishlistUseCase(wishlistRepo);
  const updateWishlistUC = new UpdateWishlistUseCase(wishlistRepo);
  const moveItemsUC = new MoveItemsUseCase(wishlistRepo);

  router.get('/wishlists', async (req: Request, res: Response) => {
    const wishlists = await getAllWishlistsUC.execute();
    res.json(wishlists);
  });

  router.get('/wishlists/:id', async (req: Request, res: Response) => {
    const wishlist = await getWishlistByIdUC.execute(req.params.id);
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });
    res.json(wishlist);
  });

  router.post('/wishlists', async (req: Request, res: Response) => {
    try {
      const wishlist = await createWishlistUC.execute(req.body.userId, req.body.name, req.body.description);
      res.status(201).json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.put('/wishlists/:id', async (req: Request, res: Response) => {
    try {
      const wishlist = await updateWishlistUC.execute(req.params.id, req.body.name, req.body.description);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.delete('/wishlists/:id', async (req: Request, res: Response) => {
    await deleteWishlistUC.execute(req.params.id);
    res.status(204).send();
  });

  router.post('/wishlists/:id/items', async (req: Request, res: Response) => {
    try {
      const wishlist = await addItemUC.execute(
        req.params.id,
        req.body.productId,
        req.body.productName,
        req.body.productUrl,
        req.body.price,
        req.body.priority,
        req.body.notes,
        req.body.currency || 'EUR',
        req.body.thumbnail || ''
      );
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.delete('/wishlists/:wishlistId/items/:itemId', async (req: Request, res: Response) => {
    try {
      const wishlist = await removeItemUC.execute(req.params.wishlistId, req.params.itemId);
      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.post('/wishlists/move-items', async (req: Request, res: Response) => {
    try {
      const { sourceListId, destinationListId, itemIds } = req.body;
      const result = await moveItemsUC.execute(sourceListId, destinationListId, itemIds);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.get('/users', async (req: Request, res: Response) => {
    const users = await userRepo.findAll();
    res.json(users);
  });

  router.get('/users/:id/wishlists', async (req: Request, res: Response) => {
    const wishlists = await getWishlistsByUserUC.execute(req.params.id);
    res.json(wishlists);
  });

  return router;
}
