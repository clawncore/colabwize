/**
 * reCAPTCHA v3 helper functions for standardized integration
 */

/**
 * Loads the reCAPTCHA v3 script dynamically
 * @param siteKey - Google reCAPTCHA v3 Site Key
 */
export function loadRecaptchaScript(siteKey: string): Promise<void> {
  return new Promise((resolve) => {
    // Check if script already exists
    if (document.getElementById("recaptcha-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
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
  await loadRecaptchaScript(siteKey);
  return new Promise((resolve, reject) => {
    if (!(window as any).grecaptcha) {
      reject(new Error("reCAPTCHA script not loaded"));
      return;
    }
    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
}
