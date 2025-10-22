import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BottomNavbarProps {
  activeTab: 'home' | 'chat' | 'profile';
  onTabPress: (tab: 'home' | 'chat' | 'profile') => void;
}

export default function BottomNavbar({ activeTab, onTabPress }: BottomNavbarProps) {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: 'home',
    },
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: 'chat',
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? '#00234C' : '#666'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    paddingBottom: 20, // Extra padding for safe area
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F5F5F5',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#00234C',
    fontWeight: '600',
  },
});
