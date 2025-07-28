import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ActivityIndicator ,Linking  } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { isNotNull } from '../../src/utils/utils';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';

const TimerCalender = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null); 
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWorkingHours = async (month, year) => {
    const controller = new AbortController(); // Create a new controller instance
    try {   
      const response = await apiMiddleware.get(
        `/attendance/daily_working_hours?month=${month}&year=${year}`,  
        { signal: controller.signal } // Pass the controller signal
      );
      const { workingHoursPerDay } = response.data;

      if (isNotNull(workingHoursPerDay) && workingHoursPerDay.length > 0) {
        const formattedData = workingHoursPerDay.reduce((acc, { date, decimal_hours }) => {
          const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
          const hours = Math.floor(decimal_hours);
          const minutes = Math.round((decimal_hours - hours) * 60);
          const timeString = `${hours}:${String(minutes).padStart(2, '0')}`;
          acc[formattedDate] = {
            customStyles: {
              container: styles.dayContainer,
              text: { color: getTimeColor(timeString) },
            },
            time: timeString,
          };
          return acc;
        }, {});
        setMarkedDates(formattedData);
      } else {
        console.log('No working hours data available for this month/year.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching working hours:', error);
      }
    }
    return () => controller.abort(); // Cleanup function to cancel the request if the component unmounts
  };

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;    
    const currentYear = new Date().getFullYear();
    fetchWorkingHours(currentMonth, currentYear);
  }, []);

  const getTimeColor = (time) => {
    const [hours, minutes] = time.split(':').map(Number);        
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes < 480 ? 'red' : 'green';
  };

  const fetchAttendanceData = async (date) => {
    setLoading(true);
    const controller = new AbortController(); // Create a new controller instance
    try {
      await delay(1000);
      const response = await apiMiddleware.get(
        `/attendance/daily_attendance?date=${date}`,
        { signal: controller.signal } // Pass the controller signal
      );

      setAttendanceData(response.data[0]);
      console.log('response day wise', response.data[0]);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching attendance data:', error);
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort(); // Cleanup function to cancel the request if the component unmounts
  };  

  const formatWorkingHours = (hours) => {
    const totalMinutes = Math.round(hours * 60);    
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return `${hrs} Hr ${mins} min`;
  };

  const onDayPress = (date) => {
    setSelectedDate(date.dateString);
    setModalVisible(true);
    fetchAttendanceData(date.dateString);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString(undefined, {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };



  return (
    <View style={styles.container}>
      <Text style={styles.calenderHeading}>Timing Calendar</Text>

      <Calendar
        style={styles.calendar}
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={onDayPress}   
        dayComponent={({ date }) => {
          const markedDate = markedDates[date.dateString];
          return (
            <TouchableOpacity onPress={() => onDayPress(date)}>
              <View style={styles.dayWrapper}>
                <Text style={styles.dayText}>{date.day}</Text>
                {markedDate && (
                  <Text style={[styles.timeText, { color: getTimeColor(markedDate.time) }]}>
                    {markedDate.time}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Date: <Text style={styles.modalDate}>{selectedDate}</Text>
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#00503D" />
            ) : attendanceData && attendanceData.employee_Id ? (
              <View style={styles.dataContainer}>
                <View style={styles.row}>
                  <Text style={styles.titleText}>Punch In Time:</Text>
                  <Text style={styles.dataText}>{formatTime(attendanceData.punch_in_time)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.titleText}>Punch Out Time:</Text>
                  <Text style={styles.dataText}>{formatTime(attendanceData.punch_out_time)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.titleText}>Punch In Location:</Text>
                  <Text style={styles.dataText}>
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(
                          `https://www.google.com/maps?q=${attendanceData.punch_in_time_latitude_coordinates},${attendanceData.punch_in_time_longitude_coordinates}`
                        )
                      }
                    >
                      View Location
                    </Text>
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.titleText}>Punch Out Location:</Text>
                  <Text style={styles.dataText}>
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(
                          `https://www.google.com/maps?q=${attendanceData.punch_out_time_latitude_coordinates},${attendanceData.punch_out_time_longitude_coordinates}`
                        )
                      }
                    >
                      View Location
                    </Text>
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.titleText}>Status:</Text>
                  <Text style={styles.dataText}>{attendanceData.status}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.titleText}>Working Hours:</Text>
                  <Text style={styles.dataText}>{formatWorkingHours(attendanceData.working_hours)}</Text>
                </View>
              </View>
            ) : (
              <Text>No data available for this date</Text>
            )}

            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TimerCalender;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  calenderHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  calendar: {
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 'auto',
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  dayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  timeText: {
    fontSize: 12,
    marginTop: 3,
  },
  dayContainer: {
    borderRadius: 10,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    width: '90%',
    maxWidth: 400,
  },
  
  modalText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#6a9689',
    fontWeight: '600',
  },
  modalDate:{
    color: '#00503D',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: '#a8d7c5',
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#6a9689',
    fontSize: 14,
    width: '40%',
  },
  dataText: {
    color: '#00503D',
    fontSize: 14,
    width: '55%',
    fontWeight:"700"
  },
  linkText: {
    color: '#0000FF',
    textDecorationLine: 'underline',
  },
});
