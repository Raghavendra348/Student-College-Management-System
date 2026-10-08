import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser =
      localStorage.getItem("currentUser");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("currentUser");
      return null;
    }
  });

  const login = (loginToken, user) => {
    localStorage.setItem(
      "accessToken",
      loginToken
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

    setToken(loginToken);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");

    localStorage.removeItem("currentUser");

    setToken(null);
    setCurrentUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};