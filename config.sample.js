// config.example.js
// このファイルを「config.js」にコピーして実際の値を設定してください
const EMAIL_CONFIG = {
  DEV: {
    recipients: ['dev-email@example.com']
  },
  PROD: {
    recipients: ['production-email1@example.com', 'production-email2@example.com'] 
  }
};

function getEmailRecipients(env) {
  return EMAIL_CONFIG[env].recipients;
}