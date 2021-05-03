# RadarCOVID Web App

<p style="text-align: center">
    <a href="https://github.com/RadarCOVID/radar-covid-web-public/commits/" title="Last Commit"><img src="https://img.shields.io/github/last-commit/RadarCOVID/radar-covid-web-public?style=flat" alt="last-commit"></a>
    <a href="https://github.com/RadarCOVID/radar-covid-web-public/issues" title="Open Issues"><img src="https://img.shields.io/github/issues/RadarCOVID/radar-covid-web-public?style=flat" alt="issues"></a>
    <a href="https://github.com/RadarCOVID/radar-covid-web-public/blob/master/LICENSE" title="License"><img src="https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg?style=flat" alt="license"></a>
</p>

## Introduction

Web App associated with Radar COVID to generate public and private qr for an establishment and the upload of the private qr.

## Prerequisites
These are the frameworks and tools used to develop the solution:
- Webpack
- Node
- Npm

## Installation and Getting Started

Clone this repository.

Install dependencies: `npm install`

Generate a key pair (private and public) with the `setupHA` method (these come in Uint8Array and you have to pass them to hexadecimal with the` to_hex` method) of the ***clowdnotifier api*** and add them in the files:
[dev.env.js](./config/dev.env.js)
[pre.env.js](./config/pre.env.js)
[prod.env.js](./config/prod.env.js)

Serve with hot reload at ***localhost:8080***: `npm run dev`

## Build Setup
You can configure the base url of the qr through the `package.json` script.

``` bash
# build for production with minification
npm run build-pro

# build for preproduction with minification
npm run build-pre
```

## Support and Feedback

The following channels are available for discussions, feedback, and support requests:

| Type       | Channel                                                |
| ---------- | ------------------------------------------------------ |
| **Issues** | <a href="https://github.com/RadarCOVID/radar-covid-web-public/issues" title="Open Issues"><img src="https://img.shields.io/github/issues/RadarCOVID/radar-covid-web-public?style=flat"></a> |

## Contribute

If you want to contribute with this exciting project follow the steps in [How to create a Pull Request in GitHub](https://opensource.com/article/19/7/create-pull-request-github).

More details in [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This Source Code Form is subject to the terms of the [Mozilla Public License, v. 2.0](https://www.mozilla.org/en-US/MPL/2.0/).


