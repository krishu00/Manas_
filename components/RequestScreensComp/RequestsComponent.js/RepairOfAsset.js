import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { apiMiddleware } from '../../../src/apiMiddleware/apiMiddleware';
// import { useAuth } from '../../context/AuthContext'; // Adjust as needed

const RepairOfAsset = ({ navigation }) => {
  const [formData, setFormData] = useState({
    selectedAsset: '',
    issueDescription: '',
  });

  const [loading, setLoading] = useState(false); // ✅ Moved inside component

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { selectedAsset, issueDescription } = formData;

    if (!selectedAsset || !issueDescription) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    if (loading) return;

    setLoading(true);

    const payload = {
      selected_asset: selectedAsset.trim(),
      issue_description: issueDescription.trim(),
    };

    try {
      const response = await apiMiddleware.post('/request/repair_asset', payload);

      if (response?.status === 201 || response?.data?.success) {
        Alert.alert('Success', 'Repair request submitted successfully!');
        setFormData({ selectedAsset: '', issueDescription: '' });
      } else {
        Alert.alert('Error', response?.data?.message || 'Submission failed.');
      }
    } catch (error) {
      console.error('❌ Submit error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
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
          title={loading ? 'Submitting...' : 'Submit'}
          onPress={handleSubmit}
          color="#6a9689"
          disabled={loading}
        />
      </View>
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
