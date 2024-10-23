import React, { useEffect, useState } from 'react';
const serverURL = 'http://localhost:3000'
const ClientList = () => {
    const [clients, setClients] = useState([]);

    // 初始化：获取 clients 列表
    const fetchClients = async () => {
        try {
            const response = await fetch(`${serverURL}/api/clients`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json(); // 解析为 JSON
            console.log('Initial clients fetched:', data);
            setClients(data); // 设置初始数据
        } catch (error) {
            console.error('Error fetching initial clients:', error);
        }
    };


    // SSE 连接
    useEffect(() => {

        fetchClients()
        const eventSource = new EventSource(serverURL+'/api/client-status-stream');

        eventSource.onmessage = (event) => {
            const updatedClients = JSON.parse(event.data); // 确保解析为数组
            console.log('trigger updated clients here')
            console.dir(updatedClients); // 检查数据结构是否正确

            setClients((prev) => {
                const mergedClients = [...prev];

                // 遍历每个 updatedClient，进行更新或添加
                updatedClients.forEach((newClient) => {
                    const index = mergedClients.findIndex(
                        (client) => client.id === newClient.id
                    );

                    if (index !== -1) {
                        // 如果找到相同 id，更新对应的 client
                        mergedClients[index] = newClient;
                    } else {
                        // 如果没有找到，添加新的 client
                        mergedClients.push(newClient);
                    }
                });

                return mergedClients;
            });
        };

        eventSource.onerror = () => {
            console.error('SSE connection error. Retrying...');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    console.dir(clients)
    return (
        <div>
            <h1>Client List</h1>
            <ul>
                {clients.map((client) => (
                    <li key={client.id}>
                        {client.title} - {client.status} (Used by: {client.usedBy || 'N/A'})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClientList;