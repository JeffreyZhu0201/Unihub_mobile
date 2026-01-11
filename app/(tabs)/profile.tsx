import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { api, UserProfile } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/auth/login');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4F46E5" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{profile?.Nickname?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{profile?.Nickname}</Text>
        <View style={styles.roleTag}>
             <Text style={styles.roleText}>{profile?.Role?.Name || 'Student'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        
        <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="card-outline" size={20} color="#4F46E5" /></View>
            <View>
                <Text style={styles.label}>Student No.</Text>
                <Text style={styles.value}>{profile?.StudentNo || 'Not Set'}</Text>
            </View>
        </View>

        <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="mail-outline" size={20} color="#4F46E5" /></View>
            <View>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{profile?.Email}</Text>
            </View>
        </View>

         {profile?.DepartmentID ? (
            <View style={styles.infoRow}>
                <View style={styles.iconBox}><Ionicons name="business-outline" size={20} color="#4F46E5" /></View>
                <View>
                    <Text style={styles.label}>Department</Text>
                    <Text style={styles.value}>Dept ID: {profile.DepartmentID}</Text>
                </View>
            </View>
         ) : null}

         <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="calendar-outline" size={20} color="#4F46E5" /></View>
            <View>
                <Text style={styles.label}>Joined Since</Text>
                <Text style={styles.value}>{profile?.CreatedAt ? new Date(profile.CreatedAt).toLocaleDateString() : 'N/A'}</Text>
            </View>
         </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 30, paddingBottom: 40, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#4F46E5', shadowOpacity: 0.4, shadowRadius: 8 },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  roleTag: { marginTop: 8, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#dbeafe' },
  roleText: { color: '#2563eb', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  section: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  label: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 20, marginTop: 40, marginBottom: 40, backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
