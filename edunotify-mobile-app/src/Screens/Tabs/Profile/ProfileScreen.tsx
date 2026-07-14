import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import LogoutButton from '../../components/profile/LogoutButton';
import { useRouter } from 'expo-router';
import { useLogin } from '../../../hooks/useLogin';
import { useProfile } from '../../../hooks/useProfile';
import colors from '../../../theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useLogin();
  const { user, loading: profileLoading, fetchProfile, updateProfileInfo, pickAndUploadAvatar } = useProfile();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  
  // Edit Profile States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');

  // Sync profile details on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const getStudentInitials = () => {
    if (!user?.name) return 'Y';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditMobile(user?.mobile || '');
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      return;
    }
    const success = await updateProfileInfo(
      editName.trim(), 
      editEmail.trim(), 
      editMobile.trim()
    );
    if (success) {
      setEditModalVisible(false);
    }
  };

  return (
    <Screen backgroundColor="#0B66EF">
      {/* SOLID BLUE HEADER */}
      <View className="pt-4 pb-12 px-5 bg-[#0B66EF] flex-row justify-between items-start z-10">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-3 p-1 -ml-1 active:opacity-70"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppText className="text-xl font-black text-white">Profile</AppText>
        </View>
        {profileLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
        )}
      </View>

      {/* OVERLAY WRAPPER */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white rounded-t-[36px]"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 }}
      >
        {/* Profile Circle Avatar / Name */}
        <View className="items-center mb-6">
          <View className="relative mb-3.5">
            <TouchableOpacity 
              onPress={pickAndUploadAvatar} 
              activeOpacity={0.8}
              className="w-24 h-24 rounded-full bg-blue-50 border-4 border-slate-50 justify-center items-center shadow-sm overflow-hidden"
            >
              {user?.avatarUrl ? (
                <Image 
                  source={{ uri: user.avatarUrl }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <AppText className="text-3xl font-black text-[#0B66EF]">
                  {getStudentInitials()}
                </AppText>
              )}
            </TouchableOpacity>
            
            {/* Camera Upload Badge */}
            <TouchableOpacity 
              onPress={pickAndUploadAvatar}
              activeOpacity={0.7}
              className="absolute bottom-0 right-0 bg-[#0B66EF] p-2 rounded-full border-2 border-white shadow-sm"
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <AppText className="text-xl font-black text-slate-800 mb-1 text-center" style={{ textTransform: 'capitalize' }}>
            {user?.name || 'Yogesh Yadav'}
          </AppText>
          <AppText className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            {user?.studentId || 'STU-101'} | {user?.classId || 'CS-202'}
          </AppText>
        </View>

        {/* Details Grid */}
        <View className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-4">
          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Student ID</AppText>
            <AppText className="text-xs font-bold text-slate-700">{user?.studentId}</AppText>
          </View>

          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Class ID</AppText>
            <AppText className="text-xs font-bold text-slate-700">{user?.classId}</AppText>
          </View>

          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-100">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Email</AppText>
            <AppText className="text-xs font-bold text-slate-700">{user?.email || 'Not Added'}</AppText>
          </View>

          <View className="flex-row justify-between items-center py-2.5">
            <AppText className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</AppText>
            <AppText className="text-xs font-bold text-slate-700">{user?.mobile || 'Not Added'}</AppText>
          </View>
        </View>

        {/* Edit Profile Action Button */}
        <TouchableOpacity 
          onPress={openEditModal} 
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-blue-50 active:bg-blue-100 py-3 rounded-2xl mb-6 border border-blue-100/50"
        >
          <Ionicons name="create-outline" size={16} color="#0B66EF" style={{ marginRight: 6 }} />
          <AppText className="text-xs font-black text-[#0B66EF]">Edit Profile Info</AppText>
        </TouchableOpacity>

        {/* Preferences */}
        <AppText className="text-slate-500 font-black text-[9px] uppercase tracking-wider mb-3 ml-1">
          Notification Settings
        </AppText>

        <View className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-6">
          <View className="flex-row justify-between items-center py-2.5 border-b border-slate-50">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="bg-blue-50 p-2 rounded-xl mr-3">
                <Ionicons name="phone-portrait-outline" size={18} color="#0B66EF" />
              </View>
              <View className="flex-1">
                <AppText className="text-xs font-bold text-slate-800">Push Notifications</AppText>
                <AppText className="text-[9px] text-slate-400 mt-0.5 leading-4" numberOfLines={2}>Receive alerts on lockscreen</AppText>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.slate[200], true: '#93C5FD' }}
              thumbColor={pushEnabled ? '#0B66EF' : colors.slate[300]}
            />
          </View>

          <View className="flex-row justify-between items-center py-2.5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="bg-orange-50 p-2 rounded-xl mr-3">
                <Ionicons name="mail-outline" size={18} color="#F97316" />
              </View>
              <View className="flex-1">
                <AppText className="text-xs font-bold text-slate-800">Email Digests</AppText>
                <AppText className="text-[9px] text-slate-400 mt-0.5 leading-4" numberOfLines={2}>Receive weekly digests</AppText>
              </View>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: colors.slate[200], true: '#FED7AA' }}
              thumbColor={emailAlerts ? '#F97316' : colors.slate[300]}
            />
          </View>
        </View>

        {/* Support items */}
        <View className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-8">
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl mr-3 bg-blue-50">
                <Ionicons name="help-circle-outline" size={18} color="#0B66EF" />
              </View>
              <AppText className="text-xs font-bold text-slate-700">Help & Support</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate[300]} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl mr-3 bg-slate-50">
                <Ionicons name="information-circle-outline" size={18} color={colors.slate[500]} />
              </View>
              <AppText className="text-xs font-bold text-slate-700">About EduNotify</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate[300]} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <LogoutButton onPress={logout} />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-[36px] px-6 pt-8 pb-10 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <AppText className="text-lg font-black text-slate-800">Edit Profile</AppText>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                className="p-1 rounded-full bg-slate-100"
              >
                <Ionicons name="close" size={20} color={colors.slate[600]} />
              </TouchableOpacity>
            </View>

            {/* Form Inputs */}
            <View className="space-y-4 mb-8">
              {/* Full Name */}
              <View>
                <AppText className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Full Name</AppText>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g. Yogesh Yadav"
                  placeholderTextColor={colors.slate[300]}
                  style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}
                  className="bg-slate-50 border border-slate-100 text-slate-700 py-3.5 px-4 rounded-2xl focus:border-blue-400 focus:bg-white"
                />
              </View>

              {/* Email */}
              <View>
                <AppText className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Email Address</AppText>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. yogesh@example.com"
                  placeholderTextColor={colors.slate[300]}
                  style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}
                  className="bg-slate-50 border border-slate-100 text-slate-700 py-3.5 px-4 rounded-2xl focus:border-blue-400 focus:bg-white"
                />
              </View>

              {/* Mobile Number */}
              <View>
                <AppText className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Mobile Number</AppText>
                <TextInput
                  value={editMobile}
                  onChangeText={setEditMobile}
                  keyboardType="phone-pad"
                  placeholder="e.g. +91 9876543210"
                  placeholderTextColor={colors.slate[300]}
                  style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}
                  className="bg-slate-50 border border-slate-100 text-slate-700 py-3.5 px-4 rounded-2xl focus:border-blue-400 focus:bg-white"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 gap-3">
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center border border-slate-200/50"
              >
                <AppText className="text-slate-600 font-black text-sm">Cancel</AppText>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSave}
                disabled={profileLoading}
                activeOpacity={0.8}
                className="flex-1 bg-[#0B66EF] py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20"
              >
                {profileLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText className="text-white font-black text-sm">Save Changes</AppText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}
