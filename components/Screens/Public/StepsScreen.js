import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';

import AppHeader from '../../common/AppHeader';
import AppleHealthKit from 'react-native-health';

const DAILY_GOAL = 10000;

const normalizeResults = result => {
  if (!result) {
    return [];
  }

  if (Array.isArray(result)) {
    return result;
  }

  if (typeof result === 'object') {
    return [result];
  }

  return [];
};

const getTotalValue = result => {
  return normalizeResults(result).reduce((total, item) => {
    return total + Number(item?.value || 0);
  }, 0);
};

const getStartOfDay = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date.toISOString();
};

const getLastSevenDaysStart = () => {
  const date = new Date();

  date.setDate(date.getDate() - 6);
  date.setHours(0, 0, 0, 0);

  return date.toISOString();
};

const groupStepsByDate = results => {
  const dailyMap = {};

  normalizeResults(results).forEach(item => {
    if (!item?.startDate) {
      return;
    }

    const date = new Date(item.startDate);
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = 0;
    }

    dailyMap[dateKey] += Number(item?.value || 0);
  });

  return Object.entries(dailyMap)
    .map(([dateKey, value]) => ({
      dateKey,
      date: new Date(`${dateKey}T00:00:00`),
      value,
    }))
    .sort((a, b) => b.date - a.date);
};

const StepsScreen = () => {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);

  const [weeklyData, setWeeklyData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /*
   * ---------------------------------------------------------
   * LOAD HEALTH DATA
   * ---------------------------------------------------------
   */
  const loadHealthData = useCallback(() => {
    const startDate = getStartOfDay();
    const endDate = new Date().toISOString();

    /*
     * -------------------------------------------------------
     * TODAY'S STEPS
     * -------------------------------------------------------
     */
    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate,
        endDate,
      },
      (error, results) => {
        if (error) {
          return;
        }

        const totalSteps = getTotalValue(results);

        setSteps(Math.round(totalSteps));
      },
    );
    /*
     * -------------------------------------------------------
     * TODAY'S DISTANCE
     * -------------------------------------------------------
     */
    AppleHealthKit.getDistanceWalkingRunning(
      {
        startDate,
        endDate,
      },
      (error, results) => {
        if (error) {
          return;
        }

        /*
         * The important fix:
         *
         * Do NOT directly do:
         *
         * results.reduce(...)
         *
         * because this API may return an object.
         */
        const totalDistanceMeters = getTotalValue(results);

        /*
         * HealthKit distance is in meters.
         *
         * Convert meters -> kilometers.
         */
        const totalDistanceKm = totalDistanceMeters / 1000;

        setDistance(totalDistanceKm);
      },
    );

    /*
     * -------------------------------------------------------
     * TODAY'S ACTIVE CALORIES
     * -------------------------------------------------------
     */
    AppleHealthKit.getActiveEnergyBurned(
      {
        startDate,
        endDate,
      },
      (error, results) => {
        if (error) {
          return;
        }

        const totalCalories = getTotalValue(results);

        setCalories(Math.round(totalCalories));

        setLoading(false);
        setRefreshing(false);
      },
    );

    /*
     * -------------------------------------------------------
     * WEEKLY STEPS
     * -------------------------------------------------------
     */
    const lastSevenDaysStart = getLastSevenDaysStart();

    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: lastSevenDaysStart,
        endDate,
      },
      (error, results) => {
        if (error) {
          setWeeklyData([]);

          return;
        }

        const dailyResults = groupStepsByDate(results);

        setWeeklyData(dailyResults);
      },
    );
  }, []);

  /*
   * ---------------------------------------------------------
   * INITIALIZE HEALTHKIT
   * ---------------------------------------------------------
   */
  const initializeHealthKit = useCallback(() => {
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.StepCount,

          AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,

          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        ],

        write: [],
      },
    };

    AppleHealthKit.initHealthKit(permissions, error => {
      if (error) {
        setLoading(false);

        Alert.alert(
          'Health Access Required',
          'Manas needs permission to read your activity data from Apple Health.',
        );

        return;
      }

      loadHealthData();
    });
  }, [loadHealthData]);

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */
  useEffect(() => {
    initializeHealthKit();
  }, [initializeHealthKit]);

  /*
   * ---------------------------------------------------------
   * PULL TO REFRESH
   * ---------------------------------------------------------
   */
  const handleRefresh = () => {
    setRefreshing(true);

    loadHealthData();
  };

  /*
   * ---------------------------------------------------------
   * DAILY GOAL PROGRESS
   * ---------------------------------------------------------
   */
  const progress = Math.min((steps / DAILY_GOAL) * 100, 100);

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
          <Text style={styles.title}>Steps</Text>

          <Text style={styles.subtitle}>Track your daily activity</Text>
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.loadingText}>
              Reading your activity data...
            </Text>
          </View>
        ) : (
          <>
            {/* Today's Steps */}
            <View style={styles.stepsCard}>
              <Text style={styles.cardLabel}>Today's Steps</Text>

              <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>

              <Text style={styles.goalText}>
                Goal: {DAILY_GOAL.toLocaleString()} steps
              </Text>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {Math.round(progress)}% completed
              </Text>
            </View>

            {/* Activity Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Activity</Text>

              <View style={styles.statsContainer}>
                {/* Steps */}
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{steps.toLocaleString()}</Text>

                  <Text style={styles.statLabel}>Steps</Text>
                </View>

                {/* Distance */}
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>

                  <Text style={styles.statLabel}>Distance</Text>
                </View>

                {/* Calories */}
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {calories.toLocaleString()}
                  </Text>

                  <Text style={styles.statLabel}>Calories</Text>
                </View>
              </View>
            </View>

            {/* Weekly Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>

              {weeklyData.length === 0 ? (
                <View style={styles.weeklyCard}>
                  <Text style={styles.emptyTitle}>No activity data</Text>

                  <Text style={styles.emptyText}>
                    No step data is available for this week.
                  </Text>
                </View>
              ) : (
                weeklyData.map((item, index) => {
                  const isToday =
                    item.dateKey === new Date().toISOString().split('T')[0];

                  return (
                    <View key={item.dateKey} style={styles.weeklyRow}>
                      <View>
                        <Text style={styles.weekDay}>
                          {isToday
                            ? 'Today'
                            : item.date.toLocaleDateString('en-IN', {
                                weekday: 'short',
                              })}
                        </Text>

                        <Text style={styles.weekDate}>
                          {item.date.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </View>

                      <Text style={styles.weekSteps}>
                        {Math.round(item.value).toLocaleString()} steps
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
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
    marginTop: 12,
    fontSize: 14,
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

  weeklyRow: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4ebe8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  weekDay: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26332f',
  },

  weekDate: {
    marginTop: 3,
    fontSize: 12,
    color: '#7a8581',
  },

  weekSteps: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6a9689',
  },
});
