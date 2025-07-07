import React, { createContext, useState, ReactNode } from "react";

interface FavoritesContextProps {
  favorites: number[];
  notifyingFavorites: boolean;
  toggleFavorite: (projectId: number) => void;
  setNotifyingFavorites: (value: boolean) => void;
}

export const FavoritesContext = createContext<FavoritesContextProps>({
  favorites: [],
  notifyingFavorites: false,
  toggleFavorite: () => {},
  setNotifyingFavorites: () => {},
});

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [notifyingFavorites, setNotifyingFavorites] = useState(false);

  const toggleFavorite = (projectId: number) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.includes(projectId);
      const newFavorites = isFavorite
        ? prevFavorites.filter((id) => id !== projectId)
        : [...prevFavorites, projectId];

      // Update notification based on the action
      setNotifyingFavorites(!isFavorite);

      return newFavorites;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, notifyingFavorites, toggleFavorite, setNotifyingFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
