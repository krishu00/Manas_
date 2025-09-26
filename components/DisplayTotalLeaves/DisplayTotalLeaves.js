import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import { capitalizeWords } from '../../src/utils/utils';

const DisplayTotalLeaves = ({refreshFlag}) => {
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        setLoading(true);
        const response = await apiMiddleware.get(
          `/leaves-balance/get-leaves-balance`,
        );
        if (response.data?.data?.leaveDetails) {
          setLeaveDetails(response.data.data.leaveDetails);
        }
      } catch (error) {
        console.error('Error fetching leave balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, [refreshFlag]);

  const totalBalance = leaveDetails.reduce(
    (sum, leave) => sum + (leave.closingBalance || 0),
    0,
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaves</Text>
        <Text style={styles.sectionValue}>{totalBalance}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6a9689" />
        ) : (
          <>
            {leaveDetails.map((leave, index) => (
              <View key={index} style={styles.leaveRow}>
                <Text style={styles.leaveType}>
                  {capitalizeWords(leave.leaveTypeName || 'N/A', ':') + ':'}
                </Text>
                <Text style={styles.leaveValue}>
                  {leave.closingBalance ?? 0}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
};

export default DisplayTotalLeaves;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4062',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a9689',
    marginBottom: 10,
    textAlign: 'center',
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  leaveType: {
    fontSize: 14,
    color: '#6a9689',
  },
  leaveValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a9689',
  },
  sectionDetails: {
    fontSize: 14,
    color: '#6a9689',
 },
});
