import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types/common';

const initialState: UIState = {
  isDarkMode: false,
  activeModal: null,
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
    },
    showToast(state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) {
      state.toast = {
        ...action.payload,
        visible: true,
      };
    },
    hideToast(state) {
      if (state.toast) {
        state.toast.visible = false;
      }
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
  },
});

export const { toggleDarkMode, setDarkMode, showToast, hideToast, setActiveModal } = uiSlice.actions;
export default uiSlice.reducer;
