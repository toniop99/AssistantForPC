import ConfigFile from "../services/ConfigFile";
const configFile = ConfigFile.getInstace();

export const languages = {
 
    spanish: {
        title: "Asistente para tu PC",
        moreInformation: {
            title: `¡Bienvenido!`,
            body1: `Aquí podrás establecer algunas opciones sobre el programa como la ruta del servicio en la nube,
            o la ruta donde serán ejecutador los archivos .bat.`,
            body2: `Puedes crear y guardar los .bat desde aquí mismo`,
            button: `Más información`,
        },

        configuration: {
            title: `Configuración`,
            cloud: {
                cloudPath: `Selecciona la ruta del servicio en la nube(Dropbox/Google Drive)`,
                cloudButton: `Seleccionar`,
                reset: `Resetear`,
                resetMessage: `Vuelve a abrir la aplicación para mostrar los cambios`,
                dangerMessage: `¡Cuidado! No selecciones una carpeta con archivos que no quieras borrar`,
            },

            bat: {
                batPath: `Selecciona la ruta donde seran ejecutados los archivos .bat`,
                batButton: `Seleccionar`,
                reset: `Resetear`,
                resetMessage: `Vuelve a abrir la aplicación para mostrar los cambios`,
            },
           
        },

        editor: {
            title: `Escribe el título del archivo`,
            body: `Escribe aquí el comando`,
            button: `Guardar`,
            dangerMessage: `El archivo será guardado el la dirección actual para los archivos a ejecutar.`,
        },

        footer: {
            startWithWindows:  `¿Empezar con windows?`,
        },

    },
    
    english: {
        title: "Assistant for your PC",
        moreInformation: {
            title: `Welcome!`,
            body1: `Here you will be able to set up some options about the program as the path of the services of the cloud,
            or the path where the files will be executed.`,
            body2: `You can also create your ouwn script and save them in the selected path.`,
            button: `More information`,
        },

        configuration: {
            title: `Configuration`,
            cloud: {
                cloudPath: `Select the route of the cloud service(Dropbox/Google Drive`,
                cloudButton: `Select`,
                reset: `Reset To default`,
                resetMessage: `Reset to display changes`,
                dangerMessage: `Watch out! don't select a folder with files you don't want to delete`,
            },

            bat: {
                batPath: `Select the route where the files will be executed`,
                batButton: `Select`,
                reset: `Reset to default`,
                resetMessage: `Reset to display changes`,
            },
           
        },

        editor: {
            title: `Write the title of the file`,
            body: `Write here your commands`,
            button: `Save`,
            dangerMessage: `The file will save in the current path for executed files. .bat extension is automatically set`,
        },

        footer: {
            startWithWindows:  `Start with Windows?`,
        },
    },

    appVersion: `Version 1.1.3`,
};

export function getCurrentLanguage() {
    const selectedLanguage = configFile.getItemValue("language");
    
    switch(selectedLanguage) {
        case "english":
          return languages.english;
        break;
        
        case "spanish":
            return languages.spanish;
        break;
    }
}

