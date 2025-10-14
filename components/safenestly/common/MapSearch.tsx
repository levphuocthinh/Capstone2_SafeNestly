import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  ActivityIndicator,
  Button,
  Card,
  FAB,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { searchLocation, type LocationApiResponse } from '@/utils/maps';

type UiPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  type?: string;
  distanceInMeters: number;
};

export type MapSearchProps = {
  initialQuery?: string;
  style?: ViewStyle;
  showSearchBar?: boolean;
  enableSearchAreaButton?: boolean;
  onResult?: (response: LocationApiResponse) => void;
};

export function MapSearch({
  initialQuery = 'Thành phố Đà Nẵng, Việt Nam',
  style,
  showSearchBar = true,
  enableSearchAreaButton = false,
  onResult,
}: MapSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 10.776889,
    longitude: 106.700806,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const mapRef = useRef<MapView | null>(null);
  const [centerPin, setCenterPin] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [places, setPlaces] = useState<UiPlace[]>([]);
  // No per-marker selection on map; selection handled inside modal list
  const [nearbyOpen, setNearbyOpen] = useState(false);

  const performSearch = async () => {
    if (!query?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      console.log('[MapSearch] Searching for:', query.trim());
      const res = await searchLocation(query.trim());
      console.log('[MapSearch] searchLocation response:', res);
      onResult?.(res);
      if (res.status !== 'SUCCESS' || !res.location) {
        setError(res.message || 'Location not found');
        setPlaces([]);
        setCenterPin(null);
        return;
      }

      const latitude = res.location.latitude;
      const longitude = res.location.longitude;
      const formattedAddress = res.location.formattedAddress;

      const nextRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      setRegion((prev: Region) => ({ ...prev, ...nextRegion }));
      // Smoothly move the camera as well to ensure the map visibly updates
      requestAnimationFrame(() => {
        mapRef.current?.animateToRegion(nextRegion, 600);
      });
      setCenterPin({
        lat: latitude,
        lng: longitude,
        address: formattedAddress,
      });
      setPlaces(
        (res.nearbyPlaces || []).map((p) => ({
          id: p.placeId,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          rating: p.rating,
          type: p.type,
          distanceInMeters: p.distanceInMeters,
        })),
      );
    } catch (e: any) {
      setError(e?.message ?? 'Failed to search location');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Keep query in sync if the prop changes and trigger a search
  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  // Note: Intentionally do NOT auto-search on query change.
  // The API will be called only when pressing the Search button.

  return (
    <View style={[styles.container, style]}>
      {showSearchBar && (
        <View style={styles.searchBar}>
          <TextInput
            mode='outlined'
            placeholder='Search address (e.g., 02 Nguyen Hue, Ho Chi Minh)'
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1 }}
            returnKeyType='search'
            // Only search on button press as requested
          />
          <Button
            mode='contained'
            onPress={performSearch}
            style={{ marginLeft: 8 }}
          >
            Search
          </Button>
        </View>
      )}

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.mapPlaceholder}>
            <Text variant='bodyMedium'>
              Map preview is not available on web for this demo.
            </Text>
            <Text variant='bodySmall' style={styles.mapNote}>
              Run on iOS/Android to see Google Maps.
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={region}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {centerPin && (
              <Marker
                coordinate={{
                  latitude: centerPin.lat,
                  longitude: centerPin.lng,
                }}
                title={centerPin.address}
                pinColor='#1976D2'
              />
            )}
            {/* Only mark the searched location; nearby places are shown in a modal list */}
          </MapView>
        )}
      </View>

      {!!error && (
        <Card
          style={[
            styles.detailsCard,
            { borderLeftWidth: 4, borderLeftColor: '#D32F2F' },
          ]}
        >
          <Card.Content>
            <Text style={{ color: '#D32F2F' }}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Nearby places modal */}
      <Portal>
        <Modal
          visible={nearbyOpen}
          onDismiss={() => setNearbyOpen(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant='titleMedium' style={{ marginBottom: 8 }}>
            Nearby places ({places.length})
          </Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {places.map((p) => (
              <Card key={p.id} style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant='titleSmall'>{p.name}</Text>
                  <Text variant='bodySmall'>📍 {p.address}</Text>
                  <Text variant='bodySmall'>
                    {p.type} {p.rating ? `• ⭐ ${p.rating}` : ''} •{' '}
                    {(p.distanceInMeters / 1000).toFixed(2)} km
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button
              mode='outlined'
              onPress={() => setNearbyOpen(false)}
              style={{ flex: 1 }}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Toggle modal button */}
      {places.length > 0 && (
        <FAB
          icon='map-marker'
          label={`Nearby (${places.length})`}
          style={styles.nearbyFab}
          onPress={() => setNearbyOpen(true)}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator animating size='large' />
        </View>
      )}

      {enableSearchAreaButton && (
        <Button
          mode='contained'
          style={styles.searchAreaBtn}
          onPress={performSearch}
          disabled={loading}
        >
          Search this area
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapNote: {
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  detailsCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  location: {
    opacity: 0.7,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  searchAreaBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  nearbyFab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
});
