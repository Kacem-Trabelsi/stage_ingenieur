import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Reunion from './models/Reunion.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const testWorkflow = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');

    const total = await Reunion.countDocuments();
    console.log(`📊 Total réunions en base : ${total}`);

    const meetings = await Reunion.find().lean();
    console.log('📋 Réunions trouvées :', meetings.map(m => `[${m.room}] ${m.title} (${m.date} ${m.startTime}-${m.endTime}) - ${m.status}`));

    // Test conflict check
    const existing = meetings[0];
    if (existing) {
      const conflict = await Reunion.findOne({
        room: existing.room,
        date: existing.date,
        status: { $ne: 'annule' },
        $or: [
          {
            startTime: { $lt: existing.endTime },
            endTime: { $gt: existing.startTime },
          },
        ],
      });
      console.log('🔍 Test détection de conflit réussi :', conflict ? `Conflit détecté sur ${conflict.title}` : 'Aucun conflit');
    }

    console.log('🎉 Test Reunion Workflow terminé avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur test workflow:', err);
    process.exit(1);
  }
};

testWorkflow();
