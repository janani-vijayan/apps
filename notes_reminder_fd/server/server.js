var { $email, generateEmail, storeSettings, getSettings } = require('./helper');

exports = {
  events: [
    { event: "onScheduledEvent", callback: "onScheduledEventHandler" },
    { event: 'onAppInstall', callback: 'onInstallHandler' }
  ],
  onScheduledEventHandler: function (args) {
    console.log("onScheduledEventHandler fired 🎇");

    /**
      Send an email to the user
    */
    console.log("Notify email channel 🎇");
    getSettings()
    .done(function(data) {
      args.data.fromEmail = data.fromEmail;
      args.data.replyEmail = data.replyEmail;
      args.data.platformOrigin = data.platformOrigin;
      $email.send(args);
    }).fail(function(err) {
      console.log('error in retrieving from email', err);
    });
  },

  createSchedule: function (scheduleObject) {
    console.log("createSchedule fired 🎇");
    $schedule
      .create({
        name: String(scheduleObject.scheduleName),
        data: {
          userId: scheduleObject.userId,
          contact: scheduleObject.contact,
          subject: 'Reminder',
          text: `<p>${scheduleObject.note}</p> <br/> Ticket: <a href='https://${scheduleObject.iparams.dpDomain}/helpdesk/tickets/${scheduleObject.ticketId}'></a>` 
        },
        schedule_at: scheduleObject.scheduleAt,
      })
      .then(
        function operationPerformed(data) {
          console.error(data);
          renderData(null);
        },
        function operationErr(err) {
          console.error(err);
          renderData({
            message: "Schedule creation failed",
          });
        }
      );
  },

  onInstallHandler: function (args) {
    console.log("onInstallHandler fired 🎇");

    var replyEmail = args.iparams.replyEmail;

    var platformOrigin = args.iparams.fromEmail ? false : true;

    if(!replyEmail) {
      console.log("Reply email not provided, generating unique email for the app");
      replyEmail = generateEmail(args);
    }

    var fromEmail = args.iparams.fromEmail || replyEmail;

    storeSettings({ fromEmail, replyEmail, platformOrigin });

    renderData();
  }
};
