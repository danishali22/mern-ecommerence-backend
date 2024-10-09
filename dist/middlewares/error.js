export function errorMiddleware(err, req, res, next) {
    if (err.name === "CastError")
        err.message = "Invalid Id";
    res
        .status(err.statusCode || 500)
        .json({ message: err.message || "Internal Server Error" });
}
export const TryCatch = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
};
