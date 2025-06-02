import {
	Button,
	Card,
	Divider,
	Input,
	List,
	Spin,
	Tag,
	Typography,
	message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const { Title, Text } = Typography

interface Member {
	_id: string
	username: string
	name: string
	status: string
}

interface Item {
	_id: string
	title: string
	isBought: boolean
}

interface Group {
	_id: string
	name: string
	items: Item[]
	members: Member[]
	owner: {
		_id: string
		username: string
		name: string
		status: string
	}
}

const GroupDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()

	const [searchUsername, setSearchUsername] = useState('')
	const [searchResults, setSearchResults] = useState<Member[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const [addingMemberIds, setAddingMemberIds] = useState<string[]>([])
	const [groups, setGroups] = useState<Group[]>([])
	const [group, setGroup] = useState<Group | null>(null)
	const [loading, setLoading] = useState(true)
	const [newItem, setNewItem] = useState('')
	const [adding, setAdding] = useState(false)
	const [deletingItemIds, setDeletingItemIds] = useState<string[]>([])
	const [togglingIds, setTogglingIds] = useState<string[]>([])
	const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([])
	const [deletingGroup, setDeletingGroup] = useState(false)

	const currentUserId = localStorage.getItem('userId') || ''
	const token = localStorage.getItem('token') || ''

	useEffect(() => {
		if (!token) {
			message.warning('Token mavjud emas. Iltimos, login qiling.')
			return
		}

		const fetchGroups = async () => {
			try {
				const res = await fetch(
					'https://nt-shopping-list.onrender.com/api/groups',
					{ headers: { 'x-auth-token': token } }
				)
				const data = await res.json()
				setGroups(data)
			} catch (error: any) {
				message.error(error.message || 'Xatolik yuz berdi')
			} finally {
				setLoading(false)
			}
		}

		fetchGroups()
	}, [token])

	useEffect(() => {
		if (id) {
			const found = groups.find(g => g._id === id)
			setGroup(found ?? null)
		}
	}, [id, groups])

	const handleSearchUser = async () => {
		if (!searchUsername.trim()) return
		setSearchLoading(true)
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/users/search?q=${searchUsername}`,
				{ headers: { 'x-auth-token': token } }
			)
			const data = await res.json()
			setSearchResults(data)
		} catch (err) {
			message.error('Qidirishda xatolik')
		} finally {
			setSearchLoading(false)
		}
	}

	const handleAddItem = async () => {
		if (!token || !newItem.trim()) {
			message.warning('Item nomi bo‘sh bo‘lmasligi kerak')
			return
		}
		setAdding(true)
		try {
			const res = await fetch(
				'https://nt-shopping-list.onrender.com/api/items',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-auth-token': token,
					},
					body: JSON.stringify({ title: newItem, groupId: id }),
				}
			)
			if (!res.ok) throw new Error(await res.text())

			const { item } = await res.json()
			setGroup(prev =>
				prev ? { ...prev, items: [...prev.items, item] } : null
			)
			setNewItem('')
			message.success('Item qo‘shildi')
		} catch (err: any) {
			message.error(err.message || 'Item qo‘shishda xatolik')
		} finally {
			setAdding(false)
		}
	}

	const handleDeleteItem = async (itemId: string) => {
		setDeletingItemIds(prev => [...prev, itemId])
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/items/${itemId}`,
				{
					method: 'DELETE',
					headers: { 'x-auth-token': token },
				}
			)
			if (!res.ok) throw new Error(await res.text())

			setGroup(prev =>
				prev
					? { ...prev, items: prev.items.filter(i => i._id !== itemId) }
					: null
			)
			message.success('Item o‘chirildi')
		} catch {
			message.error('O‘chirishda xatolik')
		} finally {
			setDeletingItemIds(prev => prev.filter(id => id !== itemId))
		}
	}

	const handleToggleBought = async (itemId: string, currentStatus: boolean) => {
		setTogglingIds(prev => [...prev, itemId])
		const method = currentStatus ? 'DELETE' : 'POST'
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/items/${itemId}/mark-as-bought`,
				{ method, headers: { 'x-auth-token': token } }
			)
			if (!res.ok) throw new Error(await res.text())

			setGroup(prev =>
				prev
					? {
							...prev,
							items: prev.items.map(item =>
								item._id === itemId
									? { ...item, isBought: !currentStatus }
									: item
							),
					  }
					: null
			)
			message.success(
				!currentStatus ? '✅ Sotib olindi' : '❌ Sotib olish bekor qilindi'
			)
		} catch (err: any) {
			message.error(err.message || 'Xatolik yuz berdi')
		} finally {
			setTogglingIds(prev => prev.filter(id => id !== itemId))
		}
	}

	const handleRemoveMember = async (memberId: string) => {
		if (!id || memberId === currentUserId) return
		setRemovingMemberIds(prev => [...prev, memberId])
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/groups/${id}/members/${memberId}`,
				{ method: 'DELETE', headers: { 'x-auth-token': token } }
			)
			if (!res.ok) throw new Error(await res.text())

			setGroup(prev =>
				prev
					? { ...prev, members: prev.members.filter(m => m._id !== memberId) }
					: null
			)
			message.success('A’zo o‘chirildi')
		} catch {
			message.error('A’zoni o‘chirishda xatolik')
		} finally {
			setRemovingMemberIds(prev => prev.filter(id => id !== memberId))
		}
	}

	const handleLeaveGroup = async () => {
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/groups/${id}/leave`,
				{ method: 'POST', headers: { 'x-auth-token': token } }
			)
			if (res.ok) {
				message.success('Guruhdan muvaffaqiyatli chiqdingiz')
				navigate('/')
			} else {
				const data = await res.json()
				message.error(data.message || 'Chiqishda xatolik')
			}
		} catch (err) {
			console.error(err)
			message.error('Server bilan aloqa yo‘q')
		}
	}

	const handleDeleteGroup = async () => {
		if (!token || !id) return
		setDeletingGroup(true)
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/groups/${id}`,
				{ method: 'DELETE', headers: { 'x-auth-token': token } }
			)
			if (!res.ok) throw new Error(await res.text())
			message.success('Guruh o‘chirildi')
			navigate('/')
		} catch (err: any) {
			message.error(err.message || 'Guruhni o‘chirishda xatolik')
		} finally {
			setDeletingGroup(false)
		}
	}

	const handleAddMember = async (userId: string) => {
		if (!id) return
		setAddingMemberIds(prev => [...prev, userId])
		try {
			const res = await fetch(
				`https://nt-shopping-list.onrender.com/api/groups/${id}/members`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-auth-token': token,
					},
					body: JSON.stringify({ userId }),
				}
			)
			if (!res.ok) throw new Error(await res.text())
			const { member } = await res.json()
			setGroup(prev =>
				prev ? { ...prev, members: [...prev.members, member] } : null
			)
			message.success('A’zo qo‘shildi')
			setSearchUsername('')
			setSearchResults([])
		} catch (err) {
			message.error('Qo‘shishda xatolik')
		} finally {
			setAddingMemberIds(prev => prev.filter(id => id !== userId))
		}
	}

	const isOwner = group?.owner?._id === currentUserId

	if (loading || !group) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4'>
			<Card
				title={<Title level={4}>📝 {group.name} – Itemlar</Title>}
				className='shadow-md min-h-[400px]'
				extra={
					isOwner ? (
						<Button danger onClick={handleDeleteGroup} loading={deletingGroup}>
							🗑 Guruhni o‘chirish
						</Button>
					) : (
						<Button danger onClick={handleLeaveGroup}>
							↩️ Guruhdan chiqish
						</Button>
					)
				}
			>
				<div className='flex gap-2 mb-4'>
					<Input
						placeholder='Yangi item kiriting'
						value={newItem}
						onChange={e => setNewItem(e.target.value)}
						onPressEnter={handleAddItem}
					/>
					<Button type='primary' onClick={handleAddItem} loading={adding}>
						➕ Qo‘shish
					</Button>
				</div>
				<List
					dataSource={group.items}
					renderItem={item => {
						const isToggling = togglingIds.includes(item._id)
						const isDeleting = deletingItemIds.includes(item._id)
						return (
							<List.Item
								actions={[
									<Button
										size='small'
										loading={isToggling}
										onClick={() => handleToggleBought(item._id, item.isBought)}
									>
										{item.isBought ? '❌ Bekor qilish' : '✅ Sotib olindi'}
									</Button>,
									<Button
										danger
										size='small'
										loading={isDeleting}
										onClick={() => handleDeleteItem(item._id)}
									>
										O‘chirish
									</Button>,
								]}
							>
								<div className='flex justify-between w-full'>
									<span>{item.title}</span>
									{item.isBought && <Tag color='green'>Sotib olingan</Tag>}
								</div>
							</List.Item>
						)
					}}
					locale={{ emptyText: 'Itemlar topilmadi' }}
				/>
			</Card>

			<Card
				title={<Title level={4}>👥 A’zolar</Title>}
				className='shadow-md min-h-[400px]'
			>
				{isOwner && (
					<div className='mb-4'>
						<Input.Search
							placeholder='Foydalanuvchini ismi bilan qidiring'
							enterButton='Qidirish'
							value={searchUsername}
							onChange={e => setSearchUsername(e.target.value)}
							onSearch={handleSearchUser}
							loading={searchLoading}
						/>
						<List
							dataSource={searchResults}
							renderItem={user => (
								<List.Item
									actions={[
										<Button
											type='primary'
											loading={addingMemberIds.includes(user._id)}
											onClick={() => handleAddMember(user._id)}
										>
											➕ Qo‘shish
										</Button>,
									]}
								>
									{user.username} ({user.name})
								</List.Item>
							)}
							locale={{ emptyText: 'Natijalar yo‘q' }}
						/>
					</div>
				)}

				<Divider />

				{group.members?.length > 0 ? (
					group.members.map(member => (
						<div
							key={member._id}
							className='flex justify-between items-center mb-2'
						>
							<Tag color='blue' className='text-base'>
								👤 {member.username} ({member.status})
							</Tag>
							{member._id !== currentUserId && (
								<Button
									danger
									size='small'
									loading={removingMemberIds.includes(member._id)}
									onClick={() => handleRemoveMember(member._id)}
								>
									O‘chirish
								</Button>
							)}
						</div>
					))
				) : (
					<div className='flex justify-center items-center h-full'>
						<Text type='secondary'>A’zolar topilmadi</Text>
					</div>
				)}
			</Card>
		</div>
	)
}

export default GroupDetail
