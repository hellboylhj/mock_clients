import React, { useState } from 'react';

const ClientsForm = () => {
    const [clientId, setClientId] = useState('');
    const [action, setAction] = useState('start');
    const [usedBy, setUsedBy] = useState('');
    const [status, setStatus] = useState('running')
    const serverURL = 'http://localhost:3000'

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url =
                action === 'start' ? serverURL+'/api/client/start' : serverURL+'/api/client/update';
            console.log(
                'usedBy' + usedBy
            )
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: clientId, usedBy, status }),
            });

            if (!response.ok) {
                throw new Error('Failed to perform action on client');
            }
            alert(`Client ${clientId} ${action}ed successfully.`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Client ID:
                <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                />
            </label>
            <label>
                Used By:
                <input
                    type="text"
                    value={usedBy}
                    onChange={(e) => setUsedBy(e.target.value)}
                />
            </label>
            <label>
                Status:
                <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                />
            </label>
            <button type="submit">{action === 'start' ? 'Start' : 'Update'} Client</button>
            <button type="button" onClick={() => setAction(action === 'start' ? 'update' : 'start')}>
                Switch to {action === 'start' ? 'Update' : 'Start'} Mode
            </button>
        </form>
    );
};

export default ClientsForm;