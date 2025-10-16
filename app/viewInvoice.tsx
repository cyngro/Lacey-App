import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";

const { width } = Dimensions.get("window");

type NavigationLike = { navigate: (route: string, params?: any) => void; goBack?: () => void } | undefined;

interface InvoiceItem {
  itemNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: boolean;
  total: number;
}

interface InvoiceData {
  id: string;
  billTo: {
    name: string;
    companyName: string;
    streetAddress: string;
    cityStateZip: string;
    phone: string;
  };
  shipTo: {
    name: string;
    companyName: string;
    streetAddress: string;
    cityStateZip: string;
    phone: string;
  };
  invoiceDetails: {
    salesperson: string;
    poNumber: string;
    shipDate: string;
    shipVia: string;
    fob: string;
    terms: string;
  };
  items: InvoiceItem[];
  financialSummary: {
    subtotal: number;
    taxable: number;
    taxRate: number;
    tax: number;
    shippingHandling: number;
    other: number;
    total: number;
  };
  comments: string[];
  footer: {
    companyName: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  };
}

export default function ViewInvoiceScreen({ navigation, route }: { navigation?: NavigationLike; route?: any }) {
  const initialId = route?.params?.id as string | undefined;
  const [invoiceId, setInvoiceId] = useState(initialId || "");
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialId) {
      fetchInvoice(initialId);
    }
  }, [initialId]);

  function validateId(id: string) {
    const value = id.trim();
    if (!value) {
      setError("Invoice ID is required");
      return false;
    }
    setError("");
    return true;
  }

  async function fetchInvoice(idParam?: string) {
    const id = (idParam ?? invoiceId).trim();
    if (!validateId(id)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/invoices/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Not found", data?.message || "Invoice not found");
        return;
      }
      setInvoice(data as InvoiceData);
    } catch (e) {
      Alert.alert("Network error", "Unable to load invoice");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!invoice?.id) return;
    try {
      const res = await fetch(`${API_URL}/invoices/${encodeURIComponent(invoice.id)}/pdf`);
      if (!res.ok) throw new Error("Failed");
      Alert.alert("Download", "PDF generated successfully");
    } catch (e) {
      Alert.alert("Error", "Could not download PDF");
    }
  }

  function formatCurrency(amount: number) {
    return `$${amount.toFixed(2)}`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.() || navigation?.navigate?.("Dashboard")} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#00234C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Invoice</Text>
          <TouchableOpacity style={styles.pdfButton} onPress={handleDownloadPDF}>
            <MaterialIcons name="picture-as-pdf" size={20} color="#00234C" />
            <Text style={styles.pdfButtonText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {/* ID Input */}
        {!invoice && (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.idInput}
              placeholder="Enter Invoice ID"
              placeholderTextColor="#999"
              value={invoiceId}
              onChangeText={(t) => {
                setInvoiceId(t);
                setError("");
              }}
              returnKeyType="search"
              onSubmitEditing={() => fetchInvoice()}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={() => fetchInvoice()}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Load</Text>}
            </TouchableOpacity>
          </View>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {/* Invoice Content */}
        {invoice && (
          <View style={styles.invoiceContent}>
            {/* Billing and Shipping Information */}
            <View style={styles.billShipSection}>
              <View style={styles.billToSection}>
                <Text style={styles.sectionLabel}>BILL TO:</Text>
                <Text style={styles.addressText}>{invoice.billTo.name}</Text>
                <Text style={styles.addressText}>{invoice.billTo.companyName}</Text>
                <Text style={styles.addressText}>{invoice.billTo.streetAddress}</Text>
                <Text style={styles.addressText}>{invoice.billTo.cityStateZip}</Text>
                <Text style={styles.addressText}>{invoice.billTo.phone}</Text>
              </View>
              <View style={styles.shipToSection}>
                <Text style={styles.sectionLabel}>SHIP TO:</Text>
                <Text style={styles.addressText}>{invoice.shipTo.name}</Text>
                <Text style={styles.addressText}>{invoice.shipTo.companyName}</Text>
                <Text style={styles.addressText}>{invoice.shipTo.streetAddress}</Text>
                <Text style={styles.addressText}>{invoice.shipTo.cityStateZip}</Text>
                <Text style={styles.addressText}>{invoice.shipTo.phone}</Text>
              </View>
            </View>

            {/* Invoice Details */}
            <View style={styles.invoiceDetailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SALESPERSON:</Text>
                <Text style={styles.detailValue}>{invoice.invoiceDetails.salesperson}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>P.O. #:</Text>
                <Text style={styles.detailValue}>{invoice.invoiceDetails.poNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SHIP DATE:</Text>
                <Text style={styles.detailValue}>{invoice.invoiceDetails.shipDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SHIP VIA:</Text>
                <Text style={styles.detailValue}>{invoice.invoiceDetails.shipVia}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>F.O.B.:</Text>
                <Text style={styles.detailValue}>{invoice.invoiceDetails.fob}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TERMS:</Text>
                <Text style={styles.detailValue}>{invoice.invoiceDetails.terms}</Text>
              </View>
            </View>

            {/* Items Table */}
            <View style={styles.itemsSection}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.itemNumberCol]}>ITEM #</Text>
                <Text style={[styles.tableHeaderText, styles.descriptionCol]}>DESCRIPTION</Text>
                <Text style={[styles.tableHeaderText, styles.qtyCol]}>QTY</Text>
                <Text style={[styles.tableHeaderText, styles.unitPriceCol]}>UNIT PRICE</Text>
                <Text style={[styles.tableHeaderText, styles.taxCol]}>TAX</Text>
                <Text style={[styles.tableHeaderText, styles.totalCol]}>TOTAL</Text>
              </View>
              {invoice.items.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCellText, styles.itemNumberCol]}>{item.itemNumber}</Text>
                  <Text style={[styles.tableCellText, styles.descriptionCol]}>{item.description}</Text>
                  <Text style={[styles.tableCellText, styles.qtyCol]}>{item.quantity}</Text>
                  <Text style={[styles.tableCellText, styles.unitPriceCol]}>{formatCurrency(item.unitPrice)}</Text>
                  <Text style={[styles.tableCellText, styles.taxCol]}>{item.tax ? "X" : ""}</Text>
                  <Text style={[styles.tableCellText, styles.totalCol]}>{formatCurrency(item.total)}</Text>
                </View>
              ))}
            </View>

            {/* Financial Summary */}
            <View style={styles.financialSection}>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>SUBTOTAL:</Text>
                <Text style={styles.financialValue}>{formatCurrency(invoice.financialSummary.subtotal)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>TAXABLE:</Text>
                <Text style={styles.financialValue}>{formatCurrency(invoice.financialSummary.taxable)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>TAX RATE:</Text>
                <Text style={styles.financialValue}>{invoice.financialSummary.taxRate}%</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>TAX:</Text>
                <Text style={styles.financialValue}>{formatCurrency(invoice.financialSummary.tax)}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>S&H:</Text>
                <Text style={styles.financialValue}>{invoice.financialSummary.shippingHandling ? formatCurrency(invoice.financialSummary.shippingHandling) : ""}</Text>
              </View>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>OTHER:</Text>
                <Text style={styles.financialValue}>{invoice.financialSummary.other ? formatCurrency(invoice.financialSummary.other) : ""}</Text>
              </View>
              <View style={[styles.financialRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.financialSummary.total)}</Text>
              </View>
            </View>

            {/* Comments */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>Other Comments or Special Instructions</Text>
              {invoice.comments.map((comment, index) => (
                <Text key={index} style={styles.commentText}>{`${index + 1}. ${comment}`}</Text>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>Make all checks payable to {invoice.footer.companyName}</Text>
              <Text style={styles.footerText}>If you have any questions about this invoice, please contact {invoice.footer.contactName}, {invoice.footer.contactPhone}, {invoice.footer.contactEmail}</Text>
              <Text style={styles.footerText}>Thank You For Your Business!</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20 },
  
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 20 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#00234C" },
  pdfButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#00234C", borderRadius: 6 },
  pdfButtonText: { marginLeft: 4, color: "#00234C", fontWeight: "600" },
  
  // Search
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  idInput: { flex: 1, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#00234C" },
  searchBtn: { marginLeft: 10, backgroundColor: "#00234C", paddingHorizontal: 16, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "600" },
  errorText: { color: "#F44336", fontSize: 12, marginBottom: 10 },
  
  // Invoice Content
  invoiceContent: { marginBottom: 30 },
  
  // Bill/Ship Section
  billShipSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  billToSection: { flex: 1, marginRight: 20 },
  shipToSection: { flex: 1 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#00234C", marginBottom: 8 },
  addressText: { fontSize: 14, color: "#333", marginBottom: 2 },
  
  // Invoice Details
  invoiceDetailsSection: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  detailRow: { flexDirection: "row", alignItems: "center", marginRight: 20, marginBottom: 8 },
  detailLabel: { fontSize: 12, fontWeight: "600", color: "#00234C", marginRight: 8 },
  detailValue: { fontSize: 12, color: "#333" },
  
  // Items Table
  itemsSection: { marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F5F5F5", paddingVertical: 8, paddingHorizontal: 4 },
  tableHeaderText: { fontSize: 12, fontWeight: "700", color: "#00234C" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E0E0E0", paddingVertical: 8, paddingHorizontal: 4 },
  tableCellText: { fontSize: 12, color: "#333" },
  
  // Table Columns
  itemNumberCol: { width: "15%" },
  descriptionCol: { width: "30%" },
  qtyCol: { width: "10%" },
  unitPriceCol: { width: "15%" },
  taxCol: { width: "10%" },
  totalCol: { width: "20%" },
  
  // Financial Summary
  financialSection: { alignItems: "flex-end", marginBottom: 20 },
  financialRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  financialLabel: { fontSize: 12, color: "#333" },
  financialValue: { fontSize: 12, color: "#333" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#E0E0E0", paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#00234C" },
  totalValue: { fontSize: 14, fontWeight: "700", color: "#00234C" },
  
  // Comments
  commentsSection: { marginBottom: 20 },
  commentsTitle: { fontSize: 14, fontWeight: "600", color: "#00234C", marginBottom: 8 },
  commentText: { fontSize: 12, color: "#333", marginBottom: 4 },
  
  // Footer
  footerSection: { alignItems: "center", marginTop: 20 },
  footerText: { fontSize: 12, color: "#333", textAlign: "center", marginBottom: 4 },
});
