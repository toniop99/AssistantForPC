/***** General Functions *****/



/***** * *****/

/***** More Info Alert *****/



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

