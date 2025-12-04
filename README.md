## About

Backend to serve API for [OT Launcher](https://github.com/Oen44/ot-launcher), fetches messages from Discord channel and parses as news.

## Requirements

- Node.js 20+
- Discord bot that can read messages

## Installation

1. Run `npm install`
2. Rename `.env.example` to `.env` and configure

## Usage

Simply run `npm start`. Discord messages require first line to follow this template

```
[Type] Title
```

Example

```
[Event] Winter event comming soon

New event starting soon, celebrating winter season [...]
```
