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
          Chỉnh sửa Hồ sơ
        </Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='bodyMedium'>
              Chức năng chỉnh sửa hồ sơ sẽ được triển khai tại đây.
            </Text>
          </Card.Content>
        </Card>
        <Button
          mode='contained'
          onPress={() => router.back()}
          style={styles.button}
        >
          Quay lại Hồ sơ
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
