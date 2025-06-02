import {
	DeleteOutlined,
	LogoutOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	PlusOutlined,
	SearchOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons'
import {
	Avatar,
	Button,
	Form,
	Input,
	Layout,
	Menu,
	Modal,
	message,
	notification,
} from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const { Sider, Header, Content } = Layout

interface Props {
	children: React.ReactNode
}

interface UserProfile {
	name: string
	username: string
}

interface Group {
	_id: string
	name: string
	joined?: boolean
}

const SidebarLayout = () => {
	const [collapsed, setCollapsed] = useState(false)
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [groupForm] = Form.useForm()
	const [joinForm] = Form.useForm()
	const [groups, setGroups] = useState<Group[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return

		const fetchProfileAndGroups = async () => {
			try {
				const [profileRes, groupsRes] = await Promise.all([
					fetch('https://nt-shopping-list.onrender.com/api/auth', {
						headers: { 'x-auth-token': token },
					}),
					fetch('https://nt-shopping-list.onrender.com/api/groups', {
						headers: { 'x-auth-token': token },
					}),
				])

				if (!profileRes.ok || !groupsRes.ok)
					throw new Error('Ma′lumotlarni olishda xatolik')

				const profileData = await profileRes.json()
				const groupData = await groupsRes.json()
				setProfile(profileData)
				const enrichedGroups = groupData.map((g: Group) => ({
					...g,
					joined: true,
				}))
				setGroups(enrichedGroups)
			} catch {
				message.error('Ma′lumotlarni olishda xatolik')
			}
		}

		fetchProfileAndGroups()
	}, []) // ✅ FAQAT bir marta chaqiriladi

	const handleGroupSearch = async (value: string) => {
		const token = localStorage.getItem('token')
		if (!token) return

		setSearchLoading(true)
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/groups/search?q=${value}`,
				{ headers: { 'x-auth-token': token } }
			)
			if (!res.ok) throw new Error()
			const result = await res.json()
			const searchedGroups = result.map((g: Group) => ({ ...g, joined: false }))
			setGroups(searchedGroups)
		} catch {
			message.error('Guruhlarni qidirishda xatolik')
		} finally {
			setSearchLoading(false)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('token')
		message.success('Tizimdan chiqildi')
		navigate('/login')
	}

	const handleDeleteProfile = async () => {
		Modal.confirm({
			title: 'Profilni o‘chirishni istaysizmi?',
			content: 'Bu amal ortga qaytarilmaydi.',
			okText: 'Ha, o‘chirilsin',
			okType: 'danger',
			cancelText: 'Bekor qilish',
			onOk: async () => {
				const token = localStorage.getItem('token')
				if (!token) return
				try {
					await fetch('https://nt-shopping-list.onrender.com/api/users', {
						method: 'DELETE',
						headers: { 'x-auth-token': token },
					})
					localStorage.removeItem('token')
					message.success('Profil o‘chirildi')
					navigate('/login')
				} catch {
					message.error('Xatolik yuz berdi')
				}
			},
		})
	}

	const handleAddGroup = async () => {
		try {
			const values = await groupForm.validateFields()
			const token = localStorage.getItem('token')
			if (!token) throw new Error('Token topilmadi')

			const res = await fetch(
				'https://nt-shopping-list.onrender.com/api/groups',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-auth-token': token,
					},
					body: JSON.stringify({
						name: values.groupName,
						password: values.password,
					}),
				}
			)

			if (!res.ok) {
				const errorText = await res.text()
				throw new Error(errorText || 'Server xatosi')
			}

			const newGroup = await res.json()
			setGroups(prev => [...prev, { ...newGroup, joined: true }])
			notification.success({
				message: 'Guruh yaratildi',
				description: `"${values.groupName}" guruhi yaratildi`,
			})
			setIsGroupModalOpen(false)
			groupForm.resetFields()
		} catch (err: any) {
			notification.error({ message: err.message || 'Guruhni yaratib bo‘lmadi' })
		}
	}

	const handleJoinGroup = async () => {
		try {
			const values = await joinForm.validateFields()
			const token = localStorage.getItem('token')
			if (!token || !selectedGroupId) return

			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/groups/${selectedGroupId}/join`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-auth-token': token,
					},
					body: JSON.stringify({ password: values.password }),
				}
			)

			if (!res.ok) throw new Error('Kod xato')
			const joined = await res.json()
			setGroups(prev => {
				const exists = prev.some(g => g._id === joined._id)
				return exists ? prev : [...prev, { ...joined, joined: true }]
			})
			notification.success({ message: 'Guruhga qo‘shildingiz' })
			setIsJoinModalOpen(false)
			joinForm.resetFields()
		} catch (err: any) {
			notification.error({ message: err.message || 'Kod xato' })
		}
	}

	return (
		<Layout className='min-h-screen'>
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={setCollapsed}
				className='shadow-md bg-white flex flex-col justify-between'
				width={220}
			>
				<div>
					<div className='flex flex-col items-center justify-center py-6'>
						<Avatar size={64} icon={<UserOutlined />} />
						{!collapsed && profile && (
							<div className='mt-2 text-center'>
								<p className='font-semibold'>{profile.name}</p>
								<p className='text-xs text-gray-500'>@{profile.username}</p>
								<Button
									type='link'
									icon={<LogoutOutlined />}
									onClick={handleLogout}
									className='text-red-500 px-0'
								>
									Chiqish
								</Button>
							</div>
						)}
					</div>

					<Input.Search
						placeholder='Guruh qidirish'
						allowClear
						enterButton={<SearchOutlined />}
						loading={searchLoading}
						onSearch={handleGroupSearch}
						className='mx-4 my-2'
						onClick={e => e.stopPropagation()} // 🔧 bu muammoni hal qiladi
					/>

					<Menu
						mode='inline'
						defaultSelectedKeys={['1']}
						onClick={({ key }) => {
							if (key === 'add-group') return setIsGroupModalOpen(true)
							if (key === '1') return navigate('/')
							if (key.startsWith('group-'))
								navigate(`/groups/${key.replace('group-', '')}`)
						}}
						items={[
							{ key: '1', icon: <TeamOutlined />, label: 'Dashboard' },
							{
								key: 'grp3',
								label: 'Guruhlar',
								type: 'group',
								children: [
									...groups.map(group => ({
										key: `group-${group._id}`,
										label: (
											<div className='flex justify-between items-center'>
												<span>{group.name}</span>
												{!group.joined && (
													<Button
														type='link'
														size='small'
														className='text-blue-500 hover:underline'
														onClick={e => {
															e.stopPropagation()
															setSelectedGroupId(group._id)
															setIsJoinModalOpen(true)
														}}
													>
														Join
													</Button>
												)}
											</div>
										),
									})),
									{
										key: 'add-group',
										icon: <PlusOutlined />,
										label: '➕ Guruh qo‘shish',
									},
								],
							},
						]}
					/>
				</div>
				{!collapsed && (
					<div className='p-4'>
						<Button
							danger
							icon={<DeleteOutlined />}
							onClick={handleDeleteProfile}
							block
						>
							Profilni o‘chirish
						</Button>
					</div>
				)}
			</Sider>

			<Layout>
				<Header className='bg-white shadow-md px-4 flex justify-between items-center'>
					<Button
						type='text'
						icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={() => setCollapsed(!collapsed)}
					/>
				</Header>
				<Content className='p-6 bg-gray-100 min-h-[calc(100vh-64px)]'>
					<Outlet />
				</Content>
			</Layout>

			<Modal
				title='Yangi guruh qo‘shish'
				open={isGroupModalOpen}
				onCancel={() => setIsGroupModalOpen(false)}
				footer={null} // ❗ Buttonlarni formadan oladi
			>
				<Form form={groupForm} layout='vertical' onFinish={handleAddGroup}>
					<Form.Item
						name='groupName'
						label='Guruh nomi'
						rules={[{ required: true, message: 'Guruh nomini kiriting' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='password'
						label='Parol'
						rules={[{ required: true, message: 'Parol kiriting' }]}
					>
						<Input.Password />
					</Form.Item>
					<Form.Item>
						<Button type='primary' htmlType='submit' block>
							Guruh qo‘shish
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Guruhga qo‘shilish'
				open={isJoinModalOpen}
				onCancel={() => setIsJoinModalOpen(false)}
				onOk={handleJoinGroup}
			>
				<Form form={joinForm} layout='vertical'>
					<Form.Item name='password' label='Parol' rules={[{ required: true }]}>
						<Input.Password />
					</Form.Item>
				</Form>
			</Modal>
		</Layout>
	)
}

export default SidebarLayout
