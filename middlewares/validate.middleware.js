export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errors = issues.map(e => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
      message: e.message,
    }));
    return res.status(400).json({ success: false, errors });
  }
  req.body = result.data;
  next();
};

export default validate;
