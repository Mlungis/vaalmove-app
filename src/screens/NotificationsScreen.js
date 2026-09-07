import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { colors, fonts, radius, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markAllNotificationsRead } = useAppContext();

  useEffect(() => {
    return () => markAllNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 18, flexGrow: 1 }}>
        {notifications.length === 0 ? (
          <EmptyState icon="notifications-outline" title="You're all caught up" />
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={[styles.card, shadow.soft, !n.read && styles.cardUnread]}>
              <View style={[styles.iconWrap, { backgroundColor: n.color + '22' }]}>
                <Ionicons name={n.icon} size={18} color={n.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody}>{n.body}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              {!n.read ? <View style={styles.unreadDot} /> : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  markAll: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.skyBottom },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 14, marginBottom: 12,
  },
  cardUnread: { borderWidth: 1, borderColor: 'rgba(63,141,255,0.25)' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  notifBody: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, marginTop: 3, lineHeight: 18 },
  notifTime: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.skyBottom, marginTop: 6 },
});
