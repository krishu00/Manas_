import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable
} from 'react-native';
import Leave from './RequestsComponent.js/Leave';
import NewAssets from './RequestsComponent.js/NewAssets';
import RepairOfAsset from './RequestsComponent.js/RepairOfAsset';
import RequestHrForm from './RequestsComponent.js/RequestHrForm';
import Regularize from './RequestsComponent.js/Regularize';
import CompOff from './RequestsComponent.js/CompOff';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Popup from '../Popup/Popup';

const { height } = Dimensions.get('window');
import { TouchableWithoutFeedback } from 'react-native';

const FilterOptions = ({ onRefresh, showApplyFor = true, showDropdown, setShowDropdown }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });

  const onPopupCloseCallbackRef = useRef(null);

  const showPopup = (title, message, onCloseCallback) => {
    setPopupContent({ title, message });
    setPopupVisible(true);
    if (onCloseCallback) {
      onPopupCloseCallbackRef.current = onCloseCallback;
    }
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    if (onPopupCloseCallbackRef.current) {
      onPopupCloseCallbackRef.current();
      onPopupCloseCallbackRef.current = null;
    }
  };

  const handleOptionPress = option => {
    setShowDropdown(false);
    setSelectedOption(option);
  };

  const closeModal = () => setSelectedOption(null);

  // API call for Regularization
  const handleRegularizationSubmit = async entries => {
    try {
      const payload = {
        regulariseData: entries.map(entry => ({
          punch_in_time: entry.inTime,
          punch_out_time: entry.outTime,
          working_hours: entry.totalHours,
          reason: entry.reason,
          date: entry.date,
        })),
      };

      const response = await apiMiddleware.post(`/request/regularise_attendance`, payload);

      if (response.status === 201) {
        showPopup('Success', 'Regularization request submitted successfully!', () => {
          setTimeout(() => {
            onRefresh?.();
            closeModal();
          }, 500);
        });
      } else {
        showPopup('Error', response?.data?.message || 'Failed to submit request.');
      }
    } catch (error) {
      showPopup('Error', error.response?.data?.message || 'Something went wrong.');
      console.error('❌ Regularization submit error:', error);
    }
  };

  const handleCompOffSubmit = async entries => {
    try {
      if (entries.length === 0) {
        showPopup(true);
        setMessage("Please select at least one date!");
        setTimeout(() => showPopup(false), 3000);
        return;
      }

      const payload = {
        compOffData: entries.map((entry) => ({
          date: entry.date,
          // 🚀 FIX 1: Convert string dayType to numeric value
          dayValue: entry.dayType === "full_day" ? 1 : "half_day" ?0.5 : 0,
          reason: entry.reason ||  "CompOff Request",  //Placeholder reason, can be enhanced to take user input
        })),
        // We will add the reason in the backend loop
        //reason: entries[0].reason, // Assuming a reason field is added to state/entries later
      };

       const response = await apiMiddleware.post(`/request/apply-compOff`, payload,);
       

      if (response.status === 201) {
        showPopup('Success', 'Apply CompOff request submitted successfully!', () => {
          setTimeout(() => {
            onRefresh?.();
            closeModal();
          }, 500);
        });
      } else {
        showPopup('Error', response?.data?.message || 'Failed to submit request.');
      }
    } catch (error) {
      showPopup('Error', error.response?.data?.message || 'Something went wrong.');
      console.error('❌ CompOff Submit error:', error);
    }
  };
  
  return (
    
    <View style={styles.container} pointerEvents="box-none">
      {/* Dropdown Options */}
      {showDropdown && (
        // Overlay to catch taps outside dropdown
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.overlay}>
            <View style={styles.dropdown}>
              {['Leave', 'New Assets', 'Repair Of Asset', 'Request To Hr', 'Regularize' , "CompOff"].map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.option}
                  onPress={() => handleOptionPress(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Menu Button */}
      {showApplyFor && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowDropdown(prev => !prev)}
        >
          <Text style={styles.menuButtonText}>Apply For › </Text>
        </TouchableOpacity>
      )}

      {/* Modal for Forms */}
      <Modal visible={!!selectedOption} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Apply for {selectedOption}</Text>

            {selectedOption === 'Leave' && <Leave onSuccess={() => { onRefresh?.(); closeModal(); }} />}
            {selectedOption === 'New Assets' && <NewAssets onSuccess={() => { onRefresh?.(); closeModal(); }} />}
            {selectedOption === 'Repair Of Asset' && <RepairOfAsset onSuccess={() => { onRefresh?.(); closeModal(); }} />}
            {selectedOption === 'Request To Hr' && <RequestHrForm onSuccess={() => { onRefresh?.(); closeModal(); }} />}
            {selectedOption === 'Regularize' && <Regularize onSubmit={handleRegularizationSubmit} />}
            {selectedOption === 'CompOff' && <CompOff onSubmit={handleCompOffSubmit} />}
          </View>
        </View>
      </Modal>

      {popupVisible && (
        <Popup title={popupContent.title} message={popupContent.message} onClose={handlePopupClose} />
      )}
    </View>
   
  );
};

export default FilterOptions;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 1,
    width: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  menuButton: {
    backgroundColor: '#6a9689',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  menuButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdown: {
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 5,
    width: 200,
    alignItems: 'center',
    elevation: 5,
  },
  option: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  optionText: { fontSize: 16, color: '#333' },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000090',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#eaf6ef',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#0e120ec6',
  },
  closeIcon: { position: 'absolute', right: 15, top: 15, zIndex: 10 },
  closeText: { fontSize: 22, color: '#333' },
});
