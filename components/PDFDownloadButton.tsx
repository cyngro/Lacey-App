import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { generateProposalPDF } from "../utils/pdfGenerator";

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
  sent: boolean;
  signed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PDFDownloadButtonProps {
  proposal: Proposal;
  size?: number;
  color?: string;
}

export default function PDFDownloadButton({ 
  proposal, 
  size = 24, 
  color = "#00234C" 
}: PDFDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (downloading) return;
    
    setDownloading(true);
    try {
      Alert.alert(
        "Generate Proposal",
        `Generate proposal document for ${proposal.customerName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Generate",
            onPress: async () => {
              try {
                await generateProposalPDF(proposal);
                
                Alert.alert(
                  "Proposal Generated",
                  "Proposal has been generated and is ready to share!",
                  [{ text: "OK" }]
                );
              } catch (error) {
                console.error('Proposal generation error:', error);
                Alert.alert(
                  "Error",
                  "Failed to generate proposal. Please try again."
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, downloading && styles.buttonDisabled]}
      onPress={handleDownloadPDF}
      disabled={downloading}
    >
      <MaterialIcons 
        name={downloading ? "hourglass-empty" : "picture-as-pdf"} 
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
