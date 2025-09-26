import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MMKV } from 'react-native-mmkv';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import logoImage from '../../src/logos/logo-HD.png';
import Popup from '../Popup/Popup';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Keychain from 'react-native-keychain';

const storage = new MMKV();

const LoginScreen = ({ navigation, onLoginSuccess , fcmToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [controller, setController] = useState(null);

  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // ✅ new state

  const showPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  // // 👇 Load saved credentials when component mounts
  // useEffect(() => {
  //   const loadCredentials = async () => {
  //     try {
  //       const credentials = await Keychain.getGenericPassword();
  //       if (credentials) {
  //         setEmail(credentials.username);
  //         setPassword(credentials.password);
  //         setRememberMe(true); // pre-check the box if data exists
  //       }
  //     } catch (err) {
  //       console.log('Keychain error', err);
  //     }
  //   };
  //   loadCredentials();
  // }, []);
  // 👇 Load saved accounts on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmails = JSON.parse(
          storage.getString('savedAccounts') || '[]',
        );

        if (savedEmails.length > 0) {
          // Load the last used account by default
          const lastEmail = savedEmails[savedEmails.length - 1];
          const credentials = await Keychain.getGenericPassword({
            service: `app-${lastEmail}`,
          });

          if (credentials) {
            setEmail(credentials.username);
            setPassword(credentials.password);
            setRememberMe(true);
          }
        }
      } catch (err) {
        console.log('Keychain error', err);
      }
    };
    loadCredentials();
  }, []);
  // const handleLogin = async () => {
  //   const abortController = new AbortController();
  //   setController(abortController);

  //   try {
  //     const response = await apiMiddleware.post(
  //       '/login',
  //       { email: email.trim(), password: password.trim() },
  //       {
  //         headers: { 'Content-Type': 'application/json' },
  //         signal: abortController.signal,
  //       },
  //     );

  //     if (response?.data?.success) {
  //       const { employee, firstTimeLogin } = response.data;
  //       if (firstTimeLogin) {
  //         navigation.replace('FirstTimeLogin');
  //         return;
  //       }

  //       if (employee && employee.employee_id && employee.company_code) {
  //         storage.set('employee_id', employee.employee_id);
  //         storage.set('companyCode', employee.company_code);
  //         storage.set('userToken', employee.employee_id);
  //         storage.set('loginTime', Date.now().toString());

  //         // ✅ Save credentials securely if Remember Me checked
  //         if (rememberMe) {
  //           await Keychain.setGenericPassword(email.trim(), password.trim());
  //         } else {
  //           await Keychain.resetGenericPassword(); // clear if unchecked
  //         }

  //         onLoginSuccess(employee.employee_id);
  //       } else {
  //         showPopup('Login Failed', 'Employee data missing in response.');
  //       }
  //     } else {
  //       showPopup(
  //         'Login Failed',
  //         response?.data?.message || 'Invalid credentials. Please try again.',
  //       );
  //     }
  //   } catch (error) {
  //     if (error.name === 'AbortError') {
  //       console.log('Login request aborted');
  //     } else {
  //       console.error('Login error:', error);
  //       showPopup(
  //         'Error',
  //         error.response?.data?.message ||
  //           'An error occurred during login. Please try again.',
  //       );
  //     }
  //   }
  // };

  const handleLogin = async () => {
    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await apiMiddleware.post(
        '/login',
        {
          email: email.trim(),
          password: password.trim(),
          platform: 'android',
          fcmToken: fcmToken ,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
        },
      );

      if (response?.data?.success) {
        const { employee, firstTimeLogin } = response.data;
        if (firstTimeLogin) {
          navigation.replace('FirstTimeLogin');
          return;
        }

        if (employee && employee.employee_id && employee.company_code) {
          storage.set('employee_id', employee.employee_id);
          storage.set('companyCode', employee.company_code);
          storage.set('userToken', employee.employee_id);
          storage.set('loginTime', Date.now().toString());

          // ✅ Save credentials securely if Remember Me checked
          if (rememberMe) {
            // Save this account in Keychain with unique service name
            await Keychain.setGenericPassword(email.trim(), password.trim(), {
              service: `app-${email.trim()}`,
            });

            // Update the list of saved accounts in MMKV
            let savedEmails = JSON.parse(
              storage.getString('savedAccounts') || '[]',
            );
            if (!savedEmails.includes(email.trim())) {
              savedEmails.push(email.trim());
              storage.set('savedAccounts', JSON.stringify(savedEmails));
            }
          }

          onLoginSuccess(employee.employee_id);
        } else {
          showPopup('Login Failed', 'Employee data missing in response.');
        }
      } else {
        showPopup(
          'Login Failed',
          response?.data?.message || 'Invalid credentials. Please try again.',
        );
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Login request aborted');
      } else {
        console.error('Login error:', error);
        showPopup(
          'Error',
          error.response?.data?.message ||
            'An error occurred during login. Please try again.',
        );
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showPopup(
        'Missing Info',
        'Please enter your email or mobile number first.',
      );
      return;
    }

    try {
      const response = await apiMiddleware.post(
        '/forgot_password',
        { email: email.trim() },
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (response?.data?.success) {
        showPopup(
          'Success',
          'Password reset link has been sent to your email.',
        );
      } else {
        showPopup(
          'Error',
          response?.data?.message || 'Failed to send reset link.',
        );
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showPopup(
        'Error',
        error.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
    }
  };

  useEffect(() => {
    return () => {
      if (controller) controller.abort();
    };
  }, [controller]);

  return (
    <LinearGradient
      colors={['#F3F4F3', '#E5EEE6', '#DEECDD']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <Image source={logoImage} style={styles.logo} />
        <View style={styles.titleContainer}>
          <Text style={styles.subTitleText}>Welcome To Manas</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email or Mobile number"
            style={styles.textInput}
            placeholderTextColor="#AFAFB0"
            value={email}
            onChangeText={text => setEmail(text.trim())}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter Your Password"
            style={styles.textInputWithIcon}
            placeholderTextColor="#AFAFB0"
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

        {/* ✅ Remember Me */}
        <View style={styles.rememberMeContainer}>
          <TouchableOpacity
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.checkbox}
          >
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.rememberMeText}>Remember Me</Text>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Your Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>@powered by M2R Technomations</Text>

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
  container: { flex: 1 },
  content: { flex: 1, padding: 32 },
  logo: {
    width: 250,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleContainer: { alignItems: 'center', marginVertical: 8 },
  subTitleText: { fontSize: 32, fontWeight: '700', color: '#6a9689' },
  inputContainer: { marginVertical: 16 },
  textInput: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#000',
  },
  textInputWithIcon: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#000',
    paddingRight: 45,
  },
  eyeIcon: { position: 'absolute', right: 16, top: 18 },
  forgotPasswordContainer: { alignItems: 'flex-end' },
  forgotPasswordText: { color: '#0066B2', fontWeight: '600' },
  signInButton: {
    padding: 16,
    backgroundColor: '#81BAA5',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 32,
    width: '50%',
    alignSelf: 'center',
  },
  signInButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomText: { textAlign: 'center', marginTop: 'auto', color: '#AFAFB0' },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6a9689',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkmark: { color: '#6a9689', fontWeight: 'bold' },
  rememberMeText: { color: '#333' },
});

export default LoginScreen;
