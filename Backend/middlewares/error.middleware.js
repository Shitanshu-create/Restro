export function notFoundHandler(req, res, next) {
    res.status(404).json({ message: `Resource not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ message });
}
