import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabase';

// Must match your app.json version field
const CURRENT_VERSION = '1.2.0';

function parseVersion(v: string) {
  return v.split('.').map(Number);
}

function isOutdated(current: string, minimum: string) {
  const c = parseVersion(current);
  const m = parseVersion(minimum);
  for (let i = 0; i < 3; i++) {
    if ((c[i] ?? 0) < (m[i] ?? 0)) return true;
    if ((c[i] ?? 0) > (m[i] ?? 0)) return false;
  }
  return false;
}

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('key, value');

      if (error || !data) return;

      const config: Record<string, string> = {};
      data.forEach(row => { config[row.key] = row.value; });

      const minVersion = config['min_version'] ?? '1.0.0';
      const latestVersion = config['latest_version'] ?? '1.0.0';
      const apkUrl = config['apk_download_url'] ?? '';

      setDownloadUrl(apkUrl);

      if (isOutdated(CURRENT_VERSION, minVersion)) {
        // Must update — show blocking alert
        setForceUpdate(true);
        showForceUpdateAlert(apkUrl);
      } else if (isOutdated(CURRENT_VERSION, latestVersion)) {
        // Optional update available
        setUpdateAvailable(true);
        showOptionalUpdateAlert(apkUrl);
      }
    } catch (e) {
      // Fail silently — don't block the app
    }
  };

  const showForceUpdateAlert = (url: string) => {
    Alert.alert(
      'Update required',
      'A required update is available. Please update MockTrack to continue.',
      [{ text: 'Update now', onPress: () => Linking.openURL(url) }],
      { cancelable: false }
    );
  };

  const showOptionalUpdateAlert = (url: string) => {
    Alert.alert(
      'Update available',
      'A new version of MockTrack is available. Update for the latest features.',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Update', onPress: () => Linking.openURL(url) },
      ]
    );
  };

  return { updateAvailable, forceUpdate, downloadUrl };
}
