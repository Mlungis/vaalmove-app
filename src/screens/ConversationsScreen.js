import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { colors, fonts, shadow } from '../theme';
import { useAppContext } from '../AppContext';

export default function ConversationsScreen({ navigation }) {
  const { conversations } = useAppContext();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}><Text style={styles.title}>Messages</Text></View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 6, flexGrow: 1 }}>
        {conversations.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" title="No conversations yet" />
        ) : (
          conversations.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.row, shadow.soft]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ChatThread', { id: c.id })}
            >
              <Avatar initials={c.name.slice(0, 2).toUpperCase()} color={c.avatarColor} size={48} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.time}>{c.time}</Text>
                </View>
                <View style={styles.rowTop}>
                  <Text style={[styles.lastMessage, c.unread > 0 && styles.lastMessageUnread]} numberOfLines={1}>
                    {c.lastMessage}
                  </Text>
                  {c.unread > 0 ? (
                    <View style={styles.badge}><Text style={styles.badgeText}>{c.unread}</Text></View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { padding: 18, paddingBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 14, marginBottom: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.ink, flex: 1, marginRight: 8 },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  lastMessage: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, flex: 1, marginRight: 8, marginTop: 4 },
  lastMessageUnread: { color: colors.ink, fontFamily: fonts.bodyMedium },
  badge: { backgroundColor: colors.skyBottom, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontFamily: fonts.bodySemi, fontSize: 10.5 },
});
