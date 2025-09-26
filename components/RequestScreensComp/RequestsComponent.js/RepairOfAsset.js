import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
import Popup from '../../Popup/Popup';

const RepairOfAsset = ({ navigation, onSuccess }) => {
  const [formData, setFormData] = useState({
    selectedAsset: '',
    issueDescription: '',
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });
  const onPopupCloseCallbackRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const { selectedAsset, issueDescription } = formData;

    if (!selectedAsset || !issueDescription) {
      showPopup('Validation Error', 'Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      selected_asset: selectedAsset.trim(),
      issue_description: issueDescription.trim(),
    };

    try {
      const response = await apiMiddleware.post(
        '/request/repair_asset',
        payload,
      );

      if (response?.status === 201 || response?.data?.success) {
        setFormData({ selectedAsset: '', issueDescription: '' });
        showPopup('Success', 'Repair request submitted successfully!', () => {
          onSuccess?.();
        });
      } else {
        showPopup(
          'Error',
          response?.data?.message || 'Failed to submit request.',
        );
      }
    } catch (error) {
      console.error('❌ Submit error:', error.response?.data || error.message);
      showPopup(
        'Error',
        error.response?.data?.message || 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Asset Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter asset name"
        value={formData.selectedAsset}
        onChangeText={text => handleInputChange('selectedAsset', text)}
      />

      <Text style={styles.label}>Describe the Issue</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue"
        multiline
        numberOfLines={4}
        value={formData.issueDescription}
        onChangeText={text => handleInputChange('issueDescription', text)}
      />

      <View style={styles.submitButton}>
        <Button
          title={submitting ? 'Submitting...' : 'Submit'}
          onPress={handleSubmit}
          color="#6a9689"
          disabled={submitting}
        />
      </View>

      {popupVisible && (
        <Popup
          title={popupContent.title}
          message={popupContent.message}
          onClose={handlePopupClose}
        />
      )}
    </ScrollView>
  );
};

export default RepairOfAsset;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eaf6ef',
    borderRadius: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
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
    marginBottom: 15,
    color: '#0e120ef0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
