import React from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import dayjs from 'dayjs';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import { MMKV } from 'react-native-mmkv';
import Popup from '../Popup/Popup';

const storage = new MMKV();
const { width } = Dimensions.get('screen');
const SIZE = width * 0.7;
const TICK_INTERVAL = 1000;

export default class ClockInOut extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: dayjs(),
      elapsedSeconds: 0,
      secondDegree: new Animated.Value(0),
      minuteDegree: new Animated.Value(0),
      hourDegree: new Animated.Value(0),
      isPunchedIn: false,
      latitude: null,
      longitude: null,
      punchInTime: null,
      punchOutTime: null,
      loading: false,
      isDoneForDay: false,
      buttonLabel: 'Punch In',

      popupVisible: false,
      popupTitle: '',
      popupMessage: '',
    };
    this._ticker = null;
  }

  componentDidMount() {
    this._ticker = setInterval(this.updateClock, TICK_INTERVAL);
    this.checkPunchStatus(dayjs().format('YYYY-MM-DD'));
  }

  componentWillUnmount() {
    clearInterval(this._ticker);
  }
  showPopup = (title, message) => {
    this.setState({
      popupVisible: true,
      popupTitle: title,
      popupMessage: message,
    });
  };

  hidePopup = () => {
    this.setState({ popupVisible: false });
  };
  updateClock = () => {
    const { isPunchedIn, punchOutTime } = this.state;

    this.setState({ currentTime: dayjs() }, this.updateClockHands);

    if (isPunchedIn && !this.state.isDoneForDay) {
      this.setState(prevState => ({
        elapsedSeconds: prevState.elapsedSeconds + 1,
      }));

      if (punchOutTime) {
        const currentTime = dayjs();
        const punchOutMoment = dayjs(punchOutTime, 'hh:mm A');

        if (currentTime.isAfter(punchOutMoment)) {
          this.setState({
            isPunchedIn: false,
            isDoneForDay: true,
            elapsedSeconds: 0,
          });
          clearInterval(this._ticker);
        }
      }
    }
  };

  updateClockHands = () => {
    const { currentTime } = this.state;
    const seconds = currentTime.second();
    const minutes = currentTime.minute();
    const hours = currentTime.hour() % 12;

    this.state.secondDegree.setValue((seconds / 60) * 360);
    this.state.minuteDegree.setValue((minutes / 60) * 360 + (seconds / 60) * 6);
    this.state.hourDegree.setValue((hours / 12) * 360 + (minutes / 60) * 30);
  };

  // requestLocationPermission = async () => true;
  requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to punch in/out.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS location permissions should be handled via Info.plist
    }
  };

  getLocationAndPunchInOrOut = async action => {
    if (await this.requestLocationPermission()) {
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          this.setState({ latitude, longitude });
          action === 'punchIn'
            ? this.punchIn(latitude, longitude)
            : this.punchOut(latitude, longitude);
        },
        error => {
          console.error('Error getting location:', error);
          // Alert.alert('Error', 'Unable to get your location');
          this.showPopup('Error', 'Unable to get your location');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  };

  // checkPunchStatus = async date => {
  //   try {
  //     const response = await apiMiddleware.get(
  //       `/attendance/daily_attendance?date=${date}`,
  //     );

  //     // console.log('check status ', response);

  //     const { punch_in_time, punch_out_time } = response.data?.[0] || {};

  //     if (punch_in_time) {
  //       const punchInTime = dayjs(punch_in_time);
  //       const now = dayjs();
  //       const elapsedSeconds = now.diff(punchInTime, 'second');

  //       this.setState({
  //         punchInTime: punchInTime.format('hh:mm A'),
  //         isPunchedIn: true,
  //         elapsedSeconds,
  //         buttonLabel: punch_out_time ? 'Done for the day' : 'Clock Out',
  //         punchOutTime: punch_out_time
  //           ? dayjs(punch_out_time).format('hh:mm A')
  //           : null,
  //         isDoneForDay: !!punch_out_time,
  //       });
  //     } else {
  //       this.resetPunchState();
  //     }
  //   } catch (error) {
  //     console.error('Error while checking punch-in status:', error);
  //     this.resetPunchState();
  //   }
  // };
  checkPunchStatus = async date => {
    try {
      const response = await apiMiddleware.get(
        `/attendance/daily_attendance?date=${date}`,
      );
      console.log('date ', date);

      const { punch_in_time, punch_out_time } = response.data?.[0] || {};
      console.log('punch_in_time', punch_in_time);
      console.log('punch_out_time', punch_out_time);
      console.log('response ', response);

      if (punch_in_time) {
        const punchInTime = dayjs(punch_in_time);
        const now = dayjs();
        const elapsedSeconds = now.diff(punchInTime, 'second');

        this.setState({
          punchInTime: punchInTime.format('hh:mm A'),
          isPunchedIn: true,
          elapsedSeconds,
          punchOutTime: punch_out_time
            ? dayjs(punch_out_time).format('hh:mm A')
            : null,
          isDoneForDay: false, // Allow further punch-outs
          buttonLabel: 'Clock Out',
        });
      } else {
        this.resetPunchState();
      }
    } catch (error) {
      console.error('Error while checking punch-in status:', error);
      this.resetPunchState();
    }
  };

  resetPunchState = () => {
    this.setState({
      punchInTime: null,
      punchOutTime: null,
      isPunchedIn: false,
      buttonLabel: 'Punch In',
      isDoneForDay: false,
    });
  };

  punchIn = async (latitude, longitude) => {
    try {
      this.setState({ loading: true });

      const employeeId = storage.getString('employee_id');
      const companyCode = storage.getString('companyCode');

      if (!employeeId || !companyCode) throw new Error('Missing credentials');

      // Use `apiMiddleware.post` to make the API call
      const response = await apiMiddleware.post(
        '/attendance/punch_in',
        { data: { latitude, longitude } },
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `employee_id=${employeeId}; companyCode=${companyCode}`,
          },
        },
      );
      // console.log('punchin', response);

      if (response?.data?.success) {
        const punchInTime = dayjs(response.data.punchInTime || dayjs());
        const now = dayjs();
        const elapsedSeconds = now.diff(punchInTime, 'second');

        this.setState({
          punchInTime: punchInTime.format('hh:mm A'),
          isPunchedIn: true,
          elapsedSeconds,
        });

        Alert.alert(
          'Success',
          response.data.message || 'Punched in successfully',
        );
        this.showPopup(
          'Success',
          response.data.message || 'Punched in successfully',
        );
      }
    } catch (error) {
      this.handlePunchError(error);
      handlePunchError = error => {
        const errorMessage =
          error.response?.data?.message || 'Punch action failed';
        this.showPopup('Error', errorMessage);
        console.error(errorMessage);
      };
    } finally {
      this.setState({ loading: false });
    }
  };

  punchOut = async (latitude, longitude) => {
    try {
      this.setState({ loading: true });

      if (!this.state.isPunchedIn)
        throw new Error('You need to punch in first');

      const employeeId = storage.getString('employee_id');
      const companyCode = storage.getString('companyCode');

      if (!employeeId || !companyCode) throw new Error('Missing credentials');

      // Use `apiMiddleware.put` instead of `axios.put`
      const response = await apiMiddleware.put(
        '/attendance/punch_out',
        { data: { latitude, longitude } },
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `employee_id=${employeeId}; companyCode=${companyCode}`,
          },
        },
      );

      const punchOutTimeRaw = response.data.punch_out_time;
      const punchOutTime = dayjs(punchOutTimeRaw).isValid()
        ? dayjs(punchOutTimeRaw)
        : dayjs();
      const punchInTimeRaw = response.data.punchInTime;
      const punchInTime = dayjs(punchInTimeRaw || dayjs());

      this.setState({
        punchOutTime: punchOutTime.format('hh:mm A'),
        isPunchedIn: false,
        // isDoneForDay: true,
        elapsedSeconds: 0,
      });

      // Alert.alert(
      //   'Success',
      //   response.data.message || 'Punched out successfully',
      // );

      this.showPopup(
        'Success',
        response.data.message || 'Punched Out successfully',
      );
    } catch (error) {
      console.error('Error during punch-out:', error);
      // this.handlePunchError(error);
      handlePunchError = error => {
        const errorMessage =
          error.response?.data?.message || 'Punch action failed';
        this.showPopup('Error', errorMessage);
        console.error(errorMessage);
      };
    } finally {
      this.setState({ loading: false });
    }
  };

  handlePunchError = error => {
    const errorMessage = error.response?.data?.message || 'Punch action failed';
    // Alert.alert('Error', errorMessage);
    this.showPopup('Error', errorMessage);

    console.error(errorMessage);
  };

  renderStopwatch = () => {
    const { elapsedSeconds } = this.state;
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`;
  };

  render() {
    const {
      loading,
      currentTime,
      secondDegree,
      minuteDegree,
      hourDegree,
      punchInTime,
      punchOutTime,
      buttonLabel,
      isPunchedIn,
      isDoneForDay,
    } = this.state;

    const transformSeconds = {
      transform: [
        {
          rotate: secondDegree.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    };
    const transformMinutes = {
      transform: [
        {
          rotate: minuteDegree.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    };
    const transformHours = {
      transform: [
        {
          rotate: hourDegree.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    };

    return (
      <>
        <View style={styles.container}>
          <StatusBar hidden={true} />
          <View style={styles.clockContainer}>
            <View style={[styles.bigQuadran]} />
            <View style={[styles.mediumQuadran]} />
            <Animated.View style={[styles.mover, transformHours]}>
              <View style={[styles.hours]} />
            </Animated.View>
            <Animated.View style={[styles.mover, transformMinutes]}>
              <View style={[styles.minutes]} />
            </Animated.View>
            <Animated.View style={[styles.mover, transformSeconds]}>
              <View style={[styles.seconds]} />
            </Animated.View>
            <View style={[styles.smallQuadran]} />
          </View>

          <View style={styles.infoContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#a8d7c5" />
            ) : (
              <>
                <Text style={styles.currentTime}>
                  {isPunchedIn ? this.renderStopwatch() : '00:00:00'}
                </Text>

                <View style={styles.punchSection}>
                  <Text style={styles.punchIn}>
                    In Time:{' '}
                    <Text style={styles.darkerTimeText}>
                      {punchInTime || '00:00'}
                    </Text>
                  </Text>
                  <Text style={styles.punchOut}>
                    Out Time:{' '}
                    <Text style={styles.darkerTimeText}>
                      {punchOutTime || '00:00'}
                    </Text>
                  </Text>
                </View>

                {/* <TouchableOpacity
                style={styles.punchButton}
                onPress={() =>
                  this.getLocationAndPunchInOrOut(
                    isPunchedIn ? 'punchOut' : 'punchIn',
                  )
                }>
                <Icon
                  name={isPunchedIn ? 'sign-out' : 'sign-in'}
                  size={20}
                  color={isPunchedIn ? '#F7454A' : '#fff'}
                  style={styles.iconStyle}
                />
                <Text
                  style={[
                    styles.buttonText,
                    isPunchedIn ? styles.punchInText : styles.punchOutText,
                  ]}>
                  {isPunchedIn ? 'Punch Out' : 'Punch In'}
                </Text>
              </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.punchButton}
                  onPress={() => {
                    if (!isPunchedIn && !punchInTime) {
                      this.getLocationAndPunchInOrOut('punchIn');
                    } else {
                      this.getLocationAndPunchInOrOut('punchOut');
                    }
                  }}
                >
                  <Icon
                    name={isPunchedIn ? 'sign-out' : 'sign-in'}
                    size={20}
                    color={isPunchedIn ? '#F7454A' : '#fff'}
                    style={styles.iconStyle}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      isPunchedIn ? styles.punchInText : styles.punchOutText,
                    ]}
                  >
                    {isPunchedIn ? 'Punch Out Again' : 'Punch In'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        {this.state.popupVisible && (
          <Popup
            title={this.state.popupTitle}
            message={this.state.popupMessage}
            onClose={this.hidePopup}
          />
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 450,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    height: 220,
  },
  mover: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  hours: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: '25%',
    marginTop: '25%',
    width: 5,
    borderRadius: 4,
  },
  minutes: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    height: '30%',
    marginTop: '20%',
    width: 3,
    borderRadius: 3,
  },
  seconds: {
    backgroundColor: '#aeaeae',
    height: '33%',
    width: 2,
    borderRadius: 2,
    marginTop: '17%',
  },
  bigQuadran: {
    width: SIZE * 0.8,
    height: SIZE * 0.8,
    borderRadius: SIZE * 0.4,
    backgroundColor: '#C1D8C3',
    position: 'absolute',
  },
  mediumQuadran: {
    width: SIZE * 0.6,
    height: SIZE * 0.6,
    borderRadius: SIZE * 0.3,
    backgroundColor: '#E3F0E3',
    position: 'absolute',
  },
  smallQuadran: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8F9498',
    position: 'absolute',
  },
  infoContainer: {
    paddingTop: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  currentTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f4062',
  },
  punchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
  },
  punchIn: {
    fontSize: 18,

    color: '#6a9689',
    fontWeight: '700',
  },
  punchOut: {
    fontSize: 18,
    color: '#6a9689',
    fontWeight: '700',
  },
  darkerTimeText: {
    color: '#00503D',
    fontWeight: 'bold',
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
  iconStyle: {
    marginRight: 10,
  },
  punchInText: {
    color: '#F7454A',
  },
  punchOutText: {
    color: '#fff',
  },
});
