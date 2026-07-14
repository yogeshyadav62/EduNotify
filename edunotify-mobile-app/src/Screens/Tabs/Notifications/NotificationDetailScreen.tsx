import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../../redux/hooks';
import AppText from '../../components/common/AppText';
import Screen from '../../components/common/Screen';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notifications = useAppSelector(state => state.notifications.items);
  const notification = notifications.find(n => n.id === id);

  if (!notification) {
    return (
      <Screen backgroundColor="#F8FAFC">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <AppText className="text-slate-800 text-lg font-black mt-4">Notice Not Found</AppText>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-[#0B66EF] px-6 py-2.5 rounded-xl">
            <AppText className="text-white font-bold text-xs">Go Back</AppText>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const isPersonal = notification.studentId !== null;
  const isPdf = notification.attachmentType === 'application/pdf';
  const isDoc =
    notification.attachmentType === 'application/msword' ||
    notification.attachmentType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isImage = notification.attachmentType?.startsWith('image/');

  const handleOpenAttachment = () => {
    if (!notification.attachmentUrl) return;
    Linking.openURL(notification.attachmentUrl).catch(() =>
      Alert.alert('Error', 'Could not open the attachment. Please try again.')
    );
  };

  return (
    <Screen backgroundColor="#0B66EF">
      {/* HEADER */}
      <View className="pt-3 pb-4 px-5 bg-[#0B66EF] flex-row items-center z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1 rounded-xl bg-white/10 active:opacity-75"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <AppText className="text-lg font-black text-white">Notice Details</AppText>
      </View>

      {/* WHITE CONTENT AREA */}
      <View className="flex-1 bg-slate-50 rounded-t-[36px] pt-6 shadow-2xl">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {/* MAIN NOTICE CARD */}
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5">
            {/* Badge row */}
            <View className="flex-row justify-between items-center mb-4">
              <View className={`px-3 py-1.5 rounded-xl ${isPersonal ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <AppText
                  className={`text-[9px] font-extrabold uppercase tracking-widest ${
                    isPersonal ? 'text-blue-700' : 'text-orange-700'
                  }`}
                >
                  {isPersonal ? 'PERSONAL' : 'BROADCAST'}
                </AppText>
              </View>
              <AppText className="text-slate-400 text-[10px] font-bold">
                {new Date(notification.dateTime).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </AppText>
            </View>

            {/* Title */}
            <AppText className="text-base font-black text-slate-800 mb-4 leading-6">
              {notification.title}
            </AppText>

            {/* Description */}
            <AppText className="text-slate-600 text-xs leading-5">
              {notification.description}
            </AppText>

            {/* ── ATTACHMENT SECTION ── */}
            {notification.attachmentUrl && (
              <View className="mt-4 pt-4 border-t border-slate-100">
                <AppText className="text-[10px] font-extrabold uppercase text-slate-400 mb-3 tracking-widest">
                  Attachment
                </AppText>

                {isImage ? (
                  <TouchableOpacity onPress={handleOpenAttachment} activeOpacity={0.85}>
                    <Image
                      source={{ uri: notification.attachmentUrl }}
                      style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 16,
                        backgroundColor: '#F1F5F9',
                      }}
                      resizeMode="cover"
                    />
                    <AppText className="text-[10px] text-slate-400 font-semibold text-center mt-2">
                      Tap to view full size
                    </AppText>
                  </TouchableOpacity>
                ) : isPdf || isDoc ? (
                  <TouchableOpacity
                    onPress={handleOpenAttachment}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isPdf ? '#FEF2F2' : '#EFF6FF',
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: isPdf ? '#FECACA' : '#BFDBFE',
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: isPdf ? '#DC2626' : '#2563EB',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name={isPdf ? 'document-text' : 'document'}
                        size={22}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        style={{
                          fontSize: 13,
                          fontWeight: '800',
                          color: isPdf ? '#DC2626' : '#2563EB',
                        }}
                      >
                        {isPdf ? 'PDF Document' : 'Word Document'}
                      </AppText>
                      <AppText
                        style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 }}
                      >
                        Tap to open in browser
                      </AppText>
                    </View>
                    <Ionicons
                      name="open-outline"
                      size={18}
                      color={isPdf ? '#DC2626' : '#2563EB'}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>

          {/* DETAILS TABLE */}
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <AppText className="text-slate-800 text-xs font-black mb-3">Notice Information</AppText>

            <View className="flex-row justify-between py-2.5 border-b border-slate-100">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Faculty</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">{notification.facultyName}</AppText>
            </View>

            <View className="flex-row justify-between py-2.5 border-b border-slate-100">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Class ID</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">{notification.classId}</AppText>
            </View>

            <View className="flex-row justify-between py-2.5 border-b border-slate-100">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Audience</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">
                {notification.studentId
                  ? `Individual (${notification.studentId})`
                  : 'All Students (Class-wide)'}
              </AppText>
            </View>

            <View className="flex-row justify-between py-2.5">
              <AppText className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</AppText>
              <AppText className="text-[11px] font-bold text-slate-700">
                {new Date(notification.dateTime).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
                ,{' '}
                {new Date(notification.dateTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
