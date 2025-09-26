import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import moment from 'moment';

const AttendanceDetails = ({refreshFlag}) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const month = moment().month() + 1; // JS months are 0-indexed
  const year = moment().year();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await apiMiddleware.get(
          `/attendance/user_attendance_performance?month=${month}&year=${year}`,
        );
        if (response.data?.success) {
          setAttendanceData(response.data);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [refreshFlag]);

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator size="large" color="#6a9689" />
      </View>
    );
  }

  if (!attendanceData) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance</Text>
        <Text style={styles.sectionValue}>No data</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Attendance</Text>
      <Text style={styles.sectionValue}>
        {attendanceData.totalWorkingDays} Days
      </Text>
      <Text style={styles.sectionDetails}>
        Miss Punch: {attendanceData.missPunch}
        {'\n'}
        On-Time: {attendanceData.onTimePercentage}% {'\n'} Late:{' '}
        {attendanceData.latePercentage}%
      </Text>
    </View>
  );
};

export default AttendanceDetails;

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4062',
    marginBottom: 10,
  },
  sectionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a9689',
    marginBottom: 10,
  },
  sectionDetails: {
    fontSize: 14,
    color: '#6a9689',
    textAlign: 'center',
  },
});
