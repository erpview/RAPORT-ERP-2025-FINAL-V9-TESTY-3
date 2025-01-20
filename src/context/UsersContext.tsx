import React, { createContext, useContext, useState } from 'react';

interface UsersContextType {
  totalUsers: number;
  setTotalUsers: (count: number) => void;
}

const UsersContext = createContext<UsersContextType>({
  totalUsers: 0,
  setTotalUsers: () => {},
});

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalUsers, setTotalUsers] = useState(0);

  return (
    <UsersContext.Provider value={{ totalUsers, setTotalUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);