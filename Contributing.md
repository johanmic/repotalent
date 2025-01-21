# Contributing Guide

Thank you for considering contributing to our project! This document outlines the process and guidelines for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/project-name.git
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Development Setup

1. Create a `.env` file following the `.env.example` template
2. Run the development server:
   ```bash
   pnpm dev
   ```

## Code Style Guidelines

- We use TypeScript for all code files
- Follow the functional programming paradigm
- Use named exports for components
- Implement proper TypeScript interfaces
- Follow our file structure:
  ```
  src/
  ├── components/
  │   ├── ui/          # shadcn components (out of the box)
  │   └── [filename]   # custom components
  ├── actions/         # server actions
  ├── app/            # Next.js app router pages
  └── trigger/        # trigger.dev workflows
  ```

### Naming Conventions

- Use lowercase with dashes for directories (e.g., `auth-wizard`)
- Component files should be dash-case (e.g., `auth-button.tsx`)
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)

### Component Structure

- Use shadcn components for UI elements
- Create custom components in the `components` directory
- Use the `ui` directory for shadcn components that are not part of the UI library

### Trigger.dev Workflows

- Create a new file in the `trigger` directory
- Use the `trigger` directory for trigger.dev workflows
- Use the `trigger/workflows` directory for trigger.dev workflows
