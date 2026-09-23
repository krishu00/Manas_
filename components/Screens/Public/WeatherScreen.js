import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import AppHeader from '../../common/AppHeader';
import Geolocation from 'react-native-geolocation-service';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const getWeatherInfo = code => {
  const weatherMap = {
    0: { icon: '☀️', condition: 'Clear sky' },
    1: { icon: '🌤️', condition: 'Mainly clear' },
    2: { icon: '⛅', condition: 'Partly cloudy' },
    3: { icon: '☁️', condition: 'Overcast' },

    45: { icon: '🌫️', condition: 'Fog' },
    48: { icon: '🌫️', condition: 'Depositing rime fog' },

    51: { icon: '🌦️', condition: 'Light drizzle' },
    53: { icon: '🌦️', condition: 'Moderate drizzle' },
    55: { icon: '🌧️', condition: 'Dense drizzle' },

    56: { icon: '🌧️', condition: 'Light freezing drizzle' },
    57: { icon: '🌧️', condition: 'Dense freezing drizzle' },

    61: { icon: '🌧️', condition: 'Slight rain' },
    63: { icon: '🌧️', condition: 'Moderate rain' },
    65: { icon: '🌧️', condition: 'Heavy rain' },

    66: { icon: '🌧️', condition: 'Light freezing rain' },
    67: { icon: '🌧️', condition: 'Heavy freezing rain' },

    71: { icon: '🌨️', condition: 'Slight snowfall' },
    73: { icon: '🌨️', condition: 'Moderate snowfall' },
    75: { icon: '❄️', condition: 'Heavy snowfall' },

    77: { icon: '❄️', condition: 'Snow grains' },

    80: { icon: '🌦️', condition: 'Slight rain showers' },
    81: { icon: '🌧️', condition: 'Moderate rain showers' },
    82: { icon: '⛈️', condition: 'Violent rain showers' },

    85: { icon: '🌨️', condition: 'Slight snow showers' },
    86: { icon: '❄️', condition: 'Heavy snow showers' },

    95: { icon: '⛈️', condition: 'Thunderstorm' },
    96: { icon: '⛈️', condition: 'Thunderstorm with hail' },
    99: { icon: '⛈️', condition: 'Thunderstorm with heavy hail' },
  };

  return (
    weatherMap[code] || {
      icon: '🌡️',
      condition: 'Unknown weather',
    }
  );
};

const formatDay = dateString => {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const WeatherScreen = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');

      return status === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);

      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        throw new Error(
          'Location permission is required to get weather for your current location.',
        );
      }

      Geolocation.getCurrentPosition(
        async position => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log('📍 Current Location:', {
              latitude,
              longitude,
            });

            setLocation({
              latitude,
              longitude,
            });

            const url =
              `${WEATHER_API}?latitude=${latitude}` +
              `&longitude=${longitude}` +
              `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
              `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
              `&temperature_unit=celsius` +
              `&wind_speed_unit=kmh` +
              `&timezone=auto` +
              `&forecast_days=5`;

            console.log('🌦️ Weather API:', url);

            const response = await fetch(url);

            if (!response.ok) {
              throw new Error(
                `Weather API failed with status ${response.status}`,
              );
            }

            const data = await response.json();

            console.log('🌦️ Weather Response:', data);

            setWeather(data);
          } catch (apiError) {
            console.error('❌ Weather API Error:', apiError);

            setError(
              apiError?.message || 'Unable to fetch weather information.',
            );
          } finally {
            setLoading(false);
            setRefreshing(false);
          }
        },
        positionError => {
          console.error('❌ Location Error:', positionError);

          setError(
            positionError?.message || 'Unable to get your current location.',
          );

          setLoading(false);
          setRefreshing(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          showLocationDialog: true,
          forceRequestLocation: true,
        },
      );
    } catch (permissionError) {
      console.error('❌ Location Permission Error:', permissionError);

      setError(permissionError.message);

      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  const currentWeather = weather?.current;

  const currentWeatherInfo = getWeatherInfo(currentWeather?.weather_code);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Weather</Text>

          <Text style={styles.subtitle}>Current weather information</Text>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.loadingText}>
              Getting your location and weather...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>

            <Text style={styles.errorTitle}>Unable to load weather</Text>

            <Text style={styles.errorText}>{error}</Text>

            <Text style={styles.retryText}>Pull down to try again.</Text>
          </View>
        )}

        {/* Weather */}
        {!loading && !error && weather && (
          <>
            {/* Current Weather */}
            <View style={styles.weatherCard}>
              <Text style={styles.location}>Current Location</Text>

              <Text style={styles.coordinates}>
                {location?.latitude?.toFixed(4)},{' '}
                {location?.longitude?.toFixed(4)}
              </Text>

              <Text style={styles.weatherIcon}>{currentWeatherInfo.icon}</Text>

              <Text style={styles.temperature}>
                {Math.round(currentWeather?.temperature_2m)}°
              </Text>

              <Text style={styles.condition}>
                {currentWeatherInfo.condition}
              </Text>

              <Text style={styles.feelsLike}>
                Feels like {Math.round(currentWeather?.apparent_temperature)}°
              </Text>
            </View>

            {/* Weather Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weather Details</Text>

              <View style={styles.detailsContainer}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>💧</Text>

                  <Text style={styles.detailValue}>
                    {currentWeather?.relative_humidity_2m}%
                  </Text>

                  <Text style={styles.detailLabel}>Humidity</Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>💨</Text>

                  <Text style={styles.detailValue}>
                    {Math.round(currentWeather?.wind_speed_10m)} km/h
                  </Text>

                  <Text style={styles.detailLabel}>Wind</Text>
                </View>
              </View>
            </View>

            {/* Forecast */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5-Day Forecast</Text>

              {weather.daily?.time?.map((date, index) => {
                const forecastInfo = getWeatherInfo(
                  weather.daily.weather_code[index],
                );

                return (
                  <View key={date} style={styles.forecastCard}>
                    <View style={styles.forecastDay}>
                      <Text style={styles.forecastDate}>{formatDay(date)}</Text>

                      <Text style={styles.forecastCondition}>
                        {forecastInfo.icon} {forecastInfo.condition}
                      </Text>
                    </View>

                    <View style={styles.forecastTemperature}>
                      <Text style={styles.maxTemperature}>
                        {Math.round(weather.daily.temperature_2m_max[index])}°
                      </Text>

                      <Text style={styles.minTemperature}>
                        {Math.round(weather.daily.temperature_2m_min[index])}°
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeatherScreen;

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

  headerSection: {
    paddingVertical: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2d2a',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7471',
  },

  loadingContainer: {
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#6b7471',
  },

  errorCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  errorIcon: {
    fontSize: 36,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#26332f',
  },

  errorText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#7a8581',
  },

  retryText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6a9689',
  },

  weatherCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  location: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7471',
  },

  coordinates: {
    marginTop: 4,
    fontSize: 11,
    color: '#9aa39f',
  },

  weatherIcon: {
    marginTop: 18,
    fontSize: 52,
  },

  temperature: {
    marginTop: 8,
    fontSize: 48,
    fontWeight: '700',
    color: '#26332f',
  },

  condition: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: '600',
    color: '#26332f',
  },

  feelsLike: {
    marginTop: 6,
    fontSize: 13,
    color: '#7a8581',
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 19,
    fontWeight: '700',
    color: '#26332f',
  },

  detailsContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  detailCard: {
    flex: 1,
    minHeight: 120,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  detailIcon: {
    fontSize: 24,
  },

  detailValue: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#26332f',
  },

  detailLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#7a8581',
  },

  forecastCard: {
    marginBottom: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  forecastDay: {
    flex: 1,
  },

  forecastDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26332f',
  },

  forecastCondition: {
    marginTop: 6,
    fontSize: 12,
    color: '#7a8581',
  },

  forecastTemperature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  maxTemperature: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332f',
  },

  minTemperature: {
    fontSize: 14,
    color: '#9aa39f',
  },
});
