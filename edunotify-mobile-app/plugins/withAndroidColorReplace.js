const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidColorReplace(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application?.[0];
    
    if (mainApplication) {
      const metaDatas = mainApplication['meta-data'] || [];
      const targetMetaData = metaDatas.find(
        (meta) => meta.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
      );
      
      if (targetMetaData) {
        // Ensure the tools:replace attribute is added
        targetMetaData.$['tools:replace'] = 'android:resource';
      }
    }
    
    return config;
  });
};
