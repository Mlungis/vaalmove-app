import { Alert as NativeAlert, Platform } from 'react-native';

function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    NativeAlert.alert(title, message, buttons);
    return;
  }

  const text = [title, message].filter(Boolean).join('\n\n');
  if (!buttons?.length) {
    window.alert(text);
    return;
  }

  if (buttons.length === 1) {
    window.alert(text);
    buttons[0].onPress?.();
    return;
  }

  if (buttons.length === 2) {
    const cancel = buttons.find((button) => button.style === 'cancel');
    const action = buttons.find((button) => button !== cancel) || buttons[0];
    if (window.confirm(`${text}\n\n${action.text || 'Continue'}?`)) {
      action.onPress?.();
    } else {
      cancel?.onPress?.();
    }
    return;
  }

  const options = buttons.map((button, index) => `${index + 1}. ${button.text || 'Continue'}`).join('\n');
  const selected = window.prompt(`${text}\n\n${options}\n\nEnter an option number:`);
  const index = Number(selected) - 1;
  if (Number.isInteger(index) && index >= 0 && index < buttons.length) {
    buttons[index].onPress?.();
  }
}

export const Alert = { alert: showAlert };
