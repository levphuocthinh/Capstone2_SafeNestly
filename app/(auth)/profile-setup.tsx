import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
  Text,
  Button,
  Card,
  Chip,
  TextInput,
  useTheme,
  HelperText,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/ui/back-button";

interface LifestyleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

const lifestyleOptions: LifestyleOption[] = [
  {
    id: "social",
    title: "Social & Outgoing",
    description: "Love meeting new people and hosting gatherings",
    icon: "🎉",
    image: "https://via.placeholder.com/150x100/6200ee/ffffff?text=Social",
  },
  {
    id: "quiet",
    title: "Quiet & Private",
    description: "Prefer peaceful environment and personal space",
    icon: "🧘",
    image: "https://via.placeholder.com/150x100/4CAF50/ffffff?text=Quiet",
  },
  {
    id: "modern",
    title: "Modern & Tech-savvy",
    description: "Enjoy latest technology and contemporary lifestyle",
    icon: "💻",
    image: "https://via.placeholder.com/150x100/FF9800/ffffff?text=Modern",
  },
  {
    id: "minimalist",
    title: "Minimalist & Clean",
    description: "Keep things simple, organized, and clutter-free",
    icon: "✨",
    image: "https://via.placeholder.com/150x100/2196F3/ffffff?text=Minimal",
  },
];

const cityOptions = [
  "San Francisco",
  "Los Angeles",
  "New York",
  "Seattle",
  "Austin",
  "Denver",
  "Chicago",
  "Boston",
  "Portland",
  "Miami",
  "Atlanta",
  "Other",
];

export default function ProfileSetupScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [habits, setHabits] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const habitOptions = [
    "Non-smoker",
    "Smoker",
    "Vegetarian",
    "Vegan",
    "Early bird",
    "Night owl",
    "Fitness enthusiast",
    "Pet lover",
    "Quiet person",
    "Social person",
    "Clean & organized",
    "Cooking enthusiast",
  ];

  const toggleHabit = (habit: string) => {
    setHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
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
    try {
      // Save profile setup data
      const profileData = {
        city: city === "Other" ? customCity : city,
        habits,
        lifestyle,
        description,
        setupCompleted: true,
      };

      // In a real app, send to backend
      console.log("Profile setup complete:", profileData);

      // Navigate to home based on user type
      // For now, navigate to tenant home
      router.replace("/(tenant)/home");
    } catch (error) {
      console.error("Profile setup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderCitySelection();
      case 1:
        return renderHabitsSelection();
      case 2:
        return renderLifestyleSelection();
      case 3:
        return renderDescriptionInput();
      default:
        return renderCitySelection();
    }
  };

  const renderCitySelection = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Where do you want to rent?
        </Text>
        <Text variant="bodyMedium" style={styles.stepDescription}>
          Select the city where you're looking for a room
        </Text>

        <View style={styles.cityGrid}>
          {cityOptions.map((cityOption) => (
            <Chip
              key={cityOption}
              selected={city === cityOption}
              onPress={() => setCity(cityOption)}
              style={[
                styles.cityChip,
                city === cityOption && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              textStyle={city === cityOption ? { color: "white" } : {}}
            >
              {cityOption}
            </Chip>
          ))}
        </View>

        {city === "Other" && (
          <TextInput
            label="Enter your city"
            value={customCity}
            onChangeText={setCustomCity}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Phoenix, Nashville"
          />
        )}
      </Card.Content>
    </Card>
  );

  const renderHabitsSelection = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Your Habits & Preferences
        </Text>
        <Text variant="bodyMedium" style={styles.stepDescription}>
          Select all that apply to help us find compatible roommates
        </Text>

        <View style={styles.habitsGrid}>
          {habitOptions.map((habit) => (
            <Chip
              key={habit}
              selected={habits.includes(habit)}
              onPress={() => toggleHabit(habit)}
              style={[
                styles.habitChip,
                habits.includes(habit) && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              textStyle={habits.includes(habit) ? { color: "white" } : {}}
            >
              {habit}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderLifestyleSelection = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Your Lifestyle
        </Text>
        <Text variant="bodyMedium" style={styles.stepDescription}>
          Choose the option that best describes your lifestyle
        </Text>

        <View style={styles.lifestyleGrid}>
          {lifestyleOptions.map((option) => (
            <Card
              key={option.id}
              style={[
                styles.lifestyleCard,
                lifestyle === option.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setLifestyle(option.id)}
            >
              <Card.Content style={styles.lifestyleContent}>
                <Image
                  source={{ uri: option.image }}
                  style={styles.lifestyleImage}
                />
                <Text variant="titleMedium" style={styles.lifestyleTitle}>
                  {option.icon} {option.title}
                </Text>
                <Text variant="bodySmall" style={styles.lifestyleDescription}>
                  {option.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDescriptionInput = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Tell us about yourself
        </Text>
        <Text variant="bodyMedium" style={styles.stepDescription}>
          Write a brief description to help others get to know you better
        </Text>

        <TextInput
          label="About Me"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.descriptionInput}
          placeholder="I'm a friendly person who loves cooking and outdoor activities. I'm looking for a clean, respectful roommate to share a comfortable space..."
        />

        <HelperText type="info">{description.length}/300 characters</HelperText>
      </Card.Content>
    </Card>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return city && (city !== "Other" || customCity.trim());
      case 1:
        return habits.length > 0;
      case 2:
        return lifestyle;
      case 3:
        return description.trim().length >= 50;
      default:
        return false;
    }
  };

  const stepTitles = [
    "City Selection",
    "Habits & Preferences",
    "Lifestyle Choice",
    "Personal Description",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title="Profile Setup" />

      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Complete Your Profile
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Step {currentStep + 1} of 4: {stepTitles[currentStep]}
        </Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step <= currentStep
                      ? theme.colors.primary
                      : theme.colors.outline,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
          >
            Back
          </Button>
        )}

        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!canProceed()}
          loading={loading && currentStep === 3}
          style={styles.nextButton}
        >
          {currentStep === 3 ? "Complete Setup" : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 20,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  cityChip: {
    margin: 2,
  },
  input: {
    marginTop: 16,
  },
  habitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  habitChip: {
    margin: 2,
  },
  lifestyleGrid: {
    gap: 12,
  },
  lifestyleCard: {
    marginBottom: 8,
  },
  lifestyleContent: {
    alignItems: "center",
    padding: 16,
  },
  lifestyleImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  lifestyleTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  lifestyleDescription: {
    textAlign: "center",
    opacity: 0.7,
  },
  descriptionInput: {
    marginBottom: 8,
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
