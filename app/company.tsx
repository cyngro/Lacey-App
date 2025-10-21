import { useRouter } from 'expo-router';
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

// ✅ Company Selection Screen
function CompanySelectionScreen() {
  const router = useRouter();
  const { selectCompany } = useAuth();

  function handleCompanySelect(company: string) {
    console.log("Company selection - Selected company:", company);
    selectCompany(company);
    console.log("Company selection - Company set in context");
    // Navigate to dashboard after company selection
    router.push("/dashboard");
  }

  return (
    <ScrollView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.header}>
        <Text style={styles.logo}>LACEY</Text>
        <Text style={styles.subLogo}>Business Suite</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Choose your Business</Text>

      {/* Business Cards */}
      <View style={styles.cardContainer}>
        {/* Card 1 */}
        <View style={styles.card}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/100/mountain.png" }}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>SOLID ROCK</Text>
          <Text style={styles.cardSubtitle}>STONE WORK LLC</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCompanySelect("Solid Rock")}
          >
            <Text style={styles.buttonText}>Explore</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2 */}
        <View style={styles.card}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/100/laurel-wreath.png" }}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>TERRY ASPHALT</Text>
          <Text style={styles.cardSubtitle}>HAULING & GRADING, INC.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCompanySelect("Terry Asphalt")}
          >
            <Text style={styles.buttonText}>Explore</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Discover how expert masonry transforms homes and businesses.{"\n"}
        Learn why stone remains one of the most trusted materials in design and
        construction.
      </Text>
    </ScrollView>
  );
}

// ✅ Main App - This will only render when user is authenticated but no company selected
export default function App() {
  return <CompanySelectionScreen />;
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002147", // Navy Blue
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 2,
  },
  subLogo: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginVertical: 40,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: width * 0.42,
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: "space-between",
    minHeight: 200,
  },
  cardImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
    tintColor: "#002147",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#002147",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#444",
    textAlign: "center",
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: "#002147",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 30,
    marginHorizontal: 20,
    lineHeight: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#002147",
  },
  loginText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
});
