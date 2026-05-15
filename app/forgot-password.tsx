import { useLayoutEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

/** Récupération mot de passe désactivée — renvoie vers la connexion. */
export default function ForgotPasswordScreen() {
  useLayoutEffect(() => {
    router.replace('/login');
  }, []);
  return <View />;
}
