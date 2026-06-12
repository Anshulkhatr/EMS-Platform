const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

const paginated = (res, data, pagination) => {
  return res.status(200).json({ success: true, data, pagination });
};

module.exports = { success, error, paginated };
