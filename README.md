# Selfiemator

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Configure
Use `environment.prod.ts` (or `environment.ts`) and configure your Firebase and Cloudinary details. It should have the following content:

```typescript
export const environment = {
  production: true|false,
  cloudName: '',
  uploadPreset: '',
  firebase: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: ''
  }
};
```

## Run the HTTP server
The repository contains an HTTP server which you can run by executing `npm run http` (do this after `ng build --prod`)