// utils/ipfs.js
import axios from 'axios';
import { PINATA_API_KEY, PINATA_SECRET_KEY } from './constants';

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        timeout: 30000 // 30 seconds
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};