import { Share, Platform } from 'react-native';
import { Alert } from './alerts';

export async function shareMessage(title, message) {
  if (Platform.OS === 'web') {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: message });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(message);
      Alert.alert('Copied to clipboard', 'The share message is ready to paste.');
    } catch {
      window.prompt('Copy this message to share it:', message);
    }
    return;
  }

  try {
    await Share.share({ title, message });
  } catch (error) {
    Alert.alert('Unable to share', error?.message || 'Your device could not open the share menu.');
  }
}
