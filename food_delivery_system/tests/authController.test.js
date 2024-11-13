const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { register, login } = require('../controllers/authController');
const { registerUser, loginUser } = require('../services/userService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

jest.mock('../services/userService');
jest.mock('express-validator');
jest.mock('http-errors');

const app = express();
app.use(bodyParser.json());
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });
      registerUser.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(registerUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });

    it('should return 400 if validation fails', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
      });
      createError.mockReturnValue(new Error('Invalid input'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: 'short'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });

    it('should handle errors during registration', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });
      const error = new Error('Registration error');
      registerUser.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Registration error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      loginUser.mockResolvedValue('token123');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token', 'token123');
      expect(loginUser).toHaveBeenCalledWith('john@example.com', 'password123');
    });

    it('should handle errors during login', async () => {
      const error = new Error('Login error');
      loginUser.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Login error');
    });
  });
});