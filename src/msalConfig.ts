import { Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "b44c64a6-d623-4e05-90a8-56cfe4bcc62c", // Replace with your client ID
    authority: "https://login.microsoftonline.com/4197fcf4-4986-4f7d-852d-3955410dc21f", // Replace with your tenant ID if needed
    redirectUri: "http://localhost:3000/", // Replace with your redirect URI
    supportsNestedAppAuth: true,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true
  }
};

export default msalConfig;
