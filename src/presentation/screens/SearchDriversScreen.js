import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import TripRepository from '../../data/repositories/TripRepository';
import UserRepository from '../../data/repositories/UserRepository';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';

const SearchDriversScreen = ({ navigation }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [driverData, setDriverData] = useState({});
  const { user } = useAuth();

  const tripRepository = new TripRepository();
  const userRepository = new UserRepository();

  // Listener en tiempo real para los viajes
  useEffect(() => {
    let unsubscribe;

    const setupRealtimeListener = () => {
      unsubscribe = tripRepository.onTripsChange((updatedTrips) => {
        // Filtrar solo viajes disponibles
        const availableTrips = updatedTrips.filter(
          trip => trip.status === 'scheduled' && trip.availableSeats > 0
        );
        setTrips(availableTrips);

        // Cargar datos de conductores
        loadDriversData(availableTrips);
      });
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadDriversData = async (trips) => {
    const driversMap = {};

    for (const trip of trips) {
      if (!driversMap[trip.driverId]) {
        try {
          const driver = await userRepository.getUserProfile(trip.driverId);
          if (driver) {
            driversMap[trip.driverId] = driver;
          }
        } catch (error) {
          console.error('Error loading driver:', error);
        }
      }
    }

    setDriverData(driversMap);
  };

  const handleSearch = async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Por favor ingresa origen y destino');
      return;
    }

    setIsLoading(true);
    try {
      // Simular búsqueda con coordenadas (en producción usarías geocoding)
      const originCoords = { latitude: 40.4168, longitude: -3.7038 };
      const destCoords = { latitude: 41.3851, longitude: 2.1734 };

      const foundTrips = await tripRepository.searchTrips(
        originCoords.latitude,
        originCoords.longitude,
        destCoords.latitude,
        destCoords.longitude,
        0.5 // Radio de búsqueda 500 metros
      );

      setTrips(foundTrips);
      loadDriversData(foundTrips);
    } catch (error) {
      console.error('Error searching trips:', error);
      Alert.alert('Error', 'No se pudieron buscar viajes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookTrip = async (trip) => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para reservar un viaje');
      return;
    }

    Alert.alert(
      'Reservar viaje',
      `¿Quieres reservar este viaje a ${trip.destination.city}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reservar',
          onPress: async () => {
            try {
              await tripRepository.addPassenger(
                trip.id,
                user.id,
                trip.origin,
                1
              );
              Alert.alert('Éxito', '¡Viaje reservado exitosamente!');
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo reservar el viaje');
            }
          },
        },
      ]
    );
  };

  const renderTrip = ({ item }) => {
    const driver = driverData[item.driverId];

    return (
      <TouchableOpacity
        style={styles.tripItem}
        onPress={() => handleBookTrip(item)}
      >
        <View style={styles.tripHeader}>
          <View style={styles.routeContainer}>
            <Text style={styles.tripRoute}>
              {item.origin.city || item.origin.address}
            </Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.tripRoute}>
              {item.destination.city || item.destination.address}
            </Text>
          </View>
          <Text style={styles.tripPrice}>€{item.price?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.tripText}>
              🕒 {new Date(item.departureTime).toLocaleDateString()}
              {' '}{new Date(item.departureTime).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.tripText}>👥 {item.availableSeats} plazas disponibles</Text>
            {driver && (
              <Text style={styles.tripText}>⭐ {driver.rating?.toFixed(1) || '0.0'}</Text>
            )}
          </View>
        </View>

        {item.car && (
          <View style={styles.carContainer}>
            <Text style={styles.carInfo}>
              🚗 {item.car.model} • {item.car.color}
            </Text>
          </View>
        )}

        {driver && (
          <View style={styles.driverContainer}>
            <Text style={styles.driverName}>Conductor: {driver.name}</Text>
            <Text style={styles.driverTrips}>{driver.totalTrips || 0} viajes</Text>
          </View>
        )}

        <View style={styles.preferencesContainer}>
          {!item.smokingAllowed && <Text style={styles.badge}>🚭 No fumar</Text>}
          {item.preferences?.petsAllowed && <Text style={styles.badge}>🐕 Mascotas OK</Text>}
          {item.preferences?.musicAllowed && <Text style={styles.badge}>🎵 Música</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Buscar Viajes</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Origen (ciudad)"
          placeholderTextColor={colors.text}
          value={origin}
          onChangeText={setOrigin}
        />
        <TextInput
          style={styles.input}
          placeholder="Destino (ciudad)"
          placeholderTextColor={colors.text}
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>
          {trips.length} viaje{trips.length !== 1 ? 's' : ''} disponible{trips.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.liveIndicator}>🔴 EN VIVO</Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={item => item.id}
        style={styles.tripList}
        contentContainerStyle={styles.tripListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🚗</Text>
            <Text style={styles.emptyText}>
              No hay viajes disponibles
            </Text>
            <Text style={styles.emptySubtext}>
              Intenta buscar en otra ruta o crea tu propio viaje
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 52,
    borderColor: colors.secondary,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.background,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  liveIndicator: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tripList: {
    flex: 1,
  },
  tripListContent: {
    paddingBottom: 20,
  },
  tripItem: {
    backgroundColor: colors.secondary,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tripHeader: {
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tripRoute: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrow: {
    color: colors.accent,
    fontSize: 16,
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  tripPrice: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  tripDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tripText: {
    color: colors.background,
    fontSize: 14,
  },
  carContainer: {
    marginBottom: 8,
  },
  carInfo: {
    color: colors.text,
    fontSize: 13,
  },
  driverContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  driverName: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
  driverTrips: {
    color: colors.text,
    fontSize: 13,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(193, 253, 114, 0.2)',
    color: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default SearchDriversScreen;