import React, { createContext, useState, useContext, useEffect } from 'react';
// createContext - creates global context
// useState - manages authentication state
// useContext - accesses context data
// useEffect - handles side effects like loading user data


const AuthContext = createContext();
//allows authentication data to be shared across all components

export const useAuth = () => useContext(AuthContext);
//custom hook created for easier access to authentication data


//AuthProvider wraps the entire application and provides authentication data globally
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // This state stores logged-in user information
  const [loading, setLoading] = useState(true); 
  // Loading state prevents the application from rendering
  //  before authentication data is loaded


  useEffect(() => {
    
    const storedUser = localStorage.getItem('user');
//This retrieves previously logged-in user data from browser localStorage

    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Stored JSON data is converted back into JavaScript object format
    } else {
      setUser(null); // If no user exists in localStorage, authentication state is reset
    }

    setLoading(false);
  }, []);


  //This function executes after successful authentication
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };


  //This function logs out the user from the application
  const logout = () => {
    localStorage.clear();   // All stored session data is removed from browser storage
    setUser(null);          // User state is reset after logout
  };

  return (
    // These authentication values are shared globally with all components
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      
      // children represents all components wrapped inside AuthProvider
      {children}
    </AuthContext.Provider>
  );
};

/* AuthContext manages login sessions globally, maintains authentication state, 
 stores user sessions in localStorage, and provides login/logout functionality 
 throughout the application */