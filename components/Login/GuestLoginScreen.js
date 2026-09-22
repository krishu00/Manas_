import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import logoImage from '../../src/logos/logo-HD.png';
import Popup from '../Popup/Popup';

const GuestLoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const showPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const handleCreateGuest = async () => {
    if (!name.trim()) {
      showPopup('Missing Information', 'Please enter your name.');
      return;
    }

    if (!email.trim()) {
      showPopup('Missing Information', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      showPopup('Missing Information', 'Please enter a password.');
      return;
    }

    if (password.trim().length < 6) {
      showPopup('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      const response = await apiMiddleware.post(
        '/guest/create',
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response?.data?.success) {
        showPopup(
          'Account Created',
          'Guest account created successfully. You can now sign in as a guest.',
        );

        setName('');
        setEmail('');
        setPassword('');
      } else {
        showPopup(
          'Registration Failed',
          response?.data?.message || 'Unable to create guest account.',
        );
      }
    } catch (error) {
      console.error('Guest registration error:', error);

      showPopup(
        'Registration Failed',
        error?.response?.data?.message ||
          'Something went wrong while creating the guest account.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F3F4F3', '#E5EEE6', '#DEECDD']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <TouchableOpacity
              accessibilityLabel="Go back to login"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{
              top: 10, bottom: 10, left: 10, right: 10 
              }}
            >
              <FontAwesome name="arrow-left" size={22} color="#6a9689" />
            </TouchableOpacity>

            {/* Logo */}
            <Image source={logoImage} style={styles.logo} />

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Create Guest Account</Text>

              <Text style={styles.subtitle}>
                Create an account to access Manas
              </Text>
            </View>

            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>

              <View style={styles.inputWrapper}>
                <FontAwesome
                  name="user"
                  size={18}
                  color="#6a9689"
                  style={styles.inputIcon}
                />

                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#AFAFB0"
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>

              <View style={styles.inputWrapper}>
                <FontAwesome
                  name="envelope"
                  size={16}
                  color="#6a9689"
                  style={styles.inputIcon}
                />

                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#AFAFB0"
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>

              <View style={styles.inputWrapper}>
                <FontAwesome
                  name="lock"
                  size={19}
                  color="#6a9689"
                  style={styles.inputIcon}
                />

                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#AFAFB0"
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={loading}
                >
                  <FontAwesome
                    name={showPassword ? 'eye' : 'eye-slash'}
                    size={19}
                    color="#6a9689"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create button */}
            <TouchableOpacity
              style={[styles.createButton, loading && styles.disabledButton]}
              activeOpacity={0.8}
              onPress={handleCreateGuest}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Creating Account...' : 'Create Guest Account'}
              </Text>
            </TouchableOpacity>

            {/* Existing login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.loginLink}> Login</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bottomText}>@powered by M2R Technomations</Text>
          </ScrollView>
        </KeyboardAvoidingView>

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

export default GuestLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },

  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,

    width: 50,
    height: 50,

    borderRadius: 25,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(129, 186, 165, 0.15)',
  },

  logo: {
    width: 250,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 8,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6a9689',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#6b7471',
    textAlign: 'center',
  },

  inputContainer: {
    marginVertical: 10,
    marginHorizontal: 14,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: '600',
    color: '#34433e',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#fff',

    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(106, 150, 137, 0.12)',

    minHeight: 54,
  },

  inputIcon: {
    marginLeft: 15,
    width: 24,
    textAlign: 'center',
  },

  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,

    color: '#000',
    fontSize: 15,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingRight: 45,

    color: '#000',
    fontSize: 15,
  },

  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 5,
  },

  createButton: {
    padding: 16,

    backgroundColor: '#81BAA5',

    borderRadius: 8,

    alignItems: 'center',

    marginTop: 24,
    marginBottom: 14,

    width: '70%',
    alignSelf: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 8,
  },

  loginText: {
    color: '#6b7471',
    fontSize: 13,
  },

  loginLink: {
    color: '#4f766b',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  bottomText: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 24,
    color: '#AFAFB0',
  },
});
