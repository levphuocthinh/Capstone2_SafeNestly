import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LifestyleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const lifestyleOptions: LifestyleOption[] = [
  {
    id: 'social',
    title: 'Social & Outgoing',
    description: 'Love meeting new people and hosting gatherings',
    icon: '🎉',
  },
  {
    id: 'quiet',
    title: 'Quiet & Private',
    description: 'Prefer peaceful environment and personal space',
    icon: '🧘',
  },
  {
    id: 'modern',
    title: 'Modern & Tech-savvy',
    description: 'Enjoy latest technology and contemporary lifestyle',
    icon: '💻',
  },
  {
    id: 'minimalist',
    title: 'Minimalist & Clean',
    description: 'Keep things simple, organized, and clutter-free',
    icon: '✨',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [habits, setHabits] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const habitOptions = [
    'Non-smoker',
    'Smoker',
    'Vegetarian',
    'Vegan',
    'Early bird',
    'Night owl',
    'Fitness enthusiast',
    'Pet lover',
    'Quiet person',
    'Social person',
  ];

  const toggleHabit = (habit: string) => {
    setHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit],
    );
  };

  const toggleLifestyle = (lifestyleId: string) => {
    setLifestyle((prev) =>
      prev.includes(lifestyleId)
        ? prev.filter((l) => l !== lifestyleId)
        : [...prev, lifestyleId],
    );
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    // Save onboarding data to your backend
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to main app
      router.replace('/(tenant)/home');
    } catch (error) {
      console.error('Onboarding completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHabitsStep = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant='headlineSmall' style={styles.cardTitle}>
          Tell us about your habits
        </Text>
        <Text variant='bodyMedium' style={styles.cardSubtitle}>
          Select all that apply to help us match you better
        </Text>

        <View style={styles.chipContainer}>
          {habitOptions.map((habit) => (
            <Chip
              key={habit}
              selected={habits.includes(habit)}
              onPress={() => toggleHabit(habit)}
              style={styles.habitChip}
            >
              {habit}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderLifestyleStep = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant='headlineSmall' style={styles.cardTitle}>
          Choose your lifestyle
        </Text>
        <Text variant='bodyMedium' style={styles.cardSubtitle}>
          Select up to 2 lifestyles that best describe you
        </Text>

        <View style={styles.lifestyleContainer}>
          {lifestyleOptions.map((option) => (
            <Card
              key={option.id}
              style={[
                styles.lifestyleCard,
                lifestyle.includes(option.id) && styles.selectedLifestyleCard,
              ]}
              onPress={() => toggleLifestyle(option.id)}
            >
              <Card.Content style={styles.lifestyleCardContent}>
                <Text style={styles.lifestyleIcon}>{option.icon}</Text>
                <Text variant='titleMedium' style={styles.lifestyleTitle}>
                  {option.title}
                </Text>
                <Text variant='bodySmall' style={styles.lifestyleDescription}>
                  {option.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDescriptionStep = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant='headlineSmall' style={styles.cardTitle}>
          Describe yourself
        </Text>
        <Text variant='bodyMedium' style={styles.cardSubtitle}>
          Write a brief description to help others get to know you better
        </Text>

        <TextInput
          label='About me'
          value={description}
          onChangeText={setDescription}
          mode='outlined'
          multiline
          numberOfLines={4}
          placeholder="Tell us about your interests, hobbies, and what kind of living environment you're looking for..."
          style={styles.descriptionInput}
        />
      </Card.Content>
    </Card>
  );

  const steps = [
    { title: 'Habits', component: renderHabitsStep() },
    { title: 'Lifestyle', component: renderLifestyleStep() },
    { title: 'About You', component: renderDescriptionStep() },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text
            variant='headlineLarge'
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Complete Your Profile
          </Text>
          <Text variant='bodyLarge' style={styles.subtitle}>
            Step {currentStep + 1} of {steps.length}
          </Text>

          <View style={styles.progressContainer}>
            {steps.map((step, index) => (
              <View
                key={step.title}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.activeProgressDot,
                  {
                    backgroundColor:
                      index <= currentStep ? theme.colors.primary : '#e0e0e0',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {steps[currentStep].component}

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Button
              mode='outlined'
              onPress={handleBack}
              style={styles.backButton}
            >
              Back
            </Button>
          )}

          <Button
            mode='contained'
            onPress={handleNext}
            loading={loading}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeProgressDot: {
    // Color is set dynamically
  },
  card: {
    marginBottom: 30,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitChip: {
    marginBottom: 8,
  },
  lifestyleContainer: {
    gap: 16,
  },
  lifestyleCard: {
    elevation: 2,
  },
  selectedLifestyleCard: {
    elevation: 4,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  lifestyleCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  lifestyleIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  lifestyleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  lifestyleDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  descriptionInput: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
