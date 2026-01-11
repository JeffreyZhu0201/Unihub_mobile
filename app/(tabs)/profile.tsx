import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform, UIManager, LayoutAnimation } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { api, UserProfile, OrgInfo } from '@/services/api'; // Import OrgInfo
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null); // State for OrgInfo
  const [loading, setLoading] = useState(true);
  const [loadingOrg, setLoadingOrg] = useState(false); // Loading state for Org section
  const [expanded, setExpanded] = useState(false); // Dropdown toggle

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setProfile(null);
        setOrgInfo(null);
        setLoading(false);
        return;
      }
      
      const profileData = await api.getProfile();
      if (profileData) setProfile(profileData);

    } catch (e) {
      console.log(e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  
  const loadOrgInfo = async () => {
      setLoadingOrg(true);
      try {
          const orgData = await api.getUserOrgInfo();
          if (orgData) setOrgInfo(orgData);
      } catch (e) {
          console.log("Failed to load org info:", e);
      } finally {
          setLoadingOrg(false);
      }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/auth/login');
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!expanded) {
        loadOrgInfo(); // Fetch when expanding
    }
    setExpanded(!expanded);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4F46E5" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{profile?.Nickname?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        
        {profile ? (
            <Text style={styles.name}>{profile.Nickname}</Text>
        ) : (
             <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={[styles.name, styles.linkText]}>Login / Register</Text>
            </TouchableOpacity>
        )}

        <View style={styles.roleTag}>
             <Text style={styles.roleText}>{profile ? (profile?.Role?.Name || 'Student') : '-'}</Text>
        </View>
      </View>

      {/* Organization Dropdown */}
      {profile && (
        <View style={styles.orgSectionContainer}>
            <TouchableOpacity style={styles.orgHeader} onPress={toggleExpand} activeOpacity={0.7}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <View style={[styles.iconBox, { backgroundColor: '#e0e7ff', marginRight: 0 }]}>
                        <Ionicons name="school-outline" size={20} color="#4F46E5" />
                    </View>
                    <Text style={styles.orgTitle}>My Organizations</Text>
                </View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.orgContent}>
                    {loadingOrg ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="small" color="#4F46E5" />
                        </View>
                    ) : (
                        <>
                            {/* Department Info */}
                            <View style={styles.orgItem}>
                                <Text style={styles.orgLabel}>Department</Text>
                                {orgInfo?.department && orgInfo.department.ID !== 0 ? (
                                    <View style={styles.deptCard}>
                                        <Text style={styles.deptName}>{orgInfo.department.Name}</Text>
                                        <Text style={styles.deptCode}>Code: {orgInfo.department.InviteCode}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.emptyText}>Not joined any department</Text>
                                )}
                            </View>

                            {/* Classes List */}
                            <View style={styles.orgItem}>
                                <Text style={styles.orgLabel}>Joined Classes</Text>
                                {orgInfo?.classes && orgInfo.classes.length > 0 ? (
                                    orgInfo.classes.map((cls) => (
                                        <View key={cls.ID} style={styles.classRow}>
                                            <View>
                                                <Text style={styles.className}>{cls.Name}</Text>
                                                <Text style={styles.classCode}>Code: {cls.InviteCode}</Text>
                                            </View>
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>Class</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>No classes joined</Text>
                                )}
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
      )}

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        
        <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="card-outline" size={20} color="#4F46E5" /></View>
            <View>
                <Text style={styles.label}>Student No.</Text>
                <Text style={styles.value}>{profile?.StudentNo || '-'}</Text>
            </View>
        </View>

        <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="mail-outline" size={20} color="#4F46E5" /></View>
            <View>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{profile?.Email || '-'}</Text>
            </View>
        </View>

         <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="calendar-outline" size={20} color="#4F46E5" /></View>
            <View>
                <Text style={styles.label}>Joined Since</Text>
                <Text style={styles.value}>{profile?.CreatedAt ? new Date(profile.CreatedAt).toLocaleDateString() : '-'}</Text>
            </View>
         </View>
      </View>

      {profile && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      )}
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
  linkText: { color: '#4F46E5', textDecorationLine: 'underline' },
  roleTag: { marginTop: 8, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#dbeafe' },
  roleText: { color: '#2563eb', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  section: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  label: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600', color: '#0f172a' },

  // Org Styles
  orgSectionContainer: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4 },
  orgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  orgTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  orgContent: { padding: 16, paddingTop: 0, backgroundColor: '#fcfcfc', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  orgItem: { marginTop: 16 },
  orgLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' },
  deptCard: { backgroundColor: '#eef2ff', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4F46E5' },
  deptName: { fontSize: 15, fontWeight: '600', color: '#312e81' },
  deptCode: { fontSize: 12, color: '#6366f1', marginTop: 2 },
  classRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  className: { fontSize: 14, fontWeight: '600', color: '#374151' },
  classCode: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  tag: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, color: '#6b7280', fontWeight: 'bold' },
  emptyText: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 20, marginTop: 40, marginBottom: 40, backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
