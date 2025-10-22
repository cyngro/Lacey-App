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
import Header from "../components/Header";
import { getToken } from "../utils/authStorage";

const { width } = Dimensions.get("window");

type NavigationLike = { navigate: (route: string, params?: any) => void; goBack?: () => void } | undefined;

interface ProposalDetail {
  id: string;
  customer?: { name?: string; address?: string };
  contact?: { name?: string; email?: string; phone?: string };
  specifications?: string;
  process?: string;
  scope?: string[];
  notes?: string[];
  submittedBy?: { name?: string; email?: string; phone?: string };
}

export default function ViewProposalScreen({ navigation, route }: { navigation?: NavigationLike; route?: any }) {
  const initialId = route?.params?.id as string | undefined;
  const [proposalId, setProposalId] = useState(initialId || "");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialId) {
      fetchProposal(initialId);
    }
  }, [initialId]);

  function validateId(id: string) {
    const value = id.trim();
    if (!value) {
      setError("Proposal ID is required");
      return false;
    }
    setError("");
    return true;
  }

  async function fetchProposal(idParam?: string) {
    const id = (idParam ?? proposalId).trim();
    if (!validateId(id)) return;
    setLoading(true);
    try {
      // Get authentication token
      const token = await getToken();
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/proposals/${encodeURIComponent(id)}`, { headers });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Not found", data?.message || "Proposal not found");
        return;
      }
      setProposal(data as ProposalDetail);
    } catch (e) {
      Alert.alert("Network error", "Unable to load proposal");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!proposal?.id) return;
    try {
      const res = await fetch(`${API_URL}/proposals/${encodeURIComponent(proposal.id)}/pdf`);
      if (!res.ok) throw new Error("Failed");
      Alert.alert("Download", "PDF generated (hook up file viewer if needed)");
    } catch (e) {
      Alert.alert("Error", "Could not download PDF");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header 
          title="View Proposal"
          showBackButton={true}
          onBackPress={() => navigation?.goBack?.() || navigation?.navigate?.("Dashboard")}
        />

        {/* ID Input */}
        {!proposal && (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.idInput}
              placeholder="Enter Proposal ID"
              placeholderTextColor="#999"
              value={proposalId}
              onChangeText={(t) => {
                setProposalId(t);
                setError("");
              }}
              returnKeyType="search"
              onSubmitEditing={() => fetchProposal()}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={() => fetchProposal()}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Load</Text>}
            </TouchableOpacity>
          </View>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {/* Content */}
        {proposal && (
          <View>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeading}>Customer:</Text>
                <Text style={styles.bodyText}>{proposal.customer?.name || ""}</Text>
                <Text style={styles.bodyText}>{proposal.customer?.address || ""}</Text>
              </View>
              <TouchableOpacity style={styles.pdfBtn} onPress={handleDownload}>
                <Text style={styles.pdfBtnText}>Download PDF</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Contact:</Text>
            <Text style={styles.bodyText}>{proposal.contact?.name || ""}</Text>
            <Text style={styles.bodyText}>{proposal.contact?.email || ""}</Text>
            <Text style={styles.bodyText}>{proposal.contact?.phone || ""}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Specifications:</Text>
            <Text style={styles.bodyText}>{proposal.specifications || ""}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Process:</Text>
            <Text style={styles.bodyText}>{proposal.process || ""}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Scope:</Text>
            <View style={{ paddingLeft: 8 }}>
              {(proposal.scope || []).map((item, idx) => (
                <View key={`${idx}-${item}`} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bodyText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Notes:</Text>
            <View style={{ paddingLeft: 8 }}>
              {(proposal.notes || []).map((n, idx) => (
                <View key={`${idx}-${n}`} style={{ marginBottom: 2 }}>
                  <Text style={styles.bodyText}>{`${idx + 1} ${n}`}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Submitted By:</Text>
            <Text style={styles.bodyText}>{proposal.submittedBy?.name || ""}</Text>
            <Text style={styles.bodyText}>{proposal.submittedBy?.email || ""}</Text>
            <Text style={styles.bodyText}>{proposal.submittedBy?.phone || ""}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 10 },
  backBtn: { padding: 6 },
  title: { fontSize: 20, fontWeight: "700", color: "#00234C" },

  searchRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  idInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    color: "#00234C",
  },
  searchBtn: { marginLeft: 10, backgroundColor: "#00234C", paddingHorizontal: 16, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "600" },
  errorText: { color: "#F44336", fontSize: 12, marginTop: 6 },

  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 },
  pdfBtn: { borderWidth: 1, borderColor: "#C7D2E1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  pdfBtnText: { color: "#00234C", fontWeight: "600" },

  sectionHeading: { color: "#00234C", fontWeight: "700", marginTop: 18, marginBottom: 6 },
  bodyText: { color: "#333", marginBottom: 2 },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginTop: 16 },

  bulletRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#333", marginRight: 8 },
});


