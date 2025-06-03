import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import api from './api';

export interface UploadResponse {
  url: string;
  filename: string;
}

const UploadService = {
  // Request camera/gallery permissions
  requestPermissions: async (): Promise<boolean> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraStatus === 'granted' && galleryStatus === 'granted';
  },

  // Pick image from gallery
  pickImageFromGallery: async (): Promise<ImagePicker.ImagePickerResult> => {
    const hasPermission = await UploadService.requestPermissions();
    if (!hasPermission) {
      throw new Error('Camera and gallery permissions are required');
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });
  },

  // Take photo with camera
  takePhoto: async (): Promise<ImagePicker.ImagePickerResult> => {
    const hasPermission = await UploadService.requestPermissions();
    if (!hasPermission) {
      throw new Error('Camera and gallery permissions are required');
    }

    return await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });
  },

  // Upload image to server
  uploadImage: async (imageUri: string): Promise<UploadResponse> => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Create form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Upload to server
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (imageUris: string[]): Promise<UploadResponse[]> => {
    const uploadPromises = imageUris.map(uri => UploadService.uploadImage(uri));
    return await Promise.all(uploadPromises);
  },

  // Delete image from server
  deleteImage: async (filename: string): Promise<void> => {
    await api.delete(`/upload/image/${filename}`);
  },
};

export default UploadService;