import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsConditionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#00234C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.termsIcon}>
          <MaterialIcons name="description" size={24} color="#00234C" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing and using this application, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.sectionText}>
            Permission is granted to temporarily download one copy of the materials on our application 
            for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionText}>
            When you create an account with us, you must provide information that is accurate, complete, 
            and current at all times. You are responsible for safeguarding the password and for all activities 
            that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
          <Text style={styles.sectionText}>
            You may not use our service:
          </Text>
          <Text style={styles.bulletPoint}>• For any unlawful purpose or to solicit others to perform unlawful acts</Text>
          <Text style={styles.bulletPoint}>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</Text>
          <Text style={styles.bulletPoint}>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</Text>
          <Text style={styles.bulletPoint}>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</Text>
          <Text style={styles.bulletPoint}>• To submit false or misleading information</Text>

          <Text style={styles.sectionTitle}>5. Content</Text>
          <Text style={styles.sectionText}>
            Our service allows you to post, link, store, share and otherwise make available certain information, 
            text, graphics, videos, or other material. You are responsible for the content that you post to the service.
          </Text>

          <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
          <Text style={styles.sectionText}>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
            to understand our practices.
          </Text>

          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your account and bar access to the service immediately, without prior notice 
            or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not 
            limited to a breach of the Terms.
          </Text>

          <Text style={styles.sectionTitle}>8. Disclaimer</Text>
          <Text style={styles.sectionText}>
            The information on this application is provided on an "as is" basis. To the fullest extent permitted by law, 
            this Company excludes all representations, warranties, conditions and terms relating to our application and 
            the use of this application.
          </Text>

          <Text style={styles.sectionTitle}>9. Limitations</Text>
          <Text style={styles.sectionText}>
            In no event shall the Company, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
          </Text>

          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <Text style={styles.sectionText}>
            These Terms shall be interpreted and governed by the laws of the State of California, without regard to its 
            conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered 
            a waiver of those rights.
          </Text>

          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
            material, we will provide at least 30 days notice prior to any new terms taking effect.
          </Text>

          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms & Conditions, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@laceyapp.com</Text>
          <Text style={styles.contactInfo}>Phone: +1 (555) 123-4567</Text>
          <Text style={styles.contactInfo}>Address: 123 Business St, City, State 12345</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Offset for back button
  },
  termsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00234C',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    color: '#00234C',
    fontWeight: '500',
    marginBottom: 8,
  },
});
