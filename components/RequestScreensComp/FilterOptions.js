import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import Leave from './RequestsComponent.js/Leave';
import NewAssets from './RequestsComponent.js/NewAssets';
import RepairOfAsset from './RequestsComponent.js/RepairOfAsset';
import RequestHrForm from './RequestsComponent.js/RequestHrForm';
import Regularize from './RequestsComponent.js/Regularize';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';

const { height } = Dimensions.get('window');

const FilterOptions = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionPress = option => {
    setShowDropdown(false);
    setSelectedOption(option); // this opens modal
  };

  const closeModal = () => {
    setSelectedOption(null);
  };

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
      console.log('payload', payload);

      const response = await apiMiddleware.post(
        `/request/regularise_attendance`,
        payload,
      );
      console.log('response ', response);

      if (response.status === 201) {
        alert('Regularization request submitted successfully!');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit regularization data.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Options */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {[
            'Leave',
            'New Assets',
            'Repair Of Asset',
            'Request To Hr',
            'WFH',
            'Regularize',
          ].map(option => (
            <TouchableOpacity
              key={option}
              style={styles.option}
              onPress={() => handleOptionPress(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.menuButtonText}>Apply For</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={!!selectedOption} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Apply for {selectedOption}</Text>

            {/* Example form for Leave */}
            {selectedOption === 'Leave' && (
              <>
                <Leave />
                {/* <TextInput placeholder="Category of leave" style={styles.input} />
                <TextInput placeholder="Start date" style={styles.input} />
                <TextInput placeholder="End date" style={styles.input} />
                <TextInput
                  placeholder="Reason for Leave"
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { height: 80 }]}
                />
                <TouchableOpacity style={styles.submitButton}>
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity> */}
              </>
            )}
            {selectedOption === 'New Assets' && (
              <>
                <NewAssets   onSuccess={closeModal}/>
              </>
            )}
            {selectedOption === 'Repair Of Asset' && (
              <>
                <RepairOfAsset />
              </>
            )}
            {selectedOption === 'Request To Hr' && (
              <>
                <RequestHrForm onSuccess={closeModal} />
              </>
            )}
            {selectedOption === 'Regularize' && (
              <>
                <Regularize onSubmit={handleRegularizationSubmit} />
              </>
            )}

            {/* You can add similar forms for HR, WFH later */}
          </View>
        </View>
      </Modal>
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
    // alignItems: 'center',
    textAlign: 'center',
    zIndex: 1,
  },
  menuButton: {
    backgroundColor: '#6a9689',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  menuButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 5,
    width: 200,
    alignItems: 'center',
    elevation: 5,
  },
  option: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
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
  },
  closeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
  },
  closeText: {
    fontSize: 22,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#6a9689',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
