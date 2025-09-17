import { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, redirectNewUsers = false }) => {
  const { isAuthenticated, profile, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return; // Let the component handle this (show login prompts, etc.)
    }

    // If we should redirect new users to onboarding
    if (redirectNewUsers && isAuthenticated && profile) {
      const isNewUser = !profile.username || profile.username.trim() === '';
      const isOnOnboardingPage = location.pathname === '/onboarding';
      
      if (isNewUser && !isOnOnboardingPage) {
        navigate('/onboarding', { replace: true });
      } else if (!isNewUser && isOnOnboardingPage) {
        // If user has completed onboarding but is on onboarding page, redirect to profile
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, profile, loading, requireAuth, redirectNewUsers, navigate, location.pathname]);

  return children;
};

export default ProtectedRoute;