import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import colors from '../../../theme/colors';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  className?: string;
}

export const AppInput = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  className = '',
  secureTextEntry,
  ...props
}: AppInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const isPassword = secureTextEntry;
  const showSecureText = isPassword && !passwordVisible;

  let inputBorderClass = 'flex-row items-center border rounded-2xl bg-white px-4 py-2.5 ';
  
  if (error) {
    inputBorderClass += 'border-red-500';
  } else if (isFocused) {
    inputBorderClass += 'border-blue-500';
  } else {
    inputBorderClass += 'border-slate-200';
  }

  return (
    <View className="mb-3 w-full">
      {label && (
        <AppText className="text-slate-600 font-semibold mb-1.5 ml-1 text-xs uppercase tracking-wider">
          {label}
        </AppText>
      )}

      <View className={`${inputBorderClass} ${className}`}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.slate[400]}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          className="flex-1 text-slate-900 text-sm py-1"
          placeholderTextColor={colors.slate[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={showSecureText}
          autoCapitalize="none"
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.slate[400]}
            />
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
              <Ionicons
                name={rightIcon}
                size={20}
                color={colors.slate[400]}
              />
            </TouchableOpacity>
          )
        )}
      </View>

      {error && (
        <AppText className="text-red-500 text-xs mt-1 ml-1.5 font-medium">
          {error}
        </AppText>
      )}
    </View>
  );
};

export default AppInput;
