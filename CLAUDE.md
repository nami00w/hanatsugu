# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要な指示
このプロジェクトで作業する際は、必ず日本語で回答してください。

## Commands

### Development
```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint for code quality checks
```

## Architecture Overview

This is a **wedding dress resale marketplace** called "Hanatsugu" (花継ぐ - "inherit/pass on flowers") targeting the Japanese market. Built with Next.js 15.3.3 using the App Router architecture.

### Key Technical Stack
- **Next.js 15.3.3** with App Router
- **React 19.0.0** 
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS v4** (new PostCSS-based configuration)
- **ESLint 9** with flat config format

### Project Structure
- `/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with metadata and font configuration
  - `page.tsx` - Homepage with hero, search, categories, and product listings
- `/components/` - Reusable React components
  - `DressCard.tsx` - Product card component with TypeScript interface
- Path aliasing: `@/*` maps to project root

### Design Patterns
- **Japanese-first**: All UI text in Japanese, prices in Yen (¥)
- **Component Architecture**: TypeScript interfaces for all component props
- **Styling**: Utility-first with Tailwind CSS, pink color scheme for primary actions
- **Image Optimization**: Uses Next.js Image component for all product images
- **Font Optimization**: Geist font family loaded via Next.js font system