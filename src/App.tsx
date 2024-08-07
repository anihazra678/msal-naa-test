import {
  AccountInfo,
  IPublicClientApplication,
  PopupRequest,
  PublicClientNext,
  SilentRequest,
} from "@azure/msal-browser";
import React, { useState } from "react";
import "./App.css";
import msalConfig from "./msalConfig";

// const msalInstance = new PublicClientApplication(msalConfig);

declare global {
  interface Window {
    nestedAppAuthBridge: object;
  }
}

const App: React.FC = () => {
  const [account, setAccount] = useState<AccountInfo | undefined>(undefined);
  const [pca, setPca] = useState<IPublicClientApplication | null>(null);
  const [header, setHeader] = useState<string>(
    "Welcome to MSAL Authentication App"
  );

  React.useEffect(() => {
    const initializeMsal = async () => {
      const _pca = await PublicClientNext.createPublicClientApplication(
        msalConfig
      );
      setPca(_pca);
      await pca?.initialize();
      const accounts = pca?.getAllAccounts();
      if ((accounts?.length ?? 0) > 0) {
        pca?.setActiveAccount(accounts?.[0] ?? null);
        setAccount(accounts?.[0]);
        setHeader(`Welcome, ${accounts?.[0].name}! to MSAL Authentication App`);
      }
    };
    initializeMsal();
  }, [pca]);

  React.useEffect(() => {
    if (window.nestedAppAuthBridge) {
      alert("Nested app auth bridge is available");
    } else {
      alert("Nested app auth bridge is not available");
    }
  });

  const login = async () => {
    console.log("Logging in...");
    try {
      const loginResponse = await pca?.loginPopup({
        scopes: ["user.read"],
      });
      setAccount(loginResponse?.account);
      setHeader(
        `Welcome, ${loginResponse?.account?.name}! to MSAL Authentication App`
      );
      console.log("Login successful:", loginResponse);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const authFlow = (silent = true) => {
    // const api = "https://graph.microsoft.com/User.Read";
    // let _account: AccountInfo = {
    //   homeAccountId:
    //     "6151696b-866e-4bfc-bbdc-0df08fdcbdef.4197fcf4-4986-4f7d-852d-3955410dc21f",
    //   environment: "login.windows.net",
    //   tenantId: "4197fcf4-4986-4f7d-852d-3955410dc21f",
    //   username: "admin@mee0.onmicrosoft.com",
    //   localAccountId: "6151696b-866e-4bfc-bbdc-0df08fdcbdef",
    //   name: "MEE Admin",
    //   authorityType: "MSSTS",
    //   tenantProfiles: new Map<string, TenantProfile>(),
    //   idTokenClaims: {
    //     aud: "b44c64a6-d623-4e05-90a8-56cfe4bcc62c",
    //     iss: "https://login.microsoftonline.com/4197fcf4-4986-4f7d-852d-3955410dc21f/v2.0",
    //     iat: 1717565470,
    //     nbf: 1717565470,
    //     exp: 1717569370,
    //     name: "MEE Admin",
    //     nonce: "018fe6e5-c707-7a0c-9b18-83399f700eb3",
    //     oid: "6151696b-866e-4bfc-bbdc-0df08fdcbdef",
    //     preferred_username: "admin@mee0.onmicrosoft.com",
    //     rh: "0.AX0A9PyXQYZJfU-FLTlVQQ3CH6ZkTLQj1gVOkKhWz-S8xix9AFU.",
    //     sub: "0hg-bmXXZfOBxeKS06tDvrvZbk8v68FmXjjFvJuZ580",
    //     tid: "4197fcf4-4986-4f7d-852d-3955410dc21f",
    //     uti: "0QodhiBI00-lKEy79nNMAA",
    //     ver: "2.0",
    //   },
    //   idToken:
    //     "dummy-id-token",
    // };
    // if (!account) {
    //   setAccount(_account);
    // }
    const request: SilentRequest = {
      scopes: ["user.read"],
      account: undefined,
    };
    const request2: PopupRequest = {
      scopes: ["user.read"],
      account: account,
    };
    silent
      ? pca
          ?.acquireTokenSilent(request)
          .then((authResponse) => {
            console.log(
              "Silent flow successful:",
              JSON.stringify(authResponse)
            );
            alert("Silent flow successful");
            if (!account) {
              setAccount(authResponse.account);
              setHeader(
                `Welcome, ${authResponse.account.name}! to MSAL Authentication App`
              );
            }
            return authResponse;
          })
          .catch((error) => {
            alert("Silent flow failed");
            if (error.errorMessage.indexOf("interaction_required") >= 0) {
              return login();
            } else {
              return Promise.reject(error);
            }
          })
      : pca
          ?.acquireTokenPopup(request2)
          .then((authResponse) => {
            console.log(
              "Interactive flow successful:",
              JSON.stringify(authResponse)
            );
            alert("Interactive flow successful");
            if (!account) {
              setAccount(authResponse.account);
              setHeader(
                `Welcome, ${authResponse.account.name}! to MSAL Authentication App`
              );
            }
            return authResponse;
          })
          .catch((error) => {
            alert("Interactive flow failed");
            if (error.errorMessage.indexOf("interaction_required") >= 0) {
              return login();
            } else {
              return Promise.reject(error);
            }
          });
  };

  const logout = () => {
    pca?.logoutPopup().then(() => {
      setAccount(undefined);
    });
  };

  return (
    <div className="App">
      <h1>{header}</h1>
      <div className="button-container">
        {account ? (
          <button onClick={logout}>Log out [Unsupported in WebView]"</button>
        ) : (
          <button onClick={login}>Log in</button>
        )}
        <button onClick={authFlow.bind(this, true)}>Silent Auth</button>
        <button onClick={authFlow.bind(this, false)}>Interactive Auth</button>
      </div>
    </div>
  );
};

export default App;
