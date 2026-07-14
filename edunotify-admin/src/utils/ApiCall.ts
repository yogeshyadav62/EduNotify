import apiClient from './ApiClient';

export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
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

export const getData = async <T>(endpoint: string, params = {}): Promise<T> => {
  try {
    const { data } = await apiClient.get<T>(endpoint, { params });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const postData = async <T>(endpoint: string, body = {}, headers = {}): Promise<T> => {
  try {
    const { data } = await apiClient.post<T>(endpoint, body, { headers });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const putData = async <T>(endpoint: string, body = {}, headers = {}): Promise<T> => {
  try {
    const { data } = await apiClient.put<T>(endpoint, body, { headers });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteData = async <T>(endpoint: string, body = {}): Promise<T> => {
  try {
    const { data } = await apiClient.delete<T>(endpoint, { data: body });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
