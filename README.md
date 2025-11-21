# 🚗 ZarPool - Aplicación de Carpooling

ZarPool es una aplicación móvil de carpooling desarrollada con React Native y Expo, que permite a los usuarios compartir viajes de manera eficiente y económica en tiempo real con Firebase.

## 📱 Características Principales

### 1. **Autenticación de Usuarios (Firebase Auth)**
- Registro seguro con email y contraseña
- Inicio de sesión
- Gestión de perfil de usuario
- Persistencia de sesión

### 2. **Búsqueda de Conductores en Tiempo Real**
- Búsqueda de viajes por origen y destino
- Actualización en tiempo real con Firebase Realtime Database
- Información detallada de cada viaje (precio, conductor, vehículo)
- Sistema de reservas

### 3. **Configuración de Viajes**
- Crear viajes como conductor
- Especificar origen, destino y precio
- Configurar plazas disponibles
- Establecer preferencias (fumadores, mascotas, paradas, etc.)
- Información del vehículo

### 4. **Recogida en Tiempo Real**
- Seguimiento de recogidas con Firebase listeners
- Pop-ups de alerta para recogidas
- Aceptar/rechazar pasajeros en tiempo real
- Seguimiento de estado de recogidas

### 5. **Perfil de Usuario**
- Estadísticas personales desde Firebase
- Calificación y reputación
- Preferencias de viaje
- Historial

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con separación clara de responsabilidades:

```
ZarPool/
├── src/
│   ├── presentation/        # Capa de Presentación
│   │   ├── screens/         # Pantallas de la app
│   │   ├── navigation/      # Configuración de navegación
│   │   ├── context/         # Context API (Estado global)
│   │   └── styles/          # Estilos y colores
│   │
│   ├── domain/              # Capa de Dominio
│   │   └── entities/        # Entidades del negocio
│   │
│   ├── data/                # Capa de Datos
│   │   ├── repositories/    # Repositorios (acceso a datos)
│   │   └── services/        # Servicios (Firebase Auth)
│   │
│   └── config/              # Configuración
│       └── firebase.js      # Firebase setup
│
└── firebase.rules.json      # Reglas de seguridad Firebase
```

## 🎨 Paleta de Colores

```javascript
{
  primary: '#f3f6ee',    // Fondo principal
  secondary: '#d1df27',  // Elementos secundarios
  accent: '#c1fd72',     // Botones y acentos
  text: '#b4b7c2',       // Texto secundario
  background: '#505443'  // Texto principal
}
```

## 🔧 Tecnologías Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación (Stack + Bottom Tabs)
- **Context API** - Gestión de estado global
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Realtime Database** - Base de datos en tiempo real
- **Netlify** - Despliegue web

## 📦 Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase
- Cuenta de Netlify (para deployment web)

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ZarPool
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita **Authentication** (Email/Password)
   - Habilita **Realtime Database**
   - Copia las credenciales de tu proyecto
   - Crea un archivo `.env` basado en `.env.example`
   - Actualiza las credenciales en `src/config/firebase.js` si es necesario

4. **Configurar reglas de seguridad de Firebase**
   - En Firebase Console, ve a Realtime Database > Rules
   - Copia el contenido de `firebase.rules.json`
   - Publica las reglas

5. **Iniciar el proyecto**
```bash
npm start
# o
npx expo start
```

6. **Ejecutar en dispositivo**
   - Escanear el código QR con Expo Go (iOS/Android)
   - Presionar `a` para Android emulator
   - Presionar `i` para iOS simulator

## 🔐 Seguridad Firebase

El proyecto incluye reglas de seguridad implementadas en `firebase.rules.json`:

- **Autenticación requerida**: Todos los usuarios deben estar autenticados
- **Usuarios**: Solo pueden editar su propio perfil
- **Viajes**: Solo el conductor puede modificar su viaje
- **Recogidas**: Solo pasajeros y conductores involucrados tienen acceso
- **Validaciones**: Datos requeridos para cada colección

## 🚀 Despliegue en Netlify

### Build para Web

```bash
# Generar build de producción
npx expo export:web
```

### Desplegar en Netlify

1. **Opción 1: Netlify CLI**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

2. **Opción 2: Git Integration**
   - Conecta tu repositorio de GitHub a Netlify
   - Netlify detectará automáticamente `netlify.toml`
   - Build command: `npx expo export:web`
   - Publish directory: `dist`

3. **Variables de entorno en Netlify**
   - Ve a Site settings > Build & deploy > Environment
   - Añade todas las variables de Firebase de tu `.env`

## 📱 Pantallas

### 1. Login/Register Screen
- Autenticación con Firebase
- Registro de nuevos usuarios
- Validaciones de formulario
- Diseño mobile-first

### 2. Search Drivers (Tab: Search)
- Búsqueda de viajes en tiempo real
- Lista actualizada automáticamente con Firebase listeners
- Información detallada (precio, conductor, vehículo)
- Sistema de reservas

### 3. Configure Trip
- Formulario completo de creación de viaje
- Configuración de preferencias
- Información del vehículo
- Validaciones

### 4. Real Time Pickup (Tab: Pickup)
- Recogidas en tiempo real con Firebase
- Pop-ups de alerta
- Aceptar/rechazar recogidas
- Estado actualizado automáticamente

### 5. Profile (Tab: Profile)
- Información del usuario desde Firebase
- Estadísticas en tiempo real
- Preferencias
- Cerrar sesión

## 🎯 Características Implementadas

- ✅ Firebase Authentication (registro e inicio de sesión)
- ✅ Firebase Realtime Database
- ✅ Listeners en tiempo real para trips y pickups
- ✅ Reglas de seguridad Firebase
- ✅ CRUD completo de viajes
- ✅ Sistema de recogidas en tiempo real
- ✅ Perfil de usuario con estadísticas
- ✅ Diseño mobile-first
- ✅ Configuración Netlify para deployment

## 🔜 Próximas Funcionalidades

- [ ] Sistema de calificaciones y reseñas
- [ ] Notificaciones push reales
- [ ] Búsqueda avanzada con geocoding
- [ ] Historial de viajes
- [ ] Chat en tiempo real
- [ ] Pagos integrados
- [ ] Verificación de identidad
- [ ] Mapas reales con Google Maps
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

## 📝 Scripts Disponibles

```bash
# Iniciar desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web

# Build para producción web
npx expo export:web
```

## 🧪 Usuarios de Prueba

Una vez que hayas configurado Firebase, debes registrar usuarios a través de la app:

1. Abre la app
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Completa el formulario de registro
4. Inicia sesión

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es un MVP para portafolio.

## 👥 Autores

- **Equipo ZarPool** - Desarrollo

## 🙏 Agradecimientos

- React Native Community
- Expo Team
- Firebase Documentation
- Netlify
- Todos los contribuidores

---

**MVP completamente funcional con Firebase Realtime Database y Firebase Authentication.** 🚀