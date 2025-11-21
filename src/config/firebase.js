import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Inicializar Auth con persistencia según la plataforma
export const auth = Platform.OS === 'web'
  ? require('firebase/auth').getAuth(app)
  : initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

// Obtener servicio de Database
export const database = getDatabase(app);

export default app;
