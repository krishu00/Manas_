import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Icon from 'react-native-vector-icons/FontAwesome';
import PayslipTemplate from './PayslipTemplate';

// ==========================================
// REUSABLE ARCHITECTURE: MODAL-BACKED DROPDOWN
// ==========================================
const NativeDropdown = ({ value, options, onSelect, placeholder, containerStyle }) => {
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

  // Find the label for the currently selected value
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        ref={buttonRef}
        activeOpacity={0.8}
        style={styles.dropdownButton}
        onPress={openDropdown}
      >
        <Text style={[styles.dropdownText, !value && { color: '#999' }]}>
          {selectedLabel}
        </Text>
        <Text style={styles.arrow}>{visible ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* The Modal mounts a new native window above the screen */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)} // Handles Android hardware back button
      >
        {/* Invisible full-screen overlay catches outside taps */}
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
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
// MAIN COMPONENT
// ==========================================
const MyPayslip = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [apiMessage, setApiMessage] = useState('');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [payslipResponse, setPayslipResponse] = useState(null);
  const [loading, setLoading] = useState(false); // spinner for fetch
  const [searched, setSearched] = useState(false); // track if user pressed search
  
  // Format arrays into {label, value} format for the NativeDropdown
  const yearList = [2024, 2025, 2026, 2027].map(y => ({ label: y.toString(), value: y }));

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
        setApiMessage('');
      } else {
        setPayslipResponse(null);
        setApiMessage(res.data.message || 'No Payslip found');
      }
    } catch (err) {
      setPayslipResponse(null);
      setApiMessage(
        err?.response?.data?.message ||
          'Unable to fetch payslip. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Payslip</Text>

      {/* FILTER ROW */}
      <View style={styles.filterRow}>
        
        {/* YEAR DROPDOWN */}
        <NativeDropdown
          containerStyle={styles.dropdownWrapper}
          value={year}
          options={yearList}
          onSelect={setYear}
          placeholder="Year"
        />

        {/* MONTH DROPDOWN */}
        <NativeDropdown
          containerStyle={styles.dropdownWrapper}
          value={month}
          options={monthList}
          onSelect={setMonth}
          placeholder="Month"
        />

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
          <Text style={styles.noDataText}>
            {apiMessage || 'No Payslip found'}
          </Text>
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
    alignSelf: 'center', // Replaced static paddingHorizontal for better scaling
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterBtn: {
    backgroundColor: '#6a9689',
    height: 45, // Match dropdown height
    width: 45,  // Make it a perfect square
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ==========================================
  // NATIVE DROPDOWN STYLES
  // ==========================================
  dropdownWrapper: {
    width: '42%',
  },
  dropdownButton: {
    height: 45,
    borderWidth: 1,
    borderColor: '#dcdcdc',
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
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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