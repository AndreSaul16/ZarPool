import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PickupRepository from '../../data/repositories/PickupRepository';
import TripRepository from '../../data/repositories/TripRepository';
import colors from '../styles/colors';

const RealTimePickupScreen = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPickup, setCurrentPickup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const pickupRepository = new PickupRepository();
  const tripRepository = new TripRepository();

  useEffect(() => {
    if (user) {
      setupRealtimeListeners();
    }

    return () => {
      // Cleanup listeners if needed
    };
  }, [user]);

  const setupRealtimeListeners = async () => {
    try {
      // Obtener viajes del conductor
      const allTrips = await tripRepository.getAllTrips();
      const driverTrips = allTrips.filter(trip => trip.driverId === user.id);

      if (driverTrips.length === 0) {
        setIsLoading(false);
        return;
      }

      // Configurar listeners para cada viaje del conductor
      const unsubscribers = [];

      for (const trip of driverTrips) {
        const unsubscribe = pickupRepository.onPickupsChange(trip.id, (updatedPickups) => {
          // Filtrar solo recogidas pendientes o en espera
          const activePickups = updatedPickups.filter(
            p => p.status === 'pending' || p.status === 'waiting'
          );

          setPickups(prevPickups => {
            // Actualizar pickups para este viaje específico
            const otherPickups = prevPickups.filter(p => p.tripId !== trip.id);
            return [...otherPickups, ...activePickups];
          });
        });

        unsubscribers.push(unsubscribe);
      }

      setIsLoading(false);

      // Retornar función de limpieza
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    } catch (error) {
      console.error('Error setting up listeners:', error);
      setIsLoading(false);
    }
  };

  const handlePickupRequest = (pickup) => {
    setCurrentPickup(pickup);
    setModalVisible(true);
  };

  const handleAcceptPickup = async () => {
    if (!currentPickup) return;

    try {
      await pickupRepository.updatePickupStatus(
        currentPickup.id,
        'accepted',
        new Date().toISOString()
      );
      setModalVisible(false);
      Alert.alert('Éxito', 'Recogida aceptada. ¡Buen viaje!');
    } catch (error) {
      console.error('Error accepting pickup:', error);
      Alert.alert('Error', 'No se pudo aceptar la recogida');
    }
  };

  const handleRejectPickup = async () => {
    if (!currentPickup) return;

    try {
      await pickupRepository.updatePickupStatus(currentPickup.id, 'rejected');
      setModalVisible(false);
      Alert.alert('Rechazada', 'Recogida rechazada');
    } catch (error) {
      console.error('Error rejecting pickup:', error);
      Alert.alert('Error', 'No se pudo rechazar la recogida');
    }
  };

  const renderPickup = ({ item }) => (
    <TouchableOpacity
      style={styles.pickupCard}
      onPress={() => handlePickupRequest(item)}
    >
      <View style={styles.pickupHeader}>
        <View style={styles.passengerInfo}>
          <View style={styles.passengerAvatar}>
            <Text style={styles.passengerInitial}>
              {item.passengerName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.passengerName}>{item.passengerName}</Text>
            <Text style={styles.pickupStatus}>
              {item.status === 'pending' ? '⏳ Pendiente' : '⌛ Esperando'}
            </Text>
          </View>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{item.location.address}</Text>
      </View>

      {item.estimatedTime && (
        <Text style={styles.estimatedTime}>
          🕒 Estimado: {new Date(item.estimatedTime).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handlePickupRequest(item)}
      >
        <Text style={styles.actionButtonText}>Ver detalles</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando recogidas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Recogidas en Tiempo Real</Text>
        <View style={styles.headerIndicator}>
          <View style={styles.liveDotBig} />
          <Text style={styles.liveTextHeader}>ACTUALIZANDO</Text>
        </View>
      </View>

      <FlatList
        data={pickups}
        renderItem={renderPickup}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>No hay recogidas activas</Text>
            <Text style={styles.emptySubtext}>
              Las solicitudes de recogida aparecerán aquí en tiempo real
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚡ Nueva Recogida</Text>
            {currentPickup && (
              <>
                <View style={styles.modalPassenger}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {currentPickup.passengerName?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.modalName}>{currentPickup.passengerName}</Text>
                </View>
                <View style={styles.modalLocation}>
                  <Text style={styles.modalLocationIcon}>📍</Text>
                  <Text style={styles.modalLocationText}>
                    {currentPickup.location.address}
                  </Text>
                </View>
                <Text style={styles.modalQuestion}>
                  ¿Quieres aceptar esta recogida?
                </Text>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={handleRejectPickup}
              >
                <Text style={styles.modalButtonText}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={handleAcceptPickup}
              >
                <Text style={styles.modalButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 12,
  },
  headerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDotBig: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  liveTextHeader: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  pickupCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passengerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
  },
  pickupStatus: {
    fontSize: 14,
    color: colors.text,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  liveText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: colors.background,
    flex: 1,
  },
  estimatedTime: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: colors.secondary,
    padding: 24,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 20,
  },
  modalPassenger: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
  },
  modalLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(193, 253, 114, 0.1)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  modalLocationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalLocationText: {
    fontSize: 16,
    color: colors.background,
    flex: 1,
  },
  modalQuestion: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: colors.accent,
  },
  rejectButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RealTimePickupScreen;