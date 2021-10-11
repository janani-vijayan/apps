var CryptoJS = require("crypto-js");
var jwt = require('jsonwebtoken');
var request = require('request');

function getSettings() {
  return $db.get('settings');
}


function send(args) {
  var accountId = args.data.platformOrigin ? args.iparams.dpAccountId : args.account_id;
  var body = {
    action: 'send',
    accountId,
    data: {
      subject: args.data.subject,
      html: args.data.text,
      accountId,
      from: {
        email: args.data.fromEmail
      },
      to: [
       {
         email: args.data.contact.email,
         name: args.data.contact.name
       }
     ],
     replyTo: {
       email: args.data.replyEmail
     }
   }
  };

  console.log('sending email with body', body.data.accountId);

  const JWTpayload = {
    account_id: String(accountId),
    domain: args.domain,
    time: Date.now(),
    user: { id: 1, is_admin: true } 
  }

  request.post({
    url: args.iparams.dpUrl,
    form: body,
    headers: {
      'MKP-AUTH-TOKEN': jwt.sign(JWTpayload, args.iparams.dpSecret, { expiresIn: '1h' }),
      'Content-Type': "application/json",
      'MKP-APIKEY': args.iparams.dpAuth,
      'mkp-route': 'email',
      'mkp-extnid': args.iparams.extId,
      'mkp-versionid': args.iparams.versionId
    }
  }, function (error, response) {
    if(error) {
      console.error('Error in sending mail');
    }
    else {
      console.log("mail sent successfully", response.statusCode);
    }
  });
}

function generateEmail(args) {
  console.log(args.product_id, args.account_id, args.app_id, args.domain);

  var data = [args.product_id, args.account_id, args.app_id].join(':');

  // Encrypt
  var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '36763979244226452948404D63516654').toString();

  var email = `no-reply-${ciphertext}@${args.iparams.dpDomain}`;

  console.log('email', email);

  return email;
};

function storeSettings(settings) {
  $db
    .set('settings', settings)
    .then(
      function () {
        console.log("setting stored in Db");
      },
      function (err) {
        console.log("Error while storing setting", err);
      }
    );
}

exports = {
  $email: {
    send
  },
  generateEmail,
  storeSettings,
  getSettings
}
