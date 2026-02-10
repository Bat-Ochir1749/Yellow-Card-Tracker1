import { useState, Fragment } from 'react';

function YCModal({ isOpen, onClose, onConfirm, studentName }) {
    const [reason, setReason] = useState('Uniform');
    const [customReason, setCustomReason] = useState('');
    
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(reason, customReason);
        // Reset
        setReason('Uniform');
        setCustomReason('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-500 bg-opacity-75 p-4 sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                            Issue Yellow Card
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Select a reason for issuing a yellow card to <strong>{studentName}</strong>.
                            </p>
                            
                            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="reason" className="block text-sm font-medium leading-6 text-gray-900">Reason</label>
                                    <select
                                        id="reason"
                                        name="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="Uniform">Uniform</option>
                                        <option value="EOZ">EOZ</option>
                                        <option value="Loitering">Loitering</option>
                                        <option value="Gadget">Gadget</option>
                                        <option value="Behavior">Behavior</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="customReason" className="block text-sm font-medium leading-6 text-gray-900">Specify Reason / Details</label>
                                    <input
                                        type="text"
                                        name="customReason"
                                        id="customReason"
                                        required
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="Enter details (e.g., No Tie, Talking, etc.)"
                                    />
                                </div>

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HistoryModal({ isOpen, onClose, studentName, logs }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-500 bg-opacity-75 p-4 sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            History: {studentName}
                        </h3>
                        <div className="mt-4 max-h-60 overflow-y-auto">
                            {logs.length === 0 ? (
                                <p className="text-sm text-gray-500">No logs found.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {logs.map((log) => (
                                        <li key={log.id} className="text-sm border-b pb-2 last:border-0">
                                            <div className="font-medium text-gray-900">{new Date(log.createdAt).toLocaleString()}</div>
                                            <div className="text-gray-500">{log.description}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StudentList({ students, onUpdate, onReset, onDelete, isViewOnly }) {
  const [loading, setLoading] = useState(null);
  const [ycModalOpen, setYcModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);

  const openYCModal = (student) => {
      setSelectedStudent(student);
      setYcModalOpen(true);
  };

  const closeYCModal = () => {
      setYcModalOpen(false);
      setSelectedStudent(null);
  };

  const openHistoryModal = async (student) => {
      setSelectedStudent(student);
      setHistoryModalOpen(true);
      setStudentLogs([]); // Clear previous
      try {
          const res = await fetch(`/api/students/${student.id}/logs`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setStudentLogs(data);
          } else {
            console.error("Invalid logs data:", data);
            setStudentLogs([]);
          }
      } catch (error) {
          console.error("Failed to fetch logs", error);
          setStudentLogs([]);
      }
  };

  const closeHistoryModal = () => {
      setHistoryModalOpen(false);
      setSelectedStudent(null);
  };

  const confirmYC = async (reason, customReason) => {
      if (!selectedStudent) return;
      const id = selectedStudent.id;
      setLoading(id);
      closeYCModal(); // Close first or after? Close first for UX responsiveness
      try {
          await onUpdate(id, 'add', reason, customReason);
      } finally {
          setLoading(null);
      }
  };

  const handleAction = async (id, action) => {
      // Direct action for remove, but 'add' goes through modal now
      if (action === 'add') {
          // This path shouldn't be called directly for 'add' anymore, 
          // but if it is, we redirect or error. 
          // Actually, we replaced the onClick.
          return; 
      }
      setLoading(id);
      try {
        await onUpdate(id, action);
      } finally {
        setLoading(null);
      }
  };

  const handleReset = async (id) => {
    if (!confirm('Are you sure you want to reset this student?')) return;
    setLoading(id);
    try {
      await onReset(id);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id) => {
      setLoading(id);
      try {
          await onDelete(id);
      } finally {
          setLoading(null);
      }
  }

  return (
    <div>
      <YCModal 
        isOpen={ycModalOpen} 
        onClose={closeYCModal} 
        onConfirm={confirmYC} 
        studentName={selectedStudent?.fullName} 
      />

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={closeHistoryModal}
        studentName={selectedStudent?.fullName}
        logs={studentLogs}
      />

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {students.map((student) => (
          <div key={student.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{student.fullName}</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                student.yellowCards === 0 ? 'bg-green-100 text-green-800' : 
                student.yellowCards === 1 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {student.yellowCards} YC
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">Demerits</span>
                <span className="text-base font-medium text-gray-900">{student.demerits}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 items-center">
                <button
                  onClick={() => openHistoryModal(student)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-900"
                >
                  History
                </button>
               {!isViewOnly && (
                 <>
                   <button
                      onClick={() => handleDelete(student.id)}
                      disabled={loading === student.id}
                      className="mr-auto text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-50 uppercase tracking-wider"
                    >
                      Delete
                    </button>

                   <button
                      onClick={() => handleReset(student.id)}
                      disabled={loading === student.id}
                      className="text-sm font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleAction(student.id, 'remove')}
                      disabled={loading === student.id || student.yellowCards === 0}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      -1 YC
                    </button>
                    <button
                      onClick={() => openYCModal(student)}
                      disabled={loading === student.id}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    >
                      +1 YC
                    </button>
                 </>
               )}
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            No students found. Add one below.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Yellow Cards</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Demerits</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{student.fullName}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    student.yellowCards === 0 ? 'bg-green-100 text-green-800' : 
                    student.yellowCards === 1 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.yellowCards}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.demerits}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                  {!isViewOnly && (
                    <>
                      <button
                        onClick={() => openYCModal(student)}
                        disabled={loading === student.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        +1 YC
                      </button>
                      <button
                        onClick={() => handleAction(student.id, 'remove')}
                        disabled={loading === student.id || student.yellowCards === 0}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        -1 YC
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleReset(student.id)}
                        disabled={loading === student.id}
                        className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                      >
                        Reset
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openHistoryModal(student)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    History
                  </button>
                  {!isViewOnly && (
                    <>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(student.id)}
                        disabled={loading === student.id}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50 pl-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
               <tr>
                  <td colSpan="4" className="py-4 text-center text-sm text-gray-500">No students found. Add one below.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
