import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from '../../config/firebase';

class AuthService {
    /**
     * Registra un nuevo usuario con Firebase Auth
     * y crea su perfil en Realtime Database
     */
    async register(email, password, name, phone) {
        try {
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Actualizar displayName
            await updateProfile(user, { displayName: name });

            // Crear perfil completo en Realtime Database
            const userProfile = {
                email,
                name,
                phone,
                rating: 0,
                totalTrips: 0,
                createdAt: new Date().toISOString(),
                profileImage: null,
                preferences: {
                    smokingAllowed: false,
                    petsAllowed: true,
                    musicAllowed: true
                },
                stats: {
                    asDriver: 0,
                    asPassenger: 0,
                    punctuality: 100
                }
            };

            // Guardar en Realtime Database
            await set(ref(database, `users/${user.uid}`), userProfile);

            return {
                id: user.uid,
                email: user.email,
                name,
                phone
            };
        } catch (error) {
            console.error('Error in register:', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Inicia sesión con email y password
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Obtener datos del perfil desde Realtime Database
            const userRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                return {
                    id: user.uid,
                    email: user.email,
                    name: userData.name,
                    phone: userData.phone,
                    ...userData
                };
            }

            return {
                id: user.uid,
                email: user.email,
                name: user.displayName || '',
                phone: ''
            };
        } catch (error) {
            console.error('Error in login:', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Cierra sesión
     */
    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return auth.currentUser;
    }

    /**
     * Listener para cambios en el estado de autenticación
     */
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuario autenticado, obtener datos completos
                const userRef = ref(database, `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    callback({
                        id: user.uid,
                        email: user.email,
                        ...userData
                    });
                } else {
                    callback({
                        id: user.uid,
                        email: user.email,
                        name: user.displayName || '',
                        phone: ''
                    });
                }
            } else {
                // Usuario no autenticado
                callback(null);
            }
        });
    }

    /**
     * Actualiza el perfil del usuario
     */
    async updateUserProfile(userId, updates) {
        try {
            const userRef = ref(database, `users/${userId}`);
            await update(userRef, updates);
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Maneja errores de Firebase Auth
     */
    handleAuthError(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return new Error('Este email ya está registrado');
            case 'auth/invalid-email':
                return new Error('Email inválido');
            case 'auth/weak-password':
                return new Error('La contraseña debe tener al menos 6 caracteres');
            case 'auth/user-not-found':
                return new Error('Usuario no encontrado');
            case 'auth/wrong-password':
                return new Error('Contraseña incorrecta');
            case 'auth/invalid-credential':
                return new Error('Credenciales inválidas');
            default:
                return error;
        }
    }
}

export default new AuthService();
