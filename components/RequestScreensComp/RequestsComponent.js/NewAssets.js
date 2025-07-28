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
import Popup from '../../Popup/Popup'; // Import your Popup component

const NewAssets = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    assetType: '',
    reason: '',
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: '',
    message: '',
  });

  const onPopupCloseCallbackRef = useRef(null); // ✅ fix: useRef instead of let

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
    const { assetType, reason } = formData;

    if (!assetType || !reason) {
      showPopup('Validation Error', 'Please fill in all fields.');
      return;
    }

    const payload = {
      asset_type: assetType,
      reason: reason.trim(),
    };

    try {
      const response = await apiMiddleware.post('/request/new_asset', payload);

      if (response?.status === 201) {
        setFormData({ assetType: '', reason: '' });
        showPopup('Success', 'Asset request submitted successfully!', () => {
          setTimeout(() => {
            onSuccess?.(); // ✅ This will now correctly close the modal
          }, 500);
        });
      } else {
        showPopup('Error', response?.data?.message || 'Failed to submit request.');
      }
    } catch (error) {
      console.error('❌ Submit error:', error.response?.data || error.message);
      showPopup('Error', error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Asset Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter asset type"
          value={formData.assetType}
          onChangeText={text => handleInputChange('assetType', text)}
        />

        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the reason"
          multiline
          numberOfLines={4}
          value={formData.reason}
          onChangeText={text => handleInputChange('reason', text)}
        />

        <View style={styles.submitButton}>
          <Button title="Submit" onPress={handleSubmit} color="#6a9689" />
        </View>
      </ScrollView>

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
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f9f6',
    flexGrow: 1,
    justifyContent: 'center',
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

export default NewAssets;
