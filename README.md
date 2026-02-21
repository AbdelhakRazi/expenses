# Expense Tracker

A cross-platform desktop app (Windows + macOS) built with Electron to quickly track expenses.

## Features

- Add entries with date, expense name, and price
- See monthly total by selected month
- Delete individual entries
- Clear entries for selected month
- Local data persistence in your machine user data folder

## Run locally

1. Install dependencies:

   ```bash
  bun install
   ```

2. Start app:

   ```bash
  bun run start
   ```

## Build installers

- Windows installer:

  ```bash
  bun run dist:win
  ```

- macOS DMG:

  ```bash
  bun run dist:mac
  ```

Build output is generated in `release/`.
