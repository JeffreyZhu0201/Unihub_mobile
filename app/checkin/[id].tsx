import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { api } from '@/services/api';

export default function CheckInDetailScreen() {
    const router = useRouter();
    // 接收路由参数
    const params = useLocalSearchParams<{ id: string; title: string; type: string; deadline: string }>();
    const [submitting, setSubmitting] = useState(false);

    const dingId = parseInt(params.id);
    const deadlineDate = params.deadline ? new Date(params.deadline) : new Date();
    const isLate = new Date() > deadlineDate;

    // 处理打卡
    const handleCheckIn = async () => {
        setSubmitting(true);
        try {
            await api.performCheckIn(dingId);
            Alert.alert("Success", "Check-in completed successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Failed", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.iconRow}>
                    <View style={[styles.iconBox, { backgroundColor: params.type === 'dorm_check' ? '#fef3c7' : '#e0e7ff' }]}>
                        <Ionicons 
                            name={params.type === 'dorm_check' ? "bed-outline" : "location-outline"} 
                            size={32} 
                            color={params.type === 'dorm_check' ? '#d97706' : '#4F46E5'} 
                        />
                    </View>
                </View>

                <Text style={styles.title}>{params.title}</Text>
                
                <View style={styles.tagContainer}>
                    <View style={styles.tag}>
                         <Text style={styles.tagText}>{params.type === 'dorm_check' ? 'Dorm Check' : 'Sign In'}</Text>
                    </View>
                    {isLate && (
                        <View style={[styles.tag, styles.lateTag]}>
                            <Text style={[styles.tagText, styles.lateTagText]}>Overdue</Text>
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <View>
                        <Text style={styles.label}>Deadline</Text>
                        <Text style={styles.value}>{deadlineDate.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="alert-circle-outline" size={20} color="#666" />
                    <View>
                         <Text style={styles.label}>Status</Text>
                         <Text style={styles.value}>Pending Action</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <Text style={styles.instruction}>
                    Please confirm your presence/status to complete this task.
                </Text>
                
                <TouchableOpacity 
                    style={[styles.btn, submitting && styles.btnDisabled]} 
                    onPress={handleCheckIn}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                            <Text style={styles.btnText}>Confirm Check In</Text>
                        </>
                    )}
                </TouchableOpacity>

                {isLate && (
                     <Text style={styles.warningText}>
                        Note: You are checking in after the deadline. This will be marked as Late.
                    </Text>
                )}
            </View>
        </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    
    card: { margin: 20, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    iconRow: { marginBottom: 16 },
    iconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    
    title: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 12 },
    tagContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    tagText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
    lateTag: { backgroundColor: '#fef2f2' },
    lateTagText: { color: '#ef4444' },

    divider: { height: 1, backgroundColor: '#f1f5f9', width: '100%', marginBottom: 24 },
    
    infoRow: { flexDirection: 'row', width: '100%', gap: 16, marginBottom: 20 },
    label: { fontSize: 13, color: '#94a3b8', marginBottom: 2 },
    value: { fontSize: 16, color: '#334155', fontWeight: '500' },

    actionContainer: { padding: 20 },
    instruction: { textAlign: 'center', color: '#64748b', marginBottom: 20 },
    
    btn: { backgroundColor: '#4F46E5', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    btnDisabled: { backgroundColor: '#a5b4fc' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    
    warningText: { textAlign: 'center', color: '#ef4444', marginTop: 16, fontSize: 13 }
});