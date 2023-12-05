// global document
//Office.context.mailbox.item.displayReplyAllForm(`email has ${data.character_count} characters`);
const lawyers = ['crgarcia@live.com.ar', 'panagiotag@microsoft.com']

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    //document.getElementById("analyze").onclick = getEmailContent();
    document.getElementById("ask").onclick = getEmailContent();
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
        .then(html => document.getElementById("response").innerHTML = html)
        .then(document.getElementById("sign").onclick = signContract());
    }
    
    async function signContract() {
      console.log("signing contract button");
    }

    // Trying Langchain
    // const chain = new RemoteRunnable({
    //   url: `http://127.0.0.1:8000/answer_email/c/N4XyA`,
    // });
    // const result = await chain.invoke({
    //   email_content: emailBody,
    // });
    // console.log(result);

    // document.getElementById("response").innerHTML = `email has ${data.character_count} characters. Content: ${result.content}`;
    //Office.context.mailbox.item.displayReplyAllForm(`email has ${data.character_count} characters`);
  }
}