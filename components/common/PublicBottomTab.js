import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PublicBottomTab = ({ state, descriptors, navigation }) => {
  const icons = {
    Home: 'home',
    Weather: 'cloud',
    Steps: 'street-view',
    Blog: 'newspaper-o',
  };

  const labels = {
    Home: 'Home',
    Weather: 'Weather',
    Steps: 'Steps',
    Blog: 'Blog',
  };

  const handleTabPress = (route, index) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented && state.index !== index) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const iconName = icons[route.name] || 'circle';
          const label = labels[route.name] || route.name;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => handleTabPress(route, index)}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer,
                ]}
              >
                <FontAwesome
                  name={iconName}
                  size={20}
                  color={isFocused ? '#6a9689' : '#777'}
                />
              </View>

              <Text style={[styles.label, isFocused && styles.activeLabel]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PublicBottomTab;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },

  tabBar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    backgroundColor: '#fff',

    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',

    paddingHorizontal: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 8,
  },

  tab: {
    flex: 1,
    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 42,
    height: 30,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
  },

  activeIconContainer: {
    backgroundColor: '#A8D7C5',
  },

  label: {
    marginTop: 3,

    fontSize: 11,
    fontWeight: '500',

    color: '#777',
  },

  activeLabel: {
    color: '#6a9689',
    fontWeight: '700',
  },
});
