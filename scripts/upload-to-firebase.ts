import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";
import path from "path";

// Load config from firebase-applet-config.json
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(localPath: string, remoteName: string) {
  if (!fs.existsSync(localPath)) {
    console.error(`File common found: ${localPath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(localPath);
  const storageRef = ref(storage, `steveai-outputs/${remoteName}`);
  
  console.log(`Uploading ${localPath} to steveai-outputs/${remoteName}...`);
  
  // Upload to Firebase
  const snapshot = await uploadBytes(storageRef, fileBuffer);
  // Get the Public URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  console.log(`ATTACHMENT_URL: ${downloadURL}`);
  return downloadURL;
}

const filePath = process.argv[2];
if (!filePath) {
  console.log("Usage: tsx scripts/upload-to-firebase.ts <file-path>");
  process.exit(1);
}

const fileName = path.basename(filePath);
uploadFile(filePath, `gen-${Date.now()}-${fileName}`);
