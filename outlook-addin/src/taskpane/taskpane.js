/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
 // Call the FastApi backend at http://127.0.0.1:8000/
  const response = await fetch("http://127.0.0.1:8000/")
    .catch(rejected => {
      console.log(rejected);
    });;
  const data = await response.json();
  console.log(data);
  document.getElementById("response").innerHTML = data.message;
}
