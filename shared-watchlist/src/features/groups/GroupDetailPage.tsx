import { useEffect, useState } from 'react'
import useAuth from '../auth/useAuth'
import { getGroupMembers, removeGroupMember, updateMemberRole } from './GroupService'

interface GroupMember {
  user_id: string
  user?: { id: string; firebase_uid: string; email: string; created_at: string }
  role: 'admin' | 'member'
  joined_at?: string
}

export default function GroupDetailPage({ groupId, onBack }: { groupId: string; onBack: () => void }) {
  const { user } = useAuth()
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = () => {
    setLoading(true)
    setError(null)
    getGroupMembers(groupId)
      .then((m) => setMembers(m.map((member) => ({
        ...member,
        role: member.role as 'admin' | 'member',
      }))))
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let isMounted = true
    getGroupMembers(groupId)
      .then((m) => {
        if (isMounted) {
          setMembers(m.map((member) => ({
            ...member,
            role: member.role as 'admin' | 'member',
          })))
          setLoading(false)
          setError(null)
        }
      })
      .catch((e) => {
        if (isMounted) {
          setError(e.message || String(e))
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [groupId])

  const currentMember = members.find((m) => m.user?.firebase_uid === user?.uid)
  const isAdmin = currentMember?.role === 'admin'

  const handleRemove = async (memberUserId: string) => {
    if (!isAdmin) return setError('Only admins can remove members')
    if (!confirm('Remove this member from the group?')) return
    try {
      await removeGroupMember(groupId, memberUserId)
      fetchMembers()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleToggleRole = async (memberUserId: string, currentRole: string) => {
    if (!isAdmin) return setError('Only admins can change roles')
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    if (!confirm(`Change role to ${newRole}?`)) return
    try {
      await updateMemberRole(groupId, memberUserId, newRole as 'member' | 'admin')
      fetchMembers()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h3>Members</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {members.map((m) => (
            <li key={m.user_id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <strong>{m.user?.email ?? m.user_id}</strong>
                  <div style={{ fontSize: 12 }}>Role: {m.role}</div>
                  <div style={{ fontSize: 12 }}>Joined: {m.joined_at ?? 'unknown'}</div>
                </div>
                {isAdmin && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button onClick={() => handleToggleRole(m.user_id, m.role)}>
                      {m.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button onClick={() => handleRemove(m.user_id)} disabled={m.user_id === currentMember?.user_id}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
          {members.length === 0 && <li>No members yet</li>}
        </ul>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  )
}
