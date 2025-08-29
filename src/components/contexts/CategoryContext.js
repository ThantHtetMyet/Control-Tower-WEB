import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCategories } from '../api-services/newsPortalService';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchCategories = useCallback(async (force = false) => {
    // Only fetch if not already loading and (force or no recent fetch)
    const now = Date.now();
    if (loading || (!force && lastFetch && (now - lastFetch) < 30000)) {
      return;
    }

    try {
      setLoading(true);
      const response = await getCategories(1, 100);
      setCategories(response || []);
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, lastFetch]); // ✅ Removed categories from dependencies

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refreshCategories = useCallback(() => fetchCategories(true), [fetchCategories]);

  return (
    <CategoryContext.Provider value={{
      categories,
      loading,
      fetchCategories,
      refreshCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
};