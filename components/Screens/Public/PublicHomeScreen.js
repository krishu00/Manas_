import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AppHeader from '../../common/AppHeader';

const PublicHomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome to Manas
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Your workplace companion
          </Text>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Access
          </Text>

          <View style={styles.quickAccessContainer}>
            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Weather')}
            >
              <Text style={styles.quickCardIcon}>☁️</Text>

              <Text style={styles.quickCardTitle}>
                Weather
              </Text>

              <Text style={styles.quickCardSubtitle}>
                Check today's weather
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Steps')}
            >
              <Text style={styles.quickCardIcon}>👟</Text>

              <Text style={styles.quickCardTitle}>
                Steps
              </Text>

              <Text style={styles.quickCardSubtitle}>
                Track your activity
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blog Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Latest Updates
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Blog')}
            >
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.blogPlaceholder}>
            <Text style={styles.blogPlaceholderTitle}>
              Latest blogs
            </Text>

            <Text style={styles.blogPlaceholderText}>
              Stay updated with the latest workplace news and updates.
            </Text>

            <TouchableOpacity
              style={styles.blogButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Blog')}
            >
              <Text style={styles.blogButtonText}>
                Explore Blogs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublicHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9f8',
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },

  welcomeSection: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2d2a',
  },

  welcomeSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7471',
  },

  section: {
    marginTop: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#26332f',
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a9689',
  },

  quickAccessContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  quickCard: {
    flex: 1,
    minHeight: 145,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebe8',

    justifyContent: 'center',
  },

  quickCardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  quickCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332f',
  },

  quickCardSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: '#7a8581',
  },

  blogPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e4ebe8',
  },

  blogPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332f',
  },

  blogPlaceholderText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#747e7b',
  },

  blogButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#6a9689',
  },

  blogButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});