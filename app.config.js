/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const base = require('./app.json').expo;
  const projectId =
    typeof process.env.EXPO_PUBLIC_EAS_PROJECT_ID === 'string'
      ? process.env.EXPO_PUBLIC_EAS_PROJECT_ID.trim()
      : '';

  return {
    ...base,
    ...config,
    extra: {
      ...(base.extra ?? {}),
      ...(config.extra ?? {}),
      ...(projectId
        ? {
            eas: {
              ...(base.extra?.eas ?? {}),
              ...(config.extra?.eas ?? {}),
              projectId,
            },
          }
        : {}),
    },
  };
};
