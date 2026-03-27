import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = "uploads/imports";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExt = [".csv", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExt.includes(ext)) {
        return cb(new Error("Only CSV and Excel files are allowed"));
    }

    cb(null, true);
};

const importUpload = multer({
    storage,
    fileFilter,
});

export default importUpload;