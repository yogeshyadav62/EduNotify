import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AppText from '../Screens/components/common/AppText';
import AppInput from '../Screens/components/common/AppInput';
import AppButton from '../Screens/components/common/AppButton';
import Screen from '../Screens/components/common/Screen';
import { useLogin } from '../hooks/useLogin';
import colors from '../theme/colors';

export default function LoginScreen() {
  const {
    studentId,
    setStudentId,
    classId,
    setClassId,
    isLoading,
    login,
  } = useLogin();

  const [rememberMe, setRememberMe] = useState(true);

  return (
    <Screen backgroundColor="#FFFFFF">
      {/* 1. GEOMETRIC BACKGROUND DECORATIONS */}
      {/* Top-Left Dot Grid */}
      <View className="absolute top-12 left-5 opacity-[0.15] flex-row flex-wrap w-14 h-14 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} className="w-1 h-1 bg-slate-500 rounded-full m-1" />
        ))}
      </View>

      {/* Top-Right Circle Line */}
      <View className="absolute top-[-30] right-[-30] w-36 h-36 rounded-full border border-blue-200/35 z-0" />

      {/* Bottom Wave decoration (Smooth mathematical SVG curves) */}
      <Svg
        height={140}
        width="100%"
        viewBox="0 0 390 130"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 0 }}
      >
        {/* Layer 1 - Back Wave (Sweeps down in the middle) */}
        <Path
          d="M 0 65 Q 97.5 115, 195 85 T 390 50 L 390 130 L 0 130 Z"
          fill="#0B66EF"
          fillOpacity={0.15}
        />
        {/* Layer 2 - Front Wave (Slightly shifted sweep) */}
        <Path
          d="M 0 90 Q 97.5 135, 195 105 T 390 70 L 390 130 L 0 130 Z"
          fill="#0B66EF"
          fillOpacity={0.3}
        />
      </Svg>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        className="flex-1 z-10"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          {/* Logo Header (Top Center) */}
          <View className="items-center mt-20">
            <Image
              source={require('../../assets/images/logo.png')}
              className="w-48 h-48"
              resizeMode="contain"
            />
          </View>

          {/* School Building Vector Illustration */}
          <View className="w-full items-center justify-center mb-6 mt-[-10]">
            <Image
              source={require('../../assets/images/login1.png')}
              className="w-full h-40"
              resizeMode="cover"
            />
          </View>

          {/* Input Form Fields */}
          <View className="mb-5">
            <AppText className="text-slate-800 font-extrabold text-sm mb-1.5 ml-1">
              Student ID
            </AppText>
            <AppInput
              placeholder="Enter Student ID"
              value={studentId}
              onChangeText={setStudentId}
              icon="person-outline"
              autoCapitalize="characters"
              autoCorrect={false}
              className="bg-white border-slate-200/80 rounded-2xl px-4"
            />

            <AppText className="text-slate-800 font-extrabold text-sm mb-1.5 mt-2.5 ml-1">
              Class ID
            </AppText>
            <AppInput
              placeholder="Enter Class ID"
              value={classId}
              onChangeText={setClassId}
              icon="people-outline"
              autoCapitalize="characters"
              autoCorrect={false}
              className="bg-white border-slate-200/80 rounded-2xl px-4"
            />

            {/* Remember Me Row */}
            <View className="flex-row justify-start items-center mt-1.5 px-1">
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                className="flex-row items-center"
              >
                <View className={`w-[18px] h-[18px] rounded border items-center justify-center mr-2.5 ${rememberMe ? 'bg-[#0B66EF] border-[#0B66EF]' : 'border-slate-300 bg-white'
                  }`}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <AppText className="text-slate-500 text-sm font-bold">
                  Remember me
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Solid Royal Blue Action Login Button */}
          <AppButton
            title="Login"
            onPress={login}
            loading={isLoading}
            className="w-full bg-[#0B66EF] rounded-2xl py-4 shadow-md active:opacity-90"
            textClassName="font-extrabold text-base tracking-wider"
          />

          {/* Secure Footer Badge */}
          <View className="flex-row justify-center items-center mt-5 mb-12">
            <Ionicons name="shield-checkmark-outline" size={14} color="#3B82F6" style={{ marginRight: 6 }} />
            <AppText className="text-slate-400 text-[10px] font-bold">
              Your data is safe and secure
            </AppText>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
