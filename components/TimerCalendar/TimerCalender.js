// TimerCalender.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';

// ---------- Helpers ----------
const ymd = (year, month, day) =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(
    day,
  ).padStart(2, '0')}`;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getTimeColor = time => {
  if (!time) return '#000';
  const [h, m] = ('' + time).split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0);
  return total < 480 ? 'red' : 'green'; // < 8 hrs = red, else green
};

const TimerCalender = ({ refreshFlag }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(moment().month() + 1);
  const [visibleYear, setVisibleYear] = useState(moment().year());

  // ---------- Fetch working hours ----------
  const fetchWorkingHours = async (month, year, controller) => {
    try {
      const resp = await apiMiddleware.get(
        `/attendance/daily_working_hours?month=${month}&year=${year}`,
        { signal: controller?.signal },
      );
      const workingHoursPerDay = resp?.data?.workingHoursPerDay ?? [];

      return workingHoursPerDay.reduce((acc, item) => {
        const day = item.date;
        const formattedDate = ymd(year, month, day);
        const decimal_hours = item.decimal_hours ?? 0;
        const hours = Math.floor(decimal_hours);
        const minutes = Math.round((decimal_hours - hours) * 100);
        const label = `${hours}:${String(minutes).padStart(2, '0')}`;

        acc[formattedDate] = {
          label,
          source: 'workhours',
          customStyles: {
            container: styles.dayContainer,
            text: { color: getTimeColor(label) },
          },
        };
        return acc;
      }, {});
    } catch {
      return {};
    }
  };

  // ---------- Fetch user profile ----------
  const fetchUserProfile = async controller => {
    try {
      const resp = await apiMiddleware.get('/company/employee-details', {
        signal: controller?.signal,
      });
      const weeklyOff = (resp?.data?.data?.weekly_off || []).map(
        w => w.day_off,
      );
      const companyCode =
        resp?.data?.data?.company_code ??
        resp?.data?.data?.company?.company_code ??
        resp?.data?.data?.company_id ??
        resp?.data?.data?.company;
      return { weeklyOff, companyCode };
    } catch {
      return { weeklyOff: [], companyCode: null };
    }
  };

  // ---------- Fetch policies & holidays ----------
  const fetchPoliciesAndHolidays = async (companyCode, controller) => {
    try {
      const policiesResp = await apiMiddleware.get('/get-all-policies', {
        signal: controller?.signal,
      });
      const policies = policiesResp?.data ?? [];

      const policy = companyCode
        ? policies.find(p => String(p.company_code) === String(companyCode)) ||
          policies[0]
        : policies[0];

      const holidayTemplateId = policy?.holiday_template;

      const holidayGroupsResp = await apiMiddleware.get(
        '/general-holidays/get-holiday-groups',
        { signal: controller?.signal },
      );
      const groups = holidayGroupsResp?.data || [];

      const matching = groups.find(
        g => String(g._id) === String(holidayTemplateId),
      );
      const holidays = (matching?.leaves || []).map(h => ({
        ...h,
        dateString:
          (h?.holiday_date &&
            moment(h.holiday_date).isValid() &&
            moment(h.holiday_date).format('YYYY-MM-DD')) ||
          null,
      }));

      return holidays;
    } catch {
      return [];
    }
  };

  // ---------- Merge Dates ----------
  const buildMarkedDates = (workMap, weeklyOffs, holidaysArr, month, year) => {
    const merged = { ...workMap };

    // weekoffs
    const dayNameToIndex = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const weekOffIndices = (weeklyOffs || [])
      .map(w => dayNameToIndex[w])
      .filter(v => v !== undefined);

    const daysInMonth = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      if (weekOffIndices.includes(date.getDay())) {
        merged[ymd(year, month, d)] = {
          label: 'W/O',
          source: 'weekoff',
          customStyles: {
            container: styles.weekOffContainer,
            text: { color: '#FF9800' },
          },
        };
      }
    }
    console.log('holidaysArr', holidaysArr);

    // holidays override
    holidaysArr.forEach(h => {
      if (!h.dateString) return;
      merged[h.dateString] = {
        label: 'Holi.',
        source: 'holiday',
        holidayName: h.holiday_name ?? null,
        customStyles: {
          container: styles.holidayContainer,
          text: { color: '#1976D2' },
        },
      };
    });

    return merged;
  };

  // ---------- Load Month ----------
  const loadMonthData = useCallback(async (month, year) => {
    setLoading(true);
    const controller = new AbortController();

    try {
      const profile = await fetchUserProfile(controller);
      const holidays = await fetchPoliciesAndHolidays(
        profile.companyCode,
        controller,
      );
      const workMap = await fetchWorkingHours(month, year, controller);

      setMarkedDates(
        buildMarkedDates(workMap, profile.weeklyOff, holidays, month, year),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthData(moment().month() + 1, moment().year());
  }, [loadMonthData, refreshFlag]);

  // ---------- Day press ----------
  const fetchAttendanceData = async date => {
    setLoading(true);
    const controller = new AbortController();
    try {
      await delay(300);
      const resp = await apiMiddleware.get(
        `/attendance/daily_attendance?date=${date}`,
        { signal: controller?.signal },
      );
      setAttendanceData(resp?.data?.[0] ?? null);
    } catch {
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  };

  const onDayPress = date => {
    setSelectedDate(date.dateString);
    setModalVisible(true);
    fetchAttendanceData(date.dateString);
  };

  const onMonthChange = ({ month, year }) => {
    setVisibleMonth(month);
    setVisibleYear(year);
    loadMonthData(month, year);
  };

  const closeModal = () => {
    setModalVisible(false);
    setAttendanceData(null);
  };

  const formatTime = dateTimeString => {
    if (!dateTimeString) return '--/--';
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return '--/--';
    return d.toLocaleString(undefined, {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  const formatWorkingHours = decimalHours => {
    if (!decimalHours) return '--';
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 100);
    return `${hours}h ${minutes}m`;
  };

  // ---------- Render ----------
  return (
    <View style={styles.container}>
      <Text style={styles.calenderHeading}>Timing Calendar</Text>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#00503D"
          style={{ marginBottom: 12 }}
        />
      )}

      <Calendar
        style={styles.calendar}
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        dayComponent={({ date }) => {
          const m = markedDates[date.dateString];
          const label = m?.label ?? null;
          const color =
            m?.source === 'holiday'
              ? '#1976D2'
              : m?.source === 'weekoff'
              ? '#FF9800'
              : m?.label
              ? getTimeColor(m.label)
              : '#000';
          const bgStyle =
            m?.source === 'holiday'
              ? styles.holidayBg
              : m?.source === 'weekoff'
              ? styles.weekOffBg
              : styles.normalBg;

          const isOutsideMonth =
            date.month !== visibleMonth || date.year !== visibleYear;
          const dayTextColor = isOutsideMonth ? '#999' : 'black';

          return (
            <TouchableOpacity onPress={() => onDayPress(date)}>
              <View style={[styles.dayWrapper, bgStyle]}>
                <Text style={[styles.dayText, { color: dayTextColor }]}>
                  {date.day}
                </Text>
                {label && (
                  <Text style={[styles.timeText, { color }]}>{label}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Date: <Text style={styles.modalDate}>{selectedDate}</Text>
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#00503D" />
            ) : (
              <>
                {markedDates[selectedDate]?.source === 'holiday' ? (
                  <View>
                    <Text style={styles.infoText}>General Holiday </Text>
                    <Text style={styles.infoTextSmall}>
                      {markedDates[selectedDate]?.holidayName ?? ''}
                    </Text>
                  </View>
                ) : markedDates[selectedDate]?.source === 'weekoff' ? (
                  <Text style={styles.infoText}>This day is a Week Off</Text>
                ) : attendanceData ? (
                  <View style={styles.dataContainer}>
                    <View style={styles.row}>
                      <Text style={styles.titleText}>Punch In Time:</Text>
                      <Text style={styles.dataText}>
                        {formatTime(attendanceData.punch_in_time)}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.titleText}>Punch Out Time:</Text>
                      <Text style={styles.dataText}>
                        {formatTime(attendanceData.punch_out_time)}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.titleText}>Punch In Location:</Text>
                      <Text style={styles.dataText}>
                        <Text
                          style={styles.linkText}
                          onPress={() =>
                            Linking.openURL(
                              `https://www.google.com/maps?q=${attendanceData.punch_in_time_latitude_coordinates},${attendanceData.punch_in_time_longitude_coordinates}`,
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
                              `https://www.google.com/maps?q=${attendanceData.punch_out_time_latitude_coordinates},${attendanceData.punch_out_time_longitude_coordinates}`,
                            )
                          }
                        >
                          View Location
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.titleText}>Status:</Text>
                      <Text style={styles.dataText}>
                        {attendanceData.status}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.titleText}>Working Hours:</Text>
                      <Text style={styles.dataText}>
                        {formatWorkingHours(attendanceData.working_hours)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text>No data available for this date</Text>
                )}
              </>
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

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  calenderHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  calendar: {
    borderRadius: 10,
    elevation: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  dayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8,
    padding: 6,
  },
  dayText: { fontSize: 16, fontWeight: '600', color: 'black' },
  timeText: { fontSize: 12, marginTop: 3 },
  dayContainer: { borderRadius: 8, padding: 4 },
  weekOffContainer: { borderRadius: 8, padding: 4, backgroundColor: '#FFF3E0' },
  holidayContainer: { borderRadius: 8, padding: 4, backgroundColor: '#E3F2FD' },

  normalBg: { backgroundColor: '#fff' },
  weekOffBg: { backgroundColor: '#FFF3E0' },
  holidayBg: { backgroundColor: '#E3F2FD' },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    maxWidth: 420,
    elevation: 8,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#6a9689',
    fontWeight: '600',
  },
  modalDate: { color: '#00503D' },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#a8d7c5',
  },
  closeButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '700',
    textAlign: 'center',
  },
  infoTextSmall: { color: '#333', marginTop: 6 },
  dataContainer: { width: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#6a9689',
    fontSize: 14,
    width: '45%',
  },
  dataText: { color: '#00503D', fontSize: 14, width: '50%', fontWeight: '700' },
  linkText: { color: '#0000FF', textDecorationLine: 'underline', marginTop: 8 },
});
