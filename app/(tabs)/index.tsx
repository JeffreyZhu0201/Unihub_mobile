import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api, Notification, DingTask } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dings, setDings] = useState<DingTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [notifs, tasksResult] = await Promise.all([
        api.getMyNotifications(),
        api.getMyDings(),
      ]);
      setNotifications(notifs || []);
      setDings(tasksResult.pending || []);
    } catch (error) {
      console.log(error);
      // If unauthorized, redirect might be better handled in a global guard
      // router.replace('/auth/login');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>UniHub-Campus Assistance</Text>
        <Text style={styles.subGreeting}>Here are your updates</Text>
      </View>

      {/* Dings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Pending Check-ins</Text>
        {dings.length === 0 ? (
          <Text style={styles.emptyText}>No pending tasks. You're free!</Text>
        ) : (
          dings.map((ding) => (
             <TouchableOpacity 
                key={ding.ID} 
                style={styles.card}
                onPress={() => router.push({
                    pathname: '/checkin/[id]',
                    params: { 
                        id: ding.ID, 
                        title: ding.Title, 
                        type: ding.Type, 
                        deadline: ding.Deadline 
                    }
                })}
             >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{ding.Title}</Text>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{ding.Type === 'dorm_check' ? '查寝' : '签到'}</Text>
                    </View>
                </View>
                
                <View style={styles.cardFooter}>
                     <Ionicons name="time-outline" size={14} color="#666" />
                     <Text style={styles.cardTime}>Deadline: {new Date(ding.Deadline).toLocaleString()}</Text>
                </View>
             </TouchableOpacity>
          ))
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📢 Notifications</Text>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No new notifications</Text>
        ) : (
          notifications.map((notif) => (
            <View key={notif.ID} style={styles.notifCard}>
               <View style={{flexDirection: 'row', gap: 10}}>
                   <Ionicons name="notifications-outline" size={24} color="#666" />
                   <View style={{flex: 1}}>
                       <Text style={styles.notifTitle}>{notif.Title}</Text>
                       <Text style={styles.notifContent}>{notif.Content}</Text>
                       <Text style={styles.notifTime}>{new Date(notif.CreatedAt).toLocaleDateString()}</Text>
                   </View>
               </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  subGreeting: { fontSize: 16, color: '#666', marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#333' },
  emptyText: { color: '#999', fontStyle: 'italic' },
  
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardTime: { fontSize: 12, color: '#666' },
  tag: { backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: '#4338ca', fontSize: 10, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  notifCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4F46E5' },
  notifTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  notifContent: { fontSize: 14, color: '#444', marginBottom: 6 },
  notifTime: { fontSize: 12, color: '#999' },
});
