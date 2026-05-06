import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

import PayslipTemplate from './PayslipTemplate';

const MyPayslip = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [payslipResponse, setPayslipResponse] = useState(null);
  const [loading, setLoading] = useState(false); // spinner for fetch
  const [searched, setSearched] = useState(false); // track if user pressed search
  const yearList = [2024, 2025, 2026, 2027];

  const monthList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
 
  const fetchPayslip = async () => {
    if (!year || !month) {
      alert('Please enter Year and Month');
      return;
    }

    try {
      setSearched(true);
      setLoading(true);

      const res = await apiMiddleware.get(`/payslip/my_payslips`, {
        params: { year, month },
      });

      if (res.data.success && res.data.count > 0) {
        setPayslipResponse(res.data.data);
      } else {
        setPayslipResponse(null);
      }
    } catch (err) {
      console.error(err);
      setPayslipResponse(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Payslip</Text>

      {/* FILTER ROW LIKE TRIPSCREEN */}

      <View style={styles.filterRow}>
        <View style={styles.dateBox}>
          <Text style={styles.pickerText}>{year}</Text>
          <Picker
            selectedValue={year}
            onValueChange={setYear}
            style={{ flex: 1 }}
            itemStyle={{ color: '#000', fontSize: 14 }}
          >
            {yearList.map(y => (
              <Picker.Item key={y} label={y.toString()} value={y} />
            ))}
          </Picker>
        </View>

        <View style={styles.dateBox}>
          <Text style={styles.pickerText}>
            {monthList.find(m => m.value === month)?.label || 'Month'}
          </Text>
          <Picker
            selectedValue={month}
            onValueChange={setMonth}
            style={{ flex: 1 }}
            itemStyle={{ color: '#000', fontSize: 14 }}
          >
            {monthList.map(m => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.filterBtn} onPress={fetchPayslip}>
          <Icon name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* PAYSLIP BELOW */}

      <View style={styles.payslipArea}>
        {loading ? (
          <ActivityIndicator size="large" color="#6a9689" />
        ) : payslipResponse ? (
          <PayslipTemplate payslipResponse={payslipResponse} />
        ) : searched ? (
          <Text style={styles.noDataText}>No Payslip found</Text>
        ) : null}
      </View>
    </View>
  );
};

export default MyPayslip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 11,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a9689',
    marginBottom: 12,
    paddingHorizontal: 135,
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '7%',
  },

  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42%',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    paddingHorizontal: 6,
    color: '#000',
  },

  filterBtn: {
    backgroundColor: '#6a9689',
    padding: 12,
    borderRadius: 8,
    marginLeft: 2,
    justifyContent: 'center',
  },

  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 2,
  },

  payslipArea: {
    marginTop: 15,
    alignItems: 'center',
  },

  noDataText: {
    fontSize: 16,
    color: '#555',
    marginTop: 20,
  },
});
