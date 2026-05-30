import * as Device from 'expo-device';
import { Platform } from 'react-native';

/** Libellé affiché côté admin / transfert d’appareil (nom + type). */
export async function getDeviceLabel(): Promise<string> {
  const brand = Device.brand?.trim() || '';
  const model = Device.modelName?.trim() || Device.deviceName?.trim() || '';
  const os = Device.osName?.trim() || Platform.OS;
  const osVer = Device.osVersion?.trim();

  let name = '';
  if (model && brand && !model.toLowerCase().includes(brand.toLowerCase())) {
    name = `${brand} ${model}`;
  } else if (model) {
    name = model;
  } else if (brand) {
    name = brand;
  } else {
    name = Platform.OS === 'ios' ? 'iPhone / iPad' : Platform.OS === 'android' ? 'Téléphone Android' : 'Appareil';
  }

  const type =
    Device.deviceType === Device.DeviceType.TABLET
      ? 'Tablette'
      : Device.deviceType === Device.DeviceType.DESKTOP
        ? 'Ordinateur'
        : Platform.OS === 'ios'
          ? 'iOS'
          : Platform.OS === 'android'
            ? 'Android'
            : 'Mobile';

  const osPart = osVer ? `${os} ${osVer}` : os;
  // Séparateur ASCII (le « · » provoquait des erreurs SQL device_label en latin1).
  return `${name} - ${type} (${osPart})`.slice(0, 128);
}
