import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBLxntOCRgD6NwW9iboSIRO5LRQEPZpwVk",
  authDomain: "zarpool-a7713.firebaseapp.com",
  projectId: "zarpool-a7713",
  storageBucket: "zarpool-a7713.firebasestorage.app",
  messagingSenderId: "511669042690",
  appId: "1:511669042690:web:e83706acb0bb364b8c711b",
  measurementId: "G-QDB80G6488",
  databaseURL: "https://zarpool-a7713-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con detección automática de entorno
let auth;
try {
  // Intentar configuración para React Native (mobile)
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth configurado para React Native con AsyncStorage');
} catch (error) {
  // Fallback para Web
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
  console.log('✅ Firebase Auth configurado para Web');
}

export { auth };

// Obtener servicio de Database
export const database = getDatabase(app);

export default app;
