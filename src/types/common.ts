export interface UIState {
  isDarkMode: boolean;
  activeModal: string | null;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;
}

export type RootStackParamList = {
  index: undefined;
  login: undefined;
  home: undefined;
  notifications: undefined;
  profile: undefined;
};
