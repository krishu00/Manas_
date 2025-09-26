import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import DetailsSection from './DetailsSection';

const UserDetailsScreen = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveTemplates, setLeaveTemplates] = useState([]);
  const [leaveTemplatesName, setLeaveTemplatesName] = useState([]);
  useEffect(() => {
    const fetchLeaveTemplates = async () => {
      try {
        const response = await apiMiddleware.get(
          `/leave_template/get_all_leave_templates`,
        );
        console.log('response ???????', response);

        setLeaveTemplates(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching leave templates:', error);
      }
    };

    fetchLeaveTemplates();
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await apiMiddleware.get(`/company/employee-details`, {
          withCredentials: true,
        });
        setLeaveTemplatesName(
          response.data.data.official_details?.leave_template,
        );
        console.log('response: ', response.data.data);
        setEmployeeData(response.data.data);
      } catch (err) {
        setError('Failed to fetch employee data.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  console.log('leaveTemplates', leaveTemplates);

  const leaveTemplateName =
    leaveTemplates.find(template => template._id === leaveTemplatesName)
      ?.name || '-';

  const {
    employee_details,
    personal_details,
    current_address,
    permanent_address,
    official_details,
    insurance_details,
    account_details,
    employee_id,
  } = employeeData || {};

  return (
    <ScrollView style={styles.container}>
      {/* Employee Details */}
      <DetailsSection
        title="👤 Employee Details"
        fields={[
          { label: 'Name', value: employee_details?.name, required: true },
          { label: 'Gender', value: employee_details?.gender, required: true },
          {
            label: 'Contact',
            value: employee_details?.contact,
            required: true,
          },
          {
            label: 'Official Email',
            value: employee_details?.email,
            required: true,
          },
          { label: 'Employee Id', value: employee_id, required: true },
        ]}
      />

      {/* Personal Details */}
      <DetailsSection
        title="📌 Personal Details"
        fields={[
          { label: 'PAN', value: personal_details?.pan },
          { label: 'Aadhar', value: personal_details?.aadharcard },
          { label: 'Personal Email', value: personal_details?.personal_email },
          {
            label: 'DOB',
            value: personal_details?.date_of_birth
              ? new Date(personal_details.date_of_birth).toDateString()
              : '-',
          },
        ]}
      />

      {/* Current Address */}
      <DetailsSection
        title="🏠 Current Address"
        fields={[
          { label: 'Address Line 1', value: current_address?.address_line_1 },
          { label: 'Address Line 2', value: current_address?.address_line_2 },
          { label: 'City', value: current_address?.city },
          { label: 'State', value: current_address?.state },
          { label: 'Pincode', value: current_address?.pin_code },
          { label: 'Landmark', value: current_address?.landmark },
        ]}
      />

      {/* Permanent Address */}
      <DetailsSection
        title="🏡 Permanent Address"
        fields={[
          { label: 'Address Line 1', value: permanent_address?.address_line_1 },
          { label: 'Address Line 2', value: permanent_address?.address_line_2 },
          { label: 'City', value: permanent_address?.city },
          { label: 'State', value: permanent_address?.state },
          { label: 'Pincode', value: permanent_address?.pin_code },
          { label: 'Landmark', value: permanent_address?.landmark },
        ]}
      />

      {/* Official Details */}
      <DetailsSection
        title="💼 Official Details"
        fields={[
          { label: 'Role', value: official_details?.role },
          { label: 'Designation', value: official_details?.designation },
          { label: 'Department', value: official_details?.department },
          { label: 'Manager', value: official_details?.reporting_manager },
          { label: 'Status', value: official_details?.employee_status },
          { label: 'Leave Template', value: leaveTemplateName || ' ' },
        ]}
      />

      {/* Insurance Details */}
      <DetailsSection
        title="🛡 Insurance Details"
        fields={[
          { label: 'Number', value: insurance_details?.insurance_number },
          { label: 'Company', value: insurance_details?.insurance_company },
          {
            label: 'Start',
            value: insurance_details?.ins_start_date
              ? new Date(insurance_details.ins_start_date).toDateString()
              : '-',
          },
          {
            label: 'End',
            value: insurance_details?.ins_end_date
              ? new Date(insurance_details.ins_end_date).toDateString()
              : '-',
          },
        ]}
      />

      {/* Account Details */}
      <DetailsSection
        title="🏦 Account Details"
        fields={[
          { label: 'Bank', value: account_details?.bank_details?.bank_name },
          {
            label: 'Acc No',
            value: account_details?.bank_details?.account_number,
          },
          { label: 'IFSC', value: account_details?.bank_details?.ifsc_code },
          {
            label: 'Branch',
            value: account_details?.bank_details?.branch_name,
          },
          { label: 'ESI No', value: account_details?.esi_number },
          { label: 'PF No', value: account_details?.pf_number },
        ]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default UserDetailsScreen;
