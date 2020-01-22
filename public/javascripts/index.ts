/***** General Functions *****/



/***** * *****/

/***** More Info Alert *****/

function hideMoreInfoAlert() {
    const alertContainer = (document.getElementById("alertContainerMoreInfo") as HTMLInputElement);
    alertContainer.setAttribute("style", "display:none;");
}

function showMoreInfoAlert() {
    const alertContainer = (document.getElementById("alertContainerMoreInfo") as HTMLInputElement);
    alertContainer.removeAttribute("style");
    setTimeout(() => {
        hideMoreInfoAlert();
    }, 5000);
}

/***** * *****/

/***** Restart Alert *****/

function showRestartAlert() {
    const alertContainer = (document.getElementById("alertContainerRestartApp") as HTMLInputElement);
    alertContainer.removeAttribute("style");
    setTimeout(() => {
      hideRestartAlert();
    }, 10000);
}
  
function hideRestartAlert() {
    const alertContainer = (document.getElementById("alertContainerRestartApp") as HTMLInputElement);
    alertContainer.setAttribute("style", "display:none;");
}

/***** * *****/

/***** CONFIGURATION SECTION *****/

/***** * *****/

