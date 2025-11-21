import { ref, get, set, update, push, remove, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { database } from '../../config/firebase';
import Trip from '../../domain/entities/Trip';

class TripRepository {
  /**
   * Crea un nuevo viaje en Firebase
   */
  async createTrip(driverId, tripData) {
    try {
      const tripRef = push(ref(database, 'trips'));
      const tripId = tripRef.key;

      const newTrip = {
        driverId,
        status: 'scheduled',
        origin: tripData.origin,
        destination: tripData.destination,
        departureTime: tripData.departureTime,
        estimatedArrival: tripData.estimatedArrival,
        availableSeats: tripData.availableSeats,
        totalSeats: tripData.totalSeats,
        price: tripData.price,
        stops: tripData.stops || false,
        smokingAllowed: tripData.smokingAllowed || false,
        preferences: tripData.preferences || {
          petsAllowed: true,
          musicAllowed: true,
          conversationLevel: 'medium'
        },
        car: tripData.car,
        passengers: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(tripRef, newTrip);

      return {
        id: tripId,
        ...newTrip
      };
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los viajes disponibles
   */
  async getAllTrips() {
    try {
      const tripsRef = ref(database, 'trips');
      const snapshot = await get(tripsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const trips = [];
      snapshot.forEach((childSnapshot) => {
        trips.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      return trips;
    } catch (error) {
      console.error('Error getting trips:', error);
      throw error;
    }
  }

  /**
   * Obtiene un viaje por ID
   */
  async getTripById(tripId) {
    try {
      const tripRef = ref(database, `trips/${tripId}`);
      const snapshot = await get(tripRef);

      if (snapshot.exists()) {
        return {
          id: tripId,
          ...snapshot.val()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting trip:', error);
      throw error;
    }
  }

  /**
   * Busca viajes por origen y destino
   */
  async searchTrips(originLat, originLng, destinationLat, destinationLng, maxDistance = 0.5) {
    try {
      const trips = await this.getAllTrips();

      // Filtrar viajes por proximidad
      const filteredTrips = trips.filter(trip => {
        const originDistance = this.calculateDistance(
          originLat,
          originLng,
          trip.origin.latitude,
          trip.origin.longitude
        );

        const destDistance = this.calculateDistance(
          destinationLat,
          destinationLng,
          trip.destination.latitude,
          trip.destination.longitude
        );

        return originDistance <= maxDistance && destDistance <= maxDistance;
      });

      return filteredTrips;
    } catch (error) {
      console.error('Error searching trips:', error);
      throw error;
    }
  }

  /**
   * Actualiza un viaje
   */
  async updateTrip(tripId, updates) {
    try {
      const tripRef = ref(database, `trips/${tripId}`);
      await update(tripRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  /**
   * Agrega un pasajero a un viaje
   */
  async addPassenger(tripId, passengerId, pickupLocation, seatsReserved = 1) {
    try {
      const trip = await this.getTripById(tripId);

      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      if (trip.availableSeats < seatsReserved) {
        throw new Error('No hay suficientes asientos disponibles');
      }

      const passengerRef = ref(database, `trips/${tripId}/passengers/${passengerId}`);
      await set(passengerRef, {
        userId: passengerId,
        status: 'confirmed',
        pickupLocation,
        seatsReserved,
        joinedAt: new Date().toISOString()
      });

      // Actualizar asientos disponibles
      await this.updateTrip(tripId, {
        availableSeats: trip.availableSeats - seatsReserved
      });

      return true;
    } catch (error) {
      console.error('Error adding passenger:', error);
      throw error;
    }
  }

  /**
   * Elimina un viaje
   */
  async deleteTrip(tripId) {
    try {
      const tripRef = ref(database, `trips/${tripId}`);
      await remove(tripRef);
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  /**
   * Listener en tiempo real para todos los viajes
   */
  onTripsChange(callback) {
    const tripsRef = ref(database, 'trips');

    const listener = onValue(tripsRef, (snapshot) => {
      const trips = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          trips.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      callback(trips);
    });

    return () => off(tripsRef, 'value', listener);
  }

  /**
   * Listener en tiempo real para un viaje específico
   */
  onTripChange(tripId, callback) {
    const tripRef = ref(database, `trips/${tripId}`);

    const listener = onValue(tripRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: tripId,
          ...snapshot.val()
        });
      } else {
        callback(null);
      }
    });

    return () => off(tripRef, 'value', listener);
  }

  /**
   * Calcula la distancia entre dos coordenadas (en km)
   * Fórmula de Haversine
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

export default TripRepository;