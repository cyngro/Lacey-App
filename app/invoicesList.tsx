import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import InvoiceDownloadButton from "../components/InvoiceDownloadButton";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { getToken } from "../utils/authStorage";

const { width } = Dimensions.get("window");

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
}

interface ProposalsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Proposal[];
}

export default function InvoicesListScreen() {
  const router = useRouter();
  const { selectedCompany, logout } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  async function fetchProposals() {
    try {
      setLoading(true);
      const companyParam = selectedCompany ? `&company=${encodeURIComponent(selectedCompany)}` : "";
      
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/proposals?page=1&limit=50${companyParam}`, { headers });
      const data: ProposalsResponse = await response.json();
      
      if (response.ok) {
        setProposals(data.data);
      } else {
        Alert.alert("Error", "Failed to load proposals");
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to load proposals");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchProposals();
    setRefreshing(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function formatCurrency(amount: string | number) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${num.toFixed(2)}`;
  }

  function renderInvoiceItem({ item }: { item: Proposal }) {
    return (
      <TouchableOpacity
        style={styles.invoiceCard}
        onPress={() => router.push(`/invoice?proposalId=${item._id}`)}
      >
        <View style={styles.invoiceHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.customerAddress}>{item.address}, {item.city}</Text>
            <Text style={styles.customerPhone}>{item.phone}</Text>
          </View>
          <View style={styles.invoiceActions}>
            <InvoiceDownloadButton proposal={item} size={20} color="#666" />
            <View style={styles.statusContainer}>
              {item.sent && (
                <View style={[styles.statusBadge, styles.sentBadge]}>
                  <Text style={styles.statusText}>Sent</Text>
                </View>
              )}
              {item.signed && (
                <View style={[styles.statusBadge, styles.signedBadge]}>
                  <Text style={styles.statusText}>Signed</Text>
                </View>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </View>
        </View>
        
        <View style={styles.invoiceDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Specifications:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{item.specifications}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Process:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{item.process}</Text>
          </View>
        </View>
        
        <View style={styles.invoiceFooter}>
          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Total Cost:</Text>
            <Text style={styles.costValue}>{formatCurrency(item.totalCost)}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00234C" />
          <Text style={styles.loadingText}>Loading Invoices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Header 
          title="Invoices"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightActions={
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/proposal")}
            >
              <MaterialIcons name="add" size={20} color="#00234C" />
              <Text style={styles.createButtonText}>New Proposal</Text>
            </TouchableOpacity>
          }
        />

        {/* Title */}
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Generate invoices from your proposals</Text>
        <Text style={styles.companyTitle}>{selectedCompany}</Text>

        {/* Invoices List */}
        {proposals.length > 0 ? (
          <FlatList
            data={proposals}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="description" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Proposals Found</Text>
            <Text style={styles.emptySubtitle}>Create your first proposal to generate invoices</Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => router.push("/proposal")}
            >
              <Text style={styles.createFirstButtonText}>Create Proposal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#00234C" },
  
  // Header
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  createButtonText: {
    fontSize: 14,
    color: "#00234C",
    fontWeight: "600",
    marginLeft: 4
  },
  
  // Title
  title: { fontSize: 28, fontWeight: "700", color: "#00234C", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 8 },
  companyTitle: { fontSize: 18, fontWeight: "600", color: "#666", marginBottom: 24 },
  
  // List
  listContainer: { paddingBottom: 20 },
  
  // Invoice Cards
  invoiceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  customerInfo: { flex: 1, marginRight: 12 },
  customerName: { fontSize: 18, fontWeight: "600", color: "#00234C", marginBottom: 4 },
  customerAddress: { fontSize: 14, color: "#666", marginBottom: 2 },
  customerPhone: { fontSize: 14, color: "#666" },
  invoiceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusContainer: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  sentBadge: { backgroundColor: "#E3F2FD" },
  signedBadge: { backgroundColor: "#E8F5E8" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#1976D2" },
  
  // Invoice Details
  invoiceDetails: { marginBottom: 12 },
  detailRow: { marginBottom: 8 },
  detailLabel: { fontSize: 14, fontWeight: "600", color: "#00234C", marginBottom: 2 },
  detailValue: { fontSize: 14, color: "#333", lineHeight: 20 },
  
  // Invoice Footer
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  costInfo: { flexDirection: "row", alignItems: "center" },
  costLabel: { fontSize: 14, color: "#666", marginRight: 8 },
  costValue: { fontSize: 16, fontWeight: "700", color: "#00234C" },
  dateText: { fontSize: 12, color: "#999" },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#333", marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 24 },
  createFirstButton: {
    backgroundColor: "#00234C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
