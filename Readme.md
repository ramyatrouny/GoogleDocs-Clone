# Google Docs Clone

The Project is a real-time CRUD text editor exactly the same as Google Docs

## Project Architecture

The project is divided into 2 parts: `Client` and `Server`

### Client:
The client is React application that uses [Quill](https://www.npmjs.com/package/quill) as a WYSIWYG text editor that emits events based on the user changes

### Server:
The server is a NodeJS script that uses [Socket.IO](https://socket.io/) to handle the user events and store them in MongoDB


## Installation 

In order to install the application, you have to do an `npm install` in each repository as below
* Clone The repo
```bash
https://github.com/ramyatrouny/GoogleDocs-Clone.git
```
* Install the server
```bash
cd server && npm install 
```
* Install the client
```bash
cd client && npm install
```
* Run the server
```bash
cd server && npm run start
```
* Run the client
```bash
cd client && npm run start
```
* Make sure that you have MongoDB Schema `google-docs-clone` working on your local machine


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
MIT License

Copyright (c) 2021 Rami Atrouni

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.