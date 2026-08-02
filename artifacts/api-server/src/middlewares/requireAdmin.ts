import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new error  ("JWT_SECRET belum di-set");
}

export interface AuthPayload{
    sub: number;
    role: "admin" | "mahasiswa";
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({error: "Unauthorized"});
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

        if(payload.role !== "admin") {
            res.status(403).json({error: "Forbidden"});
            return;
        }

        req.user = payload;
        next()
    } catch {
        res.status(401).json({error: "Unauthorized"});
    }
}