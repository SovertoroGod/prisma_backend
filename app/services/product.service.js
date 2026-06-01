const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductService {
  async createProduct(productData) {
    const { name, sku, description, price, category_id } = productData;

    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new Error("Product SKU already exists");
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        price,
        category_id: category_id ? parseInt(category_id) : undefined,
      },
    });

    return product;
  }

  async getAllProducts(filters) {
    const {
      search,
      name,
      sku,
      category_id,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const where = {
      AND: [],
    };

    if (name) {
      where.AND.push({
        name: { contains: name },
      });
    }

    if (sku) {
      where.AND.push({
        sku: { contains: sku },
      });
    }

    if (category_id) {
      where.AND.push({
        category_id: parseInt(category_id),
      });
    }

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      });
    }

    if (startDate || endDate) {
      where.AND.push({
        created_at: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate + "T23:59:59") : undefined,
        },
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      metadata: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      data,
    };
  }

  async getAllProductsForUser(filters) {
    const {
      search,
      name,
      sku,
      category_id,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const where = {
      is_active: true,
      AND: [],
    };

    if (name) {
      where.AND.push({
        name: { contains: name },
      });
    }

    if (sku) {
      where.AND.push({
        sku: { contains: sku },
      });
    }

    if (category_id) {
      where.AND.push({
        category_id: parseInt(category_id),
      });
    }

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      });
    }

    if (startDate || endDate) {
      where.AND.push({
        created_at: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate + "T23:59:59") : undefined,
        },
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      metadata: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      data,
    };
  }

  async updateProduct(id, productData) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      throw new Error("Product does not exist");
    }

    const { name, sku, description, price, category_id, is_active } = productData;

    // duplicate checks
    if (sku && sku !== existingProduct.sku) {
      const duplicate = await prisma.product.findFirst({
        where: {
          sku,
          NOT: { id: existingProduct.id },
        },
      });
      if (duplicate) throw new Error("Product SKU already exists");
    }

    // detect no changes
    const hasChanges =
      (name && name !== existingProduct.name) ||
      (sku && sku !== existingProduct.sku) ||
      (description !== undefined && description !== existingProduct.description) ||
      (price !== undefined && parseFloat(price) !== parseFloat(existingProduct.price)) ||
      (category_id !== undefined && parseInt(category_id) !== existingProduct.category_id) ||
      (is_active !== undefined && is_active !== existingProduct.is_active);

    if (!hasChanges) {
      throw new Error("No changes detected");
    }

    const updated = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        ...(name && { name }),
        ...(sku && { sku }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(category_id !== undefined && { category_id: parseInt(category_id) }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    return {
      updatedId: updated.id,
      message: "Product updated successfully",
    };
  }

  async deleteProduct(id) {
    const updated = await prisma.product.updateMany({
      where: { id: parseInt(id), is_active: true },
      data: { is_active: false },
    });

    if (updated.count === 0) {
      throw new Error("Product not found or already deactivated");
    }

    return {
      deletedId: id,
      message: "Product deletion is successful",
    };
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      message: `${product.name} is here!`,
      data: product,
    };
  }
}

module.exports = new ProductService();
