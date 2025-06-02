import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button, Card, Form, Input, message } from 'antd'
import axios from 'axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface LoginForm {
	username: string
	password: string
}

const Login = () => {
	const [loading, setLoading] = useState<boolean>(false)
	const navigate = useNavigate()

	const onFinish = async (values: LoginForm) => {
		setLoading(true)
		try {
			const res = await axios.post(
				'https://nt-shopping-list.onrender.com/api/auth',
				{
					username: values.username,
					password: values.password,
				}
			)
			localStorage.setItem('token', res.data.token)
			message.success('Login muvaffaqiyatli!')
			navigate('/')
		} catch (error) {
			console.error(error)
			message.error('Login amalga oshmadi!')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
			{/* LEFT IMAGE */}
			<div className='hidden md:flex items-center justify-end'>
				<DotLottieReact
					src='https://lottie.host/23a04701-3a88-4e03-b436-cb76f9fa9f60/akdb68RgtD.lottie'
					loop
					autoplay
					className='w-[100%]'
				/>
			</div>

			{/* RIGHT FORM */}
			<div className='flex items-center justify-center bg-gray-100 p-6'>
				<Card title='Kirish' className='w-full max-w-sm shadow-md'>
					<Form layout='vertical' onFinish={onFinish}>
						<Form.Item<LoginForm>
							name='username'
							label='Username'
							rules={[{ required: true, message: 'Username kiriting' }]}
						>
							<Input placeholder='Username' />
						</Form.Item>

						<Form.Item<LoginForm>
							name='password'
							label='Parol'
							rules={[{ required: true, message: 'Parol kiriting' }]}
						>
							<Input.Password placeholder='Parol' />
						</Form.Item>

						<div className='text-sm pb-4'>
							Ro‘yxatdan o‘tmaganmisiz?{' '}
							<Link to='/register' className='text-blue-600 hover:underline'>
								Ro‘yxatdan o‘tish
							</Link>
						</div>

						<Form.Item>
							<Button type='primary' htmlType='submit' block loading={loading}>
								Kirish
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	)
}

export default Login
