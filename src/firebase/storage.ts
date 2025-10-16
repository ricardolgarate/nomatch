import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a product image to Firebase Storage
 * @param file - The image file to upload
 * @param productId - The product ID (for organizing files)
 * @param imageIndex - The index of the image (0, 1, 2, etc.)
 * @returns The download URL of the uploaded image
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  imageIndex: number
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image must be less than 5MB');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${productId}-${imageIndex}-${timestamp}.${extension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, `products/${productId}/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete a product image from Firebase Storage
 * @param imageUrl - The full download URL of the image
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL');
    }
    
    const pathWithParams = urlParts[1].split('?')[0];
    const path = decodeURIComponent(pathWithParams);
    
    // Create a reference and delete
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Upload multiple images for a product
 * @param files - Array of image files
 * @param productId - The product ID
 * @returns Array of download URLs
 */
export async function uploadProductImages(
  files: File[],
  productId: string
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => 
    uploadProductImage(file, productId, index)
  );
  
  return Promise.all(uploadPromises);
}

