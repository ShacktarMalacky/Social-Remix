import React, { createContext, useContext, useState, useEffect } from 'react';
import { cyberSound } from '../services/soundService';

interface ImmersiveContextType {
  isImmersive: boolean;
  toggleImmersive: () => void;
  enterImmersive: () => void;
  exitImmersive: () => void;
}

const ImmersiveContext = createContext<ImmersiveContextType | undefined>(undefined);

export const ImmersiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isImmersive, setIsImmersive] = useState(false);

  const enterImmersive = () => {
    cyberSound.playSuccess();
    setIsImmersive(true);
  };

  const exitImmersive = () => {
    cyberSound.playTick();
    setIsImmersive(false);
  };

  const toggleImmersive = () => {
    if (isImmersive) {
      exitImmersive();
    } else {
      enterImmersive();
    }
  };

  // Keyboard shortcut listener: ESC key exits immersive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersive) {
        exitImmersive();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImmersive]);

  return (
    <ImmersiveContext.Provider value={{ isImmersive, toggleImmersive, enterImmersive, exitImmersive }}>
      {children}
    </ImmersiveContext.Provider>
  );
};

export const useImmersive = (): ImmersiveContextType => {
  const context = useContext(ImmersiveContext);
  if (!context) {
    throw new Error('useImmersive must be used within an ImmersiveProvider');
  }
  return context;
};
