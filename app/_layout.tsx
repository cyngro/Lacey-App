import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading, selectedCompany } = useAuth();

  console.log("Layout: isAuthenticated:", isAuthenticated, "selectedCompany:", selectedCompany, "isLoading:", isLoading);
  
  // Debug the routing logic
  if (!isAuthenticated) {
    console.log("Layout: User not authenticated, showing login/signup screens");
  } else if (!selectedCompany) {
    console.log("Layout: User authenticated but no company selected, showing company selection");
  } else {
    console.log("Layout: User authenticated and company selected, showing dashboard");
  }
  
  // Force re-render when authentication state changes
  console.log("Layout: Rendering with isAuthenticated:", isAuthenticated, "selectedCompany:", selectedCompany);
  console.log("Layout: Stack key:", `${isAuthenticated}-${selectedCompany}`);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00234C" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} key={`${isAuthenticated}-${selectedCompany}`}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="signUp" />
        </>
      ) : !selectedCompany ? (
        <>
          <Stack.Screen name="company" />
        </>
      ) : (
        <>
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="editProfile" />
          <Stack.Screen name="proposalsList" />
          <Stack.Screen name="proposal" />
          <Stack.Screen name="proposalDetail" />
          <Stack.Screen name="viewInvoice" />
          <Stack.Screen name="viewProposal" />
          <Stack.Screen name="invoice" />
          <Stack.Screen name="invoicesList" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
