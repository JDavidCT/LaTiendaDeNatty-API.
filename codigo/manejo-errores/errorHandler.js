const HttpError = require('../utilidades/httpError');

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `No existe la ruta ${req.method} ${req.originalUrl}.`
    }
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'El cuerpo de la solicitud no contiene JSON válido.' }
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      }
    });
  }

  // Registra el detalle técnico en el servidor, pero no lo expone al consumidor.
  console.error(`[${req.method} ${req.originalUrl}]`, error);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Ocurrió un error interno del servidor.' }
  });
}

module.exports = { notFound, errorHandler };
