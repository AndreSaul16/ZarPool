import { ref, get } from 'firebase/database';
import { database } from '../../config/firebase';
import User from '../../domain/entities/User';

class UserRepository {
  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id) {
    try {
      const userData = await get(ref(database, `users/${id}`));

      if (userData.exists()) {
        const data = userData.val();
        return new User(
          id,
          data.email,
          '', // No devolvemos el password
          data.name,
          data.phone
        );
      }

      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas de un usuario
   */
  async getUserStats(userId) {
    try {
      const userData = await get(ref(database, `users/${userId}`));

      if (userData.exists()) {
        const data = userData.val();
        return {
          rating: data.rating || 0,
          totalTrips: data.totalTrips || 0,
          stats: data.stats || {
            asDriver: 0,
            asPassenger: 0,
            punctuality: 100
          },
          preferences: data.preferences || {
            smokingAllowed: false,
            petsAllowed: true,
            musicAllowed: true
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil completo de un usuario
   */
  async getUserProfile(userId) {
    try {
      const userData = await get(ref(database, `users/${userId}`));

      if (userData.exists()) {
        return {
          id: userId,
          ...userData.val()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

export default UserRepository;