import { Tabs } from 'expo-router';
import { useAppMode } from '@/hooks/useAppMode';
import { Colors } from '@/constants/Colors';
import { User, Baby, Focus, Palette, Calendar, Settings, Lock, Shapes } from 'lucide-react-native';

export default function TabLayout() {
  const { mode } = useAppMode();

  if (mode === 'personal') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.personal.surface,
            borderTopColor: Colors.personal.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: Colors.personal.accent,
          tabBarInactiveTintColor: Colors.personal.textSecondary,
        }}
      >
        <Tabs.Screen
          name="focus"
          options={{
            title: 'Focus',
            tabBarIcon: ({ size, color }) => (
              <Focus size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="doodle"
          options={{
            title: 'Doodle',
            tabBarIcon: ({ size, color }) => (
              <Palette size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ size, color }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.common.white,
          borderTopColor: Colors.baby.surface,
          borderTopWidth: 2,
        },
        tabBarActiveTintColor: Colors.baby.blue,
        tabBarInactiveTintColor: Colors.baby.textSecondary,
      }}
    >
      <Tabs.Screen
        name="baby-lock"
        options={{
          title: 'Baby Lock',
          tabBarIcon: ({ size, color }) => (
            <Lock size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="baby-doodle"
        options={{
          title: 'Doodle',
          tabBarIcon: ({ size, color }) => (
            <Palette size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shapes"
        options={{
          title: 'Shapes',
          tabBarIcon: ({ size, color }) => (
            <Shapes size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}