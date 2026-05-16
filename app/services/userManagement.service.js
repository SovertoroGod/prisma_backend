const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserManagementService {
    async getAllUsers(userData) {
        const {
            search,
            full_name,
            username,
            email,
            role,
            branch_id,
            startDate,
            endDate,
            is_active,
            page = 1,
            limit = 10,
        } = userData;

        const where = {
            AND: []
        };
        if (search) {
            where.AND.push({
                OR: [
                    { full_name: { contains: search } },
                    { username: { contains: search } },
                    { email: { contains: search } },
                ],
            });
        }
        if (full_name) {
            where.AND.push({
                full_name: { contains: full_name },
            });
        }
        if(username){
            where.AND.push({
                username: { contains: username },
            });
        }
        if(email){
            where.AND.push({
                email: { contains: email },
            });
        }
        if(role){
            where.AND.push({
                role: { contains: role },
            });
        }
        if(branch_id){
            where.AND.push({
                branch_id: { equals: branch_id },
            });
        }
        if(startDate){
            where.AND.push({
                created_at: { gte: startDate },
            });
        }
        if(endDate){
            where.AND.push({
                created_at: { lte: endDate },
            });
        }
        if(is_active){
            where.AND.push({
                is_active: { equals: is_active },
            });
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: "desc" },
            }),
            prisma.user.count({ where }),
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
            
    };

    async getUserById(id) {
        const result = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        })
        if(!result){
            throw new Error("User not found");
        }
        return {
            message: "User found",
            data: result
        };
    }
    async updateUser(id, userData) {
        const { full_name, username, email, role, branch_id, is_active } = userData;
        
        const existingUser = await prisma.user.findUnique({
            where: {
                id : parseInt(id)
            }
        })
        if (!existingUser) {
            throw new Error("User not found");
        }

        if(username && username !== existingUser.username){
            const duplicate = await prisma.user.findFirst({
                where: {
                    username,
                },
            });
            if (duplicate) throw new Error("Username already exists");
        }
        if(email && email !== existingUser.email){
            const duplicate = await prisma.user.findFirst({
                where: {
                    email,
                },
            });
            if (duplicate) throw new Error("Email already exists");
        }

        const hasChanges =
            (full_name && full_name !== existingUser.full_name) ||
            (username && username !== existingUser.username) ||
            (email && email !== existingUser.email) ||
            (role && role !== existingUser.role) ||
            (branch_id && branch_id !== existingUser.branch_id) ||
            (is_active !== undefined && is_active !== existingUser.is_active);
        
        if (!hasChanges) {
            throw new Error("No changes detected");
        }
        
        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(full_name && { full_name }),
                ...(username && { username }),
                ...(email && { email }),
                ...(role && { role }),
                ...(branch_id && { branch_id }),
                ...(is_active !== undefined && { is_active }),
            },
        });
        return {
            updatedId: user.id,
            message: "User updated successfully",
        };
    };
    async deleteUser(id) {
        const result = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                is_active: false,
            }
        });
        if (!result) {
            throw new Error("User not found");
        }
        return {
            deletedId: result.id,
            message: "User deleted successfully",
        };
    }
}

module.exports = new UserManagementService();
