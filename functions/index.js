// Optional: Cloud Function for email reminders
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure your email service (example with Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

// Scheduled function to check for upcoming medication reminders
exports.sendMedicationReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user wants email notifications
      if (!userData.notificationPrefs?.email) continue;
      
      const medicationsSnapshot = await admin.firestore()
        .collection('users')
        .doc(userDoc.id)
        .collection('medications')
        .get();
      
      for (const medDoc of medicationsSnapshot.docs) {
        const medData = medDoc.data();
        
        // Check if any scheduled dose is within the next hour
        // (Implementation depends on your schedule format)
        // Send email if needed
        
        if (shouldSendReminder(medData, now, oneHourFromNow)) {
          await transporter.sendMail({
            from: '"MediMate" <noreply@medimate.app>',
            to: userData.email,
            subject: `Medication Reminder: ${medData.name}`,
            html: `
              <h2>Medication Reminder</h2>
              <p>It's time to take your medication: <strong>${medData.name}</strong></p>
              <p>Dosage: ${medData.dosage}</p>
              <p>Instructions: ${medData.instructions || 'N/A'}</p>
              <br>
              <p><small>This is an automated reminder from MediMate.</small></p>
            `,
          });
        }
      }
    }
  });

function shouldSendReminder(medData, now, oneHourFromNow) {
  // Implement your logic to check if a reminder should be sent
  // based on the medication schedule
  return false;
}

// Manual trigger for testing
exports.testEmailReminder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userData = userDoc.data();
  
  await transporter.sendMail({
    from: '"MediMate" <noreply@medimate.app>',
    to: userData.email,
    subject: 'MediMate Test Reminder',
    html: '<p>This is a test email from MediMate.</p>',
  });
  
  return { success: true };
});
