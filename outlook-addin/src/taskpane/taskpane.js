/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */
const lawyers = ['crgarcia@live.com.ar']


Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("analyze").onclick = analyze;
    getEmailContent();
  }
});

export async function getEmailContent() {
  //get the email body
  let emailBody = '';

  Office.context.mailbox.item.body.getAsync("text", function (result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      emailBody = result.value;
      callBackend(emailBody)
    }
    else {
      callBackend(result.error.message);
    }
  })
}

export async function callBackend(emailBody){
  console.log(emailBody);
  
}


export async function analyze() {

  
  // read the owner of the email inbox
  let recipientEmailAddress = Office.context.mailbox.userProfile.emailAddress
  let senderEmailAddress = Office.context.mailbox.item.sender.emailAddress
  console.log(`Sender: [${senderEmailAddress}]`)
  console.log(`Recipient: [${recipientEmailAddress}]`)
  
  if (senderEmailAddress in lawyers)
  {
    console.log(`Sender is a lawyer`)
  }
  
  async function logSomehting(emailBody){
    console.log(emailBody);
    sendEmailToBackend(emailBody);
  }

  async function sendEmailToBackend(emailBody) {
    // Call the FastApi backend at http://127.0.0.1:8000/
    const response = await fetch("http://127.0.0.1:8000/api/email_count?body=" + encodeURIComponent(emailBody))
      .catch(rejected => {
        console.log(rejected);
      });;
    const data = await response.json();
    console.log(data);

    document.getElementById("response").innerHTML = `email has ${data.character_count} characters.`;

    // Trying Langchain
    // const chain = new RemoteRunnable({
    //   url: `http://127.0.0.1:8000/answer_email/c/N4XyA`,
    // });
    // const result = await chain.invoke({
    //   email_content: emailBody,
    // });

    console.log(result);

    document.getElementById("response").innerHTML = `email has ${data.character_count} characters. Content: ${result.content}`;
    //Office.context.mailbox.item.displayReplyAllForm(`email has ${data.character_count} characters`);
  }
}

