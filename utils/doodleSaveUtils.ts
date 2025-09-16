export function isPermissionError(err: any) {
  if (!err) return false;
  const message = (err && err.message) || String(err);
  return (
    /permission/i.test(message) ||
    /not granted/i.test(message) ||
    /denied/i.test(message)
  );
}

export default { isPermissionError };
