const appConfig = require('./app.json').expo;

module.exports = ({ config }) => {
  const androidMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  return {
    ...config,
    ...appConfig,
    android: {
      ...appConfig.android,
      ...(androidMapsApiKey ? {
        config: {
          ...appConfig.android?.config,
          googleMaps: { apiKey: androidMapsApiKey },
        },
      } : {}),
    },
  };
};
