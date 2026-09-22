import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from 'react-native';
import AppHeader from '../../common/AppHeader';

const WeatherScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Weather</Text>

          <Text style={styles.subtitle}>Current weather information</Text>
        </View>

        {/* Current Weather */}
        <View style={styles.weatherCard}>
          <Text style={styles.location}>Current Location</Text>

          <Text style={styles.weatherIcon}>☀️</Text>

          <Text style={styles.temperature}>--°</Text>

          <Text style={styles.condition}>Weather data unavailable</Text>
        </View>

        {/* Weather Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Details</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>💧</Text>

              <Text style={styles.detailValue}>--</Text>

              <Text style={styles.detailLabel}>Humidity</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>💨</Text>

              <Text style={styles.detailValue}>--</Text>

              <Text style={styles.detailLabel}>Wind</Text>
            </View>
          </View>
        </View>

        {/* Forecast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forecast</Text>

          <View style={styles.forecastCard}>
            <Text style={styles.emptyTitle}>Forecast will appear here</Text>

            <Text style={styles.emptyText}>
              Weather forecast data will be displayed once the weather service
              is connected.
            </Text>
          </View>
        </View>
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
    fontSize: 14,
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
    padding: 20,

    backgroundColor: '#ffffff',

    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26332f',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#7a8581',
  },
});
