import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import { colors, fonts, radius } from '../theme';
import { useAppContext } from '../AppContext';

const QUICK_ACTIONS = [
  { label: 'Request quote', text: 'Could you send me a custom quote for 3 days plus weekend pickup?' },
  { label: 'Ask about insurance', text: 'Is insurance included and what is the damage cover for this rental?' },
  { label: 'Check availability', text: 'Are you available for a pickup next Tuesday morning?' },
];

export default function ChatThreadScreen({ navigation, route }) {
  const { conversations, sendMessage, markConversationRead } = useAppContext();
  const id = route?.params?.id;
  const conversation = conversations.find((c) => c.id === id);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (id) markConversationRead(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!conversation) {
    return (
      <View style={styles.container}>
        <Header title="Conversation" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(id, text.trim());
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Header title={conversation.name} subtitle={conversation.role} onBack={() => navigation.goBack()} />
      <View style={styles.quickActionsWrap}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity key={action.label} style={styles.quickAction} onPress={() => setText(action.text)}>
            <Text style={styles.quickActionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 18, paddingBottom: 12 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {conversation.messages.map((m) => (
          <View key={m.id} style={[styles.bubbleRow, m.from === 'me' && styles.bubbleRowMe]}>
            {m.from !== 'me' ? <Avatar initials={conversation.name.slice(0, 2).toUpperCase()} color={conversation.avatarColor} size={28} /> : null}
            <View style={[styles.bubble, m.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, m.from === 'me' && styles.bubbleTextMe]}>{m.text}</Text>
              <Text style={[styles.bubbleTime, m.from === 'me' && styles.bubbleTimeMe]}>{m.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor={colors.muted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  quickActionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  quickAction: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md },
  quickActionText: { fontFamily: fonts.bodySemi, fontSize: 11.5, color: colors.ink },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleThem: { backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.skyBottom, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.ink, lineHeight: 19 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 4, textAlign: 'right' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 14,
    borderTopWidth: 1, borderTopColor: colors.hairline, backgroundColor: colors.surface,
  },
  input: {
    flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: 14,
    paddingVertical: 10, fontFamily: fonts.body, fontSize: 14, color: colors.ink, maxHeight: 100,
    borderWidth: 1, borderColor: colors.hairline,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.skyBottom,
    alignItems: 'center', justifyContent: 'center',
  },
});
