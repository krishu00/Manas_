import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
import { isNotNull } from '../../../src/utils/utils';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Popup from '../../Popup/Popup';

const Regularize = ({ onSubmit, onSuccess }) => {
  const [entries, setEntries] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '' });
  const showPopup = (title, message) => setPopup({ visible: true, title, message });
  const closePopup = () => setPopup({ visible: false, title: '', message: '' });

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
          const inDate = new Date(data.punch_in_time);
          const outDate = new Date(data.punch_out_time);

          const formatTime = dateObj =>
            `${String(dateObj.getHours()).padStart(2, '0')}:${String(
              dateObj.getMinutes(),
            ).padStart(2, '0')}`;

          setEntries(prev => [
            ...prev,
            {
              id: Date.now(),
              date,
              inTime: data.punch_in_time ? formatTime(inDate) : '',
              outTime: data.punch_out_time ? formatTime(outDate) : '',
              totalHours: data.working_hours
                ? data.working_hours.toFixed(2)
                : '',
              reason: '',
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
          const updatedEntry = { ...e, [field]: value };

          if (field === 'inTime' || field === 'outTime') {
            const { inTime, outTime } = updatedEntry;
            if (inTime && outTime) {
              const [inH, inM] = inTime.split(':').map(Number);
              const [outH, outM] = outTime.split(':').map(Number);
              let diffMin = outH * 60 + outM - (inH * 60 + inM);
              if (diffMin < 0) diffMin += 24 * 60;
              const decimalHours = (diffMin / 60).toFixed(2);
              updatedEntry.totalHours = decimalHours;
            }
          }
          return updatedEntry;
        }
        return e;
      }),
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const isValid = entries.every(
      e => e.date && e.inTime && e.outTime && e.reason,
    );
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
      showPopup('Success', 'Your regularization request has been submitted.');
    } catch (error) {
      console.error('❌ Submit error:', error);
      showPopup('Error', 'Something went wrong while submitting.');
    } finally {
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

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.addButton} onPress={() => setShowCalendar(true)}>
          <Text style={styles.addText}>+ Add Date</Text>
        </Pressable>

        {entries.map(entry => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{entry.date}</Text>
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={18} color="#555" />
                <Text style={styles.durationText}>
                  {calculateHours(entry.inTime, entry.outTime) || '00:00'} hrs
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              {/* In Time Picker */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>In Time *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => {
                    setCurrentField('inTime');
                    setSelectedEntryId(entry.id);
                    setPickerVisible(true);
                  }}
                >
                  <Text style={{ color: entry.inTime ? '#000' : '#888' }}>
                    {entry.inTime || 'HH:MM'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Out Time Picker */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Out Time *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => {
                    setCurrentField('outTime');
                    setSelectedEntryId(entry.id);
                    setPickerVisible(true);
                  }}
                >
                  <Text style={{ color: entry.outTime ? '#000' : '#888' }}>
                    {entry.outTime || 'HH:MM'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 0.48,
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  reasonWrapper: {
    marginTop: 10,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 70,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#0e120ef0',
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
    marginTop: 30,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4a8f7b',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayWrapper: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default Regularize;
