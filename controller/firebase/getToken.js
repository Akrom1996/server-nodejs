
var admin = require("firebase-admin");

var serviceAccount = require("../../m_token.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://marketplace-b1d74.firebaseio.com"
})

module.exports.admin = admin

// const {google} = require("googleapis")
// // admin.initializeApp({
// //     credential: admin.credential.applicationDefault(),
// // })
// const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
// const SCOPES = [MESSAGING_SCOPE];
// const token =  new Promise(function (resolve, reject) {
//         const key = require('../../m_token.json');
//         const jwtClient = new google.auth.JWT(
//             key.client_email,
//             null,
//             key.private_key,
//             SCOPES,
//             null
//         );
//         jwtClient.authorize(function (err, tokens) {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(tokens.access_token);
//         });
//     });

// module.exports = token;