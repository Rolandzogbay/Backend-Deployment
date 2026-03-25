import Supplier from "../models/suppliers.models.js";
import AppError from "../utils/helpers/app.errors.js";

const normalizeText = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
};

export const createSupplierService = async (businessId, data) => {
    const { name, email, phone_number, contact_person, address, notes } = data;

    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const cleanName = normalizeText(name);
    const cleanEmail = normalizeText(email)?.toLowerCase() || null;
    const cleanPhone = normalizeText(phone_number);
    const cleanContactPerson = normalizeText(contact_person);
    const cleanAddress = normalizeText(address);
    const cleanNotes = normalizeText(notes);

    if (!cleanName) {
        throw new AppError("Supplier name is required", 400);
    }

    const existingSupplier = await Supplier.findOne({
        where: {
            name: cleanName,
            businessId,
        },
    });

    if (existingSupplier) {
        throw new AppError("Supplier with this name already exists", 409);
    }

    const supplier = await Supplier.create({
        name: cleanName,
        email: cleanEmail,
        phone_number: cleanPhone,
        contact_person: cleanContactPerson,
        address: cleanAddress,
        notes: cleanNotes,
        businessId,
    });

    return supplier;
};

export const getSuppliersByBusinessService = async (businessId) => {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    return await Supplier.findAll({
        where: { businessId },
        order: [["createdAt", "DESC"]],
    });
};

export const getSupplierByIdService = async (businessId, id) => {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const supplier = await Supplier.findOne({
        where: { id, businessId },
    });

    if (!supplier) {
        throw new AppError("Supplier not found", 404);
    }

    return supplier;
};

export const updateSupplierService = async (businessId, id, data) => {
    const { name, email, phone_number, contact_person, address, notes } = data;

    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const supplier = await Supplier.findOne({
        where: { id, businessId },
    });

    if (!supplier) {
        throw new AppError("Supplier not found", 404);
    }

    const cleanName = normalizeText(name);
    const cleanEmail = normalizeText(email)?.toLowerCase() || null;
    const cleanPhone = normalizeText(phone_number);
    const cleanContactPerson = normalizeText(contact_person);
    const cleanAddress = normalizeText(address);
    const cleanNotes = normalizeText(notes);

    if (!cleanName) {
        throw new AppError("Supplier name is required", 400);
    }

    const existingSupplier = await Supplier.findOne({
        where: {
            name: cleanName,
            businessId,
        },
    });

    if (existingSupplier && existingSupplier.id !== supplier.id) {
        throw new AppError("Another supplier with this name already exists", 409);
    }

    await supplier.update({
        name: cleanName,
        email: cleanEmail,
        phone_number: cleanPhone,
        contact_person: cleanContactPerson,
        address: cleanAddress,
        notes: cleanNotes,
    });

    return supplier;
};

export const deleteSupplierService = async (businessId, id) => {
    if (!businessId) {
        throw new AppError("Business ID is required", 400);
    }

    const supplier = await Supplier.findOne({
        where: { id, businessId },
    });

    if (!supplier) {
        throw new AppError("Supplier not found", 404);
    }

    await supplier.destroy();

    return true;
};