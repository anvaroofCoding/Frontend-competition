import {
	LoadingOutlined,
	SyncOutlined,
	UserOutlined,
	WarningOutlined,
} from '@ant-design/icons'
import { Card } from 'antd'
import { motion } from 'framer-motion'

const cardData = [
	{
		title: 'Foydalanuvchilar',
		icon: <UserOutlined className='text-3xl text-blue-600' />,
		value: 1324,
		color: 'border-blue-600',
	},
	{
		title: 'Jarayonlar',
		icon: <SyncOutlined className='text-3xl text-green-600 animate-spin' />,
		value: 37,
		color: 'border-green-600',
	},
	{
		title: 'Xatoliklar',
		icon: <WarningOutlined className='text-3xl text-red-500' />,
		value: 4,
		color: 'border-red-500',
	},
	{
		title: 'Yangi kirganlar',
		icon: <LoadingOutlined className='text-3xl text-purple-600' />,
		value: 98,
		color: 'border-purple-600',
	},
]

const Dashboard = () => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4'>
			{cardData.map((card, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.2, duration: 0.6, type: 'spring' }}
				>
					<Card
						className={`border-l-4 ${card.color} shadow hover:shadow-lg transition`}
						bodyStyle={{ padding: '20px' }}
					>
						<div className='flex items-center gap-4'>
							<div className='bg-gray-100 p-3 rounded-full'>{card.icon}</div>
							<div>
								<h2 className='text-gray-600 text-sm'>{card.title}</h2>
								<p className='text-xl font-semibold'>{card.value}</p>
							</div>
						</div>
					</Card>
				</motion.div>
			))}
		</div>
	)
}

export default Dashboard
