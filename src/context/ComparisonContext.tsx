import React, { createContext, useContext, useState } from 'react';
import { System } from '../types/system';

interface ComparisonContextType {
  selectedSystems: System[];
  addSystem: (system: System) => void;
  removeSystem: (systemId: string) => void;
  clearSystems: () => void;
}

const ComparisonContext = createContext<ComparisonContextType>({
  selectedSystems: [],
  addSystem: () => {},
  removeSystem: () => {},
  clearSystems: () => {},
});

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSystems, setSelectedSystems] = useState<System[]>([]);

  const addSystem = (system: System) => {
    if (selectedSystems.length < 4 && !selectedSystems.some(s => s.id === system.id)) {
      setSelectedSystems([...selectedSystems, system]);
    }
  };

  const removeSystem = (systemId: string) => {
    setSelectedSystems(selectedSystems.filter(sys => sys.id !== systemId));
  };

  const clearSystems = () => {
    setSelectedSystems([]);
  };

  return (
    <ComparisonContext.Provider 
      value={{ 
        selectedSystems, 
        addSystem, 
        removeSystem, 
        clearSystems 
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);