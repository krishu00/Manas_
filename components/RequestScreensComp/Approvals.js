import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import RequestTemplate from '../RequestScreensComp/RequestTemplate';
import Popup from '../Popup/Popup';

const Approvals = ({ refreshFlag, setRefreshFlag, requestType, requestStatus }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [errorPopup, setErrorPopup] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // ✅ pull-to-refresh state

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await apiMiddleware.get('/request/get_requested_to_me');
      let data = response.data?.data || [];

      // Apply filters
      if (requestType && requestType !== 'All Requests') {
        data = data.filter(item => item.request_type === requestType);
      }
      if (requestStatus && requestStatus !== 'All status') {
        data = data.filter(item =>
          requestStatus === 'Approved' ? item.completed_or_not : !item.completed_or_not,
        );
      }

      setApprovals(data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setErrorPopup({
        title: 'Error',
        message: 'Failed to fetch approvals. Please try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false); // ✅ stop refresh loader
    }
  };

  useEffect(() => {
    fetchApprovals();
    if (typeof setRefreshFlag === 'function') setRefreshFlag(false);
  }, [refreshFlag]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApprovals();
  }, []);

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.sn]}>S.No</Text>
      <Text style={[styles.cell, styles.name]}>Raised By</Text>
      <Text style={[styles.cell, styles.type]}>Request Type</Text>
      <Text style={[styles.cell, styles.date]}>Applied On</Text>
      <Text style={[styles.cell, styles.status]}>Status</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isEvenRow = index % 2 === 0;
    const appliedDate = item.raised_on ? new Date(item.raised_on).toLocaleDateString() : 'N/A';

    return (
      <TouchableOpacity onPress={() => setSelectedRequest(item)}>
        <View style={[styles.row, { backgroundColor: isEvenRow ? '#ffffff' : '#f4f4f4' }]}>
          <Text style={[styles.cell, styles.sn]}>{index + 1}</Text>
          <Text style={[styles.cell, styles.name]} numberOfLines={1}>{item.requestor_name}</Text>
          <Text style={[styles.cell, styles.type, { color: '#d9534f' }]} numberOfLines={1}>
            {item.request_type}
          </Text>
          <Text style={[styles.cell, styles.date]} numberOfLines={1}>{appliedDate}</Text>
          <Text style={[styles.cell, styles.status, item.completed_or_not ? styles.approved : styles.pending]}>
            {item.completed_or_not ? 'Approved' : 'Pending'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6a9689" />
      ) : approvals.length === 0 ? (
        <Text style={styles.emptyText}>No Approvals Found</Text>
      ) : (
        <ScrollView horizontal>
          <View>
            {renderHeader()}
            <FlatList
              data={[...approvals].reverse()}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#6a9689']}
                />
              }
            />
          </View>
        </ScrollView>
      )}

      {selectedRequest && (
        <RequestTemplate
          visible={!!selectedRequest}
          appliedData={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          refreshData={fetchApprovals}
        />
      )}

      {errorPopup && (
        <Popup
          title={errorPopup.title}
          message={errorPopup.message}
          onClose={() => setErrorPopup(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 12 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#888' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e1e1e1', paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  headerRow: { backgroundColor: '#dbead7' },
  cell: { fontSize: 12, paddingHorizontal: 4, textAlign: 'center', color: '#050505ff' },
  sn: { width: 40, fontWeight: '500' },
  name: { width: 100, fontWeight: '500' },
  type: { width: 90, fontWeight: '500' },
  date: { width: 75, fontWeight: '500' },
  status: { width: 70, fontWeight: '500' },
  approved: { color: '#4CAF50' },
  pending: { color: '#FF9800' },
});

export default Approvals;
