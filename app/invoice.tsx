import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import InvoiceDownloadButton from "../components/InvoiceDownloadButton";
import { API_URL } from "../constants/api";
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

export default function InvoiceScreen() {
  const router = useRouter();
  const { proposalId } = useLocalSearchParams<{ proposalId: string }>();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Proposal>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  async function fetchProposal() {
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
      } else {
        Alert.alert("Error", "Failed to load proposal");
        router.back();
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to load proposal");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function formatCurrency(amount: string | number) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num) || num === null || num === undefined) {
      return '$0.00';
    }
    return `$${num.toFixed(2)}`;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00234C" />
          <Text style={styles.loadingText}>Loading Invoice...</Text>
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
          title="Create Invoice"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightActions={
            proposal && (
              <InvoiceDownloadButton proposal={proposal} size={20} color="#666" />
            )
          }
        />

        {/* Invoice Content */}
        <View style={styles.invoiceContainer}>
          {/* Company Header */}
          <View style={styles.companyHeader}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
              <Image 
                source={require("../assets/images/dashbord.png")} 
                style={styles.logo} 
                resizeMode="contain" 
            />
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>SOLID ROCK</Text>
                <Text style={styles.companySubtitle}>STONE WORK LLC</Text>
              </View>
            </View>
          </View>

          {/* Customer Info Section */}
          <View style={styles.customerInfoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>CUSTOMER INFO</Text>
            </View>
            <View style={styles.customerFields}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Name</Text>
                <View style={styles.dashedLine} />
                <Text style={styles.fieldValue}>{proposal.customerName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Address</Text>
                <View style={styles.dashedLine} />
                <Text style={styles.fieldValue}>{proposal.address}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>City</Text>
                <View style={styles.dashedLine} />
                <Text style={styles.fieldValue}>{proposal.city}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <View style={styles.dashedLine} />
                <Text style={styles.fieldValue}>{proposal.phone}</Text>
              </View>
            </View>
          </View>

          {/* Proposal Details Header */}
          <View style={styles.proposalDetailsHeader}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Created By</Text>
              <Text style={styles.detailValue}>Andrew Lacey</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(proposal.createdAt)}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Scope</Text>
              <Text style={styles.detailValue}>Stone Work</Text>
            </View>
          </View>

          {/* Specifications Table */}
          <View style={styles.specificationsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.srColumn]}>SR</Text>
              <Text style={[styles.tableHeaderText, styles.specColumn]}>Specifications</Text>
              <Text style={[styles.tableHeaderText, styles.processColumn]}>Process</Text>
              <Text style={[styles.tableHeaderText, styles.quantityColumn]}>Quantity</Text>
              <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.srColumn]}>1</Text>
              <Text style={[styles.tableCellText, styles.specColumn]}>{proposal.specifications}</Text>
              <Text style={[styles.tableCellText, styles.processColumn]}>{proposal.process}</Text>
              <Text style={[styles.tableCellText, styles.quantityColumn]}>
                {proposal.persqf && proposal.sqftTotal ? proposal.sqftTotal : proposal.quantity}
              </Text>
              <Text style={[styles.tableCellText, styles.totalColumn]}>{formatCurrency(proposal.totalCost)}</Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsHeaderText}>Other comments or Special instruction</Text>
            </View>
            <View style={styles.commentsContent}>
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SUBTOTAL</Text>
                  <Text style={styles.totalColon}>:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(proposal.totalCost)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalColon}>:</Text>
                  <Text style={[styles.totalValue, styles.totalValueHighlighted]}>{formatCurrency(proposal.totalCost)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.commentsTable}>
              <View style={styles.commentsTableHeader}>
                <Text style={[styles.commentsTableHeaderText, styles.commentsSrColumn]}>SR</Text>
                <Text style={[styles.commentsTableHeaderText, styles.commentsTextColumn]}>Terms & Conditions</Text>
              </View>
              <View style={styles.commentsTableRow}>
                <Text style={[styles.commentsTableCell, styles.commentsSrColumn]}>1</Text>
                <Text style={[styles.commentsTableCell, styles.commentsTextColumn]}>Contractor will provide all necessary equipment, labor and materials</Text>
              </View>
              <View style={styles.commentsTableRow}>
                <Text style={[styles.commentsTableCell, styles.commentsSrColumn]}>2</Text>
                <Text style={[styles.commentsTableCell, styles.commentsTextColumn]}>Prices are valid for 30 days</Text>
              </View>
              <View style={styles.commentsTableRow}>
                <Text style={[styles.commentsTableCell, styles.commentsSrColumn]}>3</Text>
                <Text style={[styles.commentsTableCell, styles.commentsTextColumn]}>No money due until customer is satisfied with all completed work</Text>
              </View>
              <View style={styles.commentsTableRow}>
                <Text style={[styles.commentsTableCell, styles.commentsSrColumn]}>4</Text>
                <Text style={[styles.commentsTableCell, styles.commentsTextColumn]}>Contractor will not initiate any change orders</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Submitted By: Andrew Lacey</Text>
            <Text style={styles.footerText}>terryasphalt@gmail.com</Text>
            <Text style={styles.footerText}>443-271-3811</Text>
          </View>
        </View>
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
  
  // Invoice Container
  invoiceContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
  },
  
  // Company Header
  companyHeader: {
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00234C",
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00234C",
  },
  
  // Customer Info Section
  customerInfoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: "#00234C",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  sectionHeaderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  customerFields: {
    paddingHorizontal: 10,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#333",
    minWidth: 60,
    marginRight: 10,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderStyle: "dashed",
    marginRight: 10,
  },
  fieldValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  
  // Proposal Details Header
  proposalDetailsHeader: {
    flexDirection: "row",
    backgroundColor: "#00234C",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  detailColumn: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  
  // Specifications Table
  specificationsTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00234C",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 60,
  },
  tableCellText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  
  // Table Columns
  srColumn: { width: "10%" },
  specColumn: { width: "30%", textAlign: "left", paddingLeft: 4 },
  processColumn: { width: "25%", textAlign: "left", paddingLeft: 4 },
  quantityColumn: { width: "15%" },
  totalColumn: { width: "20%", textAlign: "right", paddingRight: 20 },
  
  // Comments Section
  commentsSection: {
    marginBottom: 20,
  },
  commentsHeader: {
    backgroundColor: "#00234C",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  commentsHeaderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  commentsContent: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginRight: 10,
  },
  commentsList: {
    flex: 1,
    marginRight: 20,
  },
  commentItem: {
    fontSize: 12,
    color: "#333",
    marginBottom: 8,
    lineHeight: 16,
  },
  
  // Comments Table
  commentsTable: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
  },
  commentsTableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  commentsTableHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00234C",
    textAlign: "center",
  },
  commentsTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  commentsTableCell: {
    fontSize: 12,
    color: "#333",
    paddingVertical: 4,
  },
  
  // Comments Table Columns
  commentsSrColumn: { width: "15%", textAlign: "center" },
  commentsTextColumn: { width: "85%", textAlign: "left", paddingLeft: 8 },
  totalsSection: {
    width: 200,
    alignSelf: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    minWidth: 80,
    paddingLeft: 10,
  },
  totalColon: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginHorizontal: 8,
  },
  totalValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  totalValueHighlighted: {
    color: "#00234C",
    fontWeight: "700",
  },
  
  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});
