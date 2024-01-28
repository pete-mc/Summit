console.log('loader.js loaded');
docReady(function() {
    console.log('loader.js running');
    const buttonHTML = `
    <button id="summitButton" style="display: none;" onclick="
            const summitCSS = document.createElement('link'); 
            summitCSS.id = 'summit-css'; 
            summitCSS.rel = 'stylesheet'; 
            summitCSS.type = 'text/css'; 
            summitCSS.href = 'https://localhost/summit.css'; 
            document.head.appendChild(summitCSS);
            const summitScript = document.createElement('script'); 
            summitScript.id = 'summit-script'; 
            summitScript.src = 'https://localhost/summit.js'; 
            summitScript.async = true; 
            document.head.appendChild(summitScript);
        ">
    </button>`;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);
    document.getElementById('summitButton').click();
    document.body.removeChild(document.getElementById('summitButton'));
});

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}    
