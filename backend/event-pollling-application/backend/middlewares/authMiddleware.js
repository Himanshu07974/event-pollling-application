const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
console.log('Auth header:', req.headers.authorization);
  // Expect header like: "Authorization: Bearer <token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // set user id on request object
    next();
  } catch (err) {
    // ⬇️ This is the block you asked about
    console.error('JWT verify error:', err);
    return res.status(401).json({
      message: 'Token is not valid',
      error: err.message, // will help you debug why (e.g., "jwt expired", "invalid signature")
    });
  }
};
