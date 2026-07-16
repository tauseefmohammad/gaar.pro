import path from "path";
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "/home/uploads";

export const EMPLOYEE_UPLOAD_DIR = path.join(UPLOAD_DIR, "employees");