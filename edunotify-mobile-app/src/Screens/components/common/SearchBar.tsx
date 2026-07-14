import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search notifications...',
  className = '',
}: SearchBarProps) => {
  return (
    <View className={`flex-row items-center bg-slate-100/80 border border-slate-200/50 rounded-2xl px-4 py-2.5 ${className}`}>
      <Ionicons
        name="search-outline"
        size={20}
        color={colors.slate[400]}
        style={{ marginRight: 8 }}
      />
      <TextInput
        className="flex-1 text-slate-800 text-sm py-0 h-6"
        placeholder={placeholder}
        placeholderTextColor={colors.slate[400]}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.slate[400]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
