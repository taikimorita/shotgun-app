import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Text, type ColorValue } from 'react-native';

import { colors, semanticColors, spacing, typography } from '@/src/theme/tokens';

type TabIconProps = {
  color: ColorValue;
  fallback: string;
  name: SymbolViewProps['name'];
};

function TabIcon({ color, fallback, name }: TabIconProps) {
  return (
    <SymbolView
      fallback={<Text style={{ color, fontSize: 21 }}>{fallback}</Text>}
      name={name}
      size={22}
      tintColor={color}
      weight="semibold"
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: semanticColors.action.primaryBackground,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          transform: [{ translateY: spacing[1] }],
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.bold,
          marginBottom: spacing[1],
        },
        tabBarStyle: {
          backgroundColor: semanticColors.app.surface,
          borderTopColor: semanticColors.app.border,
          borderTopWidth: 1,
          height: 88,
          paddingTop: spacing[0],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Find',
          tabBarAccessibilityLabel: 'Find rides',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} fallback="⌕" name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post',
          tabBarAccessibilityLabel: 'Post a ride',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} fallback="+" name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'My Rides',
          tabBarAccessibilityLabel: 'View my rides',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} fallback="▣" name={{ ios: 'car.fill', android: 'directions_car', web: 'directions_car' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'View profile',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} fallback="●" name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }} />
          ),
        }}
      />
    </Tabs>
  );
}
