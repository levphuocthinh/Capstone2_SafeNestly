import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticateUser } from '../../services/auth.service';
import { getHomeRouteForRole } from '../../utils/auth-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await authenticateUser(email.trim(), password);

      if (result.success && result.user) {
        const homeRoute = getHomeRouteForRole(result.user.role);
        router.replace(homeRoute as any);
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    router.push('/(auth)/phone-login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Professional Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🏠</Text>
            </View>
            <Text
              variant='headlineLarge'
              style={[styles.title, { color: theme.colors.primary }]}
            >
              SafeNestly
            </Text>
          </View>
          <Text variant='bodyLarge' style={styles.subtitle}>
            Your trusted platform for safe room rentals
          </Text>
          <Text variant='bodyMedium' style={styles.tagline}>
            🛡️ Verified Properties • 🤝 Smart Roommate Matching • 📍 Safe
            Neighborhoods
          </Text>
        </View>

        {/* Main Login Card */}
        <Card style={styles.card} elevation={5}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text variant='headlineSmall' style={styles.cardTitle}>
                Welcome Back
              </Text>
              <Text variant='bodyMedium' style={styles.cardSubtitle}>
                Sign in to continue your safe housing journey
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label='Email Address'
                value={email}
                onChangeText={setEmail}
                mode='outlined'
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                left={<TextInput.Icon icon='email-outline' />}
                style={styles.input}
                contentStyle={styles.inputContent}
              />

              <TextInput
                label='Password'
                value={password}
                onChangeText={setPassword}
                mode='outlined'
                secureTextEntry={!showPassword}
                autoComplete='password'
                left={<TextInput.Icon icon='lock-outline' />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
              />
            </View>

            <Button
              mode='contained'
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <Divider style={styles.divider} />
            </View>

            <Button
              mode='outlined'
              onPress={handlePhoneLogin}
              icon='phone-outline'
              style={styles.phoneButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.secondaryButtonLabel}
            >
              Sign In with Phone
            </Button>

            {/* Quick Access Info */}
            <View style={styles.quickAccessInfo}>
              <Text variant='bodySmall' style={styles.quickAccessText}>
                💡 Quick Access: Use test accounts below for instant demo
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Professional Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to SafeNestly? </Text>
          <Button
            mode='text'
            onPress={handleRegister}
            compact
            labelStyle={styles.footerButtonLabel}
          >
            Create Account
          </Button>
        </View>

        {/* Guest Access Option */}
        <View style={styles.guestAccessSection}>
          <Text variant='bodyMedium' style={styles.guestAccessText}>
            Want to browse without signing up?
          </Text>
          <Button
            mode='outlined'
            onPress={() => router.push('/(guest)/home')}
            icon='eye-outline'
            style={styles.guestAccessButton}
            contentStyle={styles.guestAccessButtonContent}
            labelStyle={styles.guestAccessButtonLabel}
          >
            Browse as Guest
          </Button>
          <Text variant='bodySmall' style={styles.guestAccessNote}>
            Limited access • Sign up for full features
          </Text>
        </View>

        {/* Additional Features Info */}
        <View style={styles.featuresInfo}>
          <Text variant='bodySmall' style={styles.featuresText}>
            ✨ AI-Powered Roommate Matching • 🔒 Verified Properties • 📱
            Real-time Chat
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoIcon: {
    fontSize: 40,
    color: 'white',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
    fontWeight: '500',
  },
  tagline: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  card: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  cardSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontSize: 16,
    paddingVertical: 4,
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    opacity: 0.3,
  },
  orText: {
    marginHorizontal: 20,
    opacity: 0.7,
    fontSize: 14,
    fontWeight: '500',
  },
  phoneButton: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  quickAccessInfo: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickAccessText: {
    opacity: 0.8,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    opacity: 0.7,
    fontSize: 16,
  },
  footerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featuresText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
  guestAccessSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  guestAccessText: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  guestAccessButton: {
    borderRadius: 8,
    borderColor: '#6200ee',
    borderWidth: 1.5,
  },
  guestAccessButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  guestAccessButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  guestAccessNote: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
