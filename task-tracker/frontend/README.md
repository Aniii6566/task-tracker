# Task Tracker Frontend

A modern React-based task management dashboard with dark theme and professional UI.

## Features

- Modern dark dashboard UI
- Responsive design for all devices
- Real-time task management
- Analytics and charts
- Authentication system
- Multi-device support

## Tech Stack

- React 18
- TailwindCSS
- React Router
- Recharts
- Lucide React
- Axios

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Open http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Build for Production

```bash
npm run build
```

## Deployment

### Netlify

1. Run `npm run build`
2. Upload the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically build and deploy
3. Set environment variables in Vercel dashboard

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── App.js         # Main app component
├── index.js       # Entry point
└── index.css      # Global styles
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend connects to the backend API at `/api` endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/analytics` - Get analytics data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
