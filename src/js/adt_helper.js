const CLIENT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
const AUTHORITY = "https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
const REDIRECT_URL = "http://localhost:3000";

accessToken = null;

const invokeWithLoading = async callback => {
    let response = null;
    try {
        response = await callback();
    } catch (e) {
        throw e;
    }

    return response;
};

async function azureIoTLogin() {
    // Config object to be passed to Msal on creation
    const msalConfig = {
        auth: {
            clientId: CLIENT_ID,
            authority: AUTHORITY,
            redirectUri: REDIRECT_URL,
        },
        cache: {
            cacheLocation: "localStorage",
            storeAuthStateInCookie: true,
        }
    };

    const myMSALObj = new Msal.UserAgentApplication(msalConfig);

    const loginRequest = { scopes: ["https://digitaltwins.azure.net/.default"] };

    if (!myMSALObj.getAccount()) {
        await invokeWithLoading(async () => await myMSALObj.loginPopup(loginRequest));
    }

    // If the user is already logged in you can acquire a token
    if (myMSALObj.getAccount()) {
        try {
            const response = await myMSALObj.acquireTokenSilent(loginRequest);
            accessToken = response.accessToken;
        } catch (err) {
            // Could also check if err instance of InteractionRequiredAuthError if you can import the class
            if (err.name === "InteractionRequiredAuthError") {
                const response = await invokeWithLoading(async () => await myMSALObj.acquireTokenPopup(loginRequest));
                accessToken = response.accessToken;
            }
        }
    }
}

function get_data(object){
    return new Promise((resolve, reject) => {
        if(!accessToken) return;

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                resolve(this.responseText);
            }
        });

        xhr.open("GET", "http://localhost:3000/data/" + object);        

        xhr.setRequestHeader('Authorization', accessToken);
        
        xhr.send();        
    })
}

function force_alert() {
    return new Promise((resolve, reject) => {
        if (!accessToken) reject();

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log(this.responseText);
                resolve(this.responseText);
            }
        });

        xhr.open("POST", 'http://localhost:3000/force_alert');        
        xhr.setRequestHeader('Authorization', accessToken);
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.send();        
    });
}

function reset_alert() {
    return new Promise((resolve, reject) => {
        if (!accessToken) reject();

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log(this.responseText);
                resolve(this.responseText);
            }
        });

        xhr.open("POST", 'http://localhost:3000/reset_alert');        
        xhr.setRequestHeader('Authorization', accessToken);
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.send();        
    });
}