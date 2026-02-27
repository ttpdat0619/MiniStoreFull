import * as authService from "../services/auth.service.js";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const data = await authService.login(username, password);

        return res.status(200).json({
            message: "Login successful",
            data: data
        });
    } catch (error) {
        console.error("Login Error:", error);

        if (error.message === "User not found" || error.message === "Invalid password") {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (error.message === "User Account is not active") {
            return res.status(403).json({
                message: "Account is inactive"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
