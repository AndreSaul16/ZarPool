import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import TripRepository from '../../data/repositories/TripRepository';
import colors from '../styles/colors';

const ConfigureTripScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [availableSeats, setAvailableSeats] = useState('3');
  const [totalSeats, setTotalSeats] = useState('4');
  const [stops, setStops] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(true);
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tripRepository = new TripRepository();

  const handleCreateTrip = async () => {
    // Validaciones
    if (!origin || !destination) {
      Alert.alert('Error', 'Por favor ingresa origen y destino');
      return;
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return;
    }

    if (!departureDate || !departureTime) {
      Alert.alert('Error', 'Por favor ingresa fecha y hora de salida');
      return;
    }

    if (!carModel || !carColor) {
      Alert.alert('Error', 'Por favor ingresa información del vehículo');
      return;
    }

    const seats = parseInt(availableSeats);
    const total = parseInt(totalSeats);

    if (isNaN(seats) || seats <= 0 || seats > total) {
      Alert.alert('Error', 'Las plazas disponibles deben ser mayores a 0 y menores o iguales al total');
      return;
    }

    setIsLoading(true);

    try {
      // Crear fecha de salida
      const dateTimeString = `${departureDate}T${departureTime}:00`;
      const departureDateTime = new Date(dateTimeString);

      if (isNaN(departureDateTime.getTime())) {
        Alert.alert('Error', 'Formato de fecha/hora inválido. Usa YYYY-MM-DD para fecha y HH:MM para hora');
        setIsLoading(false);
        return;
      }

      // Calcular hora estimada de llegada (por ejemplo, 6 horas después)
      const estimatedArrival = new Date(departureDateTime.getTime() + 6 * 60 * 60 * 1000);

      const tripData = {
        origin: {
          latitude: 40.4168, // Coordenadas simuladas - en producción usar geocoding
          longitude: -3.7038,
          address: origin,
          city: origin.split(',')[0].trim()
        },
        destination: {
          latitude: 41.3851, // Coordenadas simuladas - en producción usar geocoding
          longitude: 2.1734,
          address: destination,
          city: destination.split(',')[0].trim()
        },
        departureTime: departureDateTime.toISOString(),
        estimatedArrival: estimatedArrival.toISOString(),
        price: parseFloat(price),
        availableSeats: seats,
        totalSeats: total,
        stops,
        smokingAllowed,
        preferences: {
          petsAllowed,
          musicAllowed,
          conversationLevel: 'medium'
        },
        car: {
          model: carModel,
          color: carColor,
          licensePlate: 'XXX-0000', // En producción pedir matrícula real
          year: new Date().getFullYear()
        }
      };

      await tripRepository.createTrip(user.id, tripData);

      Alert.alert(
        'Éxito',
        '¡Viaje creado exitosamente!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'No se pudo crear el viaje. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>🚗 Crear Viaje</Text>
      <Text style={styles.subtitle}>Comparte tu viaje y ahorra en costos</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ruta</Text>
        <TextInput
          style={styles.input}
          placeholder="Origen (ciudad o dirección)"
          placeholderTextColor={colors.text}
          value={origin}
          onChangeText={setOrigin}
        />
        <TextInput
          style={styles.input}
          placeholder="Destino (ciudad o dirección)"
          placeholderTextColor={colors.text}
          value={destination}
          onChangeText={setDestination}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕒 Fecha y hora</Text>
        <TextInput
          style={styles.input}
          placeholder="Fecha (YYYY-MM-DD) ej: 2025-12-25"
          placeholderTextColor={colors.text}
          value={departureDate}
          onChangeText={setDepartureDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Hora (HH:MM) ej: 14:30"
          placeholderTextColor={colors.text}
          value={departureTime}
          onChangeText={setDepartureTime}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Precio y plazas</Text>
        <TextInput
          style={styles.input}
          placeholder="Precio por persona (  €)"
          placeholderTextColor={colors.text}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Plazas disponibles"
            placeholderTextColor={colors.text}
            value={availableSeats}
            onChangeText={setAvailableSeats}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Total plazas"
            placeholderTextColor={colors.text}
            value={totalSeats}
            onChangeText={setTotalSeats}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚙 Vehículo</Text>
        <TextInput
          style={styles.input}
          placeholder="Modelo (ej: Toyota Corolla)"
          placeholderTextColor={colors.text}
          value={carModel}
          onChangeText={setCarModel}
        />
        <TextInput
          style={styles.input}
          placeholder="Color"
          placeholderTextColor={colors.text}
          value={carColor}
          onChangeText={setCarColor}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Preferencias</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>🛑 Permitir paradas en ruta</Text>
          <Switch
            value={stops}
            onValueChange={setStops}
            trackColor={{ false: colors.text, true: colors.accent }}
            thumbColor={stops ? colors.background : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>🚬 Permitir fumadores</Text>
          <Switch
            value={smokingAllowed}
            onValueChange={setSmokingAllowed}
            trackColor={{ false: colors.text, true: colors.accent }}
            thumbColor={smokingAllowed ? colors.background : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>🐕 Permitir mascotas</Text>
          <Switch
            value={petsAllowed}
            onValueChange={setPetsAllowed}
            trackColor={{ false: colors.text, true: colors.accent }}
            thumbColor={petsAllowed ? colors.background : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>🎵 Música permitida</Text>
          <Switch
            value={musicAllowed}
            onValueChange={setMusicAllowed}
            trackColor={{ false: colors.text, true: colors.accent }}
            thumbColor={musicAllowed ? colors.background : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateTrip}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Crear Viaje</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 56,
    borderColor: colors.secondary,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.background,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    color: colors.background,
    fontSize: 16,
    flex: 1,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
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
});

export default ConfigureTripScreen;