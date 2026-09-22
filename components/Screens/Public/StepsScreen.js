import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from 'react-native';
import AppHeader from '../../common/AppHeader';

const StepsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Steps</Text>

          <Text style={styles.subtitle}>Track your daily activity</Text>
        </View>

        {/* Today's Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.cardLabel}>Today's Steps</Text>

          <Text style={styles.stepsValue}>0</Text>

          <Text style={styles.goalText}>Goal: 10,000 steps</Text>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.progressText}>0% completed</Text>
        </View>

        {/* Activity Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>

              <Text style={styles.statLabel}>Steps</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>0 km</Text>

              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>

              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.weeklyCard}>
            <Text style={styles.emptyTitle}>No activity data yet</Text>

            <Text style={styles.emptyText}>
              Your weekly activity will appear here once step data is available.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StepsScreen;

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

  stepsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7471',
  },

  stepsValue: {
    marginTop: 10,
    fontSize: 42,
    fontWeight: '700',
    color: '#6a9689',
  },

  goalText: {
    marginTop: 4,
    fontSize: 13,
    color: '#7a8581',
  },

  progressBackground: {
    height: 9,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e7efec',
  },

  progressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: '#6a9689',
  },

  progressText: {
    marginTop: 8,
    fontSize: 12,
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

  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 100,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4ebe8',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#26332f',
  },

  statLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#7a8581',
  },

  weeklyCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
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
