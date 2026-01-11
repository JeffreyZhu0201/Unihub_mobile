import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { api, LeaveRequest } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function LeaveHistoryScreen() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const data = await api.getMyLeaves();
      // Sort by CreatedAt descending
      data.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
      setLeaves(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981'; // Green
      case 'rejected': return '#EF4444'; // Red
      case 'pending': return '#F59E0B';  // Amber
      default: return '#6B7280';         // Gray
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeTag}>
            <Text style={styles.typeText}>{item.Type}</Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(item.Status) }]}>
            {item.Status.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.reason} numberOfLines={2}>{item.Reason}</Text>
      
      <View style={styles.dateRow}>
        <Ionicons name="time-outline" size={14} color="#666" />
        <Text style={styles.dateText}>
            {formatTime(item.StartTime)} - {formatTime(item.EndTime)}
        </Text>
      </View>
      
      <Text style={styles.createTime}>Applied on: {new Date(item.CreatedAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Leave History', headerBackTitle: 'Back' }} />
      
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>
      ) : leaves.length === 0 ? (
        <View style={styles.center}>
            <Text style={styles.emptyText}>No leave records found.</Text>
        </View>
      ) : (
        <FlatList
            data={leaves}
            renderItem={renderItem}
            keyExtractor={item => item.ID.toString()}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadLeaves}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 20, paddingHorizontal: 16 },
  emptyText: { color: '#999', fontSize: 16 },
  
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeTag: { backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { color: '#4338ca', fontSize: 12, fontWeight: 'bold' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  reason: { fontSize: 15, color: '#333', marginBottom: 12, lineHeight: 20 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dateText: { fontSize: 13, color: '#555' },
  createTime: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 }
});