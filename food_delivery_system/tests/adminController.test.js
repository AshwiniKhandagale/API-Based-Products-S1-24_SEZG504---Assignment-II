
const { createUser } = require('../controllers/adminController'); // Adjust path
const bcrypt = require('bcryptjs'); // bcryptjs for password hashing
const jwt = require('jsonwebtoken'); // For JWT token verification
const User = require('../models/User'); // Adjust path
const mockResponse = () => {
    let res = {};
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
};
const mockRequest = (role) => {
    return {
        body: {
            email: "vikhyatsoral03@gmail.com",
            password: "securePassword12311",
            role: role,  // Dynamic role
            profile: {
                name: "vikhyat",
                contactDetails: "12333",
                address: "123 Street, City india",
                deliveryAddress: {
                    street: "Baner",
                    city: "pune",
                    postalCode: "411067",
                    country: "India"
                },
                paymentDetails: {
                    cardNumber: "4432-9989-0000-1234",
                    expirationDate: "07-03-1998",
                    cvv: "123"
                }
            }
        }
    };
};

// Mocking jsonwebtoken and bcryptjs
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Admin Controller - createUser', () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();

        // Mock the bcrypt.hash method
        bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword123');  // Mock hashed password

        // Mock JWT verify if it interacts with the createUser function
        jwt.verify.mockImplementation(() => {
            return { role: 'Admin' };  // Mock a decoded token for admin role
        });
    });

    it('should create a new customer user successfully', async () => {
        req = mockRequest('Customer');  // Create request with role 'Customer'

        // Create a mock for the User model's save method
        const saveMock = jest.fn().mockResolvedValue(req.body);  // Mock save method to return the user data
        User.prototype.save = saveMock;

        // Call the createUser function
        await createUser(req, res);

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith('securePassword12311', 10); // Ensure password hashing
        expect(res.status).toHaveBeenCalledWith(201); // Ensure correct status code
        expect(res.send).toHaveBeenCalledWith({
            message: 'Customer created successfully',
            user: expect.objectContaining({
                email: 'vikhyatsoral03@gmail.com',
                role: 'Customer',
                profile: expect.objectContaining({
                    name: 'vikhyat',
                    contactDetails: '12333',
                    address: '123 Street, City india',
                }),
            }),
        });  // Ensure the response is correct
    });

    it('should create a new restaurant owner user successfully', async () => {
        req = mockRequest('Restaurant Owner');  // Create request with role 'Restaurant Owner'

        // Create a mock for the User model's save method
        const saveMock = jest.fn().mockResolvedValue(req.body);  // Mock save method to return the user data
        User.prototype.save = saveMock;

        // Call the createUser function
        await createUser(req, res);

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith('securePassword12311', 10); // Ensure password hashing
        expect(res.status).toHaveBeenCalledWith(201); // Ensure correct status code
        expect(res.send).toHaveBeenCalledWith({
            message: 'Restaurant Owner created successfully',
            user: expect.objectContaining({
                email: 'vikhyatsoral03@gmail.com',
                role: 'Restaurant Owner',
                profile: expect.objectContaining({
                    name: 'vikhyat',
                    contactDetails: '12333',
                    address: '123 Street, City india',
                }),
            }),
        });  // Ensure the response is correct
    });

    it('should create a new delivery personnel user successfully', async () => {
        req = mockRequest('Delivery Personnel');  // Create request with role 'Delivery Personnel'

        // Create a mock for the User model's save method
        const saveMock = jest.fn().mockResolvedValue(req.body);  // Mock save method to return the user data
        User.prototype.save = saveMock;

        // Call the createUser function
        await createUser(req, res);

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith('securePassword12311', 10); // Ensure password hashing
        expect(res.status).toHaveBeenCalledWith(201); // Ensure correct status code
        expect(res.send).toHaveBeenCalledWith({
            message: 'Delivery Personnel created successfully',
            user: expect.objectContaining({
                email: 'vikhyatsoral03@gmail.com',
                role: 'Delivery Personnel',
                profile: expect.objectContaining({
                    name: 'vikhyat',
                    contactDetails: '12333',
                    address: '123 Street, City india',
                }),
            }),
        });  // Ensure the response is correct
    });

    it('should create a new administrator user successfully', async () => {
        req = mockRequest('Administrator');  // Create request with role 'Administrator'

        // Create a mock for the User model's save method
        const saveMock = jest.fn().mockResolvedValue(req.body);  // Mock save method to return the user data
        User.prototype.save = saveMock;

        // Call the createUser function
        await createUser(req, res);

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith('securePassword12311', 10); // Ensure password hashing
        expect(res.status).toHaveBeenCalledWith(201); // Ensure correct status code
        expect(res.send).toHaveBeenCalledWith({
            message: 'Administrator created successfully',
            user: expect.objectContaining({
                email: 'vikhyatsoral03@gmail.com',
                role: 'Administrator',
                profile: expect.objectContaining({
                    name: 'vikhyat',
                    contactDetails: '12333',
                    address: '123 Street, City india',
                }),
            }),
        });  // Ensure the response is correct
    });

    it('should return 400 if password is not provided', async () => {
        req.body.password = ''; // Empty password to test validation

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400); // Ensure the correct error status
        expect(res.send).toHaveBeenCalledWith('Password is required');  // Ensure error message is correct
    });

    it('should return 400 if role is invalid', async () => {
        req.body.role = 'InvalidRole';  // Invalid role to test validation

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400); // Ensure the correct error status
        expect(res.send).toHaveBeenCalledWith('Invalid role specified');  // Ensure error message is correct
    });
});
