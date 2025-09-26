import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // 👈 Import eye icon
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Popup from '../Popup/Popup';

const FirstTimeLogin = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 For toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const showPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      showPopup('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiMiddleware.post('/first_time_password', {
        password : password.trim(),
        confirmPassword : confirmPassword.trim(),
      });
      console.log('response', response);

      if (response?.status === 200) {
        showPopup('Success', 'Password changed successfully.');
        navigation.replace('Login'); // go back to login
      } else {
        showPopup(
          'Error',
          response?.data?.message || 'Failed to change password.',
        );
      }
    } catch (error) {
      console.error('First time login error:', error);
      showPopup(
        'Error',
        error.response?.data?.message || 'Something went wrong. Try again.',
      );
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#F3F4F3', '#E5EEE6', '#DEECDD']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <Text style={styles.heading}>Change Your Password</Text>
        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter your new password"
              style={styles.textInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={text => setPassword(text.trim())}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showPassword ? 'eye' : 'eye-slash'}
                size={20}
                color="#6a9689"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Re-enter your new password"
              style={styles.textInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={text=> setConfirmPassword(text.trim())}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showConfirmPassword ? 'eye' : 'eye-slash'}
                size={20}
                color="#6a9689"
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Changing...' : 'Submit'}
          </Text>
        </TouchableOpacity>
        {popupVisible && (
          <Popup
            title={popupTitle}
            message={popupMessage}
            onClose={() => setPopupVisible(false)}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#6a9689',
  },
  inputContainer: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333c8',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingRight: 12,
  },
  textInput: {
    flex: 1,
    padding: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 8,
  },
  submitButton: {
    padding: 16,
    backgroundColor: '#81BAA5',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    width: '50%',
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FirstTimeLogin;
