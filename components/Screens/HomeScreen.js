import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import ClockInOut from '../ClockInOut/ClockInOut';
import TimerCalender from '../TimerCalendar/TimerCalender';
import DisplayTotalLeaves from '../DisplayTotalLeaves/DisplayTotalLeaves';
import AttendanceDetails from '../AttendanceDetails/AttendanceDetails';

const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false); 

  // ⏱ Auto clock
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const formattedTime = `${hours < 10 ? '0' + hours : hours}:${
        minutes < 10 ? '0' + minutes : minutes
      }:${seconds < 10 ? '0' + seconds : seconds}`;
      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔄 Re-fetch API data
  const fetchUpdatedData = async () => {
    console.log('Fetching latest HomeScreen data...');
    // 👇 call your APIs here (leave counts, attendance, etc.)
    // await apiMiddleware.get('/leave_counts')
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshFlag(prev => !prev); // 👈 toggle flag
    setTimeout(() => setRefreshing(false), 1000); // optional delay
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6a9689']}
          />
        }
      >
        <View style={styles.sectionContainer}>
          <View style={styles.overviewContainer}>
            {/* <AttendanceDetails /> */}
            <AttendanceDetails refreshFlag={refreshFlag} />

            <View style={styles.section}>
              {/* <DisplayTotalLeaves /> */}
              <DisplayTotalLeaves refreshFlag={refreshFlag} />
            </View>
          </View>
        </View>

        <View style={styles.sectionClockContainer}>
          <Text style={styles.heading}>Clock In/Out</Text>
          {/* <ClockInOut /> */}
          <ClockInOut refreshFlag={refreshFlag} />
        </View>

        <View style={styles.sectionCallenderContainer}>
          {/* <TimerCalender /> */}
          <TimerCalender refreshFlag={refreshFlag} />
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
  },
  sectionClockContainer: {
    height: 'auto',
    marginBottom: 20,
    justifyContent: 'center',
  },
  sectionCallenderContainer: {
    height: 'auto',
    marginBottom: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 10,
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
  placeholderText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
});
