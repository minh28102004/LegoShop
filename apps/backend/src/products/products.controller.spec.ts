import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  it('delegates the public catalog query to the products service', async () => {
    const findPublicProducts = jest.fn().mockResolvedValue({
      items: [],
      meta: { page: 1, pageSize: 12, totalItems: 0, totalPages: 1 },
    });
    const controller = new ProductsController({
      findPublicProducts,
    } as unknown as ProductsService);

    const query = { page: 1, pageSize: 12 };
    await expect(controller.findPublicProducts(query)).resolves.toMatchObject({
      items: [],
    });
    expect(findPublicProducts).toHaveBeenCalledWith(query);
  });
});
