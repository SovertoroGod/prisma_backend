const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class BranchService {
  async createBranch(branchData) {
    const { branch_name, branch_code, address, phone_number } = branchData;

    const existingBranch = await prisma.branch.findUnique({
      where: { branch_code },
    });

    if (existingBranch) {
      throw new Error("Branch code already exists");
    }

    const branch = await prisma.branch.create({
      data: {
        branch_name,
        branch_code,
        address,
        phone_number,
      },
    });

    return branch;
  }

  async getAllBranches(filters) {
    const {
      search,
      branch_name,
      branch_code,
      address,
      phone_number,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const where = {
      AND: [],
    };

    if (branch_name) {
      where.AND.push({
        branch_name: { contains: branch_name },
      });
    }

    if (branch_code) {
      where.AND.push({
        branch_code: { contains: branch_code },
      });
    }

    if (address) {
      where.AND.push({
        address: { contains: address },
      });
    }

    if (phone_number) {
      where.AND.push({
        phone_number: { contains: phone_number },
      });
    }

    if (search) {
      where.AND.push({
        OR: [
          { branch_name: { contains: search } },
          { branch_code: { contains: search } },
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
      prisma.branch.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
      }),
      prisma.branch.count({ where }),
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
 
  async getAllBranchesForUser(filters) {
    const {
      search,
      branch_name,
      branch_code,
      address,
      phone_number,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const where = {
      is_active: true,
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { branch_name: { contains: search } },
          { branch_code: { contains: search } },
        ],
      });
    }

    if (branch_name) {
      where.AND.push({
        branch_name: { contains: branch_name },
      });
    }

    if (branch_code) {
      where.AND.push({
        branch_code: { contains: branch_code },
      });
    }

    if (address) {
      where.AND.push({
        address: { contains: address },
      });
    }

    if (phone_number) {
      where.AND.push({
        phone_number: { contains: phone_number },
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
      prisma.branch.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
      }),
      prisma.branch.count({ where }),
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

  async updateBranch(id, branchData) {
    const existingBranch = await prisma.branch.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBranch) {
      throw new Error("Branch not exist");
    }

    const { branch_name, branch_code, address, phone_number, is_active } =
      branchData;

    // duplicate checks
    if (branch_name && branch_name !== existingBranch.branch_name) {
      const duplicate = await prisma.branch.findFirst({
        where: {
          branch_name,
          NOT: { id: existingBranch.id },
        },
      });
      if (duplicate) throw new Error("Branch name already exists");
    }

    if (branch_code && branch_code !== existingBranch.branch_code) {
      const duplicate = await prisma.branch.findFirst({
        where: {
          branch_code,
          NOT: { id: existingBranch.id },
        },
      });
      if (duplicate) throw new Error("Branch code already exists");
    }

    // detect no changes
    const hasChanges =
      (branch_name && branch_name !== existingBranch.branch_name) ||
      (branch_code && branch_code !== existingBranch.branch_code) ||
      (address && address !== existingBranch.address) ||
      (phone_number && phone_number !== existingBranch.phone_number) ||
      (is_active !== undefined && is_active !== existingBranch.is_active);

    if (!hasChanges) {
      throw new Error("No changes detected");
    }

    const updated = await prisma.branch.update({
      where: { id: existingBranch.id },
      data: {
        ...(branch_name && { branch_name }),
        ...(branch_code && { branch_code }),
        ...(address && { address }),
        ...(phone_number && { phone_number }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    return {
      updatedId: updated.id,
      message: "Branch updated successfully",
    };
  }

  async deleteBranch(id) {
    const updated = await prisma.branch.updateMany({
      where: { id: parseInt(id), is_active: true },
      data: { is_active: false },
    });

    if (updated.count === 0) {
      throw new Error("Branch not found or already deactivated");
    }

    return {
      deletedId: id,
      message: "Branch deletion is successful",
    };
  }

  async getBranchById(id) {
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(id) },
    });

    if (!branch) {
      throw new Error("Branch not found");
    }

    return {
      message: `${branch.branch_name} is here!`,
      data: branch,
    };
  }
}

module.exports = new BranchService();