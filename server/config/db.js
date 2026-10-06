import mongoose from 'mongoose';
import dns from 'dns';

// Ensure standard DNS servers (Google / Cloudflare) to resolve MongoDB Atlas SRV records reliably on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (e) {
  // ignore if unable to set DNS servers
}

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projetstage';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 12000,
    });
    console.log(`✅ MongoDB Atlas connecté avec succès: ${conn.connection.host} (Base: ${conn.connection.name})`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Échec de connexion à MongoDB Atlas (${error.message}). Tentative de connexion locale de secours...`);

    // Fallback to local MongoDB if primary URI is Atlas and failed
    if (mongoURI !== 'mongodb://127.0.0.1:27017/projetstage') {
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/projetstage', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`✅ Basculé sur MongoDB Local: ${localConn.connection.host} (Base: ${localConn.connection.name})`);
        return true;
      } catch (localErr) {
        console.error(`❌ Impossible de se connecter à MongoDB (Atlas et Local échoués): ${localErr.message}`);
      }
    }
    return false;
  }
};

export default connectDB;
