// backend/src/utils/response.js
/**
 * Success response helper
 */
function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Error response helper
 */
function errorResponse(res, message, statusCode = 500, errors = null) {
  const response = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Paginated response helper
 */
function paginatedResponse(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * Created response helper
 */
function createdResponse(res, data) {
  return successResponse(res, data, 201);
}

/**
 * No content response helper
 */
function noContentResponse(res) {
  return res.status(204).send();
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
};
