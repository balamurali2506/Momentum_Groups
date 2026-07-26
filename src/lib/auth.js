import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie'; // Back to standard, stable names

export function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  const cookieString = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
  res.headers.append('Set-Cookie', cookieString);
}

export function getTokenFromRequest(req) {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies.token || null;
}

export async function getCurrentUser(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  const { default: connectDB } = await import('./mongodb');
  const { default: User } = await import('./models/User');
  await connectDB();
  return User.findById(decoded.id).select('-password');
}