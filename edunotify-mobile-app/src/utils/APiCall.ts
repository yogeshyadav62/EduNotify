import apiClient, { injectStore as injectApiClientStore } from './ApiClient';

export const injectStore = (_store: any) => {
  injectApiClientStore(_store);
};

export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    // console.log('--- API Error Response ---');
    // console.log('Status:', status);
    // console.log('Data:', JSON.stringify(data, null, 2));
    // console.log('Normalized Message:', error.message);
    // console.log('-------------------------');
    throw {
      type: 'response',
      status,
      message: error.message || data?.message || `Request failed with status ${status}`,
      data: data,
    };
  }

  if (error.request) {
    throw {
      type: 'network',
      message: error.message || 'Network error, no response received',
    };
  }

  throw {
    type: 'unknown',
    message: error.message || 'Something went wrong',
  };
};

export const getData = async <T>(endpoint: string, params = {}): Promise<T | null> => {
  try {
    const { data } = await apiClient.get<T>(endpoint, { params });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const postData = async <T>(endpoint: string, body = {}): Promise<T | null> => {
  try {
    const { data } = await apiClient.post<T>(endpoint, body);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const putData = async <T>(endpoint: string, body = {}): Promise<T | null> => {
  try {
    const { data } = await apiClient.put<T>(endpoint, body);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteData = async <T>(endpoint: string, body = {}): Promise<T | null> => {
  try {
    const { data } = await apiClient.delete<T>(endpoint, { data: body });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
