import { StatusBar, StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';

const FeedsScreen = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log('Location:', position);
        },
        (error) => {
          console.log('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* <Text style={styles.heading}>Feeds</Text>
      <Text style={styles.paragraph}>
        Welcome to the Feeds section! Here, you'll find the latest updates, articles, and news personalized just for you.
        Stay informed with real-time content and explore trending topics.
      </Text> */}

      {/* Display location if available */}
      {location && (
        <Text style={styles.paragraph}>
          Current Location: Latitude {location.coords.latitude}, Longitude {location.coords.longitude}
        </Text>
      )}
    </View>
  );
};

export default FeedsScreen;

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
    color: 'yellow',
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
