import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { MMKV } from 'react-native-mmkv';
import Popup from '../Popup/Popup';

const MoreScreen = () => {
  const storage = new MMKV();
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState({ title: '', message: '' });

  const sendTestNotification = async () => {
    console.log('clicked');
    try {
      const loginToken = storage.getString('employee_id'); // ✅ JWT token
      const fcmToken = storage.getString('fcmToken'); // (optional for debug)

      console.log('fcm token', fcmToken);
      console.log('loginToken from storage', loginToken);

      const res = await axios.post(
        'http://192.168.17.102:5050/api/notifications/send-user',
        {
          title: 'Hi Krishna 👋',
          body: 'FCM setup is working!',
        },
        {
          headers: {
            Authorization: `Bearer ${loginToken}`, // ✅ must be JWT
          },
        },
      );

      console.log('Notification Response:', res.data);

      // ✅ Show success popup
      setPopupData({
        title: 'Success',
        message: 'Notification sent successfully!',
      });
      setPopupVisible(true);
    } catch (err) {
      console.error('Notification error:', err.response?.data || err.message);

      // ❌ Show error popup
      setPopupData({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to send notification.',
      });
      setPopupVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>More</Text>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={sendTestNotification}
      >
        <Text style={styles.signInButtonText}>Send Test Notification</Text>
      </TouchableOpacity>

      <Text style={styles.paragraph}>
        Explore more options and settings here. Customize your experience,
        access additional features, and learn more about how you can make the
        most of the app.
      </Text>

      <Icon name="delete" size={50} />
      <Text>jnasjd</Text>

      {/* ✅ Popup Integration */}
      {popupVisible && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupVisible(false)}
          autoClose={true}
        />
      )}
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paragraph: { fontSize: 16, textAlign: 'center', color: '#666' },
});
