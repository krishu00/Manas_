import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
import Popup from '../../Popup/Popup';

const RequestHrForm = ({ onSuccess, companyCode, employeeId }) => {
  const [requestHrData, setRequestHrData] = useState({
    subject: '',
    reason: '',
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const onPopupCloseCallbackRef = useRef(null);

  const handleInputChange = (field, value) => {
    setRequestHrData(prev => ({
      ...prev,
      [field]: value,
    }));
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

    const { subject, reason } = requestHrData;

    if (!subject || !reason) {
      showPopup('Validation Error', 'Please fill all fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      ...requestHrData,
      company_code: companyCode,
      employee_id: employeeId,
    };

    try {
      setLoading(true);
      const response = await apiMiddleware.post(
        '/request/request_to_hr',
        payload,
      );
      console.log('RESPONSE', response);

      if (response.status === 201 || response.data?.success) {
        setRequestHrData({ subject: '', reason: '' });
        showPopup('Success', 'Request to HR submitted successfully!', () => {
          setTimeout(() => {
            onSuccess?.();
          }, 300);
        });
      } else {
        showPopup('Error', response.data?.message || 'Request failed.');
      }
    } catch (error) {
      console.error('❌ API Error:', error?.response || error.message);
      showPopup(
        'Error',
        error?.response?.data?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter subject"
          value={requestHrData.subject}
          onChangeText={text => handleInputChange('subject', text)}
          editable={!loading}
        />

        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the reason"
          value={requestHrData.reason}
          onChangeText={text => handleInputChange('reason', text)}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <View style={styles.submitButton}>
          {loading ? (
            <ActivityIndicator size="small" color="#6a9689" />
          ) : (
            <Button
              title={loading ? 'Submitting...' : 'Submit'}
              onPress={handleSubmit}
              color="#6a9689"
              disabled={loading || submitting}
            />
          )}
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

export default RequestHrForm;
