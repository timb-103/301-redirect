# Redirect Server

For this project, we have to create a redirect server seperate to our main process. It has to be able to accept all incoming requests from all domains. It's just a simple node server.

To run this server, create a digital ocean droplet ($5/mo).

SSH into it, to get started.

## Install

Clone the repo to your server:

```sh
git clone https://github.com/timb-103/301-redirect.git
```

Change into the .redirect-server folder

``sh
cd .redirect-server

````

Install dependencies

```sh
npm install
````

Start the server

```sh
node index
```
