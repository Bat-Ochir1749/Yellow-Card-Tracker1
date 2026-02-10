import { useState, useEffect } from 'react'
import Login from './components/Login'
import GradeSelector from './components/GradeSelector'
import StudentList from './components/StudentList'
import AddStudent from './components/AddStudent'
import Settings from './components/Settings'

const API_URL = '/api';

function App() {
  const [grade, setGrade] = useState(6)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
    fetchStudents();
  }, [grade])

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    setIsAuthenticated(false)
  }

  const [isDemoMode, setIsDemoMode] = useState(false)

  const fetchStudents = async () => {
    try {
      // 1. Try to load from LocalStorage first (for persistence in Demo Mode)
      const localKey = `students_grade_${grade}`;
      const savedData = localStorage.getItem(localKey);
      
      const res = await fetch(`${API_URL}/students?grade=${grade}`)
      
      // Check if backend is in Mock Mode
      const isMock = res.headers.get('X-Data-Source') === 'Memory-Mock';
      setIsDemoMode(isMock);

      if (isMock && savedData) {
         // If we are in demo mode and have saved data, use the saved data
         console.log('Using LocalStorage data for Demo Mode persistence');
         setStudents(JSON.parse(savedData));
      } else {
         // Otherwise use API data (Real DB or first-time Mock)
         const data = await res.json()
         setStudents(data)
         // Save to local just in case we switch to demo mode later
         if (isMock) {
            localStorage.setItem(localKey, JSON.stringify(data));
         }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      // Fallback to local storage if API fails
      const savedData = localStorage.getItem(`students_grade_${grade}`);
      if (savedData) setStudents(JSON.parse(savedData));
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
      setStudents([...students, newStudent].sort((a, b) => a.fullName.localeCompare(b.fullName)))
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
      
      // Handle email notification result
      if (updated.emailResult) {
        if (updated.emailResult.success) {
           if (updated.emailResult.previewUrl) {
             console.log('Email Preview:', updated.emailResult.previewUrl);
             window.open(updated.emailResult.previewUrl, '_blank');
           } else {
             console.log('Demerit issued! Email notification sent successfully.');
           }
        } else {
           console.error('Email failed:', updated.emailResult.message);
           alert(`Demerit issued, BUT email failed to send.\nReason: ${updated.emailResult.message}`);
        }
      }

      setStudents(students.map(s => s.id === id ? updated : s))
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student');
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
    if (!window.confirm('Are you sure you want to delete this student?')) return
    try {
      await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' })
      setStudents(students.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
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
          <div className="flex md:ml-4 gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Log Out
            </button>
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

        {isDemoMode && (
          <div className="rounded-md bg-yellow-50 p-4 mt-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Demo Mode Active</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The application is running in Mock Mode (No Database). Data will not persist across restarts and will NOT sync across devices.
                    To enable sync and permanent storage, please connect a PostgreSQL database.
                    <br/>
                    <strong>Note:</strong> Default emails have been pre-loaded for testing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
