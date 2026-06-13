const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  async registerUser(userData) {
    const { full_name, username, email, password, role, branch_id } =
      userData;

    // check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await prisma.user.create({
      data: {
        full_name,
        username,
        email,
        password_hash: hashedPassword,
        role,
        branch_id: branch_id || null,
      },
    });

    return {
      success: true,
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
    };
  }

  async loginUser(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    const branch = user.branch_id
      ? await prisma.branch.findUnique({ where: { id: user.branch_id }, select: { branch_name: true } })
      : null;

    // update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        branch_name: branch?.branch_name || null,
      },
    };
  }
}

module.exports = new AuthService();