import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Chip } from "react-native-paper";

interface FilterChipsProps {
  filters: string[];
  onRemoveFilter: (filter: string) => void;
  title?: string;
  showTitle?: boolean;
}

export function FilterChips({
  filters,
  onRemoveFilter,
  title = "Active Filters:",
  showTitle = true,
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.title}>{title}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chipContainer}>
          {filters.map((filter) => (
            <Chip
              key={filter}
              onClose={() => onRemoveFilter(filter)}
              style={styles.chip}
            >
              {filter}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
});
