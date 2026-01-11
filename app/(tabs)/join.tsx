import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { CameraView, Camera } from "expo-camera"; 
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

export default function JoinScreen() {
  const [classCode, setClassCode] = useState('');
  const [deptCode, setDeptCode] = useState('');
  
  // Scanner State
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanning(false);
    try {
        // Expected format: JSON { type: "dept"|"class", code: "XXX" }
        // If raw string is scanned, we might assume it's one or the other, or error. 
        // Our web app now generates signed JSON.
        
        let payload;
        try {
            payload = JSON.parse(data);
        } catch {
             // Fallback for raw text: detected but don't know type
             Alert.alert("Unknown QR Code", "This code format is not recognized as a UniHub organization.");
             return;
        }

        if (payload.type === 'dept') {
            setDeptCode(payload.code);
            Alert.alert(
                "Department Found",
                `Join Department: ${payload.code}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Join", onPress: () => joinDeptDirect(payload.code) }
                ]
            );
        } else if (payload.type === 'class') {
             setClassCode(payload.code);
             Alert.alert(
                "Class Found",
                `Join Class: ${payload.code}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Join", onPress: () => joinClassDirect(payload.code) }
                ]
            );
        } else {
            Alert.alert("Unknown Code", "QR code type not supported.");
        }
    } catch (e) {
        Alert.alert("Scan Error", "Could not process this QR code.");
    }
  };

  const joinClassDirect = async (code: string) => {
    try {
        await api.joinClass(code);
        Alert.alert('Success', 'Joined class successfully');
        setClassCode(''); // Clear input on success
    } catch (e: any) {
        Alert.alert('Join Class Failed', e.message);
    }
  };

  const joinDeptDirect = async (code: string) => {
    try {
        await api.joinDept(code);
        Alert.alert('Success', 'Joined department successfully');
        setDeptCode(''); 
    } catch (e: any) {
        // If the requirement implies auto-trying class if dept fails (which is unusual given we have types, but implementing as requested fallback logic)
        // However, since we KNOW it is a dept type from JSON, trying class is illogical unless the JSON is wrong. 
        // Spec: "If calling join dept error then call join class" -> Implementing this purely based on request, 
        // though logically they are distinct.
        console.log("Dept join failed, trying class as fallback per requirements...");
        
        try {
             await api.joinClass(code);
             Alert.alert('Success', 'Joined Class (Fallback) successfully');
        } catch (innerE: any) {
             Alert.alert('Failed', `Could not join as Dept or Class. \nDept Error: ${e.message}`);
        }
    }
  };

  // Manual Inputs
  const handleJoinClass = async () => {
    if (classCode.length !== 8) return Alert.alert('Invalid Code', 'Code must be 8 characters');
    await joinClassDirect(classCode);
  };

  const handleJoinDept = async () => {
    if (deptCode.length !== 8) return Alert.alert('Invalid Code', 'Code must be 8 characters');
    await joinDeptDirect(deptCode);
  };

  const startScan = () => {
      if (hasPermission === null) {
          Alert.alert("Requesting Permission", "Please allow camera access.");
          return;
      }
      if (hasPermission === false) {
          Alert.alert("No Access", "Camera permission was denied/toggled off.");
          return;
      }
      setScanning(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.header}>Join Organization</Text>
      
      {/* Scan Button */}
      <TouchableOpacity style={styles.scanBtn} onPress={startScan}>
         <Ionicons name="qr-code-outline" size={24} color="#fff" />
         <Text style={styles.scanBtnText}>Scan QR Code</Text>
      </TouchableOpacity>

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

      {/* Full Screen Scanner Modal */}
      <Modal visible={scanning} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.scannerContainer}>
            <CameraView 
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
            <View style={styles.scannerOverlay}>
                 <View style={styles.scannerTarget} />
                 <Text style={styles.scannerText}>Align QR Code within the frame</Text>
                 <TouchableOpacity style={styles.closeScanBtn} onPress={() => setScanning(false)}>
                     <Text style={styles.closeScanText}>Cancel</Text>
                 </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f8fafc' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
  
  scanBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, marginBottom: 24,
      shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}
  },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#334155' },
  helper: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  input: { backgroundColor: '#f1f5f9', height: 50, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, letterSpacing: 1 },
  btn: { backgroundColor: '#0f172a', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0f172a' },
  btnTextSecondary: { color: '#0f172a' },

  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scannerTarget: { width: 250, height: 250, borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent', borderRadius: 20 },
  scannerText: { color: '#fff', marginTop: 20, fontSize: 16 },
  closeScanBtn: { position: 'absolute', bottom: 60, backgroundColor: '#fff', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  closeScanText: { color: '#000', fontSize: 16, fontWeight: '500' },
});