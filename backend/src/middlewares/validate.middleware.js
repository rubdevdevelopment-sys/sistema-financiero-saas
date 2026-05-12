export function validate(schema) {
  return (req, _res, next) => {
    req.validated = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    return next();
  };
}
