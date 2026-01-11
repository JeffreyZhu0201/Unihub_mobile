import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    nickname: '', email: '', password: '', student_no: '', role_key: 'student' 
  });

  const handleRegister = async () => {
    try {
      const res = await api.register(form);
      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
        Alert.alert('Success', 'Account created');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Student Registration</Text>
      <TextInput style={styles.input} placeholder="Name" onChangeText={t => setForm({...form, nickname: t})} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={t => setForm({...form, email: t})} />
      <TextInput style={styles.input} placeholder="Student No (学号)" onChangeText={t => setForm({...form, student_no: t})} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={t => setForm({...form, password: t})} />
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  input: { height: 50, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#4F46E5', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});