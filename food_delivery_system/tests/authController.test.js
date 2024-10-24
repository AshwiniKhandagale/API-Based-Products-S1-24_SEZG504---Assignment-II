const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller - Register', () => {
    it('should register a new user', async () => {
        const req = httpMocks.createRequest({
            body: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            }
        });
        const res = httpMocks.createResponse();
        User.create.mockResolvedValue(req.body);

        await register(req, res);

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData()).toEqual(expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com'
        }));
    });
});
