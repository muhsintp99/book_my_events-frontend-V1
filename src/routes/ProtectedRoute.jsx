import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    // JWT structure is [header].[payload].[signature]
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;

    // Handle Base64Url encoding (standard for JWT)
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64));
    const exp = decodedPayload.exp;

    // If no expiration claim, assume it doesn't expire (or handle as valid)
    if (!exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (err) {
    console.error('Error decoding token:', err);
    return true; // Treat as expired if decoding fails
  }
};

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!currentToken || isTokenExpired(currentToken)) {
      if (currentToken) {
        console.warn('Token expired or invalid. Clearing storage.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
      setIsValid(false);
    } else {
      setIsValid(true);
      setToken(currentToken);
    }
  }, [location.pathname]); // Re-verify on navigation

  if (!isValid || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
