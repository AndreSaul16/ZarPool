import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';

const MainMenuScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {user.name}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SearchDrivers')}
      >
        <Text style={styles.buttonText}>Buscar Conductores</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ConfigureTrip')}
      >
        <Text style={styles.buttonText}>Configurar Viaje</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RealTimePickup')}
      >
        <Text style={styles.buttonText}>Recogida en Tiempo Real</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MainMenuScreen;