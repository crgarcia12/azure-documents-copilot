/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("analyze").onclick = analyze;
    analyze();
  }
});

export async function analyze() {
  //get the email body
  let emailBody = '';
  Office.context.mailbox.item.body.getAsync("text", function (result) {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      emailBody = result.value;
      logSomehting(emailBody)
    }
    else {
      logSomehting(result.error.message);
    }
  })
  
  function logSomehting(emailBody){
    console.log(emailBody);
    sendEmailToBackend(emailBody);
  }

  async function sendEmailToBackend(emailBody) {
    // Call the FastApi backend at http://127.0.0.1:8000/
    const response = await fetch("http://127.0.0.1:8000/api/email?body=" + emailBody)
      .catch(rejected => {
        console.log(rejected);
      });;
    const data = await response.json();
    console.log(data);
    document.getElementById("response").innerHTML = `email has ${data.character_count} characters`;
    Office.context.mailbox.item.displayReplyAllForm(`email has ${data.character_count} characters`);
  }
}

