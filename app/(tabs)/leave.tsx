import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { api } from '@/services/api';

export default function LeaveScreen() {
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('1'); // Simplification for demo: duration in days
  const [isSick, setIsSick] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return Alert.alert('Error', 'Please provide a reason');
    
    // Construct simplified dates for demo. In real app use a DatePicker
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + parseInt(days));

    const payload = {
        type: isSick ? 1 : 2, // 1 for Sick (Event), 2 for Personal (implied mapping)
        start_time: now.toISOString(),
        end_time: end.toISOString(),
        reason: reason
    };

    try {
        await api.applyLeave(payload);
        Alert.alert('Success', 'Leave request submitted for approval');
        setReason('');
    } catch (e: any) {
        Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Request Leave</Text>

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
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 120 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  switchLabel: { fontSize: 16 },
  submitBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});