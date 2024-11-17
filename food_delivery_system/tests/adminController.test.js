// Import dependencies
const { createUser } = require('../controllers/adminController'); 
const bcrypt = require('bcryptjs'); // bcryptjs for password hashing
const jwt = require('jsonwebtoken'); // For JWT token verification
const User = require('../models/User'); 
const mockResponse = () => {
    let res = {};
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
};
const mockRequest = () => {
    return {
        body: {
            email: "vikhyatsoral03@gmail.com",
            password: "securePassword12311",
            role: "Customer",
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
        req = mockRequest();
        res = mockResponse();

        // Mock the bcrypt.hash method
        bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword123');  // Mock hashed password

        // Mock JWT verify if it interacts with the createUser function
        jwt.verify.mockImplementation(() => {
            return { role: 'Customer' };  // Mock a decoded token
        });
    });

    it('should create a new customer user successfully', async () => {
        // Create a mock for the User model's save method
        const saveMock = jest.fn().mockResolvedValue(req.body);  // Mock save method to return the user data

        User.prototype.save = saveMock;

        // Call the createUser function
        await createUser(req, res);

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith('securePassword12311', 10); 
        expect(res.status).toHaveBeenCalledWith(201);
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

    it('should return 400 if password is not provided', async () => {
        req.body.password = ''; // Empty password to test validation

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400); // Ensure the correct error status
        expect(res.send).toHaveBeenCalledWith('Password is required'); 
    });

    it('should return 400 if role is invalid', async () => {
        req.body.role = 'InvalidRole';  // Invalid role to test validation

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400); // Ensure the correct error status
        expect(res.send).toHaveBeenCalledWith('Invalid role specified');  
    });
});
