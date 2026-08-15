import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
import { isNotNull } from '../../../src/utils/utils';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Popup from '../../Popup/Popup';

// ==========================================
// REUSABLE ARCHITECTURE: MODAL-BACKED DROPDOWN
// ==========================================
const NativeDropdown = ({ label, value, options, onSelect, placeholder }) => {
  const buttonRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState({ top: 0, left: 0, width: 0 });

  const openDropdown = () => {
    // Measure the exact position of this specific button on the physical screen
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
    <View style={styles.reasonWrapper}>
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
          <View
            style={[
              styles.dropdownList,
              { top: layout.top, left: layout.left, width: layout.width },
            ]}
          >
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
// MAIN COMPOFF COMPONENT
// ==========================================
const CompOff = ({ onSubmit, onSuccess }) => {
  const [entries, setEntries] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '' });
  const showPopup = (title, message) => setPopup({ visible: true, title, message });
  const closePopup = () => setPopup({ visible: false, title: '', message: '' });
  
  const CompOffType = ["Full Day", "HalfDay"];
  
  // Format options for the NativeDropdown
  const compOffOptions = CompOffType.map(type => ({ label: type, value: type }));

  // Time picker states
  const [pickerVisible, setPickerVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null); // "inTime" or "outTime"
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const getTimeColor = time => {
    const [h] = time.split(':').map(Number);
    return h >= 8 ? '#4a8f7b' : '#f56c6c';
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '';
    try {
      const [inH, inM] = inTime.split(':').map(Number);
      const [outH, outM] = outTime.split(':').map(Number);

      let diffMin = outH * 60 + outM - (inH * 60 + inM);
      if (diffMin < 0) diffMin += 24 * 60;

      const hrs = String(Math.floor(diffMin / 60)).padStart(2, '0');
      const mins = String(diffMin % 60).padStart(2, '0');

      return `${hrs}:${mins}`;
    } catch {
      return '';
    }
  };

  const fetchWorkingHours = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      const response = await apiMiddleware.get(
        `/attendance/daily_working_hours?month=${month}&year=${year}`,
      );
      const { workingHoursPerDay } = response.data;

      if (isNotNull(workingHoursPerDay)) {
        const formatted = workingHoursPerDay.reduce(
          (acc, { date, decimal_hours }) => {
            const formattedDate = `${year}-${String(month).padStart(
              2,
              '0',
            )}-${String(date).padStart(2, '0')}`;
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
          },
          {},
        );
        setMarkedDates(formatted);
      }
    } catch (error) {
      console.error('Working hours error:', error);
    }
  };

  const fetchAttendanceData = async date => {
    setLoading(true);
    try {
      const response = await apiMiddleware.get(
        `/attendance/daily_attendance?date=${date}`,
      );
      const data = response.data?.[0];
    
      if (data) {
        const alreadyExists = entries.some(e => e.date === date);
        if (!alreadyExists) {
          setEntries(prev => [
            ...prev,
            {
              id: Date.now(),
              date,
              dayType: '',
              reason: '',
              inTime: data.punch_in_time ? new Date(data.punch_in_time) : null,
              outTime: data.punch_out_time ? new Date(data.punch_out_time) : null,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Attendance fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setEntries(prev =>
      prev.map(e => {
        if (e.id === id) {
          return { ...e, [field]: value };
        }
        return e;
      }),
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const isValid = entries.every(e => e.date && e.reason && e.dayType);
    if (!isValid) {
      showPopup('Validation', 'Please fill all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(entries);
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      showPopup('Error', 'Something went wrong while submitting.');
      setSubmitting(false);
    } 
  };

  const onDayPress = day => {
    fetchAttendanceData(day.dateString);
    setShowCalendar(false);
  };

  useEffect(() => {
    const today = new Date();
    fetchWorkingHours(today.getMonth() + 1, today.getFullYear());
  }, []);

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.addButton} onPress={() => setShowCalendar(true)}>
          <Text style={styles.addText}>+ Add Date</Text>
        </Pressable>

        {entries.map(entry => (
          <View key={entry.id} style={styles.card}>
            <Pressable style={styles.crossBtn} onPress={() => deleteEntry(entry.id)}>
              <Text style={styles.cross}>❌</Text>
            </Pressable>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{entry.date}</Text>
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={18} color="#555" />
                <Text style={styles.durationText}>
                  {calculateHours(entry.inTime, entry.outTime) || '00:00'} hrs
                </Text>
              </View>
            </View>

            {/* 🔥 REPLACED NATIVE PICKER WITH NATIVE DROPDOWN 🔥 */}
            <NativeDropdown
              label="Select Type *"
              placeholder="Select Type"
              value={entry.dayType}
              options={compOffOptions}
              onSelect={value => handleChange(entry.id, 'dayType', value)}
            />

            <View style={styles.reasonWrapper}>
              <Text style={styles.label}>Select Reason *</Text>
              <TextInput
                placeholder="Enter reason"
                style={styles.reasonInput}
                value={entry.reason}
                multiline
                onChangeText={val => handleChange(entry.id, 'reason', val)}
              />
            </View>
          </View>
        ))}

        {/* Time Picker Modal */}
        <DateTimePickerModal
          isVisible={pickerVisible}
          mode="time"
          onConfirm={date => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;
            if (selectedEntryId && currentField) {
              handleChange(selectedEntryId, currentField, timeStr);
            }
            setPickerVisible(false);
          }}
          onCancel={() => setPickerVisible(false)}
        />

        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              style={{ borderRadius: 10 }}
              markingType={'custom'}
              markedDates={markedDates}
              onDayPress={onDayPress}
              dayComponent={({ date }) => {
                const marked = markedDates[date.dateString];
                return (
                  <TouchableOpacity
                    onPress={() => onDayPress({ dateString: date.dateString })}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: '#000' }}>{date.day}</Text>
                      {marked?.time && (
                        <Text
                          style={{
                            fontSize: 10,
                            color: getTimeColor(marked.time),
                          }}
                        >
                          {marked.time}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                todayTextColor: '#4a8f7b',
                selectedDayBackgroundColor: '#4a8f7b',
                selectedDayTextColor: '#fff',
                arrowColor: '#4a8f7b',
              }}
            />

            <Pressable
              style={styles.cancelCalendarBtn}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.cancelCalendarText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {loading && (
          <ActivityIndicator
            size="large"
            color="#4a8f7b"
            style={{ marginTop: 20 }}
          />
        )}

        {entries.length > 0 && (
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.submitButton,
                submitting && { backgroundColor: '#ccc' },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitText}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* 🔹 Popup */}
      {popup.visible && (
        <Popup
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
          autoClose={true}
        />
      )}
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  addButton: {
    backgroundColor: '#4a8f7b',
    padding: 12,
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  reasonWrapper: {
    marginTop: 4,
    marginBottom: 10,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    height: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#000',
  },
  crossBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
  cross: {
    fontSize: 12,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  cancelCalendarBtn: {
    backgroundColor: '#aaa',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelCalendarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4a8f7b',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // ==========================================
  // NATIVE DROPDOWN STYLES
  // ==========================================
  dropdownButton: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#222',
  },
});

export default CompOff;