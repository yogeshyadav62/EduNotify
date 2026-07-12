import { useState, useCallback } from 'react';

export const useRefresh = (refreshCallback: () => Promise<any>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCallback();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCallback]);

  return {
    refreshing,
    onRefresh,
  };
};
