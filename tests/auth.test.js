process.env.JWT_SECRET = 'test-secret-for-jest-that-is-at-least-32-bytes';

jest.mock('../codigo/modelos/authModel', () => ({
  findByEmail: jest.fn(),
  create: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../codigo/app');
const authModel = require('../codigo/modelos/authModel');

describe('Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registra un usuario y entrega un JWT sin exponer el hash', async () => {
    authModel.create.mockImplementation(async ({ name, email }) => ({
      id: 7,
      name,
      email
    }));

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Ana Pérez', email: 'ANA@example.com', password: 'clave-segura-123' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual({
      id: 7,
      name: 'Ana Pérez',
      email: 'ana@example.com'
    });
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(jwt.verify(response.body.data.token, process.env.JWT_SECRET).sub).toBe('7');

    const [{ passwordHash }] = authModel.create.mock.calls[0];
    expect(passwordHash).not.toBe('clave-segura-123');
    expect(await bcrypt.compare('clave-segura-123', passwordHash)).toBe(true);
  });

  test('inicia sesión correctamente y retorna un JWT', async () => {
    const passwordHash = await bcrypt.hash('clave-segura-123', 4);
    authModel.findByEmail.mockResolvedValue({
      id: 8,
      name: 'Ana Pérez',
      email: 'ana@example.com',
      passwordHash
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ANA@example.com', password: 'clave-segura-123' });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual({
      id: 8,
      name: 'Ana Pérez',
      email: 'ana@example.com'
    });
    expect(jwt.verify(response.body.data.token, process.env.JWT_SECRET).sub).toBe('8');
    expect(authModel.findByEmail).toHaveBeenCalledWith('ana@example.com');
  });

  test('rechaza el inicio de sesión con credenciales incorrectas', async () => {
    authModel.findByEmail.mockResolvedValue({
      id: 8,
      name: 'Ana Pérez',
      email: 'ana@example.com',
      passwordHash: await bcrypt.hash('clave-valida-123', 4)
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ana@example.com', password: 'clave-incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('bloquea el perfil cuando falta el token', async () => {
    const response = await request(app).get('/api/v1/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('permite consultar el perfil con un token válido', async () => {
    const token = jwt.sign(
      { name: 'Ana Pérez', email: 'ana@example.com' },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: '8',
        issuer: 'latienda-natty-api',
        audience: 'latienda-natty-client',
        expiresIn: '1h'
      }
    );

    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual({
      id: 8,
      name: 'Ana Pérez',
      email: 'ana@example.com'
    });
  });
});
