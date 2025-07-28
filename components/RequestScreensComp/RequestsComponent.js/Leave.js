import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';


const Leave = () => {
  const [leaveData, setLeaveData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    numberOfDays: '',
  });
  console.log('leaveData', leaveData);

  const [showCalendar, setShowCalendar] = useState({
    visible: false,
    field: '',
  });

  const handleInputChange = (field, value) => {
    setLeaveData(prev => ({ ...prev, [field]: value }));

    // Automatically calculate number of days if from/to dates are present
    if (
      (field === 'fromDate' && leaveData.toDate) ||
      (field === 'toDate' && leaveData.fromDate)
    ) {
      const from = moment(
        field === 'fromDate' ? value : leaveData.fromDate,
        'YYYY-MM-DD',
      );
      const to = moment(
        field === 'toDate' ? value : leaveData.toDate,
        'YYYY-MM-DD',
      );

      if (to.isAfter(from) || to.isSame(from)) {
        const diff = to.diff(from, 'days') + 1;
        setLeaveData(prev => ({ ...prev, numberOfDays: diff.toString() }));
      } else {
        Alert.alert('Error', 'End date must be after start date.');
        setLeaveData(prev => ({ ...prev, toDate: '', numberOfDays: '' }));
      }
    }
  };
  const handleSubmit = async () => {
    const { leaveType, fromDate, toDate, reason, numberOfDays } = leaveData;

    if (!leaveType || !fromDate || !toDate || !reason || !numberOfDays) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }
    console.log(
      'leaveType',
      leaveType,
      '/',
      'fromDate',
      fromDate,
      '/',
      'toDate',
      toDate,
      '/',
      'reason',
      reason,
      '/',
      'numberOfDays',
      numberOfDays,
    );

    const payload = {
      start_date: fromDate,
      end_date: toDate,
      start_day_type: 'full_day', // Assuming full day for mobile
      end_day_type: 'full_day',
      leave_type: leaveType,
      number_of_days: parseInt(numberOfDays, 10),
      reason,
    };

    try {
      const response = await apiMiddleware.post('/request/leave', payload);

      if (response?.status === 201) {
        Alert.alert('Success', 'Leave request submitted successfully!');
        setLeaveData({
          leaveType: '',
          fromDate: '',
          toDate: '',
          reason: '',
          numberOfDays: '',
        });
      } else {
        Alert.alert(
          'Error',
          response?.data?.message || 'Failed to submit leave.',
        );
      }
    } catch (error) {
      console.error('❌ Submit error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong.',
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Leave Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={leaveData.leaveType}
              onValueChange={value => handleInputChange('leaveType', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Type" value="" />
              <Picker.Item label="Sick Leave" value="sick leave" />
              <Picker.Item label="Annual Leave" value="annual leave" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Number of Days</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 2"
            value={leaveData.numberOfDays}
            editable={false} // auto-calculated
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            onPress={() =>
              setShowCalendar({ visible: true, field: 'fromDate' })
            }
          >
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={leaveData.fromDate}
              editable={false}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            onPress={() => setShowCalendar({ visible: true, field: 'toDate' })}
          >
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={leaveData.toDate}
              editable={false}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Reason</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        placeholder="Write your reason here..."
        value={leaveData.reason}
        onChangeText={text => handleInputChange('reason', text)}
      />

      <View style={styles.submitButton}>
        <Button title="Submit" onPress={handleSubmit} color="#6a9689" />
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar.visible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={day => {
                handleInputChange(showCalendar.field, day.dateString);
                setShowCalendar({ visible: false, field: '' });
              }}
              markedDates={{
                [leaveData.fromDate]: {
                  selected: true,
                  selectedColor: '#009688',
                },
                [leaveData.toDate]: {
                  selected: true,
                  selectedColor: '#00796B',
                },
              }}
            />
            <Button
              title="Cancel"
              onPress={() => setShowCalendar({ visible: false, field: '' })}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Leave;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eaf6ef',
    borderRadius: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  pickerWrapper: {
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 5,
  },
});
