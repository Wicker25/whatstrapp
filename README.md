# WhatsTrapp

![WhatsTrapp video](https://media.giphy.com/media/1gQ65LmOcgLwe1XKWl/giphy.gif)

## Introduction
*WhatsTrapp* is a tool for analyzing and dumping WhatsApp accounts.

## Requirements

- Node.js >= 8.0
- Yarn
- Docker
- Docker Compose

## Installation

Clone the repository:
```
$ git clone git@github.com:Wicker25/whatstrapp.git
$ cd whatstrapp/
```

Install all the dependencies for the project:
```
$ yarn
```

Create the *Elasticsearch* and *Kibana*'s containers:
```
$ docker-compose pull
```

## Trying it out

Start the *Elasticsearch* and *Kibana*'s containers with:
```
$ docker-compose up
```

Launch the *WhatsTrapp* server with:
```
$ yarn start
```

Then open your browser at http://127.0.0.1:8025/ and wait until the QR code has been loaded.

Launch the target's *WhatsApp* and, from the main menu, select "WhatsApp Web".

Finally, take a picture of the QR code and enjoy it!

## Data Analysis

Launch *Kibana* by opening your browser at http://127.0.0.1:5601/.

Set the *Index Pattern* as `wt-*` and click on "Create" (the pattern is valid only after you collected some data!).

![kibana-create-index](https://user-images.githubusercontent.com/500733/45918766-bd41cf00-be83-11e8-8cfb-c363e6f5fa91.png)

Now you can open the *Discover* page and visualize the collected data.

![kibana-example](https://user-images.githubusercontent.com/500733/45918960-88834700-be86-11e8-963e-0cc0f3660085.png)

## Architecture

The *WhatsTrapp*'s architecture consists of a *Puppeteer*, *Puppets*, and *Clients*:

![WhatsTrapp architecture](https://user-images.githubusercontent.com/500733/45647051-d54cd380-babc-11e8-8906-d277456ed211.png)

- The *Puppeteer* launches the browser instance by using [Google Puppeteer](https://github.com/GoogleChrome/puppeteer) and injects a *Puppet* into it;
- The *Puppet* is a JavaScript that performs actions in the [WhatsApp Web](https://web.whatsapp.com/) page;
- The *Client* is the user interface used by the attacker for performing the hack.

All of the components communicate with each other via *WebSocket*.
