import { useState, useEffect } from 'react';

export default function Settings({ grade }) {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = '/api';

  useEffect(() => {
    fetchEmails();
  }, [grade]);

  const fetchEmails = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/${grade}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmails(data);
      } else {
        console.error('Failed to fetch emails:', data);
        setEmails([]);
      }
    } catch (error) {
      console.error('Failed to fetch emails', error);
      setEmails([]);
    }
  };

  const addEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/${grade}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmails(data);
        setNewEmail('');
      } else {
        console.error('Error adding email:', data);
        alert('Failed to add email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to add email', error);
      alert('Failed to add email');
    } finally {
      setLoading(false);
    }
  };

  const removeEmail = async (email) => {
    if (!confirm(`Remove ${email}?`)) return;
    try {
      const res = await fetch(`${API_URL}/settings/${grade}/emails`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmails(data);
      } else {
        console.error('Error removing email:', data);
        alert('Failed to remove email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to remove email', error);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 mt-8">
      <h3 className="text-base font-semibold leading-6 text-gray-900">Email Notifications - Grade {grade}</h3>
      <div className="mt-2 max-w-xl text-sm text-gray-500">
        <p>Recipients will be notified when a student in Grade {grade} receives a demerit.</p>
      </div>
      
      <div className="mt-5">
        <form onSubmit={addEmail} className="flex flex-col sm:flex-row gap-2">
           <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Add
          </button>
        </form>

        <ul role="list" className="mt-4 divide-y divide-gray-100 rounded-md border border-gray-200">
          {emails.map((email) => (
            <li key={email} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm leading-6">
              <div className="flex w-0 flex-1 items-center">
                <span className="truncate font-medium">{email}</span>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button 
                  onClick={() => removeEmail(email)}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
          {emails.length === 0 && (
             <li className="py-2 pl-3 pr-4 text-sm text-gray-500">No recipients added yet.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
