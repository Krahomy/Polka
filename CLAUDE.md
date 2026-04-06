# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polka is a mobile-first book tracking web app built with React, TypeScript, and Tailwind CSS.

## Commands

*(To be filled in once the project is scaffolded — e.g., `npm run dev`, `npm test`, `npm run lint`)*

## Architecture

*(To be expanded as the codebase grows)*

### Stack
- **React** — UI components
- **TypeScript** — type safety throughout
- **Tailwind CSS** — utility-first styling, mobile-first breakpoints (`sm:`, `md:`, `lg:`)

### Design Approach
- Mobile-first: default styles target small screens; larger breakpoints are layered on top
- Tailwind responsive prefixes should follow the mobile-first order: base → `sm:` → `md:` → `lg:`
