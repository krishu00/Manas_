import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailsSection = ({ title, fields }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.fieldsContainer}>
        {fields.map((field, index) => (
          <View key={index} style={styles.fieldRow}>
            <Text style={styles.label}>
              {field.label} {field.required}
            </Text>
            <Text style={styles.value}>{field.value || '-'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#f8fff8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#222',
  },
  fieldsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    textAlign: 'right',
  },
});

export default DetailsSection;
