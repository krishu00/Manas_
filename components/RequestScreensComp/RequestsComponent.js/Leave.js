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
  Pressable,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
import Popup from '../../Popup/Popup';

// ==========================================
// REUSABLE ARCHITECTURE: MODAL-BACKED DROPDOWN
// ==========================================
const NativeDropdown = ({ label, value, options, onSelect, placeholder }) => {
  const buttonRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState({ top: 0, left: 0, width: 0 });

  const openDropdown = () => {
    // Measure the button's exact position on the physical screen
    buttonRef.current.measure((fx, fy, width, height, pageX, pageY) => {
      setLayout({
        top: pageY + height + 4, // Dropdown appears exactly 4px below the button
        left: pageX,
        width: width,
      });
      setVisible(true);
    });
  };

  return (
    <View style={styles.inputWrapperFull}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        ref={buttonRef}
        activeOpacity={0.8}
        style={styles.dropdownButton}
        onPress={openDropdown}
      >
        <Text style={[styles.dropdownText, !value && { color: '#999' }]}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>{visible ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* The Modal mounts a new native window above the ScrollView */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)} // Handles Android hardware back button
      >
        {/* Invisible full-screen overlay catches outside taps */}
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          
          {/* The list precisely positioned over the original button */}
          <View style={[styles.dropdownList, { top: layout.top, left: layout.left, width: layout.width }]}>
            <ScrollView bounces={false} style={{ maxHeight: 200 }}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </Pressable>
      </Modal>
    </View>
  );
};


// ==========================================
// MAIN FORM COMPONENT
// ==========================================
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
  const [showCalendar, setShowCalendar] = useState({ visible: false, field: '' });
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
        const response = await apiMiddleware.get(`/leaves-balance/get-leaves-balance`);
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

  const calculateDays = (from, to, startDayType, endDayType) => {
    if (!from || !to) return '';
    const start = moment(from, 'YYYY-MM-DD');
    const end = moment(to, 'YYYY-MM-DD');
    
    if (!start.isValid() || !end.isValid()) return '';
    if (end.isBefore(start)) return '';

    let diff = end.diff(start, 'days') + 1;

    if (start === end && startDayType === "first_session" && endDayType === "first_session") diff = 0.5;
    if (startDayType === "first_session" && endDayType === "first_session") diff -= 0.5;
    if (startDayType === "full_day" && endDayType === "first_session") diff -= 0.5;
    if (startDayType === "second_session" && endDayType === "full_day") diff -= 0.5;
    if (startDayType === "second_session" && endDayType === "second_session") diff -= 0.5;
    if (startDayType === "second_session" && endDayType === "first_session") diff -= 1;

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

    const { leaveType, fromDate, toDate, reason, numberOfDays, startDayType, endDayType } = leaveData;

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
          leaveType: '', fromDate: '', toDate: '',
          startDayType: 'full_day', endDayType: 'full_day',
          reason: '', numberOfDays: '',
        });

        showPopup('Success', 'Leave request submitted successfully!', () => {
          setTimeout(() => {
            onSuccess?.();
            onClose?.();
          }, 500);
        });
      } else {
        showPopup('Error', response?.data?.message || 'Failed to submit leave.');
      }
    } catch (error) {
      showPopup('Error', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format dynamic APIs for the generic dropdown
  const formattedLeaveTypes = leaveTypes.map(leave => ({
    label: leave.leaveTypeName,
    value: leave.leaveTypeName,
  }));

  const dayTypeOptions = [
    { label: 'Full Day', value: 'full_day' },
    { label: 'First Session', value: 'first_session' },
    { label: 'Second Session', value: 'second_session' },
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* REUSABLE LEAVE TYPE DROPDOWN */}
        <NativeDropdown
          label="Leave Type"
          placeholder="Select Leave Type"
          value={leaveData.leaveType}
          options={formattedLeaveTypes}
          onSelect={(val) => handleInputChange("leaveType", val)}
        />

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity onPress={() => setShowCalendar({ visible: true, field: 'fromDate' })}>
              <TextInput
                style={styles.input}
                value={leaveData.fromDate}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputWrapper}>
            {/* REUSABLE START DAY DROPDOWN */}
            <NativeDropdown
              label="Start Day Type"
              placeholder="Select Day Type"
              value={dayTypeOptions.find(opt => opt.value === leaveData.startDayType)?.label}
              options={dayTypeOptions}
              onSelect={(val) => handleInputChange("startDayType", val)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity onPress={() => setShowCalendar({ visible: true, field: 'toDate' })}>
              <TextInput
                style={styles.input}
                value={leaveData.toDate}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputWrapper}>
            {/* REUSABLE END DAY DROPDOWN */}
            <NativeDropdown
              label="End Day Type"
              placeholder="Select Day Type"
              value={dayTypeOptions.find(opt => opt.value === leaveData.endDayType)?.label}
              options={dayTypeOptions}
              onSelect={(val) => handleInputChange("endDayType", val)}
            />
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

        {leaveData.numberOfDays ? (
          <Text style={styles.totalDaysText}>
            Total Leaves Applied for : {leaveData.numberOfDays}{' '}
            {parseFloat(leaveData.numberOfDays) > 1 ? 'days' : 'day'}
          </Text>
        ) : null}

        <View style={styles.submitButton}>
          {submitting ? (
            <ActivityIndicator size="small" color="#6a9689" />
          ) : (
            <Button title="Submit" onPress={handleSubmit} color="#6a9689" />
          )}
        </View>

        <Modal visible={showCalendar.visible} transparent animationType="slide">
          <View style={styles.modalContentWrapper}>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={day => {
                  handleInputChange(showCalendar.field, day.dateString);
                  setShowCalendar({ visible: false, field: '' });
                }}
                markedDates={{
                  [leaveData.fromDate]: { selected: true, selectedColor: '#009688' },
                  [leaveData.toDate]: { selected: true, selectedColor: '#00796B' },
                }}
              />
              <Button title="Cancel" onPress={() => setShowCalendar({ visible: false, field: '' })} />
            </View>
          </View>
        </Modal>
      </ScrollView>

      {popupVisible && (
        <Popup title={popupContent.title} message={popupContent.message} onClose={handlePopupClose} />
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
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputWrapperFull: {
    width: '100%',
    marginBottom: 15,
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
    height: 50,
    borderColor: '#ccc',
    color: '#0e120ef0',
    borderWidth: 1,
    justifyContent: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
    paddingVertical: 12,
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
  modalContentWrapper: {
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
  
  // ==========================================
  // NATIVE DROPDOWN STYLES
  // ==========================================
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
  arrow: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    // Elegant Native iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // Elegant Native Android Shadow
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#222',
  },
});