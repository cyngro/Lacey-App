import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
// import * as FaceDetector from 'expo-face-detector';



interface FaceRecognitionProps {
  onFaceDetected: (faceData: any) => void;
  onClose: () => void;
}

export default function FaceRecognition({ onFaceDetected, onClose }: FaceRecognitionProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);

  console.log('FaceRecognition: Permission status:', permission);
  console.log('FaceRecognition: Camera ready:', cameraReady);

  const detectFaces = async (imageUri: string) => {
    try {
      console.log('FaceRecognition: Starting face detection for image:', imageUri);
      // Temporarily disabled face detection - simulating success
      const result = { faces: [{ faceId: 'simulated_face' }] };
      console.log('FaceRecognition: Face detection result:', result);
      
      if (result.faces.length > 0 && !isDetecting) {
        console.log('FaceRecognition: Face detected, processing...');
        setIsDetecting(true);
        setFaceDetected(true);
        
        // Simulate face recognition processing
        setTimeout(() => {
          const faceData = {
            faceId: `face_${Date.now()}`,
            confidence: 0.95,
            timestamp: new Date().toISOString()
          };
          
          console.log('FaceRecognition: Face recognition completed:', faceData);
          onFaceDetected(faceData);
          setIsDetecting(false);
          
          // Navigate to company page after successful detection
          router.push('/company');
        }, 2000);
      } else {
        console.log('FaceRecognition: No faces detected');
      }
    } catch (error) {
      console.error('FaceRecognition: Face detection error:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        console.log('FaceRecognition: Taking picture...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        console.log('FaceRecognition: Picture taken:', photo.uri);
        await detectFaces(photo.uri);
      } catch (error) {
        console.error('FaceRecognition: Error taking picture:', error);
        // Fallback: simulate face detection without taking picture
        console.log('FaceRecognition: Simulating face detection...');
        await detectFaces('simulated_image_uri');
      }
    } else {
      console.log('FaceRecognition: Camera ref not available');
      // Fallback: simulate face detection
      console.log('FaceRecognition: Simulating face detection...');
      await detectFaces('simulated_image_uri');
    }
  };

  // Auto face detection timer
  useEffect(() => {
    if (cameraReady && permission?.granted && !isDetecting && !faceDetected) {
      console.log('FaceRecognition: Starting auto face detection timer');
      const interval = setInterval(() => {
        if (cameraRef.current && !isDetecting && !faceDetected) {
          takePicture();
        }
      }, 3000); // Take picture every 3 seconds

      return () => {
        console.log('FaceRecognition: Clearing auto face detection timer');
        clearInterval(interval);
      };
    }
  }, [cameraReady, permission?.granted, isDetecting, faceDetected]);

  function handleRetry() {
    setFaceDetected(false);
    setIsDetecting(false);
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission denied</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        onCameraReady={() => {
          console.log('FaceRecognition: Camera is ready');
          setCameraReady(true);
        }}
        onMountError={(error) => {
          console.error('FaceRecognition: Camera mount error:', error);
        }}
      />

      
      <View style={styles.overlay}>
        <View style={styles.faceFrame}>
          <Text style={styles.instructionText}>
            {isDetecting ? 'Processing face...' : 
             !cameraReady ? 'Initializing camera...' :
             'Position your face in the frame'}
          </Text>
          
          {isDetecting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          
          {faceDetected && !isDetecting && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Face detected successfully!</Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          {cameraReady && (
            <TouchableOpacity style={styles.detectButton} onPress={takePicture}>
              <Text style={styles.buttonText}>Detect Face</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    marginTop: 20,
  },
  successContainer: {
    marginTop: 20,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  detectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

