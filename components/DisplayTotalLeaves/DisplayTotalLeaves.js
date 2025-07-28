import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import { capitalizeWords } from '../../src/utils/utils';
const DisplayTotalLeaves = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => setIsModalVisible(!isModalVisible);

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
  }, []);

  const totalBalance = leaveDetails.reduce(
    (sum, leave) => sum + (leave.closingBalance || 0),
    0,
  );

  return (
    <View style={styles.container}>
      {/* Main Touchable Summary */}
      <TouchableOpacity style={styles.section} onPress={toggleModal}>
        <Text style={styles.sectionTitle}>Leaves</Text>
        <Text style={styles.sectionValue}>{totalBalance}</Text>
        <Text style={styles.sectionDetails}>Tap to view details</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#6a9689" />
            ) : (
              <>
                {leaveDetails.map((leave, index) => (
                  <View key={index} style={styles.leaveBox}>
                    <Text style={styles.leaveTitle}>
                      {capitalizeWords(leave.leaveTypeName || 'N/A')}
                    </Text>
                    <Text style={styles.leaveValue}>
                      {leave.closingBalance ?? 0}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.punchButton}
                  onPress={toggleModal}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DisplayTotalLeaves;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  section: {
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4062',
    marginBottom: 10,
  },
  sectionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a9689', // Light green color for the number
    marginBottom: 10,
  },
  sectionDetails: {
    fontSize: 14,
    color: '#6a9689',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  punchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a8d7c5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveBox: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
  },
  leaveTitle: {
    width: '50%',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1f4062',
  },
  leaveValue: {
    width: '50%',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a9689',
    textAlign: 'center',
  },
});
