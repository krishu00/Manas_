import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import AppHeader from '../../common/AppHeader';
import AppleHealthKit from 'react-native-health';
import Geolocation from 'react-native-geolocation-service';

const PublicHomeScreen = ({ navigation }) => {
  const [steps, setSteps] = useState(null);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  /*
   * ---------------------------------------------------------
   * TODAY START
   * ---------------------------------------------------------
   */
  const getStartOfDay = () => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date.toISOString();
  };

  /*
   * ---------------------------------------------------------
   * LOAD TODAY'S STEPS
   * ---------------------------------------------------------
   */
  const loadSteps = useCallback(() => {
    const startDate = getStartOfDay();
    const endDate = new Date().toISOString();

    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate,
        endDate,
      },
      (error, results) => {
        if (error) {

          setSteps(null);

          return;
        }

        if (!Array.isArray(results)) {
          setSteps(null);

          return;
        }

        const totalSteps = results.reduce(
          (total, item) => total + Number(item?.value || 0),
          0,
        );

        setSteps(Math.round(totalSteps));

      },
    );
  }, []);

  /*
   * ---------------------------------------------------------
   * INITIALIZE HEALTHKIT FOR HOME
   * ---------------------------------------------------------
   */
  const initializeHealthKit = useCallback(() => {
    AppleHealthKit.initHealthKit(
      {
        permissions: {
          read: [AppleHealthKit.Constants.Permissions.StepCount],
          write: [],
        },
      },
      error => {
        if (error) {

          setSteps(null);

          return;
        }

        loadSteps();
      },
    );
  }, [loadSteps]);

  /*
   * ---------------------------------------------------------
   * WEATHER
   * ---------------------------------------------------------
   */
  const loadWeather = useCallback(() => {
    setWeatherLoading(true);

    Geolocation.requestAuthorization('whenInUse')
      .then(permission => {
        if (permission !== 'granted') {

          setWeatherLoading(false);

          return;
        }

        Geolocation.getCurrentPosition(
          async position => {
            try {
              const { latitude, longitude } = position.coords;

              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
              );

              const data = await response.json();

              setWeather({
                temperature: data?.current?.temperature_2m,
                weatherCode: data?.current?.weather_code,
              });
            } catch (error) {

              setWeather(null);
            } finally {
              setWeatherLoading(false);
            }
          },
          error => {

            setWeatherLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      })
      .catch(error => {

        setWeatherLoading(false);
      });
  }, []);

  /*
   * ---------------------------------------------------------
   * WEATHER TEXT
   * ---------------------------------------------------------
   */
  const getWeatherDescription = weatherCode => {
    if (weatherCode === 0) {
      return 'Clear sky';
    }

    if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
      return 'Partly cloudy';
    }

    if (weatherCode === 45 || weatherCode === 48) {
      return 'Foggy';
    }

    if (weatherCode >= 51 && weatherCode <= 67) {
      return 'Rainy';
    }

    if (weatherCode >= 71 && weatherCode <= 77) {
      return 'Snowy';
    }

    if (weatherCode >= 80 && weatherCode <= 82) {
      return 'Rain showers';
    }

    if (weatherCode >= 95) {
      return 'Thunderstorm';
    }

    return 'Weather';
  };

  /*
   * ---------------------------------------------------------
   * LOAD HOME DATA
   * ---------------------------------------------------------
   */
  useEffect(() => {
    initializeHealthKit();
    loadWeather();
  }, [initializeHealthKit, loadWeather]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Manas</Text>

          <Text style={styles.welcomeSubtitle}>Your workplace companion</Text>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>

          <View style={styles.overviewContainer}>
            {/* WEATHER */}
            <TouchableOpacity
              style={styles.overviewCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Weather')}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardIcon}>☁️</Text>

                <Text style={styles.openText}>View</Text>
              </View>

              <Text style={styles.cardTitle}>Weather</Text>

              {weatherLoading ? (
                <ActivityIndicator size="small" style={styles.cardLoader} />
              ) : weather ? (
                <>
                  <Text style={styles.mainValue}>
                    {Math.round(weather.temperature)}
                    °C
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    {getWeatherDescription(weather.weatherCode)}
                  </Text>
                </>
              ) : (
                <Text style={styles.cardSubtitle}>Weather unavailable</Text>
              )}
            </TouchableOpacity>

            {/* STEPS */}
            <TouchableOpacity
              style={styles.overviewCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Steps')}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardIcon}>👟</Text>

                <Text style={styles.openText}>View</Text>
              </View>

              <Text style={styles.cardTitle}>Steps</Text>

              {steps !== null ? (
                <>
                  <Text style={styles.mainValue}>{steps.toLocaleString()}</Text>

                  <Text style={styles.cardSubtitle}>steps today</Text>
                </>
              ) : (
                <Text style={styles.cardSubtitle}>Activity unavailable</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <View style={styles.quickAccessContainer}>
            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Weather')}
            >
              <Text style={styles.quickCardIcon}>☁️</Text>

              <Text style={styles.quickCardTitle}>Weather</Text>

              <Text style={styles.quickCardSubtitle}>
                Check today's weather
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Steps')}
            >
              <Text style={styles.quickCardIcon}>👟</Text>

              <Text style={styles.quickCardTitle}>Steps</Text>

              <Text style={styles.quickCardSubtitle}>Track your activity</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blog Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Blog')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.blogPlaceholder}>
            <Text style={styles.blogPlaceholderTitle}>Latest blogs</Text>

            <Text style={styles.blogPlaceholderText}>
              Stay updated with the latest workplace news and updates.
            </Text>

            <TouchableOpacity
              style={styles.blogButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Blog')}
            >
              <Text style={styles.blogButtonText}>Explore Blogs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublicHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9f8',
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },

  welcomeSection: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2d2a',
  },

  welcomeSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7471',
  },

  section: {
    marginTop: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#26332f',
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a9689',
  },

  /*
   * TODAY OVERVIEW
   */

  overviewContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  overviewCard: {
    flex: 1,
    minHeight: 175,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardIcon: {
    fontSize: 27,
  },

  openText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6a9689',
  },

  cardTitle: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#26332f',
  },

  mainValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: '#6a9689',
  },

  cardSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: '#7a8581',
  },

  cardLoader: {
    marginTop: 18,
    alignSelf: 'flex-start',
  },

  /*
   * QUICK ACCESS
   */

  quickAccessContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  quickCard: {
    flex: 1,
    minHeight: 125,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebe8',
    justifyContent: 'center',
  },

  quickCardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  quickCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332f',
  },

  quickCardSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: '#7a8581',
  },

  /*
   * BLOG
   */

  blogPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  blogPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332f',
  },

  blogPlaceholderText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#747e7b',
  },

  blogButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#6a9689',
  },

  blogButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
