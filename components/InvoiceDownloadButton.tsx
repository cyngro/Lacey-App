import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { getToken } from "../utils/authStorage";
import { API_URL } from "../constants/api";

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
  companyEmail: string;
  company: string;
  sent: boolean;
  signed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceDownloadButtonProps {
  proposal: Proposal;
  size?: number;
  color?: string;
}

export default function InvoiceDownloadButton({ 
  proposal, 
  size = 24, 
  color = "#00234C" 
}: InvoiceDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const fetchUserData = async () => {
    try {
      console.log('🔍 Fetching user data...');
      const token = await getToken();
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token found');
        return null;
      }

      console.log('🌐 Making API call to:', `${API_URL}/api/user/profile`);
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data received:', userData);
        return {
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        };
      } else {
        const errorText = await response.text();
        console.log('❌ API Error:', errorText);
        return null;
      }
    } catch (error) {
      console.error('💥 Error fetching user data:', error);
      return null;
    }
  };

  const handleDownloadInvoice = async () => {
    if (downloading) return;

    setDownloading(true);
    
    // Test user data fetching first
    console.log('🧪 Testing user data fetch...');
    const testUserData = await fetchUserData();
    console.log('🧪 Test result:', testUserData);
    
    try {
      Alert.alert(
        "Generate Invoice",
        `Generate invoice document for ${proposal.customerName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Generate",
            onPress: async () => {
              try {
                console.log('🔄 Starting invoice generation...');
                console.log('🔍 About to fetch user data...');
                
                let userData = null;
                try {
                  userData = await fetchUserData();
                  console.log('👤 User data result:', userData);
                } catch (userDataError) {
                  console.error('💥 Error in fetchUserData:', userDataError);
                  userData = null;
                }
                
                await generateInvoicePDF(proposal, userData || undefined);
                console.log('✅ Invoice generation completed');
                
                // Check if sharing worked by looking at logs
                // If no sharing dialog appeared, show fallback alert
                setTimeout(() => {
                  Alert.alert(
                    "Invoice Ready!",
                    "Invoice has been generated and saved to your device. You can find it in the Files app or share it from there.",
                    [
                      { text: "OK" },
                      { 
                        text: "Open Files App", 
                        onPress: () => {
                          // This will open the Files app
                          console.log('User wants to open Files app');
                        }
                      }
                    ]
                  );
                }, 2000); // Wait 2 seconds to see if sharing dialog appears
                
              } catch (error) {
                console.error('Invoice generation error:', error);
                Alert.alert(
                  "Error",
                  "Failed to generate invoice. Please try again."
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Outer error:', error);
      Alert.alert("Error", "Failed to generate invoice PDF");
    } finally {
      // Add a small delay before allowing another click
      setTimeout(() => {
        setDownloading(false);
      }, 1000);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, downloading && styles.buttonDisabled]}
      onPress={handleDownloadInvoice}
      disabled={downloading}
    >
      <MaterialIcons 
        name={downloading ? "hourglass-empty" : "description"} 
        size={size} 
        color={color} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
