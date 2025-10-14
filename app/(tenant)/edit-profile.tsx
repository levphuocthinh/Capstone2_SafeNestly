import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/back-button';

export default function EditProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text variant='headlineMedium' style={styles.title}>
          Edit Profile
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='bodyMedium'>
              Profile editing functionality will be implemented here.
            </Text>
          </Card.Content>
        </Card>
        <Button
          mode='contained'
          onPress={() => router.back()}
          style={styles.button}
        >
          Back to Profile
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
