import { createBrowserRouter } from 'react-router-dom'
import Login from '../auth/login'
import RegisterPage from '../auth/RegisterPage'
import Dashboard from '../pages/Dashboard/Dashboard'
import GroupDetail from '../pages/GroupDetail'
import Home from '../pages/Home/Home'
import PrivateRoute from '../pages/Home/PrivateRoute'

// 👉 Yangi komponent 404 sahifa uchun
const NotFound = () => (
	<h1 style={{ textAlign: 'center' }}>404 – Sahifa topilmadi</h1>
)

export const routes = createBrowserRouter([
	{
		path: '/',
		element: (
			<PrivateRoute>
				<Home />
			</PrivateRoute>
		),
		children: [
			{
				path: '/',
				element: <Dashboard />,
			},
			{
				path: '/groups/:id',
				element: <GroupDetail />,
			},
		],
	},
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '/register',
		element: <RegisterPage />,
	},
	{
		path: '*',
		element: <NotFound />,
	},
])
