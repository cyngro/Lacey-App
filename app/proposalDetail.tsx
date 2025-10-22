import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { getToken } from "../utils/authStorage";


interface Proposal {
  _id: string;
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
  sent: boolean;
  signed: boolean;
  companyEmail: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | { id: string; name: string; email: string }; // User ID or User object
}

export default function ProposalDetailScreen() {
  const router = useRouter();
  const { proposalId } = useLocalSearchParams<{ proposalId: string }>();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Proposal>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'persqf' | 'without'>('persqf');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<View>(null);
  const [checkboxStates, setCheckboxStates] = useState<boolean[]>([false, false, false, false]);
  
  const checkboxLines = useMemo(() => [
    "Contractor will provide all necessary equipment, labor and materials",
    "Prices are valid for 30 days",
    "No money due until customer is satisfied with all completed work",
    "Contractor will not initiate any change orders"
  ], []);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckboxStates = [...checkboxStates];
    newCheckboxStates[index] = checked;
    setCheckboxStates(newCheckboxStates);
    
    // Update notes with selected lines
    const selectedLines = checkboxLines.filter((_, i) => newCheckboxStates[i]);
    const notesText = selectedLines.map((line, i) => `${i + 1}. ${line}`).join('\n');
    updateField("notes", notesText);
  };

  const fetchProposal = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}`, { headers });
      const data = await response.json();
      
      if (response.ok) {
        setProposal(data);
        setFormData(data);
        // Set the active tab based on whether persqf data exists
        setActiveTab(data.persqf && data.sqftTotal ? 'persqf' : 'without');
      } else {
        Alert.alert("Error", "Failed to load proposal");
        router.back();
      }
    } catch {
      Alert.alert("Network Error", "Unable to load proposal");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [proposalId, router]);

  const initializeCheckboxes = useCallback((notes: string) => {
    if (!notes) {
      setCheckboxStates([false, false, false, false]);
      return;
    }
    
    // Reset all checkboxes first
    const newCheckboxStates = [false, false, false, false];
    
    // Check each line to see if it appears in the notes
    checkboxLines.forEach((line, index) => {
      if (notes.includes(line)) {
        newCheckboxStates[index] = true;
      }
    });
    
    setCheckboxStates(newCheckboxStates);
  }, [checkboxLines]);

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId, fetchProposal]);

  // Initialize checkboxes when formData.notes changes
  useEffect(() => {
    if (formData.notes) {
      initializeCheckboxes(formData.notes);
    }
  }, [formData.notes, initializeCheckboxes]);

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    
    if (!formData.customerName?.trim()) nextErrors.customerName = "Customer name is required";
    if (!formData.address?.trim()) nextErrors.address = "Address is required";
    if (!formData.city?.trim()) nextErrors.city = "City is required";
    if (!formData.phone?.trim()) nextErrors.phone = "Phone is required";
    if (!formData.specifications?.trim()) nextErrors.specifications = "Specifications are required";
    if (!formData.process?.trim()) nextErrors.process = "Process is required";
    if (!formData.scope?.trim()) nextErrors.scope = "Scope is required";
    if (!formData.companyEmail?.trim()) nextErrors.companyEmail = "Company email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.companyEmail?.trim() && !emailRegex.test(formData.companyEmail.trim())) {
      nextErrors.companyEmail = "Please enter a valid company email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField(field: keyof Proposal, value: string) {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate total cost when per sq ft cost or sq ft total changes
      // Only auto-calculate if total cost is empty or matches the previous calculation
      if ((field === 'persqf' || field === 'sqftTotal') && activeTab === 'persqf') {
        const persqf = field === 'persqf' ? parseFloat(value) : parseFloat(prev.persqf || '0');
        const sqftTotal = field === 'sqftTotal' ? parseFloat(value) : parseFloat(prev.sqftTotal || '0');
        
        if (!isNaN(persqf) && !isNaN(sqftTotal) && persqf > 0 && sqftTotal > 0) {
          const calculatedTotal = (persqf * sqftTotal).toFixed(2);
          const currentTotal = parseFloat(prev.totalCost || '0');
          const previousCalculatedTotal = parseFloat(prev.persqf || '0') * parseFloat(prev.sqftTotal || '0');
          
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

  async function handleSave() {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/proposals/${proposalId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (response.ok) {
        setProposal(data);
        setEditing(false);
        Alert.alert("Success", "Proposal updated successfully", [
          { text: "OK", onPress: () => router.push("/dashboard") }
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to update proposal");
      }
    } catch {
      Alert.alert("Network Error", "Unable to update proposal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      "Delete Proposal",
      "Are you sure you want to delete this proposal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Get authentication token
              const token = await getToken();
              const headers: Record<string, string> = { 
                "Content-Type": "application/json"
              };
              
              if (token) {
                headers["Authorization"] = `Bearer ${token}`;
              }
              
              const response = await fetch(`${API_URL}/api/proposals/${proposalId}`, {
                method: "DELETE",
                headers,
              });
              
              if (response.ok) {
                Alert.alert("Success", "Proposal deleted successfully", [
                  { text: "OK", onPress: () => router.back() }
                ]);
              } else {
                Alert.alert("Error", "Failed to delete proposal");
              }
            } catch {
              Alert.alert("Error", "Unable to delete proposal");
            }
          }
        }
      ]
    );
  }

  function handleDropdownAction(action: string) {
    setShowDropdown(false);
    
    switch (action) {
      case 'edit':
        setEditing(true);
        break;
      case 'delete':
        handleDelete();
        break;
      case 'downloadProposal':
        // Call PDF download function
        handleDownloadProposal();
        break;
      case 'downloadInvoice':
        // Call invoice download function
        handleDownloadInvoice();
        break;
    }
  }


  async function handleDownloadProposal() {
    if (!proposal) return;
    
    try {
      const { generateProposalPDF } = await import("../utils/pdfGenerator");
      await generateProposalPDF(proposal);
      
      Alert.alert(
        "Proposal Generated",
        "Proposal has been generated and is ready to share!",
        [{ text: "OK" }]
      );
    } catch {
      console.error('Proposal generation error');
      Alert.alert(
        "Error",
        "Failed to generate proposal. Please try again."
      );
    }
  }

  async function handleDownloadInvoice() {
    if (!proposal) return;
    
    try {
      const { generateInvoicePDF } = await import("../utils/pdfGenerator");
      await generateInvoicePDF(proposal);
      
      Alert.alert(
        "Invoice Generated",
        "Invoice has been generated and is ready to share!",
        [{ text: "OK" }]
      );
    } catch {
      console.error('Invoice generation error');
      Alert.alert(
        "Error",
        "Failed to generate invoice. Please try again."
      );
    }
  }


  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00234C" />
          <Text style={styles.loadingText}>Loading Proposal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!proposal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.generalErrorText}>Proposal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header 
          title="Proposal Details"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightActions={
            <>
              {editing ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#00234C" />
                  ) : (
                    <MaterialIcons name="save" size={24} color="#00234C" />
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  ref={dropdownRef}
                  style={styles.actionButton}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <MaterialIcons name="more-vert" size={24} color="#00234C" />
                </TouchableOpacity>
              )}
            </>
          }
        />

        {/* Dropdown Menu Modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleDropdownAction('edit')}
              >
                <View style={styles.dropdownIconContainer}>
                  <MaterialIcons name="person" size={20} color="#666" />
                  <MaterialIcons name="edit" size={16} color="#666" style={styles.overlayIcon} />
                </View>
                <Text style={styles.dropdownText}>Edit Proposal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleDropdownAction('delete')}
              >
                <View style={styles.dropdownIconContainer}>
                  <MaterialIcons name="lock" size={20} color="#666" />
                </View>
                <Text style={styles.dropdownText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleDropdownAction('downloadProposal')}
              >
                <View style={styles.dropdownIconContainer}>
                  <MaterialIcons name="more-vert" size={20} color="#666" />
                  <MaterialIcons name="download" size={16} color="#666" style={styles.overlayIcon} />
                </View>
                <Text style={styles.dropdownText}>Download Proposal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleDropdownAction('downloadInvoice')}
              >
                <View style={styles.dropdownIconContainer}>
                  <MaterialIcons name="description" size={20} color="#666" />
                  <MaterialIcons name="attach-money" size={16} color="#666" style={styles.overlayIcon} />
                  <MaterialIcons name="download" size={16} color="#666" style={styles.overlayIcon} />
                </View>
                <Text style={styles.dropdownText}>Download Invoice</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Status Badges */}
        <View style={styles.statusContainer}>
          {proposal.sent && (
            <View style={[styles.statusBadge, styles.sentBadge]}>
              <Text style={styles.statusText}>Sent</Text>
            </View>
          )}
          {proposal.signed && (
            <View style={[styles.statusBadge, styles.signedBadge]}>
              <Text style={styles.statusText}>Signed</Text>
            </View>
          )}
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer:</Text>
          </View>
          <View style={styles.sectionContent}>
            {editing ? (
              <>
                <Text style={styles.label}>Customer Name</Text>
                <TextInput
                  style={[styles.input, errors.customerName && styles.inputError]}
                  value={formData.customerName || ""}
                  onChangeText={(value) => updateField("customerName", value)}
                  placeholder="Enter customer name"
                />
                {!!errors.customerName && <Text style={styles.errorText}>{errors.customerName}</Text>}
                
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  value={formData.address || ""}
                  onChangeText={(value) => updateField("address", value)}
                  placeholder="Enter address"
                />
                {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  value={formData.city || ""}
                  onChangeText={(value) => updateField("city", value)}
                  placeholder="Enter city"
                />
                {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </>
            ) : (
              <>
                <Text style={styles.customerName}>{proposal.customerName}</Text>
                <Text style={styles.customerAddress}>{proposal.address} {proposal.city}</Text>
              </>
            )}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact:</Text>
          <View style={styles.sectionContent}>
            {editing ? (
              <>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone || ""}
                  onChangeText={(value) => updateField("phone", value)}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                
                <Text style={styles.label}>Company Email</Text>
                <TextInput
                  style={[styles.input, errors.companyEmail && styles.inputError]}
                  value={formData.companyEmail || ""}
                  onChangeText={(value) => updateField("companyEmail", value)}
                  placeholder="Enter company email"
                  keyboardType="email-address"
                />
                {!!errors.companyEmail && <Text style={styles.errorText}>{errors.companyEmail}</Text>}
              </>
            ) : (
              <>
                <Text style={styles.contactText}>Mr. {proposal.customerName}</Text>
                <Text style={styles.contactText}>{proposal.companyEmail}</Text>
                <Text style={styles.contactText}>{proposal.phone}</Text>
              </>
            )}
          </View>
        </View>

        {/* Specifications Section - Only show if data exists or editing */}
        {(editing || (proposal.specifications && proposal.specifications.trim())) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications:</Text>
            <View style={styles.sectionContent}>
              {editing ? (
                <>
                  <Text style={styles.label}>Specifications</Text>
                  <TextInput
                    style={[styles.textArea, errors.specifications && styles.inputError]}
                    value={formData.specifications || ""}
                    onChangeText={(value) => updateField("specifications", value)}
                    placeholder="Enter specifications"
                    multiline
                    numberOfLines={4}
                  />
                  {!!errors.specifications && <Text style={styles.errorText}>{errors.specifications}</Text>}
                </>
              ) : (
                <Text style={styles.specText}>{proposal.specifications}</Text>
              )}
            </View>
          </View>
        )}

        {/* Process Section - Only show if data exists or editing */}
        {(editing || (proposal.process && proposal.process.trim())) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Process:</Text>
            <View style={styles.sectionContent}>
              {editing ? (
                <>
                  <Text style={styles.label}>Process</Text>
                  <TextInput
                    style={[styles.textArea, errors.process && styles.inputError]}
                    value={formData.process || ""}
                    onChangeText={(value) => updateField("process", value)}
                    placeholder="Enter process"
                    multiline
                    numberOfLines={3}
                  />
                  {!!errors.process && <Text style={styles.errorText}>{errors.process}</Text>}
                </>
              ) : (
                <Text style={styles.processText}>{proposal.process}</Text>
              )}
            </View>
          </View>
        )}

        {/* Scope Section - Only show if data exists or editing */}
        {(editing || (proposal.scope && proposal.scope.trim())) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope:</Text>
            <View style={styles.sectionContent}>
              {editing ? (
                <>
                  <Text style={styles.label}>Scope</Text>
                  <TextInput
                    style={[styles.textArea, errors.scope && styles.inputError]}
                    value={formData.scope || ""}
                    onChangeText={(value) => updateField("scope", value)}
                    placeholder="Enter scope"
                    multiline
                    numberOfLines={3}
                  />
                  {!!errors.scope && <Text style={styles.errorText}>{errors.scope}</Text>}
                </>
              ) : (
                <Text style={styles.specText}>{proposal.scope}</Text>
              )}
            </View>
          </View>
        )}

        {/* Pricing Information */}
        {editing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Information</Text>
            
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
                      value={formData.persqf || ""}
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
                      value={formData.sqftTotal || ""}
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
                  value={formData.totalCost || ""}
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
                  value={formData.quantity || ""}
                  onChangeText={(value) => updateField("quantity", value)}
                />

                <Text style={styles.label}>Total Cost</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.totalCost || ""}
                  onChangeText={(value) => updateField("totalCost", value)}
                />
              </View>
            )}
          </View>
        )}

        {/* Pricing Information - View Mode */}
        {!editing && ((proposal.persqf && proposal.persqf.trim()) || (proposal.sqftTotal && proposal.sqftTotal.trim()) || (proposal.quantity && proposal.quantity.trim()) || (proposal.totalCost && proposal.totalCost.trim())) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Information:</Text>
            <View style={styles.sectionContent}>
              {(proposal.persqf && proposal.persqf.trim() && proposal.sqftTotal && proposal.sqftTotal.trim()) ? (
                <>
                  <Text style={styles.pricingText}>Per Sq ft Cost: ${proposal.persqf}</Text>
                  <Text style={styles.pricingText}>Sq ft Total: {proposal.sqftTotal}</Text>
                  {proposal.totalCost && proposal.totalCost.trim() && (
                    <Text style={styles.pricingText}>Total Cost: ${proposal.totalCost}</Text>
                  )}
                </>
              ) : (
                <>
                  {proposal.quantity && proposal.quantity.trim() && (
                    <Text style={styles.pricingText}>Quantity: {proposal.quantity}</Text>
                  )}
                  {proposal.totalCost && proposal.totalCost.trim() && (
                    <Text style={styles.pricingText}>Total Cost: ${proposal.totalCost}</Text>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes:</Text>
          
          {editing ? (
            <>
              {checkboxLines.map((line, index) => (
                <View key={index} style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => handleCheckboxChange(index, !checkboxStates[index])}
                  >
                    <MaterialIcons 
                      name={checkboxStates[index] ? "check-box" : "check-box-outline-blank"} 
                      size={24} 
                      color="#00234C" 
                    />
                  </TouchableOpacity>
                  <Text style={styles.checkboxText}>{line}</Text>
                </View>
              ))}
              
              {/* Selected Notes Display */}
              {formData.notes && (
                <View style={styles.selectedNotesContainer}>
                  <Text style={styles.selectedNotesLabel}>
                    Selected Notes ({checkboxStates.filter(Boolean).length} selected):
                  </Text>
                  <View style={styles.selectedNotesBox}>
                    <Text style={styles.selectedNotesText}>{formData.notes}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.sectionContent}>
              {formData.notes ? (
                <View style={styles.notesList}>
                  <Text style={styles.noteItem}>{formData.notes}</Text>
                </View>
              ) : (
                <Text style={styles.noDataText}>No notes added to this proposal</Text>
              )}
            </View>
          )}
        </View>

        {/* Submitted By Section - Only show if user data exists */}
        {proposal?.createdBy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submitted By:</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.submittedText}>User ID: {typeof proposal.createdBy === 'string' ? proposal.createdBy : proposal.createdBy.id}</Text>
              <Text style={styles.submittedText}>Created: {new Date(proposal.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        )}

        {editing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditing(false);
                setFormData(proposal);
                setErrors({});
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#00234C" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  generalErrorText: { fontSize: 16, color: "#666" },
  
  // Action Button
  actionButton: { padding: 8 },
  
  // Dropdown Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownIconContainer: {
    position: 'relative',
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  // Form Elements
  label: { fontSize: 14, color: "#666", marginBottom: 8, fontWeight: "500" },
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
  
  // Status
  statusContainer: { flexDirection: "row", gap: 8, marginBottom: 20 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  sentBadge: { backgroundColor: "#E3F2FD" },
  signedBadge: { backgroundColor: "#E8F5E8" },
  statusText: { fontSize: 14, fontWeight: "600", color: "#1976D2" },
  
  // Sections
  section: {
    marginBottom: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  sectionContent: {
    marginTop: 5,
  },
  downloadButton: {
    marginLeft: 20,
  },
  
  // Customer Section
  customerName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  customerAddress: {
    fontSize: 16,
    color: "#333",
  },
  
  // Contact Section
  contactText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  
  // Specifications & Process
  specText: {
    fontSize: 16,
    color: "#333",
  },
  processText: {
    fontSize: 16,
    color: "#333",
  },
  
  // Scope Section
  scopeList: {
    marginTop: 5,
  },
  scopeItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  
  // Notes Section
  notesList: {
    marginTop: 5,
  },
  noteItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  
  // Checkbox styles
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  
  // Selected Notes Display
  selectedNotesContainer: {
    marginTop: 16,
  },
  selectedNotesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00234C",
    marginBottom: 8,
  },
  selectedNotesBox: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
  },
  selectedNotesText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  
  // Submitted By Section
  submittedText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  
  // Pricing Section
  pricingText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  
  
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
  calculationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic"
  },
  
  // Buttons
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 20, marginBottom: 40 },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },
});
