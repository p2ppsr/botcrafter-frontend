# BotCrafter Code Along

Completed app: https://botcrafter.io

## Clone Repo

```sh
git clone https://github.com/bitcoin-sv/london
```

## Add User Authentication via Authrite

Replace conventional `window.fetch` with Authrite `client.request`

src/utils/request.js, change line 8

from:

```js
    const response = await window.fetch(url, {
```

to:

```js
    const response = await client.request(url, {
```

## Enable Micro-Payments via PacketPay

Replace Authrite `client.request` with `PacketPay`

src/utils/paidRequest.js, change line 12

from:

```js
    const response = await client.request(url, {
```

to:

```js
    const response = await PacketPay(url, {
```
