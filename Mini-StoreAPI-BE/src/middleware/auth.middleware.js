import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

//Middleware Confirm: Check User Login or not (Have valid Token or not
export const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No Token provided!" });
    }

    const bearer = token.split(" ");
    const bearerToken = bearer[1];

    if (!bearerToken) {
        return res.status(403).json({ message: "Malformed token format!" });
    }

    jwt.verify(bearerToken, process.env.JWT_SECRET || "default_secret_key_123456", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        // Save user info has been decoded into req to use next step
        req.user = decoded;
        next();
    });
};

// Middleware Permissions: Allow only specific roles
export const authorize = (roles = []) => {
    // Roles param can be string or array
    if (typeof roles === "string") {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.RoleName))) {
            return res.status(403).json({ message: "Forbidden: Require " + roles.join(" or ") + " role!" });
        }
        next();
    };
};