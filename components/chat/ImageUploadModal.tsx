import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (image: any) => void;
  onUpload: (image: any, content: string) => void;
  isLoading?: boolean;
}

export default function ImageUploadModal({
  visible,
  onClose,
  onImageSelected,
  onUpload,
  isLoading = false,
}: ImageUploadModalProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setSelectedImage(image);
        onImageSelected(image);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setSelectedImage(image);
        onImageSelected(image);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const handleUpload = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    if (!editPrompt.trim()) {
      Alert.alert('No Prompt', 'Please enter what you want to do with the image');
      return;
    }

    onUpload(selectedImage, editPrompt.trim());
  };

  const handleClose = () => {
    setSelectedImage(null);
    setEditPrompt('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Upload & Edit Image</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Image Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Image</Text>
            <View style={styles.imageOptions}>
              <TouchableOpacity
                style={styles.imageOption}
                onPress={pickImage}
                disabled={isLoading}
              >
                <MaterialIcons name="photo-library" size={32} color="#00234C" />
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imageOption}
                onPress={takePhoto}
                disabled={isLoading}
              >
                <MaterialIcons name="camera-alt" size={32} color="#00234C" />
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Image Preview */}
            {selectedImage && (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Edit Prompt */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>Edit instructions:</Text>
              <View style={styles.textInputContainer}>
                <Text
                  style={styles.textInput}
                  placeholder="e.g., Add a beautiful sunset in the background, Change the color to blue, Add a person walking..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={editPrompt}
                  onChangeText={setEditPrompt}
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!selectedImage || !editPrompt.trim() || isLoading) && styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={!selectedImage || !editPrompt.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="cloud-upload" size={20} color="#fff" />
            )}
            <Text style={styles.uploadButtonText}>
              {isLoading ? 'Processing...' : 'Upload & Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    minWidth: 100,
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#00234C',
    fontWeight: '500',
  },
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    marginTop: 8,
  },
  promptLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00234C',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  uploadButtonDisabled: {
    backgroundColor: '#CCC',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
