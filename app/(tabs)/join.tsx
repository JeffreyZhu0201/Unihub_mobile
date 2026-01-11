import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { api } from '@/services/api';

export default function JoinScreen() {
  const [classCode, setClassCode] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const handleJoinClass = async () => {
    if (classCode.length !== 8) return Alert.alert('Invalid Code', 'Code must be 8 characters');
    try {
      await api.joinClass(classCode);
      Alert.alert('Success', 'Joined class successfully');
      setClassCode('');
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    }
  };

  const handleJoinDept = async () => {
    if (deptCode.length !== 8) return Alert.alert('Invalid Code', 'Code must be 8 characters');
    try {
      await api.joinDept(deptCode);
      Alert.alert('Success', 'Joined department successfully');
      setDeptCode('');
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.header}>Join Organization</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Join a Class</Text>
        <Text style={styles.helper}>Enter the 8-character code shared by your teacher.</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Ex: AB12CD34" 
            value={classCode} 
            onChangeText={setClassCode}
            maxLength={8}
            autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.btn} onPress={handleJoinClass}>
            <Text style={styles.btnText}>Join Class</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Join a Department</Text>
        <Text style={styles.helper}>Enter the code shared by your counselor.</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Ex: XY98ZT21" 
            value={deptCode} 
            onChangeText={setDeptCode}
            maxLength={8}
            autoCapitalize="characters"
        />
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleJoinDept}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Join Department</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f8fafc' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, color: '#1e293b' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#334155' },
  helper: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  input: { backgroundColor: '#f1f5f9', height: 50, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, letterSpacing: 1 },
  btn: { backgroundColor: '#0f172a', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0f172a' },
  btnTextSecondary: { color: '#0f172a' },
});