import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../common/AppText';
import colors from '../../../theme/colors';

interface FilterChipsProps {
  selectedFilter: 'all' | 'class' | 'personal';
  onSelectFilter: (filter: 'all' | 'class' | 'personal') => void;
}

export const FilterChips = ({ selectedFilter, onSelectFilter }: FilterChipsProps) => {
  const filtersList = [
    {
      key: 'all' as const,
      label: 'All Alerts',
      icon: 'layers-outline' as const,
      color: colors.primary,
      activeBg: 'bg-blue-600 border-blue-600',
    },
    {
      key: 'class' as const,
      label: 'Class Broadcasts',
      icon: 'megaphone-outline' as const,
      color: '#8B5CF6', // Purple
      activeBg: 'bg-purple-600 border-purple-600',
    },
    {
      key: 'personal' as const,
      label: 'Personal Notices',
      icon: 'person-outline' as const,
      color: '#10B981', // Emerald
      activeBg: 'bg-emerald-600 border-emerald-600',
    },
  ];

  return (
    <View className="py-3 bg-white border-b border-slate-100/80">
      <View className="flex-row justify-around px-4">
        {filtersList.map((item) => {
          const isSelected = selectedFilter === item.key;
          
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSelectFilter(item.key)}
              className={`flex-row items-center px-3.5 py-2.5 rounded-2xl border flex-1 mx-1 justify-center ${
                isSelected 
                  ? item.activeBg 
                  : 'bg-slate-50 border-slate-100 active:bg-slate-100'
              }`}
            >
              <Ionicons
                name={item.icon}
                size={14}
                color={isSelected ? '#FFFFFF' : item.color}
                style={{ marginRight: 6 }}
              />
              <AppText 
                className={`text-[11px] font-bold ${
                  isSelected ? 'text-white' : 'text-slate-600'
                }`}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default FilterChips;
