import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '../../src/utils/theme';

export const LoadingState = ({ message = 'Loading...' }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={COLORS.primaryLight} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

export const EmptyState = ({ title = 'Nothing here yet', subtitle }) => (
  <View style={styles.center}>
    <Text style={styles.emptyTitle}>{title}</Text>
    {!!subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <View style={styles.center}>
    <Text style={styles.errorTitle}>{message}</Text>
    {!!onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONT.md,
  },
  emptyTitle: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: FONT.md,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: FONT.md,
  },
});
