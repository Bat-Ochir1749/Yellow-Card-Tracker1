import { useState, useEffect } from 'react'
import GradeSelector from './components/GradeSelector'
import StudentList from './components/StudentList'
import AddStudent from './components/AddStudent'
import Settings from './components/Settings'

const API_URL = '/api';

function App() {
  const [grade, setGrade] = useState(6)
  const [students, setStudents] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchStudents();
  }, [grade])

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/students?grade=${grade}`)
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const addStudent = async (name) => {
    try {
      const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, grade })
      })
      const newStudent = await res.json()
      setStudents([...students, newStudent].sort((a,b) => a.fullName.localeCompare(b.fullName)))
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  const updateStudent = async (id, action, reason = null, customReason = null) => {
    try {
      const res = await fetch(`${API_URL}/students/${id}/yellow-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason, customReason })
      })
      const updated = await res.json()
      setStudents(students.map(s => s.id === id ? updated : s))
    } catch (error) {
      console.error('Error updating student:', error)
    }
  }

  const resetStudent = async (id) => {
    try {
      const res = await fetch(`${API_URL}/students/${id}/reset`, {
        method: 'POST'
      })
      const updated = await res.json()
      setStudents(students.map(s => s.id === id ? updated : s))
    } catch (error) {
      console.error('Error resetting student:', error)
    }
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE'
      })
      setStudents(students.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Yellow Card Tracker
            </h2>
          </div>
          <div className="flex md:ml-4">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {showSettings ? 'Hide Settings' : 'Manage Emails'}
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <label htmlFor="grade" className="block text-sm font-medium leading-6 text-gray-900 whitespace-nowrap">Select Grade:</label>
              <GradeSelector selected={grade} onChange={setGrade} />
           </div>
        </div>

        {showSettings && (
          <Settings grade={grade} />
        )}

        <div className="mt-6 sm:mt-8">
          <StudentList 
            students={students} 
            onUpdate={updateStudent} 
            onReset={resetStudent} 
            onDelete={deleteStudent}
          />
        </div>

        <div className="mt-6 sm:mt-8 bg-white shadow sm:rounded-lg p-4 sm:p-6">
           <h3 className="text-base font-semibold leading-6 text-gray-900">Add New Student</h3>
           <AddStudent grade={grade} onAdd={addStudent} />
        </div>
      </div>
    </div>
  )
}

export default App
