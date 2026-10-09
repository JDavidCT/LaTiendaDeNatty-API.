const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('../modelos/authModel');
const HttpError = require('../utilidades/httpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;

function validateCredentials(body, isRegistration) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'El cuerpo debe ser un objeto JSON.');
  }

  const errors = [];
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!EMAIL_PATTERN.test(email) || email.length > 150) {
    errors.push('email debe ser un correo válido de máximo 150 caracteres.');
  }
  if (Buffer.byteLength(password, 'utf8') < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    errors.push('password debe tener entre 8 y 72 bytes.');
  }

  let name;
  if (isRegistration) {
    name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 100) {
      errors.push('name debe tener entre 2 y 100 caracteres.');
    }
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Las credenciales no son válidas.', errors);
  }

  return { name, email, password };
}

function createToken(user) {
  return jwt.sign(
    { name: user.name, email: user.email },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: String(user.id),
      issuer: 'latienda-natty-api',
      audience: 'latienda-natty-client',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
}

async function register(req, res) {
  const { name, email, password } = validateCredentials(req.body, true);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await authModel.create({ name, email, passwordHash });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'EMAIL_ALREADY_REGISTERED', 'Ya existe una cuenta con ese correo.');
    }
    throw error;
  }

  const token = createToken(user);
  res.status(201).json({
    success: true,
    data: { user, token }
  });
}

async function login(req, res) {
  const { email, password } = validateCredentials(req.body, false);
  const user = await authModel.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  }

  const token = createToken(user);
  res.status(200).json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      token
    }
  });
}

function profile(req, res) {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
}

module.exports = { register, login, profile };
