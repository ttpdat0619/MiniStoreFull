import { AppDataSource } from "../config/db.config.js";
import { UserEntity } from "../entities/user.entity.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(UserEntity);

export const login = async (username, password) => {
    // Find user with Role relation
    const user = await userRepository.findOne({
        where: { Username: username },
        relations: ["role"]
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify password using SHA256 (Hash256)
    // Create SHA256 hash of the input password
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Compare with the hash in database
    // Note: This logic assumes the DB stores the HEX string of the SHA256 hash
    if (hashedPassword !== user.PasswordHash) {
        throw new Error("Invalid password");
    }

    if (!user.IsActive) {
        throw new Error("User Account is not active");
    }

    // Generate JWT
    const payload = {
        UserID: user.UserID,
        Username: user.Username,
        RoleID: user.RoleID,
        RoleName: user.role ? user.role.RoleName : "Unknown"
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "default_secret_key_123456",
        { expiresIn: "24h" }
    );

    return {
        accessToken: token,
        userInfo: payload
    };
};
