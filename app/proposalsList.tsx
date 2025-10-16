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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";

const { width } = Dimensions.get("window");

interface Proposal {
  _id: string;
  customerName: string;
  contactInformation: string;
  specifications: string;
  process: string;
  scope: string;
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

export default function ProposalsListScreen() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProposals();
  }, [currentPage, searchQuery]);

  async function fetchProposals() {
    try {
      setLoading(true);
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const response = await fetch(`${API_URL}/api/proposals?page=${currentPage}&limit=10${searchParam}`);
      const data: ProposalsResponse = await response.json();
      
      if (response.ok) {
        setProposals(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        Alert.alert("Error", "Failed to load proposals");
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to load proposals");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchProposals();
  }

  function handleSearch(text: string) {
    setSearchQuery(text);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  async function handleDeleteProposal(id: string) {
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
              const response = await fetch(`${API_URL}/api/proposals/${id}`, {
                method: "DELETE",
              });
              
              if (response.ok) {
                Alert.alert("Success", "Proposal deleted successfully");
                fetchProposals();
              } else {
                Alert.alert("Error", "Failed to delete proposal");
              }
            } catch (error) {
              Alert.alert("Error", "Unable to delete proposal");
            }
          }
        }
      ]
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function renderProposal({ item }: { item: Proposal }) {
    return (
      <TouchableOpacity
        style={styles.proposalCard}
        onPress={() => router.push(`/proposalDetail?proposalId=${item._id}`)}
      >
        <View style={styles.proposalHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
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
        </View>
        
        <Text style={styles.contactInfo}>{item.contactInformation}</Text>
        <Text style={styles.specifications} numberOfLines={2}>
          {item.specifications}
        </Text>
        
        <View style={styles.proposalFooter}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProposal(item._id)}
          >
            <MaterialIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  function renderPagination() {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageButton, i === currentPage && styles.activePageButton]}
          onPress={() => handlePageChange(i)}
        >
          <Text style={[styles.pageButtonText, i === currentPage && styles.activePageButtonText]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? "#ccc" : "#00234C"} />
        </TouchableOpacity>
        
        {pages}
        
        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? "#ccc" : "#00234C"} />
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && proposals.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00234C" />
          <Text style={styles.loadingText}>Loading Proposals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#00234C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proposals</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/proposal")}
          >
            <MaterialIcons name="add" size={24} color="#00234C" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search proposals..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {total} proposal{total !== 1 ? 's' : ''} • Page {currentPage} of {totalPages}
          </Text>
        </View>

        {/* Proposals List */}
        <FlatList
          data={proposals}
          renderItem={renderProposal}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Pagination */}
        {renderPagination()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#00234C" },
  
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 20 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#00234C" },
  addButton: { padding: 8 },
  
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#00234C" },
  
  // Stats
  statsContainer: { marginBottom: 16 },
  statsText: { fontSize: 14, color: "#666" },
  
  // List
  listContainer: { paddingBottom: 20 },
  proposalCard: {
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
  proposalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  customerName: { fontSize: 18, fontWeight: "600", color: "#00234C", flex: 1 },
  statusContainer: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  sentBadge: { backgroundColor: "#E3F2FD" },
  signedBadge: { backgroundColor: "#E8F5E8" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#1976D2" },
  contactInfo: { fontSize: 14, color: "#666", marginBottom: 8 },
  specifications: { fontSize: 14, color: "#333", marginBottom: 12, lineHeight: 20 },
  proposalFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontSize: 12, color: "#999" },
  deleteButton: { padding: 4 },
  
  // Pagination
  paginationContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, gap: 8 },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  activePageButton: { backgroundColor: "#00234C", borderColor: "#00234C" },
  disabledButton: { opacity: 0.5 },
  pageButtonText: { fontSize: 16, color: "#00234C" },
  activePageButtonText: { color: "#fff" },
});
