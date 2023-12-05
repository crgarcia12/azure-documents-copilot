// global document
//Office.context.mailbox.item.displayReplyAllForm(`email has ${data.character_count} characters`);
const lawyers = ['crgarcia@live.com.ar', 'panagiotag@microsoft.com']

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("sign_button").onclick = signContract();
    document.getElementById("ask").onclick = getEmailContent();
    document.getElementById("reply_to_carlos").onclick = respondToCarlos();
    getEmailContent();
  }
});

export async function getEmailContent() {
  //get the email body
  let emailBody = '';

  Office.context.mailbox.item.body.getAsync("text", function (result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      emailBody = result.value;
      analyze(emailBody);
    }
    else {
      analyze(result.error.message);
    }
  })
}

export async function analyze(emailBody) {
  // read the owner of the email inbox
  let recipientEmailAddress = Office.context.mailbox.userProfile.emailAddress;
  let senderEmailAddress = Office.context.mailbox.item.sender.emailAddress;
  console.log(`Sender: [${senderEmailAddress}]`);
  console.log(`Recipient: [${recipientEmailAddress}]`);
  
  if (lawyers.includes(senderEmailAddress)) {
    // Office.context.mailbox.item.attachments.at(0).getAsync(Office.CoercionType.Text, function (result) {
    //   if (result.status === Office.AsyncResultStatus.Succeeded) {
    //     console.log(result.value);
    //     logSomehting(result.value);
    //   } else {
    //     console.log(result.error.message);
    //   }
    // });
    console.log(`Sender is a lawyer`);
    sendEmailToBackend(emailBody);
  }

  async function sendEmailToBackend(emailBody) {
    // Call the FastApi backend at http://127.0.0.1:8000/
    const response = await fetch("http://127.0.0.1:8000/api/email_intention?body=" + encodeURIComponent(emailBody))
      .catch(rejected => {
        console.log(rejected);
      });;
    const data = await response.json();
    console.log(data);
    
    if(data.includes("contract_sign")) {
      fetch('https://localhost:3000/assets/signcontract.html')
        .then(response => response.text())
        .then(document.getElementById("response").hidden = true)
        .then(document.getElementById("signpannel").hidden = false);
    }    
  }

}

export async function signContract() {
  console.log("signing contract button");
  let emailBody = '';

  document.getElementById("response").hidden = false
  document.getElementById("signpannel").hidden = true

  Office.context.mailbox.item.body.getAsync("text", function (result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      emailBody = result.value;
      callSignContract(emailBody);
    }
    else {
      callSignContract(result.error.message);
    }
  })
}

export async function callSignContract(emailBody) {
  // Call the FastApi backend at http://127.0.0.1:8000/
  const response = await fetch("http://127.0.0.1:8000/api/sign_contract?message=" + encodeURIComponent(emailBody))
  .catch(rejected => {
    console.log(rejected);
  });;
  const data = await response;
  console.log(data);

  document.getElementById("response").hidden = true
  document.getElementById("signpannel").hidden = true
  document.getElementById("signedpannel").hidden = false
  document.getElementById("witid").href = data;
}

export async function respondToCarlos() {
  Office.context.mailbox.item.displayReplyAllForm(`
<p>Thanks for your email, Carlos.<.p>
<p>We will review the contract, and get back to you as soon as possible.</p>

<p>You can track the progress of your contract here:</p> 
<p><a href='https://dev.azure.com/crgarcia/Legal-iSign/_boards/board/t/Legal-iSign%20Team/Epics/?workitem=2180'> iSign Link </a></p>

<p>Cheers!</p>
<p>Another Carlos</p>
`);
}