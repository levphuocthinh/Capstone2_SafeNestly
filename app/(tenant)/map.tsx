import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapSearch } from '../../components/safenestly/common';

export default function MapScreen() {
  const handleBackToList = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon='arrow-left' size={24} onPress={handleBackToList} />
        <Text variant='titleLarge' style={styles.headerTitle}>
          Map View
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <MapSearch />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
});
