import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button, Card, Form, Input, notification } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface RegisterForm {
	name: string
	username: string
	password: string
}

const Register = () => {
	const navigate = useNavigate()
	const [loading, setLoading] = useState<boolean>(false)

	const onFinish = async (values: RegisterForm) => {
		setLoading(true)

		try {
			const res = await fetch(
				'https://nt-shopping-list.onrender.com/api/users',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(values),
				}
			)

			if (!res.ok) throw new Error('Ro‘yxatdan o‘tishda xatolik!')

			notification.success({ message: 'Muvaffaqiyatli ro‘yxatdan o‘tildi 🎉' })

			const loginRes = await fetch(
				'https://nt-shopping-list.onrender.com/api/auth',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username: values.username,
						password: values.password,
					}),
				}
			)

			const loginData = await loginRes.json()

			if (loginRes.ok) {
				localStorage.setItem('token', loginData.token)
				navigate('/')
			} else {
				throw new Error(loginData.message || 'Login amalga oshmadi')
			}
		} catch (error: any) {
			notification.error({ message: 'Xatolik', description: error.message })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen grid grid-cols-1 md:grid-cols-2'>
			{/* LEFT IMAGE */}
			<div className='hidden md:flex items-center justify-end '>
				<DotLottieReact
					src='https://lottie.host/23a04701-3a88-4e03-b436-cb76f9fa9f60/akdb68RgtD.lottie'
					loop
					autoplay
					className='w-[100%]'
				/>
			</div>

			{/* RIGHT FORM */}
			<div className='flex items-center justify-center bg-gray-100 p-6'>
				<Card title='Ro‘yxatdan o‘tish' className='w-full max-w-sm shadow-md'>
					<Form layout='vertical' onFinish={onFinish}>
						<Form.Item<RegisterForm>
							name='name'
							label='Ism'
							rules={[{ required: true, message: 'Ismingizni kiriting' }]}
						>
							<Input placeholder='Ism' />
						</Form.Item>

						<Form.Item<RegisterForm>
							name='username'
							label='Username'
							rules={[{ required: true, message: 'Username kiriting' }]}
						>
							<Input placeholder='Username' />
						</Form.Item>

						<Form.Item<RegisterForm>
							name='password'
							label='Parol'
							rules={[{ required: true, message: 'Parol kiriting' }]}
						>
							<Input.Password placeholder='Parol' />
						</Form.Item>

						<div className='pb-3'>
							<Link to={'/login'} className='text-bold'>
								Login
							</Link>
						</div>

						<Form.Item>
							<Button type='primary' htmlType='submit' block loading={loading}>
								Ro‘yxatdan o‘tish
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		</div>
	)
}

export default Register
