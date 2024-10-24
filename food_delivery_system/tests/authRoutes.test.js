const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

jest.mock('../models/User');

describe('Auth Routes', () => {
    it('POST /api/auth/register - should register a new user', async () => {
        User.create.mockResolvedValue({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedpassword'
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com'
        }));
    });
});
