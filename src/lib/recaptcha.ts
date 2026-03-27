/**
 * reCAPTCHA v3 helper functions for standardized integration
 */

/**
 * Loads the reCAPTCHA v3 script dynamically
 * @param siteKey - Google reCAPTCHA v3 Site Key
 */
export function loadRecaptchaScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Bypass in development
    if (
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      resolve();
      return;
    }

    // Check if script already exists
    if (document.getElementById("recaptcha-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
    
    // Add a timeout for script loading
    const timeout = setTimeout(() => {
      reject(new Error("reCAPTCHA script load timeout"));
    }, 10000); // 10 second timeout

    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    document.head.appendChild(script);
  });
}

/**
 * Loads the reCAPTCHA v2 (Checkbox) script
 */
export function loadRecaptchaV2Script(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
      resolve();
      return;
    }
    
    // Check if script already exists
    if (document.getElementById("recaptcha-v2-script")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "recaptcha-v2-script";
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA v2 script"));
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * Renders a reCAPTCHA v2 Checkbox in the specified container
 */
export async function renderRecaptchaV2(
  containerId: string,
  siteKey: string,
  callback: (token: string) => void,
): Promise<number | null> {
  try {
    await loadRecaptchaV2Script();
    return new Promise((resolve) => {
      (window as any).grecaptcha.ready(() => {
        const widgetId = (window as any).grecaptcha.render(containerId, {
          sitekey: siteKey,
          callback: callback,
          theme: "light",
        });
        resolve(widgetId);
      });
    });
  } catch (err) {
    console.error("Failed to render reCAPTCHA v2:", err);
    return null;
  }
}

/**
 * Executes a reCAPTCHA challenge and returns the token
 * @param siteKey - Google reCAPTCHA v3 Site Key
 * @param action - Action name (e.g. 'login', 'signup', 'forgot_password')
 * @returns Promise<string> - The reCAPTCHA token
 */
export async function getRecaptchaToken(
  siteKey: string,
  action: string = "homepage",
): Promise<string> {
  // Bypass in development
  if (
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("[reCAPTCHA] Bypassing token generation in development mode.");
    return "dev-token-bypassed";
  }

  try {
    await loadRecaptchaScript(siteKey);
  } catch (err) {
    throw new Error("reCAPTCHA script not available");
  }

  return new Promise((resolve, reject) => {
    if (!(window as any).grecaptcha) {
      reject(new Error("reCAPTCHA script not loaded"));
      return;
    }

    // Set a timeout for the entire token generation process
    const timeout = setTimeout(() => {
      reject(new Error("reCAPTCHA execution timeout"));
    }, 8000); // 8 second timeout

    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute(siteKey, { action })
        .then((token: string) => {
          clearTimeout(timeout);
          resolve(token);
        })
        .catch((err: any) => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  });
}
