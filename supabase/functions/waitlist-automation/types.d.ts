// Type declarations for resend module
declare module 'https://esm.sh/resend@3.2.0' {
    export class Resend {
        constructor(apiKey: string);
        emails: {
            send: (data: any) => Promise<any>;
        };
    }
}