import $ from "jquery";

//WILL NEED TO UPDATE WITH NPM LOCATION
console.log("summit-bootstrap.ts");
async function summitBootstrap() {
  const onclickCode = `
    console.log('first click');
    (async function() {
      let buttonHTML = ${"`"}<button id=|summitButton| style=|display: none;| onclick=|console.log('second click');const summitContainer = document.createElement('div'); summitContainer.id = 'summitContainer'; document.body.appendChild(summitContainer); const summitScript = document.createElement('script'); summitScript.id = 'summit-script'; summitScript.src = 'https://localhost/summit.js'; summitScript.async = true; document.head.appendChild(summitScript);|}></button>${"`"};     
      buttonHTML = buttonHTML.replaceAll('|', '&quot;');
      document.body.insertAdjacentHTML('beforeend', buttonHTML);
      document.getElementById('summitButton').click();
      document.body.removeChild(document.getElementById('summitButton'));
    })();
  `;

  $(`<button style="display: none;" onclick="${onclickCode}"/>`).appendTo("body").trigger("click"); //.remove();
}

summitBootstrap();
