ready(start);

function start() {
  const notifyElement = document.getElementById('notifyMe');
  const notifyContactElement = document.getElementById('notifyContact');

  app.initialized().then(function getClientObj(_client) {
    client = _client;

    client.events.on('app.activated', function waitForClick() {
      notifyElement.addEventListener('click', displayModal);
      notifyContactElement.addEventListener('click', displayModal);
    });

    client.instance.receive(function (e) {
      let data = e.helper.getData();
      fwNotify('success', data.message);
    });
  });
}

function ready(start) {
  if (document.readyState != 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
}

/* Show modal to display contact's information */
function displayModal() {
  var title;

  if(event.target.id == 'notifyMe') {
    title = "Notify Me";
  }
  else {
    title = "Notify Contact";
  }

  client.interface.trigger("showModal", {
    title,
    template: "note_reminder_index.html",
    data: { type: event.target.id }
  }).then(function (data) {
    console.info(data);
  }).catch(function (error) {
    console.error(error);
  });
}

function fwNotify(notificationType, messageContent) {
  client.interface
    .trigger('showNotify', {
      type: notificationType,
      message: messageContent
    })
    .then(interfaceData => {
      console.info(`💁<U+200D>♂️ Notification created`, interfaceData);
    })
    .catch(error => {
      console.error(`error 💣`, error);
    });
  return;
}


function logError() {
  console.error(`Train took the wrong route 🚂:`);
  console.error;
}
