const { PrismaClient } = require("@prisma/client");
const { connect } = require("../routes/category.routes");
const prisma = new PrismaClient();

class CategoryService {
  async createCategory(data) {
    const { name, parent_id, description, is_active = true } = data;
    const parsedParentId = parent_id ? parseInt(parent_id) : null;
    const existingCategory = await prisma.category.findUnique({
      where: {
        name,
      },
    });
    if (existingCategory) {
      throw new Error("Category already exists");
    }
    if (parsedParentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parsedParentId },
      });

      if (!parentCategory) {
        throw new Error("Parent category not found");
      }
    }
    const result = await prisma.category.create({
      data: {
        name,
        parent: parsedParentId
          ? {
              connect: { id: parsedParentId },
            }
          : undefined,
        description,
        is_active,
      },
    });
    return result;
  }
  async getAllCategories(categoryData) {
    //   console.log(categoryData, "category data")
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      search,
      is_active,
      parent_id,
      type,
    } = categoryData;
    const andConditions = [];
    if (search) {
      andConditions.push({
        name: {
          contains: search,
        },
      });
    }
    if (is_active !== undefined && is_active !== "") {
      andConditions.push({
        is_active: is_active === "true",
      });
    }
    if (parent_id) {
      andConditions.push({
        parent_id: parseInt(parent_id),
      });
    }
    if (startDate || endDate) {
      andConditions.push({
        created_at: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate + "T23:59:59") : undefined,
        },
      });
    }
    if (type === "parent") {
      andConditions.push({ parent_id: null });
    }

    if (type === "sub") {
      andConditions.push({
        parent_id: { not: null },
      });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
      }),
      prisma.category.count({ where }),
    ]);
    return {
      data,
      metadata: {
        totalItems: total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    };
  }
  async getCategoryById(id) {
    const categoryData = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });
    if (!categoryData) {
      throw new Error("Category is not exist or deleted");
    }
    return {
      categoryData,
      message: "Category is retrieved successfully"
    }
  }
  async updateCategory(id, data) {
    const { name, parent_id, description, is_active } = data;
    // const parsedParentId = parent_id ? parseInt(parent_id) : null;
    const parsedParentId = parent_id !== undefined && parent_id !== null ? parseInt(parent_id) : undefined;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCategory) {
      throw new Error("Category not found");
    }
    
    // Check if new name already exists (excluding current category)
    if (name && name !== existingCategory.name) {
      const nameCheck = await prisma.category.findUnique({
        where: { name }
      });
      if (nameCheck) {
        throw new Error("Category name already exists");
      }
    }

    if (parsedParentId == parseInt(id)) {
      throw new Error("Category cannot be its own parent");
    }
    
    // Validate parent category if provided
    if (parsedParentId !== undefined) {
      if (parsedParentId !== null) {
        const parentCategory = await prisma.category.findUnique({
        where: { id: parsedParentId }
        });
        if (!parentCategory) {
        throw new Error("Parent category not found");
      }
      }
    }

    const updateData = {
      name: name ?? existingCategory.name,
      description: description !== undefined ? description : existingCategory.description,
      is_active: is_active !== undefined ? is_active : existingCategory.is_active
    }

    if (parsedParentId !== undefined) {
      if (parsedParentId === null) {
        updateData.parent = {
          disconnect: true
        }
      } else {
        updateData.parent = {
          connect: { id: parsedParentId },
        }
      }
    }
    
    // Update category
    const result = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return {
      categoryData: result,
      message: "Category is updated successfully"
    };
  }
}

module.exports = new CategoryService();
