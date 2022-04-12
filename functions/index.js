const admin = require("firebase-admin");
const functions = require("firebase-functions");

const firebaseConfig = {
  apiKey: `${process.env.API_KEY}`,
  authDomain: `${process.env.AUTH_DOMAIN}`,
  projectId: `${process.env.PROJECT_ID}`,
  storageBucket: `${process.env.STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.MESSAGING_SENDER_ID}`,
  appId: `${process.env.APP_ID}`,
  measurementId: `${process.env.MEASUREMENT_ID}`
}

const app = admin.initializeApp(firebaseConfig)

exports.checkUpdates = functions.region(`${process.env.REGION}`).https.onRequest(async (request, response) => {
  functions.logger.info('Request: ', request.query, {structuredData: true})
  try{
    const db = admin.firestore()
    const changeLogs = await db.collection(`${process.env.ACTIVE_COLLECTION}`).where('version', '>', request.query.version).orderBy('version', 'desc').get()
    if(changeLogs.empty){
      response.send({
        is_available: false,
        version: null,
        change_logs: []
      })
    }else{
      response.send({
        is_available: true,
        version: changeLogs.docs[0].data().version,
        change_logs: changeLogs.docs[0].data().changes
      })
    }
  }catch(e){
    response.status(500).send({
      is_error: true,
      message: e.toString()
    })
  }
});
