import Customer from '../models/customers.models.js'
import AppError from "../utils/helpers/app.errors.js";

export const createCustomerService = async (businessId, data) => {
    const { name, email, phone_number } = data;

    if (!name || !email) {
        throw new AppError("Name and email are required", 400);
    }

    const existingCustomer = await Customer.findOne({
        where: {
            email: String(email).trim().toLowerCase(),
            businessId
        }
    });

    if (existingCustomer) {
        throw new AppError("Customer with this email already exists", 409);
    }

    const customer = await Customer.create({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone_number: phone_number || null,
        businessId
    });

    return customer;
};

export const getCustomersByBusinessService = async (businessId) => {
    const customers = await Customer.findAll({
        where: { businessId },
        order: [["createdAt", "DESC"]]
    });

    return customers;
};

export const getCustomerByIdService = async (id, businessId) => {
    const customer = await Customer.findOne({
        where: { id, businessId }
    });

    if (!customer) {
        throw new AppError("Customer not found", 404);
    }

    return customer;
};

export const updateCustomerService = async (id, businessId, data) => {
    const customer = await Customer.findOne({
        where: { id, businessId }
    });

    if (!customer) {
        throw new AppError("Customer not found", 404);
    }

    const updates = {};

    if (data.name !== undefined) {
        if (!String(data.name).trim()) {
            throw new AppError("Customer name cannot be empty", 400);
        }
        updates.name = String(data.name).trim();
    }

    if (data.email !== undefined) {
        const email = String(data.email).trim().toLowerCase();

        const existingCustomer = await Customer.findOne({
            where: { email, businessId }
        });

        if (existingCustomer && existingCustomer.id !== customer.id) {
            throw new AppError("Another customer with this email already exists", 409);
        }

        updates.email = email;
    }

    if (data.phone_number !== undefined) {
        updates.phone_number = data.phone_number;
    }

    await customer.update(updates);

    return customer;
};

export const deleteCustomerService = async (id, businessId) => {
    const customer = await Customer.findOne({
        where: { id, businessId }
    });

    if (!customer) {
        throw new AppError("Customer not found", 404);
    }

    await customer.destroy();

    return { message: "Customer deleted successfully" };
};

export const findOrCreateCustomerService = async (businessId, data) => {
    const { name, email, phone_number } = data;

    if (!name || !email) {
        throw new AppError("Customer name and email are required", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let customer = await Customer.findOne({
        where: {
            email: normalizedEmail,
            businessId
        }
    });

    if (!customer) {
        customer = await Customer.create({
            name: String(name).trim(),
            email: normalizedEmail,
            phone_number: phone_number || null,
            businessId
        });
    }

    return customer;
};