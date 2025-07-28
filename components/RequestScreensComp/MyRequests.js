import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await apiMiddleware.get(
        '/request/get_all_requested_by_me',
      );
      console.log("response," ,response);
      
      const data = response.data?.data || [];
      setApprovals(data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      Alert.alert('Error', 'Failed to fetch approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.sn]}>S.No</Text>
      <Text style={[styles.cell, styles.name]}>Requestor Name</Text>
      <Text style={[styles.cell, styles.type]}>Request Type</Text>
      <Text style={[styles.cell, styles.date]}>Applied On</Text>
      <Text style={[styles.cell, styles.status]}>Status</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isEvenRow = index % 2 === 0;
    const appliedDate = item.raised_on
      ? new Date(item.raised_on).toLocaleDateString()
      : 'N/A';

    return (
      <View
        style={[
          styles.row,
          { backgroundColor: isEvenRow ? '#ffffff' : '#f4f4f4' },
        ]}
      >
        <Text
          style={[styles.cell, styles.sn]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {index + 1}
        </Text>
        <Text
          style={[styles.cell, styles.name]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.requestor_name}
        </Text>
        <Text
          style={[styles.cell, styles.type, { color: '#d9534f' }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.request_type}
        </Text>
        <Text
          style={[styles.cell, styles.date]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {appliedDate}
        </Text>
        <Text
          style={[
            styles.cell,
            styles.status,
            item.completed_or_not ? styles.approved : styles.pending,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.completed_or_not ? 'Approved' : 'Pending'}
        </Text>
      </View>
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
            />
          </View>
        </ScrollView>
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
  },
  sn: {
    width: 40,
  },
  name: {
    width: 110,
  },
  type: {
    width: 80,
  },
  date: {
    width: 80,
  },
  status: {
    width: 70,
    fontWeight: 'bold',
  },
  approved: {
    color: '#4CAF50',
  },
  pending: {
    color: '#FF9800',
  },
});

export default Approvals;
