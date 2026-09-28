import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);
let currentUserRequest;

const fetchCurrentUser = () => {
  if (!currentUserRequest) {
    currentUserRequest = api.get('/api/auth/me').finally(() => {
      currentUserRequest = null;
    });
  }
  return currentUserRequest;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    const hydrate = async () => {
      if (savedToken && savedUser) {
        setLoading(false);
        try {
          const parsedUser = JSON.parse(savedUser);
          const res = await fetchCurrentUser();
          if (res.data?.user) {
            const u = res.data.user;
            const freshUser = {
              ...parsedUser,
              ...u,
              id: u._id || u.id || parsedUser.id || parsedUser._id,
              avatar: u.avatar !== undefined ? u.avatar : parsedUser.avatar,
              jobTitle: (u.role || parsedUser.role) === 'admin' ? 'مشرف المنصة' : (u.jobTitle !== undefined ? u.jobTitle : parsedUser.jobTitle),
            };
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch {
          // ignore network error on background sync
        }
      } else {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = (userData, token) => {
    const normalized = {
      ...userData,
      id: userData?.id || userData?._id,
      jobTitle: userData?.role === 'admin' ? 'مشرف المنصة' : userData?.jobTitle,
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    navigate(normalized.role === 'admin' ? '/admin' : '/', { replace: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        ...updatedData,
        id: updatedData.id || updatedData._id || prevUser?.id || prevUser?._id,
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = { user, loading, login, logout, setUser, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth يجب استخدامه داخل AuthProvider');
  }
  return context;
};
