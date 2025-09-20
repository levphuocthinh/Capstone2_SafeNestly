import React from "react";
import { View, StyleSheet } from "react-native";
import { Searchbar, Button } from "react-native-paper";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  showMapButton?: boolean;
  showFilterButton?: boolean;
  onMapPress?: () => void;
  onFilterPress?: () => void;
  mapIcon?: string;
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  placeholder = "Search by city, address...",
  showMapButton = false,
  showFilterButton = false,
  onMapPress,
  onFilterPress,
  mapIcon = "map",
}: SearchHeaderProps) {
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
        icon={showMapButton ? mapIcon : "magnify"}
        onIconPress={showMapButton ? onMapPress : undefined}
      />

      {(showFilterButton || showMapButton) && (
        <View style={styles.actions}>
          {showFilterButton && onFilterPress && (
            <Button
              mode="outlined"
              icon="filter-variant"
              onPress={onFilterPress}
              style={styles.actionButton}
            >
              Filters
            </Button>
          )}
          {showMapButton && onMapPress && (
            <Button
              mode="contained"
              icon="map"
              onPress={onMapPress}
              style={styles.actionButton}
            >
              Map
            </Button>
          )}
        </View>
      )}
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
  searchBar: {
    marginBottom: 12,
    elevation: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
