import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // Add useRouter
import { Ionicons } from '@expo/vector-icons'; // Add Icons
import { api } from '@/services/api';

export default function LeaveScreen() {
  const router = useRouter(); // Initialize router
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('1'); // Simplification for demo: duration in days
  const [isSick, setIsSick] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!reason.trim()) {
        return Alert.alert('Validation Error', 'Please enter a reason for your leave.');
    }
    const daysInt = parseInt(days);
    if (isNaN(daysInt) || daysInt <= 0) {
        return Alert.alert('Validation Error', 'Please enter a valid duration (days).');
    }

    // Construct simplified dates for demo. In real app use a DatePicker
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + daysInt);

    const payload = {
        type: isSick ? '病假' : '事假', // Updated to string to match backend struct
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        reason: reason.trim()
    };

    try {
        await api.applyLeave(payload);
        Alert.alert('Success', 'Leave request submitted for approval', [
            { text: 'OK', onPress: () => router.push('/leaves/history') } // Optional: redirect to history on success
        ]);
        setReason('');
        setDays('1');
    } catch (e: any) {
        Alert.alert('Submission Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Row with History Button */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Request Leave</Text>
        <TouchableOpacity 
            style={styles.historyBtn} 
            onPress={() => router.push('/leaves/history')}
        >
            <Ionicons name="time-outline" size={20} color="#4F46E5" />
            <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Leave Type</Text>
        <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{isSick ? 'Sick Leave (病假)' : 'Personal Leave (事假)'}</Text>
            <Switch value={isSick} onValueChange={setIsSick} />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Duration (Days)</Text>
        <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            value={days} 
            onChangeText={setDays} 
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Reason</Text>
        <TextInput 
            style={[styles.input, styles.textArea]} 
            multiline 
            numberOfLines={4} 
            placeholder="Why do you need to leave?"
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  // Updated Header Styles
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  header: { fontSize: 24, fontWeight: 'bold' },
  historyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4 },
  historyText: { fontSize: 16, color: '#4F46E5' },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 120 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  switchLabel: { fontSize: 16 },
  submitBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});