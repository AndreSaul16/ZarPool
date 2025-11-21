import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import UserRepository from '../../data/repositories/UserRepository';
import colors from '../styles/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRepository = new UserRepository();

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const stats = await userRepository.getUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.phone}>📱 {user?.phone}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.totalTrips || 0}</Text>
          <Text style={styles.statLabel}>Viajes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>⭐ Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats?.stats?.punctuality || 100}%</Text>
          <Text style={styles.statLabel}>Puntualidad</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Como conductor:</Text>
          <Text style={styles.detailValue}>{userStats?.stats?.asDriver || 0} viajes</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Como pasajero:</Text>
          <Text style={styles.detailValue}>{userStats?.stats?.asPassenger || 0} viajes</Text>
        </View>
      </View>

      <View style={styles.preferencesContainer}>
        <Text style={styles.sectionTitle}>🎯 Preferencias</Text>
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>
            {userStats?.preferences?.smokingAllowed ? '✅' : '❌'} Fumar
          </Text>
          <Text style={styles.preferenceLabel}>
            {userStats?.preferences?.petsAllowed ? '✅' : '❌'} Mascotas
          </Text>
          <Text style={styles.preferenceLabel}>
            {userStats?.preferences?.musicAllowed ? '✅' : '❌'} Música
          </Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📋 Mis Viajes</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>💳 Pagos</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>⚙️ Configuración</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>❓ Ayuda</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.background,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.text,
  },
  detailValue: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
  preferencesContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  preferenceLabel: {
    fontSize: 14,
    color: colors.background,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuText: {
    fontSize: 18,
    color: colors.background,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.secondary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;