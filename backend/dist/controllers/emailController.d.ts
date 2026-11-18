import { Request, Response } from "express";
export declare const sendEmail: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getGraphAuthUrl: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const handleGraphCallback: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const checkGraphStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
