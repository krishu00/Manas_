import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Popup from '../Popup/Popup';

const RequestTemplate = ({
  visible,
  appliedData,
  onClose,
  refreshData,
  MyRequest,
}) => {
  const [remark, setRemark] = useState('');
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });
  const onPopupCloseCallbackRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const requestType = appliedData?.request_type;
  const isLeaveConsumption = requestType === 'Leave';
  const isCompOff = requestType === 'CompOff';
  const isApplyCompOff = requestType === 'apply_CompOff';
  const isRegularization = requestType === 'Regularise Attendance';
  const sectionTitle = MyRequest;

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

  if (!appliedData) return null;

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        if (!appliedData?.requestor_id) return;
        const response = await apiMiddleware.get(
          `/leaves-balance/get-leaves-balance?employeeId=${appliedData.requestor_id}`,
        );

        if (response.data?.data) {
          setLeaveBalance(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching leave balance:', error);
        showPopup(
          'Error',
          error?.response?.data?.message || 'Something went wrong.',
        );
      }
    };

    if (visible) {
      fetchLeaveBalance();
    }
  }, [visible, appliedData?.requestor_id]);

  const handleAction = async action => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (!remark.trim()) {
        showPopup('Validation', 'Please enter a remark before proceeding.');
        return;
      }

      const encrypt_id = appliedData?.encrypt_id;

      if (!encrypt_id) {
        showPopup('Error', 'Invalid request data.');
        return;
      }

      await apiMiddleware.put(
        `/approve-or-reject/${encrypt_id}`,
        {
          action,
          remarks_message: remark,
        },
        { withCredentials: true },
      );

      showPopup('Success', `Request ${action}d successfully!`, () => {
        refreshData?.();
        onClose();
      });
    } catch (error) {
      showPopup(
        'Error',
        `Failed to ${action} request: ${
          error.response?.data?.message || 'Unknown error'
        }`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>
            {appliedData.leave_type ?? appliedData.request_type}
          </Text>

          {/* 1. SCROLLABLE CONTENT AREA */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={true}
          >
            {/* Requestor Info */}
            <View style={styles.rowBetween}>
              <Text style={styles.userText}>
                {appliedData.requestor_name} ({appliedData.requestor_id})
              </Text>
              <Text
                style={[
                  styles.status,
                  appliedData.completed_or_not
                    ? styles.approved
                    : styles.pending,
                ]}
              >
                <Text style={styles.statusHeading}>Status: </Text>
                {appliedData.completed_or_not ? 'Approved' : 'Pending'}
              </Text>
            </View>

            {/* Leave Balance Section */}
            <Text style={styles.subTitle}>Leave Balance</Text>
            {leaveBalance?.leaveDetails?.length > 0 ? (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Type</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Closing Balance
                  </Text>
                </View>
                {leaveBalance.leaveDetails.map((leave, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {leave.leaveTypeName} (
                      {leave.leaveTypeId?.abbreviation || '-'})
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {leave.closingBalance}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.value}>No leave balance available.</Text>
            )}

            {/* Applied Dates - Standard Leaves */}
            <Text style={styles.subTitle}>Applied Dates</Text>
            {!isCompOff && !isRegularization && !isApplyCompOff && (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Applied Date
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Start Date
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>End Date</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Leave Type
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {appliedData.raised_on
                      ? new Date(appliedData.raised_on).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {appliedData.start_date
                      ? new Date(appliedData.start_date).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {appliedData.end_date
                      ? new Date(appliedData.end_date).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {appliedData.request_type}
                  </Text>
                </View>
                <Text style={styles.label}>Reason</Text>
                <Text style={styles.reasonBox}>
                  {appliedData.reason || 'N/A'}
                </Text>
              </View>
            )}

            {/* CompOff Data */}
            {isCompOff && appliedData?.compOffData?.length > 0 && (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Date</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Credit Value
                  </Text>
                  {appliedData.compOffData.some(d => d.claimed_amount > 0) && (
                    <Text style={[styles.tableCell, { flex: 1 }]}>Claimed</Text>
                  )}
                </View>
                {appliedData.compOffData.map(compOff => (
                  <View key={compOff.id || compOff._id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {new Date(compOff.date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {compOff.dayValue || compOff.dayType || 'N/A'}
                    </Text>
                    {appliedData.compOffData.some(
                      d => d.claimed_amount > 0,
                    ) && (
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {compOff.claimed_amount ?? 0}
                      </Text>
                    )}
                  </View>
                ))}
                <Text style={styles.label}>Reason</Text>
                <Text style={styles.reasonBox}>
                  {appliedData.reason || 'N/A'}
                </Text>
              </View>
            )}

            {/* Apply CompOff Data */}
            {isApplyCompOff && appliedData?.compOffData?.length > 0 && (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Date</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Credit Value
                  </Text>
                  {appliedData.compOffData.some(d => d.claimed_amount > 0) && (
                    <Text style={[styles.tableCell, { flex: 1 }]}>Claimed</Text>
                  )}
                </View>
                {appliedData.compOffData.map(compOff => (
                  <View
                    key={compOff.id || compOff._id}
                    style={{ flexDirection: 'column', flex: 1 }}
                  >
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {new Date(compOff.date).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {compOff.dayValue || compOff.dayType || 'N/A'}
                      </Text>
                      {appliedData.compOffData.some(
                        d => d.claimed_amount > 0,
                      ) && (
                        <Text style={[styles.tableCell, { flex: 1 }]}>
                          {compOff.claimed_amount ?? 0}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.label}>
                      Reason: {compOff.reason || 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Regularization Data */}
            {isRegularization && appliedData?.regulariseData?.length > 0 && (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Applied On
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    Submitted On
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0, width: 40 }]}>
                    In/
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0, width: 40 }]}>
                    Out
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>Hrs</Text>
                </View>

                {appliedData.regulariseData.map(item => (
                  <View
                    key={item.id || item._id}
                    style={{ flexDirection: 'column', flex: 1 }}
                  >
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {new Date(appliedData.raised_on).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 0, width: 40 }]}>
                        {item.punch_in_time || 'N/A'}/
                      </Text>
                      <Text style={[styles.tableCell, { flex: 0, width: 40 }]}>
                        {item.punch_out_time || 'N/A'}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {item.working_hours || 'N/A'}
                      </Text>
                    </View>
                    <Text style={styles.labe}>
                      Reason: {item.reason || 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Remark Input (Only show if pending and not viewing 'MyRequest') */}
            {!sectionTitle && !appliedData.completed_or_not && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Remark</Text>
                <TextInput
                  placeholder="Enter your remark"
                  style={styles.input}
                  value={remark}
                  onChangeText={setRemark}
                />
              </View>
            )}
          </ScrollView>

          {/* 2. FIXED FOOTER AREA (Only show buttons if pending and not viewing 'MyRequest') */}
          {!sectionTitle && !appliedData.completed_or_not && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.approveBtn, submitting && { opacity: 0.6 }]}
                onPress={() => handleAction('approve')}
                disabled={submitting}
              >
                <Text style={styles.btnText}>
                  {submitting ? 'Processing...' : 'Approve'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rejectBtn, submitting && { opacity: 0.6 }]}
                onPress={() => handleAction('reject')}
                disabled={submitting}
              >
                <Text style={styles.btnText}>
                  {submitting ? 'Processing...' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>

      {/* Global Popup */}
      {popupVisible && (
        <Modal transparent animationType="fade" visible={popupVisible}>
          <View style={styles.popupOverlay}>
            <Popup
              title={popupContent.title}
              message={popupContent.message}
              onClose={handlePopupClose}
            />
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '85%', // Ensures modal never overflows the screen
    overflow: 'hidden', // Keeps children inside the rounded box
  },
  scrollArea: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e6b4e',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0e120ecf',
  },
  status: {
    fontWeight: 'bold',
  },
  statusHeading: {
    color: '#0e120ecf',
    fontSize: 12,
  },
  approved: {
    color: '#4CAF50',
  },
  pending: {
    color: '#FF9800',
  },
  value: {
    fontSize: 13,
    marginBottom: 10,
  },
  subTitle: {
    fontWeight: 'bold',
    marginVertical: 8,
    fontSize: 15,
    color: '#2e6b4e',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dbead7',
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
  },
  tableCell: {
    textAlign: 'center',
    fontSize: 12,
    color: '#0e120ef0',
  },
  label: {
    color: '#0e120eb5',
    fontWeight: '500',
  },
  labe: {
    fontSize: 12,
    color: '#474a47f0',
    marginVertical: 4,
  },
  reasonBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 13,
    color: '#0e120ef0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    marginBottom: 10,
    color: '#0e120ef0',
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#5ba35dae',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#d03a35cf',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 24,
  },
});

export default RequestTemplate;
