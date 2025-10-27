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
import Sidebar from "../components/Sidebar";
import BottomNavbar from "../components/BottomNavbar";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { getToken } from "../utils/authStorage";

const { width } = Dimensions.get("window");

interface DashboardData {
  invoices: number;
  proposals: number;
  views: { count: number; change: number; breakdown: { followers: number; nonFollowers: number } };
  reach: { count: number; change: number; breakdown: { followers: number; nonFollowers: number } };
  interactions: { count: number; change: number; breakdown: { followers: number; nonFollowers: number } };
  follows: { count: number; change: number; breakdown: { unfollows: number; notFollowers: number } };
}

interface MetaStatsData {
  success: boolean;
  message: string;
  pageId: string;
  stats: {
    id: string;
    name: string;
    category: string;
    fan_count: number;
    followers_count: number;
    link: string;
    website: string;
    phone: string;
    emails: string[];
    insights: {
      totalFans: number;
      totalViews: number;
      totalReach: number;
      totalImpressions: number;
      totalEngagement: number;
      fanAdds: number;
      fanRemoves: number;
      videoViews: number;
      postEngagements: number;
      dailyData: any[];
    };
    lastUpdated: string;
  };
  insights: {
    last_7_days: any;
    last_30_days: any;
    last_90_days: any;
  };
  posts: any[];
  demographics: any;
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
  const { selectedCompany } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchError, setSearchError] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'profile'>('home');
  const [metaStats, setMetaStats] = useState<MetaStatsData | null>(null);
  const [metaStatsLoading, setMetaStatsLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Initialize with null to show skeleton loading
      setDashboardData(null);
    } catch (error) {
      console.error("Failed to initialize dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTotalCounts = useCallback(async () => {
    try {
      const companyParam = selectedCompany ? `&company=${encodeURIComponent(selectedCompany)}` : "";
      const url = `${API_URL}/api/proposals?page=1&limit=1000${companyParam}`; // Get all proposals for counting
      
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      const data: ProposalsResponse = await response.json();
      
      if (response.ok) {
        // Calculate actual counts from all proposals data
        const totalProposalsCount = data.total || 0;
        const sentProposalsCount = data.data?.filter((proposal: Proposal) => proposal.sent)?.length || 0;
        
        // Update dashboard data with actual counts
        setDashboardData(prev => ({
          ...prev,
          proposals: totalProposalsCount,
          invoices: sentProposalsCount,
          views: prev?.views || { count: 0, change: 0, breakdown: { followers: 0, nonFollowers: 0 } },
          reach: prev?.reach || { count: 0, change: 0, breakdown: { followers: 0, nonFollowers: 0 } },
          interactions: prev?.interactions || { count: 0, change: 0, breakdown: { followers: 0, nonFollowers: 0 } },
          follows: prev?.follows || { count: 0, change: 0, breakdown: { unfollows: 0, notFollowers: 0 } }
        }));
      }
    } catch (error) {
      console.error("Failed to fetch total counts:", error);
    }
  }, [selectedCompany]);

  const fetchMetaStats = useCallback(async () => {
    try {
      setMetaStatsLoading(true);
      const pageId = "718131491384965";
      const url = `${API_URL}/api/meta-stats/pages/${pageId}`;
      console.log("Dashboard - Fetching meta stats for page:", pageId);
      console.log("Dashboard - Meta stats API URL:", url);
      
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      const data: MetaStatsData = await response.json();
      
      console.log("Dashboard - Meta stats response:", data);
      
      if (response.ok && data.success) {
        setMetaStats(data);
        
        // Update dashboard data with meta stats
        setDashboardData(prev => ({
          invoices: prev?.invoices || 0,
          proposals: prev?.proposals || 0,
          views: { 
            count: data.stats.insights.totalViews || 0, 
            change: 0.43,
            breakdown: { followers: 2.7, nonFollowers: 97.3 }
          },
          reach: { 
            count: data.stats.insights.totalReach || 0, 
            change: -1.39,
            breakdown: { followers: 2, nonFollowers: 23 }
          },
          interactions: { 
            count: data.stats.insights.totalEngagement || 0, 
            change: 0.39,
            breakdown: { followers: 0, nonFollowers: 4 }
          },
          follows: { 
            count: data.stats.insights.totalFans || 0, 
            change: 2.69,
            breakdown: { unfollows: 0, notFollowers: 2 }
          }
        }));
      } else {
        console.log("Dashboard - Failed to fetch meta stats, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch meta stats:", error);
    } finally {
      setMetaStatsLoading(false);
    }
  }, []);

  const fetchRecentProposals = useCallback(async () => {
    try {
      setProposalsLoading(true);
      const companyParam = selectedCompany ? `&company=${encodeURIComponent(selectedCompany)}` : "";
      const url = `${API_URL}/api/proposals?page=1&limit=10${companyParam}`;

      
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
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
  }, [selectedCompany]);

  useEffect(() => {
    fetchDashboardData();
    fetchTotalCounts();
    fetchMetaStats();
    fetchRecentProposals();
  }, [fetchDashboardData, fetchTotalCounts, fetchMetaStats, fetchRecentProposals]);

  // Refetch proposals when selectedCompany changes
  useEffect(() => {
    if (selectedCompany) {
      fetchTotalCounts();
      fetchRecentProposals();
    }
  }, [selectedCompany, fetchTotalCounts, fetchRecentProposals]);

  // Refresh proposals when screen comes into focus (e.g., returning from proposal detail)
  useFocusEffect(
    useCallback(() => {
      fetchTotalCounts();
      fetchRecentProposals();
    }, [fetchTotalCounts, fetchRecentProposals])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchTotalCounts(), fetchMetaStats(), fetchRecentProposals()]);
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
      // Search through proposals using the existing API
      const companyParam = selectedCompany ? `&company=${encodeURIComponent(selectedCompany)}` : "";
      const url = `${API_URL}/api/proposals?page=1&limit=1000${companyParam}`;
      
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (response.ok) {
        // Filter proposals by search query
        const filteredProposals = data.data?.filter((proposal: Proposal) => 
          proposal.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.specifications.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];
        
        Alert.alert("Search Results", `Found ${filteredProposals.length} results for "${searchQuery}"`);
      } else {
        Alert.alert("Search Error", "Search request failed");
      }
    } catch {
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

  function handleTabPress(tab: 'home' | 'chat' | 'profile') {
    setActiveTab(tab);
    if (tab === 'chat') {
      router.push('/chat');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
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
        <Header />



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
        {/* <View style={styles.searchContainer}>
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
        {!!searchError && <Text style={styles.errorText}>{searchError}</Text>} */}


        {/* Overview Section */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <View style={styles.businessSelector}>
              <Text style={styles.businessSelectorText}>Lacey Business Suite</Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Total Views */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E8F5E8' }]}>
                <MaterialIcons name="visibility" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.metricLabel}>Total Views</Text>
              {metaStatsLoading ? (
                <View style={styles.skeletonValue} />
              ) : (
                <Text style={styles.metricValue}>{dashboardData?.views.count || 0}</Text>
              )}
              {metaStatsLoading ? (
                <View style={styles.skeletonChange} />
              ) : (
                <Text style={[styles.metricChange, { color: '#4CAF50' }]}>
                  {formatChange(dashboardData?.views.change || 0).text}
                </Text>
              )}
              <View style={styles.progressBarContainer}>
                {metaStatsLoading ? (
                  <View style={styles.skeletonProgressBar} />
                ) : (
                  <View style={[styles.progressBar, { backgroundColor: '#4CAF50', width: '65%' }]} />
                )}
              </View>
            </View>

            {/* Total Reach */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialIcons name="trending-up" size={20} color="#FF9800" />
              </View>
              <Text style={styles.metricLabel}>Total Reach</Text>
              {metaStatsLoading ? (
                <View style={styles.skeletonValue} />
              ) : (
                <Text style={styles.metricValue}>{dashboardData?.reach.count || 0}</Text>
              )}
              {metaStatsLoading ? (
                <View style={styles.skeletonChange} />
              ) : (
                <Text style={[styles.metricChange, { color: '#F44336' }]}>
                  {formatChange(dashboardData?.reach.change || 0).text}
                </Text>
              )}
              <View style={styles.progressBarContainer}>
                {metaStatsLoading ? (
                  <View style={styles.skeletonProgressBar} />
                ) : (
                  <View style={[styles.progressBar, { backgroundColor: '#FF9800', width: '45%' }]} />
                )}
              </View>
            </View>

            {/* Fan Count */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E8F5E8' }]}>
                <MaterialIcons name="favorite" size={20} color="#E91E63" />
              </View>
              <Text style={styles.metricLabel}>Fan Count</Text>
              {metaStatsLoading ? (
                <View style={styles.skeletonValue} />
              ) : (
                <Text style={styles.metricValue}>{metaStats?.stats.fan_count || 0}</Text>
              )}
              {metaStatsLoading ? (
                <View style={styles.skeletonChange} />
              ) : (
                <Text style={[styles.metricChange, { color: '#4CAF50' }]}>
                  {formatChange(0).text}
                </Text>
              )}
              <View style={styles.progressBarContainer}>
                {metaStatsLoading ? (
                  <View style={styles.skeletonProgressBar} />
                ) : (
                  <View style={[styles.progressBar, { backgroundColor: '#E91E63', width: '20%' }]} />
                )}
              </View>
            </View>

            {/* Followers Count */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
                <MaterialIcons name="people" size={20} color="#2196F3" />
              </View>
              <Text style={styles.metricLabel}>Followers</Text>
              {metaStatsLoading ? (
                <View style={styles.skeletonValue} />
              ) : (
                <Text style={styles.metricValue}>{metaStats?.stats.followers_count || 0}</Text>
              )}
              {metaStatsLoading ? (
                <View style={styles.skeletonChange} />
              ) : (
                <Text style={[styles.metricChange, { color: '#4CAF50' }]}>
                  {formatChange(0).text}
                </Text>
              )}
              <View style={styles.progressBarContainer}>
                {metaStatsLoading ? (
                  <View style={styles.skeletonProgressBar} />
                ) : (
                  <View style={[styles.progressBar, { backgroundColor: '#2196F3', width: '20%' }]} />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Proposals Section - Only show if proposals are available */}
        {proposals.length > 0 && (
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
            ) : (
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
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      
      {/* Bottom Navigation */}
      <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />
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
  overviewTitle: { fontSize: 24, fontWeight: "700", color: "#00234C" },
  businessSelector: { 
    backgroundColor: "#F5F5F5", 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  businessSelectorText: { fontSize: 14, color: "#666" },
  
  // Metrics Grid
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: (width - 60) / 2,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: { fontSize: 14, fontWeight: "500", color: "#666", marginBottom: 8 },
  metricValue: { fontSize: 32, fontWeight: "700", color: "#00234C", marginBottom: 4 },
  metricChange: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  
  // Skeleton Loading Styles
  skeletonValue: {
    height: 32,
    width: '80%',
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonChange: {
    height: 14,
    width: '60%',
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonProgressBar: {
    height: "100%",
    width: '50%',
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
  },
  
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
