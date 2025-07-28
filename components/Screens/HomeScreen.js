import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import ClockInOut from '../ClockInOut/ClockInOut'; // Assuming this is where your ClockInOut component resides
import TimerCalender from '../TimerCalendar/TimerCalender';
import DisplayTotalLeaves from '../DisplayTotalLeaves/DisplayTotalLeaves';
import AttendanceDetails from '../AttendanceDetails/AttendanceDetails'
const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState('');

  // Function to update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      const seconds = date.getSeconds();
      const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      setCurrentTime(formattedTime);
    }, 1000);

    // Cleanup timer when component unmounts
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>   
      {/* Scrollable View */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Overview Section */}
        <View style={styles.sectionContainer}>
          {/* <Text style={styles.heading}>Overview </Text> */}

          
          <View style={styles.overviewContainer}>
            <AttendanceDetails/>
            {/* Attendance Section */}
            {/* <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance</Text>
              <Text style={styles.sectionValue}>0 Days</Text>
              <Text style={styles.sectionDetails}>Absent: 15  Penalty: 0</Text>
            </View> */}

            {/* Leaves Section */}
            <View style={styles.section}>
              <DisplayTotalLeaves/>
              {/* <Text style={styles.sectionTitle}>Leaves</Text>
              <Text style={styles.sectionValue}>3.75</Text>
              <Text style={styles.sectionDetails}>Leaves Taken: 0</Text>  */}
            </View>
          </View>
        </View>
        

        {/* ClockInOut Section */}
        <View style={styles.sectionClockContainer}>  
          <Text style={styles.heading}>Clock In/Out</Text>
          <ClockInOut />
        </View>

        {/* Calendar Section */}
        <View style={styles.sectionCallenderContainer}>
          {/* <Text style={styles.heading}>Calendar</Text>
          <Text style={styles.placeholderText}>Calendar Placeholder</Text> */}
          <TimerCalender/>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Background color for the entire screen
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    height: 200, // Fixed height for each section
    marginBottom: 20, // Space between sections
    justifyContent: 'center', // Center contents vertically
  },
  sectionClockContainer: {
    height: 'auto', // Fixed height for each section
    marginBottom: 20, // Space between sections
    justifyContent: 'center', // Center contents vertically

  },
  sectionCallenderContainer: {
    height:'auto', // Fixed height for each section
    marginBottom: 20, // Space between sections
    justifyContent: 'center', // Center contents vertically

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
    color: '#6a9689', // Light green color for the number
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
