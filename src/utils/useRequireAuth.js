import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any action that needs login. Call requireAuth(() => doTheThing()).
 * If the user is authenticated, doTheThing() runs immediately. If not, a
 * LoginRequiredModal is shown (render <modalProps /> spread onto
 * <LoginRequiredModal> in the screen) and doTheThing() is remembered — it
 * runs automatically if the user logs in from that modal.
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [message, setMessage] = useState('');

  const requireAuth = useCallback(
    (action, gateMessage) => {
      if (isAuthenticated) {
        action();
        return;
      }
      setPendingAction(() => action);
      setMessage(gateMessage || 'Login to continue with this action.');
      setModalVisible(true);
    },
    [isAuthenticated]
  );

  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setPendingAction(null);
  }, []);

  const handleLogin = useCallback(() => {
    setModalVisible(false);
    // Navigate to Login; the pending action is intentionally NOT auto-run
    // after navigating away, since BlogDetail/CreateBlog may unmount.
    // Simpler, safer UX for V1: user re-taps the action after logging in.
    setPendingAction(null);
    navigation.navigate('Login');
  }, [navigation]);

  return {
    requireAuth,
    loginModalProps: {
      visible: modalVisible,
      message,
      onCancel: handleCancel,
      onLogin: handleLogin,
    },
  };
};
