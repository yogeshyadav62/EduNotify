import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../Screens/components/common/AppText';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveModal } from '../../redux/slices/uiSlice';
import { useLogin } from '../../hooks/useLogin';

export default function LogoutModal() {
  const dispatch = useAppDispatch();
  const { logout } = useLogin();
  const activeModal = useAppSelector(state => state.ui.activeModal);
  
  const isVisible = activeModal === 'logout';

  const handleClose = () => {
    dispatch(setActiveModal(null));
  };

  const confirmLogout = async () => {
    handleClose();
    await logout();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/55 justify-center items-center px-6">
        <View className="bg-white rounded-[32px] p-6 w-full max-w-[320px] items-center">

          {/* Red Logout Circle Icon */}
          <View className="w-14 h-14 bg-red-50 rounded-2xl justify-center items-center mb-4">
            <Ionicons name="log-out" size={28} color="#EF4444" />
          </View>

          {/* Text details */}
          <AppText className="text-slate-800 text-lg font-black mb-1">
            Logout
          </AppText>
          <AppText className="text-slate-400 text-xs font-bold text-center leading-5 mb-6">
            Are you sure you want to logout from EduNotify?
          </AppText>

          {/* Buttons Row */}
          <View className="flex-row justify-between w-full">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-3 mr-2 items-center active:bg-slate-100"
            >
              <AppText className="text-slate-500 text-xs font-bold">Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmLogout}
              className="flex-1 bg-[#EF4444] rounded-xl py-3 ml-2 items-center active:bg-red-600"
            >
              <AppText className="text-white text-xs font-black">Logout</AppText>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}
