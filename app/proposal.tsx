import { useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import { API_URL } from "../constants/api";

const { height } = Dimensions.get("window");

type NavigationLike = { navigate: (route: string) => void; goBack?: () => void } | undefined;

interface ProposalData {
  customerName: string;
  address: string;
  city: string;
  phone: string;
  specifications: string;
  process: string;
  scope: string;
  persqf: string;
  sqftTotal: string;
  quantity: string;
  totalCost: string;
  notes: string;
  companyEmail: string;
}

export default function ProposalScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProposalData>({
    customerName: "",
    address: "",
    city: "",
    phone: "",
    specifications: "",
    process: "",
    scope: "",
    persqf: "",
    sqftTotal: "",
    quantity: "",
    totalCost: "",
    notes: "",
    companyEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'persqf' | 'without'>('persqf');

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.customerName.trim()) nextErrors.customerName = "Customer name is required";
    if (!formData.address.trim()) nextErrors.address = "Address is required";
    if (!formData.city.trim()) nextErrors.city = "City is required";
    if (!formData.phone.trim()) nextErrors.phone = "Phone is required";
    if (!formData.specifications.trim()) nextErrors.specifications = "Specifications are required";
    if (!formData.process.trim()) nextErrors.process = "Process is required";
    if (!formData.scope.trim()) nextErrors.scope = "Scope is required";
    if (!formData.companyEmail.trim()) nextErrors.companyEmail = "Company email is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.companyEmail.trim() && !emailRegex.test(formData.companyEmail.trim())) {
      nextErrors.companyEmail = "Please enter a valid company email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }


  async function handleSubmit() {
    if (loading) return;
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Proposal created successfully!", [
          { text: "OK", onPress: () => router.push("/dashboard") }
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to create proposal");
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to create proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof ProposalData, value: string) {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate total cost when per sq ft cost or sq ft total changes
      // Only auto-calculate if total cost is empty or matches the previous calculation
      if ((field === 'persqf' || field === 'sqftTotal') && activeTab === 'persqf') {
        const persqf = field === 'persqf' ? parseFloat(value) : parseFloat(prev.persqf);
        const sqftTotal = field === 'sqftTotal' ? parseFloat(value) : parseFloat(prev.sqftTotal);
        
        if (!isNaN(persqf) && !isNaN(sqftTotal) && persqf > 0 && sqftTotal > 0) {
          const calculatedTotal = (persqf * sqftTotal).toFixed(2);
          const currentTotal = parseFloat(prev.totalCost);
          const previousCalculatedTotal = parseFloat(prev.persqf) * parseFloat(prev.sqftTotal);
          
          // Only auto-update if total cost is empty or matches the previous calculation
          if (!prev.totalCost || Math.abs(currentTotal - previousCalculatedTotal) < 0.01) {
            newData.totalCost = calculatedTotal;
          }
        }
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Header 
            onMenuPress={() => router.back()}
            title="Create Proposal"
            showMenu={true}
            showLogout={false}
            isBackButton={true}
          />

        {/* Logo */}
        {/* <View style={styles.logoContainer}>
          <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        </View> */}

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={[styles.input, errors.customerName && styles.inputError]}
            placeholder="Enter customer name"
            placeholderTextColor="#999"
            value={formData.customerName}
            onChangeText={(value) => updateField("customerName", value)}
          />
          {!!errors.customerName && <Text style={styles.errorText}>{errors.customerName}</Text>}

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Enter address"
            placeholderTextColor="#999"
            value={formData.address}
            onChangeText={(value) => updateField("address", value)}
          />
          {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <Text style={styles.label}>City *</Text>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="Enter city"
            placeholderTextColor="#999"
            value={formData.city}
            onChangeText={(value) => updateField("city", value)}
          />
          {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="+92 300 123 4567"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(value) => updateField("phone", value)}
          />
          {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.label}>Company Email *</Text>
          <TextInput
            style={[styles.input, errors.companyEmail && styles.inputError]}
            placeholder="company@email.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.companyEmail}
            onChangeText={(value) => updateField("companyEmail", value)}
          />
          {!!errors.companyEmail && <Text style={styles.errorText}>{errors.companyEmail}</Text>}
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          
          <Text style={styles.label}>Specifications *</Text>
          <TextInput
            style={[styles.textArea, errors.specifications && styles.inputError]}
            placeholder="Describe the project specifications..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={formData.specifications}
            onChangeText={(value) => updateField("specifications", value)}
          />
          {!!errors.specifications && <Text style={styles.errorText}>{errors.specifications}</Text>}

          <Text style={styles.label}>Process *</Text>
          <TextInput
            style={[styles.textArea, errors.process && styles.inputError]}
            placeholder="Describe the process steps..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={formData.process}
            onChangeText={(value) => updateField("process", value)}
          />
          {!!errors.process && <Text style={styles.errorText}>{errors.process}</Text>}

          <Text style={styles.label}>Scope *</Text>
          <TextInput
            style={[styles.textArea, errors.scope && styles.inputError]}
            placeholder="Describe the project scope..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={formData.scope}
            onChangeText={(value) => updateField("scope", value)}
          />
          {!!errors.scope && <Text style={styles.errorText}>{errors.scope}</Text>}
        </View>

        {/* Pricing Tabs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Options</Text>
          
          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'persqf' && styles.activeTab]}
              onPress={() => setActiveTab('persqf')}
            >
              <Text style={[styles.tabText, activeTab === 'persqf' && styles.activeTabText]}>
                Per/sq ft
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'without' && styles.activeTab]}
              onPress={() => setActiveTab('without')}
            >
              <Text style={[styles.tabText, activeTab === 'without' && styles.activeTabText]}>
                Without Per/sq ft
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'persqf' && (
            <View style={styles.tabContent}>
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Per Sq ft Cost</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.persqf}
                    onChangeText={(value) => updateField("persqf", value)}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Sq ft Total</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.sqftTotal}
                    onChangeText={(value) => updateField("sqftTotal", value)}
                  />
                </View>
              </View>

              <Text style={styles.label}>Total Cost</Text>
              {formData.persqf && formData.sqftTotal && (
                <Text style={styles.calculationText}>
                  Suggested: {formData.persqf} × {formData.sqftTotal} = {((parseFloat(formData.persqf) || 0) * (parseFloat(formData.sqftTotal) || 0)).toFixed(2)}
                </Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.totalCost}
                onChangeText={(value) => updateField("totalCost", value)}
              />
            </View>
          )}

          {activeTab === 'without' && (
            <View style={styles.tabContent}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.quantity}
                onChangeText={(value) => updateField("quantity", value)}
              />

              <Text style={styles.label}>Total Cost</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.totalCost}
                onChangeText={(value) => updateField("totalCost", value)}
              />
            </View>
          )}
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter any additional notes..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(value) => updateField("notes", value)}
          />
        </View>


        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Proposal</Text>
          )}
        </TouchableOpacity>

       
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  keyboardAvoidingView: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { flexGrow: 1, paddingBottom: Platform.OS === "ios" ? 20 : 30 },
  
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 60, marginBottom: 20 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#00234C" },
  placeholder: { width: 40 },
  
  // Logo
  logoContainer: { alignItems: "center", marginBottom: 0 },
  logo: { width: 200, height: 50 },
  
  // Sections
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#00234C", marginBottom: 20 },
  
  // Form Elements
  label: { fontSize: 14, color: "#00234C", marginBottom: 8, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#00234C",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  inputError: { borderColor: "#F44336" },
  readOnlyInput: { 
    backgroundColor: "#f5f5f5", 
    color: "#666" 
  },
  calculationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic"
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#00234C",
    backgroundColor: "#fff",
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
  },
  errorText: { color: "#F44336", fontSize: 12, marginTop: -10, marginBottom: 10 },
  
  // Row Layout
  rowContainer: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  halfWidth: { flex: 1 },
  
  // Tabs
  tabContainer: { 
    flexDirection: "row", 
    backgroundColor: "#f5f5f5", 
    borderRadius: 8, 
    padding: 4, 
    marginBottom: 20 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 6, 
    alignItems: "center" 
  },
  activeTab: { 
    backgroundColor: "#00234C" 
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#666" 
  },
  activeTabText: { 
    color: "#fff" 
  },
  tabContent: { 
    marginTop: 10 
  },
  
  // Submit Button
  submitButton: {
    backgroundColor: "#00234C",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  
  bottomSpacing: { height: 40 },
});
