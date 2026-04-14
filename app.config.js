module.exports = {
  expo: {
    name: 'MockTrack',
    slug: 'mocktrack',
    version: '1.2.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#185FA5',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#185FA5',
      },
      package: 'com.garammasala.mocktrack',
    },
    extra: {
      supabaseUrl: 'https://rcuwlnxslwkmrqbeznvb.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjdXdsbnhzbHdrbXJxYmV6bnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzUyOTEsImV4cCI6MjA5MDg1MTI5MX0.Ar_g_sC-KCuEdOifvdSi3cfi-O4BGW7_f_pBVK3iWIA',
    },
  },
};