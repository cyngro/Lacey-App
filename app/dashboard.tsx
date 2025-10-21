import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import PDFDownloadButton from "../components/PDFDownloadButton";
import Sidebar from "../components/Sidebar";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

type NavigationLike = { navigate: (route: string) => void; goBack?: () => void } | undefined;

interface DashboardData {
  invoices: number;
  proposals: number;
  views: { count: number; change: number; breakdown: { followers: number; nonFollowers: number } };
  reach: { count: number; change: number; breakdown: { followers: number; nonFollowers: number } };
  interactions: { count: number; change: number; breakdown: { followers: number; nonFollowers: number } };
  follows: { count: number; change: number; breakdown: { unfollows: number; notFollowers: number } };
}

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

export default function DashboardScreen() {
  const router = useRouter();
  const { logout, selectedCompany } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchError, setSearchError] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  async function handleLogout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.push("/");
          }
        }
      ]
    );
  }

  useEffect(() => {
    fetchDashboardData();
    fetchRecentProposals();
  }, []);

  // Refetch proposals when selectedCompany changes
  useEffect(() => {
    if (selectedCompany) {
      fetchRecentProposals();
    }
  }, [selectedCompany]);

  // Refresh proposals when screen comes into focus (e.g., returning from proposal detail)
  useFocusEffect(
    useCallback(() => {
      fetchRecentProposals();
    }, [])
  );

  async function fetchDashboardData() {
    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
      } else {
        Alert.alert("Error", "Failed to load dashboard data");
      }
    } catch (error) {
      // Alert.alert("Network Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentProposals() {
    try {
      setProposalsLoading(true);
      const companyParam = selectedCompany ? `&company=${encodeURIComponent(selectedCompany)}` : "";
      const url = `${API_URL}/api/proposals?page=1&limit=10${companyParam}`;
      console.log("Dashboard - Fetching proposals for company:", selectedCompany);
      console.log("Dashboard - API URL:", url);
      
      const response = await fetch(url);
      const data: ProposalsResponse = await response.json();
      
      console.log("Dashboard - Proposals response:", data);
      console.log("Dashboard - Number of proposals:", data.data?.length || 0);
      
      if (response.ok) {
        setProposals(data.data);
      } else {
        console.log("Dashboard - Failed to fetch proposals, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
    } finally {
      setProposalsLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchRecentProposals();
    setRefreshing(false);
  }

  function validateSearch() {
    if (searchQuery.trim().length < 2) {
      setSearchError("Search query must be at least 2 characters");
      return false;
    }
    setSearchError("");
    return true;
  }

  async function handleSearch() {
    if (!validateSearch()) return;
    
    try {
      const response = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        // Handle search results - could navigate to results screen
        Alert.alert("Search Results", `Found ${data.results?.length || 0} results for "${searchQuery}"`);
      } else {
        Alert.alert("Search Error", data.message || "Search failed");
      }
    } catch (error) {
      Alert.alert("Network Error", "Search request failed");
    }
  }

  function formatChange(change: number) {
    const sign = change >= 0 ? "↑" : "↓";
    const color = change >= 0 ? "#4CAF50" : "#F44336";
    return { text: `${sign} ${Math.abs(change).toFixed(1)}%`, color };
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
          <View style={styles.proposalHeaderActions}>
            {/* <TouchableOpacity 
              style={styles.invoiceButtonSmall}
              onPress={() => router.push(`/invoice?proposalId=${item._id}`)}
            >
              <MaterialIcons name="description" size={16} color="#00234C" />
            </TouchableOpacity>
            <PDFDownloadButton proposal={item} size={20} color="#666" /> */}
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
        </View>
        
        <Text style={styles.contactInfo}>{item.address}, {item.city} • {item.phone}</Text>
        <Text style={styles.specifications} numberOfLines={2}>
          {item.specifications}
        </Text>
        
        <View style={styles.proposalFooter}>
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
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header 
          onMenuPress={() => setSidebarVisible(true)}
          logo={require("../assets/images/dashbord.png")}
        />



        {/* Main Title and Action Button */}
        <View style={styles.titleButtonContainer}>
          <Text style={styles.mainTitle}>
            {selectedCompany ? `${selectedCompany} Dashboard` : 'Welcome Dashboard'}
          </Text>
          <TouchableOpacity style={styles.actionButton}
            onPress={() => router.push("/proposal")}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Proposal / Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Proposals, Invoices, Clients..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setSearchError("");
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Invoice</Text>
            <Text style={styles.summaryNumber}>{dashboardData?.invoices || 15}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={[styles.summaryCard, { backgroundColor: "#2196F3" }]}>
            <Text style={styles.summaryTitle}>Proposals</Text>
            <Text style={styles.summaryNumber}>{dashboardData?.proposals || 10}</Text>
          </View>
        </View>

        {/* Overview Section */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <TouchableOpacity style={styles.customizeButton}>
              <Text style={styles.customizeText}>Customise view: Business</Text>
              <MaterialIcons name="keyboard-arrow-down" size={16} color="#00234C" />
            </TouchableOpacity>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Views */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>Views</Text>
                <MaterialIcons name="info-outline" size={16} color="#666" />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.views.count || 365}</Text>
              <Text style={[styles.metricChange, { color: formatChange(dashboardData?.views.change || 22.1).color }]}>
                {formatChange(dashboardData?.views.change || 22.1).text}
              </Text>
              <View style={styles.metricBreakdown}>
                <Text style={styles.breakdownText}>
                  From followers {dashboardData?.views.breakdown.followers || 2.7}% ↓ 37.2%
                </Text>
                <Text style={styles.breakdownText}>
                  From non-followers {dashboardData?.views.breakdown.nonFollowers || 97.3}% ↑ 1.7%
                </Text>
              </View>
              <View style={styles.miniGraph}>
                <View style={styles.graphLine} />
              </View>
              <MaterialIcons name="chevron-right" size={16} color="#666" style={styles.cardArrow} />
            </View>

            {/* Reach */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>Reach</Text>
                <MaterialIcons name="info-outline" size={16} color="#666" />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.reach.count || 25}</Text>
              <Text style={[styles.metricChange, { color: formatChange(dashboardData?.reach.change || -7.4).color }]}>
                {formatChange(dashboardData?.reach.change || -7.4).text}
              </Text>
              <View style={styles.metricBreakdown}>
                <Text style={styles.breakdownText}>
                  From followers {dashboardData?.reach.breakdown.followers || 2} ↓ 60%
                </Text>
                <Text style={styles.breakdownText}>
                  From non-followers {dashboardData?.reach.breakdown.nonFollowers || 23} ↑ 4.5%
                </Text>
              </View>
              <View style={styles.miniGraph}>
                <View style={styles.graphLine} />
              </View>
              <MaterialIcons name="chevron-right" size={16} color="#666" style={styles.cardArrow} />
            </View>

            {/* Interactions */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>Interactions</Text>
                <MaterialIcons name="info-outline" size={16} color="#666" />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.interactions.count || 4}</Text>
              <Text style={[styles.metricChange, { color: "#000" }]}>0%</Text>
              <View style={styles.metricBreakdown}>
                <Text style={styles.breakdownText}>From followers --</Text>
                <Text style={styles.breakdownText}>From non-followers {dashboardData?.interactions.breakdown.nonFollowers || 4} 0%</Text>
              </View>
              <View style={styles.miniGraph}>
                <View style={styles.graphLine} />
              </View>
              <MaterialIcons name="chevron-right" size={16} color="#666" style={styles.cardArrow} />
            </View>

            {/* Follows */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>Follows</Text>
                <MaterialIcons name="info-outline" size={16} color="#666" />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.follows.count || 2}</Text>
              <Text style={[styles.metricChange, { color: formatChange(dashboardData?.follows.change || -33.3).color }]}>
                {formatChange(dashboardData?.follows.change || -33.3).text}
              </Text>
              <View style={styles.metricBreakdown}>
                <Text style={styles.breakdownText}>Unfollows {dashboardData?.follows.breakdown.unfollows || 0} 0%</Text>
                <Text style={styles.breakdownText}>Not followers {dashboardData?.follows.breakdown.notFollowers || 2} ↓ 33.3%</Text>
              </View>
              <View style={styles.miniGraph}>
                <View style={styles.graphLine} />
              </View>
              <MaterialIcons name="chevron-right" size={16} color="#666" style={styles.cardArrow} />
            </View>
          </View>
        </View>

        {/* Recent Proposals Section */}
        <View style={styles.proposalsSection}>
          <View style={styles.proposalsHeader}>
            <Text style={styles.proposalsTitle}>Recent Proposals</Text>
            <View style={styles.headerActions}>
              
              <TouchableOpacity onPress={() => router.push("/proposalsList")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {proposalsLoading ? (
            <View style={styles.proposalsLoading}>
              <ActivityIndicator size="small" color="#00234C" />
              <Text style={styles.loadingText}>Loading proposals...</Text>
            </View>
          ) : proposals.length > 0 ? (
            <FlatList
              data={proposals}
              renderItem={renderProposal}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
            />
          ) : (
            <View style={styles.noProposals}>
              <Text style={styles.noProposalsText}>No proposals yet</Text>
              <TouchableOpacity 
                style={styles.createProposalButton}
                onPress={() => router.push("/proposal")}
              >
                <Text style={styles.createProposalText}>Create Your First Proposal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#00234C" },
  
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 60, marginBottom: 20 },
  logoContainer: { flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "center" },
  logo: { width: 200, height: 50, marginRight: 12 },
  logoText: { flexDirection: "column" },
  companyName: { fontSize: 16, fontWeight: "700", color: "#00234C" },
  companySubtitle: { fontSize: 12, color: "#666", marginTop: 2 },
  menuButton: { padding: 8 },
  
  // Back Button
  backButton: { alignSelf: "flex-start", paddingVertical: 6, marginBottom: 20 },
  
  // Title and Button Container
  titleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: { 
    fontSize: 32, 
    fontWeight: "700", 
    color: "#00234C", 
    flex: 1 
  },
  actionButton: {
    backgroundColor: "#00234C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  secondaryActionButton: {
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flex: 1,
  },
  secondaryActionButtonText: { color: "#00234C", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#00234C" },
  errorText: { color: "#F44336", fontSize: 12, marginTop: -10, marginBottom: 10 },
  
  // Summary Cards
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "#00234C",
    borderRadius: 12,
    marginBottom: 30,
    overflow: "hidden",
  },
  summaryCard: { flex: 1, padding: 20, alignItems: "center" },
  summaryDivider: { width: 1, backgroundColor: "#fff", opacity: 0.3 },
  summaryTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  summaryNumber: { color: "#fff", fontSize: 24, fontWeight: "700" },
  
  // Overview
  overviewSection: { marginBottom: 30 },
  overviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  overviewTitle: { fontSize: 20, fontWeight: "700", color: "#00234C" },
  customizeButton: { flexDirection: "row", alignItems: "center" },
  customizeText: { fontSize: 14, color: "#00234C", marginRight: 4 },
  
  // Metrics Grid
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  metricCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
    position: "relative",
  },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  metricTitle: { fontSize: 14, fontWeight: "600", color: "#00234C" },
  metricValue: { fontSize: 28, fontWeight: "700", color: "#00234C", marginBottom: 4 },
  metricChange: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  metricBreakdown: { marginBottom: 12 },
  breakdownText: { fontSize: 12, color: "#666", marginBottom: 2 },
  miniGraph: { height: 20, marginBottom: 8 },
  graphLine: { height: 2, backgroundColor: "#2196F3", borderRadius: 1 },
  cardArrow: { position: "absolute", top: 16, right: 16 },
  
  // Proposals Section
  proposalsSection: { marginBottom: 30 },
  proposalsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  proposalsTitle: { fontSize: 20, fontWeight: "700", color: "#00234C" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  invoiceButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#f5f5f5", 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  invoiceButtonText: { 
    fontSize: 12, 
    color: "#00234C", 
    fontWeight: "600", 
    marginLeft: 4 
  },
  viewAllText: { fontSize: 14, color: "#2196F3", fontWeight: "600" },
  proposalsLoading: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 20 },
  noProposals: { alignItems: "center", padding: 20 },
  noProposalsText: { fontSize: 16, color: "#666", marginBottom: 12 },
  createProposalButton: { backgroundColor: "#00234C", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  createProposalText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  
  // Proposal Cards
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
  customerName: { fontSize: 16, fontWeight: "600", color: "#00234C", flex: 1 },
  proposalHeaderActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  invoiceButtonSmall: {
    backgroundColor: "#f5f5f5",
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  statusContainer: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  sentBadge: { backgroundColor: "#E3F2FD" },
  signedBadge: { backgroundColor: "#E8F5E8" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#1976D2" },
  contactInfo: { fontSize: 14, color: "#666", marginBottom: 8 },
  specifications: { fontSize: 14, color: "#333", marginBottom: 12, lineHeight: 20 },
  proposalFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontSize: 12, color: "#999" },
});
