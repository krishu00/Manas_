export const isNotNull = data => {
  return data !== '' && data !== '' && data !== undefined;
};
    

 export const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get leave type abbreviation
export const getLeaveTypeAbbreviation = (leaveType) => {
  const abbreviations = {
    'Annual Leave': 'A/L',
    'Sick Leave': 'S/L',
    'Casual Leave': 'C/L',
    'Maternity Leave': 'M/L',
    'Paternity Leave': 'P/L',
    'Comp Off': 'C/OA',
    'CompOff': 'C/O',
  };
  return abbreviations[leaveType] || leaveType;
};

// Get request type display label with abbreviation
export const getRequestTypeLabel = (request) => {
  const { request_type, leave_type } = request;
  
  if (request_type === 'Leave' && leave_type) {
    return `${getLeaveTypeAbbreviation(leave_type)}`;
  } else if (request_type === 'CompOff' || request_type === 'apply_CompOff') {
    return 'C/O';
  } else if (request_type === 'Regularise Attendance') {
    return 'R/A';
  }
  return request_type;
};

// Get request type full name for display
export const getRequestTypeFullName = (request) => {
  const { request_type, leave_type } = request;
  
  if (request_type === 'Leave' && leave_type) {
    return `${leave_type}`;
  } else if (request_type === 'CompOff' || request_type === 'apply_CompOff') {
    return 'Comp Off';
  } else if (request_type === 'Regularise Attendance') {
    return 'Regularise Attendance';
  }
  return request_type;
};