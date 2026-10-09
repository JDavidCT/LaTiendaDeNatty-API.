const jwt = require('jsonwebtoken');
const HttpError = require('../utilidades/httpError');

function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token, extra] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token || extra) {
    return next(new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Se requiere un token Bearer válido.'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'latienda-natty-api',
      audience: 'latienda-natty-client'
    });
    req.user = {
      id: Number(payload.sub),
      name: payload.name,
      email: payload.email
    };

    if (!Number.isSafeInteger(req.user.id) || req.user.id < 1 ||
        typeof req.user.name !== 'string' || typeof req.user.email !== 'string') {
      throw new Error('El token no contiene los datos de usuario esperados.');
    }
  } catch (error) {
    return next(new HttpError(401, 'INVALID_TOKEN', 'El token es inválido o ha expirado.'));
  }

  return next();
}

module.exports = authenticate;
