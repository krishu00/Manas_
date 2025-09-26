import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
import Popup from '../../Popup/Popup';

const Leave = ({ onClose, onSuccess }) => {
  const [leaveData, setLeaveData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    startDayType: 'full_day',
    endDayType: 'full_day',
    reason: '',
    numberOfDays: '',
  });

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showCalendar, setShowCalendar] = useState({
    visible: false,
    field: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });
  const onPopupCloseCallbackRef = useRef(null);

  const showPopup = (title, message, onCloseCallback) => {
    setPopupContent({ title, message });
    setPopupVisible(true);
    if (onCloseCallback) onPopupCloseCallbackRef.current = onCloseCallback;
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    if (onPopupCloseCallbackRef.current) {
      onPopupCloseCallbackRef.current();
      onPopupCloseCallbackRef.current = null;
    }
  };

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await apiMiddleware.get(
          `/leaves-balance/get-leaves-balance`,
        );
        if (response?.data?.data?.leaveDetails) {
          setLeaveTypes(response.data.data.leaveDetails);
        } else {
          setLeaveTypes([]);
        }
      } catch (error) {
        console.error('❌ Error fetching leave types:', error.message);
        setLeaveTypes([]);
      }
    };
    fetchLeaveTypes();
  }, []);

  // 🟢 Calculate days dynamically
  const calculateDays = (from, to, startDayType, endDayType) => {
    if (!from || !to) return '';

    const start = moment(from, 'YYYY-MM-DD');
    const end = moment(to, 'YYYY-MM-DD');
    if (!start.isValid() || !end.isValid()) return '';

    if (end.isBefore(start)) return '';

    let diff = end.diff(start, 'days') + 1;

    // half-day adjustments like in web
    if (startDayType !== 'full_day') diff -= 0.5;
    if (endDayType !== 'full_day') diff -= 0.5;

    return diff > 0 ? diff.toString() : '';
  };

  const handleInputChange = (field, value) => {
    setLeaveData(prev => {
      const updated = { ...prev, [field]: value };
      updated.numberOfDays = calculateDays(
        updated.fromDate,
        updated.toDate,
        updated.startDayType,
        updated.endDayType,
      );
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const {
      leaveType,
      fromDate,
      toDate,
      reason,
      numberOfDays,
      startDayType,
      endDayType,
    } = leaveData;

    if (!leaveType || !fromDate || !toDate || !reason || !numberOfDays) {
      showPopup('Validation Error', 'Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      start_date: fromDate,
      end_date: toDate,
      start_day_type: startDayType,
      end_day_type: endDayType,
      leave_type: leaveType,
      number_of_days: parseFloat(numberOfDays),
      reason,
    };

    try {
      const response = await apiMiddleware.post('/request/leave', payload);
      if (response?.status === 201) {
        setLeaveData({
          leaveType: '',
          fromDate: '',
          toDate: '',
          startDayType: 'full_day',
          endDayType: 'full_day',
          reason: '',
          numberOfDays: '',
        });

        showPopup('Success', 'Leave request submitted successfully!', () => {
          setTimeout(() => {
            onSuccess?.();
            onClose?.();
          }, 500);
        });
      } else {
        showPopup(
          'Error',
          response?.data?.message || 'Failed to submit leave.',
        );
      }
    } catch (error) {
      showPopup(
        'Error',
        error.response?.data?.message || 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Leave Type (full width) */}
        <View style={styles.inputWrapperFull}>
          <Text style={styles.label}>Leave Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={leaveData.leaveType}
              onValueChange={value => handleInputChange('leaveType', value)}
              style={styles.picker}
            >
              <Picker.Item
                label="Select Type"
                value=""
                style={styles.pickerItem}
              />
              {leaveTypes.map(leave => (
                <Picker.Item
                  key={leave.leaveTypeId._id}
                  label={leave.leaveTypeId.leave_name}
                  value={leave.leaveTypeId.leave_name}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Start Date + Start Day Type */}
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
                value={leaveData.fromDate}
                editable={false}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Start Day Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={leaveData.startDayType}
                onValueChange={value =>
                  handleInputChange('startDayType', value)
                }
                style={styles.picker}
              >
                <Picker.Item
                  label="Full Day"
                  value="full_day"
                  style={styles.pickerItem}
                />
                <Picker.Item
                  label="First Session"
                  value="first_session"
                  style={styles.pickerItem}
                />
                <Picker.Item
                  label="Second Session"
                  value="second_session"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>
          </View>
        </View>

        {/* End Date + End Day Type */}
        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              onPress={() =>
                setShowCalendar({ visible: true, field: 'toDate' })
              }
            >
              <TextInput
                style={styles.input}
                value={leaveData.toDate}
                editable={false}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>End Day Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={leaveData.endDayType}
                onValueChange={value => handleInputChange('endDayType', value)}
                style={styles.picker}
              >
                <Picker.Item
                  label="Full Day"
                  value="full_day"
                  style={styles.pickerItem}
                />
                <Picker.Item
                  label="First Session"
                  value="first_session"
                  style={styles.pickerItem}
                />
                <Picker.Item
                  label="Second Session"
                  value="second_session"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>
          </View>
        </View>

        {/* Reason */}
        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Write your reason here..."
          value={leaveData.reason}
          onChangeText={text => handleInputChange('reason', text)}
        />

        {/* ✅ Show number of days as text */}
        {leaveData.numberOfDays ? (
          <Text style={styles.totalDaysText}>
            Total Leaves Applied for : {leaveData.numberOfDays}{' '}
            {parseFloat(leaveData.numberOfDays) > 1 ? 'days' : 'day'}
          </Text>
        ) : null}
        {/* Submit */}
        <View style={styles.submitButton}>
          {submitting ? (
            <ActivityIndicator size="small" color="#6a9689" />
          ) : (
            <Button title="Submit" onPress={handleSubmit} color="#6a9689" />
          )}
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

      {/* Popup */}
      {popupVisible && (
        <Popup
          title={popupContent.title}
          message={popupContent.message}
          onClose={handlePopupClose}
        />
      )}
    </>
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
  inputWrapperFull: {
    width: '100%',
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
    height: 50, // 🔹 fixed height
    borderColor: '#ccc',
    color: '#0e120ef0',

    borderWidth: 1,
    justifyContent: 'center',
  },
  pickerWrapper: {
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    overflow: 'hidden',
    height: 50, // 🔹 same as input
    justifyContent: 'center',
  },
  picker: {
    height: 50, // 🔹 match input height
    backgroundColor: '#fff',
  },
  pickerItem: {
    fontSize: 14, // 🔹 better visibility
    color: '#222',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  totalDaysText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 15,
    textAlign: 'center',
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
