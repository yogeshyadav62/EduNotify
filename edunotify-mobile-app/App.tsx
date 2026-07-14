import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-100">
      <Text className="text-2xl font-bold text-indigo-600">
        EduNotify
      </Text>
      <Text className="text-zinc-600 mt-2 text-center px-4">
        Configured successfully with NativeWind v4 & Reanimated!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

