import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, Modal, Portal } from 'react-native-paper';
import { router } from 'expo-router';

interface LoginPromptModalProps {
  readonly visible: boolean;
  readonly onDismiss: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly showRegisterButton?: boolean;
}

export function LoginPromptModal({
  visible,
  onDismiss,
  title = 'Account Required',
  message = 'Please sign in or create an account to access this feature.',
  showRegisterButton = true,
}: LoginPromptModalProps) {
  const handleLogin = () => {
    onDismiss();
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    onDismiss();
    router.push('/(auth)/register');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <Card>
          <Card.Content style={styles.modalCard}>
            <Text variant='titleLarge' style={styles.modalTitle}>
              {title}
            </Text>
            <Text variant='bodyMedium' style={styles.modalText}>
              {message}
            </Text>

            <View style={styles.modalButtons}>
              <Button
                mode='outlined'
                onPress={handleLogin}
                style={styles.modalButton}
              >
                Sign In
              </Button>
              {showRegisterButton && (
                <Button
                  mode='contained'
                  onPress={handleRegister}
                  style={styles.modalButton}
                >
                  Sign Up
                </Button>
              )}
            </View>

            <Button mode='text' onPress={onDismiss} style={styles.cancelButton}>
              Cancel
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  modalCard: {
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: 8,
  },
});
