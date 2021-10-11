var [client, noteElement, scheduleObject, scheduleTimeElement, contactElement, REMINDER_INTERVAL, notifyMe] = [
  null,
  null,
  null,
  null,
  null,
  6,
  true
];
var appObject = {};

ready(start);

function start() {
  
  const notifyElement = document.getElementById('submit');
  
  noteElement = document.getElementById('note');
  scheduleTimeElement = document.getElementById('scheduleAfter');
  contactElement = document.getElementById('contact');
  const contactSectionElement = document.getElementById('contact-section');


  app.initialized().then(function getClientObj(_client) {
    client = _client;
    client.data.get('loggedInUser').then(function getData(user) {
      appObject.userId = user.loggedInUser.id;
      appObject.contact = {
        email: user.loggedInUser.contact.email,
        name: user.loggedInUser.contact.name
      }
    }, logError);

    client.data.get('ticket').then(function getData(data) {
      appObject.ticketId = data.ticket.id;
    }, logError);

    notifyElement.addEventListener('click', createSchedule);


    client.instance.context().then(function (context) {
      if(context.data.type != 'notifyMe') {
        notifyMe = false;
        contactSectionElement.classList.remove("hide-element");
      }
      var fdUrl = "https://<%=iparam.fdDomain%>.freshpo.com/api/v2/contacts";
      var fdHeaders = {
            "Authorization": "Basic <%=encode(iparam.fdApiKey) %>",
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
        var fdOptions = {
            headers: fdHeaders
        };

        client.request.get(fdUrl, fdOptions).then(function(data) {
          if(data.status == 200 && data.response) {
            populateContact(JSON.parse(data.response));
          }
        });
    });
  });
}

function populateContact(contacts) {
  var dropdownOptions = document.getElementById("contact");
  
  contacts.forEach(function(contact) {
    var option = document.createElement("option");
    option.id = contact.id;
    option.value = contact.email;
    option.text = contact.email;

    dropdownOptions.appendChild(option);
  });
}

function ready(start) {
  if (document.readyState != 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2);
}

function createSchedule() {
  if (!notifyMe){
    appObject.contact = { email: contactElement.value };
  }

  let currentTime = new Date();
  let scheduleAfter = parseInt(scheduleTimeElement.value) || REMINDER_INTERVAL;
  currentTime.setMinutes(currentTime.getMinutes() + scheduleAfter);
  note = noteElement.value;
  scheduleObject = {
    scheduleName: generateUniqueId(),
    userId: appObject.userId,
    contact: appObject.contact,
    note: note,
    scheduleAt: currentTime.toISOString(),
    ticketId: appObject.ticketId
  };
  client.request
    .invoke('createSchedule', scheduleObject)
    .then(function onSuccessSMI(data) {
      console.info(`server method invoked ${data}`);
      client.instance.send({ message: 'Reminder is saved successfully 🎉' });
      client.instance.close();
    }, logError);
}

function logError(error) {
  console.error(`Train took the wrong route 🚂:`);
  console.error(error);
}
