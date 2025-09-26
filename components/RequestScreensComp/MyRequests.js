import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Popup from '../Popup/Popup';

const MyRequests = ({ refreshFlag, setRefreshFlag }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await apiMiddleware.get('/request/get_all_requested_by_me');
      const data = response.data?.data || [];
      setApprovals(data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setPopupMessage('Failed to fetch approvals. Please try again.');
      setPopupVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    if (typeof setRefreshFlag === 'function') {
      setRefreshFlag(false);
    }
  }, [refreshFlag]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApprovals();
  }, []);

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.sn]}>S.No</Text>
      <Text style={[styles.cell, styles.type]}>Request Type</Text>
      <Text style={[styles.cell, styles.date]}>Applied On</Text>
      <Text style={[styles.cell, styles.status]}>Status</Text>
      <Text style={[styles.cell, styles.date]}>Start Date</Text>
      <Text style={[styles.cell, styles.date]}>End Date</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isEvenRow = index % 2 === 0;
    const appliedDate = item.raised_on ? new Date(item.raised_on).toLocaleDateString() : '--/--';
    const startDate = item.start_date ? new Date(item.start_date).toLocaleDateString() : '--/--';
    const endDate = item.end_date ? new Date(item.end_date).toLocaleDateString() : '--/--';

    return (
      <View style={[styles.row, { backgroundColor: isEvenRow ? '#ffffff' : '#f4f4f4' }]}>
        <Text style={[styles.cell, styles.sn]}>{index + 1}</Text>
        <Text style={[styles.cell, styles.type, { color: '#d9534f' }]}>{item.request_type}</Text>
        <Text style={[styles.cell, styles.date]}>{appliedDate}</Text>
        <Text
          style={[
            styles.cell,
            styles.status,
            item.completed_or_not ? styles.approved : styles.pending,
          ]}
        >
          {item.completed_or_not ? 'Approved' : 'Pending'}
        </Text>
        <Text style={[styles.cell, styles.date]}>{startDate}</Text>
        <Text style={[styles.cell, styles.date]}>{endDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6a9689" />
      ) : approvals.length === 0 ? (
        <Text style={styles.emptyText}>No Requests Found</Text>
      ) : (
        // ✅ Horizontal scroll only for table layout
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

      {popupVisible && (
        <Popup
          title="Error"
          message={popupMessage}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#dbead7',
  },
  cell: {
    fontSize: 12,
    paddingHorizontal: 4,
    textAlign: 'center',
    color: '#050505ff',
  },
  sn: {
    width: 40,
    fontWeight: '500',
  },
  type: {
    width: 100,
    fontWeight: '500',
    textAlign: 'left',
  },
  date: {
    width: 80,
    fontWeight: '500',
  },
  status: {
    width: 70,
    fontWeight: '500',
  },
  approved: {
    color: '#4CAF50',
  },
  pending: {
    color: '#FF9800',
  },
});

export default MyRequests;
