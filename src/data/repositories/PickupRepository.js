import { ref, get, set, update, push, remove, onValue, off } from 'firebase/database';
import { database } from '../../config/firebase';

class PickupRepository {
  /**
   * Crea una nueva solicitud de recogida
   */
  async createPickup(tripId, passengerId, passengerName, location) {
    try {
      const pickupRef = push(ref(database, 'pickups'));
      const pickupId = pickupRef.key;

      const pickup = {
        tripId,
        passengerId,
        passengerName,
        location,
        status: 'pending',
        estimatedTime: null,
        actualTime: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(pickupRef, pickup);

      return {
        id: pickupId,
        ...pickup
      };
    } catch (error) {
      console.error('Error creating pickup:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las recogidas de un viaje
   */
  async getPickupsByTrip(tripId) {
    try {
      const pickupsRef = ref(database, 'pickups');
      const snapshot = await get(pickupsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const pickups = [];
      snapshot.forEach((childSnapshot) => {
        const pickup = childSnapshot.val();
        if (pickup.tripId === tripId) {
          pickups.push({
            id: childSnapshot.key,
            ...pickup
          });
        }
      });

      return pickups;
    } catch (error) {
      console.error('Error getting pickups:', error);
      throw error;
    }
  }

  /**
   * Obtiene una recogida por ID
   */
  async getPickupById(pickupId) {
    try {
      const pickupRef = ref(database, `pickups/${pickupId}`);
      const snapshot = await get(pickupRef);

      if (snapshot.exists()) {
        return {
          id: pickupId,
          ...snapshot.val()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting pickup:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una recogida
   */
  async updatePickupStatus(pickupId, status, actualTime = null) {
    try {
      const updates = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (actualTime) {
        updates.actualTime = actualTime;
      }

      const pickupRef = ref(database, `pickups/${pickupId}`);
      await update(pickupRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating pickup status:', error);
      throw error;
    }
  }

  /**
   * Actualiza una recogida
   */
  async updatePickup(pickupId, updates) {
    try {
      const pickupRef = ref(database, `pickups/${pickupId}`);
      await update(pickupRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating pickup:', error);
      throw error;
    }
  }

  /**
   * Elimina una recogida
   */
  async deletePickup(pickupId) {
    try {
      const pickupRef = ref(database, `pickups/${pickupId}`);
      await remove(pickupRef);
      return true;
    } catch (error) {
      console.error('Error deleting pickup:', error);
      throw error;
    }
  }

  /**
   * Listener en tiempo real para recogidas de un viaje
   */
  onPickupsChange(tripId, callback) {
    const pickupsRef = ref(database, 'pickups');

    const listener = onValue(pickupsRef, (snapshot) => {
      const pickups = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const pickup = childSnapshot.val();
          if (pickup.tripId === tripId) {
            pickups.push({
              id: childSnapshot.key,
              ...pickup
            });
          }
        });
      }
      callback(pickups);
    });

    return () => off(pickupsRef, 'value', listener);
  }

  /**
   * Listener en tiempo real para una recogida específica
   */
  onPickupChange(pickupId, callback) {
    const pickupRef = ref(database, `pickups/${pickupId}`);

    const listener = onValue(pickupRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: pickupId,
          ...snapshot.val()
        });
      } else {
        callback(null);
      }
    });

    return () => off(pickupRef, 'value', listener);
  }

  /**
   * Obtiene todas las recogidas pendientes para un conductor
   */
  async getPendingPickupsForDriver(driverTrips) {
    try {
      const allPickups = [];

      for (const tripId of driverTrips) {
        const pickups = await this.getPickupsByTrip(tripId);
        const pending = pickups.filter(p => p.status === 'pending' || p.status === 'waiting');
        allPickups.push(...pending);
      }

      return allPickups;
    } catch (error) {
      console.error('Error getting pending pickups:', error);
      throw error;
    }
  }
}

export default PickupRepository;