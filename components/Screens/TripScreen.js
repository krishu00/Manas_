import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Touchable,
  TouchableWithoutFeedback,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
//import MapView, { Marker } from 'react-native-maps';
//import Geolocation from 'react-native-geolocation-service';
import { Alert } from 'react-native';
import { Linking} from 'react-native';


/**
 * Dummy trip data (current month)
 * Replace later with API response
 */
// const DUMMY_TRIPS = [
//   {
//     id: '1',
//     date: '2025-12-02',
//     punches: ['09:10 AM', '01:05 PM', '06:45 PM'],
//   },
//   {
//     id: '2',
//     date: '2025-12-05',
//     punches: ['09:00 AM', '01:15 PM', '06:30 PM'],
//   },
//   {
//     id: '3',
//     date: '2025-12-08',
//     punches: ['09:25 AM', '01:00 PM', '06:10 PM'],
//   },
// ];
const DUMMY_TRIPS = [
  {
    id: '1',
    date: '2025-12-02',
    punches: [
      { time: '09:10 AM', location: 'Reflex soln, Gurgaon' },
      { time: '06:45 PM', location: 'Reflex soln, Gurgaon' },
    ],
  },
];


const TripScreen = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showPunchPopup, setShowPunchPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start');
  const [draftStartDate, setDraftStartDate] = useState(null);
  const [draftEndDate, setDraftEndDate] = useState(null);
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [isMarkedIn, setIsMarkedIn] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingPunchLocation, setPendingPunchLocation] = useState(null);

  //const [currentLocation, setCurrentLocation] = useState(null);

  const [trips, setTrips] = useState([
  {
    date: '2025-12-29',
    punches: [
      {
        time: '09:15 AM',
        type: 'IN',
        latitude: 28.61394,
        longitude: 77.20902,
        locationLabel: '28.61394, 77.20902',
      },
      {
        time: '06:40 PM',
        type: 'OUT',
        latitude: 28.61394,
        longitude: 77.20902,
        locationLabel: '28.61394, 77.20902',
      },
    ],
  },
]);

  //const [showConfirmPopup, setShowConfirmPopup] = useState(false);
const [currentLocation, setCurrentLocation] = useState(null);

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};
const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};


// const handleTripPunch = async () => {
//   try {
//     const hasPermission = await requestLocationPermission();
//     if (!hasPermission) return;

//     const { latitude, longitude } = await getCurrentLocation();

//     const punch = {
//       time: dayjs().format('hh:mm A'),
//       type: isMarkedIn ? 'OUT' : 'IN',
//       latitude,
//       longitude,
//       address: 'Tap to view location',
//     };

//     const today = dayjs().format('YYYY-MM-DD');

//     setTrips(prev => {
//       const updated = [...prev];
//       const index = updated.findIndex(t => t.date === today);

//       if (index !== -1) {
//         updated[index].punches.push(punch);
//       } else {
//         updated.push({
//           id: Date.now().toString(),
//           date: today,
//           punches: [punch],
//         });
//       }
//       return updated;
//     });

//     setIsMarkedIn(prev => !prev);
//     setShowConfirmPopup(false);
//   } catch (error) {
//     console.log('Location error:', error);
//   }
// };
// const getAddressFromCoords = async (lat, lng) => {
//   try {
//     const res = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY`
//     );
//     const data = await res.json();
//     return data.results[0]?.formatted_address || 'Location unavailable';
//   } catch {
//     return 'Location unavailable';
//   }
// };

const handleConfirmPunch = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        let address = 'Fetching location...';
        address = await getAddressFromCoordsOSM(latitude, longitude);
        const punch = {
          time: dayjs().format('hh:mm A'),
          type: isMarkedIn ? 'OUT' : 'IN',
          latitude,
          longitude,
          locationLabel: address,
        };

        addPunchToTrips(punch);
        setIsMarkedIn(prev => !prev);
        setShowConfirmPopup(false);
      },
      error => {
        console.log('Location error:', error);
        Alert.alert('Error', 'Unable to fetch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  } catch (err) {
    console.log(err);
  }
};
const getAddressFromCoordsOSM = async (lat, lng) => {
  try {
   const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'HRMS-App/1.0 (contact@yourdomain.com)',
          'Accept': 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`OSM error: ${res.status}`);
    }
    const data = await res.json();

    return (
       data.name || 'Unknown'
      // `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    );
  } catch (error) {
    console.log('OSM error:', error);
    // return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
     return 'UnknownLocation';
  }
};

const addPunchToTrips = punch => {
  const today = dayjs().format('YYYY-MM-DD');

  setTrips(prev => {
    const updated = [...prev];
    const index = updated.findIndex(t => t.date === today);

    if (index !== -1) {
      updated[index].punches.push(punch);
    } else {
      updated.push({
        id: Date.now().toString(),
        date: today,
        punches: [punch],
      });
    }

    return updated;
  });
};


const openInMaps = (lat, lng) => {
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?ll=${lat},${lng}`
      : `https://www.google.com/maps?q=${lat},${lng}`;

  Linking.openURL(url);
};


  const openDatePicker = type => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };
  const toDate = value => new Date(value + 'T00:00:00');
  const normalizeEndDate = date =>
  new Date(date.setHours(23, 59, 59, 999));


  const handleConfirmDate = date => {
  if (datePickerType === 'start') {
    setDraftStartDate(date);
  } else {
    setDraftEndDate(normalizeEndDate(date));
  }
  setShowDatePicker(false);
};
    const applyDateFilter = () => {
  setAppliedStartDate(draftStartDate);
  setAppliedEndDate(draftEndDate);
};

const filteredTrips = trips.filter(trip => {
  const tripDate = toDate(trip.date);

  if (appliedStartDate && tripDate < appliedStartDate) {
    return false;
  }

  if (appliedEndDate && tripDate > appliedEndDate) {
    return false;
  }

  return true;
});
const getCurrentLocationAddress = () => {
  // TEMP mock — replace later
  return 'Reflex soln, Gurgaon';
};

// const handleConfirmPunch = () => {
//   const today = new Date().toISOString().split('T')[0];

// const punch = {
//   time: dayjs().format('hh:mm A'),
//   type: isMarkedIn ? 'OUT' : 'IN',
//   latitude,
//   longitude,
// };



  const renderTripRow = ({ item }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={() => {
      setSelectedTrip(item);
      setShowPunchPopup(true);
    }}
  >
    {/* Date */}
    <Text style={styles.cell}>{item.date}</Text>

    {/* Punch count */}
    <Text style={[styles.cell, styles.punchCount]}>
      {item.punches.length} Punch{item.punches.length !== 1 ? 'es' : ''}
    </Text>
  </TouchableOpacity>
);

 

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Your Trips</Text>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => openDatePicker('start')}
        >
          <Icon name="calendar" size={16} color="#6a9689" />
          <Text style={styles.dateText}>
            {draftStartDate
              ? draftStartDate.toLocaleDateString()
              : 'Start Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => openDatePicker('end')}
        >
          <Icon name="calendar" size={16} color="#6a9689" />
          <Text style={styles.dateText}>
            {draftEndDate ? draftEndDate.toLocaleDateString() : 'End Date'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={applyDateFilter}>
          <Icon name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {/* <View style={styles.searchRow}>
        <TextInput
          placeholder="Search date (YYYY-MM-DD)"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="filter" size={18} color="#fff" />
        </TouchableOpacity>
      </View> */}

      {/* Table */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Date</Text>
        <Text style={styles.headerCell}>Details</Text>
      </View>

      <FlatList
        data={filteredTrips}
        keyExtractor={(item, index) => item.date || index.toString()}
        renderItem={renderTripRow}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Add Button */}
    <TouchableOpacity
  style={styles.fab}
  onPress={
    async () => {
      setShowConfirmPopup(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        setPendingPunchLocation({
          latitude,
          longitude,
          label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });

       
      },
      error => {
        console.log('Location error:', error);
        Alert.alert('Error', 'Unable to fetch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }}
>

  <Text style={styles.fabText}>
    {isMarkedIn ? 'Mark Out Trip' : 'Mark In Trip'}
  </Text>
</TouchableOpacity>


      {/* Punch Details Popup */}
      <Modal transparent visible={showPunchPopup} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPunchPopup(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>
              Punches – {selectedTrip?.date}
            </Text>
            {selectedTrip?.punches.map((p, i) => (
  <View key={`${p.time}-${p.type}`} style={styles.punchRow}>
    <Text style={styles.punchTime}>
      {p.time} ({p.type})
    </Text>

    <TouchableOpacity onPress={() => openInMaps(p.latitude, p.longitude)}>
      <Text style={styles.punchLocation}>
        📍 {p.locationLabel}
      </Text>
    </TouchableOpacity>
  </View>
))}


            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowPunchPopup(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Trip Popup */}
      {/* <Modal transparent visible={showAddPopup} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Add Trip</Text>
            <Text style={styles.popupItem}>
              This popup can later contain punch form
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowAddPopup(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
      
      <Modal transparent visible={showConfirmPopup} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowConfirmPopup(false)}>
  <View style={styles.modalOverlay}>
    <TouchableWithoutFeedback>
    <View style={styles.popup}>
      <Text style={styles.popupTitle}>Confirm Location</Text>

      {/* <Text style={styles.punchLocation}> key={i}{p.locationLabel}</Text>  */}
       {pendingPunchLocation && (
  <TouchableOpacity
    onPress={() =>
      openInMaps(
        pendingPunchLocation.latitude,
        pendingPunchLocation.longitude
      )
    }
  >
    <Text style={styles.punchLocation}>
      📍 {pendingPunchLocation.label}
    </Text>
  </TouchableOpacity>
)}

      {/* MAP
          {currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={currentLocation}
            >
              <Marker coordinate={currentLocation} />
            </MapView>
          ) : (
            <Text>Fetching location...</Text>
          )} */}

      <View style={styles.popupActions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowConfirmPopup(false)}
        >
          <Text>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmPunch}
        >
          <Text style={{ color: '#fff' }}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  </View>
  </TouchableWithoutFeedback>
</Modal>

 
      
      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

export default TripScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a9689',
    marginBottom: 12,
    paddingHorizontal: 135,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '42%',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    padding: 10,
  },
  dateText: {
    marginLeft: 8,
    color: '#444',
  },
  searchRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  filterBtn: {
    backgroundColor: '#6a9689',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dbead7',
    padding: 10,
    marginTop: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    color: '#050505ff',
  },
  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 58,   // ✅ equal left & right
  paddingVertical: 12,     // optional (top & bottom)
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

  cell: {
    fontSize: 14,
    color: '#333',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: '#6a9689',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6a9689',
  },
  popupItem: {
    fontSize: 14,
    marginVertical: 4,
    color: '#333',
  },
  closeBtn: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  closeText: {
    color: '#6a9689',
    fontWeight: 'bold',
  },
  fabText: {
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
},

locationText: {
  marginVertical: 15,
  fontSize: 16,
  color: '#444',
},

popupActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 20,
},

cancelBtn: {
  marginRight: 15,
},

confirmBtn: {
  backgroundColor: '#6a9689',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
},
punchRow: {
  marginBottom: 8,
  flexDirection: 'row',
},

punchTime: {
  fontWeight: '600',
  color: '#333',
},

punchLocation: {
  fontSize: 12,
  color: '#777',
  marginLeft: 12,
},
map: {
  width: '100%',
  height: 200,
  borderRadius: 10,
  marginVertical: 10,
},

popup: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
punchRow: {
  flexDirection: 'row',
  alignItems: 'space-between',
  marginBottom: 12,
},

punchTime: {
  fontWeight: '600',
  color: '#333',
},

punchLocation: {
  fontSize: 12,
  color: '#1a73e8',
  marginLeft: 12,
  textDecorationLine: 'underline',
},

});
